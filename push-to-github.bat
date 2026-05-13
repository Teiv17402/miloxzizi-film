@echo off
REM ============================================
REM Script tự động push code lên GitHub
REM Tác giả: Teiv17402
REM ============================================

REM ⚙️ CẤU HÌNH - Sửa REPO_NAME thành tên repo bạn đã tạo trên GitHub
set GITHUB_USER=Teiv17402
set REPO_NAME=miloxzizi-film

REM Commit message tự động (đổi nếu cần)
set COMMIT_MSG=Initial commit: MiloxZizi Film website

echo.
echo ===== BƯỚC 1: Xóa .git cũ (nếu có) =====
if exist .git (
    rmdir /s /q .git
    echo Da xoa .git cu.
)

echo.
echo ===== BƯỚC 2: Khởi tạo Git =====
git init -b main
if errorlevel 1 (
    echo.
    echo [LOI] Chua cai Git! Tai tai: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo.
echo ===== BƯỚC 3: Cấu hình Git (chỉ lần đầu) =====
git config user.name "%GITHUB_USER%"
git config user.email "%GITHUB_USER%@users.noreply.github.com"

echo.
echo ===== BƯỚC 4: Add files và commit =====
git add .
git commit -m "%COMMIT_MSG%"

echo.
echo ===== BƯỚC 5: Kết nối repo GitHub =====
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git

echo.
echo ===== BƯỚC 6: Push lên GitHub =====
echo.
echo [LUU Y] Lan dau push se hien popup yeu cau dang nhap GitHub.
echo Chon "Sign in with your browser" la xong.
echo.
git push -u origin main --force

echo.
if errorlevel 1 (
    echo ===== ❌ PUSH THAT BAI =====
    echo Co the do:
    echo 1. Chua tao repo "%REPO_NAME%" tren GitHub - vao https://github.com/new
    echo 2. Sai ten repo - sua dong "set REPO_NAME=" o dau file
    echo 3. Chua dang nhap GitHub - chay "git config --global credential.helper manager"
) else (
    echo ===== ✅ PUSH THANH CONG =====
    echo.
    echo Repo cua ban: https://github.com/%GITHUB_USER%/%REPO_NAME%
    echo.
    echo === BUOC TIEP THEO: Bat GitHub Pages ===
    echo 1. Vao: https://github.com/%GITHUB_USER%/%REPO_NAME%/settings/pages
    echo 2. Source: chon "Deploy from a branch"
    echo 3. Branch: chon "main" + "/ (root)" - bam Save
    echo 4. Doi 1-2 phut, web cua ban se chay tai:
    echo    https://%GITHUB_USER%.github.io/%REPO_NAME%/
)

echo.
pause
