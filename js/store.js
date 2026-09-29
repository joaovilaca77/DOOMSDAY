// Camada de dados: contas + progresso de cada pessoa.
// Usa o Firebase quando js/firebase-config.js está preenchido; senão cai no MODO DEMO,
// que guarda tudo no localStorage deste navegador (útil para testar o visual).
import { firebaseConfig } from './firebase-config.js';

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
const EMAIL_DOMAIN = 'doomsday.app';

export const USERNAME_RULES = 'Use 3 a 20 caracteres: letras, números, ponto, hífen ou _.';

export function normalizeUsername(raw) {
  const name = String(raw || '').trim();
  if (!/^[A-Za-z0-9._-]{3,20}$/.test(name)) throw new Error(USERNAME_RULES);
  return name;
}

export function isConfigured() {
  return !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'COLE_AQUI' && !!firebaseConfig.projectId;
}

export async function createStore() {
  return isConfigured() ? createFirebaseStore() : createDemoStore();
}

const AUTH_ERRORS = {
  'auth/email-already-in-use': 'Esse nome de usuário já existe. Escolha outro ou faça login.',
  'auth/invalid-credential': 'Usuário ou senha incorretos.',
  'auth/wrong-password': 'Usuário ou senha incorretos.',
  'auth/user-not-found': 'Usuário ou senha incorretos.',
  'auth/invalid-email': USERNAME_RULES,
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/missing-password': 'Digite a senha.',
  'auth/too-many-requests': 'Muitas tentativas. Espere um pouco e tente de novo.',
  'auth/network-request-failed': 'Sem conexão com o servidor. Verifique sua internet.',
  'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Chave do Firebase inválida. Confira o apiKey em js/firebase-config.js.',
  'auth/unauthorized-domain': 'Este endereço não está autorizado no Firebase (Authentication › Configurações › Domínios autorizados).',
  'permission-denied': 'O banco recusou o acesso. Confira se as regras de firestore.rules foram publicadas.',
  'auth/operation-not-allowed': 'Ative o login por E-mail/senha no Firebase (Authentication › Sign-in method).',
};

export function friendlyError(err) {
  return AUTH_ERRORS[err?.code] || err?.message || 'Algo deu errado.';
}

// ── Firebase ──────────────────────────────────────────────────────────────
async function createFirebaseStore() {
  const [{ initializeApp }, A, F] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  const app = initializeApp(firebaseConfig);
  const auth = A.getAuth(app);
  const db = F.getFirestore(app);
  let current = null;
  let pendingName = null; // nome digitado no cadastro, antes do displayName chegar ao perfil

  const toEmail = name => `${name.toLowerCase()}@${EMAIL_DOMAIN}`;
  const nameOf = u => u.displayName
    || (pendingName && toEmail(pendingName) === u.email ? pendingName : u.email.split('@')[0]);
  const myRef = () => F.doc(db, 'progress', current.uid);

  async function ensureDoc(user, username) {
    const ref = F.doc(db, 'progress', user.uid);
    const snap = await F.getDoc(ref);
    if (!snap.exists()) {
      await F.setDoc(ref, { username, watched: {}, ratings: {}, updatedAt: F.serverTimestamp() });
    }
  }

  function write(field, id, value) {
    if (!current) return Promise.reject(new Error('Faça login primeiro.'));
    return F.setDoc(myRef(), {
      username: current.username,
      [field]: { [id]: value == null ? F.deleteField() : value },
      updatedAt: F.serverTimestamp(),
    }, { merge: true });
  }

  return {
    mode: 'firebase',
    onUser(cb) {
      return A.onAuthStateChanged(auth, async user => {
        if (!user) { current = null; cb(null); return; }
        current = { uid: user.uid, username: nameOf(user) };
        try { await ensureDoc(user, current.username); } catch (e) { console.error(e); }
        cb(current);
      });
    },
    async signUp(rawName, password) {
      const username = normalizeUsername(rawName);
      pendingName = username;
      const cred = await A.createUserWithEmailAndPassword(auth, toEmail(username), password);
      await A.updateProfile(cred.user, { displayName: username });
      current = { uid: cred.user.uid, username };
      await ensureDoc(cred.user, username);
    },
    async signIn(rawName, password) {
      const username = normalizeUsername(rawName);
      await A.signInWithEmailAndPassword(auth, toEmail(username), password);
    },
    signOut: () => A.signOut(auth),
    subscribeAll(cb, onError) {
      return F.onSnapshot(F.collection(db, 'progress'), snap => {
        const all = new Map();
        snap.forEach(d => all.set(d.id, { uid: d.id, username: d.data().username || '?', watched: d.data().watched || {}, ratings: d.data().ratings || {} }));
        cb(all);
      }, onError);
    },
    setWatched: (id, on) => write('watched', id, on ? true : null),
    setRating: (id, n) => write('ratings', id, n ? Math.max(1, Math.min(5, Math.round(n))) : null),
  };
}

// ── Demo (localStorage) ───────────────────────────────────────────────────
function createDemoStore() {
  const KEY = 'doomProtocol.demo.v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || { users: {}, session: null }; } catch { return { users: {}, session: null }; } };
  const save = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
  const userCbs = new Set(), dataCbs = new Set();
  let state = load();

  const snapshot = () => new Map(Object.entries(state.users).map(([uid, u]) =>
    [uid, { uid, username: u.username, watched: { ...u.watched }, ratings: { ...u.ratings } }]));
  const me = () => state.session && state.users[state.session] ? { uid: state.session, username: state.users[state.session].username } : null;
  const emitUser = () => userCbs.forEach(cb => cb(me()));
  const emitData = () => dataCbs.forEach(cb => cb(snapshot()));
  const commit = () => { save(state); emitData(); };
  const err = code => Object.assign(new Error(AUTH_ERRORS[code]), { code });

  function write(field, id, value) {
    const u = state.users[state.session];
    if (!u) return Promise.reject(new Error('Faça login primeiro.'));
    if (value == null) delete u[field][id]; else u[field][id] = value;
    commit();
    return Promise.resolve();
  }

  return {
    mode: 'demo',
    onUser(cb) { userCbs.add(cb); queueMicrotask(() => cb(me())); return () => userCbs.delete(cb); },
    async signUp(rawName, password) {
      const username = normalizeUsername(rawName);
      const uid = username.toLowerCase();
      if (state.users[uid]) throw err('auth/email-already-in-use');
      if (!password || password.length < 6) throw err('auth/weak-password');
      state.users[uid] = { username, password, watched: {}, ratings: {} };
      state.session = uid;
      commit(); emitUser();
    },
    async signIn(rawName, password) {
      const uid = normalizeUsername(rawName).toLowerCase();
      if (!state.users[uid] || state.users[uid].password !== password) throw err('auth/invalid-credential');
      state.session = uid;
      save(state); emitUser();
    },
    async signOut() { state.session = null; save(state); emitUser(); },
    subscribeAll(cb) { dataCbs.add(cb); queueMicrotask(() => cb(snapshot())); return () => dataCbs.delete(cb); },
    setWatched: (id, on) => write('watched', id, on ? true : null),
    setRating: (id, n) => write('ratings', id, n ? Math.max(1, Math.min(5, Math.round(n))) : null),
  };
}
