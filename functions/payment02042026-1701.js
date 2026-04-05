/* ══════════════════════════════════════════════════════
   PASARELA DE PAGO — LINKS FIJOS
   ─────────────────────────────────────────────────────
   IMPORTANTE: sustituir las URLs placeholder por los
   links reales generados en MercadoPago y PayPal.
   ─────────────────────────────────────────────────────
   MercadoPago: mercadopago.com → Cobros → Crear link
   PayPal:      paypal.com → Pay & Get Paid → Payment Links
══════════════════════════════════════════════════════ */

const PAYMENT_AMOUNTS = { 80:15, 160:15, 240:15, 320:15, 400:15, 480:100 };

const PAYMENT_LINKS = {
  // $15 USD — Certificados niveles 80, 160, 240, 320, 400
  cert: {
    // mp: 'https://mpago.la/18ShgXD',  // MERCADOPAGO DESHABILITADO
    pp: 'https://www.paypal.com/ncp/payment/JT99VZCXUTQBA'
  },
  // $100 USD — Diplomado nivel 480
  diplo: {
    // mp: 'https://mpago.la/1LsPyTq',  // MERCADOPAGO DESHABILITADO
    pp: 'https://www.paypal.com/ncp/payment/9PV4496CJ9VS4'
  }
};

// Tiempo máximo esperando verificación (ms)
const PAY_TIMEOUT_MS = 12 * 60 * 1000; // 12 minutos

let _payLevel   = 0;
let _payUnsub   = null;  // unsubscribe de onSnapshot
let _payTimer   = null;  // timeout máximo

/* ── Abrir modal ── */
/* ══ PAYWALL — bloqueo de nivel hasta pago ══ */
let _payWallLevel = 0; // nivel del certificado que se debe pagar

function showPayWall(certLevel){
  _payWallLevel = certLevel;
  const isDiplo = certLevel === 480;
  const amount  = isDiplo ? '$100 USD' : '$15 USD';
  const tierNames = {80:'Iniciado',160:'Practicante',240:'Especialista',320:'Experto',400:'Maestro',480:'Diplomado'};
  const tierName  = tierNames[certLevel] || 'Nivel '+certLevel;
  const nextLevel = certLevel + 1;

  document.getElementById('pw-title').textContent  = 'Activa tu certificado para continuar';
  document.getElementById('pw-cert-name').textContent = 'Certificado ' + tierName;
  document.getElementById('pw-next-level').textContent = nextLevel;
  document.getElementById('pw-amount').innerHTML =
    amount + '<span>Aporte único · Desbloquea el nivel ' + nextLevel + '</span>';

  document.getElementById('modal-paywall').classList.add('active');
}

function closePayWall(){
  document.getElementById('modal-paywall').classList.remove('active');
  // Guardar pendiente para que al volver lo vea en Logros
  const p = JSON.parse(localStorage.getItem('fatlin_pay_pending')||'[]');
  if(!p.includes(_payWallLevel)) p.push(_payWallLevel);
  localStorage.setItem('fatlin_pay_pending', JSON.stringify(p));
}

function payWallPay(gateway){
  // Cerrar paywall y abrir el modal de pago completo con listener
  document.getElementById('modal-paywall').classList.remove('active');
  showPaymentModal(_payWallLevel);
  // Trigger inmediato al gateway elegido
  setTimeout(()=> doPayment(gateway), 300);
}

function showPaymentModal(level){
  _payLevel = level;

  const isDiplo  = level === 480;
  const amount   = isDiplo ? '$100 USD' : '$15 USD';
  const tierName = {80:'Iniciado',160:'Practicante',240:'Especialista',320:'Experto',400:'Maestro',480:'Diplomado'}[level] || 'Nivel '+level;

  document.getElementById('pay-badge').textContent  = 'Nivel ' + level + ' completado';
  document.getElementById('pay-title').textContent  = '¡Aprobaste ' + (isDiplo ? 'el Diplomado' : 'el nivel ' + level) + '!';
  document.getElementById('pay-msg').innerHTML      =
    'Para activar tu <strong>Certificado ' + tierName + '</strong> y continuar ' +
    (isDiplo ? 'con tu Título Propio,' : 'tu camino hacia el Diplomado,') +
    ' realiza tu aporte.';
  document.getElementById('pay-amount').textContent = amount;

  // Resetear a estado inicial
  _showPayState('select');
  document.getElementById('modal-payment').classList.add('active');

  // Iniciar listener en Firestore por si el pago llega rápido
  _startListener();

  // Deshabilitar temporalmente "pagar más tarde" — debe pagar para continuar
  // El botón solo aparece después de iniciar el proceso de pago
  const laterBtn = document.querySelector('#pay-select .pay-later');
  if(laterBtn) laterBtn.style.display = 'none';
}

