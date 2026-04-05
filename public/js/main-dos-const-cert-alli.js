import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

/* ═══════════════════════════════════════════════════════
   Fatlin AI - Adventure | main.js — Módulo Principal
   Separado en secciones lógicas:
     § 1 Firebase · Auth · i18n
     § 2 Lógica de Juego · IA · Pool
     § 3 Interfaz · HUD · Diplomas · Tienda
═══════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════════════
   SECCIÓN: FIREBASE · CONFIGURACIÓN · AUTENTICACIÓN
   Contiene: imports Firebase, firebaseConfig, LANG (i18n),
             setLang, fuentes PACIE, privacidad, avatar,
             loadProgress, onAuthStateChanged, initGameUI
════════════════════════════════════════════════════════════ */
const firebaseConfig = {
  apiKey:            "AIzaSyAByrBFOD9-Ji93nT3s31As_xN0tWS5_QE",
  authDomain:        "fatlin.firebaseapp.com",
  projectId:         "fatlin",
  storageBucket:     "fatlin.firebasestorage.app",
  messagingSenderId: "88080333098",
  appId:             "1:88080333098:web:6a981dfc448b9ea670c653",
  measurementId:     "G-48G27L9J64"
};

// ═══════════════════════════════════════════════════════════════
// SISTEMA DE INTERNACIONALIZACIÓN (i18n)
// ═══════════════════════════════════════════════════════════════
const LANG = {
  es: {
    tap_continue:    'Toca para continuar',
    subtitle:        'Metodología PACIE',
    auth_tagline:    'Gestión Educativa Inteligente',
    btn_google:      'Continuar con Google',
    btn_email:       'Correo electrónico',
    btn_guest:       'Entrar como Invitado',
    ph_email:        'Correo',
    ph_pass:         'Contraseña',
    remember_me:     'Recordar credenciales',
    btn_login:       'Entrar / Registrar',
    btn_back:        '← Volver',
    hud_avatar:      'Cambiar avatar',
    hud_shop:        'Tienda',
    challenge_label: 'Desafío PACIE',
    replaying:       '🔄 Repasando nivel',
    hits_needed:     'aciertos necesarios',
    true_false:      'Verdadero o Falso',
    life_lost:       'Vida perdida · El progreso se mantiene',
    ai_loading:      'Consultando fuentes PACIE...',
    ai_loading_sub:  'Buscando en fatla.org, pacie.education...',
    tf_true:         '✅ Verdadero',
    tf_false:        '❌ Falso',
    badge_unlocked:  'Insignia desbloqueada',
    keep_going:      '¡Seguir escalando! 🚀',
    ranking_title:   '🏆 Ranking',
    tab_global:      '🌍 Global (Top 25)',
    tab_league:      '⚡ Liga Semanal',
    league_week:     '⚡ Liga Semanal PACIE',
    league_top:      '🏅 Clasificados',
    league_table:    '📊 Tabla Semanal',
    league_promo:    'Los 5 primeros de cada semana clasifican a la <strong>Liga PACIE</strong> ⚡',
    league_reset:    'Reinicio cada lunes 00:00',
    my_account:      'Mi Cuenta',
    change_avatar:   'Cambiar Avatar',
    switch_account:  'Cambiar de cuenta',
    new_account:     'Registrar nueva cuenta',
    logout:          'Cerrar sesión',
    anon_session:    'Sesión anónima',
    guest_label:     'Invitado',
    confirm_logout:  '¿Cerrar sesión?',
    confirm_switch:  '¿Cambiar de cuenta?',
    pick_avatar:     'Elige tu Avatar',
    avatar_sub:      'Personaliza tu identidad en el juego',
    confirm_avatar:  'Confirmar Avatar ✓',
    stat_level:      'Nivel',
    stat_stars:      'Estrellas',
    stat_badges:     'Insignias',
    diploma_title:   'Certificado de Logro',
    diploma_org:     'Fatlin AI · Metodología PACIE',
    diploma_certify: 'Se certifica que',
    diploma_level:   'ha completado {N} niveles de la metodología PACIE',
    diploma_skills:  'demostrando dominio en las fases de Presencia, Alcance,<br>Capacitación, Interacción y E-learning',
    diploma_issued:  'Emitido el',
    diploma_print:   '🖨️ Imprimir / Guardar PDF',
    shop_title:      '🛍️ Tienda PACIE',
    your_stars:      'Tus estrellas: ',
    shield_1_name:   '1 Escudo',
    shield_1_desc:   'Protege tu racha 1 vez',
    shield_3_name:   '3 Escudos',
    shield_3_desc:   '¡Ahorra 15 estrellas!',
    gala_24_name:    'Modo Gala 24h',
    gala_24_desc:    'Vidas infinitas + fondo estelar',
    gala_72_name:    'Modo Gala 72h',
    gala_72_desc:    '¡El mejor valor!',
    no_lives:        'Sin vidas. La primera se regenera cuando llegues a 0 · cada 3 horas una vida.',
    no_stars_need:   'Necesitas {N} ⭐ (tienes {M})',
    shield_bought:   '🛡️ {N} escudo{S} comprado{S}. Total: {T}',
    gala_activated:  '✨ ¡Modo Gala activado por {N}h! Vidas infinitas 🚀',
    gala_ended:      'Modo Gala finalizado. ¡Sigue ganando estrellas!',
    streak_saved:    '🛡️ Escudo usado — ¡Racha salvada! ({N} restantes)',
    streak_lost:     '💔 Racha perdida. ¡Compra escudos para protegerla!',
    streak_active:   '🔥 ¡{N} días seguidos! Racha activa',
    scroll_hint:     '🖱️ Rueda del mouse para explorar',
    footer:          'Tecnotips &#169; - 2026 · Tecnología con propósito',
    node_replay:     '¡Repasar!',
    blast_msgs: {
      10:'¡Despegando! ⭐', 20:'¡Imparable! 🔥', 30:'¡Crack total! 💎',
      40:'¡Élite PACIE! 🏆', 50:'¡DIPLOMA GANADO! 🎓', 60:'¡Maestro Absoluto! 👑',
      70:'¡Superestrella! 🌟', 80:'¡Arquitecto PACIE! 🏛️', 90:'¡Visionario! 🔮',
      100:'¡MÁSTER TOTAL! 🎓✨'},
    rewards:[
      {emoji:'🌱',title:'¡Primer gran paso!',  badge:'🎖️ Semilla PACIE',   msg:'10 niveles conquistados.'},
      {emoji:'⚡',title:'¡Imparable!',          badge:'🥉 Explorador PACIE', msg:'20 niveles dominados.'},
      {emoji:'🔥',title:'¡En llamas!',          badge:'🥈 Navegante PACIE',  msg:'30 niveles superados.'},
      {emoji:'💎',title:'¡Élite PACIE!',        badge:'🥇 Maestro PACIE',    msg:'40 niveles vencidos.'},
      {emoji:'🚀',title:'¡Leyenda viva!',       badge:'🏆 Leyenda PACIE',    msg:'50 niveles conquistados.'},
      {emoji:'👑',title:'¡Máximo Honor!',       badge:'👑 Rey PACIE',        msg:'60 niveles. Cumbre alcanzada.'},
      {emoji:'🌟',title:'¡Superestrella!',      badge:'🌟 Estrella PACIE',   msg:'70 niveles. Territorio élite.'},
      {emoji:'🏛️',title:'¡Arquitecto PACIE!', badge:'🏛️ Arquitecto',      msg:'80 niveles. Conocimiento sólido.'},
      {emoji:'🔮',title:'¡Visionario PACIE!',   badge:'🔮 Visionario',       msg:'90 niveles. Visión total.'},
      {emoji:'🎓',title:'¡Máster Absoluto!',    badge:'🎓 Máster Absoluto',  msg:'100 niveles. Cima conquistada.'},
    ],
  },

  en: {
    tap_continue:    'Tap to continue',
    subtitle:        'PACIE Methodology',
    auth_tagline:    'Intelligent Educational Management',
    btn_google:      'Continue with Google',
    btn_email:       'Email address',
    btn_guest:       'Enter as Guest',
    ph_email:        'Email',
    ph_pass:         'Password',
    remember_me:     'Remember credentials',
    btn_login:       'Sign in / Register',
    btn_back:        '← Back',
    hud_avatar:      'Change avatar',
    hud_shop:        'Shop',
    challenge_label: 'PACIE Challenge',
    replaying:       '🔄 Reviewing level',
    hits_needed:     'correct answers needed',
    true_false:      'True or False',
    life_lost:       'Life lost · Progress is kept',
    ai_loading:      'Consulting PACIE sources...',
    ai_loading_sub:  'Searching fatla.org, pacie.education...',
    tf_true:         '✅ True',
    tf_false:        '❌ False',
    badge_unlocked:  'Badge unlocked',
    keep_going:      'Keep climbing! 🚀',
    ranking_title:   '🏆 Ranking',
    tab_global:      '🌍 Global (Top 25)',
    tab_league:      '⚡ Weekly League',
    league_week:     '⚡ PACIE Weekly League',
    league_top:      '🏅 Qualifiers',
    league_table:    '📊 Weekly Table',
    league_promo:    'The top 5 each week qualify for the <strong>PACIE League</strong> ⚡',
    league_reset:    'Resets every Monday 00:00',
    my_account:      'My Account',
    change_avatar:   'Change Avatar',
    switch_account:  'Switch account',
    new_account:     'Register new account',
    logout:          'Sign out',
    anon_session:    'Anonymous session',
    guest_label:     'Guest',
    confirm_logout:  'Sign out?',
    confirm_switch:  'Switch account?',
    pick_avatar:     'Choose your Avatar',
    avatar_sub:      'Customize your identity in the game',
    confirm_avatar:  'Confirm Avatar ✓',
    stat_level:      'Level',
    stat_stars:      'Stars',
    stat_badges:     'Badges',
    diploma_title:   'Certificate of Achievement',
    diploma_org:     'Fatlin AI · PACIE Methodology',
    diploma_certify: 'This certifies that',
    diploma_level:   'has completed {N} levels of the PACIE methodology',
    diploma_skills:  'demonstrating mastery of the Presence, Scope,<br>Training, Interaction and E-learning phases',
    diploma_issued:  'Issued on',
    diploma_print:   '🖨️ Print / Save PDF',
    shop_title:      '🛍️ PACIE Shop',
    your_stars:      'Your stars: ',
    shield_1_name:   '1 Shield',
    shield_1_desc:   'Protects your streak once',
    shield_3_name:   '3 Shields',
    shield_3_desc:   'Save 15 stars!',
    gala_24_name:    'Gala Mode 24h',
    gala_24_desc:    'Infinite lives + starry background',
    gala_72_name:    'Gala Mode 72h',
    gala_72_desc:    'Best value!',
    no_lives:        'No lives left. Regen starts at 0 lives · one life every 3 hours.',
    no_stars_need:   'You need {N} ⭐ (you have {M})',
    shield_bought:   '🛡️ {N} shield{S} purchased. Total: {T}',
    gala_activated:  '✨ Gala Mode activated for {N}h! Infinite lives 🚀',
    gala_ended:      'Gala Mode ended. Keep earning stars!',
    streak_saved:    '🛡️ Shield used — Streak saved! ({N} remaining)',
    streak_lost:     '💔 Streak lost. Buy shields to protect it!',
    streak_active:   '🔥 {N} days in a row! Streak active',
    scroll_hint:     '🖱️ Mouse wheel to explore',
    footer:          'Tecnotips &#169; - 2026 · Tecnología con propósito',
    node_replay:     'Review!',
    blast_msgs:{
      10:'Taking off! ⭐', 20:'Unstoppable! 🔥', 30:'Total boss! 💎',
      40:'PACIE Elite! 🏆', 50:'DIPLOMA EARNED! 🎓', 60:'Absolute Master! 👑',
      70:'Superstar! 🌟', 80:'PACIE Architect! 🏛️', 90:'Visionary! 🔮',
      100:'TOTAL MASTER! 🎓✨'},
    rewards:[
      {emoji:'🌱',title:'First big step!',     badge:'🎖️ PACIE Seed',      msg:'10 levels conquered.'},
      {emoji:'⚡',title:'Unstoppable!',         badge:'🥉 PACIE Explorer',   msg:'20 levels mastered.'},
      {emoji:'🔥',title:'On fire!',             badge:'🥈 PACIE Navigator',  msg:'30 levels surpassed.'},
      {emoji:'💎',title:'PACIE Elite!',         badge:'🥇 PACIE Master',     msg:'40 levels conquered.'},
      {emoji:'🚀',title:'Living legend!',       badge:'🏆 PACIE Legend',     msg:'50 levels conquered.'},
      {emoji:'👑',title:'Maximum Honor!',       badge:'👑 PACIE King',       msg:'60 levels. Summit reached.'},
      {emoji:'🌟',title:'Superstar!',           badge:'🌟 PACIE Star',       msg:'70 levels. Elite territory.'},
      {emoji:'🏛️',title:'PACIE Architect!',   badge:'🏛️ Architect',       msg:'80 levels. Solid knowledge.'},
      {emoji:'🔮',title:'PACIE Visionary!',     badge:'🔮 Visionary',        msg:'90 levels. Total vision.'},
      {emoji:'🎓',title:'Absolute Master!',     badge:'🎓 Absolute Master',  msg:'100 levels. Summit conquered.'},
    ],
  }
};

// ── Estado del idioma ────────────────────────────────────────────
// Tomar el idioma elegido en el splash (ya guardado en localStorage)
let currentLang = localStorage.getItem('fatlin_lang') || (navigator.language?.startsWith('en') ? 'en' : 'es');

function t(key, vars={}){
  const d = LANG[currentLang] || LANG['es'];
  let str = d[key] || LANG['es'][key] || key;
  Object.entries(vars).forEach(([k,v])=>{ str = str.replaceAll(`{${k}}`, v); });
  return str;
}

function applyLang(){
  const d = LANG[currentLang] || LANG['es'];
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(d[key] !== undefined) el.innerHTML = d[key];
  });
  const emailInput = document.getElementById('inp-email');
  const passInput  = document.getElementById('inp-pass');
  if(emailInput) emailInput.placeholder = t('ph_email');
  if(passInput)  passInput.placeholder  = t('ph_pass');
  document.querySelectorAll('[data-i18n-title]').forEach(el=>{
    const key = el.getAttribute('data-i18n-title');
    if(d[key]) el.title = d[key];
  });
  [
    ['btn-google',     'btn_google'],
    ['btn-show-email', 'btn_email'],
    ['btn-login',      'btn_login'],
    ['btn-back',       'btn_back'],
    ['btn-logout',     'logout'],
    ['btn-switch-acc', 'switch_account'],
    ['btn-new-acc',    'new_account'],
    ['btn-chgav',      'change_avatar'],
    ['btn-confirm-av', 'confirm_avatar'],
    ['btn-reward-close','keep_going'],
    ['btn-dip-print',  'diploma_print'],
    ['tab-global',     'tab_global'],
    ['tab-liga',       'tab_league'],
  ].forEach(([id, key])=>{
    const el = document.getElementById(id);
    if(!el) return;
    const svg = el.querySelector('svg');
    if(svg){
      const nodes = Array.from(el.childNodes);
      const textNode = nodes.find(n=>n.nodeType===3 && n.textContent.trim());
      if(textNode) textNode.textContent = t(key);
      else el.appendChild(document.createTextNode(t(key)));
    } else {
      el.innerHTML = d[key] || el.innerHTML;
    }
  });
  ['hl-es','hl-en'].forEach(id=>{
    const btn = document.getElementById(id);
    if(btn) btn.classList.toggle('active', id.endsWith(currentLang));
  });
  if(typeof REWARDS !== 'undefined'){
    const rw = d.rewards || LANG['es'].rewards;
    for(let i=0;i<REWARDS.length;i++) Object.assign(REWARDS[i], rw[i]||{});
  }
  currentBlastMsgs = d.blast_msgs || LANG['es'].blast_msgs;
}

window.setLang = function(lang, btnEl, source='splash'){
  const prev = currentLang;
  currentLang = lang;
  localStorage.setItem('fatlin_lang', lang);
  applyLang();
  const gameActive = typeof game !== 'undefined' && game && game.user;
  if(prev !== lang){
    clearQuestionCache();
    if(gameActive) setTimeout(async()=>{ try{ const u=game.user||auth.currentUser; if(u){ await u.getIdToken(); prefetchAhead(game.level-1,3); } }catch(e){} }, 6000);
  }
  if(source !== 'silent' && gameActive){
    const msg = lang === 'en' ? '🇺🇸 English activated' : '🇪🇸 Español activado';
    showToast(msg, '#0284c7');
  }
};

let currentBlastMsgs = LANG[currentLang].blast_msgs;

const APP_ID = 'fatlin-ai-v1';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  cache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});
// Exponer globalmente para payment.js y otros scripts no-módulo
window.db   = db;
window.auth = auth;
window.app  = app;

// Manejar resultado del redirect en móvil
// getRedirectResult eliminado — signInWithRedirect ya no se usa.
// Causaba "missing initial state" en Safari y navegadores con storage particionado.

// ── Manejar retorno de PayPal en móvil (navegación directa) ──────
// PayPal redirige a fatlin.web.app?payment_success=1&level=80
(function handlePaypalReturn(){
  const p = new URLSearchParams(window.location.search);
  if(p.get('payment_success') === '1'){
    const level = parseInt(p.get('level') || '0', 10);
    // Limpiar URL para no re-procesar en recarga
    history.replaceState({}, '', window.location.pathname);
    if(level > 0){
      // Esperar a que Firebase Auth esté lista, luego acreditar el pago
      const unsub = onAuthStateChanged(auth, user => {
        if(!user) return;
        unsub();
        if(!game.paidLevels) game.paidLevels = new Set();
        game.paidLevels.add(level);
        try{
          const paid = JSON.parse(localStorage.getItem('fatlin_paid_levels')||'[]');
          if(!paid.includes(level)){ paid.push(level); localStorage.setItem('fatlin_paid_levels', JSON.stringify(paid)); }
        }catch(e){}
        // Mostrar toast una vez que el juego esté listo
        setTimeout(()=>{
          if(typeof showToast==='function') showToast('✅ Certificado activado — ¡sigue jugando!','#16a34a');
          if(typeof renderMap==='function') renderMap();
          if(typeof updateHUD==='function') updateHUD();
          saveProgress();
        }, 2000);
        console.log('[PayPal Return] Nivel acreditado:', level);
      });
    }
  }
  if(p.get('payment_cancelled') === '1'){
    history.replaceState({}, '', window.location.pathname);
    setTimeout(()=>{ if(typeof showToast==='function') showToast('Pago cancelado — puedes intentarlo nuevamente','#d97706'); }, 2000);
  }
})();

// ── Proxy seguro via Firebase Cloud Function ─────────────────────
// La API key de Anthropic NUNCA sale al cliente.
// El proxy valida el token Firebase antes de llamar a Anthropic.

const CLAUDE_ENDPOINT = 'https://us-central1-fatlin.cloudfunctions.net/claudeProxy';
// ── FUENTES PRIMARIAS ORGANIZADAS POR ÁREA ───────────────────────
// Cada área tiene fallback garantizado. Sin duplicados.
const PACIE_SOURCE_GROUPS = {
  fatla: {
    label: "FATLA",
    root: "https://www.fatla.org",
    urls: [
      "https://www.fatla.org",
      "https://becas.fatla.org/mod/page/view.php?id=33",
      "https://becas.fatla.org/mod/page/view.php?id=34",
      "https://becas.fatla.org/mod/page/view.php?id=3"
    ]
  },
  pacie: {
    label: "PACIE Education",
    root: "https://www.pacie.education/portal/",
    urls: [
      "https://www.pacie.education/portal/",
      "https://www.pacie.education/portal/mod/page/view.php?id=10",
      "https://www.pacie.education/portal/mod/page/view.php?id=16",
      "https://www.pacie.education/portal/mod/page/view.php?id=24",
      "https://www.pacie.education/portal/mod/page/view.php?id=25",
      "https://www.pacie.education/portal/mod/page/view.php?id=23",
      "https://www.pacie.education/portal/mod/page/view.php?id=17"
    ]
  },
  asomtv: {
    label: "ASOMTV",
    root: "https://www.asomtv.org",
    urls: [
      "https://www.asomtv.org",
      "https://licencia.asomtv.org/mod/page/view.php?id=51",
      "https://licencia.asomtv.org/mod/page/view.php?id=50",
      "https://licencia.asomtv.org/mod/page/view.php?id=4",
      "https://licencia.asomtv.org/mod/page/view.php?id=5"
    ]
  }
};

// Estado de salud de las fuentes (se actualiza en cada generación)
const _sourceHealth = { fatla: true, pacie: true, asomtv: true };
const _sourceHealthKey = 'fatlin_source_health';

// Cargar estado previo del localStorage
try {
  const saved = JSON.parse(localStorage.getItem(_sourceHealthKey) || '{}');
  // Solo usar si tiene menos de 1 hora de antigüedad
  if(saved._ts && Date.now() - saved._ts < 3600000) {
    Object.assign(_sourceHealth, { fatla: saved.fatla??true, pacie: saved.pacie??true, asomtv: saved.asomtv??true });
  }
} catch(e) {}

// Construir string de fuentes garantizando al menos 1 URL activa por área
function buildSourcesString() {
  const parts = [];
  for(const [area, group] of Object.entries(PACIE_SOURCE_GROUPS)) {
    const active = _sourceHealth[area];
    const url = active ? group.urls.join(', ') : group.root; // fallback a root si área caída
    parts.push(`[${group.label}]: ${url}`);
  }
  return parts.join(' | ');
}

// Lista plana para compatibilidad (usada en badges de fuente)
const PACIE_SOURCES = Object.values(PACIE_SOURCE_GROUPS).flatMap(g => g.urls);

// Registrar fallo de fuente
function _markSourceFailed(area) {
  if(area in _sourceHealth) {
    _sourceHealth[area] = false;
    console.warn(`[Sources] Área ${area} marcada como no disponible`);
    try {
      localStorage.setItem(_sourceHealthKey, JSON.stringify({..._sourceHealth, _ts: Date.now()}));
    } catch(e) {}
  }
}

// Restaurar salud de fuentes (llamar al inicio de cada sesión)
function _resetSourceHealth() {
  _sourceHealth.fatla = true;
  _sourceHealth.pacie = true;
  _sourceHealth.asomtv = true;
  try { localStorage.removeItem(_sourceHealthKey); } catch(e) {}
}

