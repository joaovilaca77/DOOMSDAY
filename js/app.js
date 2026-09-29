import { MOVIES, RELEASE_DATE, DOOM_LINES } from './movies.js?v=11';
import { createStore, friendlyError } from './store.js?v=11';
import { loadPosters } from './posters.js?v=11';

const $ = sel => document.querySelector(sel);
const PREFS_KEY = 'doomProtocol.prefs.v3';
const AVATAR_COLORS = ['#6CFF9A', '#D8B878', '#7FB2E5', '#F0A092', '#B69CF0', '#6FD3D8', '#F2A65A', '#9BD46A'];

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const hm = m => `${Math.floor(m / 60)}H ${pad(m % 60)}M`;
const STAR = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>';
const CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const ARROW = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const CLOSE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
const CHEV = '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

const INDEX = new Map(MOVIES.map((m, i) => [m.id, i]));
const RELEASED = MOVIES.filter(m => !m.unreleased);
const ESSENTIALS = MOVIES.filter(m => m.essential);
const ESS_RELEASED = ESSENTIALS.filter(m => !m.unreleased);
const BRANCHES = MOVIES.filter(m => !m.essential);
const isSeries = m => m.kind.startsWith('Série');

// Cada grupo de ramificações fica logo ANTES do essencial que o encerra
// (tudo o que saiu entre o essencial anterior e ele). O que vier depois do
// último essencial lançado forma um grupo antes de Doomsday.
const GROUPS = (() => {
  const out = new Map(); let buf = [];
  for (const m of MOVIES) {
    if (m.essential) { if (buf.length) out.set(m.id, buf); buf = []; }
    else buf.push(m);
  }
  return out; // essencialId -> [ramificações antes dele]
})();

// ── Estado ───────────────────────────────────────────────────────────────
const prefs = (() => {
  let p = null;
  try { p = JSON.parse(localStorage.getItem(PREFS_KEY)); } catch {}
  return { focusId: p?.focusId ?? null, open: Array.isArray(p?.open) ? p.open : [] };
})();
const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch {} };
const isOpen = key => prefs.open.includes(key);

let store, me = null, everyone = new Map(), unsubData = null, posters = {};
let geo = null;        // { ch, cw, narrow, H, k, padT }
let focus = [];        // itens focáveis na ordem da tela: { m, ess, el, wrap, orb, seq, cy }
let active = -1;
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

