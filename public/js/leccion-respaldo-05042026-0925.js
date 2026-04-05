/* ═══════════════════════════════════════════════════════════════
   Fatlin AI — leccion.js  v1.0
   Sistema de Lecciones por Fuente PACIE

   Flujo:
     1. FAB "Ver lección" aparece sobre el mapa (bottom-right del .g-map)
     2. Al pulsar → abre #modal-leccion (inset:0 dentro de .g-map)
     3. Modal muestra: fuente · tema · barra páginas · contenido · controles
     4. "Jugar ›" o "✕" cierran y vuelven al mapa sin tocar HUD ni sidebar

   Integración en index.html:
     • Añadir el HTML del FAB y del modal (ver leccion-html-snippet.html)
     • Cargar este script: <script src="js/leccion.js?v=1"></script>
     • Se auto-inicializa en DOMContentLoaded
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ════════════════════════════════════════════════════════════
   § 1 — BASE DE CONOCIMIENTO PACIE
   Fuentes: fatla.org · pacie.education · asomtv.org
════════════════════════════════════════════════════════════ */
const LECCIONES = [

  /* ── FATLA.ORG ── */
  {
    src: 'fatla.org',
    sColor: '#38bdf8',
    lColor: '#7dd3fc',
    tema: 'Alcance pedagógico en la Metodología PACIE',
    pags: [
      {
        h: 'intro',
        c: [
          { t: 'p', x: 'El <b>Alcance</b> es la segunda fase de PACIE. Define con precisión qué contenidos y actividades formarán parte del entorno virtual, evitando la sobrecarga cognitiva.' },
          { t: 'hl', x: '"El Alcance no es cuánto se enseña, sino qué se elige enseñar. La precisión pedagógica es la mayor virtud del diseñador virtual." — Planeta FATLA' },
          { t: 'tags', x: [{ l: 'Fase 2 PACIE', b: 'rgba(56,189,248,.1)', c: '#38bdf8' }, { l: 'Diseño curricular', b: 'rgba(240,192,64,.1)', c: '#f0c040' }] }
        ]
      },
      {
        h: 'lista',
        intro: 'Tres principios estructuran el Alcance:',
        items: [
          { d: '#38bdf8', ic: 'P', lb: 'Pertinencia',     tx: 'Responde a necesidades de aprendizaje reales y verificables.' },
          { d: '#f0c040', ic: 'P', lb: 'Profundidad',     tx: 'Prioriza comprensión profunda sobre cobertura superficial.' },
          { d: '#a78bfa', ic: 'S', lb: 'Secuencialidad',  tx: 'De menor a mayor complejidad cognitiva.' }
        ]
      },
      {
        h: 'cierre',
        c: [
          { t: 'hl',   x: 'Regla PACIE: lo que el estudiante puede aprender fuera del aula virtual no debe ocupar espacio dentro de ella.' },
          { t: 'p',    x: 'Un buen Alcance libera el tiempo de interacción para actividades de alto valor pedagógico.' },
          { t: 'nota', fuente: 'fatla.org', sec: 'Módulo Alcance · Sección 2.3' }
        ]
      }
    ]
  },

  /* ── FATLA.ORG — Presencia ── */
  {
    src: 'fatla.org',
    sColor: '#38bdf8',
    lColor: '#7dd3fc',
    tema: 'Presencia digital en la Metodología PACIE',
    pags: [
      {
        h: 'intro',
        c: [
          { t: 'p', x: 'La <b>Presencia</b> es la primera fase de PACIE. Establece la identidad visual, comunicacional e institucional del Entorno Virtual de Aprendizaje (EVA).' },
          { t: 'hl', x: '"Sin presencia no hay identidad, y sin identidad no hay confianza para aprender." — Planeta FATLA' },
          { t: 'tags', x: [{ l: 'Fase 1 PACIE', b: 'rgba(56,189,248,.1)', c: '#38bdf8' }, { l: 'Identidad digital', b: 'rgba(52,211,153,.1)', c: '#34d399' }] }
        ]
      },
      {
        h: 'lista',
        intro: 'Cuatro elementos clave de Presencia:',
        items: [
          { d: '#38bdf8', ic: 'I', lb: 'Identidad institucional', tx: 'Logos, colores y tipografías coherentes con la institución.' },
          { d: '#f0c040', ic: 'N', lb: 'Navegación clara',        tx: 'Menús intuitivos que guían al estudiante sin confusión.' },
          { d: '#a78bfa', ic: 'B', lb: 'Bienvenida efectiva',     tx: 'Mensaje inicial que motiva e integra al participante.' },
          { d: '#34d399', ic: 'I', lb: 'Información de contacto', tx: 'Canales claros para dudas administrativas y pedagógicas.' }
        ]
      },
      {
        h: 'cierre',
        c: [
          { t: 'hl',   x: 'La Presencia es la primera impresión del EVA: determina si el estudiante confía o abandona.' },
          { t: 'p',    x: 'Un EVA con Presencia sólida genera sentido de pertenencia y reduce la deserción virtual.' },
          { t: 'nota', fuente: 'fatla.org', sec: 'Módulo Presencia · Sección 1.1' }
        ]
      }
    ]
  },

  /* ── FATLA.ORG — Interacción ── */
  {
    src: 'fatla.org',
    sColor: '#38bdf8',
    lColor: '#7dd3fc',
    tema: 'Interacción en la Metodología PACIE',
    pags: [
      {
        h: 'intro',
        c: [
          { t: 'p', x: 'La <b>Interacción</b> es la cuarta fase de PACIE. Es el corazón del aprendizaje colaborativo: transforma el EVA de un repositorio en una comunidad de construcción del conocimiento.' },
          { t: 'hl', x: '"La interacción no es un extra pedagógico; es la razón de ser del aula virtual." — Planeta FATLA' },
          { t: 'tags', x: [{ l: 'Fase 4 PACIE', b: 'rgba(251,113,133,.1)', c: '#fb7185' }, { l: 'Aprendizaje colaborativo', b: 'rgba(56,189,248,.1)', c: '#38bdf8' }] }
        ]
      },
      {
        h: 'lista',
        intro: 'Tres tipos de interacción en PACIE:',
        items: [
          { d: '#38bdf8', ic: 'E-E', lb: 'Estudiante–Estudiante', tx: 'Foros, wikis y actividades grupales que generan coconstrucción.' },
          { d: '#f0c040', ic: 'E-D', lb: 'Estudiante–Docente',    tx: 'Retroalimentación personalizada y tutorías sincrónicas/asincrónicas.' },
          { d: '#a78bfa', ic: 'E-C', lb: 'Estudiante–Contenido',  tx: 'Actividades interactivas que superan la simple lectura pasiva.' }
        ]
      },
      {
        h: 'cierre',
        c: [
          { t: 'hl',   x: 'Sin interacción de calidad, el EVA es solo un depósito digital de materiales.' },
          { t: 'p',    x: 'La Interacción PACIE se diseña antes de producir contenido: primero la actividad, luego el recurso.' },
          { t: 'nota', fuente: 'fatla.org', sec: 'Módulo Interacción · Sección 4.2' }
        ]
      }
    ]
  },

  /* ── PACIE.EDUCATION ── */
  {
    src: 'pacie.education',
    sColor: '#a78bfa',
    lColor: '#c4b5fd',
    tema: 'Las cinco fases de la Metodología PACIE',
    pags: [
      {
        h: 'intro',
        c: [
          { t: 'p', x: 'PACIE es un modelo tecnopedagógico creado por Planeta FATLA para construir Entornos Virtuales de Aprendizaje (EVA) de alta calidad educativa.' },
          { t: 'hl', x: 'PACIE garantiza que el entorno virtual sea un espacio vivo de construcción del conocimiento, no un simple repositorio de archivos.' },
          { t: 'tags', x: [{ l: 'Presencia', b: 'rgba(56,189,248,.1)', c: '#38bdf8' }, { l: 'Alcance', b: 'rgba(240,192,64,.1)', c: '#f0c040' }, { l: 'Capacitación', b: 'rgba(167,139,250,.1)', c: '#a78bfa' }] }
        ]
      },
      {
        h: 'lista',
        intro: 'Sus cinco fases funcionan como sistema integrado:',
        items: [
          { d: '#38bdf8', ic: 'P', lb: 'Presencia',     tx: 'Construye identidad digital e institucional del entorno.' },
          { d: '#f0c040', ic: 'A', lb: 'Alcance',       tx: 'Define la cobertura curricular adecuada para el espacio virtual.' },
          { d: '#a78bfa', ic: 'C', lb: 'Capacitación',  tx: 'Forma al docente en el uso pedagógico de las tecnologías.' },
          { d: '#fb7185', ic: 'I', lb: 'Interacción',   tx: 'Genera aprendizaje colaborativo real mediante actividades.' },
          { d: '#34d399', ic: 'E', lb: 'E-learning',    tx: 'Integra todo en un proceso educativo continuo y evaluado.' }
        ]
      }
    ]
  },

  /* ── PACIE.EDUCATION — Capacitación ── */
  {
    src: 'pacie.education',
    sColor: '#a78bfa',
    lColor: '#c4b5fd',
    tema: 'Capacitación docente en la Metodología PACIE',
    pags: [
      {
        h: 'intro',
        c: [
          { t: 'p', x: 'La <b>Capacitación</b> es la tercera fase de PACIE. Forma al docente no solo en el uso técnico de plataformas, sino en la pedagogía digital y el diseño instruccional virtual.' },
          { t: 'hl', x: '"Un docente no capacitado tecnopedagógicamente construirá un aula virtual que solo imita al aula presencial." — pacie.education' },
          { t: 'tags', x: [{ l: 'Fase 3 PACIE', b: 'rgba(167,139,250,.1)', c: '#a78bfa' }, { l: 'Formación docente', b: 'rgba(52,211,153,.1)', c: '#34d399' }] }
        ]
      },
      {
        h: 'lista',
        intro: 'Tres dimensiones de la Capacitación PACIE:',
        items: [
          { d: '#38bdf8', ic: 'T', lb: 'Técnica',        tx: 'Dominio de la plataforma LMS y sus herramientas de comunicación.' },
          { d: '#a78bfa', ic: 'P', lb: 'Pedagógica',     tx: 'Diseño de actividades de alto valor cognitivo para entornos virtuales.' },
          { d: '#f0c040', ic: 'I', lb: 'Instruccional',  tx: 'Estructuración de secuencias de aprendizaje coherentes y motivadoras.' }
        ]
      },
      {
        h: 'cierre',
        c: [
          { t: 'hl',   x: 'La Capacitación es continua: el docente PACIE aprende mientras enseña y mejora su EVA en cada ciclo.' },
          { t: 'p',    x: 'Planeta FATLA provee formación certificada en PACIE para docentes de toda Iberoamérica.' },
          { t: 'nota', fuente: 'pacie.education', sec: 'Módulo Capacitación · Sección 3.1' }
        ]
      }
    ]
  },

  /* ── ASOMTV.ORG ── */
  {
    src: 'asomtv.org',
    sColor: '#f0c040',
    lColor: '#fbbf24',
    tema: 'Evaluación con IA',
    pags: [
      {
        h: 'intro',
        c: [
          { t: 'p', x: 'El <b>Protocolo Fatlin-IAG</b>, avalado por ASOMTV y Planeta FATLA, integra la Inteligencia Artificial Generativa como motor de evaluación continua en entornos PACIE.' },
          { t: 'hl', x: 'La IAG no reemplaza al docente. Amplifica su capacidad de retroalimentación personalizada a escala individual.' },
          { t: 'tags', x: [{ l: 'Genesis-IAG', b: 'rgba(240,192,64,.1)', c: '#f0c040' }, { l: 'ASOMTV', b: 'rgba(251,113,133,.1)', c: '#fb7185' }] }
        ]
      },
      {
        h: 'lista',
        intro: 'Tres niveles de evaluación complementarios:',
        items: [
          { d: '#38bdf8', ic: 'D', lb: 'Diagnóstica', tx: 'Identifica el punto de partida antes de iniciar el módulo.' },
          { d: '#f0c040', ic: 'F', lb: 'Formativa',   tx: 'Acompaña con preguntas dinámicas y retroalimentación inmediata.' },
          { d: '#34d399', ic: 'S', lb: 'Sumativa',    tx: 'Certifica el logro de competencias definidas en el Alcance.' }
        ]
      }
    ]
  },

  /* ── ASOMTV.ORG — E-learning ── */
  {
    src: 'asomtv.org',
    sColor: '#f0c040',
    lColor: '#fbbf24',
    tema: 'E-learning de calidad según PACIE',
    pags: [
      {
        h: 'intro',
        c: [
          { t: 'p', x: 'La fase de <b>E-learning</b> en PACIE integra todas las fases anteriores en un proceso educativo continuo, evaluado y mejorable. Es la etapa de síntesis y certificación.' },
          { t: 'hl', x: '"El E-learning de calidad no es tecnología con contenido; es pedagogía potenciada con tecnología." — ASOMTV' },
          { t: 'tags', x: [{ l: 'Fase 5 PACIE', b: 'rgba(52,211,153,.1)', c: '#34d399' }, { l: 'E-learning', b: 'rgba(240,192,64,.1)', c: '#f0c040' }] }
        ]
      },
      {
        h: 'lista',
        intro: 'Cuatro indicadores de E-learning de calidad PACIE:',
        items: [
          { d: '#38bdf8', ic: 'C', lb: 'Continuidad',     tx: 'El aprendizaje no se detiene: el EVA está disponible 24/7.' },
          { d: '#f0c040', ic: 'E', lb: 'Evaluación',      tx: 'La evaluación es parte del aprendizaje, no solo su final.' },
          { d: '#a78bfa', ic: 'P', lb: 'Personalización', tx: 'Cada estudiante avanza a su ritmo con rutas adaptativas.' },
          { d: '#34d399', ic: 'M', lb: 'Mejora continua', tx: 'El docente revisa y optimiza el EVA en cada cohorte.' }
        ]
      },
      {
        h: 'cierre',
        c: [
          { t: 'hl',   x: 'PACIE convierte el E-learning en un sistema vivo: cada ciclo genera datos que mejoran el siguiente.' },
          { t: 'p',    x: 'ASOMTV certifica docentes que implementan PACIE con estándares de calidad internacional.' },
          { t: 'nota', fuente: 'asomtv.org', sec: 'Módulo E-learning · Sección 5.4' }
        ]
      }
    ]
  }

];

