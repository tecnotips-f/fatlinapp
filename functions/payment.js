/* ══════════════════════════════════════════════════════
   PASARELA DE PAGO — CORREGIDO Y OPTIMIZADO
   ───────────────────────────────────────────────────── */

const PAYMENT_AMOUNTS = { 80:15, 160:15, 240:15, 320:15, 400:15, 480:100 };

const PAYMENT_LINKS = {
  cert: { pp: 'https://www.paypal.com/ncp/payment/JT99VZCXUTQBA' },
  diplo: { pp: 'https://www.paypal.com/ncp/payment/9PV4496CJ9VS4' }
};

const PAY_TIMEOUT_MS = 12 * 60 * 1000; 

let _payLevel   = 0;
let _payUnsub   = null;  
let _payTimer   = null;  
let _payPollTimer = null; 

/* ── Abrir modal ── */
let _payWallLevel = 0; 

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
  const p = JSON.parse(localStorage.getItem('fatlin_pay_pending')||'[]');
  if(!p.includes(_payWallLevel)) p.push(_payWallLevel);
  localStorage.setItem('fatlin_pay_pending', JSON.stringify(p));
}

function payWallPay(gateway){
  document.getElementById('modal-paywall').classList.remove('active');
  showPaymentModal(_payWallLevel);
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

  _showPayState('select');
  document.getElementById('modal-payment').classList.add('active');

  _startListener();

  const laterBtn = document.querySelector('#pay-select .pay-later');
  if(laterBtn) laterBtn.style.display = 'none';
}

async function doPayment(gateway){
  if(!game.user){ showToast('Debes iniciar sesión','#dc2626'); return; }

  const btnPp = document.getElementById('pay-btn-pp');
  if(btnPp) btnPp.disabled = true;

  _showPayState('waiting');
  document.getElementById('pay-wait-txt').textContent = 'Preparando pasarela de pago...';

  const payWin = window.open('about:blank', '_blank');
  if(!payWin) showToast('⚠️ Permite ventanas emergentes para pagar.','#d97706', 3000);

  try {
    const token = await game.user.getIdToken();
    const endpoint = 'https://us-central1-fatlin.cloudfunctions.net/ppCreateOrder';
    // return_url lleva uid y level para que ppCaptureOrder sepa a quién acreditar
    const returnUrl = `https://fatlin.web.app/paypal-return.html?level=${_payLevel}&uid=${game.user.uid}`;
    const cancelUrl = `https://fatlin.web.app/?payment_cancelled=1`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ level: _payLevel, returnUrl, cancelUrl })
    });

    if(!response.ok){
      const err = await response.json().catch(()=>({}));
      if(payWin) payWin.close();
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const { url } = await response.json();
    if(!url){ if(payWin) payWin.close(); throw new Error('Sin URL de pago'); }

    if(payWin && !payWin.closed) payWin.location.href = url;
    else window.location.href = url;

    document.getElementById('pay-wait-txt').textContent = 'Pago abierto en nueva ventana — complétalo allí.';

    _payTimer = setTimeout(()=>{
      document.getElementById('pay-wait-txt').textContent = 'Si ya pagaste, usa "¿Ya pagaste?" para confirmar.';
    }, PAY_TIMEOUT_MS);

  } catch(err) {
    showToast('Error al preparar el pago: ' + err.message, '#dc2626');
    _showPayState('select');
  } finally {
    if(btnPp) btnPp.disabled = false;
  }
}

async function _startListener(){
  if(!game.user) return;
  _stopListener();

  try {
    // CORRECCIÓN: Extracción de métodos para evitar ReferenceError
    const firestore = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');
    const { doc, onSnapshot, getDoc } = firestore; 

    const payRef = doc(db, 'fatlin_payments', `${game.user.uid}_${_payLevel}_attempt`);
    
    _payUnsub = onSnapshot(payRef, snap => {
      if(!snap.exists()) return;
      if(snap.data().paid === true) _onPaid(_payLevel);
    }, err => console.warn('[PayListener]', err));

    _payPollTimer = setInterval(async () => {
      if(!_payUnsub) return;
      try {
        const snap = await getDoc(payRef);
        if(snap.exists() && snap.data().paid === true) _onPaid(_payLevel);
      } catch(e){}
    }, 8000);

  } catch (e) { console.error("[_startListener] Error:", e); }
}

function _stopListener(){
  if(_payUnsub) _payUnsub(); 
  _payUnsub = null;
  if(_payTimer) clearTimeout(_payTimer);
  if(_payPollTimer) clearInterval(_payPollTimer);
}

async function payRetry(){
  if(!game.user) return;
  document.getElementById('pay-wait-txt').textContent = 'Verificando...';
  try{
    const firestore = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');
    const { doc, getDoc } = firestore;
    const snap = await getDoc(doc(db,'fatlin_payments',`${game.user.uid}_${_payLevel}_attempt`));
    if(snap.exists() && snap.data().paid === true){
      _onPaid(_payLevel);
    } else {
      document.getElementById('pay-wait-txt').textContent = 'Pago aún no confirmado.';
    }
  }catch(e){
    document.getElementById('pay-wait-txt').textContent = 'Error al verificar.';
  }
}

function _onPaid(level){
  _stopListener();
  _showPayState('confirmed');
  
  if(!game.paidLevels) game.paidLevels = new Set();
  game.paidLevels.add(level);
  
  const paid = JSON.parse(localStorage.getItem('fatlin_paid_levels')||'[]');
  if(!paid.includes(level)) paid.push(level);
  localStorage.setItem('fatlin_paid_levels', JSON.stringify(paid));

  setTimeout(()=>{
    document.getElementById('modal-payment').classList.remove('active');
    document.getElementById('modal-paywall').classList.remove('active');
    
    game.diplomasEarned++;
    saveProgress();
    if(typeof window.renderMap === 'function') window.renderMap();
    generateDiploma(level);
    updateHUD();
    showToast('Certificado activado!', '#15803d');

    const p = JSON.parse(localStorage.getItem('fatlin_pay_pending')||'[]');
    localStorage.setItem('fatlin_pay_pending', JSON.stringify(p.filter(l=>l!==level)));
  }, 2000);
}

function _showPayState(state){
  document.getElementById('pay-select').style.display    = state==='select'    ? 'block' : 'none';
  document.getElementById('pay-waiting').classList.toggle('active',   state==='waiting');
  document.getElementById('pay-confirmed').classList.toggle('active', state==='confirmed');
}

// Receptor de mensajes global para confirmación instantánea
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return; 
    if (event.data?.type === 'PAYMENT_SUCCESS') {
        _onPaid(event.data.level || _payLevel);
    }
}, false);

document.addEventListener('fatlin_ready', async ()=>{
  if(!game.user) return;
  const pending = JSON.parse(localStorage.getItem('fatlin_pay_pending')||'[]');
  if(pending.length === 0) return;

  try{
    const firestore = await import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js');
    const { doc, getDoc } = firestore;
    for(const level of pending){
      const snap = await getDoc(doc(db,'fatlin_payments',`${game.user.uid}_${level}_attempt`));
      if(snap.exists() && snap.data().paid === true) { _onPaid(level); break; }
    }
  }catch(e){ console.warn('[PayCheck]',e); }

}); // ← llave correctamente cerrada