/* ============================================================================
 * OTA-ONA MASLAHATCHISI
 *
 * Bu bo'lim AI'ga so'rov yubormaydi. Sabab ataylab: ota-ona eng og'ir
 * savolini beradigan paytda "AI javob bera olmadi" degan xabarni ko'rishi
 * mumkin emas. Javoblar oldindan yozilgan, ular har doim bor, internet
 * sekin bo'lsa ham ochiladi va hech qanday token sarflamaydi.
 *
 * Har bir javob bir xil tuzilishda: nima bo'layotgani, nima qilmaslik
 * kerak, keyin BUGUN qilinadigan bitta aniq ish. "Ko'proq gaplashing"
 * degan maslahat hech kimga yordam bermaydi — bajariladigan qadam beradi.
 * ========================================================================= */

const PARENT_ADVICE = [
    {
        q: "Farzandim telefondan boshini ko'tarmaydi",
        emoji: "📱",
        a: [
            "Bu irodaning zaifligi emas. Ilovalar aynan shunday — qo'yib yuborish qiyin bo'lsin deb — professional jamoalar tomonidan yaratilgan. Kattalar ham ularga qarshi tura olmaydi.",
            "Qilmang: telefonni tortib olish. U bir necha soatga yordam beradi, keyin bola telefonni yashirishni o'rganadi va siz nima bo'layotganini umuman ko'rmay qolasiz.",
            "Ish beradigan yo'l — telefonsiz vaqtni jazo emas, qiziqroq narsa qilish. Bola nimadan zavq olsa (sport, chizish, konstruktor, oshxonada yordam), o'sha vaqtni ko'paytiring.",
            "<b>Bugun shuni qiling:</b> kechki ovqat davomida oiladagi HAMMA telefonni boshqa xonaga qo'ysin — siz ham. Bola uchun eng kuchli dalil — sizning o'zingiz."
        ]
    },
    {
        q: "Darsga qiziqmayapti, baholari tushdi",
        emoji: "📉",
        a: [
            "Baho tushishi deyarli har doim sabab emas, <b>natija</b>. Ostida uchtadan biri yotadi: tushunmay qolgan mavzu, sinfdagi muammo, yoki uyqusizlik.",
            "Qilmang: \"Nega 3 olding?\" deb so'rash. Bu savol bolani himoyalanishga majbur qiladi va rost javobni yopadi.",
            "O'rniga so'rang: \"Qaysi dars eng qiyin bo'lyapti?\" — bu ayblamaydi va aniq javob beradi. Ko'pincha ma'lum bo'ladi: bola bitta mavzuni o'tkazib yuborgan, undan keyingisi esa o'shanga tayanadi.",
            "<b>Bugun shuni qiling:</b> Qalqondagi <b>Fokus seansi</b>ni birga boshlang — 25 daqiqa, siz ham yoningizda o'z ishingizni qiling. Yolg'iz o'tirish bolaga eng qiyin qismi."
        ]
    },
    {
        q: "Yolg'on gapiryapti",
        emoji: "🤥",
        a: [
            "Bolalar odatda yomonlikdan emas, <b>qo'rquvdan</b> yolg'on gapiradi. Rost gapirganda nima bo'lishini bilgani uchun.",
            "Qilmang: \"Rost gapirsang, urishmayman\" deb va'da berib, keyin baribir urishish. Bir marta shunday bo'lsa, bola boshqa hech qachon rost aytmaydi.",
            "Yolg'onni ushlaganingizda jazoni emas, <b>sababini</b> so'rang: \"Menga aytishdan nimadan qo'rqding?\" Javob ko'pincha sizni hayratda qoldiradi.",
            "<b>Bugun shuni qiling:</b> o'zingizning bolaligingizdagi bitta yolg'onni va uning oqibatini unga gapirib bering. Bu bolaga \"ota-onam ham xato qilgan\" degan xabarni beradi."
        ]
    },
    {
        q: "Do'stlari yomon ta'sir qilyapti",
        emoji: "👥",
        a: [
            "O'smir uchun do'stlarining fikri ota-onasinikidan muhimroq bo'lib qoladi. Bu o'tib ketadigan, tabiiy davr — kasallik emas.",
            "Qilmang: \"U bilan yurma\" deb taqiqlash. Taqiq do'stlikni kuchaytiradi va uni sizdan yashiradi.",
            "O'rniga do'stini <b>uyingizga chaqiring</b>. Bir marta ko'rganingizdan keyin siz uni bilasiz, u sizni biladi, va bolangiz ikki dunyoni yashirishdan qutuladi.",
            "<b>Bugun shuni qiling:</b> farzandingizdan do'sti haqida bitta yaxshi narsani so'rang. Tanqiddan boshlamang — u darhol suhbatni yopadi."
        ]
    },
    {
        q: "Ekran vaqtini janjalsiz qanday cheklash mumkin?",
        emoji: "⏳",
        a: [
            "Janjal chiqadigan joy — <b>kutilmaganda</b> to'xtatish. Bola o'yin o'rtasida uzilib qolsa, g'azablanishi tabiiy — siz ham film oxirida televizor o'chirilsa xafa bo'lardingiz.",
            "Qoidani oldindan va <b>birga</b> kelishing. Bolaning ovozi bo'lgan qoidani u himoya qiladi, sizniki bo'lganini esa buzishga urinadi.",
            "5 daqiqa oldin ogohlantiring: \"Yana 5 daqiqa\". Bu kichik narsa janjallarning yarmini yo'qotadi.",
            "<b>Bugun shuni qiling:</b> Qalqondagi <b>Vaqt banki</b>ni yoqing — bola ekran vaqtini fokus seanslari bilan o'zi ishlab topsin. Shunda vaqt siz beradigan sovg'a emas, u qozonadigan narsaga aylanadi."
        ]
    },
    {
        q: "Internetda notanish odam yozyapti",
        emoji: "⚠️",
        a: [
            "Bu jiddiy va tez harakat qilish kerak, lekin <b>vahima qilmang</b> — vahima bolani gapirishdan to'xtatadi.",
            "Avval bolani maqtang: u sizga aytdi yoki siz bildingiz — ikkalasi ham yaxshi. Bolani ayblamang, aks holda keyingi safar aytmaydi.",
            "Yozishmalarni <b>o'chirmang</b> — ekran suratini oling. Agar tahdid, pul so'rash yoki nomaqbul rasm bo'lsa, bu dalil.",
            "Hisobni bloklang va shikoyat qiling. Jiddiy holatda — <b>102</b> ga yoki bolalar huquqlari bo'yicha idoraga murojaat qiling.",
            "<b>Bugun shuni qiling:</b> farzandingizga bitta qoidani ayting: \"Notanish odam senga yozsa, men seni hech qachon ayblamayman. Shunchaki menga ko'rsat.\""
        ]
    },
    {
        q: "Kechqurun uxlamaydi, telefonda o'tiradi",
        emoji: "🌙",
        a: [
            "Ekran yorug'ligi uyquni keltiradigan gormonni to'sadi. Ya'ni bola \"uxlagisi kelmayapti\" emas — miyasi kunduz deb o'ylayapti.",
            "Uyqusizlik ertasi kuni baho, kayfiyat va sabrga to'g'ridan-to'g'ri ta'sir qiladi. Ko'p \"xulq muammolari\" aslida uyqu muammosi.",
            "Eng samarali qoida: telefon <b>yotoqxonada tunamaydi</b>. Zaryadlash joyi oshxonada bo'lsin — hamma uchun, siz uchun ham.",
            "<b>Bugun shuni qiling:</b> yotishdan 1 soat oldin oiladagi barcha ekranlarni o'chiring. Birinchi uch kun qiyin, keyin odat bo'ladi."
        ]
    },
    {
        q: "Kayfiyati tushgan, o'zini yomon his qilyapti",
        emoji: "💙",
        a: [
            "Bir necha kun davom etgan tushkunlik — e'tibor talab qiladi. Ayniqsa bola sevgan ishlaridan ham voz kechayotgan bo'lsa.",
            "Qilmang: \"Nimaga xafa bo'lasan, hamma narsang bor-ku\" deyish. Bu his-tuyg'uni bekor qiladi va bola boshqa ochilmaydi.",
            "Eng foydali jumla juda sodda: <b>\"Men yoningdaman. Gapirmasang ham bo'ladi.\"</b> Bola tayyor bo'lganda o'zi gapiradi.",
            "Agar ikki haftadan ko'p davom etsa, uyqu yoki ishtaha o'zgargan bo'lsa — <b>mutaxassisga</b> murojaat qiling. Bu zaiflik emas, xuddi singan qo'lni vrachga ko'rsatgandek.",
            "<b>Bugun shuni qiling:</b> Qalqondagi <b>\"Bugun men...\"</b> kartasiga qarang — bola qaysi kunlari qanday kayfiyat belgilaganini ko'rasiz. Tendensiya bitta kundan ko'ra ko'proq narsa aytadi."
        ]
    },
    {
        q: "Uni kuzatayotganimni bilsa, xafa bo'ladimi?",
        emoji: "🤝",
        a: [
            "Xafa bo'ladigan narsa kuzatuv emas — <b>yashirin</b> kuzatuv. Bola bir kun bilib qoladi, va o'shanda yo'qotadigan narsangiz uning joylashuvidan qimmatroq.",
            "Shuning uchun Qalqon yashirin ishlamaydi: bola panelida nima ko'rinishi va nima ko'rinmasligi ochiq yozilgan. Jonli joylashuvni ham u o'zi yoqadi.",
            "Buni shunday tushuntiring: \"Men seni tekshirmayapman. Men xavotir olmasligim uchun qilyapman — shunda senga ko'proq erkinlik bera olaman.\"",
            "<b>Bugun shuni qiling:</b> bolangizga panelni <b>o'zingiz ko'rsating</b> — nima ko'rishingizni va nima ko'rmasligingizni. Yashirmagan narsangiz sizga qarshi ishlatilmaydi."
        ]
    },
    {
        q: "Qancha ekran vaqti normal?",
        emoji: "📊",
        a: [
            "Aniq raqamdan ko'ra muhimroq savol: <b>ekran vaqti nimani siqib chiqaryapti?</b> Uyquni, harakatni, do'stlarni yoki darsni siqib chiqarmasa — miqdorning o'zi muammo emas.",
            "Taxminiy mo'ljal: 6-12 yosh uchun dam olish maqsadida kuniga 1-2 soat; o'smirlar uchun 2-3 soat. Dars va ijod uchun sarflangan vaqt bunga kirmaydi.",
            "Sifati ham muhim: bir soat video ko'rish bilan bir soat dasturlash o'rganish bir xil emas.",
            "<b>Bugun shuni qiling:</b> raqamdan boshlamang. Uch savolga javob bering: bola yetarli uxlaydimi? Haftada kamida ikki marta harakat qiladimi? Jonli do'sti bormi? Uchalasiga \"ha\" bo'lsa, ekran vaqti ikkinchi darajali."
        ]
    }
];

