/* ============================================================================
 * QALQON AI — OILAVIY CHAT (Mini App tomoni)
 *
 * Faqat bitta oila: ota-ona va shu oilaga ulangan farzandlar. A'zolikni
 * server hal qiladi. Ilova voqealari ham shu yerda ko'rinadi — uy vazifasi
 * (daftar surati bilan), sovg'a so'rovi, "Maktabdaman", joylashuv, SOS — va
 * ota-ona uy vazifasi bilan sovg'ani shu kartaning o'zida tasdiqlaydi.
 *
 * Suratlar ro'yxat bilan kelmaydi (har 4 soniyadagi so'rov og'irlashardi):
 * har biri ko'ringanda alohida so'raladi va eslab qolinadi.
 * ========================================================================= */

let chatState = { me: null, messages: new Map(), lastSync: '', poll: null, photos: new Map() };

function chatEsc(t) { return typeof escapeHtml === 'function' ? escapeHtml(t) : String(t || ''); }

function chatTime(iso) {
    const d = new Date(iso);
    const today = new Date().toDateString() === d.toDateString();
    const hm = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    return today ? hm : d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' }) + ' ' + hm;
}

async function chatCall(body) { return shopCall(body); }

/** Rasmni 1024px va ~60% sifatga siqadi — chat va uy vazifasi uchun. */
function compressImage(file, maxSide = 1024) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            let { width: w, height: h } = img;
            const k = Math.min(1, maxSide / Math.max(w, h));
            w = Math.round(w * k); h = Math.round(h * k);
            const c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            URL.revokeObjectURL(url);
            let q = 0.6, out = c.toDataURL('image/jpeg', q);
            while (out.length > 550000 && q > 0.25) { q -= 0.1; out = c.toDataURL('image/jpeg', q); }
            resolve(out);
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('rasm')); };
        img.src = url;
    });
}

/** Rasm tanlash oynasi (telefonda kamera ham taklif qilinadi). */
function pickImage() {
    return new Promise(resolve => {
        const inp = document.createElement('input');
        inp.type = 'file';
        inp.accept = 'image/*';
        inp.onchange = async () => {
            const f = inp.files && inp.files[0];
            if (!f) return resolve(null);
            try { resolve(await compressImage(f)); } catch (e) { resolve(null); }
        };
        inp.click();
    });
}

/* ------------------------------------------------------------------ OYNA */

async function openFamilyChat() {
    openSubpage('modal-family-chat');
    const thread = document.getElementById('familyChatThread');
    if (thread && !chatState.messages.size) thread.innerHTML = '<div class="text-center text-[11px] text-slate-500 py-6">Yuklanmoqda...</div>';
    await syncChat(true);
    if (chatState.poll) clearInterval(chatState.poll);
    chatState.poll = setInterval(() => {
        const modal = document.getElementById('modal-family-chat');
        if (!modal || !modal.classList.contains('active')) { clearInterval(chatState.poll); chatState.poll = null; refreshChatBadge(); return; }
        if (!document.hidden) syncChat(false);
    }, 4000);
}

async function syncChat(full) {
    try {
        const r = await chatCall({ type: 'chat_list', after: full ? '' : chatState.lastSync });
        if (!r.ok) {
            const thread = document.getElementById('familyChatThread');
            if (thread && full) thread.innerHTML = `<div class="text-center text-[11px] text-rose-300 py-6">${chatEsc(r.error || 'Chat ochilmadi.')}</div>`;
            return;
        }
        chatState.me = r.me;
        if (full) chatState.messages.clear();
        let changed = full;
        for (const m of r.messages) {
            const old = chatState.messages.get(m.id);
            if (!old || old.updatedAt !== m.updatedAt) { chatState.messages.set(m.id, m); changed = true; }
        }
        // Keyingi so'rov serverning soati bo'yicha — telefon soati noto'g'ri bo'lsa ham xabar yo'qolmaydi.
        const latest = [...chatState.messages.values()].reduce((a, m) => m.updatedAt > a ? m.updatedAt : a, '');
        chatState.lastSync = latest || r.serverTime;
        if (changed) renderChat();
        if (changed) chatCall({ type: 'chat_read' }).then(refreshChatBadge).catch(() => {});
    } catch (e) {
        console.error('chat_list:', e);
    }
}

