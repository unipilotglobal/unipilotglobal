let ty = '', q = '', dt = false;
UP.boot('materials', U => {
  const { $, $$, esc, D } = U, types = Array.from(new Set(D.materials.map(m => m.type)));
  $('#mt').innerHTML = D.materials.length ? ['All'].concat(types).map(c => `<button class="chip ${(c === 'All' ? '' : c) === ty ? 'on' : ''}" data-c="${esc(c === 'All' ? '' : c)}">${esc(c)}</button>`).join('') : '';
  $('#mt').onclick = e => { const b = e.target.closest('[data-c]'); if (b) { ty = b.dataset.c; list(); } };
  $('#ms').oninput = e => { q = e.target.value.toLowerCase(); list(); };
  function list() {
    $$('.chip', $('#mt')).forEach(b => b.classList.toggle('on', b.dataset.c === ty));
    const l = D.materials.filter(m => (!ty || m.type === ty) && (!q || (m.title + ' ' + m.text + ' ' + m.cat + ' ' + m.rel.join(' ')).toLowerCase().includes(q)));
    $('#ml').innerHTML = l.length ? l.map(U.matCard).join('') : D.materials.length ? '<p class="mute">Nothing matches your search yet.</p>' : '<div class="box c" style="grid-column:1/-1"><h3>Free materials are coming soon</h3><p class="mute">We are preparing guides, templates and checklists. Message us on WhatsApp if you need something specific.</p></div>';
  }
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
