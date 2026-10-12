# 🧺 Laundry Barokah — 1 Outlet MVP

Stack: Spreadsheet (DB) + Apps Script Code.gs (Backend) + HTML/CSS/JS Murni (Frontend).

## Struktur
- `frontend/` — index.html, css/style.css, js/{config,api,pos,orders,tracking,laporan}.js
- `backend/Code.gs` + `appsscript.json`
- `database/SPREADSHEET_SCHEMA.md`
- `docs/API_CONTRACT.md`, `DEPLOY.md`

## Jalankan (tanpa deploy Apps Script — mock lokal)
1. `npm start` (atau `node tools/mock-server.js`) → buka **http://localhost:8080**
2. Login PIN `1111` (kasir) atau `123456` (owner) → POS → order → struk+QR → update status → WA.
3. `config.js` otomatis memakai `/exec` lokal di localhost; setelah deploy Apps Script, URL produksi dipakai di domain lain.

## Jalankan produksi
1. Ikuti `docs/DEPLOY.md`.
2. Frontend tanpa build — cukup Live Server / hosting statis.

## Akun contoh
- Owner PIN 123456, Kasir PIN 1111 (ganti setelah deploy).
