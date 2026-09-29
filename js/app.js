import { MOVIES, SCOPES, RELEASE_DATE } from './movies.js';
import { createStore, friendlyError } from './store.js';

const $ = sel => document.querySelector(sel);
const PREFS_KEY = 'doomProtocol.prefs.v1';
const AVATAR_COLORS = ['#3FD69A', '#D4AF37', '#7FB2E5', '#E0786A', '#B69CF0', '#6FD3D8', '#F2A65A', '#9BD46A'];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const hm = m => `${Math.floor(m / 60)}H ${pad(m % 60)}M`;
const CORNERS = '<i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i>';
const STAR = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
const CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const CHEV_R = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
const CHEV_L = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const PLAY = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M6 4l14 8-14 8z"/></svg>';

const INDEX = new Map(MOVIES.map((m, i) => [m.id, i]));
const RELEASED = MOVIES.filter(m => !m.unreleased);
const ESSENTIAL = RELEASED.filter(m => m.essential);

// ── Estado ───────────────────────────────────────────────────────────────
const prefs = (() => {
  let p = null;
  try { p = JSON.parse(localStorage.getItem(PREFS_KEY)); } catch {}
  return { scope: p?.scope ?? 'essential', status: p?.status ?? null, sidebarOpen: p?.sidebarOpen ?? window.innerWidth >= 1100 };
})();
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {} };

let store, me = null, everyone = new Map(), unsubData = null, narrow = false;
const openCrews = new Set();

const mine = () => everyone.get(me?.uid) || { watched: {}, ratings: {} };
const colorFor = uid => AVATAR_COLORS[[...String(uid)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % AVATAR_COLORS.length];
const avatar = p => `<span class="avatar" style="--av:${colorFor(p.uid)}" title="${esc(p.username)}">${esc([...p.username][0] || '?')}</span>`;
const people = () => [...everyone.values()].sort((a, b) => a.username.localeCompare(b.username));
const validRating = r => Number.isFinite(r) && r >= 1 && r <= 5 ? r : 0;

// ── Toast ────────────────────────────────────────────────────────────────
let toastTimer;
function flash(msg, isError = false) {
  const t = $('#toast');
  t.querySelector('span').textContent = msg;
  t.classList.toggle('err', isError);
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2400);
}

// ── Render ───────────────────────────────────────────────────────────────
function render() {
  if (!me) return;
  const { watched, ratings } = mine();
  const scopeFn = SCOPES.find(s => s[0] === prefs.scope)?.[2] || (() => true);
  const inScope = MOVIES.filter(scopeFn);
  const releasedInScope = inScope.filter(m => !m.unreleased);
  const done = releasedInScope.filter(m => watched[m.id]).length;
  const pct = releasedInScope.length ? Math.round(done / releasedInScope.length * 100) : 0;
  const scopeLabel = SCOPES.find(s => s[0] === prefs.scope)?.[1] || 'Tudo';

  $('#pct').textContent = pct + '%';
  $('#pct-bar').style.width = pct + '%';
  $('#progress-label').textContent = `${done}/${releasedInScope.length} ALVOS CONQUISTADOS · ${scopeLabel.toUpperCase()}`;
  $('#agent-name').textContent = me.username;

  $('#scope-pills').innerHTML = SCOPES.map(([k, label]) =>
    `<button type="button" class="pill${prefs.scope === k ? ' on' : ''}" data-action="scope" data-v="${k}" aria-pressed="${prefs.scope === k}">${label}</button>`).join('');
  $('#status-pills').innerHTML = [['watched', 'Assistidos'], ['unwatched', 'Não assistidos']].map(([k, label]) =>
    `<button type="button" class="${prefs.status === k ? 'on' : ''}" data-action="status" data-v="${k}" aria-pressed="${prefs.status === k}">${label}</button>`).join('');

  const next = releasedInScope.find(m => !watched[m.id]);
  const visible = inScope.filter(m => !prefs.status || (prefs.status === 'watched' ? !!watched[m.id] : !watched[m.id]));
  $('#showing').textContent = `EXIBINDO ${visible.length} DE ${inScope.length} ALVOS`;

  $('#timeline').classList.toggle('narrow', narrow);
  $('#rows').innerHTML = visible.length
    ? visible.map((m, vi) => cardRow(m, vi, watched, ratings, m === next)).join('')
    : `<div class="blueprint empty">${CORNERS}<div class="empty-title">Nenhum alvo corresponde à diretiva</div><div class="mono muted" style="font-size:12px;margin-top:4px">Ajuste os filtros para retomar a vigilância.</div></div>`;

  renderAside(inScope, releasedInScope, watched, ratings, next);
  document.documentElement.style.setProperty('--header-h', $('#header').offsetHeight + 'px');
}

