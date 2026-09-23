package com.shield.parentalguard.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import com.shield.parentalguard.services.PersistentGuardService

/**
 * Qurilma o'chib yonganda yoki ilova yangilanganda himoya xizmatini qayta ishga tushirish.
 */
class BootCompletedReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context?, intent: Intent?) {
        if (context == null || intent == null) return

        val action = intent.action
        if (action == Intent.ACTION_BOOT_COMPLETED ||
            action == Intent.ACTION_MY_PACKAGE_REPLACED ||
            action == "android.intent.action.QUICKBOOT_POWERON"
        ) {
            // Hali juftlashmagan (yoki ota-ona sifatida kirgan, farzand
            // sifatida ulanmagan) qurilmada ruxsat ham yo'q — servisni
            // ishga tushirishga urinish shu yerning o'zida to'xtatiladi.
            // Ilgari bu tekshiruv yo'q edi: MY_PACKAGE_REPLACED HAR BIR
            // yangilanishda keladi, ya'ni ilova hali sinovdan o'tayotgan
            // (hech qachon juftlashmagan) qurilmada har safar yangilanish
            // bilan birga darhol yiqilib qolardi.
            val prefs = context.getSharedPreferences("shield_guard_prefs", Context.MODE_PRIVATE)
            if (!prefs.getBoolean("is_paired", false)) return

            val serviceIntent = Intent(context, PersistentGuardService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}
