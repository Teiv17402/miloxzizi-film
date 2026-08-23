/**
 * Storage Module - localStorage with error handling
 */
const STORAGE_KEYS = {
  FAVORITES: 'phim_favorites',
  HISTORY: 'phim_history'
};

function isStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '[]');
  } catch {
    return [];
  }
}

function addFavorite(movie) {
  try {
    if (!isStorageAvailable()) {
      alert('Lỗi: Trình duyệt đang chặn localStorage. Hãy tắt Brave Shields hoặc thoát chế độ ẩn danh!');
      return false;
    }
    const favs = getFavorites();
    if (favs.some(m => m.slug === movie.slug)) return false;
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
    console.log('✓ Đã thêm yêu thích:', movie.name, 'Total:', favs.length);
    return true;
  } catch (e) {
    alert('Lỗi lưu yêu thích: ' + e.message);
    console.error('addFavorite error:', e);
    return false;
  }
}

function removeFavorite(slug) {
  try {
    const favs = getFavorites().filter(m => m.slug !== slug);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
  } catch (e) { console.error(e); }
}

function isFavorite(slug) {
  return getFavorites().some(m => m.slug === slug);
}

function toggleFavorite(movie) {
  if (isFavorite(movie.slug)) {
    removeFavorite(movie.slug);
    return false;
  }
  return addFavorite(movie);
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
  } catch { return []; }
}

function saveHistory(movie, episode, currentTime = 0, duration = 0) {
  try {
    if (!isStorageAvailable()) return;
    let history = getHistory();
    // Giữ lại vị trí cũ nếu lần lưu này không kèm thời gian (vd lần lưu lúc mở phim),
    // để không xoá mất chỗ đang xem đã lưu trước đó.
    const prev = history.find(h => h.slug === movie.slug);
    if ((!currentTime || currentTime <= 0) && prev && prev.currentTime > 0 &&
        prev.episodeSlug === (episode?.slug || '')) {
      currentTime = prev.currentTime;
      if (!duration && prev.duration) duration = prev.duration;
    }
    history = history.filter(h => h.slug !== movie.slug);
    history.unshift({
      slug: movie.slug,
      name: movie.name,
      poster_url: movie.poster_url,
      thumb_url: movie.thumb_url,
      episodeName: episode?.name || '',
      episodeSlug: episode?.slug || '',
      currentTime: currentTime,
      duration: duration || 0,
      watchedAt: Date.now()
    });
    history = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) { console.error('saveHistory error:', e); }
}

function getHistoryByMovie(slug) {
  return getHistory().find(h => h.slug === slug);
}

function removeFromHistory(slug) {
  try {
    const history = getHistory().filter(h => h.slug !== slug);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) { console.error(e); }
}

function clearHistory() {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, '[]');
  } catch (e) { console.error(e); }
}