function posterHTML(m, small = false) {
  const cls = m.id === 'doomsday' ? 'pg-doom' : `pg-${m.universe}`;
  const inner = m.poster
    ? `<img src="${esc(m.poster)}" alt="Pôster de ${esc(m.title)}" loading="lazy">`
    : `<div class="poster-gen ${cls}" role="img" aria-label="${esc(m.title)}"><span class="pg-top">${esc(m.phase)}</span><span class="pg-title">${esc(m.title)}</span><span class="pg-year">${m.unreleased ? '18.12.2026' : m.year}</span></div>`;
  return `<div class="frame${small ? ' sm' : ''}"><div class="poster">${inner}</div>${!small && m._watched ? '<div class="seal"><div><small>★ ★ ★</small><span>DOMÍNIO</span><span>APROVADO</span></div></div>' : ''}</div>`;
}

function crewHTML(m) {
  const all = people();
  const watchers = all.filter(p => p.watched[m.id]);
  const rated = all.map(p => ({ p, r: validRating(p.ratings[m.id]) })).filter(x => x.r);
  const avg = rated.length ? (rated.reduce((s, x) => s + x.r, 0) / rated.length).toFixed(1) : null;
  const shown = watchers.slice(0, 6);
  const more = watchers.length - shown.length;
  const list = all.filter(p => p.watched[m.id] || validRating(p.ratings[m.id]));
  return `<details class="crew" data-crew="${m.id}"${openCrews.has(m.id) ? ' open' : ''}>
    <summary>
      <span class="crew-label">Grupo</span>
      <span class="crew-avg">${avg ? `★ ${avg} · ${rated.length} nota${rated.length > 1 ? 's' : ''}` : 'sem notas'}</span>
      <span class="avatars">${shown.map(avatar).join('')}${more > 0 ? `<span class="avatar more">+${more}</span>` : ''}</span>
      <span class="crew-toggle">${watchers.length}/${all.length} viram <span class="chev">▾</span></span>
    </summary>
    ${list.length
      ? `<ul class="crew-list">${list.map(p => {
          const r = validRating(p.ratings[m.id]);
          return `<li class="${p.uid === me.uid ? 'me' : ''}">${avatar(p)}<span class="n">${esc(p.username)}</span><span class="muted">${p.watched[m.id] ? 'assistiu' : 'não marcou'}</span><span class="r">${r ? '★'.repeat(r) + ` ${r}.0` : '—'}</span></li>`;
        }).join('')}</ul>`
      : '<div class="crew-empty" style="margin-top:8px">Ninguém do grupo assistiu ainda.</div>'}
  </details>`;
}

