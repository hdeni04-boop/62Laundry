# API_CONTRACT.md — Code.gs Web App (1 Outlet)

Base URL: `https://script.google.com/macros/s/XXXX/exec` (ganti di frontend/js/config.js)

## Format umum
Request POST JSON: `{ "action": "namaAction", "token": "TOKEN", "payload": {...} }`
Response: `{ "ok": true, "data": ... }` atau `{ "ok": false, "error": "..." }`

GET publik (tanpa token, untuk QR):
- `?action=ping` -> `{ok:true,data:{time}}`
- `?action=track&code=LND-...` -> detail order terbatas (tanpa nominal sensitif penuh)

## Actions (butuh token kecuali ping/track)
| action | payload | return |
|---|---|---|
| login | {pin} | {user:{user_id,nama,role}} + token dipakai = API_TOKEN |
| getServices | {} | [{service_id,nama,satuan,harga,estimasi_hari}] aktif saja |
| getCustomers | {q?} | list max 100, filter nama/WA |
| createCustomer | {nama,wa,alamat} | {customer_id} |
| createOrder | {customer_id, items:[{service_id,qty}], bayar_dp, metode, catatan} | {order_id,total,sisa,estimasi_selesai} |
| listOrders | {status?, q?, limit?} | [{order_id,tanggal_masuk,customer_nama,total,sisa,status}] max 100 |
| getOrderDetail | {order_id} | {order, items, logs, payments} |
| updateStatus | {order_id, ke, catatan?} | {order_id, dari, ke} (validasi state-machine) |
| addPayment | {order_id, jumlah, metode} | {payment_id, sisa} |
| dailyOmzet | {tanggal? YYYY-MM-DD} | {tanggal, total_omzet, total_order, lunas, belum_lunas} |

## State machine
DITERIMA -> DICUCI -> DIKERINGKAN -> DISETRIKA -> SIAP_DIAMBIL -> SELESAI
DIBATALKAN dari mana saja kecuali SELESAI. DIBATALKAN = terminal.
