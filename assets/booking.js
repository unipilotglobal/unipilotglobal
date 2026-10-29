/* UNIPILOT GLOBAL: calendar booking (loaded only when someone opens a booking).
   UP.book.open({ uuid, name, slug, photo, tz, fallback })   pick a session type, a day and a time, confirm
   UP.book.pay(sb, bookingId)                               goes to the secure payment page
   UP.book.cancel({ sb, booking, who, name })               cancel with the rules explained first
   UP.ics(booking)                                          "add to my calendar" file
   Everything private is decided by the database (who may book, which times are free, refunds). This file only asks and shows. */
(function () {
  'use strict';
  const C = window.CONFIG || {}, UP = window.UP = window.UP || {}, acc = UP.acc;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const myTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } };
  const okTz = z => { try { new Intl.DateTimeFormat('en', { timeZone: z }); return true; } catch (e) { return false; } };
  const fmt = (d, tz, o) => { try { return new Intl.DateTimeFormat('en-GB', Object.assign({ timeZone: tz }, o)).format(d); } catch (e) { return new Intl.DateTimeFormat('en-GB', o).format(d); } };
  const dayKey = (d, tz) => { try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); } catch (e) { return d.toISOString().slice(0, 10); } };
  const hm = (d, tz) => fmt(d, tz, { hour: '2-digit', minute: '2-digit', hour12: false });
  const longDay = (d, tz) => fmt(d, tz, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const money = (c, cur) => { try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur || 'EUR', minimumFractionDigits: c % 100 ? 2 : 0 }).format(c / 100); } catch (e) { return (c / 100).toFixed(2) + ' ' + (cur || 'EUR'); } };
  const iso = d => d.toISOString().slice(0, 10);
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const book = UP.book = UP.book || {};

  // ---------------------------------------------------------------- calendar file
  UP.ics = b => {
    const z = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''), t = s => String(s || '').replace(/[\\;,]/g, m => '\\' + m).replace(/\r?\n/g, '\\n');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//UniPilot Global//Booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', 'UID:' + (b.id || Date.now()) + '@unipilotglobal.com', 'DTSTAMP:' + z(new Date()),
      'DTSTART:' + z(b.starts_at), 'DTEND:' + z(b.ends_at), 'SUMMARY:' + t(b.title || 'UniPilot session'), 'DESCRIPTION:' + t(b.description || 'Your UniPilot Global session. Your pilot adds the meeting link in your dashboard.'),
      'URL:https://unipilotglobal.com/account.html', 'BEGIN:VALARM', 'TRIGGER:-PT1H', 'ACTION:DISPLAY', 'DESCRIPTION:Your session starts in one hour', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' }), a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'unipilot-session.ics'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => { try { URL.revokeObjectURL(a.href); } catch (e) { } }, 4000);
  };

  // ---------------------------------------------------------------- small helpers
  const token = async sb => { const r = await sb.auth.getSession(); return r && r.data && r.data.session ? r.data.session.access_token : null; };
  const fnUrl = n => String(C.supabaseUrl || '').replace(/\/$/, '') + '/functions/v1/' + n;
  async function callFn(sb, name, body) {
    const tk = await token(sb); if (!tk) throw new Error('Please sign in first');
    let r; try { r = await fetch(fnUrl(name), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tk, apikey: C.supabaseKey }, body: JSON.stringify(body || {}) }); } catch (e) { throw new Error('Connection problem. Please check your internet and try again.'); }
    let j = null; try { j = await r.json(); } catch (e) { }
    if (!r.ok) throw new Error((j && j.error) || 'Something went wrong. Please try again.');
    return j || {};
  }
  book.callFn = callFn;
  async function settings(sb) {
    const out = { cancel_hours: 24, unpaid_hold_minutes: 45, payments_enabled: false, manual_pay_enabled: false, manual_review_hours: 24, manual_min_hours: 12 };
    try { const r = await sb.from('app_settings').select('key,value').in('key', ['cancel_hours', 'unpaid_hold_minutes', 'payments_enabled', 'manual_pay_enabled', 'manual_review_hours', 'manual_min_hours']); (r.data || []).forEach(x => { out[x.key] = x.value; }); } catch (e) { }
    const on = v => v === true || v === 'true';
    out.payments_enabled = on(out.payments_enabled); out.manual_pay_enabled = on(out.manual_pay_enabled); out.cancel_hours = +out.cancel_hours || 24; out.unpaid_hold_minutes = +out.unpaid_hold_minutes || 45; out.manual_review_hours = +out.manual_review_hours || 24; out.manual_min_hours = +out.manual_min_hours || 12; return out;
  }
  book.settings = settings;
  const say = (d, t, ok) => { const m = d.querySelector('[data-msg]'); if (m) { m.className = 'amsg ' + (ok ? 'ok' : 'bad'); m.textContent = t || ''; } };
  const modal = (cls) => {
    const d = document.createElement('dialog'); d.className = 'm2 ' + (cls || ''); d.setAttribute('aria-modal', 'true'); document.body.appendChild(d);
    const shut = () => { try { d.close(); } catch (e) { d.removeAttribute('open'); } };
    d.addEventListener('close', () => setTimeout(() => d.remove(), 50)); d.addEventListener('cancel', () => { });
    d.addEventListener('click', e => { if (e.target.closest('[data-x]') || e.target === d) shut(); });
    const open = () => { try { d.showModal(); } catch (e) { d.setAttribute('open', ''); } };
    return { d, shut, open };
  };
  const X = '<button class="x" type="button" data-x aria-label="Close">&times;</button>';

  // ---------------------------------------------------------------- paying for a held booking: by card, or by bKash / Nagad / Rocket / bank with a transaction ID that our team checks
  const WAYS = {
    bkash: { name: 'bKash', how: 'Open your <b>bKash</b> app and choose <b>Send Money</b>.', from: 'The bKash number you sent from', ph: '01XXXXXXXXX', mobile: true },
    nagad: { name: 'Nagad', how: 'Open your <b>Nagad</b> app and choose <b>Send Money</b>.', from: 'The Nagad number you sent from', ph: '01XXXXXXXXX', mobile: true },
    rocket: { name: 'Rocket', how: 'Open your <b>Rocket</b> app (or dial *322#) and choose <b>Send Money</b>.', from: 'The Rocket number you sent from', ph: '01XXXXXXXXX', mobile: true },
    bank: { name: 'Bank transfer', how: 'Make a <b>bank transfer</b> (online banking, mobile banking or at the bank).', from: 'Your bank and the account holder\'s name', ph: 'For example: Dutch-Bangla Bank, Rahim Uddin', mobile: false }
  };
  const bdtFmt = n => '৳' + new Intl.NumberFormat('en-IN').format(n);
  const rateNote = () => '<a href="https://www.exchangerate-api.com" target="_blank" rel="noopener">Rates by Exchange Rate API</a>';
  const fxHtml = (c, cur) => { try { return UP.fx ? UP.fx.html(c, cur) : ''; } catch (e) { return ''; } };
  const copyText = async (t, btn) => {
    let ok = false; try { await navigator.clipboard.writeText(t); ok = true; } catch (e) { try { const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); ta.remove(); } catch (x) { } }
    if (btn) { const old = btn.textContent; btn.textContent = ok ? 'Copied' : 'Press and hold to copy'; setTimeout(() => { btn.textContent = old; }, 1600); }
  };
  /* P = { sb, d (the dialog), set(html), cfg, bk: { id, price_cents, currency, title }, name, close(), sent() } */
  function payFlow(P) {
    const sb = P.sb, bk = P.bk, cfg = P.cfg; let tick = null, ms = [];
    P.d.addEventListener('close', () => clearInterval(tick));
    const pageHead = (t, sub) => '<h3 class="pay-h">' + esc(t) + '</h3>' + (sub ? '<p class="mute pay-sub">' + sub + '</p>' : '');
    const priceHtml = () => '<b>' + esc(money(bk.price_cents, bk.currency)) + '</b> ' + fxHtml(bk.price_cents, bk.currency);
    const msg = t => say(P.d, t, false);
    const fail = (t, back) => { clearInterval(tick); P.set('<div class="dx-err"><b>This payment could not be started</b><p>' + esc(t) + '</p><p>' + (back ? '<button type="button" class="btn" data-back>Back</button> ' : '') + '<button type="button" class="btn out" data-x>Close</button></p></div>'); const b = P.d.querySelector('[data-back]'); if (b) b.onclick = back; };
    async function loadMethods() { if (!cfg.manual_pay_enabled) return []; try { const r = await sb.rpc('fn_manual_methods'); return r.error ? [] : (r.data || []); } catch (e) { return []; } }
    async function start() {
      P.set('<div class="bk-load" role="status"><span class="spin" aria-hidden="true"></span> Loading…</div>');
      ms = await loadMethods();
      let open = null; if (ms.length) { try { const r = await sb.from('manual_payments').select('id,method,status').eq('booking_id', bk.id).in('status', ['quoted', 'submitted']).maybeSingle(); open = r && r.data; } catch (e) { } }
      if (open && open.status === 'submitted') return manual(open.method);
      if (!cfg.payments_enabled && !ms.length) return fail('Online payment is not open yet. Please contact us and we will arrange it.');
      if (cfg.payments_enabled && !ms.length) return card(false);
      if (!cfg.payments_enabled && ms.length === 1) return manual(ms[0].method, false);
      choose();
    }
    function choose() {
      const hrs = +cfg.manual_review_hours || 24, n = UP.fx && UP.fx.bdt ? UP.fx.bdt(bk.price_cents, bk.currency) : null;
      P.set(pageHead('How would you like to pay?', priceHtml()) + '<div class="pay-opts">' +
        (cfg.payments_enabled ? '<button type="button" class="pay-opt" data-card><span><b>Pay by card</b><small>Visa, Mastercard and more · confirmed straight away</small></span><i aria-hidden="true">&rsaquo;</i></button>' : '') +
        ms.map(m => '<button type="button" class="pay-opt" data-m="' + esc(m.method) + '"><span><b>' + esc(m.label || (WAYS[m.method] || {}).name || m.method) + '</b><small>' + (m.method === 'bank' ? 'Transfer' : 'Send money') + (n ? ' ' + esc(bdtFmt(n)) : '') + ' and type the transaction ID · we confirm within ' + esc(hrs) + ' hours</small></span><i aria-hidden="true">&rsaquo;</i></button>').join('') + '</div>' +
        '<p class="pay-foot mute">Your time is held while you pay. ' + (n ? 'Taka amounts use today\'s rate. ' + rateNote() + '.' : '') + '</p>');
      P.d.querySelectorAll('.pay-opt').forEach(b => { b.onclick = () => b.hasAttribute('data-card') ? card(true) : manual(b.dataset.m, true); });
    }
    async function card(canBack) {
      P.set('<div class="bk-load" role="status"><span class="spin" aria-hidden="true"></span> Opening the secure payment page…</div>');
      try { const j = await callFn(sb, 'create-checkout', { booking_id: bk.id }); if (j.url) return acc.go(j.url); throw new Error('The payment page could not be opened. Please try again.'); }
      catch (e) { P.set('<div class="dx-err"><b>Your time is held, but the payment page did not open</b><p>' + esc(e.message || 'Please try again.') + '</p><p class="mute">The time stays reserved for ' + esc(cfg.unpaid_hold_minutes) + ' minutes. You can also pay from <a href="account.html#sessions">My sessions</a>.</p><p><button type="button" class="btn" data-retry>Try the payment again</button> ' + (canBack ? '<button type="button" class="btn out" data-back>Choose another way</button>' : '') + '</p></div>'); P.d.querySelector('[data-retry]').onclick = () => card(canBack); const b = P.d.querySelector('[data-back]'); if (b) b.onclick = choose; }
    }
    async function manual(method, canBack) {
      P.set('<div class="bk-load" role="status"><span class="spin" aria-hidden="true"></span> Preparing your payment details…</div>');
      let q; try { const r = await sb.rpc('fn_manual_quote', { p_booking: bk.id, p_method: method }); if (r.error) throw r.error; q = r.data; } catch (e) { return fail(String((e && e.message) || 'Please try again.'), canBack ? choose : null); }
      if (q.status === 'submitted') return waiting(q);
      instructions(q, canBack);
    }
    function instructions(q, canBack) {
      const W = WAYS[q.method] || WAYS.bank, a = q.account || {}, amt = bdtFmt(q.amount_bdt), label = a.label || W.name, hrs = +q.review_hours || +cfg.manual_review_hours || 24, until = Date.parse(q.hold_until);
      P.set(pageHead('Pay ' + amt + ' with ' + label, 'Follow these steps, then type the transaction ID below.') +
        '<div class="pay-amt"><div><small>Send exactly</small><b>' + esc(amt) + '</b></div><p class="mute">That is ' + esc(money(q.price_cents, q.currency)) + ' at ৳' + esc(Number(q.rate).toFixed(2)) + ' per ' + esc(String(q.currency).toUpperCase()) + ', today\'s rate. The taka amount is fixed for this payment.</p></div>' +
        '<ol class="pay-steps"><li>' + W.how + '</li>' +
        '<li>Send <b>' + esc(amt) + '</b> to this ' + (q.method === 'bank' ? 'account' : 'number') + ':<div class="pay-copy"><code>' + esc(a.number || '') + '</code><button type="button" class="btn out sm" data-copy="' + esc(a.number || '') + '">Copy</button></div>' +
        (a.name ? '<small class="mute">Account name: <b>' + esc(a.name) + '</b>' + (a.kind ? ' · ' + esc(a.kind) : '') + '</small>' : '') + (a.note ? '<small class="mute">' + esc(a.note) + '</small>' : '') + '</li>' +
        '<li>If it asks for a reference, write: <div class="pay-copy"><code>' + esc(q.reference) + '</code><button type="button" class="btn out sm" data-copy="' + esc(q.reference) + '">Copy</button></div></li>' +
        '<li>You get a message with a <b>Transaction ID</b> (TrxID). Type it here:</li></ol>' +
        '<form class="pay-form" novalidate><label for="ptrx">Transaction ID (TrxID)</label><input id="ptrx" maxlength="40" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="For example: 9H7AB12CDE">' +
        '<label for="psnd">' + esc(W.from) + '</label><input id="psnd" maxlength="60" autocomplete="off"' + (W.mobile ? ' inputmode="tel"' : '') + ' placeholder="' + esc(W.ph) + '">' +
        '<label for="pamt">Amount you sent (taka)</label><input id="pamt" inputmode="numeric" maxlength="9" autocomplete="off" value="' + esc(q.amount_bdt) + '">' +
        '<p class="pay-hold" role="timer"><span aria-hidden="true">&#9201;</span> Your time is held for <b data-left></b>. Once you send the ID it stays reserved while we check.</p>' +
        '<div class="bk-act"><button type="button" class="btn out" data-back>' + (canBack ? 'Choose another way' : 'Close') + '</button> <button type="submit" class="btn">I have paid. Send the transaction ID</button></div></form>' +
        '<p class="pay-foot mute">We check the money in our ' + esc(W.name) + ' account. This usually takes a few hours, and at most ' + esc(hrs) + ' hours. If something does not match, we tell you why and you can try again. ' + rateNote() + '.</p>');
      const left = P.d.querySelector('[data-left]'), upd = () => { const m = Math.ceil((until - Date.now()) / 60000); if (left) left.textContent = until && m > 0 ? m + ' more ' + (m === 1 ? 'minute' : 'minutes') : 'a few more minutes'; };
      upd(); clearInterval(tick); tick = setInterval(() => { if (!P.d.isConnected) return clearInterval(tick); upd(); }, 20000);
      P.d.querySelectorAll('[data-copy]').forEach(b => { b.onclick = () => copyText(b.dataset.copy, b); });
      P.d.querySelector('[data-back]').onclick = () => canBack ? choose() : P.close();
      const form = P.d.querySelector('.pay-form');
      form.onsubmit = async ev => {
        ev.preventDefault(); const trx = P.d.querySelector('#ptrx').value.trim(), snd = P.d.querySelector('#psnd').value.trim(), sent = parseInt(String(P.d.querySelector('#pamt').value).replace(/[^\d]/g, ''), 10), btn = form.querySelector('[type=submit]');
        if (trx.replace(/[\s-]/g, '').length < 6) return msg('Please type the Transaction ID from your payment message.');
        if (!snd) return msg(W.mobile ? 'Please type the mobile number you sent the money from.' : 'Please write your bank and the account holder\'s name.');
        if (!(sent > 0)) return msg('Please type the amount you sent, in taka.');
        const label0 = btn.textContent; btn.disabled = true; btn.textContent = 'Sending…'; say(P.d, '', true);
        try { const r = await sb.rpc('fn_submit_manual_payment', { p_claim: q.claim_id, p_trx: trx, p_sender: snd, p_sent_bdt: sent }); if (r.error) throw r.error; }
        catch (e) { btn.disabled = false; btn.textContent = label0; return msg(String((e && e.message) || 'Could not send. Please try again.')); }
        try { P.sent(); } catch (e) { } waiting(Object.assign({}, q, { status: 'submitted', trx_id: String(trx).toUpperCase().replace(/[\s-]/g, '') }));
      };
    }
    function waiting(q) {
      clearInterval(tick); const hrs = +q.review_hours || +cfg.manual_review_hours || 24, W = WAYS[q.method] || WAYS.bank;
      P.set('<div class="bk-ok"><div class="adok" aria-hidden="true">&#10003;</div><h2>Thank you! We are checking your payment</h2><p>' + (q.trx_id ? 'Transaction ID <b>' + esc(q.trx_id) + '</b><br>' : '') + esc(bdtFmt(q.amount_bdt)) + ' by ' + esc(W.name) + '</p>' +
        '<p class="mute">We confirm your session as soon as we see the money in our account. This usually takes a few hours, and at most ' + esc(hrs) + ' hours. Your time stays reserved. We will tell you here and by email. You do not need to do anything else.</p>' +
        '<div class="bk-act"><a class="btn" href="account.html#sessions" data-done>Go to my sessions</a> <button type="button" class="btn out" data-x>Close</button></div></div>');
      const a = P.d.querySelector('[data-done]'); if (a) a.addEventListener('click', () => { P.close(); });
    }
    return { start };
  }
  book.payFlow = payFlow;

  // ---------------------------------------------------------------- the booking dialog
  book.open = function (o) {
    o = o || {};
    return new Promise(resolve => {
      const M = modal('bk'), d = M.d; d.addEventListener('close', () => resolve(st.done || null));
      const tz = o.tz && okTz(o.tz) ? o.tz : '', me = myTz(), cfg = { cancel_hours: 24, unpaid_hold_minutes: 45, payments_enabled: false, manual_pay_enabled: false, manual_review_hours: 24, manual_min_hours: 12 };
      const st = { sb: null, services: [], svc: null, month: null, cache: {}, sel: null, slot: null, note: '', done: null, busy: false };
      const today = () => dayKey(new Date(), me);
      const payOpen = () => cfg.payments_enabled || cfg.manual_pay_enabled, fxh = (c, cur) => fxHtml(c, cur);
      const steps = n => '<ol class="bk-steps" aria-label="Steps">' + ['Session', 'Time', 'Confirm'].map((s, i) => '<li class="' + (i + 1 === n ? 'on' : i + 1 < n ? 'dn' : '') + '"><span>' + (i + 1) + '</span>' + s + '</li>').join('') + '</ol>';
      const head = n => '<div class="bk-h"><div class="bk-av">' + (o.photo && /^https:\/\//i.test(o.photo) ? '<img src="' + esc(o.photo) + '" alt="" width="44" height="44">' : esc(String(o.name || '?').trim().slice(0, 1).toUpperCase())) + '</div><div><h2>Book a session</h2><p class="mute">with <b>' + esc(o.name || 'your pilot') + '</b></p></div></div>' + (n ? steps(n) : '');
      const body = (n, html) => { d.innerHTML = X + '<div class="in bk-in">' + head(n) + '<div class="bk-b">' + html + '</div><p class="amsg" data-msg role="status" aria-live="polite"></p></div>'; };
      const fallbackBtn = () => o.fallback ? '<button type="button" class="btn out" data-fb>Send a session request instead</button>' : '';
      const wireFb = () => { const b = d.querySelector('[data-fb]'); if (b) b.onclick = () => { M.shut(); try { o.fallback(); } catch (e) { } }; };
      const loading = t => body(0, '<div class="bk-load" role="status"><span class="spin" aria-hidden="true"></span> ' + esc(t || 'Loading…') + '</div>');
      const oops = (t, retry) => { body(0, '<div class="dx-err"><b>We could not load this</b><p>' + esc(t) + '</p><p>' + (retry ? '<button type="button" class="btn sm" data-retry>Try again</button> ' : '') + fallbackBtn() + '</p></div>'); const r = d.querySelector('[data-retry]'); if (r) r.onclick = retry; wireFb(); };

      // ---- step 1: choose the kind of session
      const stepService = () => {
        const L = st.services;
        body(1, '<p class="mute" style="margin:0 0 12px">Choose what you need. Prices are per session.</p><div class="bk-svc" role="radiogroup" aria-label="Session type">' + L.map(s => {
          const req = s.price_cents > 0 && !payOpen();
          return '<label class="bk-card' + (st.svc && st.svc.id === s.id ? ' on' : '') + '"><input type="radio" name="svc" value="' + esc(s.id) + '"' + (st.svc && st.svc.id === s.id ? ' checked' : '') + '><span class="bk-t"><b>' + esc(s.title) + '</b><small>' + esc(s.duration_min) + ' minutes' + (req ? ' · online payment opens soon' : '') + '</small></span><span class="bk-p' + (s.price_cents ? '' : ' free') + '">' + (s.price_cents ? esc(money(s.price_cents, s.currency)) + fxh(s.price_cents, s.currency) : 'Free') + '</span></label>';
        }).join('') + '</div><div class="bk-act"><button type="button" class="btn" data-next disabled>Choose a time</button></div>');
        const nx = d.querySelector('[data-next]'); if (st.svc) nx.disabled = false;
        d.querySelector('.bk-svc').onchange = e => { const s = L.find(x => x.id === e.target.value); if (!s) return; st.svc = s; st.cache = {}; st.sel = null; st.slot = null; st.month = null; nx.disabled = false; d.querySelectorAll('.bk-card').forEach(c => c.classList.toggle('on', c.contains(e.target))); };
        nx.onclick = () => stepTime();
      };

      // ---- step 2: day and time (shown in the student's own time zone)
      const monthKey = (y, m) => y + '-' + String(m + 1).padStart(2, '0');
      async function loadMonth(y, m) {
        const k = st.svc.id + ':' + monthKey(y, m); if (st.cache[k]) return st.cache[k];
        const from = new Date(Date.UTC(y, m, 1) - 864e5), to = new Date(Date.UTC(y, m + 1, 0) + 864e5);
        const r = await st.sb.rpc('fn_available_slots', { p_service: st.svc.id, p_from: iso(from), p_to: iso(to) }); if (r.error) throw r.error;
        const by = {}; (r.data || []).forEach(x => { const dt = new Date(x.starts_at), key = dayKey(dt, me); (by[key] = by[key] || []).push(x); });
        Object.keys(by).forEach(k2 => by[k2].sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at)));
        return (st.cache[k] = by);
      }
      const early = html => { body(2, html); const b = d.querySelector('[data-back]'); if (b) b.onclick = () => stepService(); wireFb(); };
      async function stepTime(note) {
        if (st.svc.price_cents > 0 && !payOpen()) { return early('<div class="dx-card bk-note"><b>Online payment opens very soon</b><p class="mute" style="margin:6px 0 0">Paid sessions will be booked here with a card or bKash. Until then, send us a short request and we will arrange it with ' + esc(o.name || 'your pilot') + '.</p></div><div class="bk-act"><button type="button" class="btn out" data-back>Back</button> ' + fallbackBtn() + '</div>'); }
        if (!st.month) { const t = today().split('-').map(Number); st.month = { y: t[0], m: t[1] - 1 }; st.auto = true; }
        loading('Finding free times…');
        let by; try { by = await loadMonth(st.month.y, st.month.m); } catch (e) { return oops('Please check your internet connection and try again.', () => stepTime()); }
        // jump to the first month that has a free time (at most 3 months)
        if (st.auto) { let tries = 0; const inM = x => Object.keys(x).some(k => k >= today() && k.slice(0, 7) === monthKey(st.month.y, st.month.m)); while (!inM(by) && tries < 2) { tries++; const n = new Date(Date.UTC(st.month.y, st.month.m + 1, 1)); st.month = { y: n.getUTCFullYear(), m: n.getUTCMonth() }; try { by = await loadMonth(st.month.y, st.month.m); } catch (e) { return oops('Please check your internet connection and try again.', () => stepTime()); } } st.auto = false; }
        const keys = Object.keys(by).filter(k => k >= today()).sort(), inMonth = keys.some(k => k.slice(0, 7) === monthKey(st.month.y, st.month.m));
        if (!inMonth) {
          const any = Object.keys(st.cache).some(c => c.startsWith(st.svc.id + ':') && Object.keys(st.cache[c]).some(k => k >= today()));
          if (!any) return early('<div class="dx-card bk-note"><b>No free times in the next weeks</b><p class="mute" style="margin:6px 0 0">' + esc(o.name || 'This pilot') + ' has no open times right now. Send a short request and we will find a time that works.</p></div><div class="bk-act">' + (L1() ? '<button type="button" class="btn out" data-back>Back</button> ' : '') + fallbackBtn() + '</div>');
        }
        if (!st.sel || !by[st.sel]) st.sel = keys.find(k => k.slice(0, 7) === monthKey(st.month.y, st.month.m)) || null;
        const first = new Date(Date.UTC(st.month.y, st.month.m, 1)), lead = (first.getUTCDay() + 6) % 7, days = new Date(Date.UTC(st.month.y, st.month.m + 1, 0)).getUTCDate();
        const cur = new Date(); const minM = new Date(Date.UTC(+today().slice(0, 4), +today().slice(5, 7) - 1, 1)), thisM = Date.UTC(st.month.y, st.month.m, 1);
        const canPrev = thisM > minM.getTime(), canNext = thisM < Date.UTC(minM.getUTCFullYear(), minM.getUTCMonth() + 2, 1);
        let cells = ''; for (let i = 0; i < lead; i++) cells += '<span></span>';
        for (let n = 1; n <= days; n++) { const k = monthKey(st.month.y, st.month.m) + '-' + String(n).padStart(2, '0'), has = !!by[k] && k >= today(); cells += '<button type="button" class="bk-day' + (has ? ' has' : '') + (k === st.sel ? ' on' : '') + (k === today() ? ' today' : '') + '" data-k="' + k + '"' + (has ? '' : ' disabled') + ' aria-label="' + (has ? 'Choose ' : '') + n + ' ' + MONTHS[st.month.m] + (has ? '' : ', no free time') + '">' + n + '</button>'; }
        const sl = st.sel && by[st.sel] ? by[st.sel] : [];
        body(2, '<p class="mute" style="margin:0 0 10px"><b>' + esc(st.svc.title) + '</b> · ' + esc(st.svc.duration_min) + ' min · ' + (st.svc.price_cents ? esc(money(st.svc.price_cents, st.svc.currency)) + fxh(st.svc.price_cents, st.svc.currency) : 'Free') + (note ? ' · <span class="bad">' + esc(note) + '</span>' : '') + '</p>' +
          '<div class="bk-cal"><div class="bk-cal-h"><button type="button" class="bk-nav" data-m="-1" aria-label="Previous month"' + (canPrev ? '' : ' disabled') + '>&lsaquo;</button><b>' + MONTHS[st.month.m] + ' ' + st.month.y + '</b><button type="button" class="bk-nav" data-m="1" aria-label="Next month"' + (canNext ? '' : ' disabled') + '>&rsaquo;</button></div>' +
          '<div class="bk-wd" aria-hidden="true"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div><div class="bk-grid">' + cells + '</div></div>' +
          '<p class="bk-tz mute">Times are in <b>your time zone</b> (' + esc(me) + ').</p>' +
          (sl.length ? '<h3 class="bk-dh">' + esc(longDay(new Date(sl[0].starts_at), me)) + '</h3><div class="bk-slots" role="group" aria-label="Free times">' + sl.map(x => '<button type="button" class="bk-slot' + (st.slot === x.starts_at ? ' on' : '') + '" data-t="' + esc(x.starts_at) + '">' + esc(hm(new Date(x.starts_at), me)) + '</button>').join('') + '</div>' : '<p class="mute">Choose a highlighted day to see the free times.</p>') +
          '<div class="bk-act">' + (L1() ? '<button type="button" class="btn out" data-back>Back</button> ' : '') + '<button type="button" class="btn" data-next' + (st.slot ? '' : ' disabled') + '>Continue</button></div>');
        d.querySelector('.bk-cal').onclick = e => { const n = e.target.closest('[data-m]'), dy = e.target.closest('.bk-day'); if (n && !n.disabled) { const nm = new Date(Date.UTC(st.month.y, st.month.m + +n.dataset.m, 1)); st.month = { y: nm.getUTCFullYear(), m: nm.getUTCMonth() }; st.sel = null; st.slot = null; stepTime(); } else if (dy && !dy.disabled) { st.sel = dy.dataset.k; st.slot = null; stepTime(); } };
        const sbx = d.querySelector('.bk-slots'); if (sbx) sbx.onclick = e => { const b = e.target.closest('.bk-slot'); if (!b) return; st.slot = b.dataset.t; sbx.querySelectorAll('.bk-slot').forEach(x => x.classList.toggle('on', x === b)); d.querySelector('[data-next]').disabled = false; };
        const bk = d.querySelector('[data-back]'); if (bk) bk.onclick = () => stepService(); wireFb();
        d.querySelector('[data-next]').onclick = () => stepConfirm();
      }
      const L1 = () => st.services.length > 1;

      // ---- step 3: confirm
      function stepConfirm(err) {
        const s = st.svc, t0 = new Date(st.slot), t1 = new Date(t0.getTime() + s.duration_min * 60000), paid = s.price_cents > 0;
        body(3, '<div class="bk-sum"><div><small>Session</small><b>' + esc(s.title) + '</b><span>' + esc(s.duration_min) + ' minutes with ' + esc(o.name || 'your pilot') + '</span></div><div><small>When (your time)</small><b>' + esc(longDay(t0, me)) + '</b><span>' + esc(hm(t0, me)) + ' to ' + esc(hm(t1, me)) + ' (' + esc(me) + ')</span></div>' + (tz && tz !== me ? '<div><small>Pilot\'s local time</small><span>' + esc(hm(t0, tz)) + ' to ' + esc(hm(t1, tz)) + ' (' + esc(tz) + ')</span></div>' : '') + '<div><small>Price</small><b>' + (paid ? esc(money(s.price_cents, s.currency)) + fxh(s.price_cents, s.currency) : 'Free') + '</b></div></div>' +
          '<label for="bkn" class="bk-l">What would you like help with? <span class="mute">(optional, helps your pilot prepare)</span></label><textarea id="bkn" rows="3" maxlength="1000" placeholder="For example: I have a Bachelor\'s in Education and want feedback on my motivation letter for DAAD.">' + esc(st.note) + '</textarea>' +
          '<p class="bk-pol mute">' + (paid ? (cfg.payments_enabled && cfg.manual_pay_enabled ? 'On the next page you choose how to pay: by card, or by bKash and similar (you type the transaction ID and we check it). ' : cfg.manual_pay_enabled ? 'On the next page you pay by bKash or similar and type the transaction ID. We check it and confirm your session. ' : 'You pay securely by card on the next page. ') + (UP.fx && UP.fx.rate(s.currency) ? 'Taka amounts use today\'s exchange rate (' + rateNote() + '). ' : '') : '') + 'Free cancellation until <b>' + esc(cfg.cancel_hours) + ' hours</b> before the session' + (paid ? ' (full refund)' : '') + '. ' + (paid ? 'After that the session is not refunded. ' : 'Please cancel if you cannot come, so another student can take the time. ') + 'By booking you accept our <a href="legal.html" target="_blank" rel="noopener">Terms</a> and <a href="legal.html#privacy" target="_blank" rel="noopener">Privacy notice</a>.</p>' +
          '<div class="bk-act"><button type="button" class="btn out" data-back>Back</button> <button type="button" class="btn" data-go>' + (paid ? 'Continue to payment' : 'Confirm booking') + '</button></div>');
        if (err) say(d, err, false);
        d.querySelector('[data-back]').onclick = () => { st.note = d.querySelector('#bkn').value; stepTime(); };
        d.querySelector('[data-go]').onclick = go;
      }
      async function go() {
        if (st.busy) return; st.note = d.querySelector('#bkn').value.trim(); const b = d.querySelector('[data-go]'), label = b.textContent; st.busy = true; b.disabled = true; b.textContent = 'Please wait…';
        const fail = (t, back) => { st.busy = false; if (back) { st.cache = {}; st.slot = null; stepTime(t); } else { b.disabled = false; b.textContent = label; say(d, t, false); } };
        try {
          let sess = (await st.sb.auth.getSession()).data.session;
          if (!sess) { const r = await acc.need({ title: 'Sign in to book', lead: 'We keep your booking, reminders and meeting link in your free account.', mode: 'in' }); if (!r) return fail('Please sign in to finish your booking.'); st.sb = r.sb || st.sb; }
          const r = await st.sb.rpc('book_session', { p_service: st.svc.id, p_starts: st.slot, p_note: st.note || null });
          if (r.error) { const m = String(r.error.message || ''), gone = /not available/i.test(m); return fail(gone ? 'Sorry, that time was just taken. Please choose another.' : (m || 'Could not book. Please try again.'), gone); }
          const id = r.data, t0 = new Date(st.slot), t1 = new Date(t0.getTime() + st.svc.duration_min * 60000);
          if (st.svc.price_cents > 0) { st.busy = false; st.held = id; return stepPay(id); }
          st.busy = false; st.done = { id, free: true }; stepDone(id, t0, t1);
        } catch (e) { fail(acc.friendly ? acc.friendly(e) : String(e.message || e)); }
      }
      function stepPay(id) {
        body(0, '<div class="pay-box"></div>'); const box = d.querySelector('.pay-box');
        payFlow({ sb: st.sb, d, cfg, bk: { id, price_cents: st.svc.price_cents, currency: st.svc.currency, title: st.svc.title }, name: o.name, close: M.shut,
          set: html => { box.innerHTML = html; const m = d.querySelector('[data-msg]'); if (m) m.textContent = ''; }, sent: () => { st.done = { id, manual: true }; } }).start();
      }
      function stepDone(id, t0, t1) {
        body(0, '<div class="bk-ok"><div class="adok" aria-hidden="true">&#10003;</div><h2>You are booked!</h2><p>' + esc(st.svc.title) + ' with <b>' + esc(o.name || 'your pilot') + '</b><br>' + esc(longDay(t0, me)) + ', ' + esc(hm(t0, me)) + ' to ' + esc(hm(t1, me)) + ' (' + esc(me) + ')</p><p class="mute">We emailed you the details. Your pilot adds the meeting link in your dashboard, and we remind you 24 hours and 1 hour before.</p><div class="bk-act"><button type="button" class="btn out" data-ics>Add to my calendar</button> <a class="btn" href="account.html#sessions">Go to my sessions</a></div></div>');
        d.querySelector('[data-ics]').onclick = () => UP.ics({ id, starts_at: t0.toISOString(), ends_at: t1.toISOString(), title: st.svc.title + ' with ' + (o.name || 'your UniPilot pilot') });
      }

      // ---- start: load the pilot's session types
      async function start() {
        loading('Loading…'); M.open();
        try {
          st.sb = await acc.client(); const sg = await settings(st.sb); Object.assign(cfg, sg); try { if (UP.fx) await Promise.race([UP.fx.ready(), new Promise(r => setTimeout(r, 2500))]); } catch (e) { }
          let r; if (o.services) r = { data: o.services }; else { r = await st.sb.from('pilot_services').select('id,title,duration_min,price_cents,currency').eq('pilot_id', o.uuid).eq('active', true).order('price_cents', { ascending: true }).order('duration_min', { ascending: true }); if (r.error) throw r.error; }
          st.services = r.data || [];
          if (!st.services.length) return body(0, '<div class="dx-card bk-note"><b>' + esc(o.name || 'This pilot') + ' has not opened online booking yet</b><p class="mute" style="margin:6px 0 0">Send a short request and we will arrange a session for you.</p></div><div class="bk-act">' + fallbackBtn() + '</div>'), wireFb();
          if (o.service) st.svc = st.services.find(x => x.id === o.service) || null;
          if (st.services.length === 1) st.svc = st.services[0];
          if (st.svc && (st.services.length === 1 || o.service)) stepTime(); else stepService();
        } catch (e) { oops('Please check your internet connection and try again.', start); }
      }
      start();
    });
  };

  // ---------------------------------------------------------------- pay for a held booking (from "My sessions"). `booking` is the booking row (or its id). Resolves when the person closes the window; { sent: true } if a transaction ID was sent.
  book.pay = async function (sb, booking, extra) {
    extra = extra || {}; const cfg = await settings(sb); try { if (UP.fx) await Promise.race([UP.fx.ready(), new Promise(r => setTimeout(r, 2500))]); } catch (e) { }
    let b = booking && typeof booking === 'object' ? booking : null;
    if (!b) { const r = await sb.from('bookings').select('id,price_cents,currency').eq('id', booking).maybeSingle(); b = r && r.data; if (!b) throw new Error('We could not find this booking.'); }
    return new Promise(resolve => {
      const M = modal('bk sm'), d = M.d; let sent = false; d.addEventListener('close', () => resolve(sent ? { sent: true } : null));
      d.innerHTML = X + '<div class="in bk-in"><div class="bk-h"><div><h2>Pay for your session</h2><p class="mute">' + esc([extra.title, extra.name ? 'with ' + extra.name : ''].filter(Boolean).join(' ')) + '</p></div></div><div class="bk-b pay-box"></div><p class="amsg" data-msg role="status" aria-live="polite"></p></div>';
      M.open(); const box = d.querySelector('.pay-box');
      payFlow({ sb, d, cfg, bk: { id: b.id, price_cents: b.price_cents, currency: b.currency, title: extra.title }, name: extra.name, close: M.shut, set: html => { box.innerHTML = html; const m = d.querySelector('[data-msg]'); if (m) m.textContent = ''; }, sent: () => { sent = true; } }).start();
    });
  };

  // ---------------------------------------------------------------- cancel (student or pilot). Resolves with the result text, or null if the person changed their mind.
  book.cancel = function (o) {
    return new Promise(async resolve => {
      const b = o.booking, byPilot = o.who === 'pilot', sg = await settings(o.sb), start = new Date(b.starts_at), hours = (start - Date.now()) / 36e5, paid = b.price_cents > 0, held = b.status === 'requested';
      const refundOk = byPilot || held || hours >= sg.cancel_hours;
      const text = byPilot ? (paid ? 'The student receives a full refund automatically, and is told that you cancelled.' : 'The student is told that you cancelled.')
        : held ? 'You have not paid yet, so nothing is charged and the time is released.'
        : paid ? (refundOk ? 'The session starts in more than ' + sg.cancel_hours + ' hours, so you get a full refund (to your card in 5 to 10 days, or back to your bKash or bank account if you paid that way).' : 'The session starts in less than ' + sg.cancel_hours + ' hours, so it can no longer be refunded. You can still cancel to free the time for others.')
          : 'Your pilot is told, and the time becomes free for another student.';
      const M = modal('bk sm'), d = M.d; let did = false; d.addEventListener('close', () => { if (!did) resolve(null); });
      d.innerHTML = X + '<div class="in bk-in"><h2 style="margin:0 0 8px">Cancel this session?</h2><p style="margin:0 0 6px"><b>' + esc(o.name || 'Session') + '</b><br><span class="mute">' + esc(fmt(start, myTz(), { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })) + ' (' + esc(myTz()) + ')</span></p><p class="mute">' + esc(text) + '</p><label for="bkr" class="bk-l">Reason ' + (byPilot ? '(shown to the student)' : '(optional)') + '</label><textarea id="bkr" rows="2" maxlength="300"></textarea><p class="amsg" data-msg role="status" aria-live="polite"></p><div class="bk-act"><button type="button" class="btn out" data-no>Keep the session</button> <button type="button" class="btn" data-yes style="background:#b3261e;border-color:#b3261e;color:#fff">Yes, cancel it</button></div></div>';
      M.open(); d.querySelector('[data-no]').onclick = () => M.shut();
      d.querySelector('[data-yes]').onclick = async ev => {
        const btn = ev.target, reason = d.querySelector('#bkr').value.trim(); if (byPilot && reason.length < 3) return say(d, 'Please tell the student why (a few words).', false);
        btn.disabled = true; btn.textContent = 'Cancelling…';
        try {
          const r = await o.sb.rpc('fn_cancel_booking', { p_booking: b.id, p_reason: reason || null }); if (r.error) throw r.error;
          let msg = r.data === 'refund_manual' ? (byPilot ? 'Cancelled. Our team will send the student\'s refund by hand.' : 'Cancelled. We will send your refund back to the account you paid from, and tell you when it is on its way.') : r.data === 'refund_due' ? 'Cancelled. Your refund is being sent to your card.' : r.data === 'no_refund' ? 'Cancelled. This session was inside the no-refund window.' : 'Cancelled.';
          if (r.data === 'refund_due') { try { const j = await callFn(o.sb, 'refund-payment', { booking_id: b.id }); if (j.status === 'refunded') msg = byPilot ? 'Cancelled. The student has been refunded.' : 'Cancelled. Your refund has been sent. It can take 5 to 10 days to reach your card.'; else msg = 'Cancelled. The refund is being processed by our team and you will get an email.'; } catch (e) { msg = 'Cancelled. The refund is being processed by our team and you will get an email.'; } }
          did = true; M.shut(); resolve(msg);
        } catch (e) { btn.disabled = false; btn.textContent = 'Yes, cancel it'; say(d, (e && e.message) || 'Could not cancel. Please try again.', false); }
      };
    });
  };
})();
