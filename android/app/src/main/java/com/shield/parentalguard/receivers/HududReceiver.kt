package com.shield.parentalguard.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent
import com.shield.parentalguard.location.HududKuzatuvi
import com.shield.parentalguard.workers.TelemetrySyncWorker

/**
 * Telefon hududga kirdi yoki chiqdi (HududKuzatuvi yozgan hududlar).
 *
 * Bu yerda tarmoqqa chiqmaymiz — qabul qiluvchiga atigi bir necha soniya
 * beriladi. Hodisa WorkManager navbatiga qo'yiladi va o'sha joylashuv
 * bilan darhol serverga ketadi; internet bo'lmasa, paydo bo'lganda.
 */
class HududReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val hodisa = GeofencingEvent.fromIntent(intent) ?: return
        if (hodisa.hasError()) {
            // Ko'pincha GEOFENCE_NOT_AVAILABLE: "Joylashuv" o'chirilgan va
            // tizim hududlarni o'chirib yuborgan. Keyingi hisobotda qayta yoziladi.
            HududKuzatuvi.unut(context)
            return
        }
        val tur = when (hodisa.geofenceTransition) {
            Geofence.GEOFENCE_TRANSITION_ENTER -> "enter"
            Geofence.GEOFENCE_TRANSITION_EXIT -> "exit"
            else -> return
        }
        val nomlar = hodisa.triggeringGeofences?.map { it.requestId }.orEmpty()
        if (nomlar.isEmpty()) return
        TelemetrySyncWorker.tezYubor(context, hodisa.triggeringLocation, tur, nomlar)
    }
}
