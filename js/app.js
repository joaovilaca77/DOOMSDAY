import { MOVIES, SCOPES, RELEASE_DATE, DOOM_LINES } from './movies.js';
import { createStore, friendlyError } from './store.js';
import { loadPosters } from './posters.js';

const $ = sel => document.querySelector(sel);
const PREFS_KEY = 'doomProtocol.prefs.v2';
const AVATAR_COLORS = ['#6CFF9A', '#D8B878', '#7FB2E5', '#F0A092', '#B69CF0', '#6FD3D8', '#F2A65A', '#9BD46A'];
const SVG_NS = 'http://www.w3.org/2000/svg';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const hm = m => `${Math.floor(m / 60)}H ${pad(m % 60)}M`;
const STAR = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
const CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const ARROW = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CLOSE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

const INDEX = new Map(MOVIES.map((m, i) => [m.id, i]));
const RELEASED = MOVIES.filter(m => !m.unreleased);
const ESSENTIAL = RELEASED.filter(m => m.essential);
const isSeries = m => m.kind.startsWith('Série');

// ── Estado ───────────────────────────────────────────────────────────────
const prefs = (() => {
  let p = null;
  try { p = JSON.parse(localStorage.getItem(PREFS_KEY)); } catch {}
  return { scope: SCOPES.some(s => s[0] === p?.scope) ? p.scope : 'essential', focusId: p?.focusId ?? null };
})();
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {} };

let store, me = null, everyone = new Map(), unsubData = null, posters = {};
let list = [];            // títulos visíveis (escopo atual)
let pos = 0;              // posição contínua do scroll, em "itens"
let active = -1;          // índice do item em foco
let geo = null;           // geometria da trilha (altura dos itens, padding, escala da árvore)
let rows = [];            // referências DOM por item
let litRect = null;

const mine = () => everyone.get(me?.uid) || { watched: {}, ratings: {} };
const colorFor = uid => AVATAR_COLORS[[...String(uid)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % AVATAR_COLORS.length];
const avatar = p => `<span class="avatar" style="--av:${colorFor(p.uid)}" title="${esc(p.username)}">${esc([...p.username][0] || '?')}</span>`;
const people = () => [...everyone.values()].sort((a, b) => a.username.localeCompare(b.username));
const validRating = r => Number.isFinite(r) && r >= 1 && r <= 5 ? r : 0;

// ── Toast ────────────────────────────────────────────────────────────────
let toastTimer;
function flash(msg, isError = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.toggle('err', isError);
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.hidden = true; }, 2600);
}

