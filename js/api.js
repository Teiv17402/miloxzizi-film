/**
 * ============================================
 * API Module - Kết nối OPhim
 * ============================================
 * File này chứa tất cả các hàm gọi API của OPhim
 * Bạn chỉ cần sửa BASE_URL nếu OPhim đổi domain
 */

// Domain gốc của OPhim - có thể đổi sang ophim17.cc, ophim1.com, v.v...
const API_BASE = 'https://ophim1.com';
// CDN ảnh của OPhim - dùng để load poster phim
const IMG_BASE = 'https://img.ophim.live/uploads/movies/';

/**
 * Lấy danh sách phim mới cập nhật
 * @param {number} page - Số trang (mặc định 1)
 * @returns {Promise} { items: [], pagination: {} }
 */
async function getNewMovies(page = 1) {
  try {
    const res = await fetch(`${API_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`);
    const data = await res.json();
    return {
      items: data.items || [],
      pagination: data.pagination || {}
    };
  } catch (err) {
    console.error('Lỗi getNewMovies:', err);
    return { items: [], pagination: {} };
  }
}

/**
 * Lấy chi tiết phim theo slug (slug = phần cuối URL)
 * @param {string} slug - VD: 'ten-cua-bo-phim'
 * @returns {Promise} { movie: {}, episodes: [] }
 */
async function getMovieDetail(slug) {
  try {
    const res = await fetch(`${API_BASE}/phim/${slug}`);
    const data = await res.json();
    return {
      movie: data.movie || null,
      episodes: data.episodes || []
    };
  } catch (err) {
    console.error('Lỗi getMovieDetail:', err);
    return { movie: null, episodes: [] };
  }
}

/**
 * Tìm kiếm phim theo từ khóa
 * @param {string} keyword - Từ khóa
 * @param {number} page - Số trang
 */
async function searchMovies(keyword, page = 1) {
  try {
    const res = await fetch(
      `${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`
    );
    const data = await res.json();
    return {
      items: data?.data?.items || [],
      pagination: data?.data?.params?.pagination || {}
    };
  } catch (err) {
    console.error('Lỗi searchMovies:', err);
    return { items: [], pagination: {} };
  }
}

/**
 * Lấy danh sách phim theo loại
 * @param {string} type - 'phim-bo' | 'phim-le' | 'hoat-hinh' | 'tv-shows'
 * @param {number} page
 */
async function getMoviesByType(type, page = 1) {
  try {
    const res = await fetch(`${API_BASE}/v1/api/danh-sach/${type}?page=${page}`);
    const data = await res.json();
    return {
      items: data?.data?.items || [],
      pagination: data?.data?.params?.pagination || {}
    };
  } catch (err) {
    console.error('Lỗi getMoviesByType:', err);
    return { items: [], pagination: {} };
  }
}

/**
 * Lọc phim theo thể loại
 * @param {string} categorySlug - VD: 'hanh-dong', 'tinh-cam'
 */
async function getMoviesByCategory(categorySlug, page = 1) {
  try {
    const res = await fetch(`${API_BASE}/v1/api/the-loai/${categorySlug}?page=${page}`);
    const data = await res.json();
    return {
      items: data?.data?.items || [],
      pagination: data?.data?.params?.pagination || {}
    };
  } catch (err) {
    console.error('Lỗi getMoviesByCategory:', err);
    return { items: [], pagination: {} };
  }
}

/**
 * Lọc phim theo quốc gia
 * @param {string} countrySlug - VD: 'han-quoc', 'trung-quoc', 'au-my'
 */
async function getMoviesByCountry(countrySlug, page = 1) {
  try {
    const res = await fetch(`${API_BASE}/v1/api/quoc-gia/${countrySlug}?page=${page}`);
    const data = await res.json();
    return {
      items: data?.data?.items || [],
      pagination: data?.data?.params?.pagination || {}
    };
  } catch (err) {
    console.error('Lỗi getMoviesByCountry:', err);
    return { items: [], pagination: {} };
  }
}

