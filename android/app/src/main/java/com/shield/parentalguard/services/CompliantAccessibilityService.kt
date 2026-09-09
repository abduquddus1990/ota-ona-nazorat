package com.shield.parentalguard.services

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.shield.parentalguard.network.EncryptedNetworkClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

/**
 * Komendant soati ijrosi uchun engil Accessibility xizmati.
 *
 * MUHIM DIZAYN QARORI: bu xizmat ekrandagi matn yoki tugma kontentini
 * o'qimaydi va hech qayerga yubormaydi — faqat FOREGROUND ILOVA
 * ALMASHGANINI (paket nomi) kuzatadi. Google Play'ning Accessibility API
 * siyosati matn/kontent yig'ishni (klaviatura loglash bilan bir xil
 * toifada ko'rilishi mumkin) juda tor holatlardagina ruxsat etadi;
 * "qaysi ilova ochiq" darajasidagi kuzatuv esa e'lon qilingan ota-ona
 * nazorati maqsadiga to'g'ridan-to'g'ri mos va ancha kam xavfli.
 */
class CompliantAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var lastCheckedPackage: String? = null

    companion object {
        private const val ENFORCE_URL = "https://qalqon-backend.onrender.com/api/v1/curfew/enforce"
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return
        if (packageName == lastCheckedPackage) return
        lastCheckedPackage = packageName
        if (packageName == this.packageName) return // o'z ilovamizni e'tiborsiz qoldiramiz

        serviceScope.launch { checkCurfewAndEnforce(packageName) }
    }

    private fun checkCurfewAndEnforce(foregroundPackage: String) {
        val prefs = getSharedPreferences("shield_guard_prefs", Context.MODE_PRIVATE)
        val familyCode = prefs.getString("family_code", null)
        val childId = prefs.getString("child_id", null)
        if (familyCode.isNullOrEmpty() || childId.isNullOrEmpty()) return

        try {
            val body = JSONObject().apply {
                put("family_code", familyCode)
                put("child_id", childId)
                put("foreground_package", foregroundPackage)
            }.toString().toRequestBody("application/json; charset=utf-8".toMediaType())

            val request = Request.Builder()
                .url(ENFORCE_URL)
                .addHeader("X-Family-Code", familyCode)
                .addHeader("X-Child-Id", childId)
                .post(body)
                .build()

            EncryptedNetworkClient.client.newCall(request).execute().use { resp ->
                if (!resp.isSuccessful) return
                val json = JSONObject(resp.body?.string() ?: return)
                if (json.optBoolean("block", false)) {
                    performGlobalAction(GLOBAL_ACTION_HOME)
                }
            }
        } catch (e: Exception) {
            Log.w("CurfewGuard", "Enforce so'rovi muvaffaqiyatsiz: ${e.message}")
        }
    }

    override fun onInterrupt() {
        Log.w("CurfewGuard", "Xizmat vaqtincha to'xtatildi.")
    }
}
