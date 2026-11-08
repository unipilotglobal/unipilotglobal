let ty = '', q = '', dt = false;
UP.boot('materials', U => {
  const { C, $, $$, esc, D } = U, types = Array.from(new Set(D.materials.map(m => m.type)));
  $('#mt').innerHTML = D.materials.length ? ['All'].concat(types).map(c => `<button class="chip ${(c === 'All' ? '' : c) === ty ? 'on' : ''}" data-c="${esc(c === 'All' ? '' : c)}">${esc(c)}</button>`).join('') : '';
  const PER = 12; let pgn = 1;   // 12 materials on each page
  $('#mt').onclick = e => { const b = e.target.closest('[data-c]'); if (b) { ty = b.dataset.c; pgn = 1; list(); } };
  $('#ms').oninput = e => { q = e.target.value.toLowerCase(); pgn = 1; list(); };
  function list() {
    $$('.chip', $('#mt')).forEach(b => b.classList.toggle('on', b.dataset.c === ty));
    const l = D.materials.filter(m => (!ty || m.type === ty) && (!q || (m.title + ' ' + m.text + ' ' + m.cat + ' ' + m.rel.join(' ')).toLowerCase().includes(q)));
    const pages = Math.max(1, Math.ceil(l.length / PER)); if (pgn > pages) pgn = pages;
    $('#ml').innerHTML = l.length ? l.slice((pgn - 1) * PER, pgn * PER).map(U.matCard).join('') : D.materials.length ? '<p class="mute">Nothing matches your search yet.</p>' : '<div class="box c" style="grid-column:1/-1"><h3>Free materials are coming soon</h3><p class="mute">We are preparing guides, templates and checklists. Message us on WhatsApp if you need something specific.</p></div>';
    // Page buttons (only when there is more than one page)
    let pg = $('#mpg');
    if (!pg) {
      pg = document.createElement('div'); pg.id = 'mpg'; pg.setAttribute('role', 'navigation'); pg.setAttribute('aria-label', 'Material pages'); pg.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;margin:24px 0 4px';
      $('#ml').after(pg);
    }
    // The page can build itself twice (first from saved data, then from fresh data), so the newest run always takes over the buttons.
    pg.onclick = e => { const b = e.target.closest('[data-p]'); if (!b || b.disabled) return; pgn = +b.dataset.p; list(); const top = $('#ml').getBoundingClientRect().top + window.scrollY - 110; window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' }); };
    if (pages < 2) { pg.innerHTML = ''; return; }
    const nums = []; for (let i = 1; i <= pages; i++) if (pages <= 7 || i === 1 || i === pages || Math.abs(i - pgn) <= 1) nums.push(i);
    const btn = (p, label, on, off) => `<button type="button" class="chip${on ? ' on' : ''}" data-p="${p}"${on ? ' aria-current="page"' : ''}${off ? ' disabled style="opacity:.4;cursor:default"' : ''}>${label}</button>`;
    let h = btn(pgn - 1, '&lsaquo; Previous', false, pgn === 1), last = 0;
    nums.forEach(n => { if (n - last > 1) h += '<span class="mute" aria-hidden="true">&hellip;</span>'; h += btn(n, n, n === pgn, false); last = n; });
    h += btn(pgn + 1, 'Next &rsaquo;', false, pgn === pages);
    pg.innerHTML = h + `<span class="mute" style="flex-basis:100%;text-align:center;font-size:.9rem">Showing ${(pgn - 1) * PER + 1}&ndash;${Math.min(pgn * PER, l.length)} of ${l.length}</span>`;
  }
  // Seminars (this page replaced the old seminars page)
  const upS = D.seminars.filter(s => s.up).sort((a, b) => a.date.localeCompare(b.date)), pastS = D.seminars.filter(s => !s.up).sort((a, b) => b.date.localeCompare(a.date));
  if (U.seminarsHeld() > 0) $('#hl').textContent = 'We have hosted ' + U.seminarsHeld() + ' seminars on scholarships, applications and studying abroad. Join the next one, watch the recordings, or use our guides and templates.';
  $('#up').innerHTML = upS.length ? upS.map(U.semCard).join('') : `<div class="box" style="grid-column:1/-1"><h3>The next seminar will be announced soon</h3><p class="mute">Follow us on Facebook or subscribe to deadline alerts to hear first.</p>${C.facebook ? `<a class="btn" href="${esc(C.facebook)}" target="_blank" rel="noopener">Follow on Facebook</a>` : ''}</div>`;
  $('#pastS').hidden = !pastS.length; $('#past').innerHTML = pastS.map(U.semCard).join('');
  $('#vidS').hidden = !D.videos.length; $('#vids').innerHTML = D.videos.map(U.videoCard).join('');
  $('#follow').innerHTML = (C.facebook ? `<a class="btn" href="${esc(C.facebook)}" target="_blank" rel="noopener">Follow on Facebook</a> ` : '') + (C.youtubeChannel ? `<a class="btn out" href="${esc(C.youtubeChannel)}" target="_blank" rel="noopener">Subscribe on YouTube</a>` : '');
  if (location.hash && document.querySelector(location.hash)) setTimeout(() => { try { document.querySelector(location.hash).scrollIntoView(); } catch (e) { } }, 60);
  list();
  const open = d => { if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }, shut = d => { if (d.close) d.close(); else d.removeAttribute('open'); };
  const topic = t => { if (!t) return; const ms = U.matForTopic(t), yq = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(t.q || (t.name + ' tips for scholarship applicants'));
    $('#td').innerHTML = `<button class="x" type="button" data-x aria-label="Close">&times;</button><div class="in"><div class="th"><span class="ti big">${esc(t.icon)}</span><div><h2 style="margin:0">${esc(t.name)}</h2><p class="mute" style="margin:6px 0 0">${esc(t.text)}</p></div></div>
    <h4 class="sh">Video guide</h4>${t.vid ? U.video(t.vid, t.name) : `<a class="ytq" href="${yq}" target="_blank" rel="noopener"><span class="pl">&#9654;</span><div><b>Watch ${esc(t.name)} videos on YouTube</b><small>Our own video guide is coming soon. Meanwhile, see the best free videos.</small></div></a>`}
    <h4 class="sh">Free materials</h4>${ms.length ? `<div class="mgrid">${ms.map(U.matCard).join('')}</div>` : '<p class="mute">We are adding materials for this topic. Message us on WhatsApp if you need something specific.</p>'}
    <div class="box c" style="margin-top:24px"><h3>Want an expert to check your ${esc(t.name)}?</h3><a class="btn" href="pilots.html?form=1">Find your pilot</a></div></div>`; open($('#td')); try { history.replaceState(null, '', '?topic=' + t.id); } catch (x) { } };
  $('#tg').innerHTML = D.topics.map(t => { const n = U.matForTopic(t).length; return `<button type="button" class="tile2" data-tp="${esc(t.id)}"><span class="ti">${esc(t.icon)}</span><b>${esc(t.name)}</b><small>${n ? n + (n === 1 ? ' free material' : ' free materials') : 'Videos and tips'}</small></button>`; }).join('');
  $('#tg').onclick = e => { const b = e.target.closest('[data-tp]'); if (b) topic(D.topics.find(t => t.id === b.dataset.tp)); };
  $('#td').onclick = e => { if (e.target.closest('[data-x]') || e.target === $('#td')) shut($('#td')); };
  $('#td').onclose = () => { try { history.replaceState(null, '', location.pathname); } catch (x) { } };
  const tp = new URLSearchParams(location.search).get('topic'); if (tp && !dt) { const t = D.topics.find(x => x.id === tp); if (t) { dt = true; topic(t); } }
});
