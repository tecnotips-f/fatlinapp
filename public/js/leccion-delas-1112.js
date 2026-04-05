/* ═══════════════════════════════════════════════════════════════
   Fatlin AI — leccion.js  v2.0
   Sistema de Lecciones Dinámicas PACIE

   ARQUITECTURA:
   ┌─────────────────────────────────────────────────────────────┐
   │  1. Usuario pulsa "Ver lección"                             │
   │  2. Se intenta cargar lección desde Claude (via proxy)      │
   │     — Claude consulta las 3 fuentes reales con web_search   │
   │     — Genera contenido fresco y relevante                   │
   │  3. Si hay conexión → lección dinámica + se cachea local    │
   │  4. Si no hay conexión → banco local (7 lecciones offline)  │
   │  5. Caché expira en 6h → fuerza nueva consulta              │
   └─────────────────────────────────────────────────────────────┘

   Dependencias (expuestas por main.js):
     • window.CLAUDE_ENDPOINT      — URL del proxy Firebase
     • window.PACIE_SOURCE_GROUPS  — grupos de fuentes por área
     • window.game.user            — usuario autenticado
     • window.auth.currentUser     — fallback auth
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════════
   § 1 — CONFIGURACIÓN
════════════════════════════════════════════════════════════ */
const LEC_CACHE_KEY  = 'fatlin_leccion_cache_v2';
const LEC_CACHE_TTL  = 6 * 60 * 60 * 1000;  // 6 horas
const LEC_MAX_CACHED = 12;                    // máx lecciones guardadas
const LEC_MIN_PREFETCH = 3;                   // mínimo para activar prefetch

/* Colores por fuente — coherentes con main.js */
const SRC_META = {
  'fatla.org'       : { sColor: '#38bdf8', lColor: '#7dd3fc' },
  'pacie.education' : { sColor: '#a78bfa', lColor: '#c4b5fd' },
  'asomtv.org'      : { sColor: '#f0c040', lColor: '#fbbf24' },
};

/* Temas rotativos — mismos que main.js para coherencia pedagógica */
const LEC_TOPICS = [
  { tema: 'Fundamentos de la Metodología PACIE',              src: 'fatla.org',       foco: 'qué es PACIE, sus 5 fases y por qué fue creada por FATLA' },
  { tema: 'Fase Presencia: identidad del aula virtual',       src: 'fatla.org',       foco: 'imagen, motivación visual e impacto en el estudiante' },
  { tema: 'Fase Alcance: objetivos y estándares PACIE',       src: 'fatla.org',       foco: 'competencias, estándares académicos y diseño curricular virtual' },
  { tema: 'Fase Capacitación: formación del docente virtual', src: 'pacie.education', foco: 'preparación docente, manejo tecnológico y pedagogía virtual' },
  { tema: 'Fase Interacción: aprendizaje colaborativo',       src: 'pacie.education', foco: 'foros, wikis, trabajo grupal y construcción colectiva del conocimiento' },
  { tema: 'Fase E-learning: madurez pedagógica y LMS',        src: 'pacie.education', foco: 'plataformas LMS, sostenibilidad del EVA y evaluación continua' },
  { tema: 'Pedro Camacho y el origen de PACIE en FATLA',      src: 'fatla.org',       foco: 'contexto histórico, fundador y evolución de la metodología' },
  { tema: 'Diferencias entre educación virtual y presencial', src: 'pacie.education', foco: 'ventajas, limitaciones y paradigmas según PACIE' },
  { tema: 'Herramientas tecnológicas recomendadas por PACIE', src: 'pacie.education', foco: 'LMS, herramientas de comunicación y recursos digitales validados' },
  { tema: 'Evaluación y rol del tutor virtual en PACIE',      src: 'fatla.org',       foco: 'acompañamiento, retroalimentación y responsabilidades del tutor virtual' },
  { tema: 'Protocolo Genesis-IAG: IA en evaluación PACIE',    src: 'asomtv.org',      foco: 'integración de inteligencia artificial generativa en entornos PACIE' },
  { tema: 'PACIE aplicado: casos reales FATLA y ASOMTV',      src: 'asomtv.org',      foco: 'proyectos implementados, resultados medibles y lecciones aprendidas' },
];

