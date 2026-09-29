package com.shield.parentalguard.network

import android.content.Context
import com.shield.parentalguard.security.SecurityKeyStoreManager

/**
 * Reads the device token PairingActivity stored (encrypted via
 * SecurityKeyStoreManager) after a successful device_pair. Anything that
 * needs to call an authenticated ota-ona-bot endpoint — today just
 * TelemetrySyncWorker's report_location — goes through here instead of
 * touching SharedPreferences directly, so there is one place that knows
 * how the token is encrypted.
 */
object DeviceCredentials {

    private const val PREFS = "shield_guard_prefs"

    /**
     * PairingActivity'dagi savePairing() bilan bir xil: farzand tokenini
     * shifrlab saqlaydi va is_paired=true qiladi — shu bayroqqa qarab
     * PairingActivity keyingi ochilishda joylashuv/foydalanish ruxsatlarini
     * so'raydigan ekranni ko'rsatadi. Ikki chaqiruvchi (PairingActivity ham,
     * LoginActivity'dagi bitta kod maydoni ham) endi shu bitta joyga tayanadi.
     */
    fun saveDeviceToken(context: Context, deviceToken: String, familyCode: String, childId: String) {
        val (encToken, iv) = SecurityKeyStoreManager.encryptData(deviceToken)
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .putString("device_token_enc", encToken)
            .putString("device_token_iv", iv)
            .putString("family_code", familyCode)
            .putString("child_id", childId)
            .putBoolean("is_paired", true)
            .apply()
    }

    /**
     * Farzand "ulanishni to'xtatish" tugmasini bosgach (leave_family) server
     * tokenni o'chiradi va keyingi har bir so'rovga 401 qaytaradi. Shu holda
     * telefonda ham hech narsa qolmasligi kerak — aks holda doimiy
     * bildirishnoma va fon xizmati ishlab turaveradi, ya'ni bolaga berilgan
     * "istagan paytda uzilishing mumkin" va'dasi faqat serverda bajarilib,
     * telefonda bajarilmay qolardi.
     */
    fun clearDeviceToken(context: Context) {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
            .remove("device_token_enc")
            .remove("device_token_iv")
            .remove("child_id")
            .remove("last_usage_sync_at")
            .putBoolean("is_paired", false)
            .apply()
    }

    fun readDeviceToken(context: Context): String? {
        val prefs = context.getSharedPreferences("shield_guard_prefs", Context.MODE_PRIVATE)
        val enc = prefs.getString("device_token_enc", null) ?: return null
        val iv = prefs.getString("device_token_iv", null) ?: return null
        return try {
            SecurityKeyStoreManager.decryptData(enc, iv)
        } catch (_: Exception) {
            null
        }
    }
}