/* ── Hacer el pago: abrir pasarela en nueva pestaña ── */
// MERCADOPAGO SDK DESHABILITADO — descomentar para habilitar
// let _mpSDK = null;
// function _getMPDeviceId(){
//   try {
//     if(!_mpSDK) _mpSDK = new MercadoPago('APP_USR-58d7b85d-f3c8-4b42-b9a2-7d1234567890');
//     return _mpSDK.deviceId || '';
//   } catch(e){ return ''; }
// }

async function doPayment(gateway){
  if(!game.user){ showToast('Debes iniciar sesión','#dc2626'); return; }

  const btnMp = document.getElementById('pay-btn-mp');
  const btnPp = document.getElementById('pay-btn-pp');
  if(btnMp) btnMp.disabled = true;
  if(btnPp) btnPp.disabled = true;

  _showPayState('waiting');
  document.getElementById('pay-wait-txt').textContent = 'Preparando pasarela de pago...';

  // ── Abrir ventana ANTES del async para evitar bloqueo de popup ──
  // Los navegadores solo permiten window.open() en respuesta directa
  // a un clic del usuario — no después de un await.
  // Abrimos about:blank y luego redirigimos con location.href.
  const payWin = window.open('about:blank', '_blank');
  if(!payWin){
    // Popup bloqueado — usar redirección en la misma pestaña como fallback
    showToast('⚠️ Permite ventanas emergentes para pagar, o serás redirigido aquí.','#d97706', 3000);
  }

  try {
    const token = await game.user.getIdToken();

    // MERCADOPAGO DESHABILITADO — descomentar para habilitar gateway mp
    // const endpoint = gateway === 'mp'
    //   ? 'https://us-central1-fatlin.cloudfunctions.net/mpCreatePref'
    //   : 'https://us-central1-fatlin.cloudfunctions.net/ppCreateOrder';
    const endpoint = 'https://us-central1-fatlin.cloudfunctions.net/ppCreateOrder';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        level:    _payLevel
        // deviceId: _getMPDeviceId()  // MERCADOPAGO DESHABILITADO
      })
    });

    if(!response.ok){
      const err = await response.json().catch(()=>({}));
      if(payWin) payWin.close();
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const { url, orderId } = await response.json();
    if(!url){ if(payWin) payWin.close(); throw new Error('Sin URL de pago'); }

    // Guardar orderId para capturar el pago al volver de PayPal
    if(orderId){
      sessionStorage.setItem('fatlin_pending_order', JSON.stringify({
        orderId, uid: game.user.uid, level: _payLevel
      }));
    }

    // Redirigir la ventana ya abierta (no hay bloqueo de popup)
    if(payWin && !payWin.closed){
      payWin.location.href = url;
    } else {
      // Fallback: redirigir en la misma pestaña
      window.location.href = url;
    }

    document.getElementById('pay-wait-txt').textContent =
      'Pago abierto en nueva ventana — complétalo allí y regresa aquí.';

    _payTimer = setTimeout(()=>{
      document.getElementById('pay-wait-txt').textContent =
        'Si ya pagaste, usa "¿Ya pagaste?" para confirmar.';
    }, PAY_TIMEOUT_MS);

  } catch(err) {
    console.error('[doPayment] Error:', err.message);
    const _st = window.showToast || function(m){ alert(m); };
    _st('Error al preparar el pago: ' + err.message, '#dc2626');
    _showPayState('select');
  } finally {
    if(btnMp) btnMp.disabled = false;
    if(btnPp) btnPp.disabled = false;
  }
}

/* ── Listener onSnapshot: detecta paid:true del webhook ── */
function _startListener(){
  if(!game.user) return;
  if(_payUnsub){ _payUnsub(); _payUnsub = null; }

  // Escuchar el documento de intento de pago
  const payRef = doc(db, 'fatlin_payments', `${game.user.uid}_${_payLevel}_attempt`);
  _payUnsub = onSnapshot(payRef, snap => {
    if(!snap.exists()) return;
    const d = snap.data();
    if(d.paid === true){
      _stopListener();
      _onPaid(_payLevel);
    } else if(d.status === 'rejected'){
      _stopListener();
      _showPayState('select');
      showToast('Pago rechazado. Intenta con otro método.','#ef4444');
    }
  }, err => console.warn('[PayListener]', err));
}

function _stopListener(){
  if(_payUnsub){ _payUnsub(); _payUnsub = null; }
  if(_payTimer){ clearTimeout(_payTimer); _payTimer = null; }
}