// ── Árvore (galho do multiverso) ─────────────────────────────────────────
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const trunkX = (y, k) => k * (62 + 9 * Math.sin(y / 170) + 5 * Math.sin(y / 61 + 1.3));
const clampX = (x, k) => Math.max(4 * k, Math.min(124 * k, x));
function trunkPath(y0, y1, k) {
  let d = `M${trunkX(y0, k).toFixed(1)},${y0.toFixed(1)}`;
  for (let y = y0 + 12; y < y1; y += 12) d += ` L${trunkX(y, k).toFixed(1)},${y.toFixed(1)}`;
  return d + ` L${trunkX(y1, k).toFixed(1)},${y1.toFixed(1)}`;
}
function branchesPath(y0, y1, k) {
  const r = rng(828);
  let side = 1, d = '';
  for (let y = y0 + 30; y < y1 - 10; y += 26 + r() * 22) {
    side = r() < 0.7 ? -side : side;
    const x = trunkX(y, k), len = 22 + r() * 34;
    const ex = clampX(x + side * len * k, k), ey = y - len * (0.55 + r() * 0.35);
    const mx = clampX(x + side * len * 0.45 * k, k), my = y - len * 0.15;
    d += ` M${x.toFixed(1)},${y.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
    const twigs = 1 + Math.floor(r() * 3);
    for (let j = 0; j < twigs; j++) {
      const t = 0.35 + r() * 0.5;
      const px = x + (ex - x) * t, py = y + (ey - y) * t;
      const tl = 7 + r() * 12, ts = r() < 0.5 ? side : -side * 0.4;
      d += ` M${px.toFixed(1)},${py.toFixed(1)} L${clampX(px + ts * tl * k, k).toFixed(1)},${(py - tl * (0.7 + r() * 0.5)).toFixed(1)}`;
    }
  }
  return d;
}

// ── Pôster ───────────────────────────────────────────────────────────────
function posterHTML(m) {
  const cls = m.id === 'doomsday' ? 'pg-doom' : `pg-${m.universe}`;
  const src = m.poster || posters[m.id];
  return `<div class="poster"><div class="poster-gen ${cls}" role="img" aria-label="${esc(m.title)}"><span class="t">${esc(m.phase)}</span><span class="n">${esc(m.title)}</span><span class="y">${m.unreleased ? '18.12.2026' : m.year}</span></div>`
    + (src ? `<img src="${esc(src)}" alt="Pôster de ${esc(m.title)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : '')
    + '</div>';
}

// ── Card ─────────────────────────────────────────────────────────────────
function groupStats(m) {
  const all = people();
  const watchers = all.filter(p => p.watched[m.id]);
  const rated = all.map(p => validRating(p.ratings[m.id])).filter(Boolean);
  return { all, watchers, rated, avg: rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : null };
}

function cardHTML(m, i, nextId) {
  const { watched, ratings } = mine();
  const w = !!watched[m.id];
  const r = validRating(ratings[m.id]);
  const tags = m.tags.map(([label, tone]) => `<span class="tag tone-${tone}">${esc(label)}</span>`).join('');
  const stars = [1, 2, 3, 4, 5].map(n =>
    `<button type="button" class="star${n <= r ? ' on' : ''}" data-action="rate" data-id="${m.id}" data-v="${n}" ${m.unreleased ? 'disabled title="Ainda não lançado"' : `title="Nota ${n} de 5" aria-label="Nota ${n} de 5"`}>${STAR}</button>`).join('');
  const g = groupStats(m);
  const shown = g.watchers.slice(0, 5), more = g.watchers.length - shown.length;
  return `<article class="card">
    <div class="poster-frame">${posterHTML(m)}</div>
    <div class="card-body">
      <div class="card-top">
        <span class="kicker" style="letter-spacing:.14em">RAMO ${pad(i + 1)} / ${pad(list.length)}</span>
        <span class="chip phase">${esc(m.phase)}</span>
        ${m.essential ? '<span class="chip ess">Essencial</span>' : ''}
        ${m.id === nextId ? '<span class="chip next">Próximo</span>' : ''}
      </div>
      ${w ? '<div class="crest" title="Conquistado"><div><b>LV</b><small>CONQ.</small></div></div>' : ''}
      <h2>${esc(m.title)}</h2>
      <div class="facts">
        <div class="fact"><div class="l">LANÇAMENTO</div><div class="v">${m.unreleased ? '18.12.2026' : m.year}</div></div>
        <div class="fact"><div class="l">DURAÇÃO</div><div class="v">${m.runtime ? hm(m.runtime) : (m.unreleased ? 'CLASSIFICADA' : '—')}</div></div>
        <div class="fact"><div class="l">FORMATO</div><div class="v">${esc(m.kind)}</div></div>
      </div>
      <p class="brief">${esc(m.brief)}</p>
      <div class="tags">${tags}</div>
      <div class="controls">
        <button type="button" class="conquer${w ? ' on' : ''}" data-action="toggle" data-id="${m.id}" ${m.unreleased ? 'disabled' : ''} aria-pressed="${w}">
          ${w ? CHECK : ''}${m.unreleased ? 'Aguardando estreia' : w ? 'Conquistado' : 'Marcar como conquistado'}
        </button>
        <div class="rating" role="group" aria-label="Sua nota">${stars}<span class="rating-label${r ? ' on' : ''}">${m.unreleased ? 'N/D' : r ? `${r}.0 / 5` : 'SEM NOTA'}</span></div>
      </div>
      ${m.unreleased ? '' : `<div class="crew-line"><span>Grupo</span><span class="avg">${g.avg ? `★ ${g.avg} · ${g.rated.length} nota${g.rated.length > 1 ? 's' : ''}` : 'sem notas'}</span><span class="avatars">${shown.map(avatar).join('')}${more > 0 ? `<span class="avatar more">+${more}</span>` : ''}</span><span>${g.watchers.length}/${g.all.length} viram</span></div>`}
    </div>
  </article>`;
}

// ── Trilha ───────────────────────────────────────────────────────────────
function computeGeo() {
  const track = $('#track');
  const cw = track.clientWidth, ch = track.clientHeight || 600;
  const narrow = cw < 760;
  const H = narrow ? Math.min(600, Math.max(ch, 440)) : Math.min(440, Math.max(ch, 380));
  return { cw, ch, narrow, H, padT: Math.max(0, (ch - H) / 2), k: narrow ? 0.5 : 1 };
}

function nextTargetId() {
  const { watched } = mine();
  return list.find(m => !m.unreleased && !watched[m.id])?.id;
}

function buildTrack(keepId) {
  const scopeFn = SCOPES.find(s => s[0] === prefs.scope)[2];
  list = MOVIES.filter(scopeFn);
  geo = computeGeo();
  const { H, padT, k, narrow } = geo;
  const n = list.length;
  const inner = $('#track-inner');
  inner.style.setProperty('--track-pl', narrow ? '8px' : 'clamp(12px,2vw,32px)');
  inner.style.padding = `${padT}px ${narrow ? '12px' : 'clamp(20px,3vw,44px)'} ${padT}px var(--track-pl)`;
  const nodeY = i => padT + H / 2 + i * H;
  const y0 = padT + 10, y1 = nodeY(n - 1) + 70;
  const svgH = Math.ceil(padT * 2 + n * H);
  const trunk = trunkPath(y0, y1, k), br = branchesPath(padT + 20, nodeY(n - 1) + 60, k);
  const nextId = nextTargetId();

  inner.innerHTML = `<svg class="tree" width="${130 * k}" height="${svgH}" aria-hidden="true">
      <defs><clipPath id="lit-clip"><rect x="-40" y="0" width="${200 * k + 80}" height="0"></rect></clipPath></defs>
      <path d="${br}" fill="none" stroke="#1D5A3C" stroke-width="1.2" stroke-linecap="round" opacity=".55"></path>
      <path d="${trunk}" fill="none" stroke="#1D5A3C" stroke-width="2" stroke-linecap="round" opacity=".8"></path>
      <g clip-path="url(#lit-clip)">
        <path d="${br}" fill="none" stroke="#6CFF9A" stroke-width="4" stroke-linecap="round" opacity=".16"></path>
        <path d="${br}" fill="none" stroke="#9CFFB8" stroke-width="1.3" stroke-linecap="round" opacity=".95"></path>
        <path d="${trunk}" fill="none" stroke="#6CFF9A" stroke-width="10" stroke-linecap="round" opacity=".14"></path>
        <path d="${trunk}" fill="none" stroke="#6CFF9A" stroke-width="4" stroke-linecap="round" opacity=".6"></path>
        <path d="${trunk}" fill="none" stroke="#F2FFE9" stroke-width="1.6" stroke-linecap="round"></path>
      </g>
    </svg>`
    + list.map((m, i) => `<div class="item" style="height:${H}px" data-i="${i}">
        <div class="node-col" style="width:${130 * k}px">
          <button type="button" class="orb" data-action="focus" data-i="${i}" title="${esc(m.title)}" aria-label="Ir para ${esc(m.title)}" style="left:${trunkX(nodeY(i), k).toFixed(1)}px"></button>
          <span class="seq-label" style="left:${trunkX(nodeY(i), k).toFixed(1)}px">${pad(i + 1)}</span>
        </div>
        <div class="card-wrap" data-i="${i}">${cardHTML(m, i, nextId)}</div>
      </div>`).join('');

  litRect = inner.querySelector('#lit-clip rect');
  rows = [...inner.querySelectorAll('.item')].map(el => ({ wrap: el.querySelector('.card-wrap'), card: el.querySelector('.card'), orb: el.querySelector('.orb'), seq: el.querySelector('.seq-label') }));

  let idx = keepId != null ? list.findIndex(m => m.id === keepId) : -1;
  if (idx < 0) idx = Math.max(0, list.findIndex(m => m.id === nextId));
  active = -1;
  const track = $('#track');
  track.scrollTop = idx * H;
  pos = track.scrollTop / H;
  applyPos();
  renderScopes();
}

// Atualiza só o conteúdo dos cards (dados mudaram), sem mexer na geometria.
function refreshCards() {
  const nextId = nextTargetId();
  rows.forEach((r, i) => { r.wrap.innerHTML = cardHTML(list[i], i, nextId); r.card = r.wrap.querySelector('.card'); });
  active = -1;
  applyPos();
  renderScopes();
}

function applyPos() {
  if (!geo || !rows.length) return;
  const { H, padT } = geo;
  const yFill = padT + H / 2 + pos * H;
  if (litRect) litRect.setAttribute('height', Math.max(0, yFill).toFixed(1));
  const a = Math.max(0, Math.min(list.length - 1, Math.round(pos)));
  // Só os itens perto da tela mudam visualmente; os demais ficam no estado "longe".
  const from = Math.max(0, Math.floor(pos) - 3), to = Math.min(rows.length - 1, Math.ceil(pos) + 3);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const d = i - pos;
    const near = i >= from && i <= to;
    if (near || r.far !== (d < 0 ? -1 : 1)) {
      const ad = Math.min(Math.abs(d), 1);
      const scale = d < 0 ? 1 - 0.2 * ad : 1 - 0.1 * ad;
      const opacity = Math.max(d < 0 ? 1 - 0.6 * ad : 1 - 0.7 * ad, 0.12);
      r.wrap.style.transform = `scale(${scale.toFixed(4)})`;
      r.wrap.style.opacity = opacity.toFixed(3);
      r.card.classList.toggle('past', d < 0);
      r.far = near ? 0 : (d < 0 ? -1 : 1);
    }
    const lit = i <= pos + 0.01;
    r.orb.classList.toggle('lit', lit);
    r.seq.classList.toggle('lit', lit);
  }
  if (a !== active) {
    if (rows[active]) { rows[active].wrap.classList.remove('active'); rows[active].orb.classList.remove('active'); rows[active].seq.classList.remove('active'); }
    active = a;
    rows[a].wrap.classList.add('active'); rows[a].orb.classList.add('active'); rows[a].seq.classList.add('active');
    prefs.focusId = list[a].id; savePrefs();
    renderAside();
  }
}

