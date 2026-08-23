/**
 * Common Module - Netflix-style UI helpers
 */

const PLACEHOLDER_POSTER = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 300%22><rect fill=%22%23222%22 width=%22200%22 height=%22300%22/><text x=%22100%22 y=%22150%22 fill=%22%23666%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2216%22>No Image</text></svg>';

function renderHeader(activePage) {
  activePage = activePage || 'home';
  const categoryDropdown = (typeof CATEGORIES !== 'undefined' ? CATEGORIES : [])
    .map(c => '<a href="search.html?category=' + c.slug + '">' + c.name + '</a>')
    .join('');
  const countryDropdown = (typeof COUNTRIES !== 'undefined' ? COUNTRIES : [])
    .map(c => '<a href="search.html?country=' + c.slug + '">' + c.name + '</a>')
    .join('');

  return `
    <header id="mainHeader">
      <div class="nav">
        <a href="index.html" class="logo">MiloxZizi Film</a>
        <ul class="nav-links">
          <li><a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Trang chủ</a></li>
          <li><a href="search.html?type=phim-bo" class="${activePage === 'phim-bo' ? 'active' : ''}">Phim bộ</a></li>
          <li><a href="search.html?type=phim-le" class="${activePage === 'phim-le' ? 'active' : ''}">Phim lẻ</a></li>
          <li><a href="search.html?type=hoat-hinh" class="${activePage === 'hoat-hinh' ? 'active' : ''}">Hoạt hình</a></li>
          <li class="has-dropdown">
            <span class="dropdown-toggle">Thể loại <i class="caret">▾</i></span>
            <div class="dropdown-menu dropdown-grid">${categoryDropdown}</div>
          </li>
          <li class="has-dropdown">
            <span class="dropdown-toggle">Quốc gia <i class="caret">▾</i></span>
            <div class="dropdown-menu dropdown-grid">${countryDropdown}</div>
          </li>
          <li><a href="favorites.html?tab=history" class="${activePage === 'history' ? 'active' : ''}">🕒 Xem gần đây</a></li>
          <li><a href="favorites.html" class="${activePage === 'favorites' ? 'active' : ''}">★ Yêu thích</a></li>
        </ul>
        <form class="search-box" onsubmit="handleSearch(event)">
          <input type="text" id="searchInput" placeholder="Tìm phim..." />
          <button type="submit">Tìm</button>
        </form>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer>
      <p>© 2026 MiloxZizi Film - Website xem phim của bạn | Powered by VietLe</p>
      <p style="margin-top:8px;font-size:12px;">Mục đích học tập. Vui lòng không share nhiều hihi:))</p>
    </footer>
  `;
}

function handleSearch(event) {
  event.preventDefault();
  const keyword = document.getElementById('searchInput').value.trim();
  if (keyword) window.location.href = 'search.html?keyword=' + encodeURIComponent(keyword);
}

function renderMovieCard(movie) {
  const poster = getPosterUrl(movie);
  const badges = [];
  if (movie.episode_current) badges.push('<span class="badge">' + movie.episode_current + '</span>');
  if (movie.quality) badges.push('<span class="badge quality">' + movie.quality + '</span>');
  if (movie.lang) badges.push('<span class="badge lang">' + movie.lang + '</span>');

  const metaItems = [];
  if (movie.year) metaItems.push('<span>' + movie.year + '</span>');
  if (movie.time) metaItems.push('<span>' + movie.time + '</span>');
  if (movie.quality) metaItems.push('<span>' + movie.quality + '</span>');

  return `
    <a href="movie.html?slug=${movie.slug}" class="movie-card">
      <div class="poster">
        <img src="${poster}" alt="${movie.name}" loading="lazy" onerror="this.src='${PLACEHOLDER_POSTER}'"/>
        <div class="badges">${badges.join('')}</div>
        <div class="overlay">
          <div class="play-btn">▶</div>
          <div class="meta">${metaItems.join('')}</div>
        </div>
      </div>
      <div class="info">
        <div class="name">${movie.name}</div>
        <div class="origin-name">${movie.origin_name || ''} ${movie.year ? '• ' + movie.year : ''}</div>
      </div>
    </a>
  `;
}