// Temas cíclicos: se rotan infinitamente con profundidad creciente por ciclo
const PACIE_TOPICS_CYCLE = [
    "fundamentos básicos de la metodología PACIE, qué es y sus 5 fases",
    "fase Presencia de PACIE: imagen, motivación visual e impacto en el estudiante",
    "fase Alcance de PACIE: objetivos, estándares y competencias académicas",
    "fase Capacitación de PACIE: preparación docente y manejo tecnológico",
    "fase Interacción de PACIE: aprendizaje colaborativo, foros, wikis y trabajo grupal",
    "fase E-learning de PACIE: plataformas LMS, madurez pedagógica y sostenibilidad",
    "origen y contexto histórico de PACIE, Pedro Camacho y FATLA",
    "diferencias entre educación virtual y presencial según la metodología PACIE",
    "herramientas tecnológicas recomendadas por PACIE para entornos virtuales",
    "evaluación y seguimiento en PACIE: tutor, roles y acompañamiento",
    "PACIE aplicado en proyectos reales de FATLA y ASOMTV",
    "integración completa de PACIE: casos prácticos avanzados desde Presencia hasta E-learning",
];
const _DEPTH_LABELS = ["", "profundidad avanzada sobre ", "nivel experto en ", "maestría total en "];

function getTopicForLevel(level) {
    const cycleSize = PACIE_TOPICS_CYCLE.length; // 12 temas × 5 niveles = 60 por ciclo
    const idx   = Math.floor((level - 1) / 5) % cycleSize;
    const cycle = Math.floor((level - 1) / (5 * cycleSize));
    const depth = _DEPTH_LABELS[Math.min(cycle, _DEPTH_LABELS.length - 1)];
    return depth + PACIE_TOPICS_CYCLE[idx];
}
// ══════════════════════════════════════════════════════════════════
//  SISTEMA DE PREGUNTAS — POOL PERSISTENTE ANTI-REPETICIÓN
//  Estrategia:
//   1) Pool acumulativo por nivel (localStorage): crece cada sesión
//   2) Fingerprint de vistas (hash ligero): nunca repite en una sesión
//   3) Rotación cíclica con desfase diario: orden distinto cada día
//   4) Prompt con "variación seed": la IA genera contenido diferente
//   5) Recarga en background al agotar el 70% del pool
// ══════════════════════════════════════════════════════════════════

const questionCache = {};
const PREFETCH_CACHE_TTL  = 10 * 60 * 1000; // 10 min para prefetch
const POOL_MAX_SIZE        = 60;             // máx preguntas por nivel en localStorage
const POOL_REFRESH_THRESH  = 0.70;          // recargar al consumir 70% del pool

// Clave del pool persistente
function _poolKey(level){ return `fatlin_pool_${currentLang}_${level}`; }
// Clave de prefetch (corta vida, solo para arranque rápido)
function _lsKey(level){ return `fatlin_q_${currentLang}_${level}`; }

