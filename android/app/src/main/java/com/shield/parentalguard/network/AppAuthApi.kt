package com.shield.parentalguard.network

import android.content.Context
import android.os.Build
import com.shield.parentalguard.security.SecurityKeyStoreManager
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * Ota-ona ilovaga qanday kiradi.
 *
 * Telegram username bilan kirish YO'Q: username — oddiy matn, uni istalgan
 * odam yozadi. Ikki yo'l bor va ikkalasi ham isbot talab qiladi:
 *
 *  1) Telegram tugmasi — ilova bir martalik so'rov ochadi va botni ochadi,
 *     ota-ona botda "Ha, bu men" ni bosadi, ilova seansni o'zi olib ketadi
 *     (server: app_login_start / app_login_poll).
 *  2) Login va parol — Telegramsiz ham ishlaydi (server: web_login).
 *
 * Farzand esa ota-ona bergan bir martalik kod bilan kiradi (PairingActivity).
 *
 * Seans tokeni — parolga teng narsa, shuning uchun u qurilmada Keystore
 * orqali shifrlangan holda saqlanadi.
 */
object AppAuthApi {

    private val jsonMedia = "application/json; charset=utf-8".toMediaType()

    data class LoginRequest(val token: String, val link: String)
    data class Session(val sessionToken: String, val familyCode: String)

    private fun post(body: JSONObject): JSONObject {
        val req = Request.Builder()
            .url(PairingApi.OTA_ONA_BOT_URL)
            .post(body.toString().toRequestBody(jsonMedia))
            .build()
        EncryptedNetworkClient.client.newCall(req).execute().use { res ->
            val text = res.body?.string().orEmpty()
            return if (text.isBlank()) JSONObject() else JSONObject(text)
        }
    }

    /** Telegram orqali kirish so'rovini ochadi. Javobda bot havolasi keladi. */
    fun startTelegramLogin(): Result<LoginRequest> = runCatching {
        val label = listOfNotNull(Build.MANUFACTURER, Build.MODEL)
            .joinToString(" ").trim().ifBlank { "Android" }
        val j = post(JSONObject().put("type", "app_login_start").put("deviceLabel", label))
        if (!j.optBoolean("ok")) error(j.optString("error", "start_failed"))
        LoginRequest(j.getString("token"), j.getString("link"))
    }

    /**
     * Holatni so'raydi: pending | approved | rejected | expired | used.
     * approved bo'lsa seans FAQAT BIR MARTA qaytadi — shuning uchun uni
     * darhol saqlaymiz.
     */
    fun pollTelegramLogin(token: String): Result<Pair<String, Session?>> = runCatching {
        val j = post(JSONObject().put("type", "app_login_poll").put("token", token))
        val status = j.optString("status", "pending")
        val session = if (status == "approved" && j.optString("sessionToken").isNotBlank()) {
            Session(j.getString("sessionToken"), j.optString("familyCode"))
        } else null
        status to session
    }

    /** Login va parol bilan kirish (Telegramsiz). */
    fun loginWithPassword(login: String, password: String): Result<Session> = runCatching {
        val j = post(
            JSONObject()
                .put("type", "web_login")
                .put("username", login.trim().removePrefix("@"))
                .put("password", password)
        )
        if (!j.optBoolean("ok")) error(j.optString("error", "login_failed"))
        Session(j.getString("sessionToken"), j.optString("familyCode"))
    }

    /**
     * ENG SODDA kirish: ota-ona botda "📲 Android ilova kodi" tugmasini
     * bosadi, chiqqan 8 xonali kodni shu yerga kiritadi — device_pair bilan
     * bir xil naqsh (parent_pair_codes), faqat qurilma tokeni o'rniga
     * brauzer seansi qaytadi.
     */
    fun loginWithCode(code: String): Result<Session> = runCatching {
        val j = post(JSONObject().put("type", "parent_pair").put("code", code.trim().uppercase()))
        if (!j.optBoolean("ok")) error(j.optString("error", "code_failed"))
        Session(j.getString("sessionToken"), j.optString("familyCode"))
    }

    /* ------------------------------------------------------------ saqlash */

    private const val PREFS = "shield_guard_prefs"

    fun saveSession(context: Context, session: Session) {
        val (enc, iv) = SecurityKeyStoreManager.encryptData(session.sessionToken)
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString("session_token_enc", enc)
            .putString("session_token_iv", iv)
            .putString("family_code", session.familyCode)
            .putString("app_role", "parent")
            .apply()
    }

    fun readSession(context: Context): String? {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val enc = prefs.getString("session_token_enc", null) ?: return null
        val iv = prefs.getString("session_token_iv", null) ?: return null
        return try {
            SecurityKeyStoreManager.decryptData(enc, iv)
        } catch (_: Exception) {
            null
        }
    }

    fun clearSession(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .remove("session_token_enc").remove("session_token_iv").remove("app_role").apply()
    }

    /** parent — seans bor, child — qurilma tokeni bor, null — hali kirilmagan. */
    fun currentRole(context: Context): String? = when {
        readSession(context) != null -> "parent"
        DeviceCredentials.readDeviceToken(context) != null -> "child"
        else -> null
    }
}