/* ════════════════════════════════════════════════════════════
   § 2 — BANCO OFFLINE (fallback sin conexión)
   7 lecciones que cubren las 3 fuentes y las 5 fases
════════════════════════════════════════════════════════════ */
const LECCIONES_OFFLINE = [
  {
    src: 'fatla.org', sColor: '#38bdf8', lColor: '#7dd3fc',
    tema: 'Las 5 Fases de la Metodología PACIE',
    pags: [
      { h: 'intro', c: [
        { t: 'p', x: 'PACIE (<b>Presencia · Alcance · Capacitación · Interacción · E-learning</b>) es el modelo tecnopedagógico creado por Planeta FATLA para diseñar Entornos Virtuales de Aprendizaje de calidad.' },
        { t: 'hl', x: '"PACIE no es una moda tecnológica: es una filosofía de diseño centrada en el aprendizaje humano." — Pedro Camacho, fundador de FATLA' },
        { t: 'tags', x: [{ l: 'FATLA', b: 'rgba(56,189,248,.1)', c: '#38bdf8' }, { l: 'Metodología PACIE', b: 'rgba(240,192,64,.1)', c: '#f0c040' }] }
      ]},
      { h: 'lista', intro: 'Las 5 fases funcionan como sistema integrado:', items: [
        { d: '#38bdf8', ic: 'P', lb: 'Presencia',    tx: 'Construye la identidad visual, motivacional e institucional del EVA.' },
        { d: '#f0c040', ic: 'A', lb: 'Alcance',      tx: 'Define con precisión los contenidos y competencias del entorno virtual.' },
        { d: '#a78bfa', ic: 'C', lb: 'Capacitación', tx: 'Forma al docente en el uso pedagógico y técnico de las tecnologías.' },
        { d: '#fb7185', ic: 'I', lb: 'Interacción',  tx: 'Genera aprendizaje colaborativo real mediante actividades grupales.' },
        { d: '#34d399', ic: 'E', lb: 'E-learning',   tx: 'Integra todo en un proceso educativo continuo, evaluado y mejorable.' }
      ]},
      { h: 'cierre', c: [
        { t: 'hl', x: 'La clave de PACIE: primero diseñas la interacción, luego produces el contenido. Nunca al revés.' },
        { t: 'p',  x: 'Un EVA que sigue PACIE en sus 5 fases garantiza motivación, pertinencia y aprendizaje real.' },
        { t: 'nota', fuente: 'fatla.org', sec: 'Guía PACIE · Fundamentos Generales' }
      ]}
    ]
  },
  {
    src: 'fatla.org', sColor: '#38bdf8', lColor: '#7dd3fc',
    tema: 'Presencia y Alcance: las bases del diseño virtual',
    pags: [
      { h: 'intro', c: [
        { t: 'p', x: '<b>Presencia</b> es la primera impresión del EVA: determina si el estudiante confía o abandona. <b>Alcance</b> define con rigor qué se enseña y qué no, evitando la sobrecarga cognitiva.' },
        { t: 'hl', x: '"El error más frecuente: llenar el aula virtual de recursos sin preguntarse primero para qué sirve cada uno." — Planeta FATLA' },
        { t: 'tags', x: [{ l: 'Fase 1', b: 'rgba(56,189,248,.1)', c: '#38bdf8' }, { l: 'Fase 2', b: 'rgba(240,192,64,.1)', c: '#f0c040' }] }
      ]},
      { h: 'lista', intro: 'Elementos esenciales de Presencia:', items: [
        { d: '#38bdf8', ic: 'I', lb: 'Identidad institucional', tx: 'Logos, colores y tipografías que comunican la marca del curso.' },
        { d: '#f0c040', ic: 'M', lb: 'Mensaje de bienvenida',   tx: 'Video o texto que integra y motiva al estudiante desde el día 1.' },
        { d: '#a78bfa', ic: 'N', lb: 'Navegación intuitiva',    tx: 'Estructura clara que el estudiante entiende sin instrucciones.' },
        { d: '#34d399', ic: 'C', lb: 'Contacto visible',        tx: 'Canales claros para resolver dudas administrativas y pedagógicas.' }
      ]},
      { h: 'cierre', c: [
        { t: 'hl', x: 'Alcance responde la pregunta clave: ¿qué DEBE aprender el estudiante en este espacio virtual y qué puede aprender solo?' },
        { t: 'nota', fuente: 'fatla.org', sec: 'Módulo Presencia–Alcance · fatla.org' }
      ]}
    ]
  },
  {
    src: 'pacie.education', sColor: '#a78bfa', lColor: '#c4b5fd',
    tema: 'Capacitación e Interacción: el corazón del aprendizaje virtual',
    pags: [
      { h: 'intro', c: [
        { t: 'p', x: '<b>Capacitación</b> forma al docente no solo en herramientas, sino en pedagogía digital. <b>Interacción</b> transforma el EVA de repositorio en comunidad viva de construcción del conocimiento.' },
        { t: 'hl', x: '"Un docente no capacitado tecnopedagógicamente construirá un aula virtual que solo imita al aula presencial." — pacie.education' },
        { t: 'tags', x: [{ l: 'Fase 3', b: 'rgba(167,139,250,.1)', c: '#a78bfa' }, { l: 'Fase 4', b: 'rgba(251,113,133,.1)', c: '#fb7185' }] }
      ]},
      { h: 'lista', intro: 'Tres tipos de interacción en PACIE:', items: [
        { d: '#38bdf8', ic: 'E↔E', lb: 'Estudiante ↔ Estudiante', tx: 'Foros, wikis y proyectos grupales para coconstruir conocimiento.' },
        { d: '#f0c040', ic: 'E↔D', lb: 'Estudiante ↔ Docente',    tx: 'Retroalimentación personalizada y tutorías oportunas.' },
        { d: '#a78bfa', ic: 'E↔C', lb: 'Estudiante ↔ Contenido',  tx: 'Actividades interactivas que superan la lectura pasiva.' }
      ]},
      { h: 'cierre', c: [
        { t: 'hl', x: 'Sin interacción de calidad, el EVA es solo un depósito digital de archivos. La interacción es la razón de ser del aula virtual.' },
        { t: 'nota', fuente: 'pacie.education', sec: 'Módulo Capacitación–Interacción · pacie.education' }
      ]}
    ]
  },
  {
    src: 'asomtv.org', sColor: '#f0c040', lColor: '#fbbf24',
    tema: 'Protocolo Genesis-IAG: evaluación con Inteligencia Artificial',
    pags: [
      { h: 'intro', c: [
        { t: 'p', x: 'El <b>Protocolo Genesis-IAG</b>, avalado por ASOMTV y Planeta FATLA, integra la Inteligencia Artificial Generativa como motor de evaluación continua y personalizada en entornos PACIE.' },
        { t: 'hl', x: '"La IAG no reemplaza al docente. Amplifica su capacidad de retroalimentación a escala individual, algo imposible en el modelo presencial." — ASOMTV' },
        { t: 'tags', x: [{ l: 'Genesis-IAG', b: 'rgba(240,192,64,.1)', c: '#f0c040' }, { l: 'ASOMTV', b: 'rgba(251,113,133,.1)', c: '#fb7185' }] }
      ]},
      { h: 'lista', intro: 'Tres niveles de evaluación IAG:', items: [
        { d: '#38bdf8', ic: 'D', lb: 'Diagnóstica', tx: 'Identifica el punto de partida antes de iniciar el módulo.' },
        { d: '#f0c040', ic: 'F', lb: 'Formativa',   tx: 'Acompaña con preguntas dinámicas y retroalimentación inmediata.' },
        { d: '#34d399', ic: 'S', lb: 'Sumativa',    tx: 'Certifica el logro de competencias definidas en el Alcance.' }
      ]},
      { h: 'cierre', c: [
        { t: 'hl', x: 'Genesis-IAG genera lecciones y preguntas desde fuentes oficiales PACIE en tiempo real — cada sesión es única y actualizada.' },
        { t: 'nota', fuente: 'asomtv.org', sec: 'Protocolo Genesis-IAG · asomtv.org' }
      ]}
    ]
  },
  {
    src: 'pacie.education', sColor: '#a78bfa', lColor: '#c4b5fd',
    tema: 'E-learning PACIE: madurez pedagógica y sostenibilidad del EVA',
    pags: [
      { h: 'intro', c: [
        { t: 'p', x: 'La fase <b>E-learning</b> es la culminación de PACIE. Integra todo el proceso en un sistema educativo continuo, evaluado y capaz de mejorarse en cada cohorte.' },
        { t: 'hl', x: '"E-learning de calidad no es tecnología con contenido: es pedagogía potenciada con tecnología." — pacie.education' },
        { t: 'tags', x: [{ l: 'Fase 5 PACIE', b: 'rgba(52,211,153,.1)', c: '#34d399' }, { l: 'E-learning', b: 'rgba(167,139,250,.1)', c: '#a78bfa' }] }
      ]},
      { h: 'lista', intro: 'Cuatro indicadores de E-learning de calidad:', items: [
        { d: '#38bdf8', ic: 'C', lb: 'Continuidad',     tx: 'El aprendizaje no se detiene: el EVA está disponible 24/7.' },
        { d: '#f0c040', ic: 'E', lb: 'Evaluación',      tx: 'La evaluación es parte del aprendizaje, no solo su final.' },
        { d: '#a78bfa', ic: 'P', lb: 'Personalización', tx: 'Cada estudiante avanza a su ritmo con rutas adaptativas.' },
        { d: '#34d399', ic: 'M', lb: 'Mejora continua', tx: 'El docente revisa y optimiza el EVA en cada ciclo académico.' }
      ]},
      { h: 'cierre', c: [
        { t: 'hl', x: 'PACIE convierte el E-learning en un sistema vivo: cada ciclo genera datos que mejoran el siguiente EVA.' },
        { t: 'nota', fuente: 'pacie.education', sec: 'Módulo E-learning · pacie.education' }
      ]}
    ]
  },
  {
    src: 'fatla.org', sColor: '#38bdf8', lColor: '#7dd3fc',
    tema: 'El rol del tutor virtual según PACIE',
    pags: [
      { h: 'intro', c: [
        { t: 'p', x: 'En PACIE el tutor virtual no es un transmisor de información: es un <b>facilitador del aprendizaje colaborativo</b>. Su rol cambia radicalmente respecto a la educación presencial.' },
        { t: 'hl', x: '"El tutor PACIE habla menos y pregunta más. Su silencio estratégico provoca pensamiento." — Planeta FATLA' },
        { t: 'tags', x: [{ l: 'Tutor virtual', b: 'rgba(56,189,248,.1)', c: '#38bdf8' }, { l: 'Rol docente', b: 'rgba(52,211,153,.1)', c: '#34d399' }] }
      ]},
      { h: 'lista', intro: 'Las 4 funciones del tutor PACIE:', items: [
        { d: '#38bdf8', ic: 'F', lb: 'Facilitador',  tx: 'Guía sin imponer, provoca reflexión mediante preguntas estratégicas.' },
        { d: '#f0c040', ic: 'E', lb: 'Evaluador',    tx: 'Retroalimenta de forma oportuna, personalizada y constructiva.' },
        { d: '#a78bfa', ic: 'D', lb: 'Diseñador',    tx: 'Crea actividades de alto valor pedagógico antes de producir contenido.' },
        { d: '#34d399', ic: 'A', lb: 'Acompañante',  tx: 'Detecta estudiantes en riesgo y actúa proactivamente.' }
      ]},
      { h: 'cierre', c: [
        { t: 'hl', x: 'Un tutor PACIE dedica el 80% de su energía a la interacción y el 20% al contenido. En educación presencial la proporción es inversa.' },
        { t: 'nota', fuente: 'fatla.org', sec: 'Módulo Tutor Virtual · fatla.org' }
      ]}
    ]
  },
  {
    src: 'asomtv.org', sColor: '#f0c040', lColor: '#fbbf24',
    tema: 'ASOMTV y la certificación internacional PACIE',
    pags: [
      { h: 'intro', c: [
        { t: 'p', x: '<b>ASOMTV</b> (Asociación Mundial de Tutores Virtuales) es el organismo que avala los certificados emitidos por Fatlin AI. Junto con Planeta FATLA, garantiza la validez internacional del proceso formativo.' },
        { t: 'hl', x: '"La certificación PACIE no certifica que cursaste un módulo: certifica que demostraste competencia real." — ASOMTV' },
        { t: 'tags', x: [{ l: 'ASOMTV', b: 'rgba(240,192,64,.1)', c: '#f0c040' }, { l: 'Certificación', b: 'rgba(52,211,153,.1)', c: '#34d399' }] }
      ]},
      { h: 'lista', intro: 'Tres niveles de certificación PACIE:', items: [
        { d: '#38bdf8', ic: '1', lb: 'Iniciado PACIE',    tx: 'Domina los fundamentos de las 5 fases PACIE (niveles 1–80).' },
        { d: '#a78bfa', ic: '2', lb: 'Practicante PACIE', tx: 'Aplica PACIE en diseño de EVAs reales (niveles 81–160).' },
        { d: '#f0c040', ic: '3', lb: 'Experto PACIE',     tx: 'Diseña y evalúa entornos PACIE con IA integrada (nivel 161+).' }
      ]},
      { h: 'cierre', c: [
        { t: 'hl', x: 'Fatlin AI es el primer evaluador con IA en Iberoamérica avalado por FATLA y ASOMTV para certificar competencias PACIE.' },
        { t: 'nota', fuente: 'asomtv.org', sec: 'Marco de Certificación · asomtv.org' }
      ]}
    ]
  }
];