function go(i) {
  if (!geo) return;
  i = Math.max(0, Math.min(list.length - 1, i));
  $('#track').scrollTo({ top: i * geo.H, behavior: 'smooth' });
}

// ── Cabeçalho ────────────────────────────────────────────────────────────
function renderScopes() {
  const { watched } = mine();
  $('#scopes').innerHTML = SCOPES.map(([k, label, fn]) => {
    const items = MOVIES.filter(fn).filter(m => !m.unreleased);
    const done = items.filter(m => watched[m.id]).length;
    return `<button type="button" class="scope${prefs.scope === k ? ' on' : ''}" data-action="scope" data-v="${k}" aria-pressed="${prefs.scope === k}">${label}<span class="n">${done}/${items.length}</span></button>`;
  }).join('');
}

// ── Painel lateral ───────────────────────────────────────────────────────
function countdownHTML() {
  let ms = Math.max(0, RELEASE_DATE - Date.now());
  const D = Math.floor(ms / 864e5); ms -= D * 864e5;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  const mi = Math.floor(ms / 6e4); ms -= mi * 6e4;
  const s = Math.floor(ms / 1e3);
  return [[D, 'DIAS'], [pad(h), 'HRS'], [pad(mi), 'MIN'], [pad(s), 'SEG']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
}

function renderAside() {
  if (!me || !list.length) return;
  const { watched, ratings } = mine();
  const f = list[active] || list[0];
  const n = list.length;
  const released = list.filter(m => !m.unreleased);
  const done = released.filter(m => watched[m.id]).length;
  const pct = released.length ? Math.round(done / released.length * 100) : 0;
  const pending = released.filter(m => !watched[m.id]);
  const rem = pending.reduce((s, m) => s + (m.runtime || 0), 0);
  const scopeLabel = SCOPES.find(s => s[0] === prefs.scope)[1];

  $('#counter').textContent = `${pad(active + 1)} / ${pad(n)}`;
  $('#sheet-pct').textContent = pct + '%';

  const nextIdx = list.findIndex((m, i) => i > active && !m.unreleased && !watched[m.id]);
  const firstIdx = list.findIndex(m => !m.unreleased && !watched[m.id]);
  const jumpTo = nextIdx >= 0 ? nextIdx : firstIdx >= 0 ? firstIdx : n - 1;

  const ranking = people().map(p => {
    const seen = RELEASED.filter(m => p.watched[m.id]).length;
    const ess = ESSENTIAL.filter(m => p.watched[m.id]).length;
    const rs = Object.values(p.ratings).map(validRating).filter(Boolean);
    return { p, seen, ess, pct: Math.round(seen / RELEASED.length * 100), essPct: ess / ESSENTIAL.length, avg: rs.length ? (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : '—' };
  }).sort((a, b) => b.essPct - a.essPct || b.seen - a.seen || a.p.username.localeCompare(b.p.username));

  const g = groupStats(f);
  const crew = g.all.filter(p => p.watched[f.id] || validRating(p.ratings[f.id]));
  const status = f.unreleased ? ['#D8B878', 'AGUARDANDO ESTREIA'] : watched[f.id] ? ['#6CFF9A', 'CONQUISTADO · DOMÍNIO APROVADO'] : ['#7F998B', 'NÃO CONQUISTADO'];

  $('#aside').innerHTML = `
    <div class="sheet-head"><span class="kicker gold">Arquivo de Inteligência</span><button type="button" class="round-btn" data-action="sheet" aria-label="Fechar">${CLOSE}</button></div>

    <div class="glass archive">
      <div class="archive-thumb">${posterHTML(f)}</div>
      <div style="flex:1;min-width:0">
        <span class="kicker gold" style="font-size:10px">ARQUIVO DOOM · ${pad(active + 1)} / ${pad(n)}</span>
        <div class="archive-line">${esc(DOOM_LINES[f.id] || f.brief)}</div>
      </div>
    </div>

    <div class="glass pad intel">
      <div class="intel-head">
        <div><div class="kicker gold" style="font-size:10px">CONFIDENCIAL · Ω</div><h3>Arquivo de Inteligência Latveriano</h3></div>
        <span class="live"><span class="dot"></span>AO VIVO</span>
      </div>
      <div class="row-between" style="margin-top:20px"><span class="kicker">Progresso · ${esc(scopeLabel)}</span><span class="mono" style="font-size:11px;color:var(--soft)">${done} / ${released.length} CONQUISTADOS</span></div>
      <div class="big-pct">${pct}<small>%</small></div>
      <div class="segments${n > 24 ? ' dense' : ''}">${list.map((m, i) =>
        `<button type="button" class="seg${watched[m.id] ? ' done' : ''}${i === active ? ' active' : ''}" data-action="focus" data-i="${i}" title="${pad(i + 1)} · ${esc(m.title)}" aria-label="${esc(m.title)}"></button>`).join('')}</div>
    </div>

    <div class="glass pad focus-box">
      <span class="kicker">EM FOCO · ${pad(active + 1)} / ${pad(n)}</span>
      <div class="focus-title">${esc(f.title)}</div>
      <div class="focus-status" style="color:${status[0]}"><span class="dot"></span>${status[1]}</div>
      ${f.unreleased ? '' : crew.length
        ? `<ul class="crew-list">${crew.map(p => { const r = validRating(p.ratings[f.id]); return `<li class="${p.uid === me.uid ? 'me' : ''}">${avatar(p)}<span class="n">${esc(p.username)}</span><span class="st">${p.watched[f.id] ? 'viu' : '—'}</span><span class="r">${r ? '★'.repeat(r) + ' ' + r + '.0' : 'sem nota'}</span></li>`; }).join('')}</ul>`
        : '<div class="crew-empty">Ninguém do grupo conquistou este ainda.</div>'}
      <button type="button" class="btn-lit jump" data-action="focus" data-i="${jumpTo}"><span>${jumpTo === active ? 'Manter posição' : `Próximo ramo · ${pad(jumpTo + 1)}`}</span><span class="arrow">${ARROW}</span></button>
      ${f.unreleased ? '' : `<a class="watch-link" href="https://www.justwatch.com/br/busca?q=${encodeURIComponent(f.title)}" target="_blank" rel="noopener">Onde assistir ↗</a>`}
    </div>

    <div class="glass pad">
      <span class="kicker">Tempo restante · ${esc(scopeLabel)}</span>
      <div class="runtime"><b>${Math.floor(rem / 60)}</b><span>H</span><b style="margin-left:6px">${pad(rem % 60)}</b><span>M</span></div>
      <div class="pills"><span>FILMES · ${pending.filter(m => !isSeries(m)).length}</span><span>SÉRIES · ${pending.filter(isSeries).length}</span></div>
    </div>

    <div class="glass pad council">
      <div class="row-between"><span class="kicker gold">Conselho de Latvéria</span><span class="mono" style="font-size:10px;color:var(--muted)">${ranking.length} AGENTE${ranking.length === 1 ? '' : 'S'}</span></div>
      <ol>${ranking.map((x, i) => `
        <li class="${x.p.uid === me.uid ? 'me' : ''}">
          <span class="pos">${pad(i + 1)}</span>${avatar(x.p)}
          <div class="who"><div class="n">${esc(x.p.username)}</div><div class="bar"><i style="width:${x.pct}%"></i></div><div class="sub">${x.ess}/${ESSENTIAL.length} essenciais · ${x.seen}/${RELEASED.length} total</div></div>
          <div class="pct">${x.pct}%<small>${x.avg}★</small></div>
        </li>`).join('')}</ol>
    </div>

    <div class="glass pad converge">
      <div class="row-between"><span class="kicker gold">Convergência Doomsday</span><span class="mono" style="font-size:10px;color:var(--muted)">18.12.2026</span></div>
      <div class="countdown" id="countdown">${countdownHTML()}</div>
      <div style="font-size:13px;color:var(--soft);margin-top:12px;line-height:1.45">Vingadores: Doomsday. O soberano chega aos cinemas.</div>
    </div>`;
}

// ── Ações ────────────────────────────────────────────────────────────────
function save(promise) {
  promise.catch(e => { console.error(e); flash('// FALHA AO SALVAR — ' + friendlyError(e), true); });
}
function setSheet(open) {
  $('#aside').classList.toggle('open', open);
  $('#scrim').hidden = !open;
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  // Clicar num card fora de foco leva até ele.
  if (!el || el.closest('.card-wrap:not(.active)')) {
    const wrap = e.target.closest('.card-wrap:not(.active)');
    if (wrap) go(Number(wrap.dataset.i));
    return;
  }
  if (el.disabled) return;
  const { action, id, v } = el.dataset;
  const m = id && MOVIES[INDEX.get(id)];
  const { watched, ratings } = mine();
  switch (action) {
    case 'scope': if (prefs.scope !== v) { prefs.scope = v; savePrefs(); buildTrack(list[active]?.id); } break;
    case 'prev': go(active - 1); break;
    case 'next': go(active + 1); break;
    case 'focus': go(Number(el.dataset.i)); if (el.closest('.aside') && window.innerWidth <= 960) setSheet(false); break;
    case 'sheet': setSheet(!$('#aside').classList.contains('open')); break;
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

let raf = 0;
$('#track').addEventListener('scroll', () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    if (!geo) return;
    pos = Math.max(0, Math.min(list.length - 1, $('#track').scrollTop / geo.H));
    applyPos();
  });
}, { passive: true });

window.addEventListener('keydown', e => {
  if (!me || e.target.closest?.('input, textarea')) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); go(active + (e.key === 'ArrowDown' ? 1 : -1)); }
  if (e.key === 'Escape') setSheet(false);
});

