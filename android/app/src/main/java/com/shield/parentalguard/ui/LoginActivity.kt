package com.shield.parentalguard.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.shield.parentalguard.PairingActivity
import com.shield.parentalguard.R
import com.shield.parentalguard.network.AppAuthApi
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Kirish ekrani.
 *
 * Ota-ona: "Telegram bilan kirish" (bot orqali tasdiqlash) yoki login-parol.
 * Farzand: ota-ona bergan bir martalik kod — u eski PairingActivity'da.
 *
 * Telegram username so'ralmaydi: username kirish uchun isbot emas.
 */
class LoginActivity : AppCompatActivity() {

    private lateinit var btnTelegram: Button
    private lateinit var btnPassword: Button
    private lateinit var btnChild: Button
    private lateinit var passwordBox: View
    private lateinit var etLogin: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnPasswordSubmit: Button
    private lateinit var tvStatus: TextView

    /** Telegramdan qaytgach, tasdiqlashni shu token bo'yicha so'raymiz. */
    private var pendingToken: String? = null
    private var polling = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (AppAuthApi.currentRole(this) != null) {
            openApp()
            return
        }
        setContentView(R.layout.activity_login)
        btnTelegram = findViewById(R.id.btnTelegramLogin)
        btnPassword = findViewById(R.id.btnPasswordLogin)
        btnChild = findViewById(R.id.btnChildLogin)
        passwordBox = findViewById(R.id.passwordBox)
        etLogin = findViewById(R.id.etLogin)
        etPassword = findViewById(R.id.etPassword)
        btnPasswordSubmit = findViewById(R.id.btnPasswordSubmit)
        tvStatus = findViewById(R.id.tvLoginStatus)

        btnTelegram.setOnClickListener { startTelegramLogin() }
        btnPassword.setOnClickListener {
            passwordBox.visibility = if (passwordBox.visibility == View.VISIBLE) View.GONE else View.VISIBLE
        }
        btnPasswordSubmit.setOnClickListener { submitPassword() }
        btnChild.setOnClickListener {
            startActivity(Intent(this, PairingActivity::class.java))
        }
    }

    override fun onResume() {
        super.onResume()
        // Telegramdan qaytdi — tasdiqlanganini tekshiramiz.
        pendingToken?.let { if (!polling) pollUntilApproved(it) }
    }

    private fun startTelegramLogin() {
        setBusy(true, getString(R.string.login_opening_telegram))
        lifecycleScope.launch {
            val result = withContext(Dispatchers.IO) { AppAuthApi.startTelegramLogin() }
            result.onSuccess { req ->
                pendingToken = req.token
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(req.link)))
                } catch (_: Exception) {
                    Toast.makeText(this@LoginActivity, R.string.login_no_telegram, Toast.LENGTH_LONG).show()
                }
                pollUntilApproved(req.token)
            }.onFailure {
                setBusy(false, getString(R.string.login_server_error))
            }
        }
    }

    /** Ota-ona botda tasdiqlaguncha holatni so'rab turamiz (10 daqiqagacha). */
    private fun pollUntilApproved(token: String) {
        if (polling) return
        polling = true
        setBusy(true, getString(R.string.login_waiting_confirm))
        lifecycleScope.launch {
            var waited = 0
            while (waited < 10 * 60) {
                val (status, session) = withContext(Dispatchers.IO) {
                    AppAuthApi.pollTelegramLogin(token).getOrElse { "pending" to null }
                }
                when (status) {
                    "approved" -> {
                        session?.let { AppAuthApi.saveSession(this@LoginActivity, it) }
                        polling = false
                        pendingToken = null
                        openApp()
                        return@launch
                    }
                    "rejected", "expired", "used" -> {
                        polling = false
                        pendingToken = null
                        setBusy(false, getString(R.string.login_rejected))
                        return@launch
                    }
                }
                delay(2000)
                waited += 2
            }
            polling = false
            pendingToken = null
            setBusy(false, getString(R.string.login_timeout))
        }
    }

    private fun submitPassword() {
        val login = etLogin.text.toString()
        val pass = etPassword.text.toString()
        if (login.isBlank() || pass.isBlank()) {
            tvStatus.text = getString(R.string.login_fill_both)
            return
        }
        setBusy(true, getString(R.string.login_checking))
        lifecycleScope.launch {
            val result = withContext(Dispatchers.IO) { AppAuthApi.loginWithPassword(login, pass) }
            result.onSuccess {
                AppAuthApi.saveSession(this@LoginActivity, it)
                openApp()
            }.onFailure {
                setBusy(false, getString(R.string.login_bad_password))
            }
        }
    }

    private fun setBusy(busy: Boolean, message: String) {
        tvStatus.text = message
        btnTelegram.isEnabled = !busy
        btnPasswordSubmit.isEnabled = !busy
    }

    private fun openApp() {
        startActivity(Intent(this, AppWebActivity::class.java))
        finish()
    }
}
