/**
 * ============================================
 * Common Module - Hàm dùng chung
 * ============================================
 * Header, footer, movie card, pagination...
 */

/**
 * Render header với navigation và search
 * @param {string} activePage - 'home' | 'phim-bo' | 'phim-le' | 'hoat-hinh' | 'favorites'
 */
function renderHeader(activePage = 'home') {
  return `
    <header>
      <div class="nav">
        <a href="index.html" class="logo">MiloxZizi Film</a>
        <ul class="nav-links">
          <li><a href="index.html" class="${activePage === 'home' ? 'active' : ''}">Trang chủ</a></li>
          <li><a href="search.html?type=phim-bo" class="${activePage === 'phim-bo' ? 'active' : ''}">Phim bộ</a></li>
          <li><a href="search.html?type=phim-le" class="${activePage === 'phim-le' ? 'active' : ''}">Phim lẻ</a></li>
          <li><a href="search.html?type=hoat-hinh" class="${activePage === 'hoat-hinh' ? 'active' : ''}">Hoạt hình</a></li>
          <li><a href="search.html?type=tv-shows" class="${activePage === 'tv-shows' ? 'active' : ''}">TV Show</a></li>
          <li><a href="favorites.html" class="${activePage === 'favorites' ? 'active' : ''}">Yêu thích</a></li>
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
      <p style="margin-top:8px;font-size:12px;">Mục đích học tập. Mọi nội dung phim thuộc về VietLe</p>
    </footer>
  `;
}

function handleSearch(event) {
  event.preventDefault();
  const keyword = document.getElementById('searchInput').value.trim();
  if (keyword) {
    window.location.href = `search.html?keyword=${encodeURIComponent(keyword)}`;
  }
}

/**
 * Render 1 movie card
 */
function renderMovieCard(movie) {
  const poster = getPosterUrl(movie);
  const badges = [];
  if (movie.episode_current) {
    badges.push(`<span class="badge">${movie.episode_current}</span>`);
  }
  if (movie.quality) {
    badges.push(`<span class="badge quality">${movie.quality}</span>`);
  }
  if (movie.lang) {
    badges.push(`<span class="badge lang">${movie.lang}</span>`);
  }

  return `
    <a href="movie.html?slug=${movie.slug}" class="movie-card">
      <div class="poster">
        <img src="${poster}" alt="${movie.name}" loading="lazy"
             onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 180 270%22><rect fill=%22%23222%22 width=%22180%22 height=%22270%22/><text x=%2290%22 y=%22135%22 fill=%22%23666%22 text-anchor=%22middle%22 font-size=%2214%22>No Image</text></svg>'"/>
        <div class="badges">${badges.join('')}</div>
      </div>
      <div class="info">
        <div class="name">${movie.name}</div>
        <div class="origin-name">${movie.origin_name || ''} ${movie.year ? '• ' + movie.year : ''}</div>
      </div>
    </a>
  `;
}

/**
 * Render danh sách phim
 * @param {array} movies - Mảng phim
 * @param {string} containerId - ID của container
 */
function renderMovieList(movies, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!movies || movies.length === 0) {
    container.innerHTML = '<div class="empty-state">Không có phim nào.</div>';
    return;
  }
  container.innerHTML = movies.map(renderMovieCard).join('');
}

/**
 * Render pagination
 */
function renderPagination(pagination, onPageClick, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const totalItems = pagination.totalItems || pagination.total_items || 0;
  const itemsPerPage = pagination.totalItemsPerPage || pagination.items_per_page || 10;
  const currentPage = pagination.currentPage || pagination.current_page || 1;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `<button ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">← Trước</button>`;

  // Hiện tối đa 7 nút trang
  const start = Math.max(1, currentPage - 3);
  const end = Math.min(totalPages, start + 6);

  if (start > 1) {
    html += `<button data-page="1">1</button>`;
    if (start > 2) html += `<button disabled>...</button>`;
  }

  for (let i = start; i <= end; i++) {
    html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }

  if (end < totalPages) {
    if (end < totalPages - 1) html += `<button disabled>...</button>`;
    html += `<button data-page="${totalPages}">${totalPages}</button>`;
  }

  html += `<button ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">Sau →</button>`;

  container.innerHTML = html;

  // Bind click events
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

/**
 * Hiển thị loading
 */
function showLoading(containerId) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = '<div class="loading"><div class="spinner"></div><p style="margin-top:12px;">Đang tải...</p></div>';
  }
}

/**
 * Lấy query parameter từ URL
 */
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}
