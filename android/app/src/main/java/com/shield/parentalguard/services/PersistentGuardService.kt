package com.shield.parentalguard.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.shield.parentalguard.ParentalGuardApp

/**
 * Shaffof va O'ldirilmas Foreground Servis.
 * Android OS'ning fon resurslarini tozalash mexanizmlariga bardosh beradi.
 */
class PersistentGuardService : Service() {

    companion object {
        private const val CHANNEL_ID = "PARENTAL_GUARD_PERSISTENT_CHANNEL"
        private const val NOTIFICATION_ID = 9001
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Bu xizmat ikkita halokat orasida turadi:
        //  1) "location" turidagi FGS joylashuv ruxsatisiz ishga tushirilsa,
        //     tizim SecurityException bilan ilovani yiqitadi;
        //  2) startForegroundService() chaqirilgandan keyin ~5 soniya ichida
        //     startForeground() chaqirilmasa — ForegroundServiceDidNotStartInTime
        //     bilan yiqitadi.
        // Ilgari (1) dan qochish uchun ruxsat yo'qligida shunchaki stopSelf()
        // qilinardi va bu to'g'ridan-to'g'ri (2) ga olib kelardi: juftlashgan,
        // lekin hali ruxsat bermagan farzand telefonida ilova HAR ochilganda
        // yiqilardi. Shuning uchun startForeground() DOIM chaqiriladi, lekin
        // try/catch ichida — rad etilsa, yiqilish o'rniga jimgina to'xtaymiz.
        //
        // Chaqiruvchilar (ParentalGuardApp.startMonitoring, BootCompletedReceiver)
        // endi ruxsatsiz bu xizmatni umuman ishga tushirmaydi; bu yer — oxirgi
        // himoya qatlami.
        val notification = buildNotification()
        val started = try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(
                    NOTIFICATION_ID,
                    notification,
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
                )
            } else {
                startForeground(NOTIFICATION_ID, notification)
            }
            true
        } catch (_: Exception) {
            // Ruxsat yo'q (SecurityException) yoki tizim boshqa sababga ko'ra
            // rad etdi — jimgina to'xtaymiz, ilovani yiqitmaymiz.
            false
        }

        if (!started || !ParentalGuardApp.hasLocationPermission(this)) {
            stopSelf()
            return START_NOT_STICKY
        }

        // START_STICKY: Tizim xotira yetishmovchiligida o'ldirsa ham, xotira bo'shaganda qayta ishga tushiradi
        return START_STICKY
    }

    /**
     * Android 15+ da tizim foreground xizmatga vaqt chegarasi qo'yishi mumkin.
     * Chaqirilganda ilovaning to'xtashiga bir necha soniya vaqti bor — aks
     * holda tizim RemoteServiceException bilan ilovani YIQITADI. Shuning
     * uchun bu yerda qarshilik ko'rsatmay, xizmatni to'xtatamiz: joylashuv
     * yig'ilishi baribir WorkManager orqali davom etadi (u vaqt chegarasiga
     * tushmaydi va qurilma qayta yonganda ham tiklanadi).
     */
    override fun onTimeout(startId: Int) {
        stopSelf()
    }

    override fun onTimeout(startId: Int, fgsType: Int) {
        stopSelf()
    }

    private fun buildNotification(): Notification {
        // Bildirishnoma matni ATAYLAB ochiq: Google Play'ning stalkerware
        // siyosati kuzatilayotgan odam buni bilishini talab qiladi, va bu
        // mahsulotimizning o'z tamoyili ham — yashirin kuzatuv emas.
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Qalqon AI — ota-ona nazorati yoqilgan")
            .setContentText("Joylashuv va ekran vaqti ota-onangga ko'rinadi. Bu xabar ataylab o'chmaydi.")
            .setSmallIcon(com.shield.parentalguard.R.drawable.ic_notification)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Farzand Xavfsizlik Qalqoni",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Xavfsizlik monitoringi holatini ko'rsatuvchi doimiy kanal"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