function cardRow(m, vi, watched, ratings, isNext) {
  const i = INDEX.get(m.id);
  const w = !!watched[m.id];
  const r = validRating(ratings[m.id]);
  const seq = pad(i + 1);
  const tags = (m.essential ? [['Essencial', 'emerald']] : []).concat(m.tags);
  const stars = [1, 2, 3, 4, 5].map(n =>
    `<button type="button" class="star${n <= r ? ' on' : ''}" data-action="rate" data-id="${m.id}" data-v="${n}" ${m.unreleased ? 'disabled title="Ainda não lançado"' : `title="Nota ${n}/5" aria-label="Nota ${n} de 5"`}>${STAR}</button>`).join('');
  return `<div class="row${vi % 2 === 1 ? ' rev' : ''}">
    <div class="slot">
      <article class="blueprint card-t${w ? ' done' : isNext ? ' next' : ''}">
        ${CORNERS}
        ${posterHTML({ ...m, _watched: w })}
        <div class="card-body-t">
          <div class="card-head">
            <div style="min-width:0">
              <div class="kicker">Alvo ${seq} · ${esc(m.kind)}${isNext ? ' · <span class="gold">Próximo</span>' : ''}</div>
              <h3>${esc(m.title)}</h3>
            </div>
            <span class="phase">${esc(m.phase)}</span>
          </div>
          <div class="meta"><span>${m.unreleased ? '18 DEZ 2026' : m.year}</span><span class="sep">|</span><span>${m.runtime ? hm(m.runtime) : (m.unreleased ? 'DURAÇÃO CLASSIFICADA' : 'DURAÇÃO —')}</span></div>
          <p class="brief">${esc(m.brief)}</p>
          <div class="tags">${tags.map(([label, tone]) => `<span class="tag-t tone-${tone}">${esc(label)}</span>`).join('')}</div>
          <div class="actions">
            <button type="button" class="conquer${w ? ' on' : ''}" data-action="toggle" data-id="${m.id}" ${m.unreleased ? 'disabled' : ''} aria-pressed="${w}">
              ${w ? CHECK : ''}${m.unreleased ? 'Aguardando estreia' : w ? 'Conquistado' : 'Marcar como conquistado'}
            </button>
            <div class="rate"><div class="stars" role="group" aria-label="Sua nota">${stars}</div><span class="rate-label">${r ? r + '.0' : '—'}</span></div>
          </div>
          ${m.unreleased ? '' : crewHTML(m)}
        </div>
      </article>
    </div>
    <div class="node-col"><div class="node${w ? ' done' : ''}${isNext ? ' next' : ''}"></div><span class="seq">${seq}</span></div>
    <div class="spacer" style="flex:1;min-width:0"></div>
  </div>`;
}

