package com.shield.parentalguard.network

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

/**
 * Komendant soat qoidasi: serverdan olinadi, qurilmada saqlanadi.
 *
 * NEGA KESH: ilgari Accessibility xizmati HAR BIR ilova almashganda serverga
 * so'rov yuborardi — kuniga yuzlab so'rov. Bu uch tomondan yomon edi:
 * batareyani yeydi, tarmoqsiz umuman ishlamaydi, va "bola qaysi ilovani
 * ochgani" har safar tarmoqqa chiqadi — holbuki qaror uchun buning keragi
 * yo'q. Endi qoida 15 daqiqada bir marta olinadi va tekshiruv QURILMANING
 * O'ZIDA, tarmoqsiz bajariladi.
 *
 * Qoida serverda saqlanadi (qurilmada emas), shuning uchun bola uni o'z
 * telefonidan o'zgartirib, cheklovdan qutulib qola olmaydi.
 */
object CurfewPolicyStore {

    private const val PREFS = "shield_guard_prefs"
    private const val KEY_ENABLED = "curfew_enabled"
    private const val KEY_START = "curfew_start"
    private const val KEY_END = "curfew_end"
    private const val KEY_BLOCKED = "curfew_blocked_apps"
    private const val KEY_ALLOWED = "curfew_allowed_apps"
    private const val KEY_UPDATED = "curfew_updated_at"

    fun save(context: Context, policy: JSONObject?) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
        if (policy == null) {
            prefs.putBoolean(KEY_ENABLED, false).apply()
            return
        }
        prefs
            .putBoolean(KEY_ENABLED, policy.optBoolean("enabled", false))
            .putString(KEY_START, policy.optString("start_time", "22:00"))
            .putString(KEY_END, policy.optString("end_time", "06:30"))
            .putString(KEY_BLOCKED, policy.optJSONArray("blocked_apps")?.toString() ?: "[]")
            .putString(KEY_ALLOWED, policy.optJSONArray("allowed_apps")?.toString() ?: "[]")
            .putLong(KEY_UPDATED, System.currentTimeMillis())
            .apply()
    }

    /**
     * Shu ilova ayni damda bloklanishi kerakmi.
     * Tarmoq talab qilinmaydi — javob to'liq qurilmada hisoblanadi.
     */
    fun shouldBlock(context: Context, packageName: String): Boolean {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        if (!prefs.getBoolean(KEY_ENABLED, false)) return false
        if (!isWithinCurfew(prefs.getString(KEY_START, "22:00")!!, prefs.getString(KEY_END, "06:30")!!)) {
            return false
        }

        // Ruxsat etilganlar ro'yxati bo'lsa — faqat ulardan boshqasi bloklanadi
        // (masalan qo'ng'iroq va soat ishlashi kerak).
        val allowed = toSet(prefs.getString(KEY_ALLOWED, "[]"))
        if (allowed.isNotEmpty()) return !allowed.contains(packageName)

        val blocked = toSet(prefs.getString(KEY_BLOCKED, "[]"))
        // Ro'yxat bo'sh bo'lsa hech narsa bloklanmaydi — "hammasini bloklash"
        // ataylab qilinmaydi: bola tez yordam chaqira olmay qolishi mumkin.
        return blocked.contains(packageName)
    }

    private fun toSet(json: String?): Set<String> {
        return try {
            val arr = JSONArray(json ?: "[]")
            (0 until arr.length()).map { arr.optString(it) }.filter { it.isNotBlank() }.toSet()
        } catch (e: Exception) {
            emptySet()
        }
    }

    /** "22:00"–"06:30" kabi yarim tunni kesib o'tadigan oraliqni ham to'g'ri hisoblaydi. */
    private fun isWithinCurfew(start: String, end: String): Boolean {
        val now = Calendar.getInstance()
        val nowMin = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
        val s = toMinutes(start) ?: return false
        val e = toMinutes(end) ?: return false
        return if (s <= e) nowMin in s..e else (nowMin >= s || nowMin <= e)
    }

    private fun toMinutes(hhmm: String): Int? {
        val parts = hhmm.split(":")
        if (parts.size != 2) return null
        val h = parts[0].toIntOrNull() ?: return null
        val m = parts[1].toIntOrNull() ?: return null
        if (h !in 0..23 || m !in 0..59) return null
        return h * 60 + m
    }
}
