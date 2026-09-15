package com.shield.parentalguard.network

import okhttp3.ConnectionSpec
import okhttp3.OkHttpClient
import okhttp3.TlsVersion
import java.util.Collections
import java.util.concurrent.TimeUnit

/**
 * TLS 1.2+ ni majburlovchi tarmoq mijozi (cleartext manifestda taqiqlangan).
 */
object EncryptedNetworkClient {

    // TLS 1.3 va zamonaviy shifrlar to'plami
    private val modernTlsSpec = ConnectionSpec.Builder(ConnectionSpec.MODERN_TLS)
        .tlsVersions(TlsVersion.TLS_1_3, TlsVersion.TLS_1_2)
        .build()

    // Sertifikat qadash (certificate pinning) ATAYLAB qo'yilmagan.
    //
    // Ilgari bu yerda bo'sh CertificatePinner turardi va sinf o'zini
    // "Certificate Pinning qo'llab-quvvatlovchi" deb atardi — ya'ni himoya
    // yo'q edi, faqat himoya KO'RINISHI bor edi. Bo'sh pinner hech nimani
    // tekshirmaydi, lekin kodni o'qigan odam himoyalangan deb o'ylaydi.
    //
    // Supabase sertifikati muntazam yangilanadi; noto'g'ri qadalgan xesh
    // ilovani BUTUNLAY ishlamay qo'yishga olib keladi va buni faqat yangi
    // versiya chiqarib tuzatib bo'ladi. Shu sabab tizim ishonch zanjiri va
    // majburiy TLS 1.2+ bilan cheklanamiz (cleartext manifestda taqiqlangan).
    val client: OkHttpClient = OkHttpClient.Builder()
        .connectionSpecs(Collections.singletonList(modernTlsSpec))
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .writeTimeout(15, TimeUnit.SECONDS)
        .retryOnConnectionFailure(true)
        .build()
}
