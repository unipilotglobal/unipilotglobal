/* UNIPILOT GLOBAL: small building blocks shared by the student, pilot and admin dashboards.
   Plain JavaScript. Nothing here talks to the database; it only draws things and keeps one broken part from breaking the rest. */
(function () {
  'use strict';
  const UP = window.UP = window.UP || {}, esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const pad = n => String(n).padStart(2, '0');
  const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } };
  const fmtDT = d => { try { return new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return ''; } };
  const ago = d => { const s = (Date.now() - Date.parse(d)) / 1000; if (!(s >= 0)) return ''; if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; if (s < 86400 * 30) { const n = Math.round(s / 86400); return n <= 1 ? 'yesterday' : n + ' days ago'; } return fmtDate(d); };
  const money = (c, cur) => { try { return new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur || 'EUR' }).format((Number(c) || 0) / 100); } catch (e) { return ((Number(c) || 0) / 100).toFixed(2) + ' ' + (cur || ''); } };
  const daysLeft = iso => { if (!iso) return null; const t = Date.parse(String(iso).slice(0, 10)); if (isNaN(t)) return null; const n = new Date(); return Math.round((t - Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5); };
  const dueChip = n => n == null ? '' : n < 0 ? '<span class="pill">Closed</span>' : n === 0 ? '<span class="pill bad">Today</span>' : n <= 7 ? '<span class="pill bad">' + n + (n === 1 ? ' day' : ' days') + ' left</span>' : n <= 30 ? '<span class="pill warn">' + n + ' days left</span>' : '<span class="pill">' + n + ' days left</span>';

  // a short message in the corner (never blocks the page)
  function toast(msg, ok) {
    let t = $('#dxToast'); if (!t) { t = document.createElement('div'); t.id = 'dxToast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
    t.className = 'dx-toast ' + (ok === false ? 'bad' : 'ok') + ' show'; t.textContent = msg; clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), ok === false ? 6000 : 2800);
  }
  // our own pop-up window (no browser alert/confirm boxes)
  function modal(html, o) {
    o = o || {}; const d = document.createElement('dialog'); d.className = 'm2 dx-modal' + (o.wide ? ' wide' : ''); d.innerHTML = '<button class="x" type="button" data-x aria-label="Close">&times;</button><div class="in">' + html + '</div>';
    document.body.appendChild(d); const done = v => { try { d.close(); } catch (e) { } d.remove(); if (o.onclose) o.onclose(v); };
    d.addEventListener('click', e => { if (e.target.closest('[data-x]') || e.target === d) done(null); }); d.addEventListener('cancel', e => { e.preventDefault(); done(null); });
    try { d.showModal(); } catch (e) { d.setAttribute('open', ''); } d.close2 = done; return d;
  }
  function confirmBox(title, text, yes, danger) {
    return new Promise(res => { const d = modal('<h2 style="margin:0 0 8px">' + esc(title) + '</h2><p class="mute" style="margin:0 0 18px">' + esc(text || '') + '</p><div class="dx-row"><button type="button" class="btn out" data-no>Cancel</button><button type="button" class="btn" data-yes' + (danger ? ' style="background:#b3261e;color:#fff;border-color:#b3261e"' : '') + '>' + esc(yes || 'Yes') + '</button></div>', { onclose: v => res(v === true) });
      d.querySelector('[data-no]').onclick = () => d.close2(false); d.querySelector('[data-yes]').onclick = () => d.close2(true); });
  }
  // an error card with a "Try again" button; used by every tab so a failed request never leaves a blank page
  function errCard(el, e, retry, friendly) {
    const m = friendly ? friendly(e) : String((e && e.message) || e || 'Something went wrong');
    el.innerHTML = '<div class="dx-card dx-err"><h3>We could not load this part</h3><p>' + esc(m) + '</p>' + (retry ? '<button class="btn sm" type="button" data-retry>Try again</button>' : '') + '</div>';
    const b = $('[data-retry]', el); if (b) b.onclick = retry;
  }
  const loading = el => { el.innerHTML = '<div class="dx-card"><div class="dx-skel"></div><div class="dx-skel s"></div><div class="dx-skel"></div></div>'; };
  const empty = (title, text, action) => '<div class="dx-empty"><h3>' + esc(title) + '</h3>' + (text ? '<p>' + esc(text) + '</p>' : '') + (action || '') + '</div>';
  const kpi = (label, value, hint, tone) => '<div class="dx-kpi' + (tone ? ' ' + tone : '') + '"><b>' + esc(value) + '</b><span>' + esc(label) + '</span>' + (hint ? '<small>' + esc(hint) + '</small>' : '') + '</div>';
  const meter = (pct, label) => '<div class="dx-meter" role="progressbar" aria-valuenow="' + Math.round(pct) + '" aria-valuemin="0" aria-valuemax="100" aria-label="' + esc(label || 'Progress') + '"><i style="width:' + Math.max(0, Math.min(100, pct)) + '%"></i></div>';

  // tabs: a side list on computers, a swipe row on phones. Each tab draws itself the first time it is opened.
  // tabs = [{ id, label, badge?, render(el, api) }]; returns { open(id), refresh(id) }
  function tabs(host, list, o) {
    o = o || {}; const key = 'up_tab_' + (o.key || 'x'); let cur = null; const drawn = {};
    host.innerHTML = '<div class="dx-body"><nav class="dx-nav" role="tablist" aria-label="' + esc(o.label || 'Sections') + '">' + list.map(t => '<button type="button" class="dx-t" role="tab" data-t="' + esc(t.id) + '" aria-selected="false"><span>' + esc(t.label) + '</span><em data-b="' + esc(t.id) + '" hidden></em></button>').join('') + '</nav><div class="dx-main">' + list.map(t => '<section class="dx-pane" role="tabpanel" data-p="' + esc(t.id) + '" hidden></section>').join('') + '</div></div>';
    const api = {
      badge(id, n) { const b = $('[data-b="' + id + '"]', host); if (b) { b.textContent = n; b.hidden = !n; } },
      async draw(id, force, quiet) { const t = list.find(x => x.id === id), el = $('[data-p="' + id + '"]', host); if (!t || !el) return; if (drawn[id] && !force) return; const again = drawn[id]; drawn[id] = true; if (!(quiet && again)) loading(el); try { await t.render(el, api); } catch (e) { drawn[id] = false; errCard(el, e, () => api.draw(id, true), o.friendly); if (window.console) console.warn('tab ' + id, e); } },
      open(id) { if (!list.some(x => x.id === id)) id = list[0].id; cur = id; try { sessionStorage.setItem(key, id); } catch (e) { } $$('.dx-t', host).forEach(b => { const on = b.dataset.t === id; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); }); $$('.dx-pane', host).forEach(p => { p.hidden = p.dataset.p !== id; }); const n = $('.dx-t.on', host); if (n && n.scrollIntoView && o.scroll !== false) { try { n.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { } } return api.draw(id, !!(o.fresh && o.fresh.indexOf(id) >= 0 && drawn[id]), true); },
      refresh(id) { return api.draw(id || cur, true); }, get current() { return cur; } };
    $('.dx-nav', host).onclick = e => { const b = e.target.closest('[data-t]'); if (b) api.open(b.dataset.t); };
    let first = o.first; try { first = first || sessionStorage.getItem(key); } catch (e) { } api.open(list.some(x => x.id === first) ? first : list[0].id); return api;
  }

  // a tag box: type, press Enter or comma, click x to remove. Used for universities, languages and so on.
  function tagBox(host, values, o) {
    o = o || {}; let v = (values || []).slice(); const max = o.max || 30;
    const draw = () => { host.innerHTML = '<div class="dx-tags">' + v.map((t, i) => '<span class="dx-tag">' + esc(t) + '<button type="button" data-i="' + i + '" aria-label="Remove ' + esc(t) + '">&times;</button></span>').join('') + '<input type="text" placeholder="' + esc(o.placeholder || 'Type and press Enter') + '" aria-label="' + esc(o.label || 'Add') + '"' + (v.length >= max ? ' disabled' : '') + '></div>'; const inp = $('input', host);
      const add = () => { const x = inp.value.split(',').map(s => s.trim()).filter(Boolean); if (!x.length) return; x.forEach(t => { if (v.length < max && !v.some(y => y.toLowerCase() === t.toLowerCase())) v.push(t.slice(0, 80)); }); draw(); $('input', host).focus(); };
      inp.onkeydown = e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } else if (e.key === 'Backspace' && !inp.value && v.length) { v.pop(); draw(); $('input', host).focus(); } }; inp.onblur = add; $$('[data-i]', host).forEach(b => b.onclick = () => { v.splice(+b.dataset.i, 1); draw(); $('input', host).focus(); }); };
    draw(); return { get: () => { const i = $('input', host); if (i && i.value.trim()) { i.value.split(',').map(s => s.trim()).filter(Boolean).forEach(t => { if (v.length < max && !v.some(y => y.toLowerCase() === t.toLowerCase())) v.push(t.slice(0, 80)); }); i.value = ''; } return v.slice(); } };
  }
  const csv = (rows, name) => { const q = s => '"' + String(s == null ? '' : s).replace(/"/g, '""').replace(/^([=+\-@])/, "'$1") + '"'; const text = rows.map(r => r.map(q).join(',')).join('\r\n'); const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
  const busy = (btn, v, txt) => { if (!btn) return; if (v) { btn.dataset.t = btn.textContent; btn.textContent = txt || 'Please wait…'; } else if (btn.dataset.t) btn.textContent = btn.dataset.t; btn.disabled = !!v; };
  const say = (el, text, ok) => { if (typeof el === 'string') el = $(el); if (!el) return; el.className = 'amsg ' + (ok ? 'ok' : 'bad'); el.textContent = text || ''; };

  // the "Messages" tab, the same for students and pilots
  UP.dash = UP.dash || {};
  UP.dash.notesTab = ctx => async function (el, api) {
    const sb = ctx.sb, uid = ctx.uid, U = UP.ui, run = async p => { const r = await p; if (r.error) throw r.error; return r.data; };

      let notes = await run(sb.from('notifications').select('id,title,body,link,created_at,read_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(60));
      const draw = () => { const un = notes.filter(n => !n.read_at).length; api.badge('notes', un);
        el.innerHTML = '<div class="dx-card"><div class="dx-h"><h3>Messages and reminders</h3>' + (un ? '<button class="btn out sm" type="button" id="mr">Mark all as read</button>' : '<span class="mute">All caught up</span>') + '</div>' + (notes.length ? notes.map(n => '<div class="dx-note' + (n.read_at ? '' : ' new') + '" data-id="' + esc(n.id) + '"><div><b>' + esc(n.title) + '</b>' + (n.body ? '<p>' + esc(n.body) + '</p>' : '') + '<small>' + esc(U.ago(n.created_at)) + '</small></div>' + (ctx.linkOK(n.link) ? '<button type="button" class="btn out sm" data-open="' + esc(n.link) + '">Open</button>' : '') + '</div>').join('') : U.empty('No messages yet', 'Deadline reminders and news from UniPilot appear here.')) + '</div>';
        const mr = $('#mr', el); if (mr) mr.onclick = async () => { mr.disabled = true; try { const t = new Date().toISOString(); await run(sb.from('notifications').update({ read_at: t }).eq('user_id', uid).is('read_at', null)); notes = notes.map(n => n.read_at ? n : Object.assign({}, n, { read_at: t })); draw(); } catch (e) { mr.disabled = false; U.toast(ctx.friendly(e), false); } }; };
      draw();
      el.onclick = async e => { const o = e.target.closest('[data-open]'); if (!o) return; const id = o.closest('[data-id]').dataset.id; try { await run(sb.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('user_id', uid)); } catch (x) { } ctx.openLink(o.dataset.open); };
  };
  UP.ui = { esc, $, $$, fmtDate, fmtDT, ago, money, daysLeft, dueChip, toast, modal, confirm: confirmBox, errCard, loading, empty, kpi, meter, tabs, tagBox, csv, busy, say, pad };
})();
