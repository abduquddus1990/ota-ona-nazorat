package com.shield.parentalguard.workers

import android.app.AppOpsManager
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
            val usage = readForegroundUsage()
            val location = readLastKnownLocation()

            if (location != null) {
                reportLocationToRadar(location, token)
            }

            val rawTelemetry = JSONObject().apply {
                put("timestamp", System.currentTimeMillis())
                put("battery_level", battery)
                put("active_app", usage?.packageName ?: "unknown")
                put("screen_time_seconds", usage?.foregroundSeconds ?: 0)
            }.toString()

            // Hardware Keystore orqali AES-256-GCM shifrlash (xom ma'lumot
            // to'liq holida hech qachon tarmoqqa chiqmaydi)
            val (encryptedPayload, iv) = SecurityKeyStoreManager.encryptData(rawTelemetry)

            val postPayload = JSONObject().apply {
                put("type", "report_telemetry")
                put("deviceToken", token)
                put("appPackageName", usage?.packageName ?: "unknown")
                put("category", "General")
                put("screenTimeSeconds", usage?.foregroundSeconds ?: 0)
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
                if (it.isSuccessful) Result.success() else Result.retry()
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

    /** Oxirgi 15 daqiqada eng ko'p vaqt oldingi planda bo'lgan ilova. */
    private fun readForegroundUsage(): ForegroundUsage? {
        if (!hasUsageStatsPermission()) return null
        val usm = applicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager
            ?: return null

        val end = System.currentTimeMillis()
        val start = end - 15 * 60 * 1000L
        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_BEST, start, end) ?: return null
        val top = stats
            .filter { it.lastTimeUsed in start..end && it.totalTimeInForeground > 0 }
            .maxByOrNull { it.totalTimeInForeground }
            ?: return null

        return ForegroundUsage(
            packageName = top.packageName,
            foregroundSeconds = (top.totalTimeInForeground / 1000).toInt().coerceAtMost(15 * 60)
        )
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
