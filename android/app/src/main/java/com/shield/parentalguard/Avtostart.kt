package com.shield.parentalguard

import android.app.Activity
import android.app.AlertDialog
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings

/**
 * "Avtozapusk" — Xiaomi, Huawei/Honor, Oppo/Realme, Vivo, Tecno/Infinix.
 *
 * Bu telefonlar batareya sozlamasidan TASHQARI yana bitta o'z ro'yxatini
 * yuritadi: unda yoqilmagan ilova telefon qayta yonganda ham, fonda ham
 * ishga tushmaydi — ota-ona xaritada eski joyni ko'rib turadi. Android'da
 * buni tekshirib bo'lmaydi, shuning uchun sozlamaning o'zini ochib beramiz
 * va qadamni aytamiz. Batafsil: https://qalqonai.uz/fon/
 */
object Avtostart {

    const val YORIQNOMA = "https://qalqonai.uz/fon/"

    private fun brend(): String = (Build.MANUFACTURER ?: "").lowercase()

    /** Marka uchun ma'lum sozlama ekranlari (birinchisi topilgani ochiladi). */
    private fun ekranlar(): List<ComponentName> {
        val b = brend()
        fun c(p: String, a: String) = ComponentName(p, a)
        return when {
            b.contains("xiaomi") || b.contains("redmi") || b.contains("poco") -> listOf(
                c("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"),
            )
            b.contains("huawei") || b.contains("honor") -> listOf(
                c("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"),
                c("com.huawei.systemmanager", "com.huawei.systemmanager.optimize.process.ProtectActivity"),
                c("com.hihonor.systemmanager", "com.hihonor.systemmanager.startupmgr.ui.StartupNormalAppListActivity"),
            )
            b.contains("oppo") || b.contains("realme") || b.contains("oneplus") -> listOf(
                c("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"),
                c("com.coloros.safecenter", "com.coloros.safecenter.startupapp.StartupAppListActivity"),
                c("com.oplus.safecenter", "com.oplus.safecenter.permission.startup.StartupAppListActivity"),
            )
            b.contains("vivo") || b.contains("iqoo") -> listOf(
                c("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"),
                c("com.iqoo.secure", "com.iqoo.secure.ui.phoneoptimize.BgStartUpManager"),
            )
            b.contains("tecno") || b.contains("infinix") || b.contains("itel") -> listOf(
                c("com.transsion.phonemaster", "com.cyin.himgr.autostart.AutoStartActivity"),
            )
            else -> emptyList()
        }
    }

    /**
     * Ekranlarni navbat bilan ochib ko'radi. resolveActivity() ishlatilmaydi:
     * Android 11+ da boshqa paketlar ko'rinmaydi va u doim null qaytarardi,
     * aniq (explicit) startActivity esa ruxsatsiz ishlaydi.
     */
    private fun och(activity: Activity): Boolean {
        for (c in ekranlar()) {
            try {
                activity.startActivity(Intent().setComponent(c))
                return true
            } catch (_: Exception) {
            }
        }
        return false
    }

    /** Shu telefonda alohida avtozapusk ro'yxati bormi. */
    fun kerak(context: Context): Boolean = ekranlar().isNotEmpty()

    fun ochilganmi(context: Context): Boolean =
        context.getSharedPreferences("shield_guard_prefs", Context.MODE_PRIVATE)
            .getBoolean("autostart_opened", false)

    fun korsat(activity: Activity) {
        AlertDialog.Builder(activity)
            .setTitle("Telefon ilovani o'chirib qo'ymasin")
            .setMessage(
                "${Build.MANUFACTURER} telefonlari ilovalarni fonda o'zi to'xtatadi. Shunda ota-onang " +
                    "xaritada eski joyni ko'radi.\n\n" +
                    "Ochiladigan ro'yxatdan \"Qalqon AI\" ni toping va yonidagi tugmani YOQING " +
                    "(Автозапуск / Autostart).\n\nTopolmasangiz — \"Yo'riqnoma\" ni bosing."
            )
            .setPositiveButton("Sozlamani ochish") { _, _ ->
                belgila(activity)
                if (!och(activity)) {
                    try {
                        activity.startActivity(
                            Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + activity.packageName))
                        )
                    } catch (_: Exception) {
                        yoriqnoma(activity)
                    }
                }
            }
            .setNeutralButton("Yo'riqnoma") { _, _ -> belgila(activity); yoriqnoma(activity) }
            .setNegativeButton("Keyinroq", null)
            .show()
    }

    fun belgila(context: Context) {
        context.getSharedPreferences("shield_guard_prefs", Context.MODE_PRIVATE).edit()
            .putBoolean("autostart_opened", true).apply()
    }

    private fun yoriqnoma(activity: Activity) {
        try {
            activity.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(YORIQNOMA)))
        } catch (_: Exception) {
        }
    }
}
