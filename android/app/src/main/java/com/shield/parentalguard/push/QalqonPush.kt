package com.shield.parentalguard.push

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.messaging.FirebaseMessaging
import com.shield.parentalguard.BuildConfig
import com.shield.parentalguard.network.AppAuthApi
import com.shield.parentalguard.network.DeviceCredentials
import com.shield.parentalguard.network.EncryptedNetworkClient
import com.shield.parentalguard.network.PairingApi
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import kotlin.concurrent.thread

/**
 * Telefonga bildirishnoma (Firebase Cloud Messaging).
 *
 * Bot xabari telefonda Telegram bo'lmasa yetib bormaydi — faqat Google bilan
 * kirgan ota-ona SOS'ni umuman olmasdi. Server (index.ts, sendPush) muhim
 * xabarlarni push orqali ham yuboradi; bu yerda telefon o'z push manzilini
 * serverga aytadi (push_register).
 *
 * Firebase sozlamalari android/app/google-services.json dan yig'ish paytida
 * BuildConfig'ga o'tadi. Fayl yo'q bo'lsa hammasi jim o'chiq turadi.
 */
object QalqonPush {

    /** Server bilan bir xil nom: index.ts → android.notification.channel_id. */
    const val CHANNEL_ID = "qalqon"
    private const val TAG = "QalqonPush"

    fun enabled(): Boolean = BuildConfig.FCM_APP_ID.isNotBlank()

    /** Firebase'ni qo'lda ishga tushiradi (google-services plaginisiz). */
    private fun ensureFirebase(context: Context): Boolean {
        if (!enabled()) return false
        return try {
            if (FirebaseApp.getApps(context).isEmpty()) {
                FirebaseApp.initializeApp(
                    context,
                    FirebaseOptions.Builder()
                        .setApplicationId(BuildConfig.FCM_APP_ID)
                        .setApiKey(BuildConfig.FCM_API_KEY)
                        .setProjectId(BuildConfig.FCM_PROJECT_ID)
                        .setGcmSenderId(BuildConfig.FCM_SENDER_ID)
                        .build()
                )
            }
            true
        } catch (e: Exception) {
            Log.w(TAG, "Firebase ishga tushmadi", e)
            false
        }
    }

    fun createChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (nm.getNotificationChannel(CHANNEL_ID) != null) return
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Oila xabarlari", NotificationManager.IMPORTANCE_HIGH).apply {
                description = "SOS, maktabga yetdi, hududdan chiqdi, oila chati"
            }
        )
    }

    /** Kirgandan keyin va har ilova ochilganda: push manzilini serverga beradi. */
    fun register(context: Context) {
        val app = context.applicationContext
        if (!ensureFirebase(app)) return
        createChannel(app)
        try {
            FirebaseMessaging.getInstance().token
                .addOnSuccessListener { token -> sendToken(app, token) }
                .addOnFailureListener { e -> Log.w(TAG, "push tokeni olinmadi", e) }
        } catch (e: Exception) {
            Log.w(TAG, "push register", e)
        }
    }

    /** Tokenni server push_register'ga yuboradi (tarmoq — alohida oqimda). */
    fun sendToken(context: Context, token: String) {
        val app = context.applicationContext
        thread(name = "push-register") {
            try {
                val body = JSONObject().put("type", "push_register")
                    .put("token", token).put("platform", "android")
                val session = AppAuthApi.readSession(app)
                val device = DeviceCredentials.readDeviceToken(app)
                when {
                    session != null -> body.put("sessionToken", session)
                    device != null -> body.put("deviceToken", device)
                    else -> return@thread // hali kirilmagan — keyin register() qayta chaqiriladi
                }
                val req = Request.Builder()
                    .url(PairingApi.OTA_ONA_BOT_URL)
                    .post(body.toString().toRequestBody("application/json; charset=utf-8".toMediaType()))
                    .build()
                EncryptedNetworkClient.client.newCall(req).execute().use { res ->
                    if (!res.isSuccessful) Log.w(TAG, "push_register: HTTP ${res.code}")
                }
            } catch (e: Exception) {
                Log.w(TAG, "push_register yuborilmadi", e)
            }
        }
    }
}
