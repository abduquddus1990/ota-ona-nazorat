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
