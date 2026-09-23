package com.shield.parentalguard.games

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.RectF
import android.view.Choreographer
import android.view.MotionEvent
import android.view.View
import kotlin.random.Random

/**
 * "Poyga" o'yinining NATIVE chizuvchi ekrani — mantiq (RaceSim.kt) bilan
 * chizuv qat'iy ajratilgan: bu View faqat RaceSim.State'ni chizadi va
 * barmoq kiritishini RaceSim.setLane()'ga uzatadi. Natijada xuddi shu
 * mantiq keyinchalik online musobaqa (ghost — do'stning jurnalini qayta
 * ijro etish) uchun ham, hozirgi yakka o'yin uchun ham ishlatilaveradi.
 *
 * Vaqt qadami QAT'IY 60/soniya — ekran 60/90/120 Hz bo'lishidan qat'iy
 * nazar (sim.js'dagi qoida #2, izohga qarang). Buning uchun "accumulator"
 * naqshi ishlatiladi: chizuv ekran chastotasida, mantiq qadami esa doim
 * teng ulushlarda.
 */
class RaceGameView(context: Context) : View(context) {

    companion object {
        private const val STEP_NANOS = 1_000_000_000L / 60
    }

    interface Listener {
        /** Har safar yangi qator (band) yugurayotganda, seed va boshidan boshlanadi. */
        fun onScoreChanged(score: Long) {}
        fun onGameOver(seed: Long, log: List<Pair<Int, Int>>, ticks: Int, score: Long) {}
    }

    var listener: Listener? = null

    private var seed: Long = Random.nextLong()
    private var state = RaceSim.State(seed)
    private val log = ArrayList<Pair<Int, Int>>()
    private var lastFrameNanos = 0L
    private var accumulator = 0L
    private var running = false
    private var lastReportedScore = -1L

