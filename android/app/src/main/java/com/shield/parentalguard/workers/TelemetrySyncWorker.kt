package com.shield.parentalguard.workers

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.location.Location
import android.location.LocationManager
import android.os.BatteryManager
import android.os.Build
import android.os.Process
import androidx.core.content.ContextCompat
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.shield.parentalguard.ParentalGuardApp
import com.shield.parentalguard.network.DeviceCredentials
import com.shield.parentalguard.network.EncryptedNetworkClient
import com.shield.parentalguard.network.PairingApi
import com.shield.parentalguard.security.SecurityKeyStoreManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * Fon Telemetriya Sinxronizatori (WorkManager, har 15 daqiqada).
 * Haqiqiy batareya, foreground ilova/ekran vaqti (UsageStatsManager) va
 * so'nggi ma'lum joylashuvni (LocationManager, mobil-internet/GPS) o'qiydi,
 * xom ma'lumotni Keystore orqali shifrlaydi va supabase/functions/ota-ona-bot
 * ga (report_telemetry / report_location) deviceToken bilan yuboradi.
 *
 * Ilgari bu Render'dagi backend/routes/telemetry.py'ga X-Family-Code +
 * X-Child-Id header orqali yuborilardi. O'sha auth (require_family_access)
 * o'zining kod izohida "oila kodi nisbatan zaif maxfiy kalit" deb yozgan —
 * ikkalasi ham formula bilan hisoblanadi, sir emas. Shu bilan bir qatorda
 * o'sha yozuv radar o'qiydigan location_pings jadvaliga umuman tushmasdi.
 * Endi ikkalasi ham deviceToken bilan — device_pair paytida berilgan,
 * server tomonda hash'i saqlanadigan haqiqiy hisob ma'lumoti — yuboriladi.
 */
class TelemetrySyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val prefs = applicationContext.getSharedPreferences("shield_guard_prefs", Context.MODE_PRIVATE)
        val familyCode = prefs.getString("family_code", null)
        val childId = prefs.getString("child_id", null)
        val token = DeviceCredentials.readDeviceToken(applicationContext)
        if (familyCode.isNullOrEmpty() || childId.isNullOrEmpty() || token == null) {
            // Hali juftlashmagan (yoki token yo'q) — yuboradigan hech narsa yo'q.
            return@withContext Result.success()
        }

        try {
            val battery = readBatteryLevel()
            val location = readLastKnownLocation()

            // O'lchov oynasi — oxirgi muvaffaqiyatli yuborishdan hozirgacha.
            // Shunday qilinganining sababi: WorkManager 15 daqiqani KAFOLATLAMAYDI
            // (batareya tejash, Doze — soatlab kechiktirishi mumkin). Doim
            // "oxirgi 15 daqiqa" o'lchansa, kechikkan sikllarda oradagi vaqt
            // butunlay yo'qolardi. Oyna 2 soat bilan cheklangan: telefon uzoq
            // o'chiq turganidan keyin bir sikl butun kunni yig'ib yubormasin.
            val now = System.currentTimeMillis()
            val lastSync = prefs.getLong("last_usage_sync_at", 0L)
            val windowStart = when {
                lastSync <= 0L -> now - 15 * 60 * 1000L
                now - lastSync > 2 * 3600 * 1000L -> now - 2 * 3600 * 1000L
                else -> lastSync
            }
            val apps = readAppUsage(windowStart, now)

            if (location != null) {
                reportLocationToRadar(location, token)
            }

            val rawTelemetry = JSONObject().apply {
                put("timestamp", now)
                put("battery_level", battery)
                put("active_app", apps.firstOrNull()?.packageName ?: "unknown")
                put("screen_time_seconds", apps.firstOrNull()?.foregroundSeconds ?: 0)
            }.toString()

            // Hardware Keystore orqali AES-256-GCM shifrlash (xom ma'lumot
            // to'liq holida hech qachon tarmoqqa chiqmaydi)
            val (encryptedPayload, iv) = SecurityKeyStoreManager.encryptData(rawTelemetry)

            val appsArray = org.json.JSONArray()
            for (a in apps) {
                appsArray.put(
                    JSONObject()
                        .put("package", a.packageName)
                        .put("seconds", a.foregroundSeconds)
                )
            }

            val postPayload = JSONObject().apply {
                put("type", "report_telemetry")
                put("deviceToken", token)
                // Eski maydonlar ham qoldi: server yangilanmagan bo'lsa ham
                // hech bo'lmasa eng ko'p ishlatilgan ilova yozilaveradi.
                put("appPackageName", apps.firstOrNull()?.packageName ?: "unknown")
                put("category", "General")
                put("screenTimeSeconds", apps.firstOrNull()?.foregroundSeconds ?: 0)
                put("apps", appsArray)
                put("windowSeconds", ((now - windowStart) / 1000).toInt())
                put("encryptedPayload", encryptedPayload)
                put("iv", iv)
            }

            val requestBody = postPayload.toString()
                .toRequestBody("application/json; charset=utf-8".toMediaType())

            val request = Request.Builder()
                .url(PairingApi.OTA_ONA_BOT_URL)
                .post(requestBody)
                .header("Content-Type", "application/json")
                .build()

            val response = EncryptedNetworkClient.client.newCall(request).execute()
            response.use {
                when {
                    it.isSuccessful -> {
                        // Faqat yuborish muvaffaqiyatli bo'lgandagina oynani
                        // surib qo'yamiz — aks holda qayta urinishda o'sha vaqt
                        // ikkinchi marta yozilib, jami bo'rttirilardi.
                        prefs.edit().putLong("last_usage_sync_at", now).apply()
                        Result.success()
                    }
                    // 401/403 — token endi hech qanday oilaga tegishli emas:
                    // farzand "ulanishni to'xtatish" tugmasini bosgan yoki
                    // ota-ona hisobni o'chirgan. Qayta urinishning ma'nosi yo'q,
                    // aksincha telefonda hamma narsani to'xtatish kerak.
                    it.code == 401 || it.code == 403 -> {
                        DeviceCredentials.clearDeviceToken(applicationContext)
                        ParentalGuardApp.stopMonitoring(applicationContext)
                        Result.success()
                    }
                    else -> Result.retry()
                }
            }
        } catch (e: Exception) {
            Result.retry()
        }
    }

    /**
     * report_location so'rovi actor.kind === "device" talab qiladi (index.ts),
     * ya'ni deviceToken shart — doWork() buni allaqachon tekshirgan.
     */
    private fun reportLocationToRadar(location: Location, token: String) {
        try {
            val body = JSONObject().apply {
                put("type", "report_location")
                put("deviceToken", token)
                put("lat", location.latitude)
                put("lng", location.longitude)
                if (location.hasAccuracy()) put("accuracyM", location.accuracy)
            }.toString().toRequestBody("application/json; charset=utf-8".toMediaType())

            val request = Request.Builder()
                .url(PairingApi.OTA_ONA_BOT_URL)
                .post(body)
                .header("Content-Type", "application/json")
                .build()

            EncryptedNetworkClient.client.newCall(request).execute().use { /* best-effort */ }
        } catch (_: Exception) {
            // Radar so'rovi muvaffaqiyatsiz bo'lsa ham asosiy telemetriya davom etadi.
        }
    }

    private fun readBatteryLevel(): Int {
        val bm = applicationContext.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
        return bm?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY) ?: -1
    }

    data class ForegroundUsage(val packageName: String, val foregroundSeconds: Int)

    /**
     * Oynadagi HAR BIR ilova bo'yicha oldingi planda o'tgan aniq vaqt.
     *
     * Ilgari bu yerda queryUsageStats() ishlatilib, faqat ENG KO'P
     * ishlatilgan BITTA ilova yuborilardi — qolganlari butunlay yo'qolardi
     * (bola 10 daqiqa YouTube, 5 daqiqa Instagram ishlatsa, Instagram
     * hisobotga umuman tushmasdi). Bundan tashqari queryUsageStats
     * oynaning emas, o'sha davrdagi BUTUN paqirning yig'indisini qaytaradi,
     * ya'ni kun davomida ko'p ishlatilgan ilova har siklda to'liq 15 daqiqa
     * deb yozilib, jami bo'rttirib ko'rsatilardi.
     *
     * queryEvents() esa aynan shu oynadagi RESUMED/PAUSED hodisalarini
     * beradi — ulardan har bir ilova uchun haqiqiy davomiylik hisoblanadi.
     */
    private fun readAppUsage(startMs: Long, endMs: Long): List<ForegroundUsage> {
        if (!hasUsageStatsPermission()) return emptyList()
        val usm = applicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return emptyList()

        val events = usm.queryEvents(startMs, endMs) ?: return emptyList()
        val totals = HashMap<String, Long>()
        val openedAt = HashMap<String, Long>()
        val event = UsageEvents.Event()

        while (events.hasNextEvent()) {
            events.getNextEvent(event)
            val pkg = event.packageName ?: continue
            when (event.eventType) {
                UsageEvents.Event.ACTIVITY_RESUMED -> openedAt[pkg] = event.timeStamp
                UsageEvents.Event.ACTIVITY_PAUSED, UsageEvents.Event.ACTIVITY_STOPPED -> {
                    val from = openedAt.remove(pkg) ?: startMs
                    val ms = event.timeStamp - from
                    if (ms > 0) totals[pkg] = (totals[pkg] ?: 0L) + ms
                }
            }
        }
        // Oyna tugaganda hali ochiq turgan ilova — oxirigacha sanaladi.
        for ((pkg, from) in openedAt) {
            val ms = endMs - from
            if (ms > 0) totals[pkg] = (totals[pkg] ?: 0L) + ms
        }

        val windowSeconds = ((endMs - startMs) / 1000).toInt().coerceAtLeast(1)
        return totals
            .map { (pkg, ms) -> ForegroundUsage(pkg, (ms / 1000).toInt().coerceAtMost(windowSeconds)) }
            .filter { it.foregroundSeconds > 0 }
            .sortedByDescending { it.foregroundSeconds }
            .take(20)
    }

    private fun hasUsageStatsPermission(): Boolean {
        val appOps = applicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), applicationContext.packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), applicationContext.packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    /** "Lokatsiya v1: so'rov bo'yicha oxirgi mobil-internet joyi" —
     * NETWORK_PROVIDER (mobil internet/wifi asosida) ustuvor, GPS zaxira. */
    private fun readLastKnownLocation(): Location? {
        val hasFine = ContextCompat.checkSelfPermission(
            applicationContext, android.Manifest.permission.ACCESS_FINE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        val hasCoarse = ContextCompat.checkSelfPermission(
            applicationContext, android.Manifest.permission.ACCESS_COARSE_LOCATION
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED
        if (!hasFine && !hasCoarse) return null

        val lm = applicationContext.getSystemService(Context.LOCATION_SERVICE) as? LocationManager
            ?: return null

        val candidates = listOfNotNull(
            runCatching { lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER) }.getOrNull(),
            runCatching { lm.getLastKnownLocation(LocationManager.GPS_PROVIDER) }.getOrNull(),
            runCatching { lm.getLastKnownLocation(LocationManager.PASSIVE_PROVIDER) }.getOrNull()
        )
        return candidates.maxByOrNull { it.time }
    }
}
