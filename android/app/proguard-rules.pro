# release build shu faylga ishora qiladi (build.gradle.kts: proguardFiles),
# fayl bo'lmasa build "file not found" bilan to'xtaydi.

# OkHttp o'zining qoidalarini kutubxona ichida olib yuradi; quyidagilar
# faqat R8 ogohlantirishlarini jimlashtiradi (bu sinflar ishlatilmaydi).
-dontwarn okhttp3.internal.platform.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# org.json — telemetriya va juftlash so'rovlari shu orqali quriladi.
-keep class org.json.** { *; }

# WorkManager fon vazifalarni sinf NOMI bo'yicha yaratadi. Nomi
# o'zgartirilsa, ish vaqtida "ClassNotFoundException" chiqadi va
# telemetriya jimgina to'xtab qoladi.
-keep class * extends androidx.work.ListenableWorker { *; }

# Foreground xizmat va receiver tizim tomonidan manifestdagi nom bo'yicha
# ishga tushiriladi — ularni ham saqlaymiz.
-keep class * extends android.app.Service { *; }
-keep class * extends android.content.BroadcastReceiver { *; }

# Kotlin coroutines ichki sinflari.
-dontwarn kotlinx.coroutines.**
