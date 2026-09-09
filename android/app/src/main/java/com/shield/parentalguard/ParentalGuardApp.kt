package com.shield.parentalguard

import android.app.Application
import android.content.Context
import android.content.Intent
import android.os.Build
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
        /** PairingActivity ham, qayta ishga tushganda ParentalGuardApp ham shu bittasini chaqiradi. */
        fun startMonitoring(context: Context) {
            val serviceIntent = Intent(context, PersistentGuardService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
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
    }
}
