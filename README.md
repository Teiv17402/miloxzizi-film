# MiloxZizi Film - Website xem phim cá nhân

Website xem phim online sử dụng API miễn phí từ OPhim. Code thuần HTML/CSS/JavaScript, không cần backend, deploy được trên GitHub Pages.

## Tính năng

- Trang chủ hiển thị phim mới cập nhật + phân trang
- Trang chi tiết phim với poster, mô tả, danh sách diễn viên
- Player xem phim hỗ trợ HLS (.m3u8) qua HLS.js
- Chuyển server, chuyển tập dễ dàng
- Tìm kiếm phim theo từ khoá
- Lọc phim theo loại (phim bộ/lẻ/hoạt hình), thể loại, quốc gia, năm
- Phim yêu thích (lưu trong trình duyệt)
- Lịch sử xem (lưu trong trình duyệt, tối đa 50 phim gần nhất)
- Responsive — chạy tốt trên cả điện thoại

## Cấu trúc thư mục

```
phim-website/
├── index.html          # Trang chủ
├── movie.html          # Chi tiết phim
├── watch.html          # Trang xem phim (player HLS)
├── search.html         # Tìm kiếm + lọc
├── favorites.html      # Phim yêu thích & lịch sử
├── css/
│   └── style.css       # CSS toàn bộ website
├── js/
│   ├── api.js          # Các hàm gọi OPhim API
│   ├── storage.js      # Quản lý localStorage (favorites/history)
│   └── common.js       # Hàm dùng chung (header, card, pagination)
└── README.md
```

## Cách chạy thử trên máy

**Cách 1: Mở trực tiếp file**

Click đúp vào `index.html` — trình duyệt sẽ mở website ngay. Một số trình duyệt có thể chặn fetch API khi mở bằng `file://`, nếu vậy dùng cách 2.

**Cách 2: Chạy local server (khuyến nghị)**

Mở Terminal/CMD trong thư mục dự án rồi chạy:

```bash
# Nếu có Python 3
python -m http.server 8000

# Hoặc Node.js
npx serve .
```

Mở trình duyệt vào `http://localhost:8000`.

## Hướng dẫn deploy GitHub Pages

### Bước 1: Tạo tài khoản GitHub

Vào https://github.com đăng ký tài khoản (miễn phí).

### Bước 2: Tạo repository mới

1. Click nút `+` trên thanh menu → `New repository`
2. Đặt tên repo, ví dụ: `miloxzizi-film`
3. Chọn **Public** (GitHub Pages free chỉ chạy với repo public)
4. KHÔNG tích "Add README" (vì chúng ta đã có)
5. Click `Create repository`

### Bước 3: Upload code lên GitHub

**Cách dễ nhất - dùng web interface:**

1. Trong repo vừa tạo, click `uploading an existing file`
2. Kéo thả TẤT CẢ file & thư mục trong `phim-website` vào (kéo cả thư mục `css`, `js`)
3. Scroll xuống, click `Commit changes`

**Cách dùng Git (nâng cao):**

```bash
cd phim-website
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/miloxzizi-film.git
git push -u origin main
```

### Bước 4: Bật GitHub Pages

1. Vào repo → tab `Settings`
2. Menu bên trái, click `Pages`
3. Mục `Source`: chọn `Deploy from a branch`
4. Mục `Branch`: chọn `main` + folder `/ (root)`
5. Click `Save`

Đợi khoảng 1-2 phút, GitHub sẽ tạo URL dạng:

```
https://USERNAME.github.io/miloxzizi-film/
```

Mở URL đó là xem được website của bạn rồi!

## Cách tuỳ chỉnh

### Đổi tên website

Mở file `js/common.js`, tìm dòng:
```js
<a href="index.html" class="logo">MiloxZizi Film</a>
```
Đổi `MiloxZizi Film` thành tên bạn thích.

### Đổi màu sắc

Mở `css/style.css`, sửa biến CSS ở đầu file:
```css
:root {
  --accent: #e50914;   /* Màu chính - đổi sang #00bcd4 nếu thích xanh */
  --bg-primary: #0f0f0f;
}
```

### Đổi nguồn API

Mở `js/api.js`, sửa dòng đầu:
```js
const API_BASE = 'https://ophim1.com';   // Đổi sang ophim17.cc, kkphim.com...
```

## Khắc phục sự cố

**1. Không tải được phim / lỗi CORS**

Một số trình duyệt chặn fetch khi mở bằng `file://`. Giải pháp:
- Dùng local server (Python/Node)
- Hoặc deploy lên GitHub Pages
- Hoặc cài extension "CORS Unblock" cho Chrome

**2. Video không phát**

- Kiểm tra Console (F12) xem có lỗi gì
- Có thể link .m3u8 đã hết hạn — chọn server khác
- OPhim đôi khi đổi CDN — đợi tí rồi thử lại

**3. Ảnh poster không hiện**

- Kiểm tra Network tab xem ảnh có load được không
- Nếu OPhim đổi domain ảnh, sửa biến `IMG_BASE` trong `js/api.js`

## Lưu ý pháp lý

Website này CHỈ dùng API public của OPhim, không host phim riêng. Mọi nội dung phim thuộc bản quyền của OPhim và các bên liên quan.

**Khuyến nghị:** Chỉ dùng cho mục đích học tập cá nhân, KHÔNG nên chạy quảng cáo hoặc thu tiền từ website này vì có thể vi phạm bản quyền.

## Học thêm

- HLS.js docs: https://github.com/video-dev/hls.js/
- OPhim docs (nếu có): tìm trên forum hoặc GitHub
- GitHub Pages: https://pages.github.com/

Chúc bạn làm web vui vẻ!
