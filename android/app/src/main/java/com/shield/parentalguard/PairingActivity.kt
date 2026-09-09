package com.shield.parentalguard

import android.app.Activity
import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Process
import android.provider.Settings
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.shield.parentalguard.network.PairingApi
import java.util.concurrent.Executors

/**
 * Shield Parental Guard — child device pairing.
 * Binds via the same Supabase ota-ona-bot edge function as the Mini App,
 * then stores family_code in SharedPreferences and continues to permissions.
 * Optional Telegram pair_ deep link for bot_engine / webhook onboard.
 */
class PairingActivity : Activity() {

    private lateinit var prefs: SharedPreferences
    private lateinit var etPairingCode: EditText
    private lateinit var btnPair: Button
    private lateinit var btnTelegramPair: Button
    private lateinit var tvPairError: TextView
    private lateinit var layoutPermissions: LinearLayout
    private lateinit var layoutStatus: LinearLayout
    private lateinit var tvStatusText: TextView
    private lateinit var btnGrantLocation: Button
    private lateinit var btnGrantUsage: Button
    private lateinit var btnGrantAccessibility: Button

    private val ioExecutor = Executors.newSingleThreadExecutor()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_pairing)

        prefs = getSharedPreferences("shield_guard_prefs", Context.MODE_PRIVATE)

        initViews()
        consumePairIntent(intent)
        checkExistingPairing()
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        if (intent != null) {
            setIntent(intent)
            consumePairIntent(intent)
        }
    }

    private fun initViews() {
        etPairingCode = findViewById(R.id.etPairingCode)
        btnPair = findViewById(R.id.btnPair)
        btnTelegramPair = findViewById(R.id.btnTelegramPair)
        tvPairError = findViewById(R.id.tvPairError)
        layoutPermissions = findViewById(R.id.layoutPermissions)
        layoutStatus = findViewById(R.id.layoutStatus)
        tvStatusText = findViewById(R.id.tvStatusText)
        btnGrantLocation = findViewById(R.id.btnGrantLocation)
        btnGrantUsage = findViewById(R.id.btnGrantUsage)
        btnGrantAccessibility = findViewById(R.id.btnGrantAccessibility)

        btnPair.setOnClickListener {
            val code = normalizeFamilyCode(etPairingCode.text?.toString())
            if (code.length == 6) {
                bindWithServer(code)
            } else {
                showPairError(
                    "6 xonali kod kiriting (6 raqam) / Введите 6-значный код"
                )
            }
        }

        btnTelegramPair.setOnClickListener {
            val code = normalizeFamilyCode(etPairingCode.text?.toString())
            if (code.length != 6) {
                showPairError(
                    "Avval 6 xonali kodni kiriting / Сначала введите 6-значный код"
                )
                return@setOnClickListener
            }
            openTelegramPairLink(code)
        }

        btnGrantLocation.setOnClickListener { requestLocationPermission() }
        btnGrantUsage.setOnClickListener { requestUsageStatsPermission() }
        btnGrantAccessibility.setOnClickListener { requestAccessibilityPermission() }
    }

    /** Accept pair_XXXXXX / child_XXXXXX / plain 6 digits from deep link or extras. */
    private fun consumePairIntent(intent: Intent) {
        var raw: String? = intent.getStringExtra("family_code")
            ?: intent.getStringExtra("code")
            ?: intent.getStringExtra("start")

        val data: Uri? = intent.data
        if (raw.isNullOrBlank() && data != null) {
            raw = data.getQueryParameter("start")
                ?: data.getQueryParameter("code")
                ?: data.getQueryParameter("family_code")
                ?: data.lastPathSegment
        }

        val code = normalizeFamilyCode(raw)
        if (code.length == 6) {
            etPairingCode.setText(code)
        }
    }

    private fun normalizeFamilyCode(raw: String?): String {
        if (raw.isNullOrBlank()) return ""
        var s = raw.trim()
        if (s.startsWith("pair_", ignoreCase = true)) s = s.substring(5)
        if (s.startsWith("child_", ignoreCase = true)) s = s.substring(6)
        return s.replace("-", "").filter { it.isDigit() }
    }

    private fun showPairError(message: String) {
        tvPairError.text = message
        tvPairError.visibility = View.VISIBLE
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    private fun clearPairError() {
        tvPairError.text = ""
        tvPairError.visibility = View.GONE
    }

    private fun bindWithServer(code: String) {
        clearPairError()
        btnPair.isEnabled = false
        btnPair.text = "Ulanmoqda... / Подключение..."

        val deviceLabel = "Android ${PairingApi.deviceModel}"

        ioExecutor.execute {
            val result = try {
                PairingApi.bindChildDevice(code, deviceLabel)
            } catch (e: Exception) {
                Result.failure(e)
            }

            runOnUiThread {
                btnPair.isEnabled = true
                btnPair.text = getString(R.string.btn_pair_label)

                if (result.isSuccess) {
                    savePairingCode(code)
                } else {
                    showPairError(
                        "Ulanish muvaffaqiyatsiz. Kodni tekshiring yoki Telegram orqali urinib ko'ring. / " +
                            "Не удалось подключиться. Проверьте код или откройте Telegram."
                    )
                }
            }
        }
    }

    private fun openTelegramPairLink(code: String) {
        val link = PairingApi.telegramPairDeepLink(code)
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(link)))
        } catch (_: Exception) {
            showPairError(
                "Telegram ochilmadi. Havolani qo'lda oching: t.me/${PairingApi.TELEGRAM_BOT_USERNAME} / " +
                    "Не удалось открыть Telegram"
            )
        }
    }

    private fun checkExistingPairing() {
        val savedCode = prefs.getString("family_code", null)
        if (!savedCode.isNullOrEmpty()) {
            showPermissionsOrActiveState()
        }
    }

    private fun savePairingCode(code: String) {
        val childId = PairingApi.deviceChildId(code)
        prefs.edit()
            .putString("family_code", code)
            .putString("child_id", childId)
            .putBoolean("is_paired", true)
            .apply()
        clearPairError()
        Toast.makeText(
            this,
            "Oila kodi saqlandi! / Код семьи сохранён!",
            Toast.LENGTH_LONG
        ).show()
        showPermissionsOrActiveState()
    }

    private fun showPermissionsOrActiveState() {
        findViewById<LinearLayout>(R.id.layoutCodeInput).visibility = View.GONE
        layoutPermissions.visibility = View.VISIBLE

        val hasLocation = ContextCompat.checkSelfPermission(
            this,
            android.Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val hasUsage = checkUsageStatsPermission()

        btnGrantLocation.isEnabled = !hasLocation
        btnGrantLocation.text = if (hasLocation) {
            "Lokatsiya faol / Локация активна"
        } else {
            "1. Lokatsiyaga ruxsat / Разрешить локацию"
        }

        btnGrantUsage.isEnabled = !hasUsage
        btnGrantUsage.text = if (hasUsage) {
            "Ekran vaqti faol / Экранное время активно"
        } else {
            "2. Foydalanish ruxsati / Доступ к использованию"
        }

        if (hasLocation && hasUsage) {
            layoutPermissions.visibility = View.GONE
            layoutStatus.visibility = View.VISIBLE
            tvStatusText.text =
                "Qurilma himoyalangan va ulangan!\nУстройство защищено и подключено!"
            startGuardService()
        }
    }

    private fun requestLocationPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(
                android.Manifest.permission.ACCESS_FINE_LOCATION,
                android.Manifest.permission.ACCESS_COARSE_LOCATION
            ),
            1001
        )
    }

    private fun checkUsageStatsPermission(): Boolean {
        val appOps = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                packageName
            )
        } else {
            @Suppress("DEPRECATION")
            appOps.checkOpNoThrow(
                AppOpsManager.OPSTR_GET_USAGE_STATS,
                Process.myUid(),
                packageName
            )
        }
        return mode == AppOpsManager.MODE_ALLOWED
    }

    private fun requestUsageStatsPermission() {
        startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
    }

    private fun requestAccessibilityPermission() {
        startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
    }

    private fun startGuardService() {
        com.shield.parentalguard.ParentalGuardApp.startMonitoring(applicationContext)
    }

    override fun onResume() {
        super.onResume()
        if (prefs.getBoolean("is_paired", false)) {
            showPermissionsOrActiveState()
        }
    }

    override fun onDestroy() {
        ioExecutor.shutdownNow()
        super.onDestroy()
    }
}
