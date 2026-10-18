# DEPLOY.md — Laundry 1 Outlet (Spreadsheet + Apps Script + Tailwind CSS)

## 1. Buat Spreadsheet
1. Google Sheets baru > rename 8 sheet: Users, Outlets, Customers, Services, Orders, OrderItems, StatusLogs, Payments.
2. Isi baris header sesuai `database/SPREADSHEET_SCHEMA.md` + 1 baris outlet OUT-01 + user owner/kasir + 4 service contoh.
3. Freeze baris 1. Tambah Data Validation untuk Orders.status & Orders.metode.

## 2. Pasang Backend
1. Extensions > Apps Script > hapus Code.gs bawaan > paste isi `backend/Code.gs`.
2. Project Settings > Script Properties: `API_TOKEN=GANTI_TOKEN_RAHASIA`, `SPREADSHEET_ID=<id sheet dari URL>`.
3. Deploy > New deployment > Web app: Execute as=Me, Access=Anyone. Copy URL /exec.
4. Uji: buka `<URL>?action=ping` harus JSON ok:true.

## 3. Sambung Frontend
1. Edit `frontend/js/config.js`: isi WEB_APP_URL + TOKEN.
2. Jalankan `npm install` lalu `npm run build` dari root repository agar CSS Tailwind dan ikon Lucide dibuat secara lokal. Setelah itu, buka via Live Server / hosting statis. Login PIN (cth 1111).
3. Alur uji: buat customer (manual tambah sheet dulu) > POS > buat order > Orders > update status > cetak struk > tracking `?code=LND-...`.

### Deploy ke Vercel
Konfigurasi `vercel.json` di root menjalankan `npm run build` lalu mengarahkan Vercel untuk menyajikan folder `frontend` sebagai situs statis. Hubungkan repository ke Vercel dengan Root Directory tetap di root repository, lalu deploy. Jangan set Root Directory ke `frontend`, karena konfigurasi Vercel berada di root.

### Mode Demo (tanpa backend — untuk pratinjau di Vercel)
Buka `https://<app-anda>.vercel.app/?demo=1` → login PIN `1111`/`123456` langsung masuk **tanpa backend**. Cocok untuk demo tampilan. Catatan: hanya login yang offline; menu yang butuh data (POS, Pesanan, dsb) tetap memerlukan backend. Untuk operasional penuh, selesaikan langkah 2 (Deploy Apps Script) lalu isi URL `/exec` di `frontend/js/config.js` dan redeploy.

## 4. Operasional
- Ganti PIN owner setelah go-live. Rotasi API_TOKEN berkala.
- Backup: File > Make a copy mingguan. Arsip Orders per bulan jika >5000 baris.
