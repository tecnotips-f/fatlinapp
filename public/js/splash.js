/* ═══════════════════════════════════════════════════════
   Fatlin AI | splash.js — Idioma, Splash y Watchdog Auth
═══════════════════════════════════════════════════════ */

// ── Estado mínimo necesario antes de que cargue el módulo ──────
window._splashLangChosen = null;
window._splashHidden = false;

// Función central: ocultar splash y mostrar auth-screen
window._showAuth = function() {
  if(window._splashHidden) return;
  window._splashHidden = true;
  if(window._authWatchdog){ clearTimeout(window._authWatchdog); window._authWatchdog=null; }
  var splash = document.getElementById('splash');
  if(splash){ splash.style.transition='opacity .4s'; splash.style.opacity='0'; setTimeout(function(){ splash.style.display='none'; },420); }
  setTimeout(function(){
    var as = document.getElementById('auth-screen');
    if(as) as.style.display='flex';
  }, 430);
};

window.splashChooseLang = function(lang) {
  try {
    window._splashLangChosen = lang;
    localStorage.setItem('fatlin_lang', lang);
    var btn = document.getElementById('ls-'+lang);
    if(btn) btn.classList.add('entering');
  } catch(e) {}
  var ls = document.getElementById('lang-splash');
  if(ls){ ls.innerHTML='<div style="margin-top:1.5rem;text-align:center;color:rgba(186,230,253,.8);font-size:.85rem"><div style="font-size:2rem;display:inline-block;animation:splashSpin 1s linear infinite">⏳</div><br>Conectando...</div>'; }
  // Watchdog: si Firebase no responde en 5s, forzar auth-screen
  window._authWatchdog = setTimeout(function(){
    console.warn('[Fatlin] Firebase timeout — mostrando login');
    window._showAuth();
  }, 5000);
};

// Si idioma ya guardado: watchdog de 3s (saltar splash directo)
(function() {
  var saved = localStorage.getItem('fatlin_lang');
  if(saved){
    window._splashLangChosen = saved;
    window._authWatchdog = setTimeout(function(){ window._showAuth(); }, 3000);
  }
})();
