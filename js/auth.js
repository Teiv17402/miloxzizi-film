/**
 * ============================================
 * Auth Module - Kích hoạt bằng KEY (client-side)
 * ============================================
 * Hiện màn hình khoá khi vào web. Nhập đúng key mới cho xem.
 * Key đã nhập được lưu trong localStorage nên lần sau khỏi nhập lại.
 *
 * ⚠️ LƯU Ý BẢO MẬT: Đây là lớp chặn phía TRÌNH DUYỆT. Người rành kỹ
 * thuật mở DevTools xem source vẫn có thể bỏ qua. Chỉ dùng để chặn
 * người dùng thường, KHÔNG dùng cho nội dung cần bảo mật cao.
 *
 * --------------------------------------------
 * CÁCH THÊM KEY MỚI:
 *   1) Mở web, bấm F12 -> tab Console
 *   2) Gõ:  hashKey('KEY-CUA-BAN')   rồi Enter
 *   3) Copy số in ra, dán thêm 1 dòng vào mảng VALID_KEY_HASHES bên dưới
 *      (nên ghi chú key gốc ở comment để dễ quản lý)
 *
 * CÁCH THU HỒI 1 KEY:
 *   Xoá dòng hash tương ứng khỏi VALID_KEY_HASHES.
 *   Người đang dùng key đó sẽ bị chặn lại ở lần tải trang kế tiếp.
 * --------------------------------------------
 */
(function () {
  'use strict';

  const ACTIVATION_STORAGE_KEY = 'phim_activation';

  // ====== DANH SÁCH KEY HỢP LỆ (dạng hash) ======
  // Mỗi dòng = 1 key. Comment bên cạnh là key gốc cho dễ nhớ.
  const VALID_KEY_HASHES = [
    926078120,   // MILOX-VIP-001
    926078121,   // MILOX-VIP-002
    926078122,   // MILOX-VIP-003
    2500694908,  // TEST-2026
    3562250222   // TungVu
  ];

  // Hàm hash (djb2, 32-bit unsigned) - PHẢI giống lúc tạo hash
  function hashKey(str) {
    str = String(str).trim();
    let h = 5381;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h) + str.charCodeAt(i);
      h = h & 0xffffffff;
    }
    return h >>> 0;
  }
  // Phơi ra global để bạn generate hash trong Console
  window.hashKey = hashKey;

  function isValidKey(key) {
    if (!key) return false;
    return VALID_KEY_HASHES.includes(hashKey(key));
  }

  // Đã kích hoạt chưa? Kiểm tra lại key đã lưu có CÒN trong danh sách không
  // (nhờ vậy: xoá key khỏi danh sách = thu hồi được)
  function isActivated() {
    try {
      const saved = JSON.parse(localStorage.getItem(ACTIVATION_STORAGE_KEY) || 'null');
      return !!(saved && isValidKey(saved.key));
    } catch (e) {
      return false;
    }
  }

  function activate(key) {
    localStorage.setItem(ACTIVATION_STORAGE_KEY, JSON.stringify({
      key: String(key).trim(),
      activatedAt: Date.now()
    }));
  }

  // Cho phép đăng xuất key (gọi  deactivateKey()  trong Console nếu cần)
  window.deactivateKey = function () {
    localStorage.removeItem(ACTIVATION_STORAGE_KEY);
    location.reload();
  };

  // ====== GIAO DIỆN MÀN HÌNH KHOÁ ======
  function injectStyles() {
    if (document.getElementById('authGateStyles')) return;
    const css = `
      #authGate{position:fixed;inset:0;z-index:2147483647;display:flex;
        align-items:center;justify-content:center;padding:20px;
        background:radial-gradient(1200px 600px at 50% -10%,#1a1a1a,#0a0a0a 70%);
        font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;}
      #authGate .gate-card{width:100%;max-width:380px;background:#161616;
        border:1px solid #2a2a2a;border-radius:16px;padding:32px 26px;
        box-shadow:0 24px 70px rgba(0,0,0,.6);text-align:center;
        animation:authPop .35s ease-out;}
      @keyframes authPop{from{opacity:0;transform:translateY(14px) scale(.98)}to{opacity:1;transform:none}}
      #authGate .gate-logo{font-size:24px;font-weight:800;color:#e50914;margin-bottom:6px;letter-spacing:.3px;}
      #authGate .gate-sub{color:#9a9a9a;font-size:13px;margin-bottom:22px;line-height:1.5;}
      #authGate .gate-field{position:relative;margin-bottom:14px;}
      #authGate input{width:100%;box-sizing:border-box;padding:14px 16px;
        background:#0e0e0e;border:1px solid #333;border-radius:10px;color:#fff;
        font-size:15px;text-align:center;letter-spacing:1px;outline:none;
        transition:border-color .2s,box-shadow .2s;}
      #authGate input:focus{border-color:#e50914;box-shadow:0 0 0 3px rgba(229,9,20,.18);}
      #authGate button{width:100%;padding:14px;background:#e50914;border:none;
        border-radius:10px;color:#fff;font-size:15px;font-weight:700;cursor:pointer;
        transition:background .2s,transform .1s;}
      #authGate button:hover{background:#f40612;}
      #authGate button:active{transform:scale(.98);}
      #authGate .gate-error{min-height:18px;margin-top:12px;color:#ff5a5a;font-size:13px;}
      #authGate.shake .gate-card{animation:authShake .4s;}
      @keyframes authShake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}
      html.auth-locked,body.auth-locked{overflow:hidden!important;}
    `;
    const style = document.createElement('style');
    style.id = 'authGateStyles';
    style.textContent = css;
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
        '<div class="gate-sub">Nhập key kích hoạt để xem phim.<br>Chưa có key? Liên hệ admin để được cấp.</div>' +
        '<form id="gateForm" autocomplete="off">' +
          '<div class="gate-field">' +
            '<input id="gateInput" type="text" placeholder="Nhập key của bạn" autofocus />' +
          '</div>' +
          '<button type="submit">Kích hoạt</button>' +
          '<div class="gate-error" id="gateError"></div>' +
        '</form>' +
      '</div>';
    document.body.appendChild(gate);

    const form = gate.querySelector('#gateForm');
    const input = gate.querySelector('#gateInput');
    const error = gate.querySelector('#gateError');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = input.value.trim();
      if (isValidKey(val)) {
        activate(val);
        unmountGate(gate);
      } else {
        error.textContent = '❌ Key không đúng hoặc đã hết hiệu lực.';
        gate.classList.add('shake');
        setTimeout(() => gate.classList.remove('shake'), 450);
        input.select();
      }
    });
    setTimeout(() => input.focus(), 50);
  }

  function unmountGate(gate) {
    document.documentElement.classList.remove('auth-locked');
    if (document.body) document.body.classList.remove('auth-locked');
    if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
  }

  // ====== CHẠY ======
  if (!isActivated()) {
    if (document.body) mountGate();
    else document.addEventListener('DOMContentLoaded', mountGate);
  }
})();
