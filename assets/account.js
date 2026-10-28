/* UNIPILOT GLOBAL: accounts, shared by every page.
   - adds the "Sign in / My account" link to the header and footer
   - loads the sign-in library (assets/vendor/supabase-js, pinned version) ONLY when a page needs it
   - powers the "Save" button on scholarship pages
   Nothing here can see other people's data: the database (Supabase) enforces who may read or write each row. */
(function () {
  'use strict';
  const C = window.CONFIG || {}, UP = window.UP = window.UP || {};
  const on = !!(C.supabaseUrl && C.supabaseKey), shown = on && C.accountsLaunch === true;   // 'shown' = links and buttons visible to visitors
  let ref = ''; try { ref = on ? new URL(C.supabaseUrl).hostname.split('.')[0] : ''; } catch (e) { }
  const STORE = 'sb-' + ref + '-auth-token';          // where the sign-in library keeps the session in this browser
  const SDK = 'assets/vendor/supabase-js-2.118.0.min.js';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let sdkP = null, clientP = null;

  const loadSdk = () => sdkP || (sdkP = new Promise((res, rej) => {
    if (window.supabase && window.supabase.createClient) return res();
    const s = document.createElement('script'); s.src = SDK; s.onload = () => res();
    s.onerror = () => { sdkP = null; rej(new Error('Could not load the sign-in library')); };
    document.head.appendChild(s);
  }));

  const acc = UP.acc = {
    on, shown, esc,
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

    header() {
      if (!shown && document.body.dataset.page !== 'account') return;
      const nav = document.getElementById('nav'); if (!nav) return;
      const old = document.getElementById('navacc'); if (old) old.remove();
      const u = acc.peek(), a = document.createElement('a');
      a.id = 'navacc'; a.className = 'navacc' + (document.body.dataset.page === 'account' ? ' on' : ''); a.href = 'account.html'; a.textContent = u ? 'My account' : 'Sign in';
      nav.insertBefore(a, nav.querySelector('.navcta'));
      const o2 = document.getElementById('ftracc'); if (o2) o2.remove();
      const lg = document.querySelector('footer a[href="legal.html"]');
      if (lg && lg.parentNode && lg.parentNode.parentNode) { const d = document.createElement('div'); d.id = 'ftracc'; d.innerHTML = '<a href="account.html">' + (u ? 'My account' : 'Sign in or create an account') + '</a>'; lg.parentNode.parentNode.insertBefore(d, lg.parentNode); }
    },

    // Buttons like <button data-save="scholarship:ID">. Signed-out visitors are sent to sign in and brought back.
    async bindSave(root) {
      const btns = Array.from((root || document).querySelectorAll('[data-save]')); if (!btns.length || !on) return;
      const draw = (b, v) => { b.dataset.saved = v ? '1' : ''; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.innerHTML = v ? '&#9829; Saved' : '&#9825; Save'; };
      btns.forEach(b => draw(b, false));
      let sb = null, uid = null; const saved = new Set();
      if (acc.peek()) {
        try {
          sb = await acc.client(); const { data } = await sb.auth.getSession(), s = data && data.session;
          if (s) { uid = s.user.id; const r = await sb.from('saved_items').select('kind,ref'); (r.data || []).forEach(x => saved.add(x.kind + ':' + x.ref)); btns.forEach(b => draw(b, saved.has(b.dataset.save))); }
        } catch (e) { console.warn('Saved items could not be loaded', e); }
      }
      btns.forEach(b => b.onclick = async () => {
        if (!uid) { acc.go('account.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search)); return; }
        const k = b.dataset.save, i = k.indexOf(':'), kind = k.slice(0, i), r = k.slice(i + 1), was = saved.has(k); b.disabled = true;
        try {
          const x = was ? await sb.from('saved_items').delete().eq('user_id', uid).eq('kind', kind).eq('ref', r) : await sb.from('saved_items').insert({ user_id: uid, kind, ref: r });
          if (x.error) throw x.error; was ? saved.delete(k) : saved.add(k); draw(b, !was);
        } catch (e) { console.warn(e); b.textContent = 'Could not save. Try again.'; setTimeout(() => draw(b, was), 2500); }
        b.disabled = false;
      });
      btns.forEach(b => { b.disabled = false; });                 // buttons start disabled and wake up once they work
    }
  };
})();
