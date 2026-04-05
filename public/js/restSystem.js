/* ═══════════════════════════════════════════════════════
   Fatlin AI | restSystem.js — Sistema de Alertas de Descanso
═══════════════════════════════════════════════════════ */

/* ===== SISTEMA ALERTA DE DESCANSO ===== */
(function(){
  let _sessionStart = null;
  let _restInterval = null;
  let _restCount = 0;
  const REST_INTERVAL_MS = 10 * 60 * 1000; // 10 min

  // Mensajes por nivel — se personalizan con el nombre del usuario
  const MSGS = [
    { // 10 min — azul (normal)
      icon: '☕',
      title: (n) => `¡${n}, hora de una pausa!`,
      tip: (n) => `Tu cerebro aprende mejor con descansos cortos, ${n}. 👀 Aparta la vista unos minutos — ¡vuelve con más energía!`,
      skipBtn: 'Seguir jugando',
      theme: { bg:'linear-gradient(160deg,#0c2a4a,#0f3460)', badge:'#0ea5e9', badgeBg:'rgba(14,165,233,.15)', glow:'rgba(56,189,248,.5)', dot:'#38bdf8' }
    },
    { // 20 min — naranja (alerta media)
      icon: '🟠',
      title: (n) => `¡${n}, llevas 20 minutos seguidos!`,
      tip: (n) => `La memoria se consolida durante el descanso, ${n}. 🧠 Cierra los ojos 2 minutos y respira profundo — tu rendimiento te lo agradecerá.`,
      skipBtn: 'Continuar de todas formas',
      theme: { bg:'linear-gradient(160deg,#431407,#7c2d12)', badge:'#f97316', badgeBg:'rgba(249,115,22,.2)', glow:'rgba(249,115,22,.6)', dot:'#fb923c' }
    },
    { // 30 min — rojo (alerta alta)
      icon: '🔴',
      title: (n) => `¡${n}, tu concentración lo necesita!`,
      tip: (n) => `Ya llevas media hora, ${n}. 💪 Estira el cuello, mueve los hombros y bebe agua — 5 minutos de descanso recargan 1 hora de aprendizaje.`,
      skipBtn: 'Seguir (aunque no es recomendable)',
      theme: { bg:'linear-gradient(160deg,#450a0a,#7f1d1d)', badge:'#ef4444', badgeBg:'rgba(239,68,68,.2)', glow:'rgba(239,68,68,.7)', dot:'#f87171' }
    },
    { // 40+ min — rojo intenso
      icon: '⚠️',
      title: (n) => `¡${n}, mereces un descanso real!`,
      tip: (n) => `${n}, llevas mucho tiempo activo. 🌙 Los campeones también descansan — tu cerebro necesita consolidar todo lo que aprendiste hoy.`,
      skipBtn: '😅 Seguir (de verdad, descansa luego)',
      theme: { bg:'linear-gradient(160deg,#3b0764,#581c87)', badge:'#a855f7', badgeBg:'rgba(168,85,247,.2)', glow:'rgba(168,85,247,.7)', dot:'#c084fc' }
    },
  ];

  function getUserName(){
    try{
      const u = game && game.user;
      if(!u) return 'Tutor';
      return u.displayName?.split(' ')[0]
        || u.email?.split('@')[0]
        || 'Tutor';
    }catch(e){ return 'Tutor'; }
  }

  function formatTime(minutes){
    if(minutes < 60) return `${minutes} minuto${minutes>1?'s':''}`;
    const h = Math.floor(minutes/60), m = minutes%60;
    return m > 0 ? `${h}h ${m}min` : `${h} hora${h>1?'s':''}`;
  }

  function buildDots(count, color){
    const el = document.getElementById('rest-dots');
    if(!el) return;
    el.innerHTML = '';
    const max = Math.min(count, 8);
    for(let i=0;i<max;i++){
      const d = document.createElement('div');
      d.className = 'rest-dot active';
      d.style.background = color;
      el.appendChild(d);
    }
  }

  window.showRestModal = function(){
    _restCount++;
    const minutes = _restCount * 10;
    const timeStr = formatTime(minutes);
    const name = getUserName();
    const msgIdx = Math.min(_restCount - 1, MSGS.length - 1);
    const msg = MSGS[msgIdx];
    const theme = msg.theme;

    // Aplicar tema de color al modal
    const card = document.querySelector('#modal-rest .rest-card');
    if(card) card.style.background = theme.bg;

    // Actualizar badge de tiempo con color del tema
    const badge = document.getElementById('rest-time-badge');
    if(badge){
      badge.innerText = timeStr;
      badge.style.color = theme.badge;
      badge.style.background = theme.badgeBg;
      badge.style.border = `1px solid ${theme.badge}`;
    }

    const title = document.getElementById('rest-title');
    const subtitle = document.getElementById('rest-subtitle');
    const tip = document.getElementById('rest-tip');
    const skipBtn = document.getElementById('rest-skip-btn');

    if(title){ title.innerText = msg.icon + ' ' + msg.title(name); title.style.color = theme.badge; }
    if(subtitle) subtitle.innerText = 'Llevas activo en Fatlin AI';
    if(tip) tip.innerText = msg.tip(name);
    if(skipBtn){ skipBtn.innerText = msg.skipBtn; skipBtn.style.borderColor = theme.badge; skipBtn.style.color = theme.badge; }

    buildDots(_restCount, theme.dot);

    // Efecto glow del emblema según tema
    const emblem = document.querySelector('.rest-emblem-svg');
    if(emblem) emblem.style.filter = `drop-shadow(0 8px 24px ${theme.glow})`;

    document.getElementById('modal-rest').classList.add('active');
  };

  window.closeRestModal = function(skip){
    document.getElementById('modal-rest').classList.remove('active');
  };

  window.startRestTimer = function(){
    if(_restInterval) return;
    _sessionStart = Date.now();
    _restInterval = setInterval(()=>{
      if(game && game.user && document.getElementById('splash').style.display === 'none'){
        window.showRestModal();
      }
    }, REST_INTERVAL_MS);
  };

  window.stopRestTimer = function(){
    if(_restInterval){ clearInterval(_restInterval); _restInterval = null; }
    _restCount = 0;
  };
})();