function renderMovieList(movies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!movies || movies.length === 0) {
    container.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;">Không có phim nào.</div>';
    return;
  }
  container.innerHTML = movies.map(renderMovieCard).join('');
  observeCards(container);
}

// Định dạng giây -> "MM:SS" hoặc "H:MM:SS"
function formatWatchTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = n => String(n).padStart(2, '0');
  return h > 0 ? h + ':' + pad(m) + ':' + pad(s) : m + ':' + pad(s);
}

// Lọc lịch sử ra các phim ĐANG XEM DỞ (có vị trí > 30s, chưa gần hết).
function getContinueWatching() {
  let hist = [];
  try { hist = getHistory(); } catch (e) { return []; }
  return (hist || []).filter(h => {
    if (!h || !h.slug || !(h.currentTime > 30)) return false;
    // Nếu biết thời lượng: bỏ khi đã xem quá 95% (coi như xem xong).
    if (h.duration && h.duration > 0 && h.currentTime > h.duration * 0.95) return false;
    return true;
  });
}

// Render mục "Xem tiếp" (thẻ có thanh tiến trình), link thẳng tới đúng tập.
function renderContinueWatching(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return 0;
  const items = getContinueWatching();
  if (!items.length) { container.innerHTML = ''; return 0; }
  container.innerHTML = items.map(h => {
    const poster = getPosterUrl(h) || PLACEHOLDER_POSTER;
    const pct = (h.duration && h.duration > 0)
      ? Math.min(100, Math.round(h.currentTime / h.duration * 100)) : 0;
    const epParam = h.episodeSlug ? '&ep=' + encodeURIComponent(h.episodeSlug) : '';
    const epLabel = h.episodeName ? h.episodeName + ' • ' : '';
    return `
      <a href="watch.html?slug=${h.slug}${epParam}" class="movie-card">
        <div class="poster">
          <img src="${poster}" alt="${h.name || ''}" loading="lazy" onerror="this.src='${PLACEHOLDER_POSTER}'"/>
          <div class="badges"><span class="badge">▶ ${formatWatchTime(h.currentTime)}</span></div>
          <div class="overlay"><div class="play-btn">▶</div><div class="meta"><span>Xem tiếp</span></div></div>
          <div style="position:absolute;left:0;right:0;bottom:0;height:4px;background:rgba(255,255,255,.25);">
            <div style="height:100%;width:${pct}%;background:var(--accent,#e50914);"></div>
          </div>
        </div>
        <div class="info">
          <div class="name">${h.name || ''}</div>
          <div class="origin-name">${epLabel}Xem tiếp từ ${formatWatchTime(h.currentTime)}</div>
        </div>
      </a>`;
  }).join('');
  observeCards(container);
  return items.length;
}

function showSkeleton(containerId, count) {
  count = count || 12;
  const container = document.getElementById(containerId);
  if (!container) return;
  container.className = 'skeleton-grid';
  let html = '';
  for (let i = 0; i < count; i++) {
    html += '<div class="skeleton-card"><div class="skeleton-poster"></div><div class="skeleton-info"><div class="skeleton-line"></div><div class="skeleton-line short"></div></div></div>';
  }
  container.innerHTML = html;
}

function hideSkeleton(containerId) {
  const container = document.getElementById(containerId);
  if (container) container.className = 'movie-grid';
}

function showLoading(containerId) { showSkeleton(containerId); }

function observeCards(container) {
  const cards = container.querySelectorAll('.movie-card');
  if (!('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('fade-in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const i = Array.from(cards).indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('fade-in'), (i % 6) * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '50px' });
  cards.forEach(c => observer.observe(c));
}

