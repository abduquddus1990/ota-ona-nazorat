package com.shield.parentalguard.network

import android.os.Build
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * Child device pairing — same Supabase edge function the Mini App uses
 * (supabase/functions/ota-ona-bot: device_pair).
 *
 * The family code (6 digits, formula-derived from the parent's Telegram id)
 * is never a secret and is no longer accepted as a credential here — see
 * database/07_device_tokens.sql. The parent generates a short-lived one-time
 * pairCode from the Mini App (create_device_pair_code); this device redeems
 * it once for a long-lived deviceToken that authenticates every later call.
 */
object PairingApi {

    const val OTA_ONA_BOT_URL =
        "https://wfrclcwjeeqeqchmdhzw.supabase.co/functions/v1/ota-ona-bot"

    val deviceModel: String
        get() = Build.MODEL?.takeIf { it.isNotBlank() } ?: "android"

    data class DevicePairResult(
        val deviceToken: String,
        val childId: String,
        val familyCode: String
    )

    /**
     * Redeem a one-time [pairCode] (from the parent's Mini App) for a
     * long-lived device token. This is the one unauthenticated call in the
     * whole API — the device has no credential yet — so the code is short,
     * single-use and rate-limited server-side.
     */
    fun pairDevice(pairCode: String): Result<DevicePairResult> {
        val code = pairCode.trim().uppercase()
        if (code.length != 8) {
            return Result.failure(IllegalArgumentException("invalid_code"))
        }

        val jsonMedia = "application/json; charset=utf-8".toMediaType()
        val body = JSONObject()
            .put("type", "device_pair")
            .put("pairCode", code)
            .put("deviceModel", deviceModel)
            .toString()
            .toRequestBody(jsonMedia)

        val req = Request.Builder()
            .url(OTA_ONA_BOT_URL)
            .post(body)
            .header("Content-Type", "application/json")
            .build()

        EncryptedNetworkClient.client.newCall(req).execute().use { resp ->
            val text = resp.body?.string().orEmpty()
            val json = try {
                JSONObject(text)
            } catch (e: Exception) {
                return Result.failure(IllegalStateException("pair_bad_response"))
            }

            if (!resp.isSuccessful || !json.optBoolean("ok", false)) {
                return Result.failure(
                    IllegalStateException(json.optString("error", "pair_http_${resp.code}"))
                )
            }

            return Result.success(
                DevicePairResult(
                    deviceToken = json.getString("deviceToken"),
                    childId = json.getString("childId"),
                    familyCode = json.getString("familyCode")
                )
            )
        }
    }
}