function renderAside(inScope, releasedInScope, watched, ratings, next) {
  const slot = $('#aside-slot');
  const myRated = RELEASED.filter(m => validRating(ratings[m.id]));
  const myAvg = myRated.length ? (myRated.reduce((s, m) => s + validRating(ratings[m.id]), 0) / myRated.length).toFixed(1) : '—';
  const days = Math.max(0, Math.ceil((RELEASE_DATE - new Date(new Date().toDateString())) / 86400000));

  if (!prefs.sidebarOpen) {
    slot.innerHTML = `<button type="button" class="blueprint aside-closed" data-action="sidebar" title="Abrir arquivo">${CORNERS}${CHEV_L}<span class="vt">Arquivo de Inteligência</span><span class="mono gold" style="font-size:11px">${myAvg}★</span></button>`;
    return;
  }

  const pending = releasedInScope.filter(m => !watched[m.id]);
  const remaining = pending.reduce((s, m) => s + (m.runtime || 0), 0);
  const unknown = pending.filter(m => !m.runtime).length + (inScope.some(m => m.unreleased) ? 1 : 0);

  const ranking = people().map(p => {
    const seen = RELEASED.filter(m => p.watched[m.id]).length;
    const ess = ESSENTIAL.filter(m => p.watched[m.id]).length;
    const rs = Object.values(p.ratings).map(validRating).filter(Boolean);
    return { p, seen, ess, pct: Math.round(seen / RELEASED.length * 100), essPct: ess / ESSENTIAL.length, avg: rs.length ? (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : '—' };
  }).sort((a, b) => b.essPct - a.essPct || b.seen - a.seen || a.p.username.localeCompare(b.p.username));

  slot.innerHTML = `<aside class="aside" aria-label="Arquivo de Inteligência">
    <div class="aside-head">
      <div><div class="kicker gold" style="letter-spacing:.16em">Confidencial</div><h2>Arquivo de Inteligência Latveriano</h2></div>
      <button type="button" class="btn btn-secondary btn-icon icon-btn" data-action="sidebar" title="Recolher painel">${CHEV_R}</button>
    </div>

    <div class="stat-grid">
      <div class="blueprint stat">${CORNERS}
        <div class="kicker">Sua nota média</div>
        <div class="stat-val"><span class="big gold">${myAvg}</span><span class="unit">/ 5</span></div>
        <div class="stat-note">${myRated.length} ${myRated.length === 1 ? 'alvo avaliado' : 'alvos avaliados'}</div>
      </div>
      <div class="blueprint stat">${CORNERS}
        <div class="kicker">Tempo restante</div>
        <div class="stat-val"><span class="big neon">${Math.floor(remaining / 60)}</span><span class="unit">h</span><span class="big neon">${pad(remaining % 60)}</span><span class="unit">m</span></div>
        <div class="stat-note">${unknown ? `+ ${unknown} sem duração definida` : 'Todas as durações conhecidas'}</div>
      </div>
    </div>

    <div class="blueprint next-box">${CORNERS}
      <div class="kicker neon">Próximo alvo recomendado</div>
      ${next ? `
        <div class="next-inner">
          ${posterHTML(next, true)}
          <div class="info">
            <div class="mono muted" style="font-size:11px">ALVO ${pad(INDEX.get(next.id) + 1)} · ${esc(next.phase)}</div>
            <div class="next-title">${esc(next.title)}</div>
            <div class="mono" style="font-size:11.5px;color:var(--doom-soft)">${next.year}${next.runtime ? ' · ' + hm(next.runtime) : ''} · ${esc(next.kind)}</div>
            <div style="font-size:13px;line-height:1.45;color:var(--doom-soft)">${esc(next.brief)}</div>
          </div>
        </div>
        <a class="btn btn-primary btn-block blueprint btn-doom" style="margin-top:16px" href="https://www.justwatch.com/br/busca?q=${encodeURIComponent(next.title)}" target="_blank" rel="noopener">${CORNERS}${PLAY} Onde assistir</a>`
      : `<div style="margin-top:10px;font-family:var(--font-heading);font-size:20px;text-transform:uppercase;letter-spacing:.04em">Todos os alvos lançados foram conquistados.</div>
         <div class="mono muted" style="font-size:12px;margin-top:4px">Aguarde Doomsday.</div>`}
    </div>

    <div class="blueprint council">${CORNERS}
      <div class="kicker gold">Conselho de Latvéria · ${ranking.length} agente${ranking.length === 1 ? '' : 's'}</div>
      <ol>${ranking.map((x, i) => `
        <li class="${x.p.uid === me.uid ? 'me' : ''}">
          <span class="pos">${pad(i + 1)}</span>${avatar(x.p)}
          <div class="who"><div class="n">${esc(x.p.username)}</div><div class="bar"><i style="width:${x.pct}%"></i></div><div class="sub">${x.ess}/${ESSENTIAL.length} essenciais · ${x.seen}/${RELEASED.length} total</div></div>
          <div class="pct">${x.pct}%<small>${x.avg}★</small></div>
        </li>`).join('')}
      </ol>
    </div>

    <div class="blueprint countdown">${CORNERS}
      <div><div class="kicker gold">Convergência Doomsday</div><div class="mono" style="font-size:11.5px;color:var(--doom-soft);margin-top:3px">Vingadores: Doomsday · 18.12.2026</div></div>
      <div style="text-align:right"><div class="big gold" style="font-size:34px">${days}</div><div class="mono muted" style="font-size:10.5px;letter-spacing:.1em">DIAS</div></div>
    </div>
  </aside>`;
}

// ── Ações ────────────────────────────────────────────────────────────────
function save(promise) {
  promise.catch(e => { console.error(e); flash('// FALHA AO SALVAR — ' + friendlyError(e), true); });
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  const { action, id, v } = el.dataset;
  const m = id && MOVIES[INDEX.get(id)];
  const { watched, ratings } = mine();
  switch (action) {
    case 'scope': prefs.scope = v; savePrefs(); render(); break;
    case 'status': prefs.status = prefs.status === v ? null : v; savePrefs(); render(); break;
    case 'sidebar': prefs.sidebarOpen = !prefs.sidebarOpen; savePrefs(); render(); break;
    case 'signout': store.signOut(); break;
    case 'toggle': {
      if (!m || m.unreleased) return;
      const on = !watched[id];
      save(store.setWatched(id, on));
      if (on) flash(`// ${m.title.toUpperCase()} — CONQUISTADO`);
      break;
    }
    case 'rate': {
      if (!m || m.unreleased) return;
      const n = Number(v);
      const next = validRating(ratings[id]) === n ? 0 : n;
      save(store.setRating(id, next));
      // Dar nota implica ter assistido.
      if (next && !watched[id]) { save(store.setWatched(id, true)); flash(`// ${m.title.toUpperCase()} — CONQUISTADO`); }
      break;
    }
  }
});