new ResizeObserver(() => {
  if (!me || !geo) return;
  const g = computeGeo();
  if (g.narrow !== geo.narrow || g.ch !== geo.ch || g.cw !== geo.cw) buildTrack(list[active]?.id);
}).observe($('#track'));

setInterval(() => { const c = document.getElementById('countdown'); if (c) c.innerHTML = countdownHTML(); }, 1000);

// ── Login ────────────────────────────────────────────────────────────────
let mode = 'signin';
function setMode(next) {
  mode = next;
  document.querySelectorAll('.tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === mode)));
  document.querySelectorAll('[data-signup-only]').forEach(el => { el.hidden = mode !== 'signup'; });
  $('#f-pass').autocomplete = mode === 'signup' ? 'new-password' : 'current-password';
  $('#login-submit span').textContent = mode === 'signup' ? 'Alistar-se no protocolo' : 'Entrar no protocolo';
  $('#login-error').hidden = true;
}
document.querySelectorAll('.tabs [data-tab]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.tab)));

$('#login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const f = e.target, err = $('#login-error'), btn = $('#login-submit');
  const username = f.username.value, password = f.password.value;
  err.hidden = true;
  if (mode === 'signup' && password !== f.password2.value) { err.textContent = 'As senhas não conferem.'; err.hidden = false; return; }
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
  document.body.classList.toggle('locked', !!user);
  if (unsubData) { unsubData(); unsubData = null; }
  everyone = new Map();
  geo = null; rows = []; list = [];
  if (user) {
    $('#agent-name').textContent = user.username;
    let first = true;
    unsubData = store.subscribeAll(all => {
      everyone = all;
      if (!everyone.has(me.uid)) everyone.set(me.uid, { uid: me.uid, username: me.username, watched: {}, ratings: {} });
      if (first || !geo) { first = false; buildTrack(prefs.focusId); } else { refreshCards(); renderAside(); }
    }, e => { console.error(e); flash('// SEM ACESSO AO BANCO — ' + friendlyError(e), true); });
  } else {
    setSheet(false);
    setMode('signin');
    setTimeout(() => $('#f-user').focus(), 0);
  }
}

(async () => {
  const emblem = $('#emblem-tpl').innerHTML;
  document.querySelectorAll('[data-emblem]').forEach(el => { el.innerHTML = emblem; });
  try {
    store = await createStore();
  } catch (e) {
    console.error(e);
    $('#boot').textContent = 'Falha ao carregar o Firebase. Verifique a conexão e js/firebase-config.js.';
    return;
  }
  $('#demo-banner').hidden = store.mode !== 'demo';
  store.onUser(showScreen);
  loadPosters().then(p => { posters = p; if (me && geo) { refreshCards(); renderAside(); } });
})();