// ── Árvore ───────────────────────────────────────────────────────────────
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const trunkX = (y, k) => k * (62 + 9 * Math.sin(y / 170) + 5 * Math.sin(y / 61 + 1.3));
const clampX = (x, k) => Math.max(4 * k, Math.min(124 * k, x));
const f1 = n => n.toFixed(1);
function trunkPath(y0, y1, k) {
  let d = `M${f1(trunkX(y0, k))},${f1(y0)}`;
  for (let y = y0 + 12; y < y1; y += 12) d += ` L${f1(trunkX(y, k))},${f1(y)}`;
  return d + ` L${f1(trunkX(y1, k))},${f1(y1)}`;
}
// Galhinhos decorativos ao longo do tronco (evita os trechos com ramificações abertas).
function twigsPath(y0, y1, k, skip) {
  const r = rng(828);
  let side = 1, d = '';
  for (let y = y0 + 30; y < y1 - 10; y += 26 + r() * 22) {
    side = r() < 0.7 ? -side : side;
    const x = trunkX(y, k), len = 22 + r() * 34;
    const ex = clampX(x + side * len * k, k), ey = y - len * (0.55 + r() * 0.35);
    const mx = clampX(x + side * len * 0.45 * k, k), my = y - len * 0.15;
    const twigs = 1 + Math.floor(r() * 3);
    const parts = [];
    for (let j = 0; j < twigs; j++) {
      const t = 0.35 + r() * 0.5, px = x + (ex - x) * t, py = y + (ey - y) * t;
      const tl = 7 + r() * 12, ts = r() < 0.5 ? side : -side * 0.4;
      parts.push(` M${f1(px)},${f1(py)} L${f1(clampX(px + ts * tl * k, k))},${f1(py - tl * (0.7 + r() * 0.5))}`);
    }
    if (side > 0 && skip.some(([a, b]) => y > a - 20 && y < b + 20)) continue;
    d += ` M${f1(x)},${f1(y)} Q${f1(mx)},${f1(my)} ${f1(ex)},${f1(ey)}` + parts.join('');
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

// ── Cards ────────────────────────────────────────────────────────────────
function groupStats(m) {
  const all = people();
  const watchers = all.filter(p => p.watched[m.id]);
  const rated = all.map(p => validRating(p.ratings[m.id])).filter(Boolean);
  return { all, watchers, rated, avg: rated.length ? (rated.reduce((a, b) => a + b, 0) / rated.length).toFixed(1) : null };
}
function starsHTML(m, r) {
  return [1, 2, 3, 4, 5].map(n =>
    `<button type="button" class="star${n <= r ? ' on' : ''}" data-action="rate" data-id="${m.id}" data-v="${n}" ${m.unreleased ? 'disabled title="Ainda não lançado"' : `title="Nota ${n} de 5" aria-label="Nota ${n} de 5"`}>${STAR}</button>`).join('');
}
function crewLine(m, max = 5) {
  const g = groupStats(m);
  const shown = g.watchers.slice(0, max), more = g.watchers.length - shown.length;
  return `<div class="crew-line"><span>Grupo</span><span class="avg">${g.avg ? `★ ${g.avg} · ${g.rated.length} nota${g.rated.length > 1 ? 's' : ''}` : 'sem notas'}</span><span class="avatars">${shown.map(avatar).join('')}${more > 0 ? `<span class="avatar more">+${more}</span>` : ''}</span><span>${g.watchers.length}/${g.all.length} viram</span></div>`;
}

function essCardHTML(m, n, nextId) {
  const { watched, ratings } = mine();
  const w = !!watched[m.id], r = validRating(ratings[m.id]);
  return `<article class="card">
    <div class="poster-frame">${posterHTML(m)}</div>
    <div class="card-body">
      <div class="card-top">
        <span class="kicker" style="letter-spacing:.14em">ESSENCIAL ${pad(n + 1)} / ${pad(ESSENTIALS.length)}</span>
        <span class="chip phase">${esc(m.phase)}</span>
        ${m.id === nextId ? '<span class="chip next">Próximo</span>' : ''}
      </div>
      ${w ? '<div class="crest" title="Conquistado"><div><b>LV</b><small>CONQ.</small></div></div>' : ''}
      <h2>${esc(m.title)}</h2>
      <div class="facts">
        <div class="fact"><div class="l">ÉPOCA</div><div class="v">${esc(m.era)}</div></div>
        <div class="fact"><div class="l">DURAÇÃO</div><div class="v">${m.runtime ? hm(m.runtime) : (m.unreleased ? 'CLASSIFICADA' : '—')}</div></div>
        <div class="fact"><div class="l">LANÇAMENTO</div><div class="v">${m.unreleased ? '18.12.2026' : m.year} · ${esc(m.kind)}</div></div>
      </div>
      <p class="brief">${esc(m.brief)}</p>
      <div class="tags">${m.tags.map(([label, tone]) => `<span class="tag tone-${tone}">${esc(label)}</span>`).join('')}</div>
      <div class="controls">
        <button type="button" class="conquer${w ? ' on' : ''}" data-action="toggle" data-id="${m.id}" ${m.unreleased ? 'disabled' : ''} aria-pressed="${w}">
          ${w ? CHECK : ''}${m.unreleased ? 'Aguardando estreia' : w ? 'Conquistado' : 'Marcar como conquistado'}
        </button>
        <div class="rating" role="group" aria-label="Sua nota">${starsHTML(m, r)}<span class="rating-label${r ? ' on' : ''}">${m.unreleased ? 'N/D' : r ? `${r}.0 / 5` : 'SEM NOTA'}</span></div>
      </div>
      ${m.unreleased ? '' : crewLine(m)}
    </div>
  </article>`;
}

function branchCardHTML(m) {
  const { watched, ratings } = mine();
  const w = !!watched[m.id], r = validRating(ratings[m.id]);
  const g = groupStats(m);
  return `<article class="bcard${w ? ' done' : ''}">
    <div class="bposter">${posterHTML(m)}</div>
    <div class="bbody">
      <div class="kicker">Época ${esc(m.era)} · ${esc(m.phase)} · lançado em ${m.year}${m.runtime ? ' · ' + hm(m.runtime) : ''}</div>
      <h3>${esc(m.title)}</h3>
      <div class="bcontrols">
        <button type="button" class="conquer sm${w ? ' on' : ''}" data-action="toggle" data-id="${m.id}" aria-pressed="${w}">${w ? CHECK + 'Conquistado' : 'Conquistar'}</button>
        <div class="rating sm" role="group" aria-label="Sua nota">${starsHTML(m, r)}</div>
        <span class="bavg">${g.avg ? `GRUPO ★ ${g.avg}` : ''}${g.watchers.length ? ` · ${g.watchers.length} viu${g.watchers.length > 1 ? 'ram' : ''}` : ''}</span>
      </div>
    </div>
  </article>`;
}

// ── Trilha ───────────────────────────────────────────────────────────────
function computeGeo() {
  const track = $('#track');
  const cw = track.clientWidth, ch = track.clientHeight || 600;
  const narrow = cw < 760;
  const H = narrow ? Math.min(600, Math.max(ch, 440)) : Math.min(440, Math.max(ch, 380));
  return { cw, ch, narrow, H, k: narrow ? 0.5 : 1, padT: Math.max(0, (ch - H) / 2) };
}
const nextTargetId = () => { const { watched } = mine(); return ESSENTIALS.find(m => !m.unreleased && !watched[m.id])?.id; };

function groupHeadHTML(key, items) {
  const { watched } = mine();
  const done = items.filter(m => watched[m.id]).length;
  const open = isOpen(key);
  return `<div class="bgroup-head">
      <div class="node-col" style="width:${130 * geo.k}px"></div>
      <button type="button" class="bgroup-toggle${open ? ' open' : ''}${done === items.length ? ' all' : ''}" data-action="group" data-key="${key}" aria-expanded="${open}">
        ${CHEV}<span>${items.length} ramificaç${items.length > 1 ? 'ões' : 'ão'}</span><span class="bcount">${done}/${items.length}</span>
        <span class="bnames">${esc(items.slice(0, 3).map(m => m.title).join(' · '))}${items.length > 3 ? ' …' : ''}</span>
      </button>
    </div>`;
}

// Monta (ou remonta) toda a trilha. `anchor` mantém um elemento parado na tela.
function buildTrack(anchor) {
  const track = $('#track'), inner = $('#track-inner');
  const prevTop = anchor?.el ? anchor.el.getBoundingClientRect().top : null;
  geo = computeGeo();
  const { H, k, narrow, padT } = geo;
  const nextId = nextTargetId();
  inner.style.setProperty('--track-pl', narrow ? '8px' : 'clamp(12px,2vw,32px)');
  inner.style.padding = `${padT}px ${narrow ? '12px' : 'clamp(20px,3vw,44px)'} ${padT}px var(--track-pl)`;

  let html = '';
  ESSENTIALS.forEach((m, n) => {
    const items = GROUPS.get(m.id);
    if (items) {
      html += `<div class="bgroup" data-key="${m.id}">${groupHeadHTML(m.id, items)}`;
      if (isOpen(m.id)) html += items.map(b => `<div class="bitem" data-id="${b.id}">
          <div class="node-col" style="width:${130 * k}px"><button type="button" class="orb sm" data-action="focus" data-id="${b.id}" aria-label="Ir para ${esc(b.title)}"></button></div>
          <div class="bcard-wrap" data-id="${b.id}">${branchCardHTML(b)}</div>
        </div>`).join('');
      html += '</div>';
    }
    html += `<div class="item" style="height:${H}px" data-id="${m.id}">
        <div class="node-col" style="width:${130 * k}px">
          <button type="button" class="orb" data-action="focus" data-id="${m.id}" title="${esc(m.title)}" aria-label="Ir para ${esc(m.title)}"></button>
          <span class="seq-label">${pad(n + 1)}</span>
        </div>
        <div class="card-wrap" data-id="${m.id}">${essCardHTML(m, n, nextId)}</div>
      </div>`;
  });
  inner.innerHTML = html;

  // Mede posições reais e desenha a árvore.
  const top = el => el.offsetTop + el.offsetHeight / 2;
  focus = [...inner.querySelectorAll('.item, .bitem')].map(el => {
    const m = MOVIES[INDEX.get(el.dataset.id)];
    return { m, ess: el.classList.contains('item'), el, wrap: el.querySelector('.card-wrap, .bcard-wrap'), orb: el.querySelector('.orb'), seq: el.querySelector('.seq-label'), cy: top(el) };
  });
  const sideX = y => trunkX(y, k) + 34 * k;
  for (const f of focus) {
    const x = f.ess ? trunkX(f.cy, k) : sideX(f.cy);
    f.orb.style.left = f1(x) + 'px';
    if (f.seq) f.seq.style.left = f1(x) + 'px';
  }
  const firstY = focus[0].cy, lastY = focus[focus.length - 1].cy;
  const y0 = Math.max(10, firstY - H / 2 + 10), y1 = lastY + 70;
  const skip = [];
  let side = '';
  inner.querySelectorAll('.bgroup').forEach(g => {
    const headEl = g.querySelector('.bgroup-head');
    const hy = headEl.offsetTop + headEl.offsetHeight / 2;
    const kids = [...g.querySelectorAll('.bitem')].map(top);
    const tx = trunkX(hy - 26, k);
    // Brotinho que sai do tronco até o botão do grupo.
    side += ` M${f1(tx)},${f1(hy - 26)} Q${f1(tx + 20 * k)},${f1(hy - 6)} ${f1(tx + 44 * k)},${f1(hy)}`;
    if (kids.length) {
      const last = kids[kids.length - 1];
      skip.push([hy - 30, last + 30]);
      side += ` M${f1(tx)},${f1(hy - 26)} C${f1(tx + 34 * k)},${f1(hy)} ${f1(sideX(kids[0]))},${f1(kids[0] - 40)} ${f1(sideX(kids[0]))},${f1(kids[0])}`;
      for (let y = kids[0] + 12; y < last; y += 12) side += ` L${f1(sideX(y))},${f1(y)}`;
      side += ` L${f1(sideX(last))},${f1(last)} Q${f1(sideX(last))},${f1(last + 36)} ${f1(trunkX(last + 60, k))},${f1(last + 60)}`;
    }
  });
  const trunk = trunkPath(y0, y1, k), tw = twigsPath(y0 + 10, y1 - 10, k, skip);
  const svgH = Math.ceil(inner.scrollHeight);
  inner.insertAdjacentHTML('afterbegin', `<svg class="tree" width="${130 * k}" height="${svgH}" aria-hidden="true">
      <defs><clipPath id="lit-clip"><rect x="-40" y="0" width="${200 * k + 80}" height="0"></rect></clipPath></defs>
      <path d="${tw}" fill="none" stroke="#1D5A3C" stroke-width="1.2" stroke-linecap="round" opacity=".55"></path>
      <path d="${side}" fill="none" stroke="#1D5A3C" stroke-width="1.8" stroke-linecap="round" opacity=".8"></path>
      <path d="${trunk}" fill="none" stroke="#1D5A3C" stroke-width="2" stroke-linecap="round" opacity=".8"></path>
      <g clip-path="url(#lit-clip)">
        <path d="${tw}" fill="none" stroke="#6CFF9A" stroke-width="4" stroke-linecap="round" opacity=".16"></path>
        <path d="${tw}" fill="none" stroke="#9CFFB8" stroke-width="1.3" stroke-linecap="round" opacity=".95"></path>
        <path d="${side}" fill="none" stroke="#6CFF9A" stroke-width="6" stroke-linecap="round" opacity=".16"></path>
        <path d="${side}" fill="none" stroke="#C8FFD8" stroke-width="1.6" stroke-linecap="round"></path>
        <path d="${trunk}" fill="none" stroke="#6CFF9A" stroke-width="10" stroke-linecap="round" opacity=".14"></path>
        <path d="${trunk}" fill="none" stroke="#6CFF9A" stroke-width="4" stroke-linecap="round" opacity=".6"></path>
        <path d="${trunk}" fill="none" stroke="#F2FFE9" stroke-width="1.6" stroke-linecap="round"></path>
      </g>
    </svg>`);
  litRect = inner.querySelector('#lit-clip rect');

  // Posição da rolagem.
  if (anchor?.id) {
    const el = anchor.id.startsWith('g:') ? inner.querySelector(`.bgroup[data-key="${anchor.id.slice(2)}"] .bgroup-head`) : inner.querySelector(`[data-id="${anchor.id}"].item, [data-id="${anchor.id}"].bitem`);
    if (el && prevTop != null) track.scrollTop += el.getBoundingClientRect().top - prevTop;
    else if (el) track.scrollTop = el.offsetTop + el.offsetHeight / 2 - geo.ch / 2;
  } else if (anchor?.scrollTop != null) {
    track.scrollTop = anchor.scrollTop;
  }
  active = -1;
  applyPos();
  renderHeader();
}

function applyPos() {
  if (!geo || !focus.length) return;
  const { H, ch } = geo;
  const center = $('#track').scrollTop + ch / 2;
  if (litRect) litRect.setAttribute('height', f1(Math.max(0, center)));
  let a = 0, best = Infinity;
  for (let i = 0; i < focus.length; i++) {
    const f = focus[i], dist = f.cy - center;
    if (Math.abs(dist) < best) { best = Math.abs(dist); a = i; }
    const lit = f.cy <= center + 1;
    f.orb.classList.toggle('lit', lit);
    if (f.seq) f.seq.classList.toggle('lit', lit);
    if (!f.ess) continue;
    const d = dist / H, ad = Math.min(Math.abs(d), 1);
    if (ad >= 1 && f.far === Math.sign(d)) continue;
    const scale = d < 0 ? 1 - 0.2 * ad : 1 - 0.1 * ad;
    f.wrap.style.transform = `scale(${scale.toFixed(4)})`;
    f.wrap.style.opacity = Math.max(d < 0 ? 1 - 0.6 * ad : 1 - 0.7 * ad, 0.12).toFixed(3);
    f.wrap.firstElementChild.classList.toggle('past', d < 0);
    f.far = ad >= 1 ? Math.sign(d) : 0;
  }
  if (a !== active) {
    const prev = focus[active];
    if (prev) { prev.wrap.classList.remove('active'); prev.orb.classList.remove('active'); prev.seq?.classList.remove('active'); }
    active = a;
    const f = focus[a];
    f.wrap.classList.add('active'); f.orb.classList.add('active'); f.seq?.classList.add('active');
    prefs.focusId = f.m.id; savePrefs();
    renderAside();
  }
}

function goTo(i) {
  const f = focus[Math.max(0, Math.min(focus.length - 1, i))];
  if (f) $('#track').scrollTo({ top: f.cy - geo.ch / 2, behavior: 'smooth' });
}
function goToId(id) {
  let i = focus.findIndex(f => f.m.id === id);
  if (i < 0) {
    // Ramificação fechada: abre o grupo dela e depois vai até ela.
    const key = [...GROUPS].find(([, items]) => items.some(m => m.id === id))?.[0];
    if (!key) return;
    prefs.open.push(key); savePrefs();
    buildTrack({ scrollTop: $('#track').scrollTop });
    i = focus.findIndex(f => f.m.id === id);
  }
  goTo(i);
}

function toggleGroup(key) {
  prefs.open = isOpen(key) ? prefs.open.filter(k => k !== key) : [...prefs.open, key];
  savePrefs();
  const head = document.querySelector(`.bgroup[data-key="${key}"] .bgroup-head`);
  buildTrack({ id: 'g:' + key, el: head });
}

// ── Cabeçalho ────────────────────────────────────────────────────────────
function renderHeader() {
  const { watched } = mine();
  const bDone = BRANCHES.filter(m => watched[m.id]).length;
  const eDone = ESS_RELEASED.filter(m => watched[m.id]).length;
  const allOpen = prefs.open.length >= GROUPS.size;
  $('#timeline-info').innerHTML = `<span class="tl-chip">Linha Sagrada</span>
    <span class="tl-stat"><b>${eDone}/${ESS_RELEASED.length}</b> essenciais</span>
    <span class="tl-stat"><b>${bDone}/${BRANCHES.length}</b> ramificações</span>
    <button type="button" class="tl-btn" data-action="all-groups">${allOpen ? 'Recolher todas' : 'Abrir todas'}</button>`;
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
  if (!me || !focus.length) return;
  const { watched } = mine();
  const f = focus[active]?.m || ESSENTIALS[0];
  const essIdx = ESSENTIALS.indexOf(f);
  const done = ESS_RELEASED.filter(m => watched[m.id]).length;
  const pct = Math.round(done / ESS_RELEASED.length * 100);
  const bDone = BRANCHES.filter(m => watched[m.id]).length;
  const pendingE = ESS_RELEASED.filter(m => !watched[m.id]);
  const pendingB = BRANCHES.filter(m => !m.unreleased && !watched[m.id]);
  const remE = pendingE.reduce((s, m) => s + (m.runtime || 0), 0);
  const remB = pendingB.reduce((s, m) => s + (m.runtime || 0), 0);

  // "Posição" = essencial em foco, ou o essencial logo abaixo do grupo em foco.
  const nearEss = essIdx >= 0 ? essIdx : ESSENTIALS.indexOf(ESSENTIALS.find(e => GROUPS.get(e.id)?.includes(f)));
  const label = essIdx >= 0 ? `${pad(essIdx + 1)} / ${pad(ESSENTIALS.length)}` : 'RAMIFICAÇÃO';
  $('#counter').textContent = essIdx >= 0 ? `${pad(essIdx + 1)} / ${pad(ESSENTIALS.length)}` : `RAMO · ${pad(nearEss + 1)}`;
  $('#sheet-pct').textContent = pct + '%';

  const fi = INDEX.get(f.id);
  const jump = ESSENTIALS.find(m => INDEX.get(m.id) > fi && !m.unreleased && !watched[m.id])
    || ESSENTIALS.find(m => !m.unreleased && !watched[m.id]) || ESSENTIALS[ESSENTIALS.length - 1];

  const ranking = people().map(p => {
    const seen = RELEASED.filter(m => p.watched[m.id]).length;
    const ess = ESS_RELEASED.filter(m => p.watched[m.id]).length;
    const rs = Object.values(p.ratings).map(validRating).filter(Boolean);
    return { p, seen, ess, pct: Math.round(ess / ESS_RELEASED.length * 100), avg: rs.length ? (rs.reduce((a, b) => a + b, 0) / rs.length).toFixed(1) : '—' };
  }).sort((a, b) => b.ess - a.ess || b.seen - a.seen || a.p.username.localeCompare(b.p.username));

  const g = groupStats(f);
  const crew = g.all.filter(p => p.watched[f.id] || validRating(p.ratings[f.id]));
  const status = f.unreleased ? ['#D8B878', 'AGUARDANDO ESTREIA'] : watched[f.id] ? ['#6CFF9A', 'CONQUISTADO · DOMÍNIO APROVADO'] : ['#7F998B', 'NÃO CONQUISTADO'];

  $('#aside').innerHTML = `
    <div class="sheet-head"><span class="kicker gold">Arquivo de Inteligência</span><button type="button" class="round-btn" data-action="sheet" aria-label="Fechar">${CLOSE}</button></div>

    <div class="glass archive">
      <div class="archive-thumb">${posterHTML(f)}</div>
      <div style="flex:1;min-width:0">
        <span class="kicker gold" style="font-size:10px">ARQUIVO DOOM · ${label}</span>
        <div class="archive-line">${esc(DOOM_LINES[f.id] || f.brief)}</div>
      </div>
    </div>

    <div class="glass pad intel">
      <div class="intel-head">
        <div><div class="kicker gold" style="font-size:10px">CONFIDENCIAL · Ω</div><h3>Arquivo de Inteligência Latveriano</h3></div>
        <span class="live"><span class="dot"></span>AO VIVO</span>
      </div>
      <div class="row-between" style="margin-top:20px"><span class="kicker">Essenciais</span><span class="mono" style="font-size:11px;color:var(--soft)">${done} / ${ESS_RELEASED.length} CONQUISTADOS</span></div>
      <div class="big-pct">${pct}<small>%</small></div>
      <div class="segments">${ESSENTIALS.map((m, i) =>
        `<button type="button" class="seg${watched[m.id] ? ' done' : ''}${m === f ? ' active' : ''}" data-action="focus" data-id="${m.id}" title="${pad(i + 1)} · ${esc(m.title)}" aria-label="${esc(m.title)}"></button>`).join('')}</div>
      <div class="row-between" style="margin-top:14px"><span class="kicker">Ramificações</span><span class="mono" style="font-size:11px;color:var(--soft)">${bDone} / ${BRANCHES.length}</span></div>
      <div class="bar"><i style="width:${Math.round(bDone / BRANCHES.length * 100)}%"></i></div>
    </div>

    <div class="glass pad focus-box">
      <span class="kicker">EM FOCO · ${label}</span>
      <div class="focus-title">${esc(f.title)}</div>
      <div class="focus-status" style="color:${status[0]}"><span class="dot"></span>${status[1]}</div>
      ${f.unreleased ? '' : crew.length
        ? `<ul class="crew-list">${crew.map(p => { const r = validRating(p.ratings[f.id]); return `<li class="${p.uid === me.uid ? 'me' : ''}">${avatar(p)}<span class="n">${esc(p.username)}</span><span class="st">${p.watched[f.id] ? 'viu' : '—'}</span><span class="r">${r ? '★'.repeat(r) + ' ' + r + '.0' : 'sem nota'}</span></li>`; }).join('')}</ul>`
        : '<div class="crew-empty">Ninguém do grupo conquistou este ainda.</div>'}
      <button type="button" class="btn-lit jump" data-action="focus" data-id="${jump.id}"><span>${jump === f ? 'Manter posição' : `Próximo essencial · ${pad(ESSENTIALS.indexOf(jump) + 1)}`}</span><span class="arrow">${ARROW}</span></button>
      ${f.unreleased ? '' : `<a class="watch-link" href="https://www.justwatch.com/br/busca?q=${encodeURIComponent(f.title)}" target="_blank" rel="noopener">Onde assistir ↗</a>`}
    </div>

    <div class="glass pad">
      <span class="kicker">Tempo restante · essenciais</span>
      <div class="runtime"><b>${Math.floor(remE / 60)}</b><span>H</span><b style="margin-left:6px">${pad(remE % 60)}</b><span>M</span></div>
      <div class="pills"><span>FILMES · ${pendingE.filter(m => !isSeries(m)).length}</span><span>SÉRIES · ${pendingE.filter(isSeries).length}</span></div>
      <div class="mono" style="font-size:11px;color:var(--muted);margin-top:10px">+ ${Math.floor(remB / 60)}H ${pad(remB % 60)}M em ${pendingB.length} ramificações</div>
    </div>

    <div class="glass pad council">
      <div class="row-between"><span class="kicker gold">Conselho de Latvéria</span><span class="mono" style="font-size:10px;color:var(--muted)">${ranking.length} AGENTE${ranking.length === 1 ? '' : 'S'}</span></div>
      <ol>${ranking.map((x, i) => `
        <li class="${x.p.uid === me.uid ? 'me' : ''}">
          <span class="pos">${pad(i + 1)}</span>${avatar(x.p)}
          <div class="who"><div class="n">${esc(x.p.username)}</div><div class="bar"><i style="width:${x.pct}%"></i></div><div class="sub">${x.ess}/${ESS_RELEASED.length} essenciais · ${x.seen}/${RELEASED.length} total</div></div>
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
  const idle = e.target.closest('.card-wrap:not(.active), .bcard-wrap:not(.active)');
  // Clicar num card fora de foco leva até ele (menos os botões de ramificação, que funcionam direto).
  if (idle && (!el || idle.classList.contains('card-wrap'))) { goToId(idle.dataset.id); return; }
  if (!el || el.disabled) return;
  const { action, id, v } = el.dataset;
  const m = id && MOVIES[INDEX.get(id)];
  const { watched, ratings } = mine();
  switch (action) {
    case 'prev': goTo(active - 1); break;
    case 'next': goTo(active + 1); break;
    case 'focus': goToId(id); if (el.closest('.aside') && window.innerWidth <= 960) setSheet(false); break;
    case 'group': toggleGroup(el.dataset.key); break;
    case 'all-groups': {
      const f = focus[active];
      prefs.open = prefs.open.length >= GROUPS.size ? [] : [...GROUPS.keys()];
      savePrefs();
      buildTrack(f?.ess ? { id: f.m.id, el: f.el } : { id: nearestEssId() });
      break;
    }
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
function nearestEssId() {
  for (let i = active; i < focus.length; i++) if (focus[i]?.ess) return focus[i].m.id;
  return ESSENTIALS[0].id;
}

let raf = 0;
$('#track').addEventListener('scroll', () => {
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(applyPos);
}, { passive: true });

window.addEventListener('keydown', e => {
  if (!me || e.target.closest?.('input, textarea')) return;
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); goTo(active + (e.key === 'ArrowDown' ? 1 : -1)); }
  if (e.key === 'Escape') setSheet(false);
});

new ResizeObserver(() => {
  if (!me || !geo) return;
  const g = computeGeo();
  if (g.narrow !== geo.narrow || g.ch !== geo.ch || g.cw !== geo.cw) buildTrack({ id: focus[active]?.m.id });
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
  geo = null; focus = [];
  if (user) {
    $('#agent-name').textContent = user.username;
    unsubData = store.subscribeAll(all => {
      everyone = all;
      if (!everyone.has(me.uid)) everyone.set(me.uid, { uid: me.uid, username: me.username, watched: {}, ratings: {} });
      if (!geo) {
        const id = MOVIES.some(m => m.id === prefs.focusId) ? prefs.focusId : nextTargetId() || ESSENTIALS[0].id;
        const key = [...GROUPS].find(([, items]) => items.some(m => m.id === id))?.[0];
        if (key && !isOpen(key)) prefs.open.push(key);
        buildTrack({ id });
      } else {
        buildTrack({ scrollTop: $('#track').scrollTop });
      }
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
  loadPosters().then(p => { posters = p; if (me && geo) buildTrack({ scrollTop: $('#track').scrollTop }); });
})();
