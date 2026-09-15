package com.shield.parentalguard.services

import android.accessibilityservice.AccessibilityService
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.shield.parentalguard.network.CurfewPolicyStore

/**
 * Komendant soat ijrosi uchun engil Accessibility xizmati.
 *
 * DIZAYN QARORLARI (ikkalasi ham Google Play tekshiruvida so'raladi):
 *
 * 1. Ekran KONTENTI o'qilmaydi. canRetrieveWindowContent="false" va bu yerda
 *    faqat event.packageName — ya'ni "qaysi ilova ochildi" — ishlatiladi.
 *    Matn, parol, yozishmalar hech qachon ko'rilmaydi va yuborilmaydi.
 *
 * 2. Hech qanday tarmoq so'rovi yo'q. Ilgari har bir ilova almashganda
 *    serverga so'rov ketardi — kuniga yuzlab marta, ya'ni bolaning butun
 *    ilova ishlatish tarixi tarmoqqa oqardi. Endi qoida 15 daqiqada bir
 *    marta olinib keshlanadi va qaror QURILMADA qabul qilinadi.
 */
class CompliantAccessibilityService : AccessibilityService() {

    private var lastCheckedPackage: String? = null

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        if (event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return

        val packageName = event.packageName?.toString() ?: return
        if (packageName == lastCheckedPackage) return
        lastCheckedPackage = packageName
        if (packageName == this.packageName) return // o'z ilovamizga tegmaymiz

        try {
            if (CurfewPolicyStore.shouldBlock(applicationContext, packageName)) {
                performGlobalAction(GLOBAL_ACTION_HOME)
            }
        } catch (e: Exception) {
            Log.w("CurfewGuard", "Komendant tekshiruvi bajarilmadi: ${e.message}")
        }
    }

    override fun onInterrupt() {
        Log.w("CurfewGuard", "Xizmat vaqtincha to'xtatildi.")
    }
}