document.addEventListener('toggle', e => {
  const d = e.target;
  if (d.matches?.('details[data-crew]')) d.open ? openCrews.add(d.dataset.crew) : openCrews.delete(d.dataset.crew);
}, true);

// ── Login ────────────────────────────────────────────────────────────────
let mode = 'signin';
function setMode(next) {
  mode = next;
  document.querySelectorAll('.login-tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === mode)));
  document.querySelectorAll('[data-signup-only]').forEach(el => { el.hidden = mode !== 'signup'; });
  $('#f-pass').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  $('#login-submit span').textContent = mode === 'signup' ? 'Alistar-se no protocolo' : 'Entrar no protocolo';
  $('#login-error').hidden = true;
}
document.querySelectorAll('.login-tabs [data-tab]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.tab)));

$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target;
  const err = $('#login-error');
  const btn = $('#login-submit');
  const username = f.username.value, password = f.password.value;
  err.hidden = true;
  if (mode === 'signup' && password !== f.password2.value) {
    err.textContent = 'As senhas não conferem.'; err.hidden = false; return;
  }
  btn.disabled = true;
  try {
    await (mode === 'signup' ? store.signUp(username, password) : store.signIn(username, password));
    f.reset();
  } catch (ex) {
    err.textContent = friendlyError(ex); err.hidden = false;
  } finally {
    btn.disabled = false;
  }
});

// ── Boot ─────────────────────────────────────────────────────────────────
function showScreen(user) {
  me = user;
  $('#boot').hidden = true;
  $('#login').hidden = !!user;
  $('#app').hidden = !user;
  if (unsubData) { unsubData(); unsubData = null; }
  everyone = new Map();
  if (user) {
    unsubData = store.subscribeAll(all => {
      everyone = all;
      if (!everyone.has(me.uid)) everyone.set(me.uid, { uid: me.uid, username: me.username, watched: {}, ratings: {} });
      render();
    }, e => { console.error(e); flash('// SEM ACESSO AO BANCO — ' + friendlyError(e), true); });
    render();
  } else {
    setMode('signin');
    setTimeout(() => $('#f-user').focus(), 0);
  }
}

new ResizeObserver(([entry]) => {
  const n = entry.contentRect.width < 1000;
  if (n !== narrow) { narrow = n; render(); }
}).observe($('#timeline'));
window.addEventListener('resize', () => document.documentElement.style.setProperty('--header-h', $('#header').offsetHeight + 'px'));

(async () => {
  try {
    store = await createStore();
  } catch (e) {
    console.error(e);
    $('#boot').textContent = 'Falha ao carregar o Firebase. Verifique a conexão e js/firebase-config.js.';
    return;
  }
  $('#demo-banner').hidden = store.mode !== 'demo';
  store.onUser(showScreen);
})();
