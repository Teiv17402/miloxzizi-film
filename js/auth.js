/**
 * ============================================
 * Auth Module - Kích hoạt KEY qua backend (Google Apps Script)
 * Model: khóa theo THIẾT BỊ ĐẦU TIÊN (chống chia sẻ key)
 * ============================================
 *  - Lần đầu nhập key -> server gắn key với thiết bị này.
 *  - Máy khác nhập cùng key -> bị từ chối.
 *  - Quản lý key trong Google Sheet (không sửa file này để thêm key nữa).
 *
 * ⚙️ SAU KHI DEPLOY APPS SCRIPT: dán URL web app vào WEBAPP_URL bên dưới.
 */
(function () {
  'use strict';

  // 👇 DÁN URL WEB APP APPS SCRIPT VÀO ĐÂY (dạng https://script.google.com/macros/s/..../exec)
  const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycby2FSVS09NPL_wHfsw98rxT2vr883bNRvlyw9_fpJEJnuDunqW27TBiDG5QKvmTN095/exec';

  const ACTIVATION_STORAGE_KEY = 'phim_activation';
  const DEVICE_STORAGE_KEY = 'phim_device';

  // ====== Device ID (ổn định cho mỗi trình duyệt) ======
  function getDeviceId() {
    let id = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!id) {
      id = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'd-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
      localStorage.setItem(DEVICE_STORAGE_KEY, id);
    }
    return id;
  }

  // ====== Gọi backend bằng JSONP (không dính CORS) ======
  function callApi(params) {
    return new Promise((resolve, reject) => {
      const cbName = 'authcb_' + Math.random().toString(36).slice(2);
      const script = document.createElement('script');
      const timer = setTimeout(() => { cleanup(); reject(new Error('timeout')); }, 15000);
      function cleanup() {
        clearTimeout(timer);
        try { delete window[cbName]; } catch (e) { window[cbName] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      window[cbName] = (data) => { cleanup(); resolve(data); };
      const qs = Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');
      script.src = WEBAPP_URL + '?' + qs + '&callback=' + cbName;
      script.onerror = () => { cleanup(); reject(new Error('network')); };
      document.body.appendChild(script);
    });
  }

  // ====== Trạng thái kích hoạt lưu tại máy ======
  function getSaved() {
    try { return JSON.parse(localStorage.getItem(ACTIVATION_STORAGE_KEY) || 'null'); }
    catch (e) { return null; }
  }
  function saveActivation(key) {
    localStorage.setItem(ACTIVATION_STORAGE_KEY, JSON.stringify({
      key: String(key).trim(), device: getDeviceId(), activatedAt: Date.now()
    }));
  }
  function clearActivation() { localStorage.removeItem(ACTIVATION_STORAGE_KEY); }
  window.deactivateKey = function () { clearActivation(); location.reload(); };

  function errorMessage(res) {
    const code = res && res.error;
    switch (code) {
      case 'invalid_key':           return '❌ Key không đúng.';
      case 'used_on_other_device':  return '❌ Key này đã được kích hoạt trên thiết bị khác.';
      case 'revoked':               return '❌ Key đã bị thu hồi.';
      default:                      return '❌ Key không hợp lệ.';
    }
  }

  // ====== Giao diện màn hình khoá ======
  function injectStyles() {
    if (document.getElementById('authGateStyles')) return;
    const style = document.createElement('style');
    style.id = 'authGateStyles';
    style.textContent = `
      #authGate{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:radial-gradient(1200px 600px at 50% -10%,#1a1a1a,#0a0a0a 70%);font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;}
      #authGate .gate-card{width:100%;max-width:380px;background:#161616;border:1px solid #2a2a2a;border-radius:16px;padding:32px 26px;box-shadow:0 24px 70px rgba(0,0,0,.6);text-align:center;animation:authPop .35s ease-out;}
      @keyframes authPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
      #authGate .gate-logo{font-size:24px;font-weight:800;color:#e50914;margin-bottom:6px;}
      #authGate .gate-sub{color:#9a9a9a;font-size:13px;margin-bottom:22px;line-height:1.5;}
      #authGate input{width:100%;box-sizing:border-box;padding:14px 16px;margin-bottom:14px;background:#0e0e0e;border:1px solid #333;border-radius:10px;color:#fff;font-size:15px;text-align:center;letter-spacing:1px;outline:none;transition:border-color .2s,box-shadow .2s;}
      #authGate input:focus{border-color:#e50914;box-shadow:0 0 0 3px rgba(229,9,20,.18);}
      #authGate button{width:100%;padding:14px;background:#e50914;border:none;border-radius:10px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;transition:background .2s,transform .1s;}
      #authGate button:hover{background:#f40612;} #authGate button:active{transform:scale(.98);}
      #authGate button:disabled{opacity:.6;cursor:default;}
      #authGate .gate-error{min-height:18px;margin-top:12px;color:#ff5a5a;font-size:13px;}
      #authGate.shake .gate-card{animation:authShake .4s;}
      @keyframes authShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
      html.auth-locked,body.auth-locked{overflow:hidden!important;}`;
    document.head.appendChild(style);
  }

  function mountGate() {
    injectStyles();
    document.documentElement.classList.add('auth-locked');
    if (document.body) document.body.classList.add('auth-locked');
    const gate = document.createElement('div');
    gate.id = 'authGate';
    gate.innerHTML =
      '<div class="gate-card">' +
        '<div class="gate-logo">🔒 MiloxZizi Film</div>' +
        '<div class="gate-sub">Nhập key kích hoạt để xem phim.<br>Mỗi key chỉ dùng được trên 1 thiết bị.</div>' +
        '<form id="gateForm" autocomplete="off">' +
          '<input id="gateInput" type="text" placeholder="Nhập key của bạn" />' +
          '<button type="submit" id="gateBtn">Kích hoạt</button>' +
          '<div class="gate-error" id="gateError"></div>' +
        '</form>' +
      '</div>';
    document.body.appendChild(gate);

    const form = gate.querySelector('#gateForm');
    const input = gate.querySelector('#gateInput');
    const error = gate.querySelector('#gateError');
    const btn = gate.querySelector('#gateBtn');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      error.textContent = '';
      btn.disabled = true; btn.textContent = 'Đang kiểm tra...';
      try {
        const res = await callApi({ action: 'activate', key: val, device: getDeviceId() });
        if (res && res.ok) {
          saveActivation(val);
          unmountGate(gate);
          return;
        }
        error.textContent = errorMessage(res);
        gate.classList.add('shake');
        setTimeout(() => gate.classList.remove('shake'), 450);
        input.select();
      } catch (err) {
        error.textContent = '⚠️ Không kết nối được máy chủ key. Kiểm tra mạng rồi thử lại.';
      } finally {
        btn.disabled = false; btn.textContent = 'Kích hoạt';
      }
    });
    setTimeout(() => input.focus(), 50);
  }

  function unmountGate(gate) {
    document.documentElement.classList.remove('auth-locked');
    if (document.body) document.body.classList.remove('auth-locked');
    if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
  }

  // Nền: xác thực lại với server (để thu hồi từ Sheet có hiệu lực). Offline thì bỏ qua.
  async function backgroundCheck(saved) {
    try {
      const res = await callApi({ action: 'check', key: saved.key, device: getDeviceId() });
      if (res && res.ok === false &&
          (res.error === 'revoked' || res.error === 'other_device' || res.error === 'invalid_key')) {
        clearActivation();
        location.reload();
      }
    } catch (e) { /* mất mạng -> giữ nguyên quyền xem */ }
  }

  // ====== CHẠY ======
  function boot() {
    const saved = getSaved();
    if (saved && saved.key && saved.device === getDeviceId()) {
      backgroundCheck(saved); // đã kích hoạt trên máy này -> cho xem, âm thầm kiểm tra lại
    } else {
      mountGate();
    }
  }
  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
