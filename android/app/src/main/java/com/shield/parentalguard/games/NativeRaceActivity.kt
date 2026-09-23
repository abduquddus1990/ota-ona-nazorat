package com.shield.parentalguard.games

import android.os.Bundle
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.ImageButton
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.shield.parentalguard.R

/**
 * "Poyga" o'yinining NATIVE (Canvas'da chizilgan) sinov ekrani — Mini
 * App'dagi WebView/canvas versiyasiga alternativ, faqat Android ilova
 * ichida ishlaydi.
 *
 * HOZIRCHA FAQAT YAKKA/SINOV REJIMI: musobaqa (do'st bilan online, ghost
 * ko'rinishida qayta ijro) hali bu yerga ulanmagan — u online.js'dagi
 * mos kelish (matchmaking) protokoliga alohida ulanishni talab qiladi.
 * Bu ekran hozircha faqat chizuv sifatini ko'rsatish uchun.
 */
class NativeRaceActivity : AppCompatActivity() {

    private lateinit var gameView: RaceGameView
    private lateinit var scoreLabel: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val root = FrameLayout(this).apply {
            setBackgroundColor(android.graphics.Color.parseColor("#020617"))
        }

        gameView = RaceGameView(this)
        root.addView(gameView, ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))

        val closeBtn = ImageButton(this).apply {
            setImageResource(android.R.drawable.ic_menu_close_clear_cancel)
            background = null
            setColorFilter(android.graphics.Color.WHITE)
            setOnClickListener { finish() }
        }
        val closeParams = FrameLayout.LayoutParams(120, 120).apply {
            gravity = android.view.Gravity.TOP or android.view.Gravity.END
            topMargin = 48
            marginEnd = 24
        }
        root.addView(closeBtn, closeParams)

        setContentView(root)

        gameView.listener = object : RaceGameView.Listener {
            override fun onGameOver(seed: Long, log: List<Pair<Int, Int>>, ticks: Int, score: Long) {
                // Keyingi qadam: shu (seed, log, ticks, score) to'plamini serverga
                // yuborib, online musobaqada halol natija sifatida tasdiqlash.
            }
        }
        gameView.startNew()
    }

    override fun onPause() {
        super.onPause()
        gameView.pause()
    }

    override fun onResume() {
        super.onResume()
        if (::gameView.isInitialized) gameView.resumeIfInProgress()
    }
}
