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

function saveHistory(movie, episode, currentTime = 0) {
  try {
    if (!isStorageAvailable()) return;
    let history = getHistory();
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
    history = history.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    console.log('✓ Đã lưu lịch sử:', movie.name);
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
