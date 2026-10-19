# 🧺 +62Laundry — 1 Outlet MVP

Stack: Spreadsheet (DB) + Apps Script Code.gs (Backend) + HTML/JS vanilla + Tailwind CSS v4 + Lucide (Frontend).

## Fitur UI 2026
- **Tema biru ala mobile app**: header avatar + sapaan "Hi, …", **bottom nav** (Dasbor · POS · Harga · Laporan · Lainnya) + **drawer menu** (Pesanan, Pelanggan, Pengeluaran, Stok, Daftar Harga, Lacak, Bantuan, Setting, Keluar)
- **Daftar Harga**: halaman khusus harga layanan — **owner dapat mengganti harga custom** (langsung dipakai POS & nota)
- **Aksi cepat** di Dasbor: Order Baru, Pesanan, Pelanggan, Harga (tile gaya aplikasi laundry)
- **Dark/Light mode** (toggle 🌙, tersimpan di browser)
- **Ikon Lucide SVG lokal** di semua navigasi/aksi + **tooltip** (`data-tip`) penjelas singkat
- **Dasbor KPI**: omzet hari ini, order masuk, siap diambil, belum lunas + **grafik 7 hari** + sebaran status (klik → filter pesanan)
- **Halaman Pelanggan**: cari, tambah, avatar inisial, aksi cepat order/WA
- **📦 Stok In/Out**: item kebutuhan laundry (deterjen, pewangi, plastik, hanger) — transaksi Masuk/Keluar, bar level, badge MENIPIS saat ≤ minimum, riwayat lengkap
- **❓ Bantuan & FAQ**: 8 pertanyaan umum (akordeon) + kontak pengembang **Deni Hartono** — WA 0821-1526-1194 / denihartono111@gmail.com
- **Bell notifikasi** (auto-refresh 30 dtk) = jumlah pesanan SIAP_DIAMBIL → klik = filter
- **Pesanan**: filter pill status warna-warni, detail **timeline riwayat**, update status state-machine, bayar, cetak ulang, kirim WA
- **Lacak publik** (QR nota): stepper progres 5 tahap + riwayat + status bayar
- Glassmorphism topbar, kartu hover-lift, micro-animation, responsif mobile

## Struktur
- `frontend/` — index.html, css/{style.css,tailwind.input.css}, js aplikasi
- `backend/Code.gs` + `appsscript.json`
- `tools/mock-server.js` — backend lokal berkontrak sama (tanpa deploy)
- `tools/build-frontend.js` — compile Tailwind dan buat ikon Lucide lokal
- `database/SPREADSHEET_SCHEMA.md`, `SEED_DATA.md`
- `docs/API_CONTRACT.md`, `DEPLOY.md`, `WA_OTOMATIS.md`

## Jalankan (tanpa deploy Apps Script — mock lokal)
1. `npm install` untuk mengunduh tool build (hanya diperlukan sekali).
2. `npm start` → compile CSS/ikon lalu jalankan backend lokal; buka **http://localhost:8080**
3. Login dengan PIN kasir/owner → POS → order → struk+QR → update status → WA.
4. `config.js` otomatis memakai `/exec` lokal di localhost; setelah deploy Apps Script, URL produksi dipakai di domain lain.

## Jalankan produksi
1. Ikuti `docs/DEPLOY.md`.
2. Jalankan `npm run build` sebelum membuka `frontend/` langsung dengan Live Server atau mengunggahnya sebagai hosting statis. CSS Tailwind dan ikon Lucide dihasilkan secara lokal; tidak ada CDN runtime.
3. Untuk Vercel, hubungkan repo dengan Root Directory di root; build command `npm run build` menghasilkan aset di folder `frontend` yang disajikan sebagai situs statis.

## Akun contoh
- Kasir PIN 1111, Owner PIN sesuai seed `seedLaundry()` (ganti setelah deploy via menu Setting).
