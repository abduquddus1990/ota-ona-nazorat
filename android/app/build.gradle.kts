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

android {
    namespace = "com.shield.parentalguard"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.shield.parentalguard"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
            }
        }
    }

    buildTypes {
        release {
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

    // Network & OkHttp (TLS 1.3 & Certificate Pinning)
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    // Coroutines & Lifecycle
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    implementation("androidx.lifecycle:lifecycle-service:2.8.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.1")

    // Location Services (Google Play Services / Android Location)
    implementation("com.google.android.gms:play-services-location:21.3.0")

    // WebRTC (P2P E2EE Calls)
    implementation("io.getstream:stream-webrtc-android:1.1.1")
}
