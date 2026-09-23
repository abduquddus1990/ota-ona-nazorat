package com.shield.parentalguard.games

/**
 * "Poyga" o'yinining mantig'i — supabase/functions/ota-ona-bot/sim.js
 * (va uning ikki nusxasi: ildizda, telegram_miniapp'da) dagi RACE
 * bo'limining Kotlin'ga BIT-BAROBAR ko'chirilgan nusxasi.
 *
 * NEGA BIT-BAROBAR MUHIM: server bola bosgan tugmalar jurnalini ("log")
 * qayta o'ynatib, natijani O'ZI hisoblaydi — bu online musobaqada
 * "halollik" tekshiruvi. Agar bu yerdagi arifmetika JS versiyasidan bir
 * xonagacha ham farq qilsa, native ilovada olingan ball server tomonidan
 * boshqacha hisoblanadi va o'yin natijasi rad etiladi.
 *
 * Tekshirilgan: mulberry32 RNG'ning ushbu porti bir nechta seed va uzun
 * kirish jurnallari bo'yicha asl JS bilan (Node orqali) bit-baravar
 * natija berishi Java'da alohida tasdiqlangan (scratchpad/RaceSimCheck.java)
 * — Kotlin JVM'da xuddi shu Int arifmetikasi ishlaydi (32-bitli wraparound,
 * xuddi Math.imul kabi).
 *
 * O'ZGARTIRSANGIZ: sim.js'ning uchala nusxasi bilan solishtirib ko'ring —
 * mos kelmasa, online poyga musobaqasi noto'g'ri hisoblanadi.
 */
object RaceSim {

    const val W = 300.0
    const val H = 450.0
    const val LANES = 3
    val LANE_W = W / LANES
    val CAR_W = LANE_W * 0.56
    val CAR_H = Math.round(CAR_W * 1.8).toDouble()
    val COLORS = intArrayOf(
        0xFFF87171.toInt(), 0xFFFBBF24.toInt(), 0xFFA78BFA.toInt(),
        0xFF34D399.toInt(), 0xFF38BDF8.toInt()
    )
    const val MAX_TICKS = 60 * 60 * 30
    const val MAX_LOG = 20000

    /** mulberry32 — sim.js'dagi rng(seed) bilan bit-baravar. */
    class Rng(seed: Long) {
        private var a: Int = (seed and 0xFFFFFFFFL).toInt().let { if (it == 0) 1 else it }
        fun next(): Double {
            a += 0x6D2B79F5
            var t = a
            t = (t xor (t ushr 15)) * (t or 1)
            t = t xor (t + ((t xor (t ushr 7)) * (t or 61)))
            val unsigned = (t xor (t ushr 14)).toUInt().toLong()
            return unsigned / 4294967296.0
        }
    }

    class Obstacle(var lane: Int, var y: Double, val colorIndex: Int)

    class State(seed: Long) {
        val r = Rng(seed)
        var tick = 0
        var lane = 1
        var carX = LANE_W * 1.5
        val obstacles = ArrayList<Obstacle>()
        var speed = 3.2
        var score = 0.0
        var over = false
    }

    fun setLane(s: State, lane: Int) {
        if (s.over) return
        s.lane = lane.coerceIn(0, LANES - 1)
    }

    fun step(s: State) {
        if (s.over) return
        s.tick++
        s.speed += 0.0016
        s.score += s.speed * 0.05
        val period = maxOf(26, Math.round(70 - s.speed * 4).toInt())
        if (s.tick % period == 0) {
            val band = Math.floor(s.r.next() * LANES).toInt()
            val last = s.obstacles.lastOrNull()
            if (last == null || last.y > CAR_H * 1.6 || last.lane != band) {
                val colorIdx = Math.floor(s.r.next() * COLORS.size).toInt()
                s.obstacles.add(Obstacle(band, -CAR_H, colorIdx))
            }
        }
        for (o in s.obstacles) o.y += s.speed
        s.obstacles.removeAll { it.y >= H + CAR_H }
        s.carX += (LANE_W * (s.lane + 0.5) - s.carX) * 0.25
        val myY = H - CAR_H * 0.9
        for (o in s.obstacles) {
            val ox = LANE_W * (o.lane + 0.5)
            if (Math.abs(ox - s.carX) < CAR_W * 0.85 && Math.abs(o.y - myY) < CAR_H * 0.9) {
                s.over = true
                break
            }
        }
        if (s.tick >= MAX_TICKS) s.over = true
    }
}