/* ════════════════════════════════════════════════════════════
   § 3 — ESTADO INTERNO
════════════════════════════════════════════════════════════ */
const _estado = {
  leccionActual : null,
  paginaActual  : 0,
  cargando      : false,
  topicIndex    : -1,
};

/* ════════════════════════════════════════════════════════════
   § 4 — CACHÉ LOCAL (localStorage, TTL 6h)
════════════════════════════════════════════════════════════ */
function _cacheGet() {
  try {
    const raw = localStorage.getItem(LEC_CACHE_KEY);
    if (!raw) return [];
    const now = Date.now();
    return (JSON.parse(raw) || []).filter(l => l._ts && (now - l._ts) < LEC_CACHE_TTL);
  } catch (e) { return []; }
}

function _cachePush(leccion) {
  try {
    const cache = _cacheGet().filter(l => l.tema !== leccion.tema);
    cache.push({ ...leccion, _ts: Date.now() });
    localStorage.setItem(LEC_CACHE_KEY, JSON.stringify(cache.slice(-LEC_MAX_CACHED)));
  } catch (e) {}
}

/* ════════════════════════════════════════════════════════════
   § 5 — SELECCIÓN DE TEMA (rotativo, varía por hora y nivel)
════════════════════════════════════════════════════════════ */
function _pickTopic() {
  const level = (typeof game !== 'undefined' && game.level) ? game.level : 1;
  // Rota cada 30 min, desplazado por nivel del jugador
  let idx = (Math.floor(Date.now() / (30 * 60 * 1000)) + level) % LEC_TOPICS.length;
  if (idx === _estado.topicIndex) idx = (idx + 1) % LEC_TOPICS.length;
  _estado.topicIndex = idx;
  return LEC_TOPICS[idx];
}

