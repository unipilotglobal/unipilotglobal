let ready = false;
UP.boot('contact', U => {
  const { C, $, esc } = U, wa = U.wa('Hello UNIPILOT GLOBAL, I have a question.');
  $('#ways').innerHTML = (wa ? `<a class="btn wa" href="${wa}" target="_blank" rel="noopener">Chat on WhatsApp</a>` : '') + (C.email ? `<a class="btn out" href="mailto:${esc(C.email)}">${esc(C.email)}</a>` : '');
  if (ready) return; ready = true;
  const fill = () => { const u = U.sessUser(); if (!u) return; const nm = (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) || ''; if (u.email && !$('#email').value) $('#email').value = u.email; if (nm && !$('#name').value) $('#name').value = nm; };
  fill(); document.addEventListener('up-auth', fill);
  const t = new URLSearchParams(location.search).get('topic'); if (t) { const o = Array.from($('#topic').options).find(x => x.value.toLowerCase() === t.toLowerCase()); if (o) $('#topic').value = o.value; }
  $('#cf').onsubmit = async e => {
    e.preventDefault(); if ($('#hp').value) return;
    const v = id => $('#' + id).value.trim(), out = $('#out'), btn = $('#go'), label = btn.textContent;
    if (!v('name') || !/^\S+@\S+\.\S+$/.test(v('email')) || !v('msg') || !$('#ok').checked) { out.innerHTML = '<div class="msg err" role="alert">Please add your name, a valid email, your message, and tick the agreement box.</div>'; out.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    const p = { action: 'contact', website: '', Name: v('name'), Email: v('email'), Topic: v('topic') || 'Not chosen', WhatsApp: v('phone'), Message: v('msg'), Page: location.pathname };
    btn.disabled = true; btn.textContent = 'Sending...';
    try { await U.send(p); out.innerHTML = '<div class="msg ok"><b>Thank you, ' + esc(p.Name) + '!</b> We have your message and will reply soon.</div>'; e.target.reset(); fill(); } catch (err) { out.innerHTML = U.failBox(p, 'my question', err); }
    btn.disabled = false; btn.textContent = label; out.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
});
