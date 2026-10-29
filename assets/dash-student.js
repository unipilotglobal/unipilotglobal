/* UNIPILOT GLOBAL: the student dashboard. Every request is limited by the database to the signed-in student's own rows. */
(function () {
  'use strict';
  const UP = window.UP, U = UP.ui, esc = U.esc, $ = U.$, $$ = U.$$;
  UP.dash = UP.dash || {};

  const STATUS = [['planning', 'Planning'], ['preparing', 'Preparing'], ['submitted', 'Submitted'], ['interview', 'Interview'], ['accepted', 'Accepted'], ['rejected', 'Not selected'], ['withdrawn', 'Withdrawn']];
  const ACTIVE = ['planning', 'preparing', 'submitted', 'interview'];
  const LVL = { Bachelor: "Bachelor's", Master: "Master's", PhD: 'PhD' };
  const BOOK = { requested: 'Waiting for payment', confirmed: 'Confirmed', completed: 'Completed', cancelled_by_student: 'Cancelled by you', cancelled_by_pilot: 'Cancelled by the pilot', no_show_student: 'Missed', no_show_pilot: 'Pilot missed it', expired: 'Expired', refunded: 'Refunded', disputed: 'Under review' };
  const opps = () => (UP.D && UP.D.opps) || [], oppOf = ref => opps().find(o => String(o.id) === String(ref));
  const run = async p => { const r = await p; if (r.error) throw r.error; return r.data; };

  // how well a listing fits what the student told us; null = does not fit
  function fit(o, g) {
    if (!o || o.closed) return null; let s = 0; const why = [];
    if (g.level) { if (!(o.levels || []).includes(g.level)) return null; s += 3; why.push(LVL[g.level] || g.level); }
    if (g.subject) { if ((o.subjects || []).includes(g.subject)) { s += 3; why.push(g.subject); } else if ((o.subjects || []).includes('All fields')) { s += 1; why.push('Open to all fields'); } else return null; }
    if (g.country) { if (!(o.countries || []).includes(g.country)) return null; s += 2; why.push('Study in ' + g.country); }
    else if (g.region) { if (!(o.regions || []).includes(g.region)) return null; s += 2; why.push(g.region); }
    if (g.fund === 'full') { if (o.funding === 'full') { s += 2; why.push('Fully funded'); } }
    return { o, s, why };
  }
  const matches = g => opps().map(o => fit(o, g)).filter(Boolean).sort((a, b) => b.s - a.s || (() => { const x = U.daysLeft(a.o.closes), y = U.daysLeft(b.o.closes); return (x == null ? 9999 : x) - (y == null ? 9999 : y); })() || a.o.name.localeCompare(b.o.name));
  const hasGoals = g => !!(g && (g.level || g.subject || g.region || g.country));

  UP.dash.student = function (host, ctx) {
    const sb = ctx.sb, uid = ctx.uid, say = U.say, busy = U.busy;
    const goals = () => (ctx.pr.onboarding && ctx.pr.onboarding.goals) || {};
    let savedCache = null;
    const loadSaved = async force => { if (!savedCache || force) savedCache = await run(sb.from('saved_items').select('kind,ref,created_at').eq('user_id', uid).order('created_at', { ascending: false })); return savedCache; };
    const isSaved = (kind, ref) => (savedCache || []).some(s => s.kind === kind && s.ref === String(ref));
    async function toggleSave(kind, ref, btn) {
      if (btn) btn.disabled = true;
      try {
        if (isSaved(kind, ref)) { await run(sb.from('saved_items').delete().eq('user_id', uid).eq('kind', kind).eq('ref', String(ref))); savedCache = savedCache.filter(s => !(s.kind === kind && s.ref === String(ref))); U.toast('Removed from saved', true); }
        else { await run(sb.from('saved_items').insert({ user_id: uid, kind, ref: String(ref) })); savedCache.unshift({ kind, ref: String(ref), created_at: new Date().toISOString() }); U.toast('Saved', true); }
      } catch (e) { U.toast(ctx.friendly(e), false); }
      if (btn) btn.disabled = false; return isSaved(kind, ref);
    }
    async function addApplication(o, extra) {
      const row = Object.assign({ student_id: uid, title: o ? o.name : 'My application', opportunity_ref: o ? String(o.id) : null, status: 'planning', deadline: o && o.closes && /^\d{4}-\d{2}-\d{2}/.test(o.closes) ? String(o.closes).slice(0, 10) : null }, extra || {});
      await run(sb.from('applications').insert(row)); return row;
    }
    const oppRow = (m, saved) => { const o = m.o, dl = U.daysLeft(o.closes);
      return '<div class="dx-item"><div class="dx-item-main"><a href="opportunity.html?id=' + encodeURIComponent(o.id) + '"><b>' + esc(o.name) + '</b></a><small>' + esc([o.sponsor, (o.countries || []).slice(0, 3).join(', ')].filter(Boolean).join(' · ')) + '</small>' + (m.why && m.why.length ? '<div class="dx-why">' + m.why.map(w => '<span>' + esc(w) + '</span>').join('') + '</div>' : '') + '</div><div class="dx-item-side">' + U.dueChip(dl) + '<button type="button" class="btn out sm" data-sv="' + esc(o.id) + '">' + (saved ? 'Saved' : 'Save') + '</button></div></div>'; };
    const bindSaves = (el, rerender) => { el.onclick = async e => { const b = e.target.closest('[data-sv]'); if (!b) return; const on = await toggleSave('scholarship', b.dataset.sv, b); b.textContent = on ? 'Saved' : 'Save'; if (rerender) rerender(); }; };

    // ---------------------------------------------------------------- overview
    async function tOverview(el, api) {
      const [saved, apps, books, notes] = await Promise.all([loadSaved(true), run(sb.from('applications').select('id,title,status,deadline,opportunity_ref').eq('student_id', uid)), run(sb.from('bookings').select('id,status,starts_at,pilot_id').eq('student_id', uid)), run(sb.from('notifications').select('id,read_at').eq('user_id', uid).is('read_at', null))]);
      api.badge('notes', notes.length);
      const nSch = saved.filter(s => s.kind === 'scholarship').length, active = apps.filter(a => ACTIVE.includes(a.status)), up = books.filter(b => ['requested', 'confirmed'].includes(b.status) && Date.parse(b.starts_at) > Date.now());
      const g = goals(), fields = [ctx.pr.full_name, ctx.pr.phone, ctx.pr.country, g.level, g.subject, g.region || g.country], pct = Math.round(fields.filter(Boolean).length / fields.length * 100);
      const dues = []; active.forEach(a => { const n = U.daysLeft(a.deadline); if (n != null && n >= 0) dues.push({ t: a.title, n, kind: 'Application', href: '' }); });
      saved.filter(s => s.kind === 'scholarship').forEach(s => { const o = oppOf(s.ref); const n = o ? U.daysLeft(o.closes) : null; if (o && n != null && n >= 0 && !dues.some(d => d.t === o.name)) dues.push({ t: o.name, n, kind: 'Saved', href: 'opportunity.html?id=' + encodeURIComponent(o.id) }); });
      dues.sort((a, b) => a.n - b.n);
      const top = hasGoals(g) ? matches(g).slice(0, 3) : [];
      el.innerHTML = '<div class="dx-kpis">' + U.kpi('Saved scholarships', nSch) + U.kpi('Applications in progress', active.length) + U.kpi('Upcoming sessions', up.length) + U.kpi('New messages', notes.length, '', notes.length ? 'hot' : '') + '</div>' +
        (pct < 100 ? '<div class="dx-card dx-prompt"><div><h3>Your profile is ' + pct + '% complete</h3><p class="mute">Tell us your degree, subject and where you want to study. We will show scholarships that fit you.</p>' + U.meter(pct, 'Profile completeness') + '</div><button type="button" class="btn" data-go="matches">Complete it</button></div>' : '') +
        '<div class="dx-card"><div class="dx-h"><h3>Deadlines coming up</h3><button class="btn out sm" type="button" data-go="applications">My applications</button></div>' + (dues.length ? dues.slice(0, 5).map(d => '<div class="dx-item"><div class="dx-item-main">' + (d.href ? '<a href="' + esc(d.href) + '"><b>' + esc(d.t) + '</b></a>' : '<b>' + esc(d.t) + '</b>') + '<small>' + d.kind + '</small></div><div class="dx-item-side">' + U.dueChip(d.n) + '</div></div>').join('') : U.empty('No deadlines yet', 'Save a scholarship or add an application with a deadline and it will show up here.', '<a class="btn sm" href="scholarships.html">Find scholarships</a>')) + '</div>' +
        '<div class="dx-card"><div class="dx-h"><h3>Picked for you</h3><button class="btn out sm" type="button" data-go="matches">See all</button></div>' + (top.length ? '<div id="ovm">' + top.map(m => oppRow(m, isSaved('scholarship', m.o.id))).join('') + '</div>' : U.empty('Nothing to show yet', 'Choose what you are looking for and your matches appear here.', '<button class="btn sm" type="button" data-go="matches">Choose what I need</button>')) + '</div>' +
        '<div class="dx-card"><h3>Need a person to talk to?</h3><p class="mute" style="margin:0 0 12px">Our pilots have already won scholarships. Send a short session request and we will match you.</p><a class="btn" href="pilots.html">Find your pilot</a> <a class="btn out" href="contact.html">Ask a question</a></div>';
      $$('[data-go]', el).forEach(b => b.onclick = () => api.open(b.dataset.go)); const ov = $('#ovm', el); if (ov) bindSaves(ov);
    }

    // ---------------------------------------------------------------- matches (and the "what I am looking for" form)
    async function tMatches(el, api) {
      await loadSaved(); const g = goals(), shown = hasGoals(g);
      el.innerHTML = '<div class="dx-card"><div class="dx-h"><h3>What are you looking for?</h3></div><form id="gf" class="dx-form" novalidate><div><label for="g1">Degree</label><select id="g1"></select></div><div><label for="g2">Subject</label><select id="g2"></select></div><div><label for="g3">Continent</label><select id="g3"></select></div><div><label for="g4">Country</label><select id="g4"></select></div><div class="w2"><label class="ck"><input type="checkbox" id="g5"> Show fully funded scholarships first</label></div><div class="w2 dx-row"><button class="btn" id="gsb" type="submit">Show my matches</button><span class="amsg" id="gm" role="status" aria-live="polite"></span></div></form></div><div id="mres"></div>';
      UP.fill && ['level', 'subject', 'region', 'country'].forEach((k, i) => { const s = $('#g' + (i + 1), el); s.innerHTML = UP.optHTML(k); s.value = g[k] || ''; }); $('#g5', el).checked = g.fund === 'full';
      const list = () => { const cur = goals(), res = $('#mres', el); if (!hasGoals(cur)) { res.innerHTML = '<div class="dx-card">' + U.empty('Choose at least one option above', 'Pick a degree, subject or place and we will list the scholarships that fit.') + '</div>'; return; }
        const m = matches(cur), qs = new URLSearchParams(); ['level', 'subject', 'region', 'country'].forEach(k => cur[k] && qs.set(k, cur[k]));
        res.innerHTML = '<div class="dx-card"><div class="dx-h"><h3>' + (m.length ? m.length + (m.length === 1 ? ' match' : ' matches') : 'No exact match yet') + '</h3><a class="btn out sm" href="scholarships.html?' + esc(qs.toString()) + '">Open in the finder</a></div>' +
          (m.length ? '<div id="mlist">' + m.slice(0, 30).map(x => oppRow(x, isSaved('scholarship', x.o.id))).join('') + '</div>' + (m.length > 30 ? '<p class="mute" style="margin:12px 0 0">Showing the best 30. Use the finder to see them all.</p>' : '') : '<p class="mute" style="margin:0">Try a wider choice, for example another country or "any subject". New scholarships are added all the time.</p>') + '</div>'; const ml = $('#mlist', el); if (ml) bindSaves(ml); };
      list();
      $('#gf', el).onsubmit = async ev => {
        ev.preventDefault(); const ng = { level: $('#g1', el).value, subject: $('#g2', el).value, region: $('#g3', el).value, country: $('#g4', el).value, fund: $('#g5', el).checked ? 'full' : '' }, b = $('#gsb', el); busy(b, true, 'Saving…');
        try { const ob = Object.assign({}, ctx.pr.onboarding || {}, { goals: ng }); await run(sb.from('profiles').update({ onboarding: ob }).eq('id', uid)); ctx.pr.onboarding = ob; say($('#gm', el), 'Saved. You can change this any time.', true); list(); } catch (e) { say($('#gm', el), ctx.friendly(e)); }
        busy(b, false);
      };
    }

    // ---------------------------------------------------------------- saved
    async function tSaved(el, api) {
      const items = await loadSaved(true), sch = items.filter(s => s.kind === 'scholarship'), pil = items.filter(s => s.kind === 'pilot'), other = items.filter(s => !['scholarship', 'pilot'].includes(s.kind));
      const app = new Set((await run(sb.from('applications').select('opportunity_ref').eq('student_id', uid))).map(a => String(a.opportunity_ref)));
      el.innerHTML = '<div class="dx-card"><div class="dx-h"><h3>Saved scholarships</h3><a class="btn out sm" href="scholarships.html">Find more</a></div>' + (sch.length ? sch.map(s => { const o = oppOf(s.ref), dl = o ? U.daysLeft(o.closes) : null;
        return '<div class="dx-item"><div class="dx-item-main">' + (o ? '<a href="opportunity.html?id=' + encodeURIComponent(o.id) + '"><b>' + esc(o.name) + '</b></a><small>' + esc([o.sponsor, o.deadline ? 'Deadline: ' + o.deadline : ''].filter(Boolean).join(' · ')) + '</small>' : '<b>' + esc(s.ref) + '</b><small>No longer listed</small>') + '</div><div class="dx-item-side">' + U.dueChip(dl) + (o && !app.has(String(o.id)) ? '<button type="button" class="btn out sm" data-app="' + esc(s.ref) + '">Start application</button>' : o ? '<span class="pill ok">In my applications</span>' : '') + '<button type="button" class="btn out sm" data-rm="scholarship:' + esc(s.ref) + '">Remove</button></div></div>'; }).join('') : U.empty('Nothing saved yet', 'Open any scholarship and press Save. It will wait for you here.', '<a class="btn sm" href="scholarships.html">Find scholarships</a>')) + '</div>' +
        '<div class="dx-card"><div class="dx-h"><h3>Saved pilots</h3><a class="btn out sm" href="pilots.html">Meet the pilots</a></div>' + (pil.length ? pil.map(s => { const e = (UP.D.experts || []).find(x => String(x.id) === String(s.ref)); return '<div class="dx-item"><div class="dx-item-main">' + (e ? '<a href="pilots.html?pilot=' + encodeURIComponent(e.id) + '"><b>' + esc(e.name) + '</b></a><small>' + esc([e.field, e.loc].filter(Boolean).join(' · ')) + '</small>' : '<b>' + esc(s.ref) + '</b><small>Profile not listed right now</small>') + '</div><div class="dx-item-side"><button type="button" class="btn out sm" data-rm="pilot:' + esc(s.ref) + '">Remove</button></div></div>'; }).join('') : U.empty('No saved pilots', 'Press Save on a pilot profile to keep it here.')) + '</div>' +
        (other.length ? '<div class="dx-card"><h3>Other saved items</h3>' + other.map(s => '<div class="dx-item"><div class="dx-item-main"><b>' + esc(s.ref) + '</b><small>' + esc(s.kind) + '</small></div><div class="dx-item-side"><button type="button" class="btn out sm" data-rm="' + esc(s.kind + ':' + s.ref) + '">Remove</button></div></div>').join('') + '</div>' : '');
      el.onclick = async e => {
        const rm = e.target.closest('[data-rm]'), ap = e.target.closest('[data-app]');
        if (rm) { const k = rm.dataset.rm, i = k.indexOf(':'); rm.disabled = true; try { await run(sb.from('saved_items').delete().eq('user_id', uid).eq('kind', k.slice(0, i)).eq('ref', k.slice(i + 1))); U.toast('Removed', true); api.refresh('saved'); } catch (x) { rm.disabled = false; U.toast(ctx.friendly(x), false); } }
        if (ap) { const o = oppOf(ap.dataset.app); if (!o) return; ap.disabled = true; try { await addApplication(o); U.toast('Added to your applications', true); api.refresh('saved'); } catch (x) { ap.disabled = false; U.toast(ctx.friendly(x), false); } }
      };
    }

    // ---------------------------------------------------------------- applications tracker
    async function tApps(el, api) {
      const rows = await run(sb.from('applications').select('id,title,status,deadline,notes,opportunity_ref,created_at').eq('student_id', uid)); const sorted = rows.slice().sort((a, b) => String(a.deadline || '9999').localeCompare(String(b.deadline || '9999')) || a.title.localeCompare(b.title));
      const act = sorted.filter(a => ACTIVE.includes(a.status)), fin = sorted.filter(a => !ACTIVE.includes(a.status));
      const card = a => { const n = U.daysLeft(a.deadline), open = ACTIVE.includes(a.status);
        return '<div class="dx-app" data-id="' + esc(a.id) + '"><div class="dx-app-h"><div><b>' + (a.opportunity_ref && oppOf(a.opportunity_ref) ? '<a href="opportunity.html?id=' + encodeURIComponent(a.opportunity_ref) + '">' + esc(a.title) + '</a>' : esc(a.title)) + '</b><small>' + (a.deadline ? 'Deadline ' + esc(U.fmtDate(a.deadline)) : 'No deadline set') + '</small></div><div class="dx-item-side">' + (open ? U.dueChip(n) : '') + '<select class="dx-st" data-st aria-label="Status of ' + esc(a.title) + '">' + STATUS.map(s => '<option value="' + s[0] + '"' + (s[0] === a.status ? ' selected' : '') + '>' + s[1] + '</option>').join('') + '</select></div></div>' +
          '<details class="dx-more"><summary>Notes and details</summary><div class="dx-form"><div><label>Deadline</label><input type="date" data-dl value="' + esc(a.deadline ? String(a.deadline).slice(0, 10) : '') + '"></div><div class="w2"><label>Notes (documents to prepare, referees, login details you must remember…)</label><textarea rows="3" data-nt maxlength="2000">' + esc(a.notes || '') + '</textarea></div><div class="w2 dx-row"><button type="button" class="btn sm" data-save>Save</button><button type="button" class="btn out sm" data-del style="color:#b3261e">Delete</button></div></div></details></div>'; };
      const counts = STATUS.map(s => [s[1], rows.filter(a => a.status === s[0]).length]).filter(x => x[1]);
      el.innerHTML = '<div class="dx-card"><div class="dx-h"><h3>My applications</h3><button type="button" class="btn sm" id="aadd">Add application</button></div>' + (counts.length ? '<div class="dx-chips">' + counts.map(c => '<span class="pill">' + esc(c[0]) + ': ' + c[1] + '</span>').join('') + '</div>' : '') + '<p class="mute" style="margin:8px 0 0">Add the deadline and we will remind you before it closes. Change the status as you move forward.</p></div>' +
        (act.length ? '<div class="dx-card"><h3>In progress</h3>' + act.map(card).join('') + '</div>' : '<div class="dx-card">' + U.empty('No applications yet', 'Track each scholarship you apply to: deadline, status and your own notes.', '<button class="btn sm" type="button" id="aadd2">Add my first application</button>') + '</div>') + (fin.length ? '<div class="dx-card"><h3>Finished</h3>' + fin.map(card).join('') + '</div>' : '');
      const openAdd = () => {
        const saved = (savedCache || []).filter(s => s.kind === 'scholarship').map(s => oppOf(s.ref)).filter(Boolean);
        const d = U.modal('<h2 style="margin:0 0 12px">Add an application</h2><form id="naf" class="dx-form" novalidate><div class="w2"><label for="na1">Scholarship or programme</label><input id="na1" list="na-l" maxlength="160" placeholder="Start typing a scholarship name" autocomplete="off" required><datalist id="na-l">' + opps().filter(o => !o.closed).slice(0, 400).map(o => '<option value="' + esc(o.name) + '">').join('') + '</datalist>' + (saved.length ? '<small class="mute">Tip: you saved ' + saved.length + ' scholarship' + (saved.length > 1 ? 's' : '') + ' already.</small>' : '') + '</div><div><label for="na2">Deadline</label><input id="na2" type="date"></div><div><label for="na3">Status</label><select id="na3">' + STATUS.slice(0, 4).map(s => '<option value="' + s[0] + '">' + s[1] + '</option>').join('') + '</select></div><div class="w2 dx-row"><button class="btn" type="submit" id="nab">Add</button><span class="amsg" id="nam" role="status" aria-live="polite"></span></div></form>');
        const inp = $('#na1', d), dl = $('#na2', d); inp.oninput = () => { const o = opps().find(x => x.name === inp.value); if (o && o.closes && !dl.value && /^\d{4}-\d{2}-\d{2}/.test(o.closes)) dl.value = String(o.closes).slice(0, 10); };
        $('#naf', d).onsubmit = async ev => { ev.preventDefault(); const t = inp.value.trim(); if (t.length < 2) return say($('#nam', d), 'Please type the name of the scholarship.'); const o = opps().find(x => x.name === t), b = $('#nab', d); busy(b, true, 'Adding…');
          try { await run(sb.from('applications').insert({ student_id: uid, title: t.slice(0, 160), opportunity_ref: o ? String(o.id) : null, status: $('#na3', d).value, deadline: dl.value || null })); d.close2(true); U.toast('Application added', true); api.refresh('applications'); } catch (e) { say($('#nam', d), ctx.friendly(e)); busy(b, false); } };
      };
      ['#aadd', '#aadd2'].forEach(s => { const b = $(s, el); if (b) b.onclick = openAdd; });
      el.onchange = async e => { const s = e.target.closest('[data-st]'); if (!s) return; const id = s.closest('[data-id]').dataset.id; s.disabled = true; try { await run(sb.from('applications').update({ status: s.value }).eq('id', id).eq('student_id', uid)); U.toast('Status updated', true); api.refresh('applications'); } catch (x) { s.disabled = false; U.toast(ctx.friendly(x), false); } };
      el.onclick = async e => {
        const sv = e.target.closest('[data-save]'), del = e.target.closest('[data-del]'); if (!sv && !del) return; const box = e.target.closest('[data-id]'), id = box.dataset.id;
        if (sv) { busy(sv, true, 'Saving…'); try { await run(sb.from('applications').update({ deadline: $('[data-dl]', box).value || null, notes: $('[data-nt]', box).value.trim() || null }).eq('id', id).eq('student_id', uid)); U.toast('Saved', true); api.refresh('applications'); } catch (x) { busy(sv, false); U.toast(ctx.friendly(x), false); } }
        if (del && await U.confirm('Delete this application?', 'Its notes and reminders will be removed.', 'Delete', true)) { try { await run(sb.from('applications').delete().eq('id', id).eq('student_id', uid)); U.toast('Deleted', true); api.refresh('applications'); } catch (x) { U.toast(ctx.friendly(x), false); } }
      };
    }

    // ---------------------------------------------------------------- documents (private files; optional sharing with a pilot the student booked)
    const KINDS = [['cv', 'CV / Resume'], ['sop', 'SOP / motivation letter'], ['transcript', 'Transcript'], ['certificate', 'Certificate'], ['recommendation', 'Recommendation letter'], ['language_test', 'Language test (IELTS, TOEFL…)'], ['other', 'Other']];
    const KIND = Object.fromEntries(KINDS), EXT = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', txt: 'text/plain' }, MAXB = 10485760, MAXN = 25;
    const uuid = () => { try { return crypto.randomUUID(); } catch (e) { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); } };
    async function tDocs(el, api) {
      const [docs, shares, pl] = await Promise.all([run(sb.from('documents').select('id,name,kind,storage_path,size_bytes,uploaded_at').eq('student_id', uid).order('uploaded_at', { ascending: false })), run(sb.from('document_shares').select('document_id,pilot_id,expires_at')), sb.from('pilots').select('id,display_name').then(r => r.data || [], () => [])]);
      const pname = {}; pl.forEach(x => pname[x.id] = x.display_name); const live = shares.filter(x => Date.parse(x.expires_at) > Date.now());
      const sharedWith = id => live.filter(x => x.document_id === id).map(x => pname[x.pilot_id] || 'a pilot');
      el.innerHTML = '<form class="dx-card dx-form" id="dfu" novalidate><h3 class="w2" style="margin:0">My documents</h3><p class="mute w2" style="margin:0">Keep your CV, motivation letters, transcripts and certificates in one private place. <b>Only you can see them.</b> You can choose to share a file with a pilot you have booked, for 30 days, and stop sharing any time.</p>' +
        '<div><label for="dk">What is it?</label><select id="dk">' + KINDS.map(k => '<option value="' + k[0] + '">' + esc(k[1]) + '</option>').join('') + '</select></div><div><label for="dn">Name (optional)</label><input id="dn" maxlength="120" placeholder="For example: CV for DAAD"></div>' +
        '<div class="w2"><label for="df">File (PDF, Word, JPG, PNG or text, up to 10 MB)</label><input id="df" type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"></div><div class="w2 dx-row"><button class="btn" id="db" type="submit">Upload</button><span class="amsg" id="dm" role="status" aria-live="polite"></span></div></form>' +
        '<div class="dx-card"><div class="dx-h"><h3>Your files</h3><span class="pill">' + docs.length + ' of ' + MAXN + '</span></div>' + (docs.length ? docs.map(d => { const w = sharedWith(d.id); return '<div class="dx-app dx-doc" data-id="' + esc(d.id) + '"><div class="dx-app-h"><div><b>' + esc(d.name) + '</b><small>' + esc(KIND[d.kind] || 'Other') + (d.size_bytes != null ? ' · ' + esc(U.fmtSize(d.size_bytes)) : '') + ' · added ' + esc(U.fmtDate(d.uploaded_at)) + '</small>' + (w.length ? '<small class="dx-shared">&#128279; Shared with ' + esc(w.join(', ')) + '</small>' : '') + '</div><div class="dx-item-side"><button class="btn out sm" type="button" data-dl>Download</button><button class="btn out sm" type="button" data-share>Share…</button><button class="btn out sm bk-cx" type="button" data-rm>Delete</button></div></div></div>'; }).join('') : U.empty('No documents yet', 'Upload your first file above. Having your CV and SOP ready makes applications and pilot sessions much easier.')) + '</div>';
      const fi = $('#df', el), m = $('#dm', el);
      $('#dfu', el).onsubmit = async ev => {
        ev.preventDefault(); const f = fi.files && fi.files[0]; if (!f) return say(m, 'Please choose a file first.');
        const ext = (f.name.split('.').pop() || '').toLowerCase(); if (!EXT[ext]) return say(m, 'This file type is not allowed. Please use PDF, Word, JPG, PNG or text.');
        if (f.size <= 0) return say(m, 'This file is empty.'); if (f.size > MAXB) return say(m, 'This file is larger than 10 MB. Please make it smaller and try again.');
        if (docs.length >= MAXN) return say(m, 'You can keep up to ' + MAXN + ' files. Please delete one first.');
        const b = $('#db', el), path = uid + '/' + uuid() + '.' + ext, name = ($('#dn', el).value.trim() || f.name).slice(0, 200); busy(b, true, 'Uploading…'); say(m, '');
        try {
          const up = await sb.storage.from('student-docs').upload(path, f, { contentType: EXT[ext], upsert: false }); if (up.error) throw up.error;
          const ins = await sb.from('documents').insert({ student_id: uid, name, kind: $('#dk', el).value, storage_path: path, size_bytes: f.size });
          if (ins.error) { try { await sb.storage.from('student-docs').remove([path]); } catch (x) { } throw ins.error; }
          U.toast('Uploaded', true); api.refresh('documents');
        } catch (e) { busy(b, false); say(m, ctx.friendly(e)); }
      };
      el.onclick = async ev => {
        const box = ev.target.closest('[data-id]'); if (!box) return; const d = docs.find(x => x.id === box.dataset.id); if (!d) return;
        const dl = ev.target.closest('[data-dl]'), sh = ev.target.closest('[data-share]'), rm = ev.target.closest('[data-rm]');
        if (dl) { busy(dl, true, 'Opening…'); try { await U.openDoc(sb, d.storage_path, d.name); } catch (e) { U.toast(ctx.friendly(e), false); } busy(dl, false); }
        if (rm && await U.confirm('Delete this file?', '“' + d.name + '” will be removed for good, and any pilot it was shared with can no longer open it.', 'Delete', true)) {
          try { const r = await sb.storage.from('student-docs').remove([d.storage_path]); if (r.error) throw r.error; await run(sb.from('documents').delete().eq('id', d.id).eq('student_id', uid)); U.toast('Deleted', true); api.refresh('documents'); } catch (e) { U.toast(ctx.friendly(e), false); }
        }
        if (sh) shareDialog(d, api);
      };
    }
    // choose which of my pilots may open one file (only pilots I have a confirmed or recent session with)
    async function shareDialog(d, api) {
      let mine = [], cur = [];
      try {
        const [bk, shs, pl] = await Promise.all([run(sb.from('bookings').select('pilot_id,status,completed_at').eq('student_id', uid)), run(sb.from('document_shares').select('pilot_id,expires_at').eq('document_id', d.id)), sb.from('pilots').select('id,display_name').then(r => r.data || [], () => [])]);
        const nm = {}; pl.forEach(x => { nm[x.id] = x.display_name; }); const ok = new Set(bk.filter(b => b.status === 'confirmed' || (b.status === 'completed' && b.completed_at && Date.now() - Date.parse(b.completed_at) < 30 * 864e5)).map(b => b.pilot_id));
        mine = Array.from(ok).map(id => ({ id, name: nm[id] || 'Your pilot' })); cur = shs;
      } catch (e) { return U.toast(ctx.friendly(e), false); }
      const isOn = id => cur.some(x => x.pilot_id === id && Date.parse(x.expires_at) > Date.now()), until = id => { const x = cur.find(y => y.pilot_id === id); return x ? U.fmtDate(x.expires_at) : ''; };
      const dlg = U.modal('<h2 style="margin:0 0 6px">Share “' + esc(d.name) + '”</h2><p class="mute" style="margin:0 0 12px">A pilot can open the file for <b>30 days</b>. You can stop sharing any time. Only pilots you have a session with can be chosen.</p>' +
        (mine.length ? mine.map(p => '<div class="dx-item" data-pid="' + esc(p.id) + '"><div class="dx-item-main"><b>' + esc(p.name) + '</b><small>' + (isOn(p.id) ? 'Can open it until ' + esc(until(p.id)) : 'Not shared') + '</small></div><div class="dx-item-side">' + (isOn(p.id) ? '<button class="btn out sm" type="button" data-off>Stop sharing</button>' : '<button class="btn sm" type="button" data-on>Share for 30 days</button>') + '</div></div>').join('') : '<div class="dx-empty"><p>You can share files with a pilot after you book a session with them.</p><a class="btn sm" href="pilots.html">Find a pilot</a></div>') + '<p class="amsg" id="sm" role="status" aria-live="polite"></p>');
      dlg.onclick = async ev => {
        const row = ev.target.closest('[data-pid]'), on = ev.target.closest('[data-on]'), off = ev.target.closest('[data-off]'); if (!row || (!on && !off)) return; const pid = row.dataset.pid, b = on || off; busy(b, true, 'Saving…');
        try {
          if (off) await run(sb.from('document_shares').delete().eq('document_id', d.id).eq('pilot_id', pid));
          else { await sb.from('document_shares').delete().eq('document_id', d.id).eq('pilot_id', pid); await run(sb.from('document_shares').insert({ document_id: d.id, pilot_id: pid })); }
          U.toast(off ? 'No longer shared' : 'Shared for 30 days', true); dlg.close2(true); api.refresh('documents');
        } catch (e) { busy(b, false); say($('#sm', dlg), ctx.friendly(e)); }
      };
    }

    // ---------------------------------------------------------------- sessions
    let pollN = 0, pollT = null;
    async function tSessions(el, api) {
      const [books, revs, sv, st, pl] = await Promise.all([
        run(sb.from('bookings').select('id,pilot_id,service_id,starts_at,ends_at,status,price_cents,currency,meeting_url,created_at').eq('student_id', uid).order('starts_at', { ascending: false })),
        run(sb.from('reviews').select('booking_id,rating').eq('student_id', uid)),
        sb.from('pilot_services').select('id,title').then(r => r.data || [], () => []), sb.from('app_settings').select('key,value').in('key', ['cancel_hours', 'unpaid_hold_minutes', 'payments_enabled']).then(r => r.data || [], () => []),
        sb.from('pilots').select('id,display_name').then(r => r.data || [], () => [])]);
      const cfg = { cancel_hours: 24, unpaid_hold_minutes: 45, payments_enabled: false }; st.forEach(x => { cfg[x.key] = x.value; }); cfg.payments_enabled = cfg.payments_enabled === true || cfg.payments_enabled === 'true'; cfg.unpaid_hold_minutes = +cfg.unpaid_hold_minutes || 45; cfg.cancel_hours = +cfg.cancel_hours || 24;
      const pil = {}; pl.forEach(p => pil[p.id] = p.display_name); const svc = {}; sv.forEach(x => svc[x.id] = x.title);
      const co = ctx.checkout; ctx.checkout = null;
      let banner = '';
      if (co && co.state === 'success') { const bk = books.find(x => x.id === co.booking); banner = bk && bk.status === 'confirmed' ? '<div class="dx-card dx-flash ok" role="status"><b>Payment received. Your session is confirmed.</b><span>We emailed you the details. Add it to your calendar below.</span></div>' : '<div class="dx-card dx-flash ok" role="status"><b>Thank you! We are confirming your payment…</b><span>This usually takes a few seconds. This page updates by itself.</span></div>'; if (!(bk && bk.status === 'confirmed') && pollN < 8) { clearTimeout(pollT); pollN++; pollT = setTimeout(() => { if (el.isConnected) { ctx.checkout = co; api.draw('sessions', true, true); } }, 4000); } }
      else if (co && co.state === 'cancelled') banner = '<div class="dx-card dx-flash" role="status"><b>Payment was not completed</b><span>Nothing was charged. If your time is still held, press “Pay now” below to try again.</span></div>';
      const hold = b => Date.parse(b.created_at) + cfg.unpaid_hold_minutes * 60000 - Date.now();
      const now = Date.now(), heldOk = b => b.status === 'requested' && b.price_cents > 0 && hold(b) > 0 && Date.parse(b.ends_at) > now;
      const upcoming = b => (b.status === 'confirmed' && Date.parse(b.ends_at) > now) || heldOk(b);
      const up = books.filter(upcoming).sort((x, y) => Date.parse(x.starts_at) - Date.parse(y.starts_at)), past = books.filter(b => !upcoming(b));
      const head = '<div class="dx-row" style="justify-content:space-between;margin:0 0 10px"><h3 style="margin:0">My sessions</h3><a class="btn sm" href="pilots.html">Book a session</a></div>';
      if (!books.length) { el.innerHTML = banner + '<div class="dx-card">' + U.empty('No sessions yet', 'Choose a pilot, pick a day and a time, and your session will appear here with the meeting link, reminders and your review.', '<a class="btn sm" href="pilots.html">Find your pilot</a>') + '</div>'; return; }
      const rated = new Set(revs.map(r => r.booking_id)), tzl = ctx.myTz();
      const mins = b => Math.round((Date.parse(b.ends_at) - Date.parse(b.starts_at)) / 60000);
      const card = b => {
        const held = b.status === 'requested', ok = upcoming(b), left = held ? Math.max(1, Math.ceil(hold(b) / 60000)) : 0, join = b.meeting_url && b.status === 'confirmed' && /^https:\/\//i.test(b.meeting_url);
        const label = held && !ok ? 'Hold expired' : BOOK[b.status] || b.status;
        return '<div class="dx-app" data-id="' + esc(b.id) + '"><div class="dx-app-h"><div><b>' + esc(pil[b.pilot_id] || 'Your pilot') + '</b><small>' + (svc[b.service_id] ? esc(svc[b.service_id]) + ' · ' : '') + esc(U.fmtDT(b.starts_at)) + ' · ' + esc(String(mins(b))) + ' min · ' + (b.price_cents ? esc(U.money(b.price_cents, b.currency)) : 'Free') + '</small></div><div class="dx-item-side"><span class="pill ' + (b.status === 'completed' || (b.status === 'confirmed') ? 'ok' : held && ok ? 'warn' : '') + '">' + esc(label) + '</span>' + (join ? '<a class="btn sm" href="' + esc(b.meeting_url) + '" target="_blank" rel="noopener">Join</a>' : '') + '</div></div>' +
          (ok ? '<div class="dx-row bk-acts">' + (held && cfg.payments_enabled ? '<button class="btn sm" type="button" data-pay>Pay now</button><span class="mute">Your time is held for ' + left + ' more ' + (left === 1 ? 'minute' : 'minutes') + '.</span>' : '') + (held && !cfg.payments_enabled ? '<span class="mute">Online payment is not open yet.</span>' : '') + (b.status === 'confirmed' ? '<button class="btn out sm" type="button" data-ics>Add to calendar</button>' + (join ? '' : '<span class="mute">Your pilot adds the meeting link here before the session.</span>') : '') + '<button class="btn out sm bk-cx" type="button" data-cancel>' + (held ? 'Release this time' : 'Cancel') + '</button></div>' : '') +
          (b.status === 'completed' && !rated.has(b.id) ? '<form class="dx-form dx-rev" data-rev><div><label>Your rating</label><select data-r><option value="5">5 – Excellent</option><option value="4">4 – Good</option><option value="3">3 – OK</option><option value="2">2 – Poor</option><option value="1">1 – Bad</option></select></div><div class="w2"><label>How was your session? (optional)</label><textarea rows="3" maxlength="1500" data-c></textarea></div><div class="w2 dx-row"><button class="btn sm" type="submit">Send review</button><span class="amsg" role="status" aria-live="polite"></span></div></form>' : '') + '</div>';
      };
      el.innerHTML = banner + '<div class="dx-card">' + head + (up.length ? '<h4 class="bk-sec">Coming up</h4>' + up.map(card).join('') : '<p class="mute" style="margin:0 0 6px">No upcoming sessions. <a href="pilots.html">Book one</a> whenever you are ready.</p>') + '</div>' + (past.length ? '<div class="dx-card"><h4 class="bk-sec" style="margin-top:0">Earlier</h4>' + past.map(card).join('') + '</div>' : '') + '<p class="mute bk-tzn">Times are shown in your time zone (' + esc(tzl) + ').</p>';
      el.onclick = async ev => {
        const box = ev.target.closest('[data-id]'); if (!box) return; const bk = books.find(x => x.id === box.dataset.id); if (!bk) return;
        const pay = ev.target.closest('[data-pay]'), cx = ev.target.closest('[data-cancel]'), ics = ev.target.closest('[data-ics]');
        if (ics) { try { await UP.loadBook(); UP.ics({ id: bk.id, starts_at: bk.starts_at, ends_at: bk.ends_at, title: (svc[bk.service_id] || 'Session') + ' with ' + (pil[bk.pilot_id] || 'your UniPilot pilot') }); } catch (e) { U.toast(ctx.friendly(e), false); } }
        if (pay) { busy(pay, true, 'Opening payment…'); try { const B = await UP.loadBook(); await B.pay(sb, bk.id); } catch (e) { busy(pay, false); U.toast(ctx.friendly(e), false); } }
        if (cx) { try { const B = await UP.loadBook(), msg = await B.cancel({ sb, booking: bk, who: 'student', name: (pil[bk.pilot_id] || 'Session') }); if (msg) { U.toast(msg, true); api.refresh('sessions'); } } catch (e) { U.toast(ctx.friendly(e), false); } }
      };
      el.onsubmit = async ev => { const f = ev.target.closest('[data-rev]'); if (!f) return; ev.preventDefault(); const bid = f.closest('[data-id]').dataset.id, bk = books.find(x => x.id === bid), btn = $('button', f); busy(btn, true, 'Sending…');
        try { await run(sb.from('reviews').insert({ booking_id: bid, student_id: uid, pilot_id: bk.pilot_id, rating: +$('[data-r]', f).value, comment: $('[data-c]', f).value.trim() || null })); U.toast('Thank you for your review', true); api.refresh('sessions'); } catch (e) { busy(btn, false); say($('.amsg', f), ctx.friendly(e)); } };
    }

    // ---------------------------------------------------------------- profile and settings
    async function tProfile(el, api) {
      const prefs = (await run(sb.from('notification_prefs').select('email_deadlines,email_bookings,email_news').eq('user_id', uid).maybeSingle())) || { email_deadlines: true, email_bookings: true, email_news: false };
      const tzs = ctx.tzList(), cur = ctx.pr.timezone && ctx.pr.timezone !== 'UTC' ? ctx.pr.timezone : ctx.myTz();
      el.innerHTML = '<form class="dx-card dx-form" id="fpr" novalidate><h3 class="w2" style="margin:0">Your profile</h3><div><label for="pn">Full name</label><input id="pn" required maxlength="120" autocomplete="name" value="' + esc(ctx.pr.full_name) + '"></div><div><label for="pp">WhatsApp or phone (optional)</label><input id="pp" autocomplete="tel" placeholder="+48 …" value="' + esc(ctx.pr.phone || '') + '"></div><div><label for="pc">Country you live in (optional)</label><input id="pc" autocomplete="country-name" maxlength="80" value="' + esc(ctx.pr.country || '') + '"></div><div><label for="pt">Time zone</label><select id="pt">' + tzs.map(z => '<option' + (z === cur ? ' selected' : '') + '>' + esc(z) + '</option>').join('') + '</select></div><div class="w2"><label class="ck"><input type="checkbox" id="pm"' + (ctx.pr.marketing_opt_in ? ' checked' : '') + '> Email me news and offers (optional)</label></div><div class="w2 dx-row"><button class="btn" id="pb" type="submit">Save profile</button><span class="amsg" id="pm2" role="status" aria-live="polite"></span></div></form>' +
        '<div class="dx-card"><h3>Email alerts</h3><p class="mute" style="margin:0 0 8px">Choose what we may email you. Changes save instantly.</p><label class="ck"><input type="checkbox" data-pref="email_deadlines"' + (prefs.email_deadlines ? ' checked' : '') + '> Deadline reminders for my applications</label><label class="ck"><input type="checkbox" data-pref="email_bookings"' + (prefs.email_bookings ? ' checked' : '') + '> Messages about my pilot sessions</label><label class="ck"><input type="checkbox" data-pref="email_news"' + (prefs.email_news ? ' checked' : '') + '> News and new free materials</label><p class="amsg" id="pfm" role="status" aria-live="polite"></p></div>' +
        (ctx.pilot ? '' : '<div class="dx-card"><h3>Become a pilot</h3><p style="margin:0 0 12px">Won a scholarship or studied abroad? Pilots guide students one to one and are paid for their time. Start your pilot profile here. Our team checks it before it goes live.</p><button class="btn out" type="button" id="bp">Start my pilot profile</button><p class="amsg" id="bpm" role="status" aria-live="polite"></p></div>') + ctx.privacy.html();
      $('#fpr', el).onsubmit = async ev => { ev.preventDefault(); const n = $('#pn', el).value.trim(), ph = $('#pp', el).value.trim(), co = $('#pc', el).value.trim(), tz = $('#pt', el).value;
        if (n.length < 2) return say($('#pm2', el), 'Please enter your full name.'); if (ph && !/^[+\d][\d\s\-()]{6,24}$/.test(ph)) return say($('#pm2', el), 'Please enter a phone number with the country code, like +48 123 456 789.');
        const b = $('#pb', el); busy(b, true, 'Saving…'); try { await run(sb.from('profiles').update({ full_name: n, phone: ph || null, country: co || null, timezone: tz, marketing_opt_in: $('#pm', el).checked }).eq('id', uid)); Object.assign(ctx.pr, { full_name: n, phone: ph || null, country: co || null, timezone: tz, marketing_opt_in: $('#pm', el).checked }); say($('#pm2', el), 'Saved.', true); ctx.refreshHead(); } catch (e) { say($('#pm2', el), ctx.friendly(e)); } busy(b, false); };
      $$('[data-pref]', el).forEach(c => c.onchange = async () => { try { await run(sb.from('notification_prefs').update({ [c.dataset.pref]: c.checked }).eq('user_id', uid)); say($('#pfm', el), 'Saved.', true); } catch (e) { c.checked = !c.checked; say($('#pfm', el), ctx.friendly(e)); } });
      const bp = $('#bp', el); if (bp) bp.onclick = async () => { busy(bp, true, 'Starting…'); try { await run(sb.rpc('fn_become_pilot', { p_name: ctx.pr.full_name || '', p_headline: null, p_field: null })); await ctx.reload('pilot'); } catch (e) { busy(bp, false); say($('#bpm', el), ctx.friendly(e)); } };
      ctx.privacy.wire(el);
    }

    return UP.ui.tabs(host, [
      { id: 'overview', label: 'Overview', render: tOverview }, { id: 'matches', label: 'For you', render: tMatches }, { id: 'saved', label: 'Saved', render: tSaved },
      { id: 'applications', label: 'Applications', render: tApps }, { id: 'documents', label: 'Documents', render: tDocs }, { id: 'sessions', label: 'Sessions', render: tSessions }, { id: 'notes', label: 'Messages', render: UP.dash.notesTab(ctx) }, { id: 'profile', label: 'Profile & settings', render: tProfile }
    ], { key: 'student', label: 'Student sections', friendly: ctx.friendly, first: ctx.firstTab, fresh: ['overview', 'saved', 'applications', 'documents', 'sessions', 'notes'] });
  };
})();
