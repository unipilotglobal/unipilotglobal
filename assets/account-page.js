/* UNIPILOT GLOBAL: the Sign in / My account page. Plain JavaScript, no build step.
   Every query below is protected by the database's own rules (row level security), so even a changed copy of this
   file could only ever touch the signed-in person's own rows. */
(function () {
  'use strict';
  const C = window.CONFIG || {}, UP = window.UP, A = UP.acc, esc = A.esc;
  document.body.dataset.page = 'account';
  const $ = s => document.querySelector(s), root = () => $('#acct');
  const params = new URLSearchParams(location.search);
  const hashRaw = location.hash || '';
  const wantRecovery = /(^|[#&])type=recovery(&|$)/.test(hashRaw);          // read BEFORE the library clears the address
  const hashErr = (hashRaw.match(/error_description=([^&]+)/) || [])[1];
  const next = A.safeNext(params.get('next'));
  const VERSION = (C.legal && C.legal.updated) || 'current';                 // which privacy text the person agreed to
  const LABEL = { student: 'Student', pilot: 'Pilot', admin: 'Admin', finance: 'Finance', support: 'Support' };
  let sb = null, user = null, curUid = null, recovery = wantRecovery, mounted = false, redraw = null, finished = false;

  const head = (h, p) => { const a = $('#ah1'), b = $('#ap'); if (a) a.textContent = h; if (b) b.textContent = p || ''; };
  const say = (id, text, ok) => { const m = $(id); if (!m) return; m.className = 'w2 amsg ' + (ok ? 'ok' : 'bad'); m.textContent = text || ''; };
  const busy = (btn, v, txt) => { if (!btn) return; if (v) { btn.dataset.t = btn.textContent; btn.textContent = txt || 'Please wait…'; } else if (btn.dataset.t) btn.textContent = btn.dataset.t; btn.disabled = !!v; };
  const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  const friendly = A.friendly;

  // ------------------------------------------------------------------ signed out
  function showAuth(tab) {
    tab = tab || (params.get('mode') === 'signup' ? 'up' : 'in');
    head(tab === 'up' ? 'Create your free account' : 'Sign in', tab === 'up' ? 'Save scholarships, get deadline alerts and book pilots when booking opens.' : 'Welcome back. Pick up where you left off.');
    const err = hashErr ? '<p class="amsg bad">' + esc(decodeURIComponent(hashErr.replace(/\+/g, ' '))) + ' Please request a new link below.</p>' : '';
    const gb = A.google ? '<button type="button" class="gbtn" id="gg">' + A.GICON + '<span>Continue with Google</span></button><p class="gnote">By continuing you agree to the <a href="legal.html#privacy" target="_blank" rel="noopener">Privacy notice</a> and <a href="legal.html" target="_blank" rel="noopener">Terms</a>.</p><div class="or"><span>or with your email</span></div>' : '';
    root().innerHTML = '<div class="acol">' + gb + '<div class="atabs" role="tablist"><button type="button" class="chip' + (tab === 'in' ? ' on' : '') + '" data-tab="in" role="tab">Sign in</button><button type="button" class="chip' + (tab === 'up' ? ' on' : '') + '" data-tab="up" role="tab">Create account</button></div>' + err +
      (tab === 'in' ? `<form class="box f" id="fin" novalidate>
        <div class="w2"><label for="e1">Email</label><input id="e1" type="email" required autocomplete="email" inputmode="email"></div>
        <div class="w2"><label for="p1">Password</label><input id="p1" type="password" required autocomplete="current-password"></div>
        <div class="w2"><button class="btn lg" id="b1" type="submit">Sign in</button></div>
        <p class="w2 nav-note" style="margin:0"><a href="#" id="fg">Forgot password?</a> &middot; <a href="#" id="ml">Email me a sign-in link instead</a></p>
        <p class="w2 amsg" id="m1" role="status" aria-live="polite"></p></form>`
        : `<form class="box f" id="fup" novalidate>
        <div class="w2"><label for="n2">Full name</label><input id="n2" required autocomplete="name"></div>
        <div class="w2"><label for="e2">Email</label><input id="e2" type="email" required autocomplete="email" inputmode="email"></div>
        <div class="w2"><label for="p2">Password (at least 10 characters)</label><input id="p2" type="password" required minlength="10" autocomplete="new-password"></div>
        <div class="w2"><label style="font-weight:500"><input type="checkbox" id="k2" style="width:auto"> I have read the <a href="legal.html#privacy" target="_blank" rel="noopener">Privacy notice</a> and agree to the <a href="legal.html" target="_blank" rel="noopener">Terms</a>. *</label></div>
        <div class="w2"><label style="font-weight:500"><input type="checkbox" id="mk2" style="width:auto"> Email me deadline alerts and news (optional, you can change this any time)</label></div>
        <div class="w2"><button class="btn lg" id="b2" type="submit">Create my account</button></div>
        <p class="w2 amsg" id="m2" role="status" aria-live="polite"></p></form>`) + '</div>';
    root().querySelectorAll('[data-tab]').forEach(b => b.onclick = () => showAuth(b.dataset.tab));
    const gg = $('#gg'); if (gg) gg.onclick = async () => {
      try { localStorage.setItem('up_pc_any', JSON.stringify({ v: VERSION, t: Date.now() })); } catch (x) { }
      busy(gg, true, 'Opening Google…');
      try { const r = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: A.pageUrl('account.html' + (next ? '?next=' + encodeURIComponent(next) : '')) } }); if (r.error) throw r.error; }
      catch (x) { busy(gg, false); try { localStorage.removeItem('up_pc_any'); } catch (e) { } say(tab === 'up' ? '#m2' : '#m1', friendly(x)); }
    };
    if (tab === 'in') wireSignIn(); else wireSignUp();
  }

  function wireSignIn() {
    $('#fin').onsubmit = async ev => {
      ev.preventDefault(); const e = $('#e1').value.trim(), p = $('#p1').value;
      if (!isEmail(e) || !p) return say('#m1', 'Please enter your email and password.');
      const b = $('#b1'); busy(b, true, 'Signing in…'); say('#m1', '');
      try { const r = await sb.auth.signInWithPassword({ email: e, password: p }); if (r.error) throw r.error; } catch (x) { say('#m1', friendly(x)); busy(b, false); }
    };
    $('#fg').onclick = async ev => {
      ev.preventDefault(); const e = $('#e1').value.trim(); if (!isEmail(e)) return say('#m1', 'Type your email above first, then click "Forgot password?" again.');
      say('#m1', 'Sending…', true);
      try { const r = await sb.auth.resetPasswordForEmail(e, { redirectTo: A.pageUrl('account.html') }); if (r.error && /rate|too many|smtp|sending|authorized/i.test(r.error.message)) throw r.error; say('#m1', 'If that email has an account, a link to choose a new password is on its way. It can take a few minutes.', true); } catch (x) { say('#m1', friendly(x)); }
    };
    $('#ml').onclick = async ev => {
      ev.preventDefault(); const e = $('#e1').value.trim(); if (!isEmail(e)) return say('#m1', 'Type your email above first, then click the link again.');
      say('#m1', 'Sending…', true);
      try { const r = await sb.auth.signInWithOtp({ email: e, options: { shouldCreateUser: false, emailRedirectTo: A.pageUrl('account.html' + (next ? '?next=' + encodeURIComponent(next) : '')) } }); if (r.error && /rate|too many|smtp|sending|authorized/i.test(r.error.message)) throw r.error; say('#m1', 'If that email has an account, a sign-in link is on its way. It can take a few minutes. New here? Use "Create account".', true); } catch (x) { say('#m1', friendly(x)); }
    };
  }

  function wireSignUp() {
    $('#fup').onsubmit = async ev => {
      ev.preventDefault(); const n = $('#n2').value.trim(), e = $('#e2').value.trim(), p = $('#p2').value, mk = $('#mk2').checked;
      if (n.length < 2) return say('#m2', 'Please enter your full name.');
      if (!isEmail(e)) return say('#m2', 'Please enter a valid email address.');
      if (p.length < 10) return say('#m2', 'Please choose a password with at least 10 characters.');
      if (!$('#k2').checked) return say('#m2', 'Please tick the box to agree to the Privacy notice and Terms.');
      const b = $('#b2'); busy(b, true, 'Creating your account…'); say('#m2', '');
      try {
        const r = await sb.auth.signUp({ email: e, password: p, options: { data: { full_name: n }, emailRedirectTo: A.pageUrl('account.html' + (next ? '?next=' + encodeURIComponent(next) : '')) } });
        if (r.error) throw r.error;
        try { localStorage.setItem('up_pc', JSON.stringify({ e: e.toLowerCase(), v: VERSION, mk })); } catch (x) { }
        if (!r.data.session) { root().innerHTML = '<div class="acol"><div class="box c"><h3>Check your inbox</h3><p>We sent a confirmation link to <b>' + esc(e) + '</b>. Open it to finish creating your account. It can take a few minutes; please also look in your spam folder.</p><p class="mute"><a href="account.html">Back to sign in</a></p></div></div>'; head('Almost done', 'Confirm your email to finish.'); }
      } catch (x) { say('#m2', friendly(x)); busy(b, false); }
    };
  }

  // ------------------------------------------------------------------ password recovery
  function showRecovery() {
    head('Choose a new password', 'Pick something only you know, at least 10 characters.');
    root().innerHTML = `<div class="acol"><form class="box f" id="frc" novalidate>
      <div class="w2"><label for="rp">New password</label><input id="rp" type="password" required minlength="10" autocomplete="new-password"></div>
      <div class="w2"><button class="btn lg" id="rb" type="submit">Save new password</button></div><p class="w2 amsg" id="rm" role="status" aria-live="polite"></p></form></div>`;
    $('#frc').onsubmit = async ev => {
      ev.preventDefault(); const p = $('#rp').value; if (p.length < 10) return say('#rm', 'Please choose a password with at least 10 characters.');
      const b = $('#rb'); busy(b, true, 'Saving…');
      try { const r = await sb.auth.updateUser({ password: p }); if (r.error) throw r.error; recovery = false; try { history.replaceState(null, '', location.pathname); } catch (x) { } showDash(); } catch (x) { say('#rm', friendly(x)); busy(b, false); }
    };
  }

  // ------------------------------------------------------------------ signed in
  const tzList = () => { try { if (Intl.supportedValuesOf) return Intl.supportedValuesOf('timeZone'); } catch (e) { } return ['UTC', 'Europe/Warsaw', 'Europe/Berlin', 'Europe/London', 'Asia/Dhaka', 'Asia/Kolkata', 'Asia/Dubai', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney']; };
  const myTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } };
  const fmt = d => { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  const oppOf = ref => ((UP.D && UP.D.opps) || []).find(o => String(o.id) === String(ref));

  async function loadAll(uid) {
    const q = [
      sb.from('profiles').select('full_name,phone,country,timezone,marketing_opt_in,deleted_at').eq('id', uid).maybeSingle(),
      sb.from('user_roles').select('role').eq('user_id', uid),
      sb.from('consents').select('kind,version').eq('user_id', uid),
      sb.from('saved_items').select('kind,ref,created_at').eq('user_id', uid).order('created_at', { ascending: false }),
      sb.from('notification_prefs').select('email_deadlines,email_bookings,email_news').eq('user_id', uid).maybeSingle(),
      sb.from('notifications').select('id,title,body,link,created_at,read_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(15)];
    const r = await Promise.all(q), bad = r.find(x => x.error); if (bad) throw bad.error;
    return { pr: r[0].data, roles: (r[1].data || []).map(x => x.role), cons: r[2].data || [], saved: r[3].data || [], prefs: r[4].data, notes: r[5].data || [] };
  }

  async function showDash() {
    const uid = user.id; head('Your account', 'Loading…'); root().innerHTML = '<p class="mute">Loading your account…</p>';
    let d; try { d = await loadAll(uid); } catch (e) { head('Your account', ''); root().innerHTML = '<div class="acol"><div class="box c"><h3>We could not load your account</h3><p>' + esc(friendly(e)) + '</p><button class="btn" id="rt" type="button">Try again</button> <button class="btn out" id="so" type="button">Sign out</button></div></div>'; $('#rt').onclick = showDash; $('#so').onclick = () => sb.auth.signOut(); return; }
    if (!d.pr) { head('Your account', ''); root().innerHTML = '<div class="acol"><div class="box c"><h3>Your profile is not ready yet</h3><p>Please refresh in a minute. If this stays, email us at ' + esc(C.email) + '.</p><button class="btn out" id="so" type="button">Sign out</button></div></div>'; $('#so').onclick = () => sb.auth.signOut(); return; }
    if (d.pr.deleted_at) { await sb.auth.signOut({ scope: 'local' }); return showAuth(); }

    // record the agreement that was shown at sign-up (ticked box, or "by continuing" under the Google button), otherwise ask for it
    if (!d.cons.some(c => c.kind === 'privacy')) {
      await A.settle(sb, user);
      if (await A.consentOk(sb, uid)) return showDash();
      return showGate(uid);
    }
    if (next) { A.go(next); return; }            // came here from a "Save" button: go back to where they were
    draw(d);
  }

  const recordConsent = (uid, v, mk) => A.recordConsent(sb, uid, mk);

  function showGate(uid) {
    head('One quick step', 'Before you continue, please confirm how we may handle your details.');
    root().innerHTML = `<div class="acol"><form class="box f" id="fg2" novalidate><div class="w2"><label style="font-weight:500"><input type="checkbox" id="g1" style="width:auto"> I have read the <a href="legal.html#privacy" target="_blank" rel="noopener">Privacy notice</a> and agree to the <a href="legal.html" target="_blank" rel="noopener">Terms</a>. *</label></div>
      <div class="w2"><label style="font-weight:500"><input type="checkbox" id="g2" style="width:auto"> Email me deadline alerts and news (optional)</label></div>
      <div class="w2"><button class="btn lg" id="gb" type="submit">Agree and continue</button> <button class="btn out" id="gs" type="button">Sign out</button></div><p class="w2 amsg" id="gm" role="status" aria-live="polite"></p></form></div>`;
    $('#gs').onclick = () => sb.auth.signOut();
    $('#fg2').onsubmit = async ev => { ev.preventDefault(); if (!$('#g1').checked) return say('#gm', 'Please tick the box to continue.'); const b = $('#gb'); busy(b, true, 'Saving…'); const ok = await recordConsent(uid, VERSION, $('#g2').checked); if (ok) showDash(); else { say('#gm', 'Could not save your choice. Please try again.'); busy(b, false); } };
  }

  function draw(d) {
    const uid = user.id, first = (d.pr.full_name || '').split(' ')[0] || 'there', prefs = d.prefs || { email_deadlines: true, email_bookings: true, email_news: false };
    const tzs = tzList(), curTz = d.pr.timezone && d.pr.timezone !== 'UTC' ? d.pr.timezone : myTz(), staff = d.roles.some(r => ['admin', 'finance', 'support'].includes(r));
    head('Hello, ' + first, user.email || '');
    let notes = d.notes, saved = d.saved;
    const pills = d.roles.map(r => '<span class="pill' + (['admin', 'finance', 'support'].includes(r) ? ' gold' : '') + '">' + esc(LABEL[r] || r) + '</span>').join('');
    root().innerHTML = `
    <div class="adash">
      <div class="panel" style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between"><div>${pills}</div><button class="btn out sm" id="so" type="button">Sign out</button></div>

      <div class="panel"><h2>Saved scholarships</h2><div id="sv"></div></div>

      <div class="panel"><h2>Notifications</h2><div id="nt"></div></div>

      <div class="panel"><h2>My pilot sessions</h2><p class="mute" style="margin:0">Booking a pilot opens soon. Your upcoming and past sessions, receipts and reviews will appear here.</p></div>

      <form class="panel f" id="fpr" novalidate><h2 style="grid-column:1/-1;border:0;padding:0;margin:0 0 6px">Your profile</h2>
        <div><label for="pn">Full name</label><input id="pn" required autocomplete="name" value="${esc(d.pr.full_name)}"></div>
        <div><label for="pp">WhatsApp or phone (optional)</label><input id="pp" autocomplete="tel" placeholder="+48 …" value="${esc(d.pr.phone || '')}"></div>
        <div><label for="pc">Country (optional)</label><input id="pc" autocomplete="country-name" value="${esc(d.pr.country || '')}"></div>
        <div><label for="pt">Time zone</label><select id="pt">${tzs.map(z => '<option' + (z === curTz ? ' selected' : '') + '>' + esc(z) + '</option>').join('')}</select></div>
        <div class="w2"><label style="font-weight:500"><input type="checkbox" id="pm" style="width:auto"${d.pr.marketing_opt_in ? ' checked' : ''}> Email me news and offers (optional)</label></div>
        <div class="w2"><button class="btn" id="pb" type="submit">Save profile</button></div><p class="w2 amsg" id="pm2" role="status" aria-live="polite"></p></form>

      <div class="panel"><h2>Email alerts</h2><p class="mute" style="margin:0 0 8px">Choose what we may email you. Changes save instantly.</p>
        <label class="ck"><input type="checkbox" data-pref="email_deadlines"${prefs.email_deadlines ? ' checked' : ''}> Deadline reminders for scholarships I saved</label>
        <label class="ck"><input type="checkbox" data-pref="email_bookings"${prefs.email_bookings ? ' checked' : ''}> Messages about my pilot sessions</label>
        <label class="ck"><input type="checkbox" data-pref="email_news"${prefs.email_news ? ' checked' : ''}> News and new free materials</label><p class="amsg" id="pfm" role="status" aria-live="polite"></p></div>

      <div class="panel"><h2>Become a pilot</h2><p style="margin:0 0 12px">Won a scholarship or studied abroad? Pilots guide students one to one and are paid for their time. Tell us about yourself and we will send you the next steps.</p><a class="btn out" href="mailto:${esc(C.email)}?subject=Pilot%20application">Apply to become a pilot</a></div>
      ${staff ? '<div class="panel"><h2>Staff tools</h2><p class="mute" style="margin:0">You have staff access. Admin screens (approvals, money overview, messages to students) arrive in the next release.</p></div>' : ''}

      <div class="panel"><h2>Your data and privacy</h2><p class="mute" style="margin:0 0 12px">You can download everything we hold about you, or delete your account. <a href="legal.html#privacy">Read the Privacy notice</a>.</p>
        <button class="btn out sm" id="dl" type="button">Download my data</button> <button class="btn out sm" id="dx" type="button" style="color:#b3261e">Delete my account</button>
        <div id="dz" hidden style="margin-top:16px"><p style="margin:0 0 8px"><b>This cannot be undone.</b> Your saved items, alerts and profile details are erased, future sessions are cancelled, and your login email is removed. Records that the law requires us to keep (payments) stay without your name.</p>
        <label for="dt">Type DELETE to confirm</label><input id="dt" autocomplete="off" style="max-width:240px"> <button class="btn sm" id="dc" type="button" style="background:#b3261e;color:#fff;margin-top:8px">Delete my account for good</button></div><p class="amsg" id="dm" role="status" aria-live="polite"></p></div>
    </div>`;

    const drawSaved = () => { $('#sv').innerHTML = saved.length ? saved.map(s => { const o = s.kind === 'scholarship' ? oppOf(s.ref) : null; return '<div class="srow"><div>' + (o ? '<a href="opportunity.html?id=' + encodeURIComponent(o.id) + '"><b>' + esc(o.name) + '</b></a><small>Deadline: ' + esc(o.deadline || 'see official page') + '</small>' : '<b>' + esc(s.ref) + '</b><small>' + (s.kind === 'scholarship' ? 'No longer listed' : esc(s.kind)) + '</small>') + '</div><button type="button" class="btn out sm" data-rm="' + esc(s.kind + ':' + s.ref) + '">Remove</button></div>'; }).join('') : '<p class="mute" style="margin:0">Nothing saved yet. Open any scholarship and press <b>Save</b>. <a href="scholarships.html">Find scholarships &rarr;</a></p>'; };
    const drawNotes = () => { const un = notes.filter(n => !n.read_at).length; $('#nt').innerHTML = notes.length ? '<div class="nrow-h">' + (un ? '<b>' + un + ' new</b> <button type="button" class="btn out sm" id="mr">Mark all as read</button>' : '<span class="mute">All caught up</span>') + '</div>' + notes.map(n => { const l = A.safeNext(String(n.link || '').replace(/^\//, '')); return '<div class="nrow' + (n.read_at ? '' : ' new') + '"><b>' + esc(n.title) + '</b>' + (n.body ? '<p>' + esc(n.body) + '</p>' : '') + '<small>' + esc(fmt(n.created_at)) + '</small>' + (l ? ' <a href="' + esc(l) + '">Open</a>' : '') + '</div>'; }).join('') : '<p class="mute" style="margin:0">No notifications yet. Deadline reminders for scholarships you save will appear here.</p>'; const mr = $('#mr'); if (mr) mr.onclick = async () => { mr.disabled = true; const r = await sb.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', uid).is('read_at', null); if (!r.error) { notes = notes.map(n => n.read_at ? n : Object.assign({}, n, { read_at: new Date().toISOString() })); drawNotes(); } else mr.disabled = false; }; };
    drawSaved(); drawNotes(); redraw = drawSaved;
    $('#sv').onclick = async ev => { const b = ev.target.closest('[data-rm]'); if (!b) return; const k = b.dataset.rm, i = k.indexOf(':'); b.disabled = true; const r = await sb.from('saved_items').delete().eq('user_id', uid).eq('kind', k.slice(0, i)).eq('ref', k.slice(i + 1)); if (!r.error) { saved = saved.filter(s => s.kind + ':' + s.ref !== k); drawSaved(); } else b.disabled = false; };

    $('#so').onclick = () => sb.auth.signOut();
    $('#fpr').onsubmit = async ev => {
      ev.preventDefault(); const n = $('#pn').value.trim(), ph = $('#pp').value.trim(), co = $('#pc').value.trim(), tz = $('#pt').value;
      if (n.length < 2) return say('#pm2', 'Please enter your full name.');
      if (ph && !/^[+\d][\d\s\-()]{6,24}$/.test(ph)) return say('#pm2', 'Please enter a phone number with the country code, like +48 123 456 789.');
      const b = $('#pb'); busy(b, true, 'Saving…');
      const r = await sb.from('profiles').update({ full_name: n, phone: ph || null, country: co || null, timezone: tz, marketing_opt_in: $('#pm').checked }).eq('id', uid);
      busy(b, false); if (r.error) return say('#pm2', friendly(r.error)); say('#pm2', 'Saved.', true); head('Hello, ' + (n.split(' ')[0] || 'there'), user.email || '');
    };
    root().querySelectorAll('[data-pref]').forEach(c => c.onchange = async () => { const r = await sb.from('notification_prefs').update({ [c.dataset.pref]: c.checked }).eq('user_id', uid); if (r.error) { c.checked = !c.checked; say('#pfm', friendly(r.error)); } else say('#pfm', 'Saved.', true); });
    $('#dl').onclick = async () => {
      const b = $('#dl'); busy(b, true, 'Preparing…');
      try { const r = await sb.rpc('fn_export_my_data'); if (r.error) throw r.error; const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'unipilot-my-data.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); say('#dm', 'Your data file was downloaded.', true); } catch (e) { say('#dm', friendly(e)); }
      busy(b, false);
    };
    $('#dx').onclick = () => { $('#dz').hidden = !$('#dz').hidden; };
    $('#dc').onclick = async () => {
      if ($('#dt').value.trim() !== 'DELETE') return say('#dm', 'Please type DELETE in capital letters to confirm.');
      const b = $('#dc'); busy(b, true, 'Deleting…');
      try {
        const r = await sb.rpc('fn_delete_my_account'); if (r.error) throw r.error;
        finished = true; await sb.auth.signOut({ scope: 'local' }); try { localStorage.removeItem('up_pc'); } catch (e) { }
        head('Account deleted', 'Your account and sign-in were removed.'); root().innerHTML = '<div class="acol"><div class="box c"><h3>Your account was deleted</h3><p>Thank you for using ' + esc(C.brand) + '. You are welcome back any time.</p><a class="btn" href="index.html">Back to the home page</a></div></div>';
      } catch (e) { say('#dm', friendly(e)); busy(b, false); }
    };
  }

  // ------------------------------------------------------------------ start
  async function route() {
    if (finished) return;                                      // account was just deleted: keep the goodbye message
    const r = await sb.auth.getSession(), s = r && r.data && r.data.session;
    if (!s) { curUid = null; user = null; showAuth(); UP.acc.header(); return; }
    user = s.user; curUid = user.id; UP.acc.header();
    if (recovery) return showRecovery();
    await showDash();
  }
  async function start() {
    if (!A.on) { head('Accounts are not switched on yet', ''); root().innerHTML = '<div class="acol"><div class="box c"><h3>Coming soon</h3><p>You can still browse every scholarship and free material.</p><a class="btn" href="scholarships.html">Find scholarships</a></div></div>'; return; }
    root().innerHTML = '<p class="mute">Checking your sign-in…</p>';
    try { sb = await A.client(); } catch (e) { head('Sign-in is not available', ''); root().innerHTML = '<div class="acol"><div class="box c"><h3>Sign-in is not available right now</h3><p>Please refresh the page or try again in a few minutes. Everything else on the site still works.</p></div></div>'; return; }
    sb.auth.onAuthStateChange((ev, s) => {
      if (ev === 'INITIAL_SESSION' || ev === 'TOKEN_REFRESHED' || ev === 'USER_UPDATED') return;
      const uid = s && s.user ? s.user.id : null;
      if (ev === 'SIGNED_IN' && uid === curUid) return;
      if (ev === 'PASSWORD_RECOVERY') recovery = true;
      setTimeout(route, 0);                                  // never call the library from inside its own callback
    });
    route();
  }
  UP.boot('account', () => { if (mounted) { if (redraw) redraw(); return; } mounted = true; start(); });
})();