function renderChat() {
    const thread = document.getElementById('familyChatThread');
    if (!thread) return;
    const nearBottom = thread.scrollHeight - thread.scrollTop - thread.clientHeight < 120;
    const list = [...chatState.messages.values()].sort((a, b) => a.createdAt < b.createdAt ? -1 : 1);
    if (!list.length) {
        thread.innerHTML = `<div class="text-center text-[11px] text-slate-500 py-8 space-y-1">
            <div class="text-3xl">💬</div>
            <div>Oila chati hozircha bo'sh.</div>
            <div class="text-[10px]">Bu yerni faqat oilangiz ko'radi. Uy vazifasi, sovg'a so'rovlari va "Maktabdaman" xabarlari ham shu yerga tushadi.</div>
        </div>`;
        return;
    }
    thread.innerHTML = list.map(chatBubble).join('');
    list.filter(m => m.hasPhoto).forEach(m => loadChatPhoto(m.id));
    if (nearBottom || thread.dataset.first !== '1') { thread.scrollTop = thread.scrollHeight; thread.dataset.first = '1'; }
}

function chatBubble(m) {
    const mine = chatState.me && m.authorId === chatState.me.id;
    const isParentViewer = chatState.me && chatState.me.role === 'parent';
    const who = m.role === 'parent' ? '👨‍👩‍👧' : '👦';
    const photo = m.hasPhoto ? `<img data-photo="${m.id}" onclick="openChatPhoto('${m.id}')" class="mt-1.5 rounded-xl max-h-56 w-auto cursor-pointer bg-slate-800 min-h-[80px] min-w-[120px]" alt="">` : '';
    let inner = '';
    const e = m.event;
    if (e && e.type === 'homework') {
        const st = e.status === 'approved' ? `<span class="text-emerald-300">✅ Tasdiqlandi${e.awarded ? ' · +' + e.awarded + ' ball' : ''}</span>`
            : e.status === 'rejected' ? '<span class="text-rose-300">❌ Tasdiqlanmadi</span>' : '<span class="text-amber-300">⏳ Ota-ona tekshiruvi</span>';
        inner = `<div class="text-[11px] font-bold text-white">📚 Uy vazifasi: ${chatEsc(e.subject || '')}</div>
            ${e.note ? `<div class="text-[11px] text-slate-300">${chatEsc(e.note)}</div>` : ''}
            ${photo}
            <div class="text-[10px] mt-1">${st}</div>
            ${isParentViewer && e.status === 'pending' ? `<div class="flex gap-1.5 mt-1.5">
                <button onclick="chatDecide('homework','${e.refId}',true)" class="flex-1 py-1.5 rounded-lg bg-emerald-500/25 border border-emerald-400/50 text-emerald-100 text-[10px] font-bold">✅ Tasdiqlayman (+${e.points || ''})</button>
                <button onclick="chatDecide('homework','${e.refId}',false)" class="flex-1 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-[10px] font-bold">❌ Bajarilmagan</button></div>` : ''}`;
    } else if (e && e.type === 'gift') {
        const st = e.status === 'approved' ? '<span class="text-emerald-300">✅ Tasdiqlandi</span>'
            : e.status === 'rejected' ? `<span class="text-slate-400">${e.reason === 'no_balance' ? "Ball yetmadi" : '⏳ Hozircha emas'}</span>` : '<span class="text-amber-300">⏳ Ota-ona javobi kutilmoqda</span>';
        inner = `<div class="text-[11px] font-bold text-white">🎁 Sovg'a so'rovi</div>
            <div class="text-[12px] text-slate-100">${chatEsc(e.emoji || '🎁')} ${chatEsc(e.title || '')} — <b>${e.price}</b> ball</div>
            <div class="text-[10px] mt-1">${st}</div>
            ${isParentViewer && e.status === 'pending' ? `<div class="flex gap-1.5 mt-1.5">
                <button onclick="chatDecide('gift','${e.refId}',true)" class="flex-1 py-1.5 rounded-lg bg-emerald-500/25 border border-emerald-400/50 text-emerald-100 text-[10px] font-bold">✅ Tasdiqlayman</button>
                <button onclick="chatDecide('gift','${e.refId}',false)" class="flex-1 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-[10px] font-bold">⏳ Hozir emas</button></div>` : ''}`;
    } else if (e && (e.type === 'status' || e.type === 'sos')) {
        const map = e.loc ? `<a href="https://maps.google.com/?q=${e.loc.lat},${e.loc.lng}" target="_blank" class="text-[10px] text-sky-300 underline">📍 Xaritada</a>` : '';
        inner = `<div class="text-[12px] font-bold ${e.type === 'sos' ? 'text-rose-200' : 'text-white'}">${e.type === 'sos' ? '🆘 ' : '📣 '}${chatEsc(e.text || m.body || '')}</div>${map}`;
    } else if (e && e.type === 'location') {
        inner = `<div class="text-[12px] font-bold text-white">${e.reason === 'arrived' ? '🏫 Yetib keldim' : '📍 Joylashuvim'}</div>
            <a href="https://maps.google.com/?q=${e.lat},${e.lng}" target="_blank" class="text-[10px] text-sky-300 underline">Xaritada ochish</a>`;
    } else {
        inner = `${m.body ? `<div class="text-[12px] text-slate-100 whitespace-pre-wrap break-words">${chatEsc(m.body)}</div>` : ''}${photo}`;
    }
    const sosCls = e && e.type === 'sos' ? 'bg-rose-900/60 border-rose-500/60' : mine ? 'bg-indigo-600/35 border-indigo-400/40' : 'bg-slate-800/80 border-slate-700';
    return `<div class="flex ${mine ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[85%] p-2.5 rounded-2xl border ${sosCls} ${mine ? 'rounded-br-sm' : 'rounded-bl-sm'}">
            ${mine ? '' : `<div class="text-[10px] font-bold ${m.role === 'parent' ? 'text-amber-300' : 'text-cyan-300'}">${who} ${chatEsc(m.name || '')}</div>`}
            ${inner}
            <div class="text-[9px] text-slate-500 text-right mt-0.5">${chatTime(m.createdAt)}</div>
        </div>
    </div>`;
}

