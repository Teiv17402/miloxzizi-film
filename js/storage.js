/**
 * ============================================
 * Storage Module - Quản lý localStorage
 * ============================================
 * Lưu phim yêu thích và lịch sử xem ngay trên trình duyệt
 * Không cần backend, không cần đăng nhập
 */

const STORAGE_KEYS = {
  FAVORITES: 'phim_favorites',
  HISTORY: 'phim_history'
};

// ============== PHIM YÊU THÍCH ==============

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  } catch {
    return [];
  }
}

function addFavorite(movie) {
  const favs = getFavorites();
  if (favs.some(m => m.slug === movie.slug)) return false; // đã có
  favs.unshift({
    slug: movie.slug,
    name: movie.name,
    origin_name: movie.origin_name,
    poster_url: movie.poster_url,
    thumb_url: movie.thumb_url,
    year: movie.year,
    quality: movie.quality,
    lang: movie.lang,
    addedAt: Date.now()
  });
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  return true;
}

function removeFavorite(slug) {
  const favs = getFavorites().filter(m => m.slug !== slug);
  localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
}

function isFavorite(slug) {
  return getFavorites().some(m => m.slug === slug);
}

function toggleFavorite(movie) {
  if (isFavorite(movie.slug)) {
    removeFavorite(movie.slug);
    return false;
  }
  addFavorite(movie);
  return true;
}

// ============== LỊCH SỬ XEM ==============

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Lưu phim đang xem vào lịch sử
 * @param {object} movie - Thông tin phim
 * @param {object} episode - { name, slug, link_m3u8 }
 * @param {number} currentTime - Thời gian đang xem (giây)
 */
function saveHistory(movie, episode, currentTime = 0) {
  let history = getHistory();
  // Xóa entry cũ của phim này (nếu có) để cập nhật mới nhất
  history = history.filter(h => h.slug !== movie.slug);
  history.unshift({
    slug: movie.slug,
    name: movie.name,
    poster_url: movie.poster_url,
    thumb_url: movie.thumb_url,
    episodeName: episode?.name || '',
    episodeSlug: episode?.slug || '',
    currentTime: currentTime,
    watchedAt: Date.now()
  });
  // Giới hạn 50 phim gần nhất
  history = history.slice(0, 50);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

function getHistoryByMovie(slug) {
  return getHistory().find(h => h.slug === slug);
}

function removeFromHistory(slug) {
  const history = getHistory().filter(h => h.slug !== slug);
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
}

function clearHistory() {
  localStorage.setItem(STORAGE_KEYS.HISTORY, '[]');
}
