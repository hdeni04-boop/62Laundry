# API_CONTRACT.md — Code.gs Web App (1 Outlet + A/B/C)

Base URL: `https://script.google.com/macros/s/XXXX/exec` (ganti di frontend/js/config.js)

## Format umum
POST JSON: `{ "action": "...", "token": "TOKEN", "payload": {...} }`
Response: `{ "ok": true, "data": ... }` / `{ "ok": false, "error": "..." }`

GET publik: `?action=ping`, `?action=track&code=LND-...`, `?action=waQR&code=LND-...`

## Actions
login, getServices, getCustomers, createCustomer, createOrder (return +wa_link +track_url),
listOrders, getOrderDetail (return +track_url +wa_link), updateStatus (auto WA log saat SIAP_DIAMBIL/SELESAI),
addPayment, dailyOmzet, waLink {order_id}, seedCheck, ping.

## State machine
DITERIMA -> DICUCI -> DIKERINGKAN -> DISETRIKA -> SIAP_DIAMBIL -> SELESAI; DIBATALKAN terminal kecuali dari SELESAI.

## Script Properties
API_TOKEN, SPREADSHEET_ID, TRACK_BASE (untuk QR nota B), WA_MODE=LINK/FONNTE, FONNTE_TOKEN (opsional C).
Jalankan seedLaundry() sekali untuk A.