/* ════════════════════════════════════════════════════════════
   § 2 — ESTADO INTERNO
════════════════════════════════════════════════════════════ */
let _leccionActual = 0;
let _paginaActual  = 0;

/* ════════════════════════════════════════════════════════════
   § 3 — RENDER DE PÁGINA
════════════════════════════════════════════════════════════ */
function _renderPagina(p) {
  if (p.h === 'lista') {
    let h = `<p class="lec-p" style="margin-bottom:6px">${p.intro}</p><div class="lec-list">`;
    p.items.forEach(it => {
      h += `<div class="lec-it">
              <div class="lec-it-dot" style="background:${it.d}18;color:${it.d}">${it.ic}</div>
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
      it.x.forEach(tg => {
        h += `<span class="lec-tag" style="background:${tg.b};color:${tg.c}">${tg.l}</span>`;
      });
      h += '</div>';
    }
    else if (it.t === 'nota')
      h += `<div class="lec-nota">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style="flex-shrink:0;margin-top:1px">
                <circle cx="6" cy="6" r="5" stroke="rgba(255,255,255,.2)" stroke-width="1"/>
                <line x1="6" y1="4" x2="6" y2="7.5" stroke="rgba(255,255,255,.2)" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              <span>Fuente: <b style="color:rgba(255,255,255,.45)">${it.fuente}</b> — ${it.sec}</span>
            </div>`;
  });
  return h;
}

/* ════════════════════════════════════════════════════════════
   § 4 — ACTUALIZAR MODAL
════════════════════════════════════════════════════════════ */
function _actualizarModal() {
  const l   = LECCIONES[_leccionActual];
  const p   = l.pags[_paginaActual];
  const tot = l.pags.length;

  const dot  = document.getElementById('lec-dot');
  const lbl  = document.getElementById('lec-lbl');
  const tema = document.getElementById('lec-tema');
  const body = document.getElementById('lec-body');
  const pg   = document.getElementById('lec-pg');
  const bar  = document.getElementById('lec-pgbar');
  const bAnt = document.getElementById('lec-ant');
  const bSig = document.getElementById('lec-sig');

  if (dot)  dot.style.background  = l.sColor;
  if (lbl)  { lbl.style.color = l.lColor; lbl.textContent = l.src; }
  if (tema) tema.textContent = l.tema;
  if (body) body.innerHTML = _renderPagina(p);
  if (pg)   pg.textContent = `${_paginaActual + 1} / ${tot}`;
  if (bAnt) bAnt.disabled = _paginaActual === 0;
  if (bSig) bSig.disabled = _paginaActual === tot - 1;

  if (bar) {
    let barras = '';
    for (let i = 0; i < tot; i++) {
      const cls = i === _paginaActual ? 'on' : i < _paginaActual ? 'past' : 'off';
      barras += `<div class="lec-pgs ${cls}"></div>`;
    }
    bar.innerHTML = barras;
  }
}

/* ════════════════════════════════════════════════════════════
   § 5 — API PÚBLICA
════════════════════════════════════════════════════════════ */

/**
 * Abre el modal de lección.
 * @param {number} [indice]  Índice en LECCIONES. Si se omite, elige uno aleatorio.
 */
window.abrirLeccion = function (indice) {
  _leccionActual = (typeof indice === 'number' && indice >= 0 && indice < LECCIONES.length)
    ? indice
    : Math.floor(Math.random() * LECCIONES.length);
  _paginaActual = 0;
  _actualizarModal();
  const modal = document.getElementById('modal-leccion');
  if (modal) modal.classList.remove('hidden');
};

/** Cierra el modal y regresa al mapa. */
window.cerrarLeccion = function () {
  const modal = document.getElementById('modal-leccion');
  if (modal) modal.classList.add('hidden');
};

/** Navega entre páginas: d = -1 (Ant.) o +1 (Sig.) */
window.navLeccion = function (d) {
  const tot = LECCIONES[_leccionActual].pags.length;
  _paginaActual = Math.max(0, Math.min(tot - 1, _paginaActual + d));
  _actualizarModal();
};

/* ════════════════════════════════════════════════════════════
   § 6 — INIT
════════════════════════════════════════════════════════════ */
(function init() {
  function _setup() {
    // Render inicial por si el modal ya tiene contenido
    _actualizarModal();

    // Cerrar al pulsar fondo
    const modal = document.getElementById('modal-leccion');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) window.cerrarLeccion();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _setup);
  } else {
    _setup();
  }
})();