let adviceOpen = -1;

function renderParentAdvice() {
    const host = document.getElementById('parentAdviceList');
    if (!host) return;

    host.innerHTML = PARENT_ADVICE.map((item, i) => {
        const ochiq = i === adviceOpen;
        return '<div class="rounded-2xl border ' +
            (ochiq ? 'border-cyan-500/50 bg-slate-900/80' : 'border-slate-800 bg-slate-900/50') +
            ' overflow-hidden transition">' +
            '<button onclick="toggleAdvice(' + i + ')" class="w-full text-left p-3 flex items-center gap-2.5">' +
                '<span class="text-lg">' + item.emoji + '</span>' +
                '<span class="flex-1 text-[11px] font-bold text-white">' + item.q + '</span>' +
                '<span class="text-slate-500 text-sm">' + (ochiq ? '−' : '+') + '</span>' +
            '</button>' +
            (ochiq
                ? '<div class="px-3 pb-3 space-y-2 text-[11px] text-slate-300 leading-relaxed">' +
                    item.a.map(p => '<p>' + p + '</p>').join('') +
                  '</div>'
                : '') +
        '</div>';
    }).join('');
}

function toggleAdvice(i) {
    adviceOpen = (adviceOpen === i) ? -1 : i;
    renderParentAdvice();
    if (typeof tg !== 'undefined' && tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
}
