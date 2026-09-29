// Busca os pôsteres na Wikipedia (inglês) direto do navegador — sem chave de API.
// A imagem principal da página de um filme é o pôster; de uma série, a arte de divulgação.
// Resultado fica em cache no localStorage por 7 dias. Se algo falhar, o card usa a capa gerada.
// Para forçar uma imagem específica, use o campo `poster` do título em movies.js.

const WIKI = {
  xmen: 'X-Men (film)', spider1: 'Spider-Man (2002 film)', x2: 'X2 (film)', spider2: 'Spider-Man 2',
  ff2005: 'Fantastic Four (2005 film)', x3: 'X-Men: The Last Stand', spider3: 'Spider-Man 3',
  ff2007: 'Fantastic Four: Rise of the Silver Surfer', ironman: 'Iron Man (2008 film)',
  hulk: 'The Incredible Hulk (film)', ironman2: 'Iron Man 2', thor: 'Thor (film)',
  cap1: 'Captain America: The First Avenger', avengers: 'The Avengers (2012 film)',
  firstclass: 'X-Men: First Class', asm: 'The Amazing Spider-Man (film)', ironman3: 'Iron Man 3',
  thor2: 'Thor: The Dark World', wolverine: 'The Wolverine (film)', cap2: 'Captain America: The Winter Soldier',
  asm2: 'The Amazing Spider-Man 2', dofp: 'X-Men: Days of Future Past', gotg: 'Guardians of the Galaxy (film)',
  aou: 'Avengers: Age of Ultron', antman: 'Ant-Man (film)', deadpool: 'Deadpool (film)',
  civilwar: 'Captain America: Civil War', apocalypse: 'X-Men: Apocalypse', strange: 'Doctor Strange (2016 film)',
  logan: 'Logan (film)', gotg2: 'Guardians of the Galaxy Vol. 2', homecoming: 'Spider-Man: Homecoming',
  ragnarok: 'Thor: Ragnarok', bp: 'Black Panther (film)', iw: 'Avengers: Infinity War', deadpool2: 'Deadpool 2',
  antman2: 'Ant-Man and the Wasp', marvel: 'Captain Marvel (film)', endgame: 'Avengers: Endgame',
  darkphoenix: 'Dark Phoenix (film)', ffh: 'Spider-Man: Far From Home', wv: 'WandaVision',
  fws: 'The Falcon and the Winter Soldier', loki1: 'Loki season 1', blackwidow: 'Black Widow (2021 film)',
  whatif1: 'What If...? season 1', shangchi: 'Shang-Chi and the Legend of the Ten Rings', eternals: 'Eternals (film)',
  hawkeye: 'Hawkeye (2021 TV series)', nwh: 'Spider-Man: No Way Home', moonknight: 'Moon Knight (TV series)',
  mom: 'Doctor Strange in the Multiverse of Madness', msmarvel: 'Ms. Marvel (TV series)',
  loveandthunder: 'Thor: Love and Thunder', shehulk: 'She-Hulk: Attorney at Law',
  wakanda: 'Black Panther: Wakanda Forever', quantumania: 'Ant-Man and the Wasp: Quantumania',
  gotg3: 'Guardians of the Galaxy Vol. 3', secretinvasion: 'Secret Invasion (TV series)', loki2: 'Loki season 2',
  marvels: 'The Marvels', whatif2: 'What If...? season 2', echo: 'Echo (TV series)', xmen97: "X-Men '97",
  dw: 'Deadpool & Wolverine', agatha: 'Agatha All Along', whatif3: 'What If...? season 3',
  bnw: 'Captain America: Brave New World', daredevil: 'Daredevil: Born Again', tbolts: 'Thunderbolts*',
  ironheart: 'Ironheart (miniseries)', ff: 'The Fantastic Four: First Steps', bnd: 'Spider-Man: Brand New Day',
  doomsday: 'Avengers: Doomsday',
};

const CACHE_KEY = 'doomProtocol.posters.v1';
const TTL = 7 * 24 * 3600 * 1000;
const API = 'https://en.wikipedia.org/w/api.php';

function readCache() {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (c && Date.now() - c.at < TTL) return c.urls;
  } catch {}
  return null;
}

async function fetchBatch(titles) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', formatversion: '2', origin: '*', redirects: '1',
    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '400', pilicense: 'any',
    titles: titles.join('|'),
  });
  const res = await fetch(`${API}?${params}`);
  if (!res.ok) throw new Error('Wikipedia HTTP ' + res.status);
  const { query = {} } = await res.json();
  // Segue normalizações e redirecionamentos até o título final da página.
  const hop = new Map([...(query.normalized || []), ...(query.redirects || [])].map(x => [x.from, x.to]));
  const finalTitle = t => { for (let i = 0; i < 3 && hop.has(t); i++) t = hop.get(t); return t; };
  const thumbs = new Map((query.pages || []).filter(p => p.thumbnail).map(p => [p.title, p.thumbnail.source]));
  return new Map(titles.map(t => [t, thumbs.get(finalTitle(t))]).filter(([, u]) => u));
}

// Devolve { movieId: url } — nunca rejeita.
export async function loadPosters() {
  const cached = readCache();
  if (cached) return cached;
  const entries = Object.entries(WIKI);
  const urls = {};
  try {
    for (let i = 0; i < entries.length; i += 50) {
      const chunk = entries.slice(i, i + 50);
      const found = await fetchBatch(chunk.map(([, t]) => t));
      for (const [id, t] of chunk) if (found.get(t)) urls[id] = found.get(t);
    }
    if (Object.keys(urls).length) try { localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), urls })); } catch {}
  } catch (e) {
    console.warn('Pôsteres indisponíveis:', e);
  }
  return urls;
}
