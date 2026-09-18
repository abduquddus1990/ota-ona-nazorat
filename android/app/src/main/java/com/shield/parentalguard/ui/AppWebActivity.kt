package com.shield.parentalguard.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.shield.parentalguard.R
import com.shield.parentalguard.network.AppAuthApi
import com.shield.parentalguard.network.DeviceCredentials

/**
 * Ilovaning asosiy ekrani.
 *
 * Ichkarida Mini App bilan BIR XIL interfeys ishlaydi, ustiga ilovaning o'z
 * imkoniyatlari qo'shiladi (fon rejimidagi joylashuv, ekran vaqti, keyin
 * push). Shu tufayli yangi funksiya bir marta yoziladi va ikkala joyda ham
 * paydo bo'ladi — aks holda har bir bo'limni Kotlin'da qaytadan yozishga
 * to'g'ri kelardi.
 *
 * Hisob ma'lumoti sahifaga URL orqali berilmaydi (u tarixda va loglarda
 * qolib ketardi): sahifa uni QalqonNative orqali so'raydi.
 */
class AppWebActivity : AppCompatActivity() {

    private lateinit var web: WebView
    private var filePicker: ValueCallback<Array<Uri>>? = null

    private val pickFiles = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val data = result.data
        val uris = when {
            data?.clipData != null -> (0 until data.clipData!!.itemCount).map { data.clipData!!.getItemAt(it).uri }.toTypedArray()
            data?.data != null -> arrayOf(data.data!!)
            else -> null
        }
        filePicker?.onReceiveValue(uris)
        filePicker = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val role = AppAuthApi.currentRole(this)
        if (role == null) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }
        setContentView(R.layout.activity_app_web)
        web = findViewById(R.id.webView)

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            // Mini App'ning o'zi mobil o'lchamga moslangan.
            useWideViewPort = true
            loadWithOverviewMode = true
            textZoom = 100
        }
        web.addJavascriptInterface(Bridge(), "QalqonNative")

        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url ?: return false
                // Telegram havolalari (do'stni chaqirish, o'yin taklifi) va
                // tashqi sahifalar brauzerda/Telegramda ochilsin.
                val host = url.host.orEmpty()
                return if (host.contains("github.io")) {
                    false
                } else {
                    try { startActivity(Intent(Intent.ACTION_VIEW, url)) } catch (_: Exception) {}
                    true
                }
            }
        }

        // Suratlar: chatdagi va uy vazifasidagi rasm tanlash ishlashi uchun.
        // Shu bilan birga alert/confirm/prompt oynalari: ularsiz WebView
        // savollarni jimgina "yo'q" deb yopadi va "sotib olasanmi?", "fanni
        // yoz" kabi oqimlar umuman ishlamay qolardi.
        web.webChromeClient = object : WebChromeClient() {

            override fun onJsAlert(view: WebView?, url: String?, message: String?, result: android.webkit.JsResult?): Boolean {
                androidx.appcompat.app.AlertDialog.Builder(this@AppWebActivity)
                    .setMessage(message.orEmpty())
                    .setCancelable(false)
                    .setPositiveButton(android.R.string.ok) { _, _ -> result?.confirm() }
                    .setOnDismissListener { result?.confirm() }
                    .show()
                return true
            }

            override fun onJsConfirm(view: WebView?, url: String?, message: String?, result: android.webkit.JsResult?): Boolean {
                androidx.appcompat.app.AlertDialog.Builder(this@AppWebActivity)
                    .setMessage(message.orEmpty())
                    .setCancelable(false)
                    .setPositiveButton(android.R.string.ok) { _, _ -> result?.confirm() }
                    .setNegativeButton(android.R.string.cancel) { _, _ -> result?.cancel() }
                    .show()
                return true
            }

            override fun onJsPrompt(
                view: WebView?, url: String?, message: String?, defaultValue: String?,
                result: android.webkit.JsPromptResult?,
            ): Boolean {
                val input = android.widget.EditText(this@AppWebActivity).apply {
                    setText(defaultValue.orEmpty())
                    setPadding(48, 32, 48, 32)
                }
                androidx.appcompat.app.AlertDialog.Builder(this@AppWebActivity)
                    .setMessage(message.orEmpty())
                    .setView(input)
                    .setCancelable(false)
                    .setPositiveButton(android.R.string.ok) { _, _ -> result?.confirm(input.text.toString()) }
                    .setNegativeButton(android.R.string.cancel) { _, _ -> result?.cancel() }
                    .show()
                return true
            }
            override fun onShowFileChooser(
                view: WebView?,
                callback: ValueCallback<Array<Uri>>?,
                params: FileChooserParams?,
            ): Boolean {
                filePicker?.onReceiveValue(null)
                filePicker = callback
                return try {
                    pickFiles.launch(params?.createIntent())
                    true
                } catch (_: Exception) {
                    filePicker = null
                    false
                }
            }
        }

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (web.canGoBack()) web.goBack() else finish()
            }
        })

        val roleParam = if (role == "child") "&role=child" else ""
        web.loadUrl("https://abduquddus1990.github.io/ota-ona-nazorat/?app=1&lang=uz$roleParam")
    }

    /**
     * Sahifa ilova bilan shu orqali gaplashadi. Faqat kerakli narsa ochiladi:
     * hisob ma'lumoti, rol va ilova versiyasi.
     */
    inner class Bridge {

        @JavascriptInterface
        fun role(): String = AppAuthApi.currentRole(this@AppWebActivity) ?: ""

        /** Ota-ona seansi (web_sessions). Farzandda bo'sh bo'ladi. */
        @JavascriptInterface
        fun sessionToken(): String = AppAuthApi.readSession(this@AppWebActivity) ?: ""

        /** Farzand qurilmasining tokeni. Ota-onada bo'sh bo'ladi. */
        @JavascriptInterface
        fun deviceToken(): String = DeviceCredentials.readDeviceToken(this@AppWebActivity) ?: ""

        @JavascriptInterface
        fun appVersion(): String = com.shield.parentalguard.BuildConfig.VERSION_NAME

        /** Telegramdagi ulashish oynalari ilovadan tashqarida ochiladi. */
        @JavascriptInterface
        fun openExternal(url: String) {
            runOnUiThread {
                try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) } catch (_: Exception) {}
            }
        }

        @JavascriptInterface
        fun logout() {
            AppAuthApi.clearSession(this@AppWebActivity)
            runOnUiThread {
                startActivity(Intent(this@AppWebActivity, LoginActivity::class.java))
                finish()
            }
        }
    }
}