// ── Hash ligero de string (FNV-32) para fingerprint sin colisiones ──
function _hashQ(str){
  let h = 2166136261;
  for(let i = 0; i < str.length; i++){
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h.toString(36);
}

// ── Pool persistente: cargar desde localStorage ──
function loadPool(level){
  try{
    const raw = localStorage.getItem(_poolKey(level));
    if(raw){
      const p = JSON.parse(raw);
      if(Array.isArray(p.questions) && p.questions.length > 0) return p;
    }
  }catch(e){}
  return null;
}

// ── Pool persistente: guardar/ampliar en localStorage ──
function savePool(level, questions){
  try{
    const existing = loadPool(level);
    const existHashes = new Set((existing?.questions||[]).map(q=>_hashQ(q.q)));
    // Agregar solo preguntas nuevas
    const newOnes = questions.filter(q => !existHashes.has(_hashQ(q.q)));
    const merged  = [...(existing?.questions||[]), ...newOnes];
    // Limitar a POOL_MAX_SIZE (FIFO: descartar las más antiguas)
    const trimmed = merged.slice(-POOL_MAX_SIZE);
    localStorage.setItem(_poolKey(level), JSON.stringify({
      questions: trimmed,
      updatedAt: Date.now(),
      totalSeen: (existing?.totalSeen||0),
      seenHashes: existing?.seenHashes || []
    }));
    return trimmed;
  }catch(e){ return questions; }
}

// ── Marcar preguntas como vistas en el pool persistente ──
function markPoolSeen(level, hashes){
  try{
    const raw = localStorage.getItem(_poolKey(level));
    if(!raw) return;
    const p = JSON.parse(raw);
    p.totalSeen = (p.totalSeen||0) + hashes.length;
    // Acumular hashes vistos (máx 200 para no inflar localStorage)
    const seen = new Set(p.seenHashes || []);
    hashes.forEach(h => seen.add(h));
    p.seenHashes = [...seen].slice(-200);
    localStorage.setItem(_poolKey(level), JSON.stringify(p));
  }catch(e){}
}

// ── Elegir un subconjunto del pool con rotación anti-repetición ──
// Usa un desfase basado en (día del año × nivel) para que el orden
// cambie cada día aunque las preguntas sean las mismas.
function selectFromPool(level, pool, sessionSeen){
  const dayOfYear = Math.floor(Date.now() / 86400000);
  const offset    = (dayOfYear * 7 + level * 3) % Math.max(pool.length, 1);
  const rotated   = [...pool.slice(offset), ...pool.slice(0, offset)];
  // Excluir vistas en esta sesión
  let unseen = rotated.filter(q => !sessionSeen.has(_hashQ(q.q)));
  // Además excluir vistas en sesiones anteriores (si quedan suficientes)
  try{
    const stored = loadPool(level);
    if(stored?.seenHashes?.length){
      const prevSeen = new Set(stored.seenHashes);
      const freshUnseen = unseen.filter(q => !prevSeen.has(_hashQ(q.q)));
      if(freshUnseen.length >= 4) unseen = freshUnseen; // solo aplicar si quedan ≥4
    }
  }catch(e){}
  // Garantizar siempre 1 match y 1 case en la selección
  const hasMatch = unseen.some(q => q.type === 'match');
  const hasCase  = unseen.some(q => q.type === 'case');
  if(!hasMatch){
    const m = rotated.find(q => q.type === 'match');
    if(m) unseen = [m, ...unseen.filter(q => q.type !== 'match')];
    else  unseen.push(FALLBACK_MATCH_QUESTIONS[level % FALLBACK_MATCH_QUESTIONS.length]);
  }
  if(!hasCase){
    const c = rotated.find(q => q.type === 'case');
    if(c) unseen = [...unseen, c];
    else  unseen.push(FALLBACK_CASE_QUESTIONS[level % FALLBACK_CASE_QUESTIONS.length]);
  }
  return unseen.length > 0 ? unseen : rotated;
}

// ── getCachedQuestions: para prefetch rápido ──
function getCachedQuestions(level, isPrefetch=false){
  const m = questionCache[level];
  if(m){
    if(Date.now() - m.generatedAt < PREFETCH_CACHE_TTL) return m.questions;
    delete questionCache[level];
    try{ localStorage.removeItem(_lsKey(level)); }catch(e){}
  }
  if(isPrefetch){
    try{
      const raw = localStorage.getItem(_lsKey(level));
      if(raw){
        const parsed = JSON.parse(raw);
        if(Date.now() - parsed.generatedAt < PREFETCH_CACHE_TTL){
          questionCache[level] = parsed;
          return parsed.questions;
        }
        localStorage.removeItem(_lsKey(level));
      }
    }catch(e){}
  }
  return null;
}

function setCachedQuestions(level, questions){
  const entry = { questions, generatedAt: Date.now() };
  questionCache[level] = entry;
  try{ localStorage.setItem(_lsKey(level), JSON.stringify(entry)); }catch(e){}
  // También ampliar el pool persistente
  savePool(level, questions);
}

function clearQuestionCache(){
  Object.keys(questionCache).forEach(k => delete questionCache[k]);
  try{
    Object.keys(localStorage)
      .filter(k => k.startsWith('fatlin_q_') || k.startsWith('fatlin_pool_'))
      .forEach(k => localStorage.removeItem(k));
  }catch(e){}
}

// ── Variación semántica del prompt: seed diario ──
// Hace que la IA genere ángulos distintos del mismo tema cada día
function _promptSeed(level){
  const dayOfYear = Math.floor(Date.now() / 86400000);
  const seeds = [
    'enfócate en APLICACIONES PRÁCTICAS y casos de uso reales',
    'enfócate en ERRORES COMUNES y malentendidos a evitar',
    'enfócate en COMPARACIONES entre fases y conceptos similares',
    'enfócate en BENEFICIOS MEDIBLES y evidencia empírica',
    'enfócate en PROCEDIMIENTOS PASO A PASO de implementación',
    'enfócate en ROLES Y RESPONSABILIDADES de tutores y estudiantes',
    'enfócate en HERRAMIENTAS Y RECURSOS tecnológicos específicos',
  ];
  return seeds[(dayOfYear + level) % seeds.length];
}

let _prefetchInProgress = new Set();

async function prefetchLevel(level){
  if(level < 1 || level > TOTAL) return;
  // Solo usar caché si fue generado recientemente como prefetch
  if(getCachedQuestions(level, true)) return;
  if(_prefetchInProgress.has(level)) return;
  if(!auth.currentUser) return;
  _prefetchInProgress.add(level);
  try {
    const qs = await generateQuestionsWithClaude(level);
    setCachedQuestions(level, qs);
    console.log(`[Prefetch] Nivel ${level} listo (${currentLang})`);
  } catch(e){
    console.warn(`[Prefetch] Nivel ${level} falló:`, e.message);
  } finally {
    _prefetchInProgress.delete(level);
  }
}

function prefetchAhead(fromLevel, count=3){
  for(let i = 1; i <= count; i++){
    const lvl = fromLevel + i;
    if(lvl <= TOTAL) prefetchLevel(lvl);
  }
}

async function generateQuestionsWithClaude(level) {
    const topic = getTopicForLevel(level);
    const sourcesStr = buildSourcesString();
    const expert = isExpertLevel(level);
    const seed = _promptSeed(level);

    // Distribución forzada: 4 mc + 3 tf + 3 fw + 1 match + 1 case = 12 preguntas
    // Ejemplos en strings normales (sin backticks) para evitar conflictos de sintaxis
    const fwExamples = '{"type":"fw","q":"La metodología ___ fue creada por FATLA","a":"PACIE","j":"PACIE es la metodología de FATLA.","source":"fatla.org"}';
    const matchExample = '{"type":"match","q":"Relaciona fase PACIE con su función","pairs":[{"l":"Presencia","r":"Imagen y motivación"},{"l":"Alcance","r":"Objetivos y estándares"},{"l":"Capacitación","r":"Formación docente"},{"l":"Interacción","r":"Aprendizaje colaborativo"}],"a":"match","j":"Las 4 fases de PACIE.","source":"fatla.org"}';
    const caseExample = '{"type":"case","q":"¿Qué fase de PACIE falla?","scenario":"Docente diseñó aula sin motivación visual. Estudiantes no regresan.","a":"Presencia","o":["Presencia","Alcance","Capacitación","Interacción"],"j":"Presencia trata la imagen y motivación del aula.","source":"fatla.org"}';
    const distrib = '4 mc + 3 tf + 3 fw + 1 match + 1 case';
    const respBase = '{"questions":[{"type":"mc","q":"...","a":"...","o":["...","...","...","..."],"j":"...","source":"fatla.org"},{"type":"tf","q":"...","a":"Verdadero","o":["Verdadero","Falso"],"j":"...","source":"pacie.education"},{"type":"fw","q":"La ___ es la primera fase de PACIE","a":"Presencia","j":"...","source":"fatla.org"},' + matchExample + ',' + caseExample + ']}';

    const systemPrompt = expert
      ? `Eres un evaluador experto Master en Metodología PACIE. Fuentes oficiales por área — FATLA: ${PACIE_SOURCE_GROUPS.fatla.urls[0]}, PACIE: ${PACIE_SOURCE_GROUPS.pacie.urls[0]}, ASOMTV: ${PACIE_SOURCE_GROUPS.asomtv.urls[0]}. Usa web_search para consultar CADA área. SEED: ${seed}. RESPONDE SOLO JSON VÁLIDO sin markdown.`
      : `Eres experto en PACIE/FATLA. Debes consultar obligatoriamente estas 3 fuentes usando web_search: ${sourcesStr}. SEED: ${seed}. RESPONDE SOLO JSON VÁLIDO sin markdown ni backticks.`;

    const userPrompt = expert
      ? 'Nivel EXPERTO sobre "' + topic + '". Genera 12 preguntas (' + distrib + ') para nivel ' + level + '. SEED:' + seed + '.\n'
        + 'REGLAS fw: pregunta con ___ donde va UNA palabra clave PACIE. Sin tildes obligatorias.\n'
        + 'REGLAS mc: escenarios reales 2-3 lineas, distractores tecnicamente plausibles.\n'
        + 'REGLAS match: 4 pares concepto-descripcion PACIE, campo pairs:[{l,r}], a="match". Ej: ' + matchExample + '\n'
        + 'REGLAS case: escenario aula virtual 2-3 lineas + pregunta + 4 opciones. Ej: ' + caseExample + '\n'
        + 'DISTRIBUCION OBLIGATORIA: exactamente ' + distrib + '.\n'
        + 'RESPONDE SOLO JSON: ' + respBase
      : 'Busca "' + topic + '" consultando OBLIGATORIAMENTE las 3 fuentes (FATLA, PACIE, ASOMTV). Genera 12 preguntas VARIADAS para nivel ' + level + '. SEED:' + seed + '.\n'
        + 'DISTRIBUCION OBLIGATORIA: exactamente ' + distrib + '.\n'
        + 'REGLAS fw: pregunta con ___ donde va UNA palabra clave PACIE. Sin tildes. Ej: ' + fwExamples + '\n'
        + 'REGLAS mc: 4 opciones, respuesta en opciones, distractores plausibles.\n'
        + 'REGLAS tf: a es Verdadero o Falso.\n'
        + 'REGLAS match: 4 pares concepto-descripcion, campo pairs:[{l,r}], a="match". Ej: ' + matchExample + '\n'
        + 'REGLAS case: escenario situacion real aula virtual + pregunta + 4 opciones. Ej: ' + caseExample + '\n'
        + 'RESPONDE SOLO: ' + respBase;

    const isProxy = !CLAUDE_ENDPOINT.includes('anthropic.com');
    const bodyPayload = {
        model: "claude-sonnet-4-20250514",
        max_tokens: 3200,
        system: systemPrompt,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: userPrompt }]
    };

    let firebaseToken = "";
    for(let attempt = 0; attempt < 4; attempt++) {
        try {
            const currentUser = game.user || auth.currentUser;
            if (currentUser) { firebaseToken = await currentUser.getIdToken(); break; }
            await new Promise(r => setTimeout(r, 1500));
        } catch(tokenErr) {
            console.warn('[claudeProxy] token attempt', attempt, ':', tokenErr.message);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    if (!firebaseToken) throw new Error('No Firebase token tras 4 intentos');

    const fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${firebaseToken}` },
        body: JSON.stringify(bodyPayload)
    };

    const response = await fetch(CLAUDE_ENDPOINT, fetchOptions);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    const fullText = data.content.filter(b=>b.type==="text").map(b=>b.text).join("");

    // Detectar si alguna fuente por área fue mencionada (para marcar salud)
    const textLow = fullText.toLowerCase();
    if(!textLow.includes('fatla')) _markSourceFailed('fatla');
    if(!textLow.includes('pacie')) _markSourceFailed('pacie');
    if(!textLow.includes('asomtv')) _markSourceFailed('asomtv');

    let parsed;
    try {
        const clean = fullText.replace(/```json|```/g,"").trim();
        const m = clean.match(/\{[\s\S]*\}/);
        if(!m) throw new Error("No JSON");
        parsed = JSON.parse(m[0]);
    } catch(e) { throw new Error("Parse error: "+e.message); }

    if(!parsed.questions||!Array.isArray(parsed.questions)||!parsed.questions.length)
        throw new Error("Invalid structure");

    // Validar cada tipo correctamente
    const valid = parsed.questions.filter(q => {
        if(!q.q || !q.a) return false;
        if(q.type === 'mc') return q.o && Array.isArray(q.o) && q.o.includes(q.a);
        if(q.type === 'tf') return ['Verdadero','Falso','True','False'].includes(q.a);
        if(q.type === 'fw') return typeof q.a === 'string' && q.a.trim().length > 0 && q.q.includes('___');
        if(q.type === 'match') return Array.isArray(q.pairs) && q.pairs.length >= 3 && q.pairs.every(p => p.l && p.r);
        if(q.type === 'case') return q.scenario && q.o && Array.isArray(q.o) && q.o.includes(q.a);
        return false;
    });

    if(valid.length < 5) throw new Error("Too few valid questions");

    // Garantizar al menos 1 de cada tipo si la IA no cumplió distribución
    const hasFW = valid.some(q => q.type === 'fw');
    if(!hasFW) {
        valid.push(...FALLBACK_FW_QUESTIONS.slice(0, 2));
    }
    const hasMATCH = valid.some(q => q.type === 'match');
    if(!hasMATCH) {
        valid.push(FALLBACK_MATCH_QUESTIONS[Math.floor(Math.random()*FALLBACK_MATCH_QUESTIONS.length)]);
    }
    const hasCASE = valid.some(q => q.type === 'case');
    if(!hasCASE) {
        valid.push(FALLBACK_CASE_QUESTIONS[Math.floor(Math.random()*FALLBACK_CASE_QUESTIONS.length)]);
    }

    return valid;
}

// ── BANCO FALLBACK PALABRAS OCULTAS (fw) ─────────────────────────
const FALLBACK_FW_QUESTIONS = [
  {type:"fw",q:"La metodología ___ fue creada por FATLA para la educación virtual latinoamericana",a:"PACIE",j:"PACIE es la metodología desarrollada por FATLA para entornos virtuales.",source:"fatla.org"},
  {type:"fw",q:"La primera fase de PACIE se llama ___ y trata la imagen del aula virtual",a:"Presencia",j:"Presencia es la primera fase de PACIE, enfocada en la motivación visual.",source:"fatla.org"},
  {type:"fw",q:"La fase ___ de PACIE establece los objetivos y estándares del proceso educativo",a:"Alcance",j:"Alcance define las competencias y metas académicas en PACIE.",source:"pacie.education"},
  {type:"fw",q:"___ es la organización que desarrolló la metodología PACIE en Ecuador",a:"FATLA",j:"FATLA (Fundación Latinoamérica) creó PACIE en Ecuador.",source:"fatla.org"},
  {type:"fw",q:"La fase de ___ en PACIE prepara al docente en competencias tecnológicas y pedagógicas",a:"Capacitacion",j:"Capacitación forma al docente en herramientas y metodología virtual.",source:"pacie.education"},
  {type:"fw",q:"La fase ___ de PACIE promueve el aprendizaje colaborativo mediante foros y wikis",a:"Interaccion",j:"Interacción fomenta el trabajo grupal y colaborativo en PACIE.",source:"pacie.education"},
  {type:"fw",q:"La última fase de PACIE se llama ___ y logra la madurez pedagógica virtual",a:"E-learning",j:"E-learning es la quinta fase de PACIE donde se alcanza la madurez virtual.",source:"fatla.org"},
  {type:"fw",q:"___ y ASOMTV avalan los certificados emitidos por Fatlin AI",a:"FATLA",j:"FATLA y ASOMTV son las organizaciones que validan los diplomas de Fatlin AI.",source:"asomtv.org"},
  {type:"fw",q:"En PACIE la sigla C corresponde a la fase de ___",a:"Capacitacion",j:"La C de PACIE es Capacitación, preparación del docente virtual.",source:"fatla.org"},
  {type:"fw",q:"Pedro ___ fue el creador de la metodología PACIE dentro de FATLA",a:"Camacho",j:"Pedro Camacho es el creador de la metodología PACIE en FATLA.",source:"pacie.education"},
  {type:"fw",q:"PACIE se diseñó específicamente para entornos de ___ a distancia",a:"aprendizaje",j:"PACIE es exclusivamente para educación virtual y aprendizaje a distancia.",source:"fatla.org"},
  {type:"fw",q:"Los LMS son plataformas usadas en la fase ___ de PACIE",a:"E-learning",j:"E-learning en PACIE incorpora el uso maduro de plataformas LMS.",source:"asomtv.org"},
];

// ── BANCO FALLBACK MATCH (relacionar columnas) ───────────────────
const FALLBACK_MATCH_QUESTIONS = [
  {type:"match",q:"Relaciona cada fase de PACIE con su función principal",
   pairs:[{l:"Presencia",r:"Imagen y motivación del aula"},{l:"Alcance",r:"Objetivos y estándares"},{l:"Capacitación",r:"Formación docente tecnológica"},{l:"Interacción",r:"Aprendizaje colaborativo"}],
   a:"match",j:"Las 4 primeras fases de PACIE: Presencia=imagen, Alcance=objetivos, Capacitación=formación, Interacción=colaboración.",source:"fatla.org"},
  {type:"match",q:"Relaciona cada sigla de PACIE con su significado",
   pairs:[{l:"P",r:"Presencia"},{l:"A",r:"Alcance"},{l:"C",r:"Capacitación"},{l:"I",r:"Interacción"}],
   a:"match",j:"PACIE: Presencia, Alcance, Capacitación, Interacción, E-learning.",source:"pacie.education"},
  {type:"match",q:"Relaciona cada organización con su rol en PACIE",
   pairs:[{l:"FATLA",r:"Creó la metodología PACIE"},{l:"ASOMTV",r:"Avala los certificados"},{l:"Pedro Camacho",r:"Autor de PACIE"},{l:"PACIE",r:"Metodología para e-learning"}],
   a:"match",j:"FATLA creó PACIE, ASOMTV la avala, Pedro Camacho la diseñó.",source:"asomtv.org"},
  {type:"match",q:"Relaciona cada fase PACIE con el recurso principal que utiliza",
   pairs:[{l:"Presencia",r:"Diseño visual motivador"},{l:"Interacción",r:"Foros y wikis colaborativos"},{l:"E-learning",r:"Plataformas LMS maduras"},{l:"Alcance",r:"Competencias y resultados"}],
   a:"match",j:"Cada fase de PACIE emplea recursos pedagógicos específicos.",source:"pacie.education"},
];

// ── BANCO FALLBACK CASE (casos prácticos) ────────────────────────
const FALLBACK_CASE_QUESTIONS = [
  {type:"case",q:"¿Qué fase de PACIE está descuidada en este caso?",
   scenario:"Un docente publicó el contenido del curso pero los estudiantes no participan en los foros ni trabajan en equipo. Las actividades son todas individuales y no hay espacios de debate.",
   a:"Interacción",o:["Presencia","Alcance","Capacitación","Interacción"],
   j:"La Interacción en PACIE promueve el aprendizaje colaborativo mediante foros, wikis y trabajos grupales.",source:"pacie.education"},
  {type:"case",q:"¿Cuál es el problema según la metodología PACIE?",
   scenario:"Una institución tiene un aula virtual tecnológicamente avanzada, pero los docentes no saben manejar las herramientas LMS ni diseñar actividades virtuales efectivas.",
   a:"Capacitación",o:["Presencia","Alcance","Capacitación","E-learning"],
   j:"La Capacitación en PACIE forma al docente en competencias tecnológicas y pedagógicas para el entorno virtual.",source:"fatla.org"},
  {type:"case",q:"¿Qué fase de PACIE se está aplicando correctamente?",
   scenario:"La coordinadora académica revisó los objetivos del curso, definió las competencias esperadas y estableció los estándares de evaluación antes de iniciar el semestre virtual.",
   a:"Alcance",o:["Presencia","Alcance","Interacción","E-learning"],
   j:"El Alcance en PACIE define los objetivos, estándares y competencias que guían todo el proceso educativo.",source:"pacie.education"},
  {type:"case",q:"¿Qué fase de PACIE debe mejorar esta institución?",
   scenario:"Los estudiantes reportan que el aula virtual se ve descuidada, sin colores institucionales, sin bienvenida y con una estructura confusa. La deserción en las primeras semanas es alta.",
   a:"Presencia",o:["Presencia","Alcance","Capacitación","Interacción"],
   j:"La Presencia en PACIE trabaja la imagen institucional, la motivación visual y el impacto inicial del aula virtual.",source:"fatla.org"},
  {type:"case",q:"¿Qué nivel de madurez PACIE describe esta situación?",
   scenario:"El programa académico lleva 3 años usando un LMS de forma avanzada. Los docentes diseñan objetos de aprendizaje reutilizables, evalúan en línea y la comunidad virtual es autónoma.",
   a:"E-learning",o:["Presencia","Capacitación","Interacción","E-learning"],
   j:"E-learning es la fase final de PACIE donde se logra la madurez pedagógica virtual con uso experto de plataformas LMS.",source:"asomtv.org"},
];

const FALLBACK_QUESTIONS = [
    {type:"mc",q:"¿Qué significa la P en la metodología PACIE?",a:"Presencia",o:["Presencia","Proceso","Planificación","Pedagógico"],j:"La P de PACIE corresponde a Presencia, primera fase del modelo.",source:"fatla.org"},
    {type:"mc",q:"¿Cuántas fases tiene la metodología PACIE?",a:"5 fases",o:["3 fases","5 fases","7 fases","4 fases"],j:"PACIE: Presencia, Alcance, Capacitación, Interacción y E-learning.",source:"fatla.org"},
    {type:"mc",q:"¿En qué país fue creada la metodología PACIE?",a:"Ecuador",o:["México","Ecuador","Colombia","Argentina"],j:"PACIE fue desarrollada en Ecuador por Pedro Camacho de FATLA.",source:"pacie.education"},
    {type:"tf",q:"La metodología PACIE fue desarrollada por FATLA para mejorar la educación virtual.",a:"Verdadero",o:["Verdadero","Falso"],j:"FATLA creó PACIE para innovar en la educación virtual latinoamericana.",source:"fatla.org"},
    {type:"tf",q:"En PACIE, la fase de Interacción se enfoca en el trabajo individual.",a:"Falso",o:["Verdadero","Falso"],j:"La Interacción promueve el trabajo colaborativo y aprendizaje social.",source:"pacie.education"},
    {type:"tf",q:"El Alcance en PACIE define los objetivos y competencias del proceso educativo.",a:"Verdadero",o:["Verdadero","Falso"],j:"El Alcance establece los estándares y metas académicas del proceso.",source:"fatla.org"},
    {type:"mc",q:"¿Qué significa la A en PACIE?",a:"Alcance",o:["Alcance","Aprendizaje","Acción","Adaptación"],j:"La A de PACIE corresponde a Alcance, la fase que define objetivos y estándares.",source:"fatla.org"},
    {type:"mc",q:"¿Cuál fase de PACIE se enfoca en la preparación del docente?",a:"Capacitación",o:["Presencia","Alcance","Capacitación","Interacción"],j:"La Capacitación en PACIE prepara al docente en competencias tecnológicas y pedagógicas.",source:"fatla.org"},
    {type:"mc",q:"¿Qué organización creó la metodología PACIE?",a:"FATLA",o:["UNESCO","FATLA","IESALC","OEI"],j:"FATLA (Fundación Latinoamérica) desarrolló PACIE para la educación virtual.",source:"fatla.org"},
    {type:"tf",q:"La fase E-learning de PACIE se refiere al uso de plataformas LMS.",a:"Verdadero",o:["Verdadero","Falso"],j:"E-learning en PACIE implica la madurez en el uso de entornos virtuales y LMS.",source:"pacie.education"},
    {type:"mc",q:"¿Qué representa la fase de Presencia en PACIE?",a:"La imagen y motivación visual del aula virtual",o:["El número de estudiantes","La imagen y motivación visual del aula virtual","La evaluación final","Los foros de discusión"],j:"Presencia trata la imagen institucional y el impacto visual que motiva al estudiante.",source:"fatla.org"},
    {type:"tf",q:"PACIE puede aplicarse tanto en educación presencial como virtual.",a:"Falso",o:["Verdadero","Falso"],j:"PACIE es una metodología diseñada específicamente para entornos virtuales de aprendizaje.",source:"pacie.education"},
    {type:"mc",q:"¿Cuál es el último nivel de la metodología PACIE?",a:"E-learning",o:["Interacción","E-learning","Evaluación","Capacitación"],j:"E-learning es la quinta y última fase de PACIE, donde se logra la madurez pedagógica virtual.",source:"fatla.org"},
    {type:"tf",q:"La fase de Capacitación en PACIE incluye el manejo de herramientas tecnológicas.",a:"Verdadero",o:["Verdadero","Falso"],j:"Capacitación abarca el dominio técnico y pedagógico necesario para el entorno virtual.",source:"fatla.org"},
    ...FALLBACK_FW_QUESTIONS.slice(0, 6),
];

const AVATARS=["🦁","🐯","🦊","🐺","🦅","🦋","🐬","🦄","🐉","🤖","👨‍🚀","🧙","🧜","🥷","🧑‍💻","🦸","🧚","🦩","🐸","🎭"];
const REWARDS=[
    {emoji:"🌱",title:"¡Primer gran paso!",   badge:"🎖️ Semilla PACIE",     msg:"10 niveles conquistados."},
    {emoji:"⚡",title:"¡Imparable!",           badge:"🥉 Explorador PACIE",  msg:"20 niveles dominados."},
    {emoji:"🔥",title:"¡En llamas!",           badge:"🥈 Navegante PACIE",   msg:"30 niveles superados."},
    {emoji:"💎",title:"¡Élite PACIE!",         badge:"🥇 Maestro PACIE",     msg:"40 niveles vencidos."},
    {emoji:"🚀",title:"¡Leyenda viva!",        badge:"🏆 Leyenda PACIE",     msg:"50 niveles conquistados."},
    {emoji:"👑",title:"¡Máximo Honor!",        badge:"👑 Rey PACIE",         msg:"60 niveles. Cumbre alcanzada."},
    {emoji:"🌟",title:"¡Superestrella!",       badge:"🌟 Estrella PACIE",    msg:"70 niveles. Territorio élite."},
    {emoji:"🏛️",title:"¡Arquitecto PACIE!",  badge:"🏛️ Arquitecto",       msg:"80 niveles. Conocimiento sólido."},
    {emoji:"🔮",title:"¡Visionario PACIE!",    badge:"🔮 Visionario",        msg:"90 niveles. Visión total."},
    {emoji:"🎓",title:"¡Máster Absoluto!",     badge:"🎓 Máster Absoluto",   msg:"100 niveles. Cima conquistada."},
];

// Genera insignia dinámica para niveles 110+
function getRewardForMilestone(milestone){
  const idx = Math.floor(milestone / 10) - 1;
  if(idx >= 0 && idx < REWARDS.length) return REWARDS[idx];
  const emojis = ["⚡","🔥","💎","🚀","🌟","👑","🎯","🏆","🎓","🔮"];
  const e = emojis[idx % emojis.length];
  return {
    emoji: e,
    title: currentLang==='en' ? `Incredible! Level ${milestone}` : `¡Increíble! Nivel ${milestone}`,
    badge: `${e} ${currentLang==='en'?'Legend':'Leyenda'} Nv.${milestone}`,
    msg:   currentLang==='en'
      ? `${milestone} levels mastered. No limits!`
      : `${milestone} niveles dominados. ¡Sin límites!`
  };
}
let selectedAvatar="🧑",tempAvatar="🧑";

let game=window.game={
 paidLevels:null, _paidListenerUnsub:null,
  user:null, level:1, playingLevel:1, stars:0, lives:5,
  lastDeathTime:null, correctCount:0, targetCorrect:5,
  consecutiveErrors:0,
  isProcessing:false, currentQ:null, levelQuestions:[], qIndex:0,
  badges:0, lastRewardAt:0,
  shields:0, streakDays:0, lastPlayDate:null,
  ligaLevel:1, lastLigaWeek:null, _pendingLigaTip:null, lastRankPos:null,
  privacyAcceptedAt:null
};

function showError(msg){const el=document.getElementById('error-msg');el.textContent=msg;el.style.display='block';setTimeout(()=>el.style.display='none',4500);}
function playBell(){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();[[1046.5,0],[1318.5,0],[1568,.15],[2093,.3]].forEach(([f,d])=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f,ctx.currentTime+d);o.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(.4,ctx.currentTime+d);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d+1.1);o.start(ctx.currentTime+d);o.stop(ctx.currentTime+d+1.1);});}catch(e){}}
function playClick(ok=true){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(ok?880:280,ctx.currentTime);g.gain.setValueAtTime(.25,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);o.connect(g);g.connect(ctx.destination);o.start();o.stop(ctx.currentTime+.18);}catch(e){}}

function updateProgressUI(){for(let i=0;i<5;i++){const sd=document.getElementById(`sd${i}`);const cd=document.getElementById(`cd${i}`);if(sd)sd.classList.toggle('filled',i<game.correctCount);if(cd)cd.classList.toggle('filled',i<game.correctCount);}document.getElementById('txt-progress').innerText=`${game.correctCount}/5`;}
function flashProgressDot(idx){const d=document.getElementById(`cd${idx}`);if(!d)return;d.classList.remove('flash');void d.offsetWidth;d.classList.add('flash');setTimeout(()=>d.classList.remove('flash'),500);}

applyLang();

// ── hideSplash expuesto globalmente para que splashChooseLang pueda llamarlo ──
window.hideSplash = function(){
  if(window._splashHidden) return;
  window._splashHidden = true;
  const s = document.getElementById('splash');
  s.style.opacity = '0';
  setTimeout(()=>s.style.display='none', 400);
};

onAuthStateChanged(auth, async(user) => {
  // Cancelar watchdog — Firebase respondió
  if(window._authWatchdog){ clearTimeout(window._authWatchdog); window._authWatchdog=null; }

  // Ocultar splash si aún está visible
  if(!window._splashHidden){
    window._splashHidden = true;
    const splash = document.getElementById('splash');
    if(splash){ splash.style.transition='opacity .4s'; splash.style.opacity='0'; setTimeout(()=>splash.style.display='none',420); }
  }

  if(user){
    game.user = user;
    _resetSourceHealth(); // Restaurar salud de fuentes al inicio de sesión
    // Purgar pools sin match/case (versión anterior del juego)
    try{
      Object.keys(localStorage)
        .filter(k => k.startsWith('fatlin_pool_'))
        .forEach(k => {
          try{
            const p = JSON.parse(localStorage.getItem(k));
            const qs = p?.questions || [];
            const hasMatch = qs.some(q => q.type === 'match');
            const hasCase  = qs.some(q => q.type === 'case');
            if(!hasMatch || !hasCase) localStorage.removeItem(k);
          }catch(e){ localStorage.removeItem(k); }
        });
    }catch(e){}
    // Mostrar spinner de carga en splash (reabrir brevemente)
    const splashEl = document.getElementById('splash');
    const lsEl = document.getElementById('lang-splash');
    if(splashEl && lsEl){
      splashEl.style.display='flex'; splashEl.style.opacity='1';
      lsEl.innerHTML='<div style="margin-top:1.5rem;text-align:center;color:rgba(186,230,253,.8);font-size:.85rem"><div style="font-size:2rem;display:inline-block;animation:splashSpin 1s linear infinite">⚙️</div><br>Cargando tu progreso...</div>';
    }
    try{ await loadProgress(); }catch(e){ console.warn('[Progress]',e.message); }
    // Ocultar splash definitivamente
    if(splashEl){ splashEl.style.opacity='0'; setTimeout(()=>splashEl.style.display='none',400); }
    window._gameRef = game;
    const as = document.getElementById('auth-screen');
    if(as) as.style.display='none';
    setTimeout(()=>initGameUI(), 120);
  } else {
    setTimeout(()=>{
      const as = document.getElementById('auth-screen');
      if(as) as.style.display='flex';
    }, 450);
  }
});

// Splash controlado por onAuthStateChanged y watchdog
if(window._splashLangChosen && !window._splashHidden) {
  setTimeout(window.hideSplash, 50);
}

async function loadProgress(){
  let cloudData = null;
  let cloudOk = false;
  try {
    const fsPromise = getDoc(doc(db,`artifacts/${APP_ID}/users/${game.user.uid}/progress/current`));
    const timeout   = new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),4000));
    const snap = await Promise.race([fsPromise, timeout]);
    if(snap.exists()){ cloudData = snap.data(); cloudOk = true; }
  } catch(e) { console.warn('[Progress] Firestore falló/timeout:',e.code||e.message); }

  let localData = null;
  try {
    const raw = localStorage.getItem(`fatlin_save_${game.user.uid}`);
    if(raw) localData = JSON.parse(raw);
  } catch(e) {}

  if(!cloudData && !localData){
    game.level = 1; game.stars = 0; game.lives = 5;
    game.lastDeathTime = null; game.badges = 0; game.lastRewardAt = 0;
    const _gPhoto = getGooglePhotoURL();
  selectedAvatar = _gPhoto || "🧑";
  tempAvatar     = selectedAvatar;
  } else if(cloudOk && cloudData && !localData){
    game.level       = cloudData.level       || 1;
    game.stars       = cloudData.stars       || 0;
    game.lives       = typeof cloudData.lives === 'number' ? cloudData.lives : 5;
    game.lastDeathTime = cloudData.lastDeathTime || null;
    game.badges      = cloudData.badges      || 0;
    game.lastRewardAt= cloudData.lastRewardAt|| 0;
    { const _s=cloudData.avatar; const _gp=getGooglePhotoURL();
    selectedAvatar=(!_s||_s==="🧑")?(_gp||"🧑"):_s; tempAvatar=selectedAvatar; }
    game.shields     = cloudData.shields     || 0;
    game.streakDays  = cloudData.streakDays  || 0;
    game.lastPlayDate= cloudData.lastPlayDate|| null;
    game.diplomasEarned = cloudData.diplomasEarned || 0;
    game.infiniteLivesUntil = cloudData.infiniteLivesUntil || null;
    game.ligaLevel       = typeof cloudData.ligaLevel==='number' ? cloudData.ligaLevel : 1;
    game.lastLigaWeek    = cloudData.lastLigaWeek || null;
    game.lastRankPos     = cloudData.lastRankPos || null;
    game.privacyAcceptedAt = cloudData.privacyAcceptedAt || null;
  } else if(!cloudOk && localData){
    game.level       = localData.level       || 1;
    game.stars       = localData.stars       || 0;
    game.lives       = typeof localData.lives === 'number' ? localData.lives : 5;
    game.lastDeathTime = localData.lastDeathTime || null;
    game.badges      = localData.badges      || 0;
    game.lastRewardAt= localData.lastRewardAt|| 0;
    { const _s=localData.avatar; const _gp=getGooglePhotoURL();
    selectedAvatar=(!_s||_s==="🧑")?(_gp||"🧑"):_s; tempAvatar=selectedAvatar; }
    game.shields     = localData.shields     || 0;
    game.streakDays  = localData.streakDays  || 0;
    game.lastPlayDate= localData.lastPlayDate|| null;
    game.diplomasEarned = localData.diplomasEarned || 0;
    game.infiniteLivesUntil = localData.infiniteLivesUntil || null;
    game.ligaLevel       = typeof localData.ligaLevel==='number' ? localData.ligaLevel : 1;
    game.lastLigaWeek    = localData.lastLigaWeek || null;
    game.lastRankPos     = localData.lastRankPos || null;
    game.privacyAcceptedAt = localData.privacyAcceptedAt || null;
  } else {
    const cloudLevel  = cloudData?.level  || 1;
    const localLevel  = localData?.level  || 1;
    const cloudStars  = cloudData?.stars  || 0;
    const localStars  = localData?.stars  || 0;
    const cloudTime   = cloudData?.updatedAt || 0;
    const localTime   = localData?.updatedAt || 0;
    const newerSource = cloudTime >= localTime ? cloudData : localData;
    game.level  = Math.max(cloudLevel, localLevel);
    game.stars  = Math.max(cloudStars, localStars);
    game.lives         = typeof newerSource.lives === 'number' ? newerSource.lives : 5;
    game.lastDeathTime = newerSource.lastDeathTime || null;
    game.badges        = newerSource.badges        || 0;
    game.lastRewardAt  = newerSource.lastRewardAt  || 0;
    selectedAvatar     = (()=>{ const _s=newerSource.avatar; const _gp=getGooglePhotoURL(); return(!_s||_s==="🧑")?(_gp||"🧑"):_s; })();
    tempAvatar = selectedAvatar;
    game.shields       = newerSource.shields       || 0;
    game.streakDays    = newerSource.streakDays    || 0;
    game.lastPlayDate  = newerSource.lastPlayDate  || null;
    game.diplomasEarned = Math.max(cloudData?.diplomasEarned||0, localData?.diplomasEarned||0);
    game.infiniteLivesUntil = Math.max(cloudData?.infiniteLivesUntil||0, localData?.infiniteLivesUntil||0) || null;
    game.ligaLevel       = typeof newerSource.ligaLevel==='number' ? newerSource.ligaLevel : 1;
    game.lastLigaWeek    = newerSource.lastLigaWeek || null;
    game.privacyAcceptedAt = cloudData?.privacyAcceptedAt || localData?.privacyAcceptedAt || null;
    if(localLevel > cloudLevel) setTimeout(()=>saveProgress(), 1000);
  }

  // Inicializar paidLevels SIEMPRE desde localStorage — renderMap() lo usa inmediatamente
  // Si está vacío se deja como Set() vacío (no null) para evitar el check !== null
  if (!game.paidLevels) {
    try {
      const _local = JSON.parse(localStorage.getItem("fatlin_paid_levels") || "[]");
      game.paidLevels = new Set(Array.isArray(_local) ? _local : []);
    } catch(e) { game.paidLevels = new Set(); }
  }

  game.playingLevel = game.level;
  applyLang();
  checkDailyStreak();
  setTimeout(checkLigaPromocion, 2000);
}

// ══════════════════════════════════════════════════════════════════
//  SISTEMA DE LIGAS
// ══════════════════════════════════════════════════════════════════
const LIGAS = [
  {idx:1,  nombre:'Aspirantes Digitales',         sub:'El inicio del viaje',          escudo:'🌱', escudoClass:'shield-1',  promoCut:20, penaltyPts:false, penaltyAmt:0},
  {idx:2,  nombre:'Tutores en Adiestramiento',     sub:'Construyendo bases sólidas',    escudo:'📚', escudoClass:'shield-2',  promoCut:15, penaltyPts:false, penaltyAmt:0},
  {idx:3,  nombre:'Especialistas en Presencia',    sub:'Dominando la presencia digital',escudo:'🎯', escudoClass:'shield-3',  promoCut:12, penaltyPts:false, penaltyAmt:0},
  {idx:4,  nombre:'Arquitectos de Alcance',        sub:'Diseñando el impacto',          escudo:'🏗️', escudoClass:'shield-4',  promoCut:10, penaltyPts:false, penaltyAmt:0},
  {idx:5,  nombre:'Mentores de Capacitación',      sub:'Guiando con excelencia',        escudo:'🎓', escudoClass:'shield-5',  promoCut:8,  penaltyPts:false, penaltyAmt:0},
  {idx:6,  nombre:'Maestros de la Interacción',    sub:'La cima de la metodología',     escudo:'⚡', escudoClass:'shield-6',  promoCut:6,  penaltyPts:false, penaltyAmt:0},
  {idx:7,  nombre:'Tecnopedagogos de Élite',       sub:'Donde comienza la élite',       escudo:'🔬', escudoClass:'shield-7',  promoCut:5,  penaltyPts:true,  penaltyAmt:20},
  {idx:8,  nombre:'Consultores Internacionales OMVT', sub:'Reconocimiento global',      escudo:'🌍', escudoClass:'shield-8',  promoCut:4,  penaltyPts:true,  penaltyAmt:40},
  {idx:9,  nombre:'Sabios del Planeta FATLA',      sub:'Sabiduría al máximo nivel',     escudo:'🧠', escudoClass:'shield-9',  promoCut:3,  penaltyPts:true,  penaltyAmt:75},
  {idx:10, nombre:'Círculo de Eminencias Tecnológicas', sub:'El 0.1% de excelencia',   escudo:'👑', escudoClass:'shield-10', promoCut:3,  penaltyPts:true,  penaltyAmt:120},
];

const LIGAS_TIPS = [null,
  'Estás comenzando tu viaje. Responde con confianza y acumula estrellas cada semana para ascender.',
  'Las herramientas básicas son tu fundamento. La constancia diaria supera al talento ocasional.',
  'La Presencia digital lo es todo. Cada respuesta correcta consolida tu huella en PACIE.',
  'Planifica antes de responder. Los Arquitectos construyen sobre certezas, no suposiciones.',
  'Enseñar a otros consolida tu propio conocimiento. ¡Tú ya eres referencia para alguien!',
  'La Interacción es el corazón de PACIE. Aquí cada segundo de precisión cuenta.',
  '⚠️ Liga Élite: 2 errores seguidos descuentan 20pts de tu ranking. Piensa antes de responder.',
  '⚠️ Reconocimiento global: el margen de error es mínimo. Cada punto puede ser la diferencia.',
  '⚠️ Solo los mejores del planeta llegan aquí. La perfección es requisito, no opción.',
  '👑 Eres del 0.1% más alto. Cada respuesta es historia. Cada error, una oportunidad perdida.',
];

const LIGAS_RULES = [null,
  'Top 20 ascienden cada semana · 2 errores seguidos = reinicio del nivel',
  'Top 15 ascienden cada semana · 2 errores seguidos = reinicio del nivel',
  'Top 12 ascienden cada semana · 2 errores seguidos = reinicio del nivel',
  'Top 10 ascienden cada semana · 2 errores seguidos = reinicio del nivel',
  'Top 8 ascienden cada semana · 2 errores seguidos = reinicio del nivel',
  'Top 6 ascienden cada semana · 2 errores seguidos = reinicio del nivel',
  'Top 5 ascienden · 2 errores seguidos = reinicio + penalización -20 pts de ranking',
  'Top 4 ascienden · 2 errores seguidos = reinicio + penalización -40 pts de ranking',
  'Top 3 ascienden · 2 errores seguidos = reinicio + penalización -75 pts de ranking',
  'Solo Top 3 entran · Penalización máxima -120 pts por errores consecutivos',
];

// Offset Ecuador UTC-5 — la semana siempre es lunes a domingo hora Quito
const ECU_OFFSET_MS = 5 * 60 * 60 * 1000;

function getWeekStart(offsetMs=0){
  const n=new Date(Date.now() + ECU_OFFSET_MS + (offsetMs||0));
  const day=n.getUTCDay();
  const diffToMon=day===0?-6:1-day;
  const mon=new Date(n);
  mon.setUTCDate(n.getUTCDate()+diffToMon);
  mon.setUTCHours(0,0,0,0);
  return mon.toISOString().slice(0,10);
}

// Rango de timestamps UTC que cubre lunes 00:00 a domingo 23:59:59 hora Ecuador
// Usado para filtrar docs por updatedAt — tolera weekStart incorrecto de versiones anteriores
function getWeekRange(offsetMs=0){
  const ws=getWeekStart(offsetMs);
  const monMs=new Date(ws+'T00:00:00Z').getTime() - ECU_OFFSET_MS;
  const sunMs=monMs + 7*24*60*60*1000 - 1;
  return {monMs, sunMs};
}

async function checkLigaPromocion(){
  if(!game.user) return;
  const ws = getWeekStart();
  if(game.lastLigaWeek === ws) return;
  const ligaIdx = (game.ligaLevel||1) - 1;
  const ligaActual = LIGAS[ligaIdx] || LIGAS[0];
  const prevWs = getWeekStart(-7 * 24 * 60 * 60 * 1000);
  try{
    let pl=[];
    try{
      const snap = await Promise.race([getDocs(collection(db,`fatlin_weekly_${APP_ID}`)), new Promise((_,r)=>setTimeout(()=>r(new Error('t')),5000))]);
      const {monMs:pMonMs,sunMs:pSunMs}=getWeekRange(-7*24*60*60*1000);
      snap.forEach(d=>{
        const dd=d.data();
        const correctLiga=(dd.ligaLevel||1)===(game.ligaLevel||1);
        const correctWeek=dd.weekStart===prevWs;
        const inRange=dd.updatedAt>=pMonMs && dd.updatedAt<=pSunMs;
        if(correctLiga && (correctWeek||inRange)) pl.push({uid:dd.uid,stars:dd.stars||0});
      });
    }catch(e){ game.lastLigaWeek=ws; await saveProgress(); return; }
    pl.sort((a,b)=>b.stars-a.stars);
    const myPos = pl.findIndex(p=>p.uid===game.user.uid);
    if(myPos>=0 && myPos < ligaActual.promoCut && game.ligaLevel < 10){
      game.ligaLevel = ligaActual.idx + 1;
      game.lastLigaWeek = ws;
      await saveProgress();
      const nuevaLiga = LIGAS[game.ligaLevel-1];
      setTimeout(()=>{ showLigaUp(nuevaLiga); setTimeout(()=>generateDiplomaLiga(nuevaLiga),3000); }, 800);
    } else {
      game.lastLigaWeek = ws;
      await saveProgress();
    }
  }catch(e){ console.warn('[Liga]',e); }
}

function showLigaUp(liga){
  document.getElementById('lu-shield').textContent = liga.escudo;
  document.getElementById('lu-name').textContent = 'Liga '+liga.idx+' · '+liga.nombre;
  document.getElementById('lu-sub').textContent = liga.sub;
  document.getElementById('lu-rule').innerHTML = '📋 '+(LIGAS_RULES[liga.idx]||'');
  document.getElementById('lu-tip').innerHTML = '🤖 <strong>Consejo de Fatlin AI:</strong> '+(LIGAS_TIPS[liga.idx]||'');
  document.getElementById('modal-liga-up').classList.add('active');
  game._pendingLigaTip = LIGAS_TIPS[liga.idx];
}

window.closeLigaUp = function(){
  document.getElementById('modal-liga-up').classList.remove('active');
};

function showLigaTip(text){
  const bubble = document.getElementById('liga-tip-bubble');
  const tipText = document.getElementById('liga-tip-text');
  if(!bubble||!text) return;
  tipText.textContent = text;
  bubble.classList.add('visible');
  setTimeout(()=>bubble.classList.remove('visible'), 5000);
}

function generateDiplomaLiga(liga){
  const elById = n => document.getElementById(n);
  if(!elById('modal-diploma')) return;
  const name = game.user?.displayName || game.user?.email?.split('@')[0] || 'Tutor';
  const date = new Date().toLocaleDateString('es-ES',{year:'numeric',month:'long',day:'numeric'});
  if(elById('dip-name')) elById('dip-name').textContent = name;
  if(elById('dip-name-role')) elById('dip-name-role').textContent = liga.escudo + ' ' + liga.nombre + ' · Liga PACIE';
  if(elById('dip-cert-title')) elById('dip-cert-title').textContent = 'Certificado de Liga PACIE';
  if(elById('dip-cert-subtitle')) elById('dip-cert-subtitle').textContent = 'Ascenso de Liga · ' + liga.nombre;
  if(elById('dip-chip')) elById('dip-chip').textContent = liga.escudo + ' Liga ' + liga.nombre;
  if(elById('dip-side-tier')) elById('dip-side-tier').textContent = liga.escudo + ' ' + liga.nombre;
  if(elById('dip-date')) elById('dip-date').textContent = date;
  if(elById('dip-achievement')) elById('dip-achievement').innerHTML = `Ha ascendido a la liga <strong>${liga.nombre}</strong> en Fatlin AI, demostrando dominio progresivo de la Metodología PACIE y constancia semanal en las evaluaciones gamificadas con Inteligencia Artificial.`;
  elById('modal-diploma').classList.add('active');
}

// ── ONBOARDING ────────────────────────────────────────────────────
window.obNext = function(screen){
  [1,2,3].forEach(n=>{ const el=document.getElementById('ob-screen-'+n); if(el) el.style.display=n===screen?'block':'none'; });
};

window.obFinish = function(){
  document.getElementById('modal-onboarding').classList.remove('active');
  try{ localStorage.setItem('fatlin_onboarding_done','1'); }catch(e){}
  game.isProcessing = false;
  setTimeout(()=>{ renderMap(); centerCamera(); _startGameUI(); }, 200);
};


// ══════════════════════════════════════════════════════════════════
//  DETECTOR DE CRUCE DE LÍNEA DE ASCENSO
// ══════════════════════════════════════════════════════════════════
async function checkRankCruce(){
  if(!game.user) return;
  try {
    const ws = getWeekStart();
    const ligaActual = (typeof LIGAS !== 'undefined') ? (LIGAS[(game.ligaLevel||1)-1] || LIGAS[0]) : null;
    const promoCut = ligaActual ? ligaActual.promoCut : 5;

    // Cargar ranking de la semana actual
    let pl = [];
    try {
      const q = query(collection(db,`fatlin_weekly_${APP_ID}`), orderBy('stars','desc'), limit(50));
      const snap = await Promise.race([getDocs(q), new Promise((_,r)=>setTimeout(()=>r(new Error('t')),5000))]);
      snap.forEach(d => {
        const dat = d.data();
        if(dat.weekStart === ws) pl.push({uid: dat.uid, stars: dat.stars||0});
      });
    } catch(e) { return; }

    pl.sort((a,b) => b.stars - a.stars);
    const myIdx = pl.findIndex(p => p.uid === game.user.uid);
    if(myIdx < 0) return;

    const myPos = myIdx + 1; // 1-based
    const prevPos = game.lastRankPos;

    // Detectar cruce: estaba fuera (>promoCut) y ahora está dentro (<=promoCut)
    if(prevPos && prevPos > promoCut && myPos <= promoCut){
      triggerCruceAnimation();
    }

    // Guardar posición actual para próxima comparación
    game.lastRankPos = myPos;
    // No llamar saveProgress aquí para evitar loop — se guarda en el siguiente saveProgress natural
  } catch(e) { console.warn('[Cruce]', e); }
}

function triggerCruceAnimation(){
  const overlay = document.getElementById('cruce-overlay');
  if(!overlay) return;

  // Texto personalizado
  const name = game.user?.displayName?.split(' ')[0] || 'Tutor';
  const title = document.getElementById('cruce-title');
  const sub   = document.getElementById('cruce-sub');
  if(title) title.textContent = `¡${name}, cruzaste la Zona de Ascenso!`;
  if(sub)   sub.textContent   = 'Mantén tu posición esta semana para recibir tu diploma el lunes.';

  // Recrear el flash para re-trigger de la animación CSS
  const oldFlash = overlay.querySelector('.cruce-line-flash');
  if(oldFlash) oldFlash.remove();
  const newFlash = document.createElement('div');
  newFlash.className = 'cruce-line-flash';
  overlay.insertBefore(newFlash, overlay.firstChild);

  overlay.classList.add('active');
  setTimeout(() => overlay.classList.remove('active'), 2800);

  // Sonido de éxito
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t); osc.stop(t + 0.4);
    });
  } catch(e) {}

  // Mascota celebra
  if(typeof mascotSetState === 'function') mascotSetState('win', 2000);
  if(typeof resetMascotIdleTimer === 'function') resetMascotIdleTimer();
}


// ══════════════════════════════════════════════════════════════════
//  SISTEMA DE POLÍTICA DE PRIVACIDAD
// ══════════════════════════════════════════════════════════════════
function needsPrivacy(){
  return !game.privacyAcceptedAt;
}

function showPrivacyModal(onAccepted){
  const modal = document.getElementById('modal-privacy');
  const btn   = document.getElementById('btn-privacy-accept');
  const chk   = document.getElementById('chk-privacy');
  const body  = document.getElementById('privacy-body');
  const hint  = document.getElementById('privacy-scroll-hint');
  chk.checked = false;
  btn.disabled = true;
  if(hint) hint.style.display = '';
  window._privacyCallback = onAccepted;
  // Scroll hint desaparece al fondo
  body.onscroll = function(){
    if(body.scrollTop + body.clientHeight >= body.scrollHeight - 30){
      if(hint){ hint.style.opacity='0'; hint.style.transition='opacity .4s'; setTimeout(()=>hint.style.display='none',400); }
    }
  };
  modal.classList.add('active');
}

window.onPrivacyCheck = function(){
  const chk = document.getElementById('chk-privacy');
  const btn = document.getElementById('btn-privacy-accept');
  const row = document.getElementById('privacy-check-row');
  btn.disabled = !chk.checked;
  if(row) row.classList.toggle('checked', chk.checked);
};

window.acceptPrivacy = async function(){
  const btn = document.getElementById('btn-privacy-accept');
  btn.disabled = true;
  btn.textContent = '⏳ Guardando...';
  game.privacyAcceptedAt = Date.now();
  try{ await saveProgress(); }catch(e){}
  document.getElementById('modal-privacy').classList.remove('active');
  btn.textContent = '✅ Acepto y continuar';
  if(typeof window._privacyCallback === 'function'){
    window._privacyCallback();
    window._privacyCallback = null;
  }
};

window.declinePrivacy = function(){
  if(confirm('Si no aceptas la política de privacidad no podrás usar Fatlin AI. ¿Deseas salir?')){
    try{ signOut(auth).catch(()=>{}); }catch(e){}
    game.user = null;
    document.getElementById('modal-privacy').classList.remove('active');
    document.getElementById('game-container').style.display = 'none';
    const as = document.getElementById('auth-screen');
    if(as) as.style.display = 'flex';
  }
};

// ══════════════════════════════════════════════════════════════════
//  SISTEMA DE AVATAR CON FOTO GOOGLE
// ══════════════════════════════════════════════════════════════════

function avatarIsPhoto(){
  return selectedAvatar && selectedAvatar.startsWith('http');
}

function getGooglePhotoURL(){
  try{
    const u = game.user || (typeof auth !== 'undefined' ? auth.currentUser : null);
    return (u && u.photoURL) ? u.photoURL : null;
  }catch(e){ return null; }
}

function setAvatarEl(el){
  if(!el) return;
  const photo = avatarIsPhoto() ? selectedAvatar : null;
  if(photo){
    el.classList.add('has-photo');
    el.innerHTML = `<img src="${photo}" alt="avatar"
      onerror="if(this._err)return;this._err=true;var p=this.parentElement;if(p){p.classList.remove('has-photo');p.textContent='🧑';}">`;
  } else {
    el.classList.remove('has-photo');
    el.textContent = selectedAvatar || '🧑';
  }
}

function getAvatarHTML(avatarVal, sizePx){
  sizePx = sizePx || 28;
  if(avatarVal && avatarVal.startsWith('http')){
    return `<img src="${avatarVal}" alt="av"
      style="width:${sizePx}px;height:${sizePx}px;border-radius:50%;object-fit:cover;vertical-align:middle;"
      onerror="if(this._err)return;this._err=true;try{this.outerHTML='🧑';}catch(e){}">`;
  }
  return `<span style="font-size:${Math.round(sizePx*.85)}px">${avatarVal||'🧑'}</span>`;
}


async function saveProgress(){if(!game.user)return;const payload={
    level:game.level, stars:game.stars, lives:game.lives,
    lastDeathTime:game.lastDeathTime, badges:game.badges,
    lastRewardAt:game.lastRewardAt, updatedAt:Date.now(),
    avatar:selectedAvatar,
    displayName:game.user.displayName||game.user.email?.split('@')[0]||'Invitado',
    shields:game.shields, streakDays:game.streakDays,
    lastPlayDate:game.lastPlayDate, diplomasEarned:game.diplomasEarned,
    infiniteLivesUntil:game.infiniteLivesUntil,
    ligaLevel:game.ligaLevel||1, lastLigaWeek:game.lastLigaWeek||null,
    lastRankPos:game.lastRankPos||null,
    privacyAcceptedAt:game.privacyAcceptedAt||null
  };localStorage.setItem(`fatlin_save_${game.user.uid}`,JSON.stringify(payload));try{await setDoc(doc(db,`artifacts/${APP_ID}/users/${game.user.uid}/progress/current`),payload,{merge:true});const now=Date.now(),ws=getWeekStart();await setDoc(doc(db,`fatlin_ranking_${APP_ID}`,game.user.uid),{displayName:payload.displayName,level:game.level,stars:game.stars,avatar:selectedAvatar,ligaLevel:game.ligaLevel||1,updatedAt:now},{merge:true});await setDoc(doc(db,`fatlin_weekly_${APP_ID}`,`${ws}_${game.user.uid}`),{displayName:payload.displayName,level:game.level,stars:game.stars,avatar:selectedAvatar,weekStart:ws,uid:game.user.uid,ligaLevel:game.ligaLevel||1,updatedAt:now},{merge:true});}catch(e){}
  // Detectar cruce de línea de ascenso (silencioso, en background)
  setTimeout(()=>checkRankCruce(), 1500);
}

function mascotShow(){ document.getElementById('fatlin-mascot').style.display='block'; }
function mascotSetState(state, duration=0){
  const m = document.getElementById('fatlin-mascot');
  const z = document.getElementById('mascot-zzz');
  m.className = '';
  m.style.display = 'block';
  z.classList.remove('visible');
  if(state === 'sleep'){ m.classList.add('state-sleep'); z.classList.add('visible'); return; }
  m.classList.add(`state-${state}`);
  if(duration > 0) setTimeout(()=>{ m.className=''; m.style.animation='mascotFloat 4s ease-in-out infinite'; }, duration);
}
let _idleTimer = null;
function resetMascotIdleTimer(){
  clearTimeout(_idleTimer);
  _idleTimer = setTimeout(()=>mascotSetState('sleep'), 90000);
}
document.getElementById('fatlin-mascot').onclick = ()=>{ mascotSetState('cheer',1200); resetMascotIdleTimer(); };

function updateMascotSvg(isGala){ /* SVG stays same for both modes */ }
function updateRewardEmblem(){ /* uses static SVG already in DOM */ }

function triggerLevel5Blast(level){
  const blast = document.getElementById('level5-blast');
  const txt   = document.getElementById('blast-text');
  const msg   = currentBlastMsgs[level] || (currentLang==='en' ? `Level ${level} conquered! 🚀` : `¡Nivel ${level} conquistado! 🚀`);
  txt.textContent = msg;
  // Generar partículas
  blast.querySelectorAll('.blast-particle').forEach(p=>p.remove());
  const isGala = game.infiniteLivesUntil && game.infiniteLivesUntil > Date.now();
  const cols = isGala
    ? ['#fbbf24','#f59e0b','#fde68a','#d97706','#a855f7']
    : ['#38bdf8','#7dd3fc','#f59e0b','#22c55e','#f472b6'];
  for(let i=0;i<20;i++){
    const p=document.createElement('div'); p.className='blast-particle';
    const angle=(i/20)*Math.PI*2, dist=80+Math.random()*120;
    p.style.cssText=`width:${5+Math.random()*8}px;height:${5+Math.random()*8}px;background:${cols[i%cols.length]};left:50%;top:50%;--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px;animation-delay:${Math.random()*.3}s;animation-duration:${.8+Math.random()*.5}s`;
    blast.appendChild(p);
  }
  blast.classList.add('active');
  mascotSetState('win', 2500); resetMascotIdleTimer();
  setTimeout(()=>blast.classList.remove('active'), 2700);
}



/* ════════════════════════════════════════════════════════════
   SECCIÓN: LÓGICA DE JUEGO
   Contiene: saveProgress, mascot, renderMap, checkLivesRegen,
             startChallenge, showNextQuestion, renderOptions,
             handleCorrect, handleWrong, showReward, generateQuestions,
             pool anti-repetición, prefetch IA
════════════════════════════════════════════════════════════ */
function initGameUI(){
  document.getElementById('hud-avatar').onclick = openAvatarPicker;
  // Auto-migrar foto Google si el avatar es el default
  const _gp = getGooglePhotoURL();
  if(_gp && !avatarIsPhoto()){
    if(!selectedAvatar || selectedAvatar === '🧑'){
      selectedAvatar = _gp; tempAvatar = _gp;
      saveProgress();
    }
  }
  setAvatarEl(document.getElementById('hud-avatar'));
  applyLang();
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('game-container').style.display='block';
  renderMap(); updateHUD(); mascotShow(); resetMascotIdleTimer(); startRestTimer();
  // ── Política de privacidad primero ──
  if(needsPrivacy()){
    game.isProcessing = true;
    showPrivacyModal(function(){
      game.isProcessing = false;
      if(game.level === 1 && !localStorage.getItem('fatlin_onboarding_done')){
        game.isProcessing = true;
        document.getElementById('modal-onboarding').classList.add('active');
      } else { _startGameUI(); }
    });
    return;
  }
  // ── Onboarding si es nuevo ──
  if(game.level === 1 && !localStorage.getItem('fatlin_onboarding_done')){
    game.isProcessing = true;
    document.getElementById('modal-onboarding').classList.add('active');
    return;
  }
  _startGameUI();
  // ✅ FIX P-B — Despachar fatlin_ready para que payment.js verifique pagos pendientes.
  document.dispatchEvent(new Event('fatlin_ready'));
  // Iniciar listener en tiempo real de pagos/certificados
  if (typeof watchPaidLevelsRealtime === 'function') watchPaidLevelsRealtime();
  // ── Cargar paidLevels desde Firestore (base default) al arrancar ──
  // Necesario para desbloquear nivel 81+ sin depender de payment.js
  _syncPaidLevelsOnStart();
}

async function _syncPaidLevelsOnStart(){
  if(!game.user) return;
  // Las 3 fuentes en paralelo — un solo roundtrip efectivo
  // No se hace await antes de renderMap — el mapa ya se mostró con localStorage
  // Esta función solo actualiza en background y re-renderiza si hay cambios
  const uid=game.user.uid;
  if(!game.paidLevels) game.paidLevels = new Set();
  const before = game.paidLevels.size;

  const [userSnap, snapPay, snapDip] = await Promise.all([
    getDoc(doc(db,'users',uid)).catch(()=>null),
    getDocs(query(collection(db,'fatlin_payments'), where('uid','==',uid))).catch(()=>null),
    getDocs(query(collection(db,`fatlin_diplomas_${APP_ID}`), where('uid','==',uid))).catch(()=>null)
  ]);

  // FUENTE 1: users/{uid}.paidLevels — más confiable, escrito por Admin SDK
  if(userSnap && userSnap.exists()){
    const arr=userSnap.data().paidLevels;
    if(Array.isArray(arr)) arr.forEach(l=>game.paidLevels.add(l));
  }
  // FUENTE 2: fatlin_payments
  if(snapPay) snapPay.forEach(d=>{
    const dat=d.data();
    if((dat.status==='approved'||dat.paid===true) && typeof dat.level==='number')
      game.paidLevels.add(dat.level);
  });
  // FUENTE 3: fatlin_diplomas
  if(snapDip) snapDip.forEach(d=>{
    const dat=d.data();
    if(typeof dat.level==='number') game.paidLevels.add(dat.level);
  });

  // Solo re-renderizar y persistir si llegaron datos nuevos
  if(game.paidLevels.size !== before){
    try{localStorage.setItem('fatlin_paid_levels',JSON.stringify([...game.paidLevels]));}catch(e){}
    console.log('[PaidLevels] Actualizado desde Firestore:', [...game.paidLevels]);
    renderMap();
  } else {
    console.log('[PaidLevels] Sin cambios. Local:', [...game.paidLevels]);
  }
}

function _startGameUI(){
  setTimeout(async()=>{ try{ const u=game.user||auth.currentUser; if(u){ await u.getIdToken(); prefetchAhead(game.level-1,3); } }catch(e){} }, 6000);
  setTimeout(()=>{centerCamera(true);if(!('ontouchstart' in window)){const h=document.getElementById('scroll-hint');h.classList.add('visible');setTimeout(()=>h.classList.remove('visible'),4000);}},200);
}

function checkLivesRegen(){
  const isGala = game.infiniteLivesUntil && game.infiniteLivesUntil > Date.now();
  if(isGala){ document.getElementById('stat-timer').style.display='none'; updateHUD(); return; }
  if(game.lives<5&&game.lastDeathTime){
    const REGEN_MS = 3*60*60*1000; // 3 horas por vida
    const elapsed = Date.now()-game.lastDeathTime;
    const livesRegened = Math.floor(elapsed / REGEN_MS);
    if(livesRegened > 0){
      const newLives = Math.min(5, game.lives + livesRegened);
      const consumed = newLives - game.lives;
      game.lives = newLives;
      if(game.lives < 5){
        game.lastDeathTime = game.lastDeathTime + consumed * REGEN_MS;
      } else {
        game.lastDeathTime = null;
      }
      saveProgress(); updateHUD();
    }
  }
  const ti=document.getElementById('stat-timer');
  if(game.lives<5&&game.lastDeathTime){
    const REGEN_MS = 3*60*60*1000;
    ti.style.display='inline';
    const r = REGEN_MS - (Date.now()-game.lastDeathTime);
    if(r>0){const m=Math.floor(r/60000),s=Math.floor((r%60000)/1000);ti.innerText=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
  } else ti.style.display='none';
}
setInterval(checkLivesRegen,1000);

const TOTAL=9999,SPACING=180;
function renderMap(){const nc=document.getElementById('nodes-container'),sv=document.getElementById('path-svg');nc.innerHTML='';sv.innerHTML='';const W=document.getElementById('map-scroll').offsetWidth;let d='';const visibleMax = game.level + 5; for(let i=1;i<=visibleMax;i++){const y=200+(i-1)*SPACING,x=(W/2)+Math.sin(i*.7)*(W*.25);d+=(i===1?'M':'L')+` ${x} ${y}`;const n=document.createElement('div');if(i<game.level){n.className='level-node completed';n.innerHTML=`<span class="lnlabel">${i}</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20,6 9,17 4,12"/></svg>`;if(i%10===0)n.innerHTML+=`<span style="position:absolute;top:-10px;right:-8px;font-size:13px">🏅</span>`;}else if(i===game.level){
  // Certificados solo hasta nivel 480 — después el juego es libre sin paywall
  const CERT_LEVELS=[81,161,241,321,401];
  const needsPay = CERT_LEVELS.includes(i) && i<=481 && game.paidLevels !== null && !game.paidLevels.has(i-1);
  if(needsPay){
    n.className='level-node current';
    n.style.background='linear-gradient(135deg,#b45309,#92400e)';
    n.style.boxShadow='0 0 20px rgba(245,158,11,.6),0 6px 0 #78350f';
    n.innerHTML=`<span class="lnlabel" style="font-size:8px">Nv.${i}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
    n._needsPay=true;n._payLevel=i-1;
  } else {
    n.className='level-node current';
    n.innerHTML=`<span class="lnlabel">Nv.${i}</span>⭐`;
  }
}else{n.className='level-node locked';n.innerHTML=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" opacity=".4"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;}n.style.left=`${x-32}px`;n.style.top=`${y-32}px`;const ci=i;
    // ── FIX: reset isProcessing si el modal no está activo (estado colgado) ──
    function _handleNodeTap(){
      if(n._needsPay){showPayWall(n._payLevel);return;}
      if(ci<=game.level){
        const modalOpen=document.getElementById('modal-challenge')?.classList.contains('active');
        // isProcessing=true solo es legítimo mientras el modal está abierto Y hay pregunta activa.
        // Si el modal está abierto pero sin currentQ (animación de cierre / transición de nivel),
        // o si el modal está cerrado, resetear el estado colgado.
        const trulyBusy = modalOpen && game.currentQ != null;
        if(!trulyBusy) game.isProcessing=false;
        if(!game.isProcessing){game.playingLevel=ci;startChallenge();}
      }
    }
    n.onclick=_handleNodeTap;
    // ── FIX móvil: disparar tap solo si no hubo scroll significativo ──
    let _ts={y:0,moved:false};
    n.addEventListener('touchstart',(e)=>{_ts.y=e.touches[0].clientY;_ts.moved=false;},{passive:true});
    n.addEventListener('touchmove',(e)=>{if(Math.abs(e.touches[0].clientY-_ts.y)>8)_ts.moved=true;},{passive:true});
    n.addEventListener('touchend',(e)=>{if(!_ts.moved){e.preventDefault();_handleNodeTap();}},{passive:false});nc.appendChild(n);}const p=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("d",d);p.setAttribute("stroke","rgba(255,255,255,0.1)");p.setAttribute("stroke-width","8");p.setAttribute("stroke-linecap","round");p.setAttribute("fill","none");sv.appendChild(p);
  // Altura dinamica segun niveles visibles
  const totalH = 200 + (visibleMax - 1) * SPACING + 400;
  nc.style.height = totalH + 'px';
  sv.setAttribute('height', totalH);
  // Actualizar altura real del contenedor para que el scroll llegue
  const mapEl = document.getElementById('map-scroll');
  mapEl.style.height = totalH + 'px';
}

async function startChallenge(){
  if(game.lives<=0){showError(t("no_lives"));return;}
  game.correctCount=0; game.consecutiveErrors=0; game._seenQs=new Set(); game._seenQHashes=new Set(); game._poolRefreshing=false; updateProgressUI(); game.isProcessing=true;
  // Mostrar tip si acaba de ascender de liga
  if(game._pendingLigaTip){ showLigaTip(game._pendingLigaTip); game._pendingLigaTip=null; }
  const badge=document.getElementById('replay-badge'),num=document.getElementById('replay-num'),lbl=document.getElementById('clabel');
  if(game.playingLevel<game.level){ badge.style.display='block'; num.innerText=game.playingLevel; lbl.style.display='none'; }
  else { badge.style.display='none'; lbl.style.display='block'; }
  document.getElementById('modal-challenge').classList.add('active');
  document.body.classList.add('in-challenge');
  const aiLoad = document.getElementById('ai-loading');
  const sub = document.getElementById('source-badge');

  // ═══════════════════════════════════════════════════════════════
  //  SISTEMA DE PREGUNTAS — POOL PERSISTENTE + PREFETCH + FALLBACK
  // ═══════════════════════════════════════════════════════════════
  const lvl = game.playingLevel;
  // Inicializar fingerprint de sesión para este nivel
  if(!game._seenQs) game._seenQs = new Set();

  // ── 1) Pool persistente en localStorage ──────────────────────
  const persistedPool = loadPool(lvl);
  const poolQuestions  = persistedPool?.questions || [];

  // ── 2) Prefetch en memoria (arranque rápido) ──────────────────
  const prefetched = getCachedQuestions(lvl, true);

  if(poolQuestions.length >= 8){
    // Tenemos pool suficiente → arrancar inmediato con rotación anti-repetición
    aiLoad.classList.remove('active');
    const rotated = selectFromPool(lvl, poolQuestions, game._seenQs);
    game.levelQuestions = rotated;
    game.qIndex = 0;
    game.isProcessing = false;
    showNextQuestion();
    // Invalidar prefetch cache (era para este nivel)
    delete questionCache[lvl];
    try{ localStorage.removeItem(_lsKey(lvl)); }catch(e){}
    // Recargar en background si el pool tiene <70% sin ver hoy
    const totalSeen = persistedPool?.totalSeen || 0;
    const needsRefresh = poolQuestions.length < 20 || totalSeen > poolQuestions.length * POOL_REFRESH_THRESH;
    if(needsRefresh){
      setTimeout(()=>{
        generateQuestionsWithClaude(lvl).then(fresh=>{
          const merged = savePool(lvl, fresh);
          // Si el usuario aún está en el mismo nivel, ampliar el pool en vivo
          if(game.playingLevel === lvl && merged.length > game.levelQuestions.length){
            const extras = merged.filter(q => !game.levelQuestions.some(x=>x.q===q.q));
            if(extras.length > 0){
              game.levelQuestions = [...game.levelQuestions, ...extras];
              // Toast sutil: nuevas preguntas disponibles
              if(typeof showToast==='function')
                showToast('✨ Nuevas preguntas cargadas para este nivel','#0369a1',2200);
              const fb = document.getElementById('q-fresh-badge');
              if(fb){ fb.style.display='block'; setTimeout(()=>fb.style.display='none',3000); }
            }
          }
        }).catch(()=>{});
      }, 3000);
    }
    prefetchAhead(lvl, 3);

  } else if(prefetched){
    // Sin pool pero tenemos prefetch → usarlo y ampliar pool
    aiLoad.classList.remove('active');
    savePool(lvl, prefetched);
    const rotated = selectFromPool(lvl, prefetched, game._seenQs);
    game.levelQuestions = rotated;
    game.qIndex = 0;
    game.isProcessing = false;
    showNextQuestion();
    delete questionCache[lvl];
    try{ localStorage.removeItem(_lsKey(lvl)); }catch(e){}
    prefetchAhead(lvl, 3);

  } else {
    // Sin pool ni prefetch → generar ahora (spinner visible)
    aiLoad.classList.add('active');
    if(sub) sub.innerText = '';
    try{
      const qs = await generateQuestionsWithClaude(lvl);
      aiLoad.classList.remove('active');
      savePool(lvl, qs); // persistir para próximas sesiones
      const rotated = selectFromPool(lvl, qs, game._seenQs);
      game.levelQuestions = rotated;
      game.qIndex = 0;
      game.isProcessing = false;
      showNextQuestion();
      prefetchAhead(lvl, 3);
    }catch(apiErr){
      // ── Fallback: banco estático + reintento silencioso ───────
      console.warn('[Challenge] API falló:', apiErr.message);
      aiLoad.classList.remove('active');
      // Usar pool local si existe aunque esté vacío, o FALLBACK_QUESTIONS
      const fallbackBase = poolQuestions.length > 0 ? poolQuestions : [...FALLBACK_QUESTIONS];
      game.levelQuestions = selectFromPool(lvl, fallbackBase, game._seenQs);
      game.qIndex = 0;
      game.isProcessing = false;
      showNextQuestion();
      // Reintento silencioso en 6s
      setTimeout(()=>{
        generateQuestionsWithClaude(lvl).then(qs=>{
          savePool(lvl, qs);
          if(game.correctCount===0 && game.playingLevel===lvl){
            const rotated = selectFromPool(lvl, qs, game._seenQs);
            game.levelQuestions = [...game.levelQuestions, ...rotated.filter(q=>
              !game.levelQuestions.some(x=>x.q===q.q))];
            if(sub) sub.innerText='';
            showToast('✨ Preguntas actualizadas','#0369a1',2000);
          }
        }).catch(()=>{});
      }, 6000);
    }
  }
}

function showNextQuestion(){
  // ── Anti-repetición con fingerprint de hash ──────────────────
  if(!game._seenQs) game._seenQs = new Set();
  if(!game._seenQHashes) game._seenQHashes = new Set();

  // ── Auto-ampliar pool si se están agotando las preguntas ──────
  const unseenNow = game.levelQuestions.filter(q => !game._seenQHashes.has(_hashQ(q.q)));
  if(unseenNow.length <= 2 && !game._poolRefreshing){
    game._poolRefreshing = true;
    generateQuestionsWithClaude(game.playingLevel).then(fresh=>{
      game._poolRefreshing = false;
      if(fresh && fresh.length >= 3){
        const merged = savePool(game.playingLevel, fresh);
        const newOnes = fresh.filter(q => !game._seenQHashes.has(_hashQ(q.q))
                                       && !game.levelQuestions.some(x=>x.q===q.q));
        if(newOnes.length > 0){
          game.levelQuestions = [...game.levelQuestions, ...newOnes];
          markPoolSeen(game.playingLevel, [...game._seenQHashes]);
        }
      }
    }).catch(()=>{ game._poolRefreshing = false; });
  }

  // Si se agotaron TODAS las vistas → resetear (nueva vuelta con rotación)
  if(unseenNow.length === 0){
    game._seenQHashes.clear();
    game._seenQs.clear();
    // Rotar el pool con un offset diferente para no repetir el mismo orden
    game.levelQuestions = selectFromPool(
      game.playingLevel, game.levelQuestions, new Set()
    );
  }

  // ── Elección de pregunta con garantía de tipos match/case ──────
  // Posición dentro del nivel actual (0-based)
  const posInLevel = game.correctCount; // cuántos aciertos lleva = posición actual

  // En posición 1 (2do acierto) → forzar MATCH si no se ha visto
  // En posición 3 (4to acierto / último) → forzar CASE si no se ha visto
  const needMatch = posInLevel === 1 && !game._seenQHashes.has('__match_shown__');
  const needCase  = posInLevel === 3 && !game._seenQHashes.has('__case_shown__');

  let available = game.levelQuestions.filter(q => !game._seenQHashes.has(_hashQ(q.q)));
  if(available.length === 0) available = game.levelQuestions;

  let chosen = null;

  if(needMatch){
    chosen = available.find(q => q.type === 'match')
          || game.levelQuestions.find(q => q.type === 'match')
          || FALLBACK_MATCH_QUESTIONS[game.playingLevel % FALLBACK_MATCH_QUESTIONS.length];
    game._seenQHashes.add('__match_shown__');
  } else if(needCase){
    chosen = available.find(q => q.type === 'case')
          || game.levelQuestions.find(q => q.type === 'case')
          || FALLBACK_CASE_QUESTIONS[game.playingLevel % FALLBACK_CASE_QUESTIONS.length];
    game._seenQHashes.add('__case_shown__');
  } else {
    // Excluir match/case del pool aleatorio (ya tienen posición reservada)
    const nonSpecial = available.filter(q => q.type !== 'match' && q.type !== 'case');
    const pool = nonSpecial.length > 0 ? nonSpecial : available;
    chosen = pool[Math.floor(Math.random() * pool.length)];
  }

  game.currentQ = chosen;
  game._seenQs.add(game.currentQ.q);
  const _qHash = _hashQ(game.currentQ.q);
  game._seenQHashes.add(_qHash);
  markPoolSeen(game.playingLevel, [_qHash]);

  // ── Actualizar counter de pregunta ───────────────────────────
  const qCountEl = document.getElementById('q-counter');
  if(qCountEl){
    const seen = game._seenQHashes.size;
    const total = game.levelQuestions.length;
    qCountEl.textContent = `Pregunta ${seen} de ${total} disponibles · Nivel ${game.playingLevel}`;
  }

  // ── Barra de dificultad (1-5 puntos según nivel y tipo) ───────
  const diffBar = document.getElementById('q-diff-bar');
  if(diffBar){
    const posInCycle = ((game.playingLevel - 1) % 60) + 1;
    const isElite  = posInCycle >= 49;
    const isHard   = posInCycle >= 37;
    const diffLevel = isElite ? 5 : isHard ? 4 : posInCycle >= 25 ? 3 : posInCycle >= 13 ? 2 : 1;
    diffBar.innerHTML = '';
    for(let i = 0; i < 5; i++){
      const dot = document.createElement('div');
      dot.className = 'q-diff-dot' +
        (i < diffLevel ? (' active' + (isElite?' elite':isHard?' hard':'')) : '');
      dot.style.cssText = 'width:6px;height:6px;border-radius:50%;margin:0 2px;background:' +
        (i < diffLevel ? (isElite?'#c084fc':isHard?'#f87171':'#fbbf24') : 'rgba(0,0,0,.1)');
      diffBar.appendChild(dot);
    }
    // Label de dificultad
    const labels = ['','Básico','Intermedio','Avanzado','Difícil','ÉLITE'];
    const colors = ['','#94a3b8','#fbbf24','#f97316','#f87171','#c084fc'];
    const lbl = document.createElement('span');
    lbl.style.cssText = `font-size:.55rem;font-weight:800;color:${colors[diffLevel]};margin-left:5px;text-transform:uppercase;letter-spacing:.1em`;
    lbl.textContent = labels[diffLevel];
    diffBar.appendChild(lbl);
  }
  game.qIndex++;const area=document.getElementById('question-area');area.style.opacity='0';area.style.transform='translateY(8px)';requestAnimationFrame(()=>{document.getElementById('txt-q').innerText=game.currentQ.q;document.getElementById('source-badge').innerText=game.currentQ.source?`📚 Fuente: ${game.currentQ.source}`:'';const tb=document.getElementById('q-type-badge');tb.style.display=(['tf','fw','match','case'].includes(game.currentQ.type))?'block':'none';renderOptions();area.style.transition='opacity .25s ease, transform .25s ease';area.style.opacity='1';area.style.transform='translateY(0)';updateProgressUI();});}

function renderOptions(){
  const c = document.getElementById('opts-container');
  c.innerHTML = '';
  const isTF = game.currentQ.type === 'tf';
  const isFW = game.currentQ.type === 'fw';

  // Badge de tipo visible
  const tb = document.getElementById('q-type-badge');
  if(tb) {
    if(isTF)  { tb.style.display='block'; tb.textContent='✔ Verdadero / Falso'; tb.style.background='#eff6ff'; tb.style.color='#1d4ed8'; }
    else if(isFW) { tb.style.display='block'; tb.textContent='✏️ Completa la palabra'; tb.style.background='#fefce8'; tb.style.color='#a16207'; }
    else if(game.currentQ.type==='match') { tb.style.display='block'; tb.textContent='🔗 Relaciona columnas'; tb.style.background='#f5f3ff'; tb.style.color='#6d28d9'; }
    else if(game.currentQ.type==='case')  { tb.style.display='block'; tb.textContent='🧩 Caso práctico'; tb.style.background='#fff7ed'; tb.style.color='#9a3412'; }
    else      { tb.style.display='none'; }
  }

  if(game.currentQ.type === 'match') {
    // ── MATCH: relacionar columnas ────────────────────────────────
    const pairs = [...game.currentQ.pairs];
    // Mezclar lado derecho
    const rightShuffled = [...pairs.map(p=>p.r)].sort(()=>Math.random()-.5);
    let selectedLeft = null;   // índice del par seleccionado en izquierda
    let matched = 0;           // cuántos pares correctos lleva
    const totalPairs = pairs.length;
    const matchState = pairs.map(()=>({done:false}));

    const wrap = document.createElement('div');
    wrap.className = 'match-wrap';

    const hint = document.createElement('p');
    hint.className = 'match-hint';
    hint.textContent = '👆 Selecciona un concepto de la izquierda, luego su par de la derecha';
    wrap.appendChild(hint);

    const cols = document.createElement('div');
    cols.className = 'match-cols';

    // Columna izquierda
    const colL = document.createElement('div');
    const lblL = document.createElement('div'); lblL.className='match-col-lbl'; lblL.textContent='Concepto'; colL.appendChild(lblL);
    const leftBtns = pairs.map((p, i) => {
      const b = document.createElement('div');
      b.className = 'match-left-item';
      b.textContent = p.l;
      b.dataset.idx = i;
      b.onclick = () => {
        if(game.isProcessing || matchState[i].done) return;
        leftBtns.forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        selectedLeft = i;
      };
      colL.appendChild(b);
      return b;
    });

    // Columna derecha (mezclada)
    const colR = document.createElement('div');
    const lblR = document.createElement('div'); lblR.className='match-col-lbl'; lblR.textContent='Descripción'; colR.appendChild(lblR);
    rightShuffled.forEach((rText, ri) => {
      const b = document.createElement('div');
      b.className = 'match-right-item';
      b.textContent = rText;
      b.onclick = () => {
        if(game.isProcessing || selectedLeft === null) return;
        // Buscar si este rText es el correcto para selectedLeft
        const correctR = pairs[selectedLeft].r;
        const leftBtn = leftBtns[selectedLeft];
        if(rText === correctR) {
          // Correcto
          leftBtn.classList.remove('selected'); leftBtn.classList.add('matched');
          b.classList.add('paired');
          matchState[selectedLeft].done = true;
          selectedLeft = null;
          matched++;
          prog.textContent = `✓ ${matched} / ${totalPairs} emparejados`;
          if(matched === totalPairs) {
            // ¡Todos correctos! — manejar como respuesta correcta
            setTimeout(()=>handleCorrect({ classList:{ add:()=>{}, remove:()=>{} } }), 400);
          }
        } else {
          // Incorrecto — shake visual
          leftBtn.classList.add('wrong-m'); b.classList.add('wrong-m');
          setTimeout(()=>{ leftBtn.classList.remove('wrong-m','selected'); b.classList.remove('wrong-m'); selectedLeft=null; }, 800);
          handleWrong({ classList:{ add:()=>{}, remove:()=>{} } });
        }
      };
      colR.appendChild(b);
    });

    cols.appendChild(colL); cols.appendChild(colR);
    wrap.appendChild(cols);

    const prog = document.createElement('p');
    prog.className = 'match-progress';
    prog.textContent = `0 / ${totalPairs} emparejados`;
    wrap.appendChild(prog);

    c.appendChild(wrap);

  } else if(game.currentQ.type === 'case') {
    // ── CASE: caso práctico ────────────────────────────────────────
    const wrapper = document.createElement('div');

    // Escenario del caso
    const caseLbl = document.createElement('p');
    caseLbl.className = 'case-label';
    caseLbl.textContent = '📋 Situación';
    wrapper.appendChild(caseLbl);

    const scenario = document.createElement('div');
    scenario.className = 'case-scenario';
    scenario.innerHTML = game.currentQ.scenario || '';
    wrapper.appendChild(scenario);

    // Opciones como mc normal
    const opts = [...game.currentQ.o].sort(()=>Math.random()-.5);
    opts.forEach((opt,idx) => {
      const b = document.createElement('button');
      b.className = 'opt';
      b.style.animationDelay = `${idx*60}ms`;
      b.textContent = opt;
      b.onclick = () => {
        if(game.isProcessing) return;
        opt === game.currentQ.a ? handleCorrect(b) : handleWrong(b);
      };
      wrapper.appendChild(b);
    });

    c.appendChild(wrapper);

  } else if(isFW) {
    // ── Render campo de texto libre ──────────────────────────────
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:4px 0';

    const hint = document.createElement('p');
    hint.style.cssText = 'font-size:.75rem;color:#64748b;text-align:center;font-weight:600;margin:0';
    hint.textContent = '👆 Escribe la palabra que falta en el espacio ___';
    wrapper.appendChild(hint);

    const inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;gap:8px;align-items:center';

    const inp = document.createElement('input');
    inp.id = 'fw-input';
    inp.type = 'text';
    inp.placeholder = 'Escribe aquí...';
    inp.autocomplete = 'off';
    inp.autocorrect = 'off';
    inp.spellcheck = false;
    inp.style.cssText = `
      flex:1;padding:.85rem 1rem;border-radius:1.25rem;border:2px solid #e2e8f0;
      font-family:'Inter',sans-serif;font-size:1rem;font-weight:600;outline:none;
      transition:border-color .2s,box-shadow .2s;background:#f8fafc;color:#1e293b;
    `;
    inp.onfocus = () => { inp.style.borderColor='#0ea5e9'; inp.style.boxShadow='0 0 0 4px rgba(14,165,233,.12)'; };
    inp.onblur  = () => { inp.style.borderColor='#e2e8f0'; inp.style.boxShadow='none'; };

    const sendBtn = document.createElement('button');
    sendBtn.textContent = '✓';
    sendBtn.style.cssText = `
      width:48px;height:48px;border-radius:50%;border:none;background:#0284c7;color:white;
      font-size:1.3rem;font-weight:700;cursor:pointer;flex-shrink:0;
      transition:transform .15s,background .15s;
    `;
    sendBtn.onmouseenter = () => sendBtn.style.background = '#0369a1';
    sendBtn.onmouseleave = () => sendBtn.style.background = '#0284c7';

    const checkFW = () => {
      if(game.isProcessing) return;
      const raw = inp.value.trim();
      if(!raw) { inp.style.borderColor='#ef4444'; setTimeout(()=>inp.style.borderColor='#e2e8f0',800); return; }
      inp.disabled = true;
      sendBtn.disabled = true;
      _normStr(raw) === _normStr(game.currentQ.a)
        ? handleCorrect(inp)
        : handleWrongFW(inp, raw);
    };

    sendBtn.onclick = checkFW;
    inp.onkeydown = (e) => { if(e.key === 'Enter') checkFW(); };

    inputRow.appendChild(inp);
    inputRow.appendChild(sendBtn);
    wrapper.appendChild(inputRow);

    // Pista: mostrar longitud de la palabra
    const clue = document.createElement('p');
    const ansLen = game.currentQ.a.replace(/[áéíóúàèìòùäëïöü]/gi, 'x').length;
    clue.style.cssText = 'font-size:.68rem;color:#94a3b8;text-align:center;margin:0;font-weight:600';
    clue.textContent = `Pista: la respuesta tiene ${ansLen} letra${ansLen!==1?'s':''}`;
    wrapper.appendChild(clue);

    c.appendChild(wrapper);
    setTimeout(() => inp.focus(), 150);

  } else {
    // ── mc y tf ────────────────────────────────────────────────
    const opts = isTF ? [...game.currentQ.o] : [...game.currentQ.o].sort(()=>Math.random()-.5);
    opts.forEach((opt,idx) => {
      const b = document.createElement('button');
      b.className = `opt${isTF?' vf':''}`;
      b.style.animationDelay = `${idx*60}ms`;
      b.textContent = isTF ? (opt==='Verdadero'?t('tf_true'):t('tf_false')) : opt;
      b.onclick = () => {
        if(game.isProcessing) return;
        opt === game.currentQ.a ? handleCorrect(b) : handleWrong(b);
      };
      c.appendChild(b);
    });
  }
}

// Normalizar string: quita tildes, diéresis, mayúsculas, espacios extra
function _normStr(s){
  return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim();
}

// handleWrong para fw: muestra respuesta correcta en el input
function handleWrongFW(inp, typed) {
  if(inp) {
    inp.classList.add('wrong-fw');
    inp.value = typed + '  ✗  Respuesta: ' + game.currentQ.a;
  }
  // Botón falso para reutilizar handleWrong sin afectar DOM de opciones
  const fakeBtn = { classList: { add: ()=>{}, remove: ()=>{} } };
  handleWrong(fakeBtn);
}

function handleCorrect(btn){
  // Feedback visual por tipo
  if(game.currentQ.type === 'fw') {
    const fwInp = document.getElementById('fw-input');
    if(fwInp) { fwInp.classList.add('correct-fw'); fwInp.value = '✓ ' + game.currentQ.a; }
  } else if(game.currentQ.type === 'match') {
    // match: ya marcó visualmente en el render, solo continúa flujo
  } else {
    if(btn && btn.classList) btn.classList.add('correct','cglow');
  }
  game.correctCount++;game.consecutiveErrors=0;game.stars+=15;game.isProcessing=true;playClick(true);document.querySelectorAll('.opt').forEach(b=>b.disabled=true);flashProgressDot(game.correctCount-1);updateHUD();updateProgressUI();mascotSetState('cheer',800);resetMascotIdleTimer();if(game.correctCount>=game.targetCorrect){const wasNew=(game.playingLevel===game.level);if(wasNew){
  game.level++;
    playBell();const av=document.getElementById('hud-avatar');av.classList.remove('av-lvl');void av.offsetWidth;av.classList.add('av-lvl');setTimeout(()=>av.classList.remove('av-lvl'),1000);}saveProgress();checkMilestones(game.level);const milestone=Math.floor((game.level-1)/10)*10;const reward=wasNew&&milestone>0&&milestone!==game.lastRewardAt&&(game.level-1)%10===0;setTimeout(()=>{document.getElementById('modal-challenge').classList.remove('active');document.body.classList.remove('in-challenge');game.currentQ=null;game.playingLevel=game.level;game.correctCount=0;game.consecutiveErrors=0;updateProgressUI();renderMap();centerCamera();game.isProcessing=false;if(reward){game.lastRewardAt=milestone;game.badges++;saveProgress();setTimeout(()=>showReward(milestone),300);}prefetchAhead(game.level, 2);},400);}else{setTimeout(()=>{game.isProcessing=false;showNextQuestion();},600);}
}

function handleWrong(btn){
  if(btn && btn.classList) btn.classList.add('wrong');
  // Para match: solo penalizar vidas y mostrar feedback, sin bloquear las opciones
  const isMatch = game.currentQ && game.currentQ.type === 'match';
  game.isProcessing = isMatch ? false : true;  // match sigue siendo interactivo
  game.consecutiveErrors = (game.consecutiveErrors||0) + 1;
  const penaltyReset = game.consecutiveErrors >= 2;
  mascotSetState('sad', 700); resetMascotIdleTimer();
  const isGala = game.infiniteLivesUntil && game.infiniteLivesUntil > Date.now();
  if(!isGala) game.lives--;if(game.lives===0 && !game.lastDeathTime)game.lastDeathTime=Date.now();playClick(false);updateHUD();updateProgressUI();saveProgress();const card=document.getElementById('ccard');card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake');if(!isMatch){document.querySelectorAll('.opt').forEach(b=>{b.disabled=true;if(b.textContent.includes(game.currentQ.a))b.classList.add('correct');});}
  const penaltyMsg = penaltyReset && game.correctCount > 0 ? (currentLang==='en'?'⚠️ 2 errors in a row — progress reset!':'⚠️ 2 errores seguidos — ¡progreso reiniciado!') : '';
  document.getElementById('feedback-text').innerText = (penaltyMsg ? penaltyMsg + ' · ' : '') + game.currentQ.j;
  document.getElementById('feedback-float').classList.add('active');const fill=document.getElementById('cfill');fill.style.transition='none';fill.style.width='100%';requestAnimationFrame(()=>{fill.style.transition='width 1.5s linear';fill.style.width='0%';});setTimeout(()=>{document.getElementById('feedback-float').classList.remove('active');card.classList.remove('shake');
  if(penaltyReset){
    game.correctCount=0; game.consecutiveErrors=0; updateProgressUI();
    // Penalización de puntos en ligas élite (7-10)
    const liga = LIGAS[(game.ligaLevel||1)-1];
    if(liga && liga.penaltyPts && liga.penaltyAmt > 0){
      game.stars = Math.max(0, game.stars - liga.penaltyAmt);
      updateHUD();
      showToast('⚠️ -'+liga.penaltyAmt+' ⭐ penalización '+liga.nombre, '#ef4444', 3500);
      saveProgress();
    }
  }
  game.isProcessing=false;if(game.lives<=0){document.getElementById('modal-challenge').classList.remove('active');document.body.classList.remove('in-challenge');game.playingLevel=game.level;game.correctCount=0;game.consecutiveErrors=0;updateProgressUI();showError(t("no_lives"));renderMap();centerCamera();}else{showNextQuestion();}},1500);}

function showReward(milestone){
  const r = getRewardForMilestone(milestone);
  document.getElementById('r-title').innerText=r.title;
  document.getElementById('r-msg').innerText=r.msg;
  document.getElementById('r-badge').innerText=r.badge;
  const card=document.getElementById('rcard');
  card.querySelectorAll('.confetti-dot').forEach(d=>d.remove());
  const isGala = game.infiniteLivesUntil && game.infiniteLivesUntil > Date.now();
  const cols=isGala?['#fbbf24','#f59e0b','#fde68a','#d97706','#a855f7','white']:['#38bdf8','#f59e0b','#22c55e','#f472b6','#a78bfa','#fb923c'];
  for(let i=0;i<28;i++){const d=document.createElement('div');d.className='confetti-dot';d.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*20}%;background:${cols[i%cols.length]};animation-delay:${Math.random()*1}s;width:${4+Math.random()*7}px;height:${4+Math.random()*7}px`;card.appendChild(d);}
  mascotSetState('win', 2000); resetMascotIdleTimer();
  document.getElementById('modal-reward').classList.add('active');
}
document.getElementById('btn-reward-close').onclick=()=>document.getElementById('modal-reward').classList.remove('active');

// getWeekStart definida arriba en sistema de ligas (soporta offsetMs)
function getWeekCountdown(){
  const nowEcu=new Date(Date.now()+ECU_OFFSET_MS);
  const day=nowEcu.getUTCDay();
  const daysToMon=day===0?1:8-day;
  const nx=new Date(nowEcu);
  nx.setUTCDate(nowEcu.getUTCDate()+daysToMon);
  nx.setUTCHours(0,0,0,0);
  const ms=nx-nowEcu,dd=Math.floor(ms/86400000),h=Math.floor((ms%86400000)/3600000),mm=Math.floor((ms%3600000)/60000);
  return`Reinicia en ${dd}d ${h}h ${mm}m`;
}
function getWeekLabel(){
  // T12:00:00Z evita desfase de día al convertir a Guayaquil (UTC-5 = 07:00 local)
  const ws=getWeekStart();
  const o={day:'numeric',month:'long',timeZone:'America/Guayaquil'};
  const monDate=new Date(ws+'T12:00:00Z');
  const sunDate=new Date(monDate.getTime()+6*86400000);
  return`${monDate.toLocaleDateString('es-ES',o)} – ${sunDate.toLocaleDateString('es-ES',o)}`;
}
function buildRankItem(p,idx,isMe,maxL,showL=false,promoCut=0){
  const medals=['🥇','🥈','🥉'];
  const medal=medals[idx]!=null?medals[idx]:`<span style="font-size:.8rem;color:#94a3b8;font-weight:700">${idx+1}</span>`;
  // Mostrar escudo de la liga del jugador
  const pLiga = LIGAS[(p.ligaLevel||1)-1] || LIGAS[0];
  const lb = `<span title="${pLiga.nombre}" style="font-size:.75rem;margin-left:3px">${pLiga.escudo}</span>`;
  const item=document.createElement('div');
  let lineClass = '';
  if(promoCut > 0) lineClass = idx < promoCut ? ' above-line' : ' below-line';
  item.className=`ritem${isMe?' me':''}${lineClass}`;
  item.innerHTML=`<div style="font-size:1.4rem;width:32px;text-align:center">${medal}</div><div style="margin-right:6px;flex-shrink:0;display:flex;align-items:center">${getAvatarHTML(p.avatar,26)}</div><div style="flex:1;min-width:0"><div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:700;color:#1e293b;font-size:.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:140px">${p.displayName||'Jugador'}${isMe?' <span style="color:#0ea5e9">(Tú)</span>':''}${lb}</span><span style="font-size:.75rem;font-weight:700;color:#0284c7">Nv.${p.level}</span></div><div class="rbar" style="margin-top:4px"><div class="rbar-fill" style="width:${Math.round((p.level/maxL)*100)}%"></div></div><span style="font-size:10px;color:#94a3b8">⭐ ${p.stars||0} pts</span></div>`;
  return item;
}
function buildErrFallback(el){el.innerHTML=`<div style="text-align:center;padding:1rem"><p style="color:#94a3b8;font-size:.85rem;margin-bottom:.5rem">Sin conexión o sin datos.</p><div class="ritem me"><div style="font-size:1.4rem;width:32px;text-align:center">🏆</div><div style="font-size:1.3rem;margin-right:6px">${selectedAvatar}</div><div style="flex:1"><div style="display:flex;justify-content:space-between"><span style="font-weight:700;color:#1e293b;font-size:.85rem">Tú (local)</span><span style="font-size:.75rem;font-weight:700;color:#0284c7">Nv.${game.level}</span></div><div class="rbar" style="margin-top:4px"><div class="rbar-fill" style="width:100%"></div></div><span style="font-size:10px;color:#94a3b8">⭐ ${game.stars} pts</span></div></div></div>`;}
window.switchRankTab=function(tab){document.getElementById('tab-global').classList.toggle('active',tab==='global');document.getElementById('tab-liga').classList.toggle('active',tab==='liga');document.getElementById('panel-global').style.display=tab==='global'?'':'none';document.getElementById('panel-liga').style.display=tab==='liga'?'':'none';if(tab==='liga')loadLigaData();};
async function loadGlobalRanking(){const list=document.getElementById('ranking-list');list.innerHTML='<div class="ldots"><span></span><span></span><span></span></div>';try{let pl=[];try{const q=query(collection(db,`fatlin_ranking_${APP_ID}`),orderBy('level','desc'),limit(25));const s=await getDocs(q);s.forEach(d=>pl.push({id:d.id,...d.data()}));}catch(e){const s=await getDocs(collection(db,`fatlin_ranking_${APP_ID}`));s.forEach(d=>pl.push({id:d.id,...d.data()}));pl.sort((a,b)=>(b.level||0)-(a.level||0)||(b.stars||0)-(a.stars||0));pl=pl.slice(0,25);}if(!pl.length){list.innerHTML='<p style="text-align:center;color:#94a3b8;padding:2rem;font-size:.85rem">¡Sé el primero!</p>';return;}list.innerHTML='';const ml=Math.max(...pl.map(p=>p.level||1));pl.forEach((p,i)=>{const isMe=game.user&&p.id===game.user.uid;if(i===4&&pl.length>5){const d=document.createElement('div');d.className='rdiv';list.appendChild(d);}list.appendChild(buildRankItem(p,i,isMe,ml,true));});const inL=pl.some(p=>game.user&&p.id===game.user.uid);if(!inL&&game.user){const sep=document.createElement('p');sep.style.cssText='font-size:10px;color:#94a3b8;text-align:center;margin:.5rem 0;font-weight:700;text-transform:uppercase;letter-spacing:.1em';sep.innerText='— Tu posición —';list.appendChild(sep);list.appendChild(buildRankItem({id:game.user.uid,displayName:game.user.displayName||game.user.email?.split('@')[0]||'Tú',level:game.level,stars:game.stars,avatar:selectedAvatar,ligaLevel:game.ligaLevel||1},999,true,ml,false));}}catch(e){buildErrFallback(list);}}
async function loadLigaData(){
  document.getElementById('liga-week-lbl').innerText=getWeekLabel();
  const _lnl=document.getElementById('liga-nombre-lbl');
  const _ligaActual=LIGAS[(game.ligaLevel||1)-1]||LIGAS[0];
  if(_lnl) _lnl.innerText=`${_ligaActual.escudo} Liga ${_ligaActual.nombre} PACIE`;
  document.getElementById('liga-cnt').innerText=getWeekCountdown();
  const t5=document.getElementById('liga-top5'),fu=document.getElementById('liga-full');
  t5.innerHTML='<div class="ldots"><span></span><span></span><span></span></div>';
  fu.innerHTML='';
  try{
    const ws=getWeekStart();
    const myLiga=game.ligaLevel||1;
    let pl=[];
    // Traer todos los que jugaron esta semana — sin filtrar por liga
    // La liga semanal muestra a todos los de la cohorte activa esta semana
    // El jugador ve a todos sus compañeros independientemente de su ligaLevel
    const {monMs,sunMs}=getWeekRange();
    try{
      const s=await getDocs(collection(db,`fatlin_weekly_${APP_ID}`));
      s.forEach(d=>{
        const dat=d.data();
        const correctWeek=dat.weekStart===ws;
        const inRange=dat.updatedAt>=monMs && dat.updatedAt<=sunMs;
        if(correctWeek||inRange) pl.push({id:d.id,...dat});
      });
    }catch(e){
      console.warn('[Liga] Error leyendo weekly:',e);
    }
    pl.sort((a,b)=>(b.stars||0)-(a.stars||0)||(b.level||0)-(a.level||0));
    // Inyectar al jugador actual si aún no aparece (aún no jugó esta semana)
    if(game.user){
      const meInList=pl.some(p=>p.uid===game.user.uid);
      if(!meInList){
        pl.push({id:`${ws}_${game.user.uid}`,uid:game.user.uid,
          displayName:game.user.displayName||game.user.email?.split('@')[0]||'Tú',
          stars:game.stars||0,level:game.level||1,avatar:selectedAvatar,
          weekStart:ws,ligaLevel:myLiga});
        pl.sort((a,b)=>(b.stars||0)-(a.stars||0)||(b.level||0)-(a.level||0));
      }
    }
    pl=pl.slice(0,25);
    if(!pl.length){
      t5.innerHTML='<p style="color:rgba(186,230,253,.7);font-size:.8rem;text-align:center">Nadie ha jugado esta semana en tu liga.<br><span style="font-size:.7rem;opacity:.7">¡Sé el primero en jugar!</span></p>';
      fu.innerHTML='';
      return;
    }
    t5.innerHTML='';
    const medals=['🥇','🥈','🥉','🏅','🏅'];
    pl.slice(0,5).forEach((p,i)=>{
      const isMe=game.user&&p.uid===game.user.uid;
      const item=document.createElement('div');
      item.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 4px;border-bottom:1px solid rgba(255,255,255,.1)';
      item.innerHTML=`<span style="font-size:1.3rem;width:28px;text-align:center">${medals[i]}</span><span style="display:inline-flex;align-items:center">${getAvatarHTML(p.avatar,22)}</span><div style="flex:1;min-width:0"><p style="color:white;font-weight:700;font-size:.85rem;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.displayName||'Jugador'}${isMe?' (Tú)':''}</p><p style="color:rgba(255,255,255,.6);font-size:.7rem;margin:0">⭐ ${p.stars||0} pts · Nv.${p.level}</p></div>`;
      t5.appendChild(item);
    });
    fu.innerHTML='';
    const ms=Math.max(...pl.map(p=>p.stars||1));
  // ── Calcular corte de ascenso para la liga actual ──
  const ligaActual = (typeof LIGAS !== 'undefined') ? (LIGAS[(game.ligaLevel||1)-1] || LIGAS[0]) : null;
  const promoCut = ligaActual ? ligaActual.promoCut : 5;
  // ── Posición del usuario en este ranking ──
  const myIdx = pl.findIndex(p => game.user && p.uid === game.user.uid);
  const myPos = myIdx + 1; // 1-based
  const atCut = myPos > 0 && Math.abs(myPos - promoCut) <= 2; // zona de tensión: ±2 del corte
  const justAbove = myPos > 0 && myPos <= promoCut;
  const justBelow = myPos > promoCut;
  // ── Calcular puntos de diferencia al corte ──
  let proximityMsg = '';
  if(myIdx >= 0 && atCut && justBelow){
    const cutPlayer = pl[promoCut - 1];
    if(cutPlayer){
      const diff = (cutPlayer.stars||0) - (pl[myIdx].stars||0);
      const levels = Math.ceil(diff / 15);
      proximityMsg = diff <= 0
        ? '⚡ ¡Estás empatado en la Zona de Ascenso!'
        : `Estás a solo ${diff} pts (≈${levels} nivel${levels!==1?'es':''} perfecto${levels!==1?'s':''}) de ascender`;
    }
  } else if(myIdx >= 0 && atCut && justAbove){
    const dangerPlayer = pl[promoCut]; // primero fuera del corte
    if(dangerPlayer){
      const diff = (pl[myIdx].stars||0) - (dangerPlayer.stars||0);
      proximityMsg = diff <= 30
        ? `⚠️ ¡Cuidado! Te siguen a solo ${diff} pts — sigue jugando para mantenerte`
        : '';
    }
  }
  pl.forEach((p,i)=>{
    const isMe=game.user&&p.uid===game.user.uid;
    // Insertar línea neón ENTRE el último clasificado y el primero fuera
    if(i === promoCut){
      const lineEl = document.createElement('div');
      lineEl.className = 'rank-ascenso-line' + (atCut && justBelow ? ' danger' : '');
      lineEl.innerHTML = '<span class="rank-ascenso-badge">⬆ ZONA DE ASCENSO</span>';
      fu.appendChild(lineEl);
      // Mensaje de proximidad justo debajo de la línea
      if(proximityMsg){
        const msgEl = document.createElement('div');
        msgEl.className = 'rank-proximity-msg';
        msgEl.textContent = proximityMsg;
        fu.appendChild(msgEl);
      }
    }
    fu.appendChild(buildRankItem({id:p.uid,displayName:p.displayName,level:p.level,stars:p.stars,avatar:p.avatar,ligaLevel:p.ligaLevel||myLiga},i,isMe,ms,false,promoCut));
  });
  }catch(e){t5.innerHTML='<p style="color:rgba(186,230,253,.7);font-size:.8rem;text-align:center">Error.</p>';buildErrFallback(fu);}}
setInterval(()=>{const el=document.getElementById('liga-cnt');if(el&&document.getElementById('panel-liga').style.display!=='none')el.innerText=getWeekCountdown();},60000);
document.getElementById('btn-ranking').onclick=async()=>{document.getElementById('modal-ranking').classList.add('active');document.getElementById('tab-global').classList.add('active');document.getElementById('tab-liga').classList.remove('active');document.getElementById('panel-global').style.display='';document.getElementById('panel-liga').style.display='none';await loadGlobalRanking();};
document.getElementById('btn-close-ranking').onclick=()=>document.getElementById('modal-ranking').classList.remove('active');

function openAccountModal(){document.getElementById('acc-name').innerText=game.user?.displayName||game.user?.email?.split('@')[0]||'Usuario';document.getElementById('acc-email').innerText=game.user?.email||'—';document.getElementById('acc-level').innerText=game.level;document.getElementById('acc-stars').innerText=game.stars;document.getElementById('acc-badges').innerText=game.badges;setAvatarEl(document.getElementById('acc-av'));document.getElementById('modal-account').classList.add('active');}
document.getElementById('btn-account').onclick=openAccountModal;
document.getElementById('btn-close-account').onclick=()=>document.getElementById('modal-account').classList.remove('active');
document.getElementById('btn-chgav').onclick=()=>{document.getElementById('modal-account').classList.remove('active');openAvatarPicker();};
document.getElementById('btn-logout').onclick=async()=>{if(confirm(t("confirm_logout"))){try{await signOut(auth);}catch(e){}stopRestTimer();game.user=null;document.getElementById('modal-account').classList.remove('active');document.getElementById('game-container').style.display='none';showAuthUI();}};
document.getElementById('btn-switch-acc').onclick=async()=>{if(confirm(t("confirm_switch"))){try{await signOut(auth);}catch(e){}game.user=null;showAuthUI();}};
document.getElementById('btn-new-acc').onclick=()=>{try{signOut(auth).catch(()=>{});}catch(e){}game.user=null;showAuthUI('email');};

window.openLogros = async function openLogros(){
  console.log('[Logros] game:', game?.level, 'badges:', game?.badges, 'diplomas:', game?.diplomasEarned);
  // Datos del usuario
  setAvatarEl(document.getElementById('logros-avatar'));
  document.getElementById('logros-name').textContent = game.user?.displayName || game.user?.email?.split('@')[0] || 'Usuario';
  document.getElementById('logros-level').textContent = 'Nivel ' + game.level + ' · ' + game.stars + ' ⭐';

  // Insignias — solo mostrar las ganadas
  const badgesGrid = document.getElementById('logros-badges-grid');
  badgesGrid.innerHTML = '';
  const earnedCount = game.badges || 0;
  const earnedBadges = REWARDS.slice(0, earnedCount);
  if(earnedBadges.length > 0){
    earnedBadges.forEach((r, idx) => {
      const div = document.createElement('div');
      div.className = 'logro-item earned';
      div.innerHTML = `<span class="logro-emoji">${r.badge.split(' ')[0]}</span>
        <span class="logro-label">${r.badge.replace(/^[^ ]+ /,'')}</span>
        <span style="font-size:.65rem;color:#6b7280;display:block;margin-top:3px">${r.msg}</span>`;
      badgesGrid.appendChild(div);
    });
  } else {
    badgesGrid.innerHTML = '<div class="no-logros" style="grid-column:span 2">Aún no tienes insignias.<br>¡Completa 10 niveles para ganar la primera!</div>';
  }

  const diplomasList = document.getElementById('logros-diplomas-list');
  const diplomaTiers = [
    {min:80,  emoji:'🥉', title:'Diploma Fundamentos PACIE',  sub:'Completaste 80 niveles'},
    {min:160, emoji:'🥈', title:'Diploma Practicante PACIE',  sub:'Completaste 160 niveles'},
    {min:240, emoji:'🥇', title:'Diploma Experto PACIE',      sub:'Completaste 240 niveles'},
    {min:320, emoji:'✦',  title:'Diploma Máster PACIE',       sub:'Completaste 320 niveles'},
    {min:400, emoji:'💎', title:'Diploma Élite PACIE',        sub:'Completaste 400 niveles'},
    {min:480, emoji:'🔴', title:'Diploma Gran Maestro PACIE', sub:'Completaste 480 niveles'},
  ];

  const reached = diplomaTiers.filter(d => game.level > d.min);

  if(reached.length === 0){
    const remaining = 80 - ((game.level - 1) % 80);
    diplomasList.innerHTML = `<div class="no-logros">Aún no tienes diplomas.<br>¡Te faltan <strong>${remaining} nivel${remaining!==1?'es':''}</strong> para obtener el primero!</div>`;
    document.getElementById('modal-logros').classList.add('active');
    return;
  }

  // ── PASO 1: Renderizar inmediatamente con datos locales (0ms de espera) ──
  // Usar memoria + localStorage sin esperar Firestore
  let paidLevels = new Set();
  if(game.paidLevels && game.paidLevels.size > 0) game.paidLevels.forEach(l => paidLevels.add(l));
  try {
    const local = JSON.parse(localStorage.getItem('fatlin_paid_levels') || '[]');
    local.forEach(l => paidLevels.add(l));
  } catch(e){}

  function _renderDiplomas(paidSet){
    diplomasList.innerHTML = '';
    reached.forEach(d => {
      const div = document.createElement('div');
      div.className = 'diploma-item';
      const emo = document.createElement('span');
      emo.className = 'diploma-emoji';
      emo.textContent = d.emoji;
      const info = document.createElement('div');
      info.className = 'diploma-info';
      info.innerHTML = `<div class="diploma-title">${d.title}</div><div class="diploma-sub">${d.sub}</div>`;
      const btn = document.createElement('button');
      const hasPaid = paidSet === null || paidSet.has(d.min);
      if(hasPaid){
        btn.textContent = '🖨️ Ver';
        btn.style.cssText = 'background:#0284c7;color:white;border:none;border-radius:10px;padding:5px 10px;font-size:.7rem;font-weight:700;cursor:pointer;flex-shrink:0;';
        const minLevel = d.min;
        btn.addEventListener('click', function() {
          document.getElementById('modal-logros').classList.remove('active');
          document.getElementById('modal-challenge').classList.remove('active');document.body.classList.remove('in-challenge');
          game.isProcessing = false;
          requestAnimationFrame(() => generateDiploma(minLevel));
        });
      } else {
        btn.textContent = '🔒 Activar';
        btn.title = 'Realiza tu aporte para activar este diploma';
        btn.style.cssText = 'background:#fef3c7;color:#92400e;border:1.5px solid #fde68a;border-radius:10px;padding:5px 10px;font-size:.7rem;font-weight:700;cursor:pointer;flex-shrink:0;';
        const minLevel = d.min;
        btn.addEventListener('click', function() {
          document.getElementById('modal-logros').classList.remove('active');
          setTimeout(() => showPayWall(minLevel), 200);
        });
      }
      div.appendChild(emo); div.appendChild(info); div.appendChild(btn);
      diplomasList.appendChild(div);
    });
  }

  // Mostrar modal INMEDIATAMENTE con datos locales
  _renderDiplomas(paidLevels);
  document.getElementById('modal-logros').classList.add('active');

  // ── PASO 2: Consultar Firestore en PARALELO en background ──
  // Si encuentra datos nuevos, actualiza la lista silenciosamente
  if(game.user && game.user.uid){
    const uid = game.user.uid;
    Promise.all([
      getDocs(query(collection(db,'fatlin_payments'), where('uid','==',uid))).catch(()=>null),
      getDocs(query(collection(db,`fatlin_diplomas_${APP_ID}`), where('uid','==',uid))).catch(()=>null)
    ]).then(([paymentsSnap, dipSnap])=>{
      let changed = false;
      if(paymentsSnap) paymentsSnap.forEach(docSnap=>{
        const data=docSnap.data();
        if((data.status==='approved'||data.paid===true) && typeof data.level==='number' && !paidLevels.has(data.level)){
          paidLevels.add(data.level); changed=true;
        }
      });
      if(dipSnap) dipSnap.forEach(docSnap=>{
        const data=docSnap.data();
        if(typeof data.level==='number' && !paidLevels.has(data.level)){
          paidLevels.add(data.level); changed=true;
        }
      });
      if(changed){
        // Sincronizar a memoria global
        if(!game.paidLevels) game.paidLevels = new Set();
        paidLevels.forEach(l=>game.paidLevels.add(l));
        // Re-renderizar solo si el modal sigue abierto
        if(document.getElementById('modal-logros').classList.contains('active')){
          _renderDiplomas(paidLevels);
        }
      }
    }).catch(()=>{});
  }
}; // end openLogros

window.openAvatarPicker = function openAvatarPicker(){
  const g = document.getElementById('av-grid');
  g.innerHTML = '';
  tempAvatar = selectedAvatar;

  // ── Opción foto de Google (solo si está disponible) ──
  const gPhoto = getGooglePhotoURL();
  if(gPhoto){
    const gRow = document.createElement('div');
    gRow.className = 'av-google-opt' + (selectedAvatar === gPhoto ? ' selected' : '');
    gRow.innerHTML = `
      <img src="${gPhoto}" alt="Foto Google"
        onerror="if(this._err)return;this._err=true;var p=this.parentElement;if(p)p.style.display='none'">
      <div class="av-google-opt-info">
        <div class="av-google-opt-label">📷 Usar foto de Google</div>
        <div class="av-google-opt-sub">Tu foto de perfil actual</div>
      </div>`;
    gRow.onclick = () => {
      document.querySelectorAll('.avopt, .av-google-opt').forEach(x=>x.classList.remove('selected'));
      gRow.classList.add('selected');
      tempAvatar = gPhoto;
    };
    g.appendChild(gRow);
  }

  // ── Emojis disponibles ──
  AVATARS.forEach(av => {
    const b = document.createElement('div');
    b.className = `avopt${av === selectedAvatar ? ' selected' : ''}`;
    b.textContent = av;
    b.onclick = () => {
      document.querySelectorAll('.avopt, .av-google-opt').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      tempAvatar = av;
    };
    g.appendChild(b);
  });

  document.getElementById('modal-avatar').classList.add('active');
}
document.getElementById('btn-confirm-av').onclick=()=>{selectedAvatar=tempAvatar;setAvatarEl(document.getElementById('hud-avatar'));document.getElementById('modal-avatar').classList.remove('active');saveProgress();updateHUD();};



/* ════════════════════════════════════════════════════════════
   SECCIÓN: EFECTOS DE INTERFAZ Y UI
   Contiene: updateHUD, getWeekCountdown, ranking, ligas,
             openLogros, diplomas, tienda, avatar picker,
             shop (escudos, gala), interval gala, resize
════════════════════════════════════════════════════════════ */
function updateHUD(){
  const isGala = game.infiniteLivesUntil && game.infiniteLivesUntil > Date.now();

  document.getElementById('stat-stars').innerText = game.stars;
  document.getElementById('stat-lives').innerText = isGala ? '∞' : game.lives;
  document.getElementById('stat-level').innerText = `Nv.${game.level}`;
  document.getElementById('stat-user').innerText = game.user?.displayName||game.user?.email?.split('@')[0]||'Usuario';
  setAvatarEl(document.getElementById('hud-avatar'));

  // Escudos
  const shEl = document.getElementById('stat-shields');
  shEl.classList.toggle('visible', game.shields > 0);
  document.getElementById('stat-shields-count').innerText = game.shields;

  // Racha
  const stEl = document.getElementById('stat-streak');
  stEl.classList.toggle('visible', game.streakDays > 1);
  document.getElementById('stat-streak-count').innerText = `${game.streakDays}d`;

  // Gala
  document.body.classList.toggle('gala-mode', !!isGala);
  const galaBadge = document.getElementById('gala-badge');
  if(galaBadge) galaBadge.style.display = '';
  if(isGala){
    const rem = game.infiniteLivesUntil - Date.now();
    const h = Math.floor(rem/3600000), m = Math.floor((rem%3600000)/60000);
    document.getElementById('gala-timer').innerText = `${h}h${m}m`;
  }
  updateGalaStars(!!isGala);

  // Botón tienda
  const shopBtn = document.getElementById('btn-shop');
  if(shopBtn) shopBtn.style.display = '';

  // Divisores
  ['hdiv-streak','hdiv-gala'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = '';
  });

  updateProgressUI();

  // ── Barra de progreso inferior ──────────────────────────────
  const pf = document.getElementById('progress-footer');
  if(pf){
    pf.classList.add('visible');
    const TOTAL_LEVELS = 480;
    const pct = Math.min(100, ((game.level - 1) / TOTAL_LEVELS) * 100);
    const fill = document.getElementById('pf-fill');
    if(fill){ fill.style.width = pct + '%'; fill.style.setProperty('--pct', pct); }
    const lvtxt = document.getElementById('pf-lvtxt');
    if(lvtxt){
      const mods = [80,160,240,320,400,480];
      const nextMod = mods.find(m => game.level <= m);
      if(nextMod){ lvtxt.textContent = `Nv.${game.level - 1}`; }
      else { lvtxt.textContent = `Nv.${game.level - 1}`; }
    }
    const nexttxt = document.getElementById('pf-nexttxt');
    if(nexttxt){
      const mods = [80,160,240,320,400,480];
      const nextMod = mods.find(m => game.level <= m);
      if(nextMod){
        const remaining = nextMod - (game.level - 1);
        nexttxt.textContent = `🎓 Diploma en ${nextMod} nv · ${Math.round(pct)}%`;
      } else {
        nexttxt.textContent = `🏆 ${Math.round(pct)}% completado`;
      }
    }
  }
}

