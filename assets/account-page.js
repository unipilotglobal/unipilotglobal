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
  let as = params.get('as') === 'pilot' ? 'pilot' : 'student';          // which door the person chose: student or pilot
  function showAuth(tab) {
    tab = tab || (params.get('mode') === 'signup' ? 'up' : 'in'); const pilot = as === 'pilot';
    head(pilot ? (tab === 'up' ? 'Apply to become a pilot' : 'Pilot sign in') : (tab === 'up' ? 'Create your free account' : 'Sign in'), pilot ? (tab === 'up' ? 'Create your account and pilot profile. Our team checks every profile before it goes live.' : 'Guide students, set your prices and hours, and get paid.') : (tab === 'up' ? 'Save scholarships, get deadline alerts and book pilots when booking opens.' : 'Welcome back. Pick up where you left off.'));
    const err = hashErr ? '<p class="amsg bad">' + esc(decodeURIComponent(hashErr.replace(/\+/g, ' '))) + ' Please request a new link below.</p>' : '';
    const gb = A.google && !(pilot && tab === 'up') ? '<button type="button" class="gbtn" id="gg">' + A.GICON + '<span>Continue with Google</span></button><p class="gnote">By continuing you agree to the <a href="legal.html#privacy" target="_blank" rel="noopener">Privacy notice</a> and <a href="legal.html" target="_blank" rel="noopener">Terms</a>.</p><div class="or"><span>or with your email</span></div>' : '';
    const door = '<div class="dx-doors" role="tablist" aria-label="I am a"><button type="button" role="tab" aria-selected="' + !pilot + '" class="dx-door' + (pilot ? '' : ' on') + '" data-as="student"><b>I am a student</b><small>Find scholarships, track applications, talk to a pilot</small></button><button type="button" role="tab" aria-selected="' + pilot + '" class="dx-door' + (pilot ? ' on' : '') + '" data-as="pilot"><b>I am a pilot</b><small>Guide students, set your prices, get paid</small></button></div>';
    const note = pilot && tab === 'in' ? '<p class="dx-hint">Did UniPilot Global send you a login? Enter it below. The first time, we will ask you to choose your own password.</p>' : '';
    root().innerHTML = '<div class="acol">' + door + gb + '<div class="atabs" role="tablist"><button type="button" class="chip' + (tab === 'in' ? ' on' : '') + '" data-tab="in" role="tab">Sign in</button><button type="button" class="chip' + (tab === 'up' ? ' on' : '') + '" data-tab="up" role="tab">' + (pilot ? 'Apply as a pilot' : 'Create account') + '</button></div>' + err + note +
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
        <div class="w2"><button class="btn lg" id="b2" type="submit">${pilot ? 'Create my pilot account' : 'Create my account'}</button></div>
        <p class="w2 amsg" id="m2" role="status" aria-live="polite"></p></form>`) + '</div>';
    root().querySelectorAll('[data-as]').forEach(b => b.onclick = () => { as = b.dataset.as; showAuth(tab); });
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
      try { const tk = await A.cap('signin'); const r = await sb.auth.signInWithPassword(Object.assign({ email: e, password: p }, tk ? { options: { captchaToken: tk } } : {})); if (r.error) throw r.error; } catch (x) { say('#m1', friendly(x)); busy(b, false); }
    };
    $('#fg').onclick = async ev => {
      ev.preventDefault(); const e = $('#e1').value.trim(); if (!isEmail(e)) return say('#m1', 'Type your email above first, then click "Forgot password?" again.');
      say('#m1', 'Sending…', true);
      try { const tk = await A.cap('reset'); const r = await sb.auth.resetPasswordForEmail(e, Object.assign({ redirectTo: A.pageUrl('account.html') }, tk ? { captchaToken: tk } : {})); if (r.error && /rate|too many|smtp|sending|authorized/i.test(r.error.message)) throw r.error; say('#m1', 'If that email has an account, a link to choose a new password is on its way. It can take a few minutes.', true); } catch (x) { say('#m1', friendly(x)); }
    };
    $('#ml').onclick = async ev => {
      ev.preventDefault(); const e = $('#e1').value.trim(); if (!isEmail(e)) return say('#m1', 'Type your email above first, then click the link again.');
      say('#m1', 'Sending…', true);
      try { const tk = await A.cap('magic'); const r = await sb.auth.signInWithOtp({ email: e, options: Object.assign({ shouldCreateUser: false, emailRedirectTo: A.pageUrl('account.html' + (next ? '?next=' + encodeURIComponent(next) : '')) }, tk ? { captchaToken: tk } : {}) }); if (r.error && /rate|too many|smtp|sending|authorized/i.test(r.error.message)) throw r.error; say('#m1', 'If that email has an account, a sign-in link is on its way. It can take a few minutes. New here? Use "Create account".', true); } catch (x) { say('#m1', friendly(x)); }
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
        const tk = await A.cap('signup'); const r = await sb.auth.signUp({ email: e, password: p, options: Object.assign({ data: as === 'pilot' ? { full_name: n, account_type: 'pilot' } : { full_name: n }, emailRedirectTo: A.pageUrl('account.html' + (next ? '?next=' + encodeURIComponent(next) : '')) }, tk ? { captchaToken: tk } : {}) });
        if (r.error) throw r.error;
        try { localStorage.setItem('up_pc', JSON.stringify({ e: e.toLowerCase(), v: VERSION, mk })); } catch (x) { }
        if (!r.data.session) { root().innerHTML = '<div class="acol"><div class="box c"><h3>Check your inbox</h3><p>We sent a confirmation link to <b>' + esc(e) + '</b>. Open it to finish creating your account' + (as === 'pilot' ? ' and start your pilot profile' : '') + '. It can take a few minutes; please also look in your spam folder.</p><p class="mute"><a href="account.html">Back to sign in</a></p></div></div>'; head('Almost done', 'Confirm your email to finish.'); }
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
  // the pilot's own row: public columns first, then their private commission and agreement details from v_pilot_terms
  // (before the database update they are still ordinary columns, so both states work)
  async function loadPilotRow(uid) {
    const B = 'id,slug,display_name,headline,bio,field,studied_in,universities,scholarships,languages,helps_with,photo_url,linkedin_url,timezone,status,rating_avg,rating_count,created_at,updated_at', T = 'commission_bps,contract_version,contract_accepted_at';
    const get = (cols, from) => sb.from(from).select(cols).eq('id', uid).maybeSingle();
    let r = await get(B + ',education,highlights,based_in,tagline', 'pilots'); if (r.error) r = await get(B, 'pilots');
    if (r.error || !r.data) return r;
    let t = await get(T, 'v_pilot_terms'); if (t.error) t = await get(T, 'pilots');
    if (!t.error && t.data) Object.assign(r.data, t.data);
    return r;
  }
  async function loadAll(uid) {
    const q = [
      sb.from('profiles').select('full_name,phone,country,timezone,marketing_opt_in,onboarding,deleted_at').eq('id', uid).maybeSingle(),
      sb.from('user_roles').select('role').eq('user_id', uid),
      sb.from('consents').select('kind,version').eq('user_id', uid),
      loadPilotRow(uid)];
    const r = await Promise.all(q), bad = r.find(x => x.error); if (bad) throw bad.error;
    return { pr: r[0].data, roles: (r[1].data || []).map(x => x.role), cons: r[2].data || [], pilot: r[3].data };
  }

  const triedPilot = new Set();
  async function showDash(view) {
    const uid = user.id; head('Your account', 'Loading…'); root().innerHTML = '<p class="mute">Loading your account…</p>';
    let d; try { d = await loadAll(uid); } catch (e) { head('Your account', ''); root().innerHTML = '<div class="acol"><div class="box c"><h3>We could not load your account</h3><p>' + esc(friendly(e)) + '</p><button class="btn" id="rt" type="button">Try again</button> <button class="btn out" id="so" type="button">Sign out</button></div></div>'; $('#rt').onclick = () => showDash(view); $('#so').onclick = () => sb.auth.signOut(); return; }
    if (!d.pr) { head('Your account', ''); root().innerHTML = '<div class="acol"><div class="box c"><h3>Your profile is not ready yet</h3><p>Please refresh in a minute. If this stays, email us at ' + esc(C.email) + '.</p><button class="btn out" id="so" type="button">Sign out</button></div></div>'; $('#so').onclick = () => sb.auth.signOut(); return; }
    if (d.pr.deleted_at) { await sb.auth.signOut({ scope: 'local' }); return showAuth(); }

    // record the agreement that was shown at sign-up (ticked box, or "by continuing" under the Google button), otherwise ask for it
    if (!d.cons.some(c => c.kind === 'privacy')) {
      await A.settle(sb, user);
      if (await A.consentOk(sb, uid)) return showDash(view);
      return showGate(uid);
    }
    if (next) { A.go(next); return; }            // came here from a "Save" button: go back to where they were
    // someone who applied from the pilot door: start their draft pilot profile once
    const meta = user.user_metadata || {};
    if (!d.pilot && meta.account_type === 'pilot' && !triedPilot.has(uid)) {
      triedPilot.add(uid);
      try { const r = await sb.rpc('fn_become_pilot', { p_name: d.pr.full_name || meta.full_name || '', p_headline: null, p_field: null }); if (!r.error) return showDash('pilot'); } catch (e) { }
    }
    // a pilot whose login was created by the team must choose their own password first
    if (d.pr.onboarding && d.pr.onboarding.must_change_password) return showPwGate(d, view);
    if (d.roles.some(r => TEAM.includes(r))) { const g = await mfaGate(); if (g) return showMfa(g, view); }
    mountShell(d, view);
  }

  // ------------------------------------------------------------------ 2-step login for the team (admin, finance, support)
  // The real lock is in the database (Admin > Overview > Team security switches it on). These screens only help people through it.
  const TEAM = ['admin', 'finance', 'support'];
  let mfaLater = false;                                     // "Not now" is allowed until the team switch is ON
  async function mfaGate() {
    try {
      const a = await sb.auth.mfa.getAuthenticatorAssuranceLevel(), l = await sb.auth.mfa.listFactors();
      if (a.error || l.error || !a.data || !l.data) return null;         // the feature is not available: never block anybody here
      const totp = l.data.totp || [];
      if (totp.length) return a.data.currentLevel === 'aal2' ? null : { mode: 'verify', factorId: totp[0].id };
      const s = await sb.from('app_settings').select('value').eq('key', 'require_admin_mfa').maybeSingle();
      const must = !s.error && !!s.data && (s.data.value === true || s.data.value === 'true');
      return must || !mfaLater ? { mode: 'enroll', must } : null;
    } catch (e) { return null; }
  }
  function showMfa(g, view) {
    const code = () => $('#mfc').value.replace(/\s/g, '');
    const done = () => setTimeout(() => { if ($('#mfaf')) route(); }, 900);        // the sign-in library normally tells us itself; this is only a safety net
    if (g.mode === 'verify') {
      head('Two-step check', 'Please confirm that it is really you.');
      root().innerHTML = `<div class="acol"><form class="box f" id="mfaf" novalidate><p class="w2" style="margin:0">Open your authenticator app and type the current 6-digit code for UniPilot Global.</p>
        <div class="w2"><label for="mfc">6-digit code</label><input id="mfc" inputmode="numeric" autocomplete="one-time-code" maxlength="7" style="max-width:200px;letter-spacing:.2em;font-size:1.3rem"></div>
        <div class="w2"><button class="btn lg" id="mfb" type="submit">Continue</button> <button class="btn out" id="mfo" type="button">Sign out</button></div><p class="w2 amsg" id="mfm" role="status" aria-live="polite"></p></form></div>`;
      $('#mfo').onclick = () => sb.auth.signOut(); $('#mfc').focus();
      $('#mfaf').onsubmit = async ev => {
        ev.preventDefault(); if (!/^\d{6}$/.test(code())) return say('#mfm', 'Please type the 6 digits from your app.');
        const b = $('#mfb'); busy(b, true, 'Checking…');
        try { const r = await sb.auth.mfa.challengeAndVerify({ factorId: g.factorId, code: code() }); if (r.error) throw r.error; done(); } catch (x) { say('#mfm', friendly(x)); busy(b, false); }
      };
      return;
    }
    head('Protect the team account', g.must ? 'Your team now requires 2-step login. It takes about two minutes.' : 'This account can see every student and approve payments, so it needs a second step.');
    root().innerHTML = `<div class="acol"><div class="box f" id="mfaf"><ol class="w2" style="margin:0;padding-left:1.2em"><li>Install an authenticator app on your phone (for example Google Authenticator, Microsoft Authenticator, 2FAS or Aegis).</li><li>In the app choose “add account” and scan the picture below.</li><li>Type the 6-digit code that the app shows, and press the button.</li></ol>
      <div class="w2" id="mfq" style="text-align:center"><p class="mute">Preparing your code…</p></div>
      <form class="w2" id="mff" novalidate><label for="mfc">6-digit code</label><input id="mfc" inputmode="numeric" autocomplete="one-time-code" maxlength="7" style="max-width:200px;letter-spacing:.2em;font-size:1.3rem">
        <div style="margin-top:12px"><button class="btn lg" id="mfb" type="submit">Turn on 2-step login</button> ${g.must ? '' : '<button class="btn out" id="mfl" type="button">Not now</button> '}<button class="btn out" id="mfo" type="button">Sign out</button></div></form>
      <p class="w2 amsg" id="mfm" role="status" aria-live="polite"></p></div></div>`;
    $('#mfo').onclick = () => sb.auth.signOut(); const later = $('#mfl'); if (later) later.onclick = () => { mfaLater = true; showDash(view); };
    let fid = null;
    (async () => {
      try {
        const l = await sb.auth.mfa.listFactors();                          // an earlier, unfinished set-up would block a new one
        for (const f of ((l.data && l.data.all) || [])) if (f.factor_type === 'totp' && f.status !== 'verified') await sb.auth.mfa.unenroll({ factorId: f.id });
        const r = await sb.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'UniPilot ' + new Date().toISOString().slice(0, 16) }); if (r.error) throw r.error;
        fid = r.data.id; const q = $('#mfq'); if (!q) return; q.textContent = '';
        const img = new Image(); img.alt = 'QR code to scan with your authenticator app'; img.width = 200; img.height = 200; img.src = r.data.totp.qr_code; q.appendChild(img);
        const k = document.createElement('p'); k.className = 'mute'; k.style.cssText = 'margin:8px 0 0;font-size:.9rem';
        k.innerHTML = 'Cannot scan? Type this key into the app: <b style="letter-spacing:.05em;word-break:break-all">' + esc(r.data.totp.secret) + '</b><br>Save this key in your password manager. It lets you set up a new phone.'; q.appendChild(k);
      } catch (x) { const q = $('#mfq'); if (q) q.innerHTML = '<p class="amsg bad">' + esc(friendly(x)) + '</p>'; }
    })();
    $('#mff').onsubmit = async ev => {
      ev.preventDefault(); if (!fid) return say('#mfm', 'Please wait until the picture appears.'); if (!/^\d{6}$/.test(code())) return say('#mfm', 'Please type the 6 digits from your app.');
      const b = $('#mfb'); busy(b, true, 'Checking…');
      try { const r = await sb.auth.mfa.challengeAndVerify({ factorId: fid, code: code() }); if (r.error) throw r.error; say('#mfm', '2-step login is on.', true); done(); } catch (x) { say('#mfm', friendly(x)); busy(b, false); }
    };
  }

  function showPwGate(d, view) {
    head('Welcome to UniPilot Global', 'One quick step: choose your own password.');
    root().innerHTML = `<div class="acol"><form class="box f" id="fpw" novalidate><p class="w2" style="margin:0">The password we gave you was only temporary. Please choose one that only you know (at least 10 characters).</p>
      <div class="w2"><label for="np1">New password</label><input id="np1" type="password" required minlength="10" autocomplete="new-password"></div>
      <div class="w2"><label for="np2">Repeat the new password</label><input id="np2" type="password" required autocomplete="new-password"></div>
      <div class="w2"><button class="btn lg" id="npb" type="submit">Save and continue</button> <button class="btn out" id="nps" type="button">Sign out</button></div><p class="w2 amsg" id="npm" role="status" aria-live="polite"></p></form></div>`;
    $('#nps').onclick = () => sb.auth.signOut();
    $('#fpw').onsubmit = async ev => {
      ev.preventDefault(); const a1 = $('#np1').value, a2 = $('#np2').value;
      if (a1.length < 10) return say('#npm', 'Please choose a password with at least 10 characters.'); if (a1 !== a2) return say('#npm', 'The two passwords are not the same.');
      const b = $('#npb'); busy(b, true, 'Saving…');
      try {
        const r = await sb.auth.updateUser({ password: a1 }); if (r.error) throw r.error;
        const ob = Object.assign({}, d.pr.onboarding || {}); delete ob.must_change_password;
        const u = await sb.from('profiles').update({ onboarding: ob }).eq('id', user.id); if (u.error) throw u.error;
        showDash(view);
      } catch (x) { say('#npm', friendly(x)); busy(b, false); }
    };
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

  // ------------------------------------------------------------------ the dashboards (loaded only when needed)
  const loaded = {};
  const loadJs = src => loaded[src] || (loaded[src] = new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => { delete loaded[src]; rej(new Error('Could not load ' + src)); }; document.head.appendChild(el); }));
  async function loadMods(view, staff, pilot) {
    await loadJs('assets/dash-ui.js'); await loadJs('assets/dash-student.js');
    if (view === 'pilot' || staff) await loadJs('assets/dash-pilot.js');
    if (view === 'admin') await loadJs('assets/dash-admin.js');
  }
  const tzList = () => { try { if (Intl.supportedValuesOf) return Intl.supportedValuesOf('timeZone'); } catch (e) { } return ['UTC', 'Europe/Warsaw', 'Europe/Berlin', 'Europe/London', 'Asia/Dhaka', 'Asia/Kolkata', 'Asia/Dubai', 'America/New_York', 'America/Los_Angeles', 'Australia/Sydney']; };
  const myTz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; } catch (e) { return 'UTC'; } };
  const DASH_LINK = /^\/?dashboard(?:\/(pilot|admin))?(?:#(\w+))?$/;

  function privacyHTML() {
    return `<div class="dx-card"><h3>Your data and privacy</h3><p class="mute" style="margin:0 0 12px">You can download everything we hold about you, or delete your account. <a href="legal.html#privacy">Read the Privacy notice</a>.</p>
      <button class="btn out sm" id="dl" type="button">Download my data</button> <button class="btn out sm" id="dx" type="button" style="color:#b3261e">Delete my account</button>
      <div id="dz" hidden style="margin-top:16px"><p style="margin:0 0 8px"><b>This cannot be undone.</b> Your saved items, alerts and profile details are erased, future sessions are cancelled, and your login email is removed. Records that the law requires us to keep (payments) stay without your name.</p>
      <label for="dt">Type DELETE to confirm</label><input id="dt" autocomplete="off" style="max-width:240px"> <button class="btn sm" id="dc" type="button" style="background:#b3261e;color:#fff;margin-top:8px">Delete my account for good</button></div><p class="amsg" id="dm" role="status" aria-live="polite"></p></div>`;
  }
  function wirePrivacy(r) {
    const q = s => r.querySelector(s); if (!q('#dl')) return;
    q('#dl').onclick = async () => {
      const b = q('#dl'); busy(b, true, 'Preparing…');
      try { const x = await sb.rpc('fn_export_my_data'); if (x.error) throw x.error; const blob = new Blob([JSON.stringify(x.data, null, 2)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'unipilot-my-data.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); say('#dm', 'Your data file was downloaded.', true); } catch (e) { say('#dm', friendly(e)); }
      busy(b, false);
    };
    q('#dx').onclick = () => { q('#dz').hidden = !q('#dz').hidden; };
    q('#dc').onclick = async () => {
      if (q('#dt').value.trim() !== 'DELETE') return say('#dm', 'Please type DELETE in capital letters to confirm.');
      const b = q('#dc'); busy(b, true, 'Deleting…');
      try {
        // private files are removed first (if that fails we stop, so nothing is left behind)
        try { const dd = await sb.from('documents').select('storage_path').eq('student_id', user.id); if (dd.error) throw dd.error; const paths = (dd.data || []).map(r => r.storage_path).filter(Boolean); if (paths.length) { const rr = await sb.storage.from('student-docs').remove(paths); if (rr.error) throw rr.error; } }
        catch (e) { throw new Error('We could not remove your uploaded files, so your account was not deleted. Please try again in a minute.'); }
        const x = await sb.rpc('fn_delete_my_account'); if (x.error) throw x.error;
        finished = true; await sb.auth.signOut({ scope: 'local' }); try { localStorage.removeItem('up_pc'); } catch (e) { }
        head('Account deleted', 'Your account and sign-in were removed.'); root().innerHTML = '<div class="acol"><div class="box c"><h3>Your account was deleted</h3><p>Thank you for using ' + esc(C.brand) + '. You are welcome back any time.</p><a class="btn" href="index.html">Back to the home page</a></div></div>';
      } catch (e) { say('#dm', friendly(e)); busy(b, false); }
    };
  }

  let curApi = null;
  function mountShell(d, want) {
    const uid = user.id, staff = d.roles.some(r => ['admin', 'finance', 'support'].includes(r)), views = [['student', 'Student']];
    if (d.pilot) views.push(['pilot', 'Pilot']); if (staff) views.push(['admin', 'Admin']);
    let saved = ''; try { saved = localStorage.getItem('up_view') || ''; } catch (e) { }
    let cur = views.some(v => v[0] === want) ? want : views.some(v => v[0] === saved) ? saved : staff ? 'admin' : d.pilot ? 'pilot' : 'student';
    const pr = d.pr, ctx = { sb, uid, user, A, C, roles: d.roles, pr, pilot: d.pilot, friendly, privacy: { html: privacyHTML, wire: wirePrivacy }, tzList, myTz, firstTab: null, checkout: null, checkout: null,
      refreshHead: () => { const f = (pr.full_name || '').split(' ')[0] || 'there'; head('Hello, ' + f, user.email || ''); const n = $('.dx-who b'); if (n) n.textContent = pr.full_name || user.email || ''; const av = $('.dx-av'); if (av) av.textContent = (pr.full_name || user.email || '?').trim().charAt(0).toUpperCase(); },
      reload: v => showDash(v), signOut: () => sb.auth.signOut(),
      linkOK: l => { l = String(l || ''); return DASH_LINK.test(l) || (!!A.safeNext(l.replace(/^\//, '')) && l.replace(/^\//, '') !== 'account.html'); },
      openLink: l => { l = String(l || ''); const m = l.match(DASH_LINK); if (m) { const v = m[1] || 'student', t = { applications: 'applications', reviews: 'sessions' }[m[2]] || null; return show(views.some(x => x[0] === v) ? v : 'student', t); } const n = A.safeNext(l.replace(/^\//, '')); if (n) A.go(n); } };
    root().innerHTML = '<div class="dxr"><div class="dx-top"><div class="dx-who"><span class="dx-av" aria-hidden="true"></span><div><b></b><small>' + esc(user.email || '') + '</small></div></div>' + (views.length > 1 ? '<div class="dx-switch" role="tablist" aria-label="Switch dashboard">' + views.map(v => '<button type="button" role="tab" class="dx-sw" data-v="' + v[0] + '">' + v[1] + '</button>').join('') + '</div>' : '') + '<button class="btn out sm" id="so" type="button">Sign out</button></div><div id="dxView"></div></div>';
    ctx.refreshHead(); $('#so').onclick = () => sb.auth.signOut();
    async function show(v, tab) {
      cur = v; try { localStorage.setItem('up_view', v); } catch (e) { }
      root().querySelectorAll('.dx-sw').forEach(b => { const on = b.dataset.v === v; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      curApi = null; const host = $('#dxView'); host.innerHTML = '<div class="dx-card"><div class="dx-skel"></div><div class="dx-skel s"></div></div>'; ctx.firstTab = tab || null;
      try { await loadMods(v, staff); const fn = UP.dash && UP.dash[v]; if (!fn) throw new Error('This part of the dashboard is missing. Please refresh the page.'); host.innerHTML = ''; curApi = fn(host, ctx); }
      catch (e) { host.innerHTML = '<div class="dx-card dx-err"><h3>We could not open this dashboard</h3><p>' + esc(friendly(e)) + '</p><button class="btn sm" type="button" id="rtv">Try again</button></div>'; $('#rtv').onclick = () => show(v, tab); }
      ctx.firstTab = null;
    }
    root().querySelectorAll('.dx-sw').forEach(b => b.onclick = () => show(b.dataset.v));
    // coming back from the card payment page: ?checkout=success|cancelled&booking=<id>
    const co = params.get('checkout');
    if (co === 'success' || co === 'cancelled') { ctx.checkout = { state: co, booking: /^[0-9a-f-]{36}$/i.test(params.get('booking') || '') ? params.get('booking') : '' }; try { history.replaceState(null, '', location.pathname); } catch (e) { } params.delete('checkout'); cur = 'student'; show('student', 'sessions'); return; }
    show(cur);
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
  UP.boot('account', () => { if (mounted) { if (redraw) redraw(); return; } mounted = true; redraw = () => { if (!curApi) return; try { const c = curApi.current; if (['overview', 'matches', 'saved', 'applications'].includes(c) && !(document.activeElement && document.activeElement.closest && document.activeElement.closest('.dx-main'))) curApi.refresh(); } catch (e) { } }; start(); });
})();
