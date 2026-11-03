package com.shield.parentalguard.location

import android.Manifest
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import com.shield.parentalguard.receivers.HududReceiver
import org.json.JSONArray

/**
 * Telefonning o'z hudud kuzatuvi (Android Geofencing).
 *
 * Ilgari "maktabga yetdi / uydan chiqdi" faqat 15 daqiqalik hisobot bilan
 * aniqlanardi: kirish 0-15, chiqish esa (ikki o'lchov kerak bo'lgani uchun)
 * 15-30 daqiqa kechikardi. Endi hududlar telefonning o'ziga yoziladi va
 * Google Play xizmatlari kirish/chiqishni 1-3 daqiqada aniqlab,
 * HududReceiver'ni uyg'otadi. Batareyaga deyarli ta'sir qilmaydi: tizim
 * buni boshqa ilovalar bilan umumiy joylashuv o'lchovlaridan qiladi.
 *
 * Hududlar ro'yxatini server report_telemetry javobida qaytaradi.
 */
object HududKuzatuvi {
    private const val PREFS = "shield_guard_prefs"
    private const val KALIT = "hudud_royxat_kaliti"

    // Google 100 metrdan kichik hududni ishonchsiz deydi. Server baribir
    // haqiqiy radius bilan tekshiradi — bu faqat telefonni uyg'otish chegarasi.
    private const val ENG_KICHIK_RADIUS = 100f

    private fun pendingIntent(context: Context): PendingIntent {
        val intent = Intent(context, HududReceiver::class.java)
        // Geofencing hodisani intent ichiga yozadi — Android 12+ da MUTABLE shart.
        val flags = PendingIntent.FLAG_UPDATE_CURRENT or
            (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0)
        return PendingIntent.getBroadcast(context, 7301, intent, flags)
    }

    /** Geofencing aniq joylashuv va (Android 10+) fon ruxsatisiz ishlamaydi. */
    private fun ruxsatBor(context: Context): Boolean {
        val aniq = ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        if (!aniq) return false
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return true
        return ContextCompat.checkSelfPermission(
            context, Manifest.permission.ACCESS_BACKGROUND_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Server bergan ro'yxatni telefonga yozadi. Ro'yxat o'zgarmagan bo'lsa
     * hech narsa qilmaydi — lekin telefon qayta yonganda (tizim hududlarni
     * o'chirib yuboradi) yana yoziladi: kalitda yonish soni ham bor.
     */
    fun yangila(context: Context, zones: JSONArray) {
        if (!ruxsatBor(context)) return
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val yonishSoni = Settings.Global.getInt(context.contentResolver, Settings.Global.BOOT_COUNT, 0)
        val kalit = zones.toString() + "#" + yonishSoni
        if (prefs.getString(KALIT, null) == kalit) return

        val hududlar = (0 until zones.length()).mapNotNull { i ->
            val z = zones.optJSONObject(i) ?: return@mapNotNull null
            val nom = z.optString("k")
            val lat = z.optDouble("lat", Double.NaN)
            val lng = z.optDouble("lng", Double.NaN)
            val r = z.optDouble("r", 150.0).toFloat()
            if (nom.isEmpty() || nom.length > 100 || lat.isNaN() || lng.isNaN()) return@mapNotNull null
            Geofence.Builder()
                .setRequestId(nom)
                .setCircularRegion(lat, lng, maxOf(r, ENG_KICHIK_RADIUS))
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(Geofence.GEOFENCE_TRANSITION_ENTER or Geofence.GEOFENCE_TRANSITION_EXIT)
                // Tizim hodisani shuncha vaqt yig'ib turishi mumkin; kichikroq
                // qiymat — tezroq xabar, biroz ko'proq batareya.
                .setNotificationResponsiveness(60_000)
                .build()
        }.take(100)

        val client = LocationServices.getGeofencingClient(context)
        val pi = pendingIntent(context)
        client.removeGeofences(pi).addOnCompleteListener {
            if (hududlar.isEmpty()) {
                prefs.edit().putString(KALIT, kalit).apply()
                return@addOnCompleteListener
            }
            val soRov = GeofencingRequest.Builder()
                // Ro'yxat qayta yozilganda "hozir ichidasan" hodisasi
                // kerak emas — holatni server biladi.
                .setInitialTrigger(0)
                .addGeofences(hududlar)
                .build()
            try {
                client.addGeofences(soRov, pi)
                    .addOnSuccessListener { prefs.edit().putString(KALIT, kalit).apply() }
            } catch (_: SecurityException) {
                // Ruxsat shu orada olib tashlangan — keyingi hisobotda qayta urinamiz.
            }
        }
    }

    /**
     * Tizim hududlarni yo'qotdi (joylashuv o'chirilgan, Play xizmatlari
     * tozalangan) — keyingi hisobotda qayta yozilsin.
     */
    fun unut(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(KALIT).apply()
    }

    /** Farzand oiladan chiqqanda: telefonda hech qanday hudud qolmasin. */
    fun ochir(context: Context) {
        unut(context)
        runCatching { LocationServices.getGeofencingClient(context).removeGeofences(pendingIntent(context)) }
    }
}