function updateGalaStars(show){
  const el = document.getElementById('gala-stars');
  if(show && !el.childElementCount){
    for(let i=0;i<60;i++){
      const s=document.createElement('div');s.className='gala-star';
      const sz=1+Math.random()*2;
      s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;animation-delay:${Math.random()*3}s;animation-duration:${2+Math.random()*3}s`;
      el.appendChild(s);
    }
  } else if(!show){ el.innerHTML=''; }
}

const MAP=document.getElementById('map-scroll');
function getMapY(){const m=MAP.style.transform.match(/translateY\((-?\d+\.?\d*)px\)/);return m?parseFloat(m[1]):0;}
function clampY(y){const mapH=document.getElementById('map-scroll').offsetHeight||12000;return Math.min(window.innerHeight/2,Math.max(-(mapH-window.innerHeight+200),y));}
function centerCamera(instant=false){const ty=-((game.level-1)*SPACING)+(window.innerHeight/2)-200;if(instant){MAP.style.transition='none';MAP.style.transform=`translateY(${ty}px)`;setTimeout(()=>{MAP.style.transition='';},50);}else MAP.style.transform=`translateY(${ty}px)`;}
document.getElementById('btn-gocur').onclick=()=>centerCamera();
document.getElementById('game-container').addEventListener('wheel',(e)=>{e.preventDefault();const dy=e.deltaY*(e.deltaMode===1?30:1);MAP.style.transition='transform 0.15s ease-out';MAP.style.transform=`translateY(${clampY(getMapY()-dy)}px)`;},{passive:false});
let tsy=0,moy=0,lty=0,vel=0,raf=null;
MAP.addEventListener('touchstart',(e)=>{if(raf){cancelAnimationFrame(raf);raf=null;}tsy=e.touches[0].clientY;lty=tsy;moy=getMapY();MAP.style.transition='none';vel=0;},{passive:true});
MAP.addEventListener('touchmove',(e)=>{const dy=e.touches[0].clientY-tsy;vel=e.touches[0].clientY-lty;lty=e.touches[0].clientY;MAP.style.transform=`translateY(${clampY(moy+dy)}px)`;},{passive:true});
MAP.addEventListener('touchend',()=>{let cy=getMapY(),v=vel*1.5;function in_(){v*=.91;if(Math.abs(v)<.4){MAP.style.transition='';return;}cy=clampY(cy+v);MAP.style.transform=`translateY(${cy}px)`;raf=requestAnimationFrame(in_);}MAP.style.transition='none';raf=requestAnimationFrame(in_);});

function showAuthUI(mode='main'){document.getElementById('game-container').style.display='none';document.getElementById('auth-screen').style.display='flex';document.getElementById('auth-email').style.display=mode==='email'?'block':'none';document.getElementById('auth-main').style.display=mode==='email'?'none':'block';const se=localStorage.getItem('fatlin_rem_email'),sp=localStorage.getItem('fatlin_rem_pass');if(se){document.getElementById('inp-email').value=se;document.getElementById('inp-pass').value=sp||'';document.getElementById('chk-rem').checked=true;}else{document.getElementById('inp-email').value='';document.getElementById('inp-pass').value='';document.getElementById('chk-rem').checked=false;}}
let eyeVisible=false;
document.getElementById('btn-eye').onclick=()=>{eyeVisible=!eyeVisible;const i=document.getElementById('inp-pass');const ic=document.getElementById('eye-ico');i.type=eyeVisible?'text':'password';ic.innerHTML=eyeVisible?`<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`:`<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;};
document.getElementById('btn-show-email').onclick=()=>{document.getElementById('auth-main').style.display='none';document.getElementById('auth-email').style.display='block';};
document.getElementById('btn-back').onclick=()=>{document.getElementById('auth-email').style.display='none';document.getElementById('auth-main').style.display='block';};
document.getElementById('btn-google').onclick=async()=>{
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try{
    await signInWithPopup(auth, provider);
  }catch(e){
    console.warn('[Google Auth] Popup falló:', e.code);
    // signInWithRedirect eliminado: causa "missing initial state" en Safari y Chrome
    // con storage particionado (sessionStorage no sobrevive redirección entre dominios)
    if(e.code === 'auth/popup-blocked'){
      showError('Popup bloqueado. Permite ventanas emergentes para fatlin.web.app e intenta de nuevo.');
    } else if(e.code==='auth/popup-closed-by-user'||e.code==='auth/cancelled-popup-request'){
      // Usuario cerró el popup — sin error
    } else if(e.code==='auth/web-storage-unsupported'||e.code==='auth/operation-not-supported-in-this-environment'){
      showError('Tu navegador bloquea el acceso a Google. Usa correo y contraseña, o prueba en Chrome/Firefox.');
    } else {
      console.error('[Google Auth Error]', e.code, e.message);
      showError('Error al iniciar sesión con Google. Intenta con correo y contraseña.');
    }
  }
};
document.getElementById('btn-login').onclick=async()=>{const email=document.getElementById('inp-email').value.trim(),pass=document.getElementById('inp-pass').value,rem=document.getElementById('chk-rem').checked;if(!email||pass.length<6){showError("Correo inválido o contraseña < 6 chars.");return;}if(rem){localStorage.setItem('fatlin_rem_email',email);localStorage.setItem('fatlin_rem_pass',pass);}else{localStorage.removeItem('fatlin_rem_email');localStorage.removeItem('fatlin_rem_pass');}try{await signInWithEmailAndPassword(auth,email,pass);}catch(e){try{await createUserWithEmailAndPassword(auth,email,pass);}catch(err){showError("Error al registrar o iniciar sesión.");}}};

function getTodayStart(){const n=new Date();n.setHours(0,0,0,0);return n.getTime();}
function checkDailyStreak(){
  const today = getTodayStart();
  const yesterday = today - 86400000;
  const last = game.lastPlayDate || 0;
  if(last === today){ return; }
  else if(last === yesterday){ game.streakDays++; game.lastPlayDate = today; if(game.streakDays > 1) showToast(t('streak_active',{N:game.streakDays}),'#ea580c'); }
  else if(last < yesterday && last > 0){
    if(game.shields > 0){ game.shields--; game.streakDays = Math.max(1, game.streakDays); game.lastPlayDate = today; showToast(t('streak_saved',{N:game.shields}),'#7c3aed'); saveProgress(); }
    else { game.streakDays = 1; game.lastPlayDate = today; if(last > 0) showToast(t('streak_lost'),'#dc2626'); }
  } else { game.streakDays = 1; game.lastPlayDate = today; }
  saveProgress(); updateHUD();
}

function showToast(msg, color='#0369a1'){
  const el = document.getElementById('error-msg');
  el.style.background = color;
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(()=>el.style.display='none', 3500);
}

function checkMilestones(newLevel){
  const justCompleted = newLevel - 1;
  if(justCompleted > 0 && justCompleted % 5 === 0){
    setTimeout(()=>triggerLevel5Blast(justCompleted), justCompleted % 10 === 0 ? 300 : 0);
  }
  // Diplomas cada 80 niveles: 80, 160, 240, 320...
  if(justCompleted > 0 && justCompleted % 80 === 0){
    game.diplomasEarned++;
    saveProgress();
    setTimeout(()=>generateDiploma(justCompleted), 1800);
  }
}

function getDiplomaTierForLevel(completedLevel){
  // Tabla de tiers igual que DIPLOMA_TIERS en openLogros
  const tiers = [
    {min:80,  label:'🥉 Bronce',   color:'#cd7f32', glow:'rgba(205,127,50,.6)',   layers:['#5a2a08','#7a3a10','#a05020','#cd7f32'], top:'#e8a060', core:'#ffd4a0', title:'Fundamentos PACIE',    bg:'#fffbeb', border:'#cd7f32', textColor:'#7a3a10'},
    {min:160, label:'🥈 Plata',    color:'#c0c0c0', glow:'rgba(192,192,192,.6)', layers:['#484848','#686868','#909090','#c8c8c8'], top:'#eaeaea', core:'white',   title:'Practicante PACIE',    bg:'#f8fafc', border:'#c0c0c0', textColor:'#374151'},
    {min:240, label:'🥇 Oro',      color:'#ffd700', glow:'rgba(255,215,0,.65)',   layers:['#6a4e00','#907000','#c09000','#ffd700'], top:'#fff066', core:'white',   title:'Experto PACIE',        bg:'#fffbeb', border:'#ffd700', textColor:'#78350f'},
    {min:320, label:'✦ Platino',   color:'#d4e8ff', glow:'rgba(180,210,240,.6)', layers:['#3a5060','#5a7080','#8098a8','#b8d0e8'], top:'#eef6ff', core:'white',   title:'Máster PACIE',         bg:'#f0f9ff', border:'#b0c4de', textColor:'#0c4a6e'},
    {min:400, label:'💎 Diamante', color:'#00cfff', glow:'rgba(0,191,255,.7)',    layers:['#003360','#005590','#007ab5','#00afdf'], top:'#d0f4ff', core:'white',   title:'Élite PACIE',          bg:'#ecfeff', border:'#00bfff', textColor:'#155e75'},
    {min:480, label:'🔴 Gema Roja',color:'#ff5555', glow:'rgba(255,60,60,.7)',   layers:['#500000','#800000','#b00000','#ff3333'], top:'#ff9090', core:'#ffdddd', title:'Gran Maestro PACIE',   bg:'#fff1f2', border:'#ff4444', textColor:'#881337'},
    {min:560, label:'💚 Gema Verde',color:'#00ff99',glow:'rgba(0,255,136,.6)',   layers:['#003318','#005528','#008040','#00cc66'], top:'#80ffbb', core:'#ccffe8', title:'Eminencia PACIE',      bg:'#f0fdf4', border:'#00cc66', textColor:'#14532d'},
    {min:640, label:'💜 Púrpura',  color:'#cc66ff', glow:'rgba(191,95,255,.7)',  layers:['#250048','#420070','#6600aa','#bf5fff'], top:'#e8aaff', core:'#f5d0ff', title:'Sabio PACIE',          bg:'#faf5ff', border:'#bf5fff', textColor:'#581c87'},
    {min:720, label:'⚙️ Titanio',  color:'#a0b8cc', glow:'rgba(144,168,188,.5)', layers:['#1e2e38','#2e4050','#486070','#7898a8'], top:'#d0dce4', core:'white',   title:'Titán PACIE',          bg:'#f1f5f9', border:'#94a3b8', textColor:'#1e293b'},
    {min:800, label:'🔷 Zafiro',   color:'#4db8ff', glow:'rgba(30,144,255,.75)', layers:['#001568','#0030a0','#0050c8','#1e80ef'], top:'#b8e0ff', core:'white',   title:'Leyenda Zafiro PACIE', bg:'#eff6ff', border:'#1e90ff', textColor:'#1e3a8a'},
    {min:880, label:'☢️ Uranio',   color:'#aaffcc', glow:'rgba(0,255,102,.6)',   layers:['#003318','#004d22','#006630','#00aa55'], top:'#ccffdd', core:'white',   title:'Leyenda Absoluta PACIE',bg:'#f0fdf4',border:'#00ff66', textColor:'#14532d'},
  ];
  // Buscar el tier exacto para este nivel (el que tiene min === completedLevel)
  return tiers.find(t => t.min === completedLevel)
    || tiers.slice().reverse().find(t => completedLevel > t.min)
    || tiers[0];
}

function buildDiplomaSealSVG(tier, size=96){
  const id = 'ds' + Date.now();
  const [l0,l1,l2,l3] = tier.layers;
  const hasPulse  = tier.min >= 250;
  const hasRays   = tier.min >= 500;
  const hasRings  = tier.min >= 550;
  const dur = tier.min >= 500 ? 1.5 : tier.min >= 250 ? 1.8 : 2.2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style="filter:drop-shadow(0 0 14px ${tier.glow});display:block;margin:0 auto">
    <defs>
      <radialGradient id="dsbg_${id}" cx="50%" cy="40%">
        <stop offset="0%" stop-color="${l3}" stop-opacity=".4"/>
        <stop offset="100%" stop-color="${l3}" stop-opacity="0"/>
      </radialGradient>
      <filter id="dsf_${id}"><feGaussianBlur stdDeviation="2.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    ${hasRings ? `<circle cx="50" cy="42" r="22" fill="none" stroke="${tier.core}"
      stroke-width=".8" opacity="0">
      <animate attributeName="opacity" values="0;.4;0" dur="${dur}s" repeatCount="indefinite"/>
      <animate attributeName="r" values="18;28;18" dur="${dur}s" repeatCount="indefinite"/>
    </circle>` : ''}
    <circle cx="50" cy="50" r="46" fill="url(#dsbg_${id})">
      ${hasPulse ? `<animate attributeName="r" values="43;50;43" dur="${dur}s" repeatCount="indefinite"/>` : ''}
    </circle>
    <path d="M50 88 L82 70 L50 52 L18 70 Z" fill="${l0}"/>
    <path d="M50 79 L82 61 L50 43 L18 61 Z" fill="${l1}"/>
    <path d="M50 70 L82 52 L50 34 L18 52 Z" fill="${l2}"/>
    <path d="M50 61 L82 43 L50 25 L18 43 Z" fill="${l3}"/>
    <path d="M50 52 L70 42 L50 32 L30 42 Z" fill="${tier.top}" filter="url(#dsf_${id})">
      <animate attributeName="opacity" values=".5;1;.5" dur="${dur}s" repeatCount="indefinite"/>
    </path>
    <circle cx="50" cy="42" r="5" fill="${tier.core}">
      <animate attributeName="r" values="4;${hasPulse?7:6};4" dur="${dur}s" repeatCount="indefinite"/>
    </circle>
    ${hasRays ? `
    <line x1="50" y1="14" x2="50" y2="7" stroke="${tier.top}" stroke-width="2">
      <animate attributeName="opacity" values="0;1;0" dur="${dur}s" begin="0s" repeatCount="indefinite"/>
    </line>
    <line x1="64" y1="18" x2="70" y2="12" stroke="${tier.top}" stroke-width="1.8">
      <animate attributeName="opacity" values="0;1;0" dur="${dur}s" begin="${dur*0.25}s" repeatCount="indefinite"/>
    </line>
    <line x1="36" y1="18" x2="30" y2="12" stroke="${tier.top}" stroke-width="1.8">
      <animate attributeName="opacity" values="0;1;0" dur="${dur}s" begin="${dur*0.5}s" repeatCount="indefinite"/>
    </line>` : ''}
  </svg>`;
}

async function saveDiplomaToFirestore(certData) {
  // Asegurar usuario autenticado
  const user = game.user || auth.currentUser;
  if (!user) { console.warn('[saveDiploma] Sin usuario autenticado'); return; }

  // certId limpio: sin espacios, solo ASCII, siempre mayúsculas
  // ✅ FIX: generateDiploma construye certData.certId (no certData.id)
  const rawId  = certData.certId || certData.id || `FATLIN-${Date.now()}`;
  const cleanId = rawId.trim().toUpperCase().replace(/[^A-Z0-9\-]/g, '');

  const payload = {
    certId:      cleanId,
    id:          cleanId,
    level:       certData.level,
    userName:    certData.name,
    name:        certData.name,
    tierTitle:   certData.tierTitle || `Diploma Nivel ${certData.level}`,
    tier:        certData.tier      || `Nivel ${certData.level}`,
    modules:     certData.modules,
    cycles:      certData.cycles,
    hours:       certData.hours,
    issuedAt:    Date.now(),
    issuedAtStr: certData.date,
    date:        certData.date,
    uid:         user.uid,
    valid:       true
  };

  console.log('[saveDiploma] Guardando:', cleanId, payload);

  try {
    await setDoc(doc(db, `fatlin_diplomas_${APP_ID}`, cleanId), payload, { merge: true });
    console.log('[saveDiploma] ✅ Guardado en Firestore:', cleanId);
  } catch(e) {
    console.error('[saveDiploma] ❌ Error:', e.code, e.message);
  }
}

async function generateDiploma(completedLevel) {

  const name =
    game.user?.displayName ||
    game.user?.email?.split('@')[0] ||
    'Estudiante';

  /* ── FECHA DE EMISIÓN: leer desde Firestore ──────────────────────────
     Si el diploma ya existe en Firestore usamos issuedAtStr (la fecha
     en que se generó por primera vez). Solo si no existe usamos hoy.
     Esto garantiza que re-ver el diploma días/meses después muestre
     siempre la fecha original de emisión, nunca la fecha actual.
  ──────────────────────────────────────────────────────────────────── */
  const uidPart = (game.user?.uid?.substring(0, 6) || 'GUEST').replace(/[^A-Z0-9]/gi, '');
  const certId  = `FATLIN-${new Date().getFullYear()}-${uidPart}-${completedLevel}`.toUpperCase();

  let date;
  try {
    const existingSnap = await getDoc(doc(db, `fatlin_diplomas_${APP_ID}`, certId));
    if (existingSnap.exists() && existingSnap.data().issuedAtStr) {
      // ✅ Diploma ya existía — usar fecha original de emisión
      date = existingSnap.data().issuedAtStr;
    } else if (existingSnap.exists() && existingSnap.data().issuedAt) {
      // Fallback: reconstruir desde timestamp numérico
      date = new Date(existingSnap.data().issuedAt).toLocaleDateString(
        'es-ES', { year: 'numeric', month: 'long', day: 'numeric' }
      );
    } else {
      // Primera vez — usar fecha de hoy (momento del pago/generación)
      date = new Date().toLocaleDateString(
        'es-ES', { year: 'numeric', month: 'long', day: 'numeric' }
      );
    }
  } catch(e) {
    // Si Firestore falla, usar fecha de hoy como último recurso
    date = new Date().toLocaleDateString(
      'es-ES', { year: 'numeric', month: 'long', day: 'numeric' }
    );
    console.warn('[generateDiploma] No se pudo leer fecha desde Firestore:', e);
  }

  /* ===========================================================
     NUEVO RENDER PROFESIONAL DE CERTIFICADOS
     A4 (80–400) · DOBLE CARTA / LEDGER (480+)
     =========================================================== */

  if (typeof window.renderByLevel === 'function' && completedLevel >= 80) {

    const year    = new Date().getFullYear();
    const modules = Math.floor(completedLevel / 8);
    const cycles  = Math.floor(completedLevel / 40);
    const hours   = completedLevel;

    // certId y uidPart ya definidos arriba para consultar Firestore

    const _tierLabels = {
      80:'Diploma Fundamentos PACIE', 160:'Diploma Practicante PACIE',
      240:'Diploma Experto PACIE', 320:'Diploma Máster PACIE',
      400:'Diploma Élite PACIE', 480:'Diploma Gran Maestro PACIE'
    };

const verifyUrl = `https://fatlin.web.app/verify-pending.html?id=${certId}`;

const certData = {
  level: completedLevel,
  name,
  certId: certId,
  date,          /* ← fecha de emisión leída desde Firestore (o hoy si es primera vez) */
  modules,
  cycles,
  hours,
  tierTitle: _tierLabels[completedLevel] || `Diploma Nivel ${completedLevel}`,
  tier: _tierLabels[completedLevel] || `Nivel ${completedLevel}`,
  qr: verifyUrl
};

    
    // Guardar en Firestore sin bloquear si falla
    try { await saveDiplomaToFirestore(certData); } catch(e) { console.warn('[Diploma] saveDiplomaToFirestore:', e); }

    const html = window.renderByLevel(certData);

    let container = document.getElementById('diploma-content');
    const modal = document.getElementById('modal-diploma');

    if (!modal) {
      console.error('[Diploma] No se encontró #modal-diploma');
      return;
    }

    // Si el contenedor fue reemplazado anteriormente, recrearlo
    if (!container) {
      container = document.createElement('div');
      container.id = 'diploma-content';
      modal.appendChild(container);
    }

    // Insertar HTML sin destruir el contenedor (replaceWith lo eliminaba del DOM)
    container.innerHTML = html;

    // ✅ Escalar el certificado al ancho real del contenedor
    if (typeof window.initCertScale === 'function') window.initCertScale();

    // ✅ FIX QR: garantizar que el <a> del QR sea clicable y tenga el href correcto
    // cert.js ya genera QR con size=300-400px + ecc=H — NO modificar src ni dimensiones
    setTimeout(()=>{
      const qrAnchor = container.querySelector('a[href*="verify-pending"], a[href*="fatlin.web.app"]');
      if(qrAnchor && certData.qr){
        qrAnchor.href = certData.qr;
        qrAnchor.setAttribute('target', '_blank');
        qrAnchor.setAttribute('rel', 'noopener');
        // Garantizar clicabilidad aunque el modal tenga pointer-events propios
        qrAnchor.style.position = 'relative';
        qrAnchor.style.zIndex   = '9999';
        qrAnchor.style.cursor   = 'pointer';
        // onclick de respaldo: si el <a> es interceptado por el modal, window.open igual funciona
        const _qrUrl = certData.qr;
        qrAnchor.onclick = function(e){
          e.stopPropagation();
          window.open(_qrUrl, '_blank');
          return false;
        };
        const qrImg = qrAnchor.querySelector('img');
        if(qrImg) qrImg.style.pointerEvents = 'none';
      }
    }, 500);

    // Forzar modo documento
    modal.classList.add('active');
    modal.style.background = '#0a1628';
    modal.style.padding = '32px';
    modal.style.overflow = 'auto';

    return; // ⛔ detener aquí — flujo nuevo cubre todo
  }

  // ✅ FIX P1 — FLUJO LEGACY BLOQUEADO
  // Generaba certId con iniciales del nombre (FATLIN-2026-JGR-80), incompatible
  // con el formato UID6 (FATLIN-2026-ABC123-80) que usa el QR y verify-pending.html.
  // Si renderByLevel no está disponible, el diploma no puede mostrarse de todas formas.
  console.warn('[Diploma] renderByLevel no disponible para nivel', completedLevel, '— diploma omitido.');
  /* === LEGACY BLOQUEADO — no eliminar hasta confirmar renderByLevel siempre presente ===

  const tier = getDiplomaTierForLevel(completedLevel);

  const tierData = {
    80:  { label:'Fundamentos PACIE', cycles:2,  modules:10 },
    160: { label:'Practicante PACIE', cycles:4,  modules:20 },
    240: { label:'Experto PACIE',     cycles:6,  modules:30 },
    320: { label:'Máster PACIE',       cycles:8,  modules:40 },
    400: { label:'Élite PACIE',        cycles:10, modules:50 },
    480: { label:'Gran Maestro PACIE', cycles:12, modules:60 }
  };

  const td = tierData[completedLevel] || tierData[80];

  /* ===========================================================
     GENERAR ID DETERMINISTA
     =========================================================== */

  const year = new Date().getFullYear();
  const shortName = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .substring(0, 4)
    .toUpperCase();

  const certId = `FATLIN-${year}-${shortName}-${completedLevel}`.toUpperCase();

  /* ===========================================================
     PERSISTENCIA EN FIREBASE (SI APLICA)
     =========================================================== */

  (async () => {
    try {
      await setDoc(
        doc(db, `fatlin_diplomas_${APP_ID}`, certId),
        {
          certId,
          level: completedLevel,
          tier: tier.label,
          tierTitle: td.label,
          userName: name,
          issuedAt: Date.now(),
          issuedAtStr: date,
          valid: true
        }
      );
    } catch (e) {
      console.warn('[Diploma] No se pudo persistir en Firebase:', e);
    }
  })();

  /* ===========================================================
     RENDER ANTIGUO (LEGACY)
     =========================================================== */

  const el = document.getElementById('dip-name');
  if (el) el.textContent = name;

  document.getElementById('modal-diploma')?.classList.add('active');
  /*=== FIN LEGACY BLOQUEADO === */
}

document.getElementById('btn-dip-close').onclick = () => {
  const modal = document.getElementById('modal-diploma');
  modal.classList.remove('active');
  // Limpiar contenido pesado del certificado para liberar memoria
  setTimeout(()=>{
    const c = document.getElementById('diploma-content');
    if(c) c.innerHTML = '';
    modal.style.background = '';
    modal.style.padding = '';
    modal.style.overflow = '';
  }, 300);
};
document.getElementById('btn-dip-print').onclick = () => {
  const btn = document.getElementById('btn-dip-print');
  btn.disabled = true;
  try {
    // Detectar tipo según qué cert está renderizado
    const inner = document.getElementById('cert-inner');
    if (!inner) { window.print(); return; }
    const tipo = inner.classList.contains('cert-diplomado') ? 'diplomado' : 'modulo';
    if (typeof window.printCert === 'function') {
      window.printCert(tipo);
    } else {
      window.print();
    }
  } catch(err) {
    console.error('Print error:', err);
    showToast('Error al imprimir', '#dc2626');
  } finally {
    setTimeout(() => { btn.disabled = false; }, 1500);
  }
};

document.getElementById('btn-shop').onclick = () => {
  document.getElementById('shop-ftl').innerText = game.stars;
  document.getElementById('modal-shop').classList.add('active');
};
document.getElementById('btn-close-shop').onclick = () => document.getElementById('modal-shop').classList.remove('active');

window.buyShields = function(qty, cost){
  if(game.stars < cost){ showToast(`Necesitas ${cost} ⭐ (tienes ${game.stars})`,'#dc2626'); return; }
  game.stars -= cost; game.shields += qty;
  saveProgress(); updateHUD();
  document.getElementById('shop-ftl').innerText = game.stars;
  showToast(`🛡️ ${qty} escudo${qty>1?'s':''} comprado${qty>1?'s':''}. Total: ${game.shields}`,'#7c3aed');
};

window.buyGala = function(hours, cost){
  if(game.stars < cost){ showToast(`Necesitas ${cost} ⭐ (tienes ${game.stars})`,'#dc2626'); return; }
  game.stars -= cost;
  const now = Date.now();
  const base = (game.infiniteLivesUntil && game.infiniteLivesUntil > now) ? game.infiniteLivesUntil : now;
  game.infiniteLivesUntil = base + hours * 3600000;
  game.lives = 5;
  saveProgress(); updateHUD();
  document.getElementById('shop-ftl').innerText = game.stars;
  document.getElementById('modal-shop').classList.remove('active');
  showToast(t('gala_activated',{N:hours}),'#d97706');
  mascotSetState('gala');
};

setInterval(()=>{
  if(game.infiniteLivesUntil && game.infiniteLivesUntil > Date.now()) updateHUD();
  else if(game.infiniteLivesUntil && game.infiniteLivesUntil <= Date.now()){
    game.infiniteLivesUntil = null;
    game.lives = Math.min(game.lives, 5);
    saveProgress(); updateHUD();
    mascotSetState('cheer', 800);
    showToast(t('gala_ended'),'#0369a1');
  }
}, 60000);

function isExpertLevel(level){
  // Modo experto: últimos 12 niveles de cada ciclo de 60
  // Niveles 49-60, 109-120, 169-180...
  const posInCycle = ((level - 1) % 60) + 1;
  return posInCycle >= 49;
}



/* ═══════════════════════════════════════════════════════════════
   EXPOSICIONES GLOBALES — requeridas por payment.js, HTML e index
═══════════════════════════════════════════════════════════════ */

// payment.js necesita renderMap, updateHUD, saveProgress, showToast, generateDiploma
window.renderMap            = renderMap;
window.updateHUD            = updateHUD;
window.saveProgress         = saveProgress;
window.showToast            = showToast;
window.generateDiploma      = generateDiploma;
window.updateProgressFooter = updateHUD; // alias — updateHUD ya actualiza el footer

// Función que payment.js llama para cargar niveles pagados desde Firestore
window._loadPaidLevelsFromFirestore = async function() {
    // 1. Verificación inicial de usuario
    if (!game.user) {
        console.warn('[_loadPaidLevels] No hay usuario autenticado.');
        return;
    }

    try {
        // 2. Importación dinámica (Lazy Load)
        const {
            getDocs: _getDocs,
            collection: _col,
            query: _query,
            where: _where
        } = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');

        if (!game.paidLevels) game.paidLevels = new Set();
        const uid = game.user.uid;

        console.log('[_loadPaidLevels] Iniciando carga para UID:', uid);

        // 3. Ejecución en Paralelo (Fuentes A y B)
        // Esto evita el error de "Unexpected State" al no encadenar awaits de red
        const [snapPayments, snapDiplomas] = await Promise.all([
            _getDocs(_query(_col(db, 'fatlin_payments'), _where('uid', '==', uid))),
            _getDocs(_query(_col(db, `fatlin_diplomas_${APP_ID}`), _where('uid', '==', uid)))
        ]).catch(err => {
            console.error(" Error en promesas de Firestore:", err);
            return [null, null]; 
        });

        // 4. Procesar Fuente A (Pagos aprobados)
        if (snapPayments && snapPayments.docs) {
            snapPayments.forEach(d => {
                const data = d.data();
                const isApproved = data.status === 'approved' || data.paid === true;
                if (isApproved && typeof data.level === 'number') {
                    game.paidLevels.add(data.level);
                }
            });
        }

        // 5. Procesar Fuente B (Diplomas obtenidos)
        if (snapDiplomas && snapDiplomas.docs) {
            snapDiplomas.forEach(d => {
                const data = d.data();
                if (typeof data.level === 'number') {
                    game.paidLevels.add(data.level);
                }
            });
        }

        // 6. Fuente C — localStorage (Capa de respaldo offline)
        try {
            const local = JSON.parse(localStorage.getItem('fatlin_paid_levels') || '[]');
            if (Array.isArray(local)) {
                local.forEach(l => game.paidLevels.add(l));
            }
        } catch (e) {
            console.warn("Error leyendo localStorage");
        }

        // 7. Actualizar Interfaz
        console.log('[PaidLevels] Carga finalizada. Niveles activos:', [...game.paidLevels]);
        // ✅ FIX: persistir en localStorage para carga inmediata en próxima sesión
        try { localStorage.setItem('fatlin_paid_levels', JSON.stringify([...game.paidLevels])); } catch(e) {}
        
        if (typeof renderMap === 'function') renderMap();
        if (typeof updateHUD === 'function') updateHUD();

    } catch (e) {
        console.error('[_loadPaidLevelsFromFirestore] Error Crítico:', e);
    }
};

// buyLife — tienda
window.buyLife = function(){
  if(game.lives >= 5){ showToast('Ya tienes 5 vidas.','#64748b'); return; }
  const cost = 100;
  if((game.ftl||0) < cost){ showToast(`Necesitas ${cost} 🪙 FTL (tienes ${game.ftl||0})`,'#dc2626'); return; }
  game.ftl = (game.ftl||0) - cost;
  game.lives = Math.min(5, game.lives + 1);
  saveProgress(); updateHUD();
  const sf = document.getElementById('shop-ftl');
  if(sf) sf.innerText = game.ftl;
  showToast('❤️ +1 Vida comprada','#dc2626');
};

// pauseChallenge — botón Pausar en el modal de pregunta
// NOTA: fixes.js en index.html sobreescribe esta función con la misma lógica.
// Se mantiene aquí como fallback si fixes.js no carga.
window.pauseChallenge = function(){
  // ✅ FIX: verificar visibilidad del modal, NO game.isProcessing.
  // isProcessing es false cuando el usuario lee la pregunta (antes de responder),
  // lo que causaba que el botón Pausar no hiciera nada.
  const modal = document.getElementById('modal-challenge');
  if(!modal || !modal.classList.contains('active')) return;
  modal.classList.remove('active');
  document.body.classList.remove('in-challenge');
  game.isProcessing     = false;
  game.correctCount     = 0;
  game.consecutiveErrors = 0;
  renderMap();
  updateProgressUI && updateProgressUI();
  centerCamera();
  showToast('⏸ Desafío pausado — vuelve cuando quieras','#0369a1');
};



// ✅ LISTENER EN TIEMPO REAL — PAGOS / CERTIFICADOS (PAYPAL / FIREBASE)
function watchPaidLevelsRealtime(){
  if (!game.user) return;

  // Evitar listeners duplicados
  if (game._paidListenerUnsub) return;

  import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js')
    .then(({ doc, onSnapshot }) => {
      const ref = doc(db, 'users', game.user.uid);

      game._paidListenerUnsub = onSnapshot(ref, snap => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (!Array.isArray(data.paidLevels)) return;

        game.paidLevels = new Set(data.paidLevels);

        console.log('[Payments ▶ RT]', [...game.paidLevels]);

        if (typeof closePayWall === 'function') closePayWall();
        if (typeof renderMap === 'function') renderMap();
        if (typeof updateHUD === 'function') updateHUD();

        if (typeof showToast === 'function'){
          showToast('🎓 Certificado activado automáticamente', '#16a34a');
        }
      });
    })
    .catch(err => console.warn('[Payments ▶ RT] Error:', err));
}

/* ══════════════════════════════════════════════════════
   REPARAR DIPLOMAS EXISTENTES SIN tierTitle en Firestore
   Corre una sola vez por sesión si el usuario está logueado
══════════════════════════════════════════════════════ */
(async function repairExistingDiplomas() {
  // Esperar a que Firebase Auth esté lista
  await new Promise(r => setTimeout(r, 4000));
  if (!game.user) return;

  const tierLabels = {
    80:'Diploma Fundamentos PACIE', 160:'Diploma Practicante PACIE',
    240:'Diploma Experto PACIE',    320:'Diploma Máster PACIE',
    400:'Diploma Élite PACIE',      480:'Diploma Gran Maestro PACIE'
  };

  try {
    const col = `fatlin_diplomas_${APP_ID}`;
    const snap = await getDocs(
      query(collection(db, col), where('uid', '==', game.user.uid))
    );
    for (const d of snap.docs) {
      const data = d.data();
      if (!data.tierTitle && data.level) {
        const label = tierLabels[data.level] || `Diploma Nivel ${data.level}`;
        await setDoc(doc(db, col, d.id), { tierTitle: label, tier: label }, { merge: true });
        console.log('[repairDiplomas] Parcheado:', d.id, '->', label);
      }
    }
  } catch(e) {
    console.warn('[repairDiplomas]', e);
  }
})();
