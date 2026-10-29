/* UNIPILOT GLOBAL: accounts, shared by every page.
   - the small "Sign in" pop-up that keeps people on the page they are on (free materials, Save, pilots)
   - loads the sign-in library (assets/vendor/supabase-js, pinned version) ONLY when a page needs it
   - powers the "Save" buttons
   - the Sign in / My account links in the header and footer are drawn by site.js and refreshed from here
   Nothing here can see other people's data: the database (Supabase) enforces who may read or write each row. */
(function () {
  'use strict';
  const C = window.CONFIG || {}, UP = window.UP = window.UP || {};
  const on = !!(C.supabaseUrl && C.supabaseKey), shown = on && C.accountsLaunch !== false, google = on && C.googleSignIn === true;
  let ref = ''; try { ref = on ? new URL(C.supabaseUrl).hostname.split('.')[0] : ''; } catch (e) { }
  const STORE = 'sb-' + ref + '-auth-token';          // where the sign-in library keeps the session in this browser
  const SDK = 'assets/vendor/supabase-js-2.118.0.min.js';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
  const version = () => (C.legal && C.legal.updated) || 'current';
  const GICON = '<svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>';
  let sdkP = null, clientP = null;

  const loadSdk = () => sdkP || (sdkP = new Promise((res, rej) => {
    if (window.supabase && window.supabase.createClient) return res();
    const s = document.createElement('script'); s.src = SDK; s.onload = () => res();
    s.onerror = () => { sdkP = null; rej(new Error('Could not load the sign-in library')); };
    document.head.appendChild(s);
  }));

  const friendly = e => {
    const m = String((e && (e.message || e.error_description)) || e || '').toLowerCase(), code = String((e && e.code) || '').toLowerCase();
    if (m.includes('invalid login')) return 'That email and password do not match. Please try again, or use "Forgot password".';
    if (m.includes('email not confirmed')) return 'Please confirm your email first: open the message we sent you and click the link.';
    if (m.includes('already registered') || m.includes('already been registered')) return 'This email already has an account. Please use "Sign in" instead.';
    if (code.includes('rate_limit') || m.includes('rate limit') || m.includes('too many')) return 'Too many tries or emails just now. Please wait a few minutes and try again.';
    if (m.includes('provider is not enabled') || m.includes('unsupported provider')) return 'Google sign-in is not available yet. Please use your email.';
    if (m.includes('not authorized') || m.includes('sending') || m.includes('smtp') || m.includes('confirmation email')) return 'We could not send the email right now. Please try again later or contact us.';
    if (m.includes('password') && (m.includes('weak') || m.includes('least') || m.includes('should'))) return 'Please choose a stronger password (at least 10 characters).';
    if (m.includes('exceeded the maximum') || m.includes('payload too large')) return 'This file is larger than 10 MB. Please make it smaller and try again.';
    if (m.includes('mime type')) return 'This file type is not allowed. Please use PDF, Word, JPG, PNG or text.';
    if (m.includes('failed to fetch') || m.includes('network')) return 'Connection problem. Please check your internet and try again.';
    return 'Something went wrong: ' + (e && e.message ? e.message : 'please try again') + '.';
  };

  const acc = UP.acc = {
    on, shown, google, esc, friendly, isEmail, GICON,
    // Who is signed in, WITHOUT loading the library (used for the header link). Not a security check: only a hint.
    peek() { try { const j = JSON.parse(localStorage.getItem(STORE) || 'null'); return (j && j.user) || null; } catch (e) { return null; } },
    client() {
      if (!on) return Promise.reject(new Error('Accounts are switched off'));
      return clientP || (clientP = loadSdk().then(() => window.supabase.createClient(C.supabaseUrl, C.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })).catch(e => { clientP = null; throw e; }));
    },
    // only allow going back to one of our own pages after sign-in (never to another website)
    safeNext(v) { return /^[a-z0-9_-]+\.html(\?[A-Za-z0-9_%=&.\-]*)?$/i.test(v || '') ? v : ''; },
    go(u) { location.href = u; },                    // one place that changes page (lets tests watch it)
    pageUrl(p) { try { return new URL(p || 'account.html', location.href).href; } catch (e) { return p || 'account.html'; } },
    here() { return (location.pathname.split('/').pop() || 'index.html') + location.search; },

    // the header and footer links are drawn by site.js; this asks it to redraw them (after sign in or out)
    header() { if (UP.refreshSign) UP.refreshSign(); },

    async consentOk(sb, uid) {
      try { const r = await sb.from('consents').select('kind').eq('user_id', uid).eq('kind', 'privacy'); return !r.error && (r.data || []).length > 0; } catch (e) { return false; }
    },
    async recordConsent(sb, uid, mk) {
      try {
        const v = version(), rows = [{ user_id: uid, kind: 'privacy', version: v }, { user_id: uid, kind: 'terms', version: v }]; if (mk) rows.push({ user_id: uid, kind: 'marketing', version: v });
        const r = await sb.from('consents').insert(rows); if (r.error) throw r.error;
        if (mk) await sb.from('profiles').update({ marketing_opt_in: true }).eq('id', uid);
        return true;
      } catch (e) { console.warn('Agreement not recorded', e); return false; }
    },
    // records an agreement that was shown before sign-in (ticked box, or "by continuing" under the Google button)
    async settle(sb, user) {
      let pend = null, any = null;
      try { pend = JSON.parse(localStorage.getItem('up_pc') || 'null'); } catch (e) { }
      try { any = JSON.parse(localStorage.getItem('up_pc_any') || 'null'); } catch (e) { }
      const mine = pend && user.email && pend.e === String(user.email).toLowerCase();
      if (!mine && !any) return;
      if (await acc.consentOk(sb, user.id)) { try { localStorage.removeItem('up_pc'); localStorage.removeItem('up_pc_any'); } catch (e) { } return; }
      const ok = await acc.recordConsent(sb, user.id, mine ? !!pend.mk : false);
      if (ok) { try { localStorage.removeItem('up_pc'); localStorage.removeItem('up_pc_any'); } catch (e) { } }
    },

    // ------------------------------------------------------------------------------------------------
    // The pop-up. acc.need({title, lead, mode, cta}) resolves with {sb, user} once the person is signed in
    // (and has agreed to the privacy notice), or with null if they close it. People never leave the page.
    need(o) {
      o = o || {};
      if (!on) return Promise.resolve(null);
      return new Promise(resolve => {
        let sb = null, done = false, tab = o.mode === 'in' ? 'in' : 'up';
        const finish = r => { if (!done) { done = true; resolve(r); } };
        let d = document.getElementById('authd');
        if (!d) { d = document.createElement('dialog'); d.id = 'authd'; d.className = 'm2 sm'; d.setAttribute('aria-label', 'Sign in or create an account'); document.body.appendChild(d); }
        const open = () => { if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); } };
        const shut = () => { if (d.close) d.close(); else d.removeAttribute('open'); };
        d.onclick = ev => { if (ev.target.closest('[data-x]') || ev.target === d) shut(); };
        d.onclose = () => finish(null);
        const X = '<button class="x" type="button" data-x aria-label="Close">&times;</button>';
        const say = (t, ok) => { const m = d.querySelector('#adm'); if (m) { m.className = 'amsg ' + (ok ? 'ok' : 'bad'); m.textContent = t || ''; } };
        const busy = (b, v, t) => { if (!b) return; if (v) { b.dataset.t = b.textContent; b.textContent = t || 'Please wait…'; } else if (b.dataset.t) b.textContent = b.dataset.t; b.disabled = !!v; };
        const q = s => d.querySelector(s);

        const success = user => {                               // signed in and agreed
          acc.header(); try { document.dispatchEvent(new CustomEvent('up-auth', { detail: { user } })); } catch (e) { }
          finish({ sb, user });
          if (o.cta) { d.innerHTML = X + '<div class="in adlg"><div class="adok" aria-hidden="true">&#10003;</div><h2>You are in. Welcome!</h2><p class="mute">' + esc(o.cta.text || 'Everything is unlocked.') + '</p><a class="btn blk" id="adcta" href="' + esc(o.cta.href) + '" target="_blank" rel="noopener">' + esc(o.cta.label || 'Open') + '</a></div>'; const a = q('#adcta'); if (a) a.onclick = () => setTimeout(shut, 50); }
          else shut();
        };

        const consentStep = user => {
          d.innerHTML = X + '<div class="in adlg"><h2>One quick step</h2><p class="mute">Please confirm how we may handle your details.</p><form id="adc" novalidate><label class="ck2"><input type="checkbox" id="adk"> <span>I have read the <a href="legal.html#privacy" target="_blank" rel="noopener">Privacy notice</a> and agree to the <a href="legal.html" target="_blank" rel="noopener">Terms</a>. *</span></label><label class="ck2"><input type="checkbox" id="adm2"> <span>Email me deadline alerts and news (optional)</span></label><button class="btn blk" id="adb" type="submit">Agree and continue</button><p class="amsg" id="adm" role="status" aria-live="polite"></p></form></div>';
          q('#adc').onsubmit = async ev => { ev.preventDefault(); if (!q('#adk').checked) return say('Please tick the box to continue.'); const b = q('#adb'); busy(b, true, 'Saving…'); const ok = await acc.recordConsent(sb, user.id, q('#adm2').checked); if (ok) success(user); else { say('Could not save your choice. Please try again.'); busy(b, false); } };
        };

        const afterSignIn = async user => { if (await acc.consentOk(sb, user.id)) success(user); else consentStep(user); };

        const form = () => {
          const up = tab === 'up';
          d.innerHTML = X + '<div class="in adlg"><h2>' + esc(o.title || 'Sign in or create your free account') + '</h2><p class="mute">' + esc(o.lead || 'It takes about 20 seconds.') + '</p>' +
            (google ? '<button type="button" class="gbtn" id="adg">' + GICON + '<span>Continue with Google</span></button><p class="gnote">By continuing you agree to the <a href="legal.html#privacy" target="_blank" rel="noopener">Privacy notice</a> and <a href="legal.html" target="_blank" rel="noopener">Terms</a>.</p><div class="or"><span>or with your email</span></div>' : '') +
            '<div class="atabs" role="tablist"><button type="button" class="chip' + (up ? ' on' : '') + '" data-tab="up" role="tab">New here? Create account</button><button type="button" class="chip' + (up ? '' : ' on') + '" data-tab="in" role="tab">I have an account</button></div>' +
            (up ? '<form id="adf" novalidate><label for="adn">Your name</label><input id="adn" autocomplete="name"><label for="ade">Email</label><input id="ade" type="email" autocomplete="email" inputmode="email"><label for="adp">Password (at least 10 characters)</label><input id="adp" type="password" autocomplete="new-password"><label class="ck2"><input type="checkbox" id="adk"> <span>I agree to the <a href="legal.html#privacy" target="_blank" rel="noopener">Privacy notice</a> and <a href="legal.html" target="_blank" rel="noopener">Terms</a>. *</span></label><label class="ck2"><input type="checkbox" id="adm2"> <span>Email me deadline alerts and news (optional)</span></label><button class="btn blk" id="adb" type="submit">Create my free account</button><p class="amsg" id="adm" role="status" aria-live="polite"></p></form>'
              : '<form id="adf" novalidate><label for="ade">Email</label><input id="ade" type="email" autocomplete="email" inputmode="email"><label for="adp">Password</label><input id="adp" type="password" autocomplete="current-password"><button class="btn blk" id="adb" type="submit">Sign in</button><p class="nav-note" style="margin:10px 0 0"><a href="account.html">Forgot your password?</a></p><p class="amsg" id="adm" role="status" aria-live="polite"></p></form>') + '</div>';
          d.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { tab = b.dataset.tab; form(); });
          const g = q('#adg'); if (g) g.onclick = async () => {
            try { localStorage.setItem('up_pc_any', JSON.stringify({ v: version(), t: Date.now() })); } catch (e) { }
            busy(g, true, 'Opening Google…');
            try { const r = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: acc.pageUrl(acc.here()) } }); if (r.error) throw r.error; } catch (x) { busy(g, false); try { localStorage.removeItem('up_pc_any'); } catch (e) { } say(friendly(x)); }
          };
          q('#adf').onsubmit = async ev => {
            ev.preventDefault(); const e = q('#ade').value.trim(), p = q('#adp').value, b = q('#adb');
            if (!isEmail(e)) return say('Please enter a valid email address.');
            if (up) {
              if (p.length < 10) return say('Please choose a password with at least 10 characters.');
              if (!q('#adk').checked) return say('Please tick the box to agree to the Privacy notice and Terms.');
              const n = q('#adn').value.trim(), mk = q('#adm2').checked; busy(b, true, 'Creating your account…'); say('');
              try {
                const r = await sb.auth.signUp({ email: e, password: p, options: { data: { full_name: n }, emailRedirectTo: acc.pageUrl(acc.here()) } });
                if (r.error) throw r.error;
                try { localStorage.setItem('up_pc', JSON.stringify({ e: e.toLowerCase(), v: version(), mk })); } catch (x) { }
                if (r.data.session) { const u = r.data.session.user; await acc.recordConsent(sb, u.id, mk); try { localStorage.removeItem('up_pc'); } catch (x) { } success(u); }
                else { d.innerHTML = X + '<div class="in adlg"><div class="adok" aria-hidden="true">&#9993;</div><h2>Check your inbox</h2><p>We sent a confirmation link to <b>' + esc(e) + '</b>. Open it and you will come straight back to this page, signed in. It can take a few minutes; please also look in your spam folder.</p></div>'; }
              } catch (x) { say(friendly(x)); busy(b, false); }
            } else {
              if (!p) return say('Please enter your password.'); busy(b, true, 'Signing in…'); say('');
              try { const r = await sb.auth.signInWithPassword({ email: e, password: p }); if (r.error) throw r.error; await afterSignIn(r.data.user || r.data.session.user); } catch (x) { say(friendly(x)); busy(b, false); }
            }
          };
        };

        open();
        d.innerHTML = X + '<div class="in adlg"><p class="mute">One moment…</p></div>';
        (async () => {
          try { sb = await acc.client(); } catch (e) { d.innerHTML = X + '<div class="in adlg"><h2>Sign-in is not available</h2><p class="mute">Please refresh the page and try again in a minute. Everything else on the site still works.</p></div>'; return; }
          let s = null; try { const r = await sb.auth.getSession(); s = r && r.data && r.data.session; } catch (e) { }
          if (s) return afterSignIn(s.user);
          form();
        })();
      });
    },

    // Buttons like <button data-save="scholarship:ID">. Signed-out visitors get the small pop-up and stay on the page.
    async bindSave(root) {
      const btns = Array.from((root || document).querySelectorAll('[data-save]')); if (!btns.length || !on) return;
      const draw = (b, v) => { b.dataset.saved = v ? '1' : ''; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.innerHTML = v ? '&#9829; Saved' : '&#9825; Save'; };
      btns.forEach(b => draw(b, false));
      let sb = null, uid = null, fresh = false; const saved = new Set();
      const load = async () => { const r = await sb.from('saved_items').select('kind,ref'); (r.data || []).forEach(x => saved.add(x.kind + ':' + x.ref)); btns.forEach(b => draw(b, saved.has(b.dataset.save))); };
      if (acc.peek()) {
        try { sb = await acc.client(); const { data } = await sb.auth.getSession(), s = data && data.session; if (s) { uid = s.user.id; await load(); } }
        catch (e) { console.warn('Saved items could not be loaded', e); }
      }
      btns.forEach(b => b.onclick = async () => {
        if (!uid) {
          const kind = b.dataset.save.split(':')[0], r = await acc.need({ title: kind === 'pilot' ? 'Save this pilot' : 'Save this scholarship', lead: 'Keep your shortlist in one place and get deadline reminders. Free.' });
          if (!r) return; sb = r.sb; uid = r.user.id; fresh = true; try { await load(); } catch (e) { console.warn(e); }
        }
        const k = b.dataset.save, i = k.indexOf(':'), kind = k.slice(0, i), r = k.slice(i + 1), was = saved.has(k);
        if (fresh && was) { fresh = false; return; }                 // just signed in and it was already on their list: keep it saved, do not flip it off
        fresh = false; b.disabled = true;
        try {
          const x = was ? await sb.from('saved_items').delete().eq('user_id', uid).eq('kind', kind).eq('ref', r) : await sb.from('saved_items').insert({ user_id: uid, kind, ref: r });
          if (x.error) throw x.error; was ? saved.delete(k) : saved.add(k); draw(b, !was);
        } catch (e) { console.warn(e); b.textContent = 'Could not save. Try again.'; setTimeout(() => draw(b, was), 2500); }
        b.disabled = false;
      });
      btns.forEach(b => { b.disabled = false; });                 // buttons start disabled and wake up once they work
    }
  };

  // Coming back from Google or from an emailed link on ANY page (not the account page, which has its own handling):
  // let the library read the address, record the agreement shown before sign-in, then tidy the address bar.
  (async function () {
    if (!on || document.body.dataset.page === 'account') return;
    const h = location.hash || '', back = /(^|[#&])access_token=/.test(h);
    let pend = false; try { pend = !!(localStorage.getItem('up_pc') || localStorage.getItem('up_pc_any')); } catch (e) { }
    if (!back && !(pend && acc.peek())) return;
    try {
      const sb = await acc.client(), r = await sb.auth.getSession(), s = r && r.data && r.data.session;
      if (s) { await acc.settle(sb, s.user); acc.header(); try { document.dispatchEvent(new CustomEvent('up-auth', { detail: { user: s.user } })); } catch (e) { } }
      if (back) { try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { } }
    } catch (e) { console.warn('Sign-in return could not be completed', e); }
  })();
})();
