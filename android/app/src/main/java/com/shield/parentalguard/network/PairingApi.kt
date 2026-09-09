package com.shield.parentalguard.network

import android.os.Build
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * Child pairing bind — same Supabase edge function the Mini App uses
 * (telegram_miniapp/app.js → ota-ona-bot child_paired_event / child_consent).
 * No tokens hardcoded; public edge URL only.
 */
object PairingApi {

    // Production Mini App endpoint (Render tutor API has no /pair route)
    const val OTA_ONA_BOT_URL =
        "https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot"

    const val TELEGRAM_BOT_USERNAME = "qalqon_aibot"

    fun telegramPairDeepLink(familyCode: String): String {
        val digits = familyCode.filter { it.isDigit() }
        return "https://t.me/$TELEGRAM_BOT_USERNAME?start=pair_$digits"
    }

    /**
     * Notify backend that a child device paired with [familyCode].
     * Returns true on HTTP 2xx for at least the primary event.
     */
    fun bindChildDevice(familyCode: String, deviceLabel: String): Result<Unit> {
        val digits = familyCode.filter { it.isDigit() }
        if (digits.length != 6) {
            return Result.failure(IllegalArgumentException("invalid_code"))
        }

        val jsonMedia = "application/json; charset=utf-8".toMediaType()
        val timestamp = java.time.Instant.now().toString()

        val pairedBody = JSONObject()
            .put("type", "child_paired_event")
            .put("familyCode", digits)
            .put("childName", deviceLabel)
            .put("source", "android_parental_guard")
            .put("deviceModel", Build.MODEL ?: "android")
            .put("timestamp", timestamp)
            .toString()
            .toRequestBody(jsonMedia)

        val pairedReq = Request.Builder()
            .url(OTA_ONA_BOT_URL)
            .post(pairedBody)
            .header("Content-Type", "application/json")
            .build()

        EncryptedNetworkClient.client.newCall(pairedReq).execute().use { resp ->
            if (!resp.isSuccessful) {
                return Result.failure(
                    IllegalStateException("pair_http_${resp.code}")
                )
            }
        }

        // Best-effort consent mirror (Mini App also fires this; ignore soft failure)
        try {
            val consentBody = JSONObject()
                .put("type", "child_consent")
                .put("familyCode", digits)
                .put("childName", deviceLabel)
                .put("source", "android_parental_guard")
                .put("telegramId", JSONObject.NULL)
                .put("username", JSONObject.NULL)
                .toString()
                .toRequestBody(jsonMedia)

            val consentReq = Request.Builder()
                .url(OTA_ONA_BOT_URL)
                .post(consentBody)
                .header("Content-Type", "application/json")
                .build()

            EncryptedNetworkClient.client.newCall(consentReq).execute().use { /* ignore body */ }
        } catch (_: Exception) {
            // Primary bind already succeeded
        }

        return Result.success(Unit)
    }
}