/**
 * Lọc phim theo năm
 * @param {number|string} year
 */
async function getMoviesByYear(year, page = 1) {
  try {
    const res = await fetch(`${API_BASE}/v1/api/nam/${year}?page=${page}`);
    const data = await res.json();
    return {
      items: data?.data?.items || [],
      pagination: data?.data?.params?.pagination || {}
    };
  } catch (err) {
    console.error('Lỗi getMoviesByYear:', err);
    return { items: [], pagination: {} };
  }
}

/**
 * Helper - Lấy URL ảnh poster phim
 * OPhim trả về tên file ảnh - cần ghép với IMG_BASE
 */
function getPosterUrl(movie) {
  if (!movie) return '';
  // Một số phim có URL đầy đủ rồi
  if (movie.poster_url && movie.poster_url.startsWith('http')) {
    return movie.poster_url;
  }
  if (movie.thumb_url && movie.thumb_url.startsWith('http')) {
    return movie.thumb_url;
  }
  return IMG_BASE + (movie.poster_url || movie.thumb_url || '');
}

/**
 * Danh sách thể loại cố định (để filter)
 */
const CATEGORIES = [
  { slug: 'hanh-dong', name: 'Hành động' },
  { slug: 'tinh-cam', name: 'Tình cảm' },
  { slug: 'hai-huoc', name: 'Hài hước' },
  { slug: 'co-trang', name: 'Cổ trang' },
  { slug: 'tam-ly', name: 'Tâm lý' },
  { slug: 'hinh-su', name: 'Hình sự' },
  { slug: 'chien-tranh', name: 'Chiến tranh' },
  { slug: 'the-thao', name: 'Thể thao' },
  { slug: 'vo-thuat', name: 'Võ thuật' },
  { slug: 'vien-tuong', name: 'Viễn tưởng' },
  { slug: 'phieu-luu', name: 'Phiêu lưu' },
  { slug: 'khoa-hoc', name: 'Khoa học' },
  { slug: 'kinh-di', name: 'Kinh dị' },
  { slug: 'am-nhac', name: 'Âm nhạc' },
  { slug: 'than-thoai', name: 'Thần thoại' },
  { slug: 'tai-lieu', name: 'Tài liệu' },
  { slug: 'gia-dinh', name: 'Gia đình' },
  { slug: 'chinh-kich', name: 'Chính kịch' },
  { slug: 'bi-an', name: 'Bí ẩn' },
  { slug: 'hoc-duong', name: 'Học đường' }
];

/**
 * Danh sách quốc gia
 */
const COUNTRIES = [
  { slug: 'viet-nam', name: 'Việt Nam' },
  { slug: 'han-quoc', name: 'Hàn Quốc' },
  { slug: 'trung-quoc', name: 'Trung Quốc' },
  { slug: 'thai-lan', name: 'Thái Lan' },
  { slug: 'au-my', name: 'Âu Mỹ' },
  { slug: 'nhat-ban', name: 'Nhật Bản' },
  { slug: 'dai-loan', name: 'Đài Loan' },
  { slug: 'hong-kong', name: 'Hồng Kông' },
  { slug: 'an-do', name: 'Ấn Độ' },
  { slug: 'anh', name: 'Anh' },
  { slug: 'phap', name: 'Pháp' },
  { slug: 'canada', name: 'Canada' },
  { slug: 'duc', name: 'Đức' },
  { slug: 'tay-ban-nha', name: 'Tây Ban Nha' },
  { slug: 'thuy-dien', name: 'Thụy Điển' },
  { slug: 'philippines', name: 'Philippines' },
  { slug: 'indonesia', name: 'Indonesia' },
  { slug: 'malaysia', name: 'Malaysia' }
];

/**
 * Năm phát hành (10 năm gần nhất)
 */
const YEARS = (() => {
  const arr = [];
  const current = new Date().getFullYear();
  for (let y = current; y >= current - 15; y--) arr.push(y);
  return arr;
})();