/* ── Verificación manual (botón "¿Ya pagaste?") ── */
async function payRetry(){
  if(!game.user) return;
  document.getElementById('pay-wait-txt').textContent = 'Verificando...';
  try{
    const snap = await getDoc(doc(db,'fatlin_payments',`${game.user.uid}_${_payLevel}_attempt`));
    if(snap.exists() && snap.data().paid === true){
      _stopListener();
      _onPaid(_payLevel);
    } else {
      document.getElementById('pay-wait-txt').textContent =
        'Pago aún no confirmado. Si acabas de pagar, espera unos segundos e intenta de nuevo.';
    }
  }catch(e){
    document.getElementById('pay-wait-txt').textContent = 'Error al verificar. Intenta nuevamente.';
  }
}

/* ── Pago confirmado ── */
function _onPaid(level){
  _showPayState('confirmed');
  // Registrar nivel como pagado
  if(!game.paidLevels) game.paidLevels = new Set();
  game.paidLevels.add(level);
  // Persistir en localStorage para acceso offline rápido
  const paid = JSON.parse(localStorage.getItem('fatlin_paid_levels')||'[]');
  if(!paid.includes(level)) paid.push(level);
  localStorage.setItem('fatlin_paid_levels', JSON.stringify(paid));

  setTimeout(()=>{
    document.getElementById('modal-payment').classList.remove('active');
    game.diplomasEarned++;
    saveProgress();
    generateDiploma(level);
    updateHUD();
    if(typeof updateProgressFooter === 'function') updateProgressFooter();
    showToast('¡Certificado activado! 🎓','#15803d', 4000);
    // Limpiar pendiente
    const p = JSON.parse(localStorage.getItem('fatlin_pay_pending')||'[]');
    localStorage.setItem('fatlin_pay_pending', JSON.stringify(p.filter(l=>l!==level)));
  }, 2000);
}

/* ── Cargar niveles pagados desde Firestore + localStorage ── */
async function _loadPaidLevels(){
  if(!game.user) return;
  if(!game.paidLevels) game.paidLevels = new Set();
  // Cargar desde localStorage primero (rápido, offline)
  const local = JSON.parse(localStorage.getItem('fatlin_paid_levels')||'[]');
  local.forEach(l => game.paidLevels.add(l));
  console.log('[PaidLevels] local:', local);
  // Si ya tenemos niveles en localStorage, actualizar UI inmediatamente
  if(local.length > 0){
    if(typeof window.updateHUD === 'function') window.updateHUD();
    if(typeof window.renderMap === 'function') window.renderMap();
  }
  // Verificar en Firestore usando la función del módulo que tiene acceso a getDoc
  if(typeof window._loadPaidLevelsFromFirestore === 'function'){
    await window._loadPaidLevelsFromFirestore();
  } else {
    console.warn('[PaidLevels] _loadPaidLevelsFromFirestore no disponible aún');
    // Reintentar en 2s cuando el módulo termine de cargar
    setTimeout(async () => {
      if(typeof window._loadPaidLevelsFromFirestore === 'function'){
        await window._loadPaidLevelsFromFirestore();
      }
    }, 2000);
  }
}

/* ── Pagar más tarde ── */
function payLater(){
  _stopListener();
  document.getElementById('modal-payment').classList.remove('active');
  // Guardar nivel pendiente
  const p = JSON.parse(localStorage.getItem('fatlin_pay_pending')||'[]');
  if(!p.includes(_payLevel)) p.push(_payLevel);
  localStorage.setItem('fatlin_pay_pending', JSON.stringify(p));
  showToast('Puedes activar tu certificado desde el panel de Logros.','#0369a1', 4000);
}

/* ── Cambiar estado visual del modal ── */
function _showPayState(state){
  document.getElementById('pay-select').style.display    = state==='select'    ? 'block' : 'none';
  document.getElementById('pay-waiting').classList.toggle('active',   state==='waiting');
  document.getElementById('pay-confirmed').classList.toggle('active', state==='confirmed');
  // Mostrar "pagar más tarde" solo si ya inició el proceso (está en waiting)
  const laterBtnW = document.querySelector('#pay-waiting .pay-later');
  if(laterBtnW) laterBtnW.style.display = state==='waiting' ? 'block' : 'none';
}

/* ── Al cargar el juego: verificar niveles pendientes de pago ── */
document.addEventListener('fatlin_ready', async ()=>{
  if(!game.user) return;
  const pending = JSON.parse(localStorage.getItem('fatlin_pay_pending')||'[]');
  for(const level of pending){
    try{
      const snap = await getDoc(doc(db,'fatlin_payments',`${game.user.uid}_${level}_attempt`));
      if(snap.exists() && snap.data().paid === true){
        _onPaid(level);
        break; // uno a la vez para no saturar
      }
    }catch(e){ console.warn('[PayCheck]',e); }
  }
});