function renderPagination(pagination, onPageClick, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const totalItems = pagination.totalItems || pagination.total_items || 0;
  const itemsPerPage = pagination.totalItemsPerPage || pagination.items_per_page || 10;
  const currentPage = pagination.currentPage || pagination.current_page || 1;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '<button ' + (currentPage <= 1 ? 'disabled' : '') + ' data-page="' + (currentPage - 1) + '">← Trước</button>';
  const start = Math.max(1, currentPage - 3);
  const end = Math.min(totalPages, start + 6);

  if (start > 1) {
    html += '<button data-page="1">1</button>';
    if (start > 2) html += '<button disabled>...</button>';
  }
  for (let i = start; i <= end; i++) {
    html += '<button class="' + (i === currentPage ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
  }
  if (end < totalPages) {
    if (end < totalPages - 1) html += '<button disabled>...</button>';
    html += '<button data-page="' + totalPages + '">' + totalPages + '</button>';
  }
  html += '<button ' + (currentPage >= totalPages ? 'disabled' : '') + ' data-page="' + (currentPage + 1) + '">Sau →</button>';

  container.innerHTML = html;
  container.querySelectorAll('button[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = parseInt(btn.dataset.page);
      if (!isNaN(page)) {
        onPageClick(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function initHeaderScroll() {
  const header = document.getElementById('mainHeader');
  if (!header) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function renderHeroBanner(movies) {
  if (!movies || movies.length === 0) return '';
  const slides = movies.slice(0, 5);
  const slidesHtml = slides.map((m, idx) => {
    const poster = getPosterUrl(m);
    const badges = [];
    if (m.episode_current) badges.push('<span>' + m.episode_current + '</span>');
    if (m.quality) badges.push('<span>' + m.quality + '</span>');
    if (m.year) badges.push('<span>' + m.year + '</span>');
    if (m.lang) badges.push('<span>' + m.lang + '</span>');
    const desc = m.content ? stripHtml(m.content).slice(0, 200) + '...' : 'Phim hấp dẫn đang chờ bạn khám phá.';
    return '<div class="hero-slide ' + (idx === 0 ? 'active' : '') + '" data-idx="' + idx + '">' +
      '<div class="bg" style="background-image: url(\'' + poster + '\')"></div>' +
      '<div class="hero-content">' +
      '<div class="badge-row">' + badges.join('') + '</div>' +
      '<h2>' + m.name + '</h2>' +
      '<div class="origin">' + (m.origin_name || '') + '</div>' +
      '<div class="desc">' + desc + '</div>' +
      '<div class="btn-row">' +
      '<a href="movie.html?slug=' + m.slug + '" class="btn btn-large">▶ Xem ngay</a>' +
      '<a href="movie.html?slug=' + m.slug + '" class="btn btn-secondary btn-large">ⓘ Chi tiết</a>' +
      '</div></div></div>';
  }).join('');
  const indicators = slides.map((_, idx) => '<span class="' + (idx === 0 ? 'active' : '') + '" data-idx="' + idx + '"></span>').join('');
  return '<section class="hero-banner" id="heroBanner">' + slidesHtml + '<div class="hero-indicators">' + indicators + '</div></section>';
}

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const indicators = document.querySelectorAll('.hero-indicators span');
  if (slides.length === 0) return;
  let current = 0;
  let timer;
  function goTo(idx) {
    slides.forEach(s => s.classList.remove('active'));
    indicators.forEach(i => i.classList.remove('active'));
    slides[idx].classList.add('active');
    indicators[idx].classList.add('active');
    current = idx;
  }
  function next() { goTo((current + 1) % slides.length); }
  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, 6000);
  }
  indicators.forEach(ind => {
    ind.addEventListener('click', () => {
      goTo(parseInt(ind.dataset.idx));
      startAuto();
    });
  });
  startAuto();
}

function initDropdownToggle() {
  document.querySelectorAll('.has-dropdown .dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 968) {
        e.preventDefault();
        e.stopPropagation();
        const parent = toggle.parentElement;
        document.querySelectorAll('.has-dropdown').forEach(d => {
          if (d !== parent) d.classList.remove('open');
        });
        parent.classList.toggle('open');
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) {
      document.querySelectorAll('.has-dropdown.open').forEach(d => d.classList.remove('open'));
    }
  });
}

if (document.readyState !== 'loading') {
  setTimeout(() => { initHeaderScroll(); initDropdownToggle(); }, 100);
} else {
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initDropdownToggle();
  });
}