    private val choreographer = Choreographer.getInstance()
    private val frameCallback = object : Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (!running) return
            if (lastFrameNanos != 0L) {
                var delta = frameTimeNanos - lastFrameNanos
                // Ilova fonga o'tib qaytganda juda katta sakrash bo'lmasin.
                if (delta > 250_000_000L) delta = STEP_NANOS
                accumulator += delta
                while (accumulator >= STEP_NANOS && !state.over) {
                    RaceSim.step(state)
                    accumulator -= STEP_NANOS
                }
                if (state.over) {
                    running = false
                    listener?.onGameOver(seed, log.toList(), state.tick, Math.floor(state.score).toLong())
                }
            }
            lastFrameNanos = frameTimeNanos
            val scoreNow = Math.floor(state.score).toLong()
            if (scoreNow != lastReportedScore) {
                lastReportedScore = scoreNow
                listener?.onScoreChanged(scoreNow)
            }
            invalidate()
            if (running) choreographer.postFrameCallback(this)
        }
    }

    /** Yangi o'yin: yangi tasodifiy urug' bilan (do'st bilan musobaqada bu serverdan keladi). */
    fun startNew(withSeed: Long = Random.nextLong()) {
        seed = withSeed
        state = RaceSim.State(seed)
        log.clear()
        accumulator = 0L
        lastFrameNanos = 0L
        lastReportedScore = -1L
        running = true
        choreographer.removeFrameCallback(frameCallback)
        choreographer.postFrameCallback(frameCallback)
    }

    fun pause() {
        running = false
        choreographer.removeFrameCallback(frameCallback)
    }

    /** Fondan qaytganda — o'yin qayta boshlanmaydi, xuddi to'xtagan joyidan davom etadi. */
    fun resumeIfInProgress() {
        if (state.over || running) return
        running = true
        lastFrameNanos = 0L
        choreographer.removeFrameCallback(frameCallback)
        choreographer.postFrameCallback(frameCallback)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        pause()
    }

    private fun setLane(lane: Int) {
        if (state.over || lane == state.lane) return
        log.add(state.tick to lane)
        RaceSim.setLane(state, lane)
        // Yengil qo'l tebranishi — real avtomobil boshqarayotgandek tuyg'u.
        try {
            performHapticFeedback(android.view.HapticFeedbackConstants.CLOCK_TICK)
        } catch (_: Exception) {
        }
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_DOWN || event.action == MotionEvent.ACTION_MOVE) {
            val third = width / 3f
            val lane = (event.x / third).toInt().coerceIn(0, RaceSim.LANES - 1)
            setLane(lane)
            return true
        }
        return super.onTouchEvent(event)
    }

    // --------------------------------------------------------------- Chizuv

    private val roadPaint = Paint().apply { color = Color.parseColor("#1e293b") }
    private val laneLinePaint = Paint().apply {
        color = Color.parseColor("#334155")
        strokeWidth = 3f
        pathEffect = android.graphics.DashPathEffect(floatArrayOf(22f, 18f), 0f)
    }
    private val carPaint = Paint().apply { color = Color.parseColor("#38bdf8"); isAntiAlias = true }
    private val obstaclePaint = Paint().apply { isAntiAlias = true }
    private val scorePaint = Paint().apply {
        color = Color.WHITE
        textSize = 46f
        isFakeBoldText = true
        isAntiAlias = true
        textAlign = Paint.Align.LEFT
    }
    private val overlayBgPaint = Paint().apply { color = Color.parseColor("#CC020617") }
    private val overlayTitlePaint = Paint().apply {
        color = Color.parseColor("#f87171")
        textSize = 64f
        isFakeBoldText = true
        isAntiAlias = true
        textAlign = Paint.Align.CENTER
    }
    private val overlaySubPaint = Paint().apply {
        color = Color.parseColor("#e2e8f0")
        textSize = 40f
        isAntiAlias = true
        textAlign = Paint.Align.CENTER
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val scaleX = width / RaceSim.W.toFloat()
        val scaleY = height / RaceSim.H.toFloat()

        canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), roadPaint)

        // Yo'l chizig'lari — chiziqlar.
        for (i in 1 until RaceSim.LANES) {
            val x = (RaceSim.LANE_W * i).toFloat() * scaleX
            canvas.drawLine(x, 0f, x, height.toFloat(), laneLinePaint)
        }

        // To'siqlar.
        for (o in state.obstacles) {
            val cx = (RaceSim.LANE_W * (o.lane + 0.5)).toFloat() * scaleX
            val cy = o.y.toFloat() * scaleY
            val w = RaceSim.CAR_W.toFloat() * scaleX
            val h = RaceSim.CAR_H.toFloat() * scaleY
            obstaclePaint.color = RaceSim.COLORS[o.colorIndex]
            val r = RectF(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
            canvas.drawRoundRect(r, 10f, 10f, obstaclePaint)
        }

        // O'zining mashinasi.
        run {
            val cx = state.carX.toFloat() * scaleX
            val cy = (RaceSim.H - RaceSim.CAR_H * 0.9).toFloat() * scaleY
            val w = RaceSim.CAR_W.toFloat() * scaleX
            val h = RaceSim.CAR_H.toFloat() * scaleY
            val r = RectF(cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)
            canvas.drawRoundRect(r, 12f, 12f, carPaint)
        }

        canvas.drawText("💰 " + Math.floor(state.score).toLong(), 24f, 60f, scorePaint)

        if (state.over) {
            canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), overlayBgPaint)
            canvas.drawText("🏁 O'YIN TUGADI", width / 2f, height / 2f - 30f, overlayTitlePaint)
            canvas.drawText("Ball: " + Math.floor(state.score).toLong(), width / 2f, height / 2f + 40f, overlaySubPaint)
            canvas.drawText("Qayta boshlash uchun ekranga bosing", width / 2f, height / 2f + 100f, overlaySubPaint)
        }
    }

    init {
        setOnClickListener {
            if (state.over) startNew()
        }
    }
}
