import java.util.Properties
import java.io.FileInputStream

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

// Release imzolash kaliti — HECH QACHON git'ga qo'shilmaydigan
// android/keystore.properties fayldan o'qiladi (bu fayl yaratilishi kerak,
// qarang: android/keystore.properties.example). Fayl topilmasa release
// build debug kalit bilan yig'iladi va Play Console bunday AAB'ni RAD ETADI —
// bu ataylab shunday, tasodifan debug-imzolangan build chiqarib
// yubormaslik uchun.
val keystorePropertiesFile = rootProject.file("keystore.properties")
val keystoreProperties = Properties()
val hasReleaseKeystore = keystorePropertiesFile.exists()
if (hasReleaseKeystore) {
    keystoreProperties.load(FileInputStream(keystorePropertiesFile))
}

// Push (Firebase): android/app/google-services.json dan kerakli 4 qiymat
// BuildConfig'ga o'tadi (google-services plaginisiz). Fayl yo'q bo'lsa — bo'sh,
// ilova push'siz ishlayveradi. Bu qiymatlar sir emas (Firebase shunday
// ta'kidlaydi), shuning uchun fayl repoda turadi.
fun firebaseFor(pkg: String): Map<String, String> {
    val f = file("google-services.json")
    if (!f.exists()) return emptyMap()
    val j = groovy.json.JsonSlurper().parse(f) as Map<*, *>
    val info = j["project_info"] as Map<*, *>
    val client = (j["client"] as List<*>).map { it as Map<*, *> }.firstOrNull {
        val ci = it["client_info"] as Map<*, *>
        (ci["android_client_info"] as Map<*, *>)["package_name"] == pkg
    } ?: return emptyMap()
    return mapOf(
        "FCM_APP_ID" to (client["client_info"] as Map<*, *>)["mobilesdk_app_id"].toString(),
        "FCM_API_KEY" to ((client["api_key"] as List<*>)[0] as Map<*, *>)["current_key"].toString(),
        "FCM_PROJECT_ID" to info["project_id"].toString(),
        "FCM_SENDER_ID" to info["project_number"].toString(),
    )
}

fun com.android.build.api.dsl.ApplicationBuildType.firebaseFields(pkg: String) {
    val m = firebaseFor(pkg)
    for (k in listOf("FCM_APP_ID", "FCM_API_KEY", "FCM_PROJECT_ID", "FCM_SENDER_ID")) {
        buildConfigField("String", k, "\"" + (m[k] ?: "") + "\"")
    }
}

android {
    namespace = "com.shield.parentalguard"
    // Google Play 2026-yil 31-avgustdan yangi ilovalardan API 36 (Android 16)
    // ni talab qiladi. Bundan pasti bilan AAB faylni yuklab ham bo'lmaydi.
    compileSdk = 36

    defaultConfig {
        applicationId = "com.shield.parentalguard"
        minSdk = 26
        targetSdk = 36
        versionCode = 2
        versionName = "1.0.1"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        // AGP "debug" nomli signingConfig'ni o'zi ham avtomatik yaratadi,
        // lekin agar ~/.android/debug.keystore mavjud bo'lmasa (har bir CI
        // ishga tushishi — tozalangan, yangi mashina), UNI TASODIFIY YANGI
        // KALIT bilan yaratib oladi. Natijada har safar boshqacha imzo bilan
        // yig'ilgan APK chiqadi va telefonda eskisi USTIDAN yangilanmaydi —
        // avval albatta o'chirish kerak bo'ladi (aks holda "signatures do
        // not match" xatosi bilan o'rnatilmaydi). "debug" konfiguratsiyasini
        // shu yerda repo'dagi DOIMIY kalitga qayta yo'naltiramiz, shunda u
        // avtomatik yaratilishning o'rnini bosadi va CI har doim bir xil
        // imzo chiqaradi — parollar standart ("android"), chunki bu kalit
        // sir emas, faqat yig'ish barqarorligi uchun.
        getByName("debug") {
            storeFile = rootProject.file("qalqon-debug.keystore")
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
        if (hasReleaseKeystore) {
            create("release") {
                // rootProject.file() — chunki keystore.properties ham,
                // .jks fayl ham android/ papkada turadi. Oddiy file()
                // ishlatilsa, yo'l android/app/ ga nisbatan hisoblanib,
                // "keystore topilmadi" xatosi chiqadi.
                storeFile = rootProject.file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                // Yuklash kaliti PKCS12 (.p12) formatida (qalqon-maxfiy, 2026-10-19).
                keystoreProperties["storeType"]?.let { storeType = it as String }
            }
        }
    }

    buildTypes {
        release {
            firebaseFields("com.shield.parentalguard")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // hasReleaseKeystore=false bo'lsa ataylab debug kalitda qoladi —
            // shunda ham APK yig'iladi (lokal test uchun), lekin Play Store'ga
            // yaroqsiz bo'lib qoladi (shu haqda ogohlantirish chiqadi).
            signingConfig = if (hasReleaseKeystore) {
                signingConfigs.getByName("release")
            } else {
                logger.warn(
                    "OGOHLANTIRISH: android/keystore.properties topilmadi — " +
                        "release build hali ham DEBUG kalit bilan imzolanmoqda. " +
                        "Play Store'ga yuklashdan oldin android/keystore.properties.example'ga qarang."
                )
                signingConfigs.getByName("debug")
            }
        }
        debug {
            isMinifyEnabled = false
            applicationIdSuffix = ".debug"
            firebaseFields("com.shield.parentalguard.debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
        buildConfig = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")

    // WorkManager (Background Resilient Tasks)
    implementation("androidx.work:work-runtime-ktx:2.9.0")

    // Security & EncryptedSharedPreferences (Hardware Keystore)
    implementation("androidx.security:security-crypto:1.1.0-alpha06")

    // Google bilan kirish (Credential Manager). Server: google_login.
    implementation("androidx.credentials:credentials:1.3.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")

    // Network & OkHttp (TLS 1.3 & Certificate Pinning)
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("androidx.lifecycle:lifecycle-service:2.8.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.1")

    // Location Services (Google Play Services / Android Location)
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // Push xabarlari (push/QalqonPush.kt)
    implementation(platform("com.google.firebase:firebase-bom:33.5.1"))
    implementation("com.google.firebase:firebase-messaging")
}
