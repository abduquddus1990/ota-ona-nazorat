package com.shield.parentalguard.push

import android.app.PendingIntent
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.shield.parentalguard.R
import com.shield.parentalguard.ui.AppWebActivity

/**
 * Push xabarlarini qabul qiladi.
 *
 * Ilova fonda bo'lsa, tizim xabarni o'zi ko'rsatadi ("qalqon" kanali). Ilova
 * ochiq turganda esa Firebase uni BIZGA beradi va o'zimiz ko'rsatmasak, SOS
 * jimgina yo'qolib ketadi.
 */
class QalqonMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        QalqonPush.sendToken(this, token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val title = message.notification?.title ?: message.data["title"] ?: "Qalqon AI"
        val body = message.notification?.body ?: message.data["body"] ?: return
        QalqonPush.createChannel(this)

        val open = Intent(this, AppWebActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            message.data["open"]?.let { putExtra("open", it) }
        }
        val pi = PendingIntent.getActivity(
            this, 0, open, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val n = NotificationCompat.Builder(this, QalqonPush.CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pi)
            .build()
        try {
            NotificationManagerCompat.from(this).notify((System.currentTimeMillis() % 100000).toInt(), n)
        } catch (_: SecurityException) {
            // Bildirishnomaga ruxsat berilmagan (Android 13+) — ko'rsatib bo'lmaydi.
        }
    }
}