/* ════════════════════════════════════════════════════════════
   § 6 — TOKEN FIREBASE (reutiliza el patrón de main.js)
════════════════════════════════════════════════════════════ */
async function _getToken() {
  for (let i = 0; i < 3; i++) {
    try {
      const u = (typeof game !== 'undefined' && game.user)
              ? game.user
              : (typeof auth !== 'undefined' ? auth.currentUser : null);
      if (u) return await u.getIdToken();
    } catch (e) {}
    await new Promise(r => setTimeout(r, 700));
  }
  return null;
}

/* ════════════════════════════════════════════════════════════
   § 7 — LLAMADA A CLAUDE (igual patrón que main.js)
════════════════════════════════════════════════════════════ */
async function _fetchDeClaude(topicEntry) {
  const endpoint = (typeof CLAUDE_ENDPOINT !== 'undefined')
    ? CLAUDE_ENDPOINT
    : 'https://us-central1-fatlin.cloudfunctions.net/claudeProxy';

  const token = await _getToken();
  if (!token) throw new Error('Sin token');

  // Reusar PACIE_SOURCE_GROUPS de main.js si está disponible
  let sourcesStr = 'fatla.org, pacie.education, asomtv.org';
  if (typeof PACIE_SOURCE_GROUPS !== 'undefined') {
    sourcesStr = Object.entries(PACIE_SOURCE_GROUPS)
      .map(([, g]) => `[${g.label}]: ${g.urls.slice(0, 3).join(', ')}`)
      .join(' | ');
  }

  const systemPrompt =
    `Eres un experto en Metodología PACIE (Planeta FATLA). ` +
    `Consulta OBLIGATORIAMENTE las fuentes con web_search: ${sourcesStr}. ` +
    `Genera una lección educativa en JSON puro. Sin markdown ni backticks.`;

  const userPrompt =
    `Genera una lección sobre: "${topicEntry.tema}" ` +
    `(foco: ${topicEntry.foco}, fuente principal: ${topicEntry.src}). ` +
    `\nResponde SOLO con este JSON exacto (rellena los valores con contenido real de las fuentes):` +
    `\n{"src":"${topicEntry.src}","tema":"${topicEntry.tema}","pags":[` +
    `{"h":"intro","c":[` +
      `{"t":"p","x":"2-3 oraciones con concepto clave en <b>negrita</b>"},` +
      `{"t":"hl","x":"cita o principio clave extraído de la fuente, entre comillas, atribuido"},` +
      `{"t":"tags","x":[{"l":"etiqueta1","b":"rgba(56,189,248,.1)","c":"#38bdf8"},{"l":"etiqueta2","b":"rgba(240,192,64,.1)","c":"#f0c040"}]}` +
    `]},` +
    `{"h":"lista","intro":"frase introductoria","items":[` +
      `{"d":"#38bdf8","ic":"1","lb":"Concepto A","tx":"descripción práctica y concreta"},` +
      `{"d":"#f0c040","ic":"2","lb":"Concepto B","tx":"descripción práctica y concreta"},` +
      `{"d":"#a78bfa","ic":"3","lb":"Concepto C","tx":"descripción práctica y concreta"},` +
      `{"d":"#34d399","ic":"4","lb":"Concepto D","tx":"descripción práctica y concreta"}` +
    `]},` +
    `{"h":"cierre","c":[` +
      `{"t":"hl","x":"principio clave que el estudiante debe recordar"},` +
      `{"t":"p","x":"implicación práctica para el tutor virtual"},` +
      `{"t":"nota","fuente":"${topicEntry.src}","sec":"sección consultada"}` +
    `]}]}`;

  const res = await fetch(endpoint, {
    method : 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body   : JSON.stringify({
      model      : 'claude-sonnet-4-20250514',
      max_tokens : 1800,
      system     : systemPrompt,
      tools      : [{ type: 'web_search_20250305', name: 'web_search' }],
      messages   : [{ role: 'user', content: userPrompt }]
    })
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const text  = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  const clean = text.replace(/```json|```/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Sin JSON');

  const parsed = JSON.parse(match[0]);
  if (!parsed.tema || !Array.isArray(parsed.pags) || parsed.pags.length < 2)
    throw new Error('Estructura inválida');

  const meta = SRC_META[parsed.src] || SRC_META['fatla.org'];
  return { ...parsed, sColor: meta.sColor, lColor: meta.lColor };
}

/* ════════════════════════════════════════════════════════════
   § 8 — LECCIÓN OFFLINE ALEATORIA (sin repetir la actual)
════════════════════════════════════════════════════════════ */
function _offline() {
  const cur = _estado.leccionActual?.tema;
  const pool = cur
    ? LECCIONES_OFFLINE.filter(l => l.tema !== cur)
    : LECCIONES_OFFLINE;
  return pool[Math.floor(Math.random() * pool.length)] || LECCIONES_OFFLINE[0];
}

/* ════════════════════════════════════════════════════════════
   § 9 — RENDER DE PÁGINA
════════════════════════════════════════════════════════════ */
function _render(p) {
  if (p.h === 'lista') {
    let h = `<p class="lec-p" style="margin-bottom:6px">${p.intro || ''}</p><div class="lec-list">`;
    (p.items || []).forEach(it => {
      h += `<div class="lec-it">
        <div class="lec-it-dot" style="background:${it.d}22;color:${it.d}">${it.ic}</div>
        <div class="lec-it-txt"><b>${it.lb}:</b> ${it.tx}</div>
      </div>`;
    });
    return h + '</div>';
  }
  let h = '';
  (p.c || []).forEach(it => {
    if (it.t === 'p')
      h += `<p class="lec-p">${it.x}</p>`;
    else if (it.t === 'hl')
      h += `<div class="lec-hl">${it.x}</div>`;
    else if (it.t === 'tags') {
      h += '<div class="lec-tags">';
      (it.x || []).forEach(tg =>
        h += `<span class="lec-tag" style="background:${tg.b};color:${tg.c}">${tg.l}</span>`
      );
      h += '</div>';
    } else if (it.t === 'nota')
      h += `<div class="lec-nota">
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="flex-shrink:0;margin-top:1px">
          <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,.25)" stroke-width="1"/>
          <line x1="6" y1="4" x2="6" y2="7.5" stroke="rgba(255,255,255,.25)" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
        <span>Fuente: <b style="color:rgba(255,255,255,.5)">${it.fuente}</b> — ${it.sec}</span>
      </div>`;
  });
  return h;
}

/* ════════════════════════════════════════════════════════════
   § 10 — ACTUALIZAR MODAL (con lección cargada)
════════════════════════════════════════════════════════════ */
function _update() {
  const l = _estado.leccionActual;
  const p = l.pags[_estado.paginaActual];
  const tot = l.pags.length;
  const $ = id => document.getElementById(id);

  if ($('lec-dot'))  $('lec-dot').style.background = l.sColor;
  if ($('lec-lbl'))  { $('lec-lbl').style.color = l.lColor; $('lec-lbl').textContent = l.src; }
  if ($('lec-tema')) $('lec-tema').textContent = l.tema;
  if ($('lec-body')) $('lec-body').innerHTML = _render(p);
  if ($('lec-pg'))   $('lec-pg').textContent = `${_estado.paginaActual + 1} / ${tot}`;
  if ($('lec-ant'))  $('lec-ant').disabled = _estado.paginaActual === 0;
  if ($('lec-sig'))  $('lec-sig').disabled = _estado.paginaActual === tot - 1;
  if ($('lec-pgbar'))
    $('lec-pgbar').innerHTML = l.pags.map((_, i) =>
      `<div class="lec-pgs ${i === _estado.paginaActual ? 'on' : i < _estado.paginaActual ? 'past' : 'off'}"></div>`
    ).join('');
}

/* ════════════════════════════════════════════════════════════
   § 11 — SPINNER DE CARGA
════════════════════════════════════════════════════════════ */
function _spinner(src) {
  const meta = SRC_META[src] || SRC_META['fatla.org'];
  const $ = id => document.getElementById(id);
  if ($('lec-dot'))  $('lec-dot').style.background = meta.sColor;
  if ($('lec-lbl'))  { $('lec-lbl').style.color = meta.lColor; $('lec-lbl').textContent = src; }
  if ($('lec-tema')) $('lec-tema').textContent = 'Consultando fuentes PACIE…';
  if ($('lec-pgbar')) $('lec-pgbar').innerHTML = '';
  if ($('lec-pg'))   $('lec-pg').textContent = '';
  if ($('lec-ant'))  $('lec-ant').disabled = true;
  if ($('lec-sig'))  $('lec-sig').disabled = true;
  if ($('lec-body'))
    $('lec-body').innerHTML = `
      <style>@keyframes lecSpin{to{transform:rotate(360deg)}}</style>
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
                  flex:1;gap:14px;padding:32px 0;min-height:180px;">
        <div style="width:34px;height:34px;border-radius:50%;
                    border:3px solid rgba(56,189,248,.12);border-top-color:${meta.sColor};
                    animation:lecSpin .8s linear infinite;"></div>
        <p style="font-size:11px;color:rgba(255,255,255,.4);text-align:center;line-height:1.7">
          Consultando <b style="color:${meta.lColor}">${src}</b><br>
          <span style="font-size:10px;opacity:.7">buscando contenido actualizado…</span>
        </p>
      </div>`;
}

/* ════════════════════════════════════════════════════════════
   § 12 — API PÚBLICA
════════════════════════════════════════════════════════════ */

/**
 * Abre el modal. Flujo: caché válida → Claude en vivo → banco offline
 */
window.abrirLeccion = async function () {
  if (_estado.cargando) return;
  const modal = document.getElementById('modal-leccion');
  if (!modal) return;

  _estado.cargando     = true;
  _estado.paginaActual = 0;

  const topic = _pickTopic();
  _spinner(topic.src);
  modal.classList.remove('hidden');

  try {
    // ── 1. Caché local válida (< 6h) ─────────────────────────
    const cached = _cacheGet();
    const curTema = _estado.leccionActual?.tema;
    const hit = cached.find(l => l.tema !== curTema && l.src === topic.src)
             || cached.find(l => l.tema !== curTema)
             || null;

    if (hit) {
      console.log('[Leccion v2] Caché:', hit.tema);
      _estado.leccionActual = hit;
      _update();
      _estado.cargando = false;
      // Prefetch silencioso para reponer caché
      setTimeout(_prefetch, 3000);
      return;
    }

    // ── 2. Claude en vivo ─────────────────────────────────────
    console.log('[Leccion v2] Claude →', topic.tema);
    const lec = await _fetchDeClaude(topic);
    _estado.leccionActual = lec;
    _update();
    _cachePush(lec);

  } catch (err) {
    // ── 3. Fallback offline ───────────────────────────────────
    console.warn('[Leccion v2] Offline:', err.message);
    _estado.leccionActual = _offline();
    _update();
    // Badge "sin conexión" discreto al final del body
    const body = document.getElementById('lec-body');
    if (body) body.insertAdjacentHTML('beforeend',
      `<div style="display:flex;align-items:center;gap:5px;margin-top:8px;padding:5px 8px;
                   border-radius:6px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)">
        <span style="font-size:9px">📶</span>
        <span style="font-size:9px;color:rgba(255,255,255,.22)">Contenido local · se actualizará con conexión</span>
      </div>`);
  }

  _estado.cargando = false;
};

/** Cierra el modal */
window.cerrarLeccion = function () {
  const m = document.getElementById('modal-leccion');
  if (m) m.classList.add('hidden');
};

/** Navega entre páginas */
window.navLeccion = function (d) {
  if (!_estado.leccionActual) return;
  const tot = _estado.leccionActual.pags.length;
  _estado.paginaActual = Math.max(0, Math.min(tot - 1, _estado.paginaActual + d));
  _update();
};

/* ════════════════════════════════════════════════════════════
   § 13 — PREFETCH BACKGROUND (rellena caché sin interrumpir)
════════════════════════════════════════════════════════════ */
async function _prefetch() {
  try {
    if (_cacheGet().length >= LEC_MIN_PREFETCH) return;
    const lec = await _fetchDeClaude(_pickTopic());
    _cachePush(lec);
    console.log('[Leccion v2] Prefetch OK:', lec.tema);
  } catch (e) { /* silencioso */ }
}

/* ════════════════════════════════════════════════════════════
   § 14 — INIT
════════════════════════════════════════════════════════════ */
(function () {
  function setup() {
    const modal = document.getElementById('modal-leccion');
    if (modal) modal.addEventListener('click', e => {
      if (e.target === modal) window.cerrarLeccion();
    });
    // Prefetch silencioso 12s después de carga (sin competir con main.js)
    setTimeout(() => { if (navigator.onLine) _prefetch(); }, 12000);
    console.log('[Leccion v2] ✅ Sistema dinámico listo');
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', setup)
    : setup();
})();
