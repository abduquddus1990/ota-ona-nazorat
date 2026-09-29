package com.shield.parentalguard

import android.Manifest
import android.app.Application
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.shield.parentalguard.services.PersistentGuardService
import com.shield.parentalguard.workers.TelemetrySyncWorker
import java.util.concurrent.TimeUnit

class ParentalGuardApp : Application() {

    override fun onCreate() {
        super.onCreate()

        // Monitoring FAQAT ota-ona kodi bilan juftlashib, ruxsatlar berilgandan
        // keyin boshlanadi (PairingActivity.startMonitoring()) — ilova
        // ochilgan zahoti emas. Bu yerda faqat qayta ishga tushganda
        // (masalan qurilma reboot'dan keyin) allaqachon faol bo'lgan
        // juftlashuvni davom ettiramiz.
        val prefs = getSharedPreferences("shield_guard_prefs", Context.MODE_PRIVATE)
        if (prefs.getBoolean("is_paired", false)) {
            startMonitoring(this)
        }
    }

    companion object {
        /** Joylashuv ruxsati berilganmi — "location" turidagi FGS uchun SHART. */
        fun hasLocationPermission(context: Context): Boolean =
            ContextCompat.checkSelfPermission(
                context, Manifest.permission.ACCESS_COARSE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(
                    context, Manifest.permission.ACCESS_FINE_LOCATION
                ) == PackageManager.PERMISSION_GRANTED

        /** PairingActivity ham, qayta ishga tushganda ParentalGuardApp ham shu bittasini chaqiradi. */
        fun startMonitoring(context: Context) {
            // Ruxsat yo'q bo'lsa, startForegroundService() ni UMUMAN chaqirmaymiz.
            // Sabab: uni chaqirgach, tizim ~5 soniya ichida xizmatdan
            // startForeground() ni talab qiladi. Xizmat esa ruxsat yo'qligi
            // uchun o'zini to'xtatadi va bu shart bajarilmay qoladi —
            // natijada tizim ilovani ForegroundServiceDidNotStartInTime
            // xatosi bilan YIQITADI. Amalda shunday bo'lgan: farzand
            // juftlashgan (is_paired=true), lekin joylashuvga hali ruxsat
            // bermagan telefonda ilova har ochilganda yiqilardi.
            // Telemetriya (WorkManager) esa ruxsatsiz ham bemalol qoladi.
            if (hasLocationPermission(context)) {
                val serviceIntent = Intent(context, PersistentGuardService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }

            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val syncRequest = PeriodicWorkRequestBuilder<TelemetrySyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                "TelemetrySyncWork",
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
        }

        /**
         * Kuzatuvni butunlay to'xtatadi: xizmat ham, davriy sinxronizatsiya
         * ham. Farzand oiladan chiqqanda (server 401 qaytarganda) chaqiriladi.
         */
        fun stopMonitoring(context: Context) {
            try {
                context.stopService(Intent(context, PersistentGuardService::class.java))
            } catch (_: Exception) {
            }
            WorkManager.getInstance(context).cancelUniqueWork("TelemetrySyncWork")
        }
    }
}
