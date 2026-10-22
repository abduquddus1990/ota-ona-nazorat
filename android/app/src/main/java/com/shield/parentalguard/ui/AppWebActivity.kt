package com.shield.parentalguard.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.ViewGroup
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
import com.shield.parentalguard.push.QalqonPush

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

    // ----------------------------------------------------- kirish animatsiyasi
    //
    // Mini App internetdan yuklanadi va bunga bir necha soniya ketadi. Ilgari
    // shu vaqt davomida to'q, bo'sh ekran turardi, animatsiya esa sahifa
    // yuklangandan KEYIN boshlanardi — ya'ni u yuklanishni yashirmasdi.
    // Endi animatsiya ilovaning o'z fayllaridan (assets/splash) darhol
    // o'ynaydi, panel esa orqada yuklanadi. Sahifa "tayyorman" deganda
    // (QalqonNative.panelReady) va animatsiya kamida o'z vaqtini o'ynagach,
    // u silliq yo'qoladi. Yuklanish uzoq cho'zilsa, animatsiya oxirgi kadrda
    // kutib turadi.
    private var splashView: WebView? = null
    private val handler = Handler(Looper.getMainLooper())
    private var splashBoshi = 0L
    private var splashKamida = 0L
    private var panelYuklandi = false
    private var otkazishSoraldi = false

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

    private val notifRuxsat = registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    /**
     * Push manzilini serverga beradi va Android 13+ da bildirishnomaga ruxsat
     * so'raydi — ruxsatsiz SOS xabari telefonda umuman ko'rinmaydi.
     */
    private fun pushniYoq() {
        if (!QalqonPush.enabled()) return
        QalqonPush.register(this)
        if (android.os.Build.VERSION.SDK_INT >= 33 &&
            androidx.core.content.ContextCompat.checkSelfPermission(
                this, android.Manifest.permission.POST_NOTIFICATIONS
            ) != android.content.pm.PackageManager.PERMISSION_GRANTED
        ) {
            notifRuxsat.launch(android.Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    /**
     * Sahifani tizim panellari ostidan chiqaradi.
     *
     * targetSdk 35 dan boshlab Android oynani majburan "chetdan chetga"
     * chizadi: WebView yuqorida soat/batareya paneli ostiga, pastda esa
     * "orqaga/uy" tugmalari ostiga kirib ketadi. Natijada ilovaning o'z
     * sarlavhasi va pastki menyusi yarim berkilib qoladi — foydalanuvchi
     * telefonda aynan shuni ko'rdi.
     *
     * CSS'dagi env(safe-area-inset-*) bu yerda yordam bermaydi: WebView
     * ichida u nolga teng bo'lib qolaveradi. Shuning uchun joyni tizimning
     * o'zidan so'rab, konteynerga to'ldirma qilib beramiz. Ekran o'yig'i
     * (kamera teshigi) ham hisobga olinadi.
     */
    private fun tizimPanellariUchunJoyAjrat(root: android.view.View) {
        androidx.core.view.ViewCompat.setOnApplyWindowInsetsListener(root) { view, insets ->
            val bars = insets.getInsets(
                androidx.core.view.WindowInsetsCompat.Type.systemBars() or
                    androidx.core.view.WindowInsetsCompat.Type.displayCutout()
            )
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            insets
        }
        androidx.core.view.ViewCompat.requestApplyInsets(root)
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
        tizimPanellariUchunJoyAjrat(findViewById(R.id.webRoot))
        splashniBoshla(role)
        pushniYoq()

        web.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            // Panelga kirishdagi qisqa ohang (splash.js) teginishsiz chalinsin.
            // Brauzerlar buni sukut bo'yicha bloklaydi; o'z ilovamizda ruxsat
            // beramiz — ovozni foydalanuvchi Sozlamalarda o'chira oladi.
            mediaPlaybackRequiresUserGesture = false
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            // Mini App'ning o'zi mobil o'lchamga moslangan.
            useWideViewPort = true
            loadWithOverviewMode = true
            textZoom = 100
        }
        web.addJavascriptInterface(Bridge(), "QalqonNative")

        web.webViewClient = object : WebViewClient() {
            // Ko'prik (QalqonNative) kalitlarni FAQAT o'z sahifalarimizga beradi.
            // Sahifa almashganda bayroq yangilanadi; @JavascriptInterface boshqa
            // oqimda ishlaydi va web.url ni u yerdan o'qib bo'lmaydi.
            override fun onPageStarted(view: WebView?, url: String?, favicon: android.graphics.Bitmap?) {
                ishonchliSahifa = ishonchliHost(android.net.Uri.parse(url ?: "").host.orEmpty())
                super.onPageStarted(view, url, favicon)
            }

            // Zaxira: sahifa yuklandi-yu, "tayyorman" demadi (masalan, eski
            // keshdagi versiya) — animatsiya abadiy turib qolmasin.
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                handler.postDelayed({ panelTayyor() }, 10_000)
            }

            // Internet yo'q yoki server javob bermadi — xato sahifasini
            // animatsiya ortida yashirmaymiz.
            override fun onReceivedError(
                view: WebView?, request: WebResourceRequest?, error: android.webkit.WebResourceError?,
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    otkazishSoraldi = true
                    panelTayyor()
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url ?: return false
                // Telegram havolalari (do'stni chaqirish, o'yin taklifi) va
                // tashqi sahifalar brauzerda/Telegramda ochilsin.
                val host = url.host.orEmpty()
                // qalqonai.uz — loyihaning o'z domeni. Sayt keyinchalik
                // github.io'dan shu domenga ko'chiriladi va github.io unga
                // yo'naltiradi; shu qatorsiz o'rnatilgan ilova yo'naltirishni
                // tashqi brauzerga chiqarib yuborardi va panel ochilmay qolardi.
                val ichki = ishonchliHost(host)
                return if (ichki) {
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
        // nativeSplash=1 — sahifa o'z animatsiyasini qaytarmaydi, faqat
        // tayyorligini aytadi (app.js: nativePanelReady).
        web.loadUrl("https://abduquddus1990.github.io/ota-ona-nazorat/?app=1&lang=uz&nativeSplash=1$roleParam")
    }

    /**
     * Ota-onaga kunning birinchi ochilishida to'liq sahna (6 s), keyingi
     * ochilishlarida va farzandga — qisqa logotip. Mini App'dagi qoida bilan
     * bir xil (splash.js).
     */
    private fun splashniBoshla(role: String) {
        val sv = findViewById<WebView>(R.id.splashView)
        splashView = sv
        val prefs = getSharedPreferences(PREFS, MODE_PRIVATE)
        val bugun = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Tashkent")).toString()
        val toliq = role == "parent" && prefs.getString("splash_kun", null) != bugun
        if (toliq) prefs.edit().putString("splash_kun", bugun).apply()
        val ovoz = prefs.getBoolean("splash_ovoz", true)
        splashKamida = if (toliq) 6_300L else 1_200L
        splashBoshi = SystemClock.elapsedRealtime()

        sv.setBackgroundColor(android.graphics.Color.parseColor("#e4f1fb"))
        sv.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            mediaPlaybackRequiresUserGesture = false
        }
        sv.addJavascriptInterface(SplashBridge(), "QalqonSplash")
        // Animatsiya sahifasi hech qayerga o'tmaydi.
        sv.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?) = true
        }
        sv.loadUrl("file:///android_asset/splash/index.html#" +
            (if (toliq) "full" else "short") + "," + (if (ovoz) "on" else "off"))

        // Oxirgi zaxira: nima bo'lsa ham 25 soniyadan keyin panel ochiladi.
        handler.postDelayed({ otkazishSoraldi = true; panelTayyor() }, 25_000)
    }

    private fun panelTayyor() {
        panelYuklandi = true
        splashniYopTekshir()
    }

    private fun splashniYopTekshir() {
        if (!panelYuklandi || splashView == null) return
        val qoldi = splashKamida - (SystemClock.elapsedRealtime() - splashBoshi)
        if (otkazishSoraldi || qoldi <= 0) splashniYop()
        else handler.postDelayed({ splashniYopTekshir() }, qoldi)
    }

    private fun splashniYop() {
        val sv = splashView ?: return
        splashView = null
        sv.animate().alpha(0f).setDuration(450).withEndAction {
            (sv.parent as? ViewGroup)?.removeView(sv)
            sv.destroy()
        }.start()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        super.onDestroy()
    }

    /** Animatsiya sahifasining "O'tkazib yuborish" tugmasi. */
    inner class SplashBridge {
        @JavascriptInterface
        fun skip() {
            runOnUiThread {
                otkazishSoraldi = true
                splashniYopTekshir()
            }
        }
    }

    /**
     * Sahifa ilova bilan shu orqali gaplashadi. Faqat kerakli narsa ochiladi:
     * hisob ma'lumoti, rol va ilova versiyasi.
     */
    /**
     * Ilova ichida ochiladigan sahifalar — ANIQ ro'yxat.
     *
     * Ilgari `host.contains("github.io")` edi: istalgan odamning
     * github.io sahifasi, hatto "github.io.soxta-sayt.com" ham ilova ichida
     * ochilardi va QalqonNative ko'prigi unga ota-onaning seans tokenini
     * hamda farzand qurilmasining tokenini berardi (xavfsizlik tekshiruvi,
     * 2026-10-07).
     */
    private fun ishonchliHost(host: String): Boolean =
        host == "abduquddus1990.github.io" || host == "qalqonai.uz" || host == "www.qalqonai.uz"

    @Volatile private var ishonchliSahifa = false

    private companion object {
        const val PREFS = "shield_guard_prefs"
    }

    inner class Bridge {

        @JavascriptInterface
        fun role(): String = AppAuthApi.currentRole(this@AppWebActivity) ?: ""

        /** Ota-ona seansi (web_sessions). Farzandda bo'sh bo'ladi. */
        @JavascriptInterface
        fun sessionToken(): String = if (ishonchliSahifa) (AppAuthApi.readSession(this@AppWebActivity) ?: "") else ""

        /** Farzand qurilmasining tokeni. Ota-onada bo'sh bo'ladi. */
        @JavascriptInterface
        fun deviceToken(): String = if (ishonchliSahifa) (DeviceCredentials.readDeviceToken(this@AppWebActivity) ?: "") else ""

        @JavascriptInterface
        fun appVersion(): String = try {
            packageManager.getPackageInfo(packageName, 0).versionName ?: ""
        } catch (_: Exception) {
            ""
        }

        /** Telegramdagi ulashish oynalari ilovadan tashqarida ochiladi. */
        @JavascriptInterface
        fun openExternal(url: String) {
            runOnUiThread {
                try { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) } catch (_: Exception) {}
            }
        }

        /** Mini App panelni chizib bo'ldi — kirish animatsiyasini olib tashlash mumkin. */
        @JavascriptInterface
        fun panelReady() {
            if (ishonchliSahifa) runOnUiThread { panelTayyor() }
        }

        /** Sozlamalardagi ovoz kaliti — ilovadagi animatsiya ham unga bo'ysunadi. */
        @JavascriptInterface
        fun setSound(on: Boolean) {
            getSharedPreferences(PREFS, MODE_PRIVATE).edit().putBoolean("splash_ovoz", on).apply()
        }

        @JavascriptInterface
        fun logout() {
            // Push manzili o'chiriladi: aks holda chiqqan (masalan boshqaga
            // berilgan) telefonga oilaning SOS xabarlari kelib turaverardi.
            // Server eskirgan manzilni keyingi yuborishda o'zi o'chiradi.
            QalqonPush.unregister(this@AppWebActivity)
            AppAuthApi.clearSession(this@AppWebActivity)
            runOnUiThread {
                startActivity(Intent(this@AppWebActivity, LoginActivity::class.java))
                finish()
            }
        }
    }
}