async function loadChatPhoto(id) {
    const img = document.querySelector(`img[data-photo="${id}"]`);
    if (!img) return;
    if (chatState.photos.has(id)) { img.src = chatState.photos.get(id); return; }
    chatState.photos.set(id, '');
    try {
        const r = await chatCall({ type: 'chat_photo', id });
        if (r.ok) {
            chatState.photos.set(id, r.photo);
            const el = document.querySelector(`img[data-photo="${id}"]`);
            if (el) el.src = r.photo;
        } else chatState.photos.delete(id);
    } catch (e) { chatState.photos.delete(id); }
}

function openChatPhoto(id) {
    const src = chatState.photos.get(id);
    if (!src) return;
    const ov = document.createElement('div');
    ov.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-3';
    ov.style.background = 'rgba(2,6,23,0.95)';
    ov.innerHTML = `<img src="${src}" class="max-w-full max-h-full rounded-xl">`;
    ov.onclick = () => ov.remove();
    document.body.appendChild(ov);
}

async function sendChatMessage(photo) {
    const input = document.getElementById('familyChatInput');
    const btn = document.getElementById('familyChatSend');
    const text = input ? input.value.trim() : '';
    if (!text && !photo) return;
    if (btn) btn.disabled = true;
    try {
        const r = await chatCall({ type: 'chat_send', text, photo: photo || undefined });
        if (!r.ok) { shopAlert(r.error || "Yuborilmadi."); return; }
        if (input) input.value = '';
        if (photo) chatState.photos.set(r.message.id, photo);
        chatState.messages.set(r.message.id, r.message);
        chatState.lastSync = r.message.updatedAt > chatState.lastSync ? r.message.updatedAt : chatState.lastSync;
        renderChat();
        const thread = document.getElementById('familyChatThread');
        if (thread) thread.scrollTop = thread.scrollHeight;
    } catch (e) {
        console.error('chat_send:', e);
        shopAlert('Server javob bermadi.');
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function sendChatPhoto() {
    const photo = await pickImage();
    if (photo) sendChatMessage(photo);
}

async function chatDecide(kind, id, approve) {
    try {
        const r = await chatCall({ type: 'chat_decide', kind, id, approve });
        if (r.message) shopAlert(r.message);
        await syncChat(false);
    } catch (e) {
        shopAlert('Server javob bermadi.');
    }
}

/* ----------------------------------------------------- O'QILMAGAN BELGISI */

async function refreshChatBadge() {
    try {
        const r = await chatCall({ type: 'chat_unread' });
        document.querySelectorAll('.chat-unread-badge').forEach(b => {
            const n = r && r.ok ? r.unread : 0;
            b.textContent = n > 9 ? '9+' : String(n);
            b.classList.toggle('hidden', !n);
        });
    } catch (e) {}
}

(function initFamilyChat() {
    const start = () => {
        if (typeof currentAppRole === 'undefined') return setTimeout(start, 1000);
        refreshChatBadge();
        setInterval(() => { if (!document.hidden) refreshChatBadge(); }, 60000);
        // Bot xabaridagi "Chatni ochish" tugmasi: ?chat=1
        if (new URLSearchParams(window.location.search).get('chat') === '1') setTimeout(openFamilyChat, 1500);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(start, 3000));
    else setTimeout(start, 3000);
})();
