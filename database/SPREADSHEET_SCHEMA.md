# Database — SPREADSHEET_SCHEMA.md (1 Outlet MVP)

Buat 1 file Google Spreadsheet dengan 8 sheet berikut.
Baris 1 = header (beku / Freeze). Jangan ubah urutan kolom.

## 0. OUTLET_DEFAULT
- `Outlets` cukup 1 baris: `OUT-01 | Laundry Barokah | Jl. Contoh No.1 | 0812xxxx`

## 1. Users
| user_id | nama | pin | role | outlet_id | aktif |
|---|---|---|---|---|---|
| USR-01 | Owner | 123456 | owner | OUT-01 | TRUE |
| USR-02 | Kasir 1 | 1111 | kasir | OUT-01 | TRUE |
- `role`: owner / kasir (kurir ditunda Fase-2)
- `pin`: 4-6 digit, disimpan plain di Sheet MVP (jangan share Sheet ke publik).

## 2. Outlets
| outlet_id | nama | alamat | telp |
|---|---|---|---|
| OUT-01 | Laundry Barokah | Jl. Contoh No.1 | 0812xxxx |

## 3. Customers
| customer_id | nama | wa | alamat |
|---|---|---|---|
- `customer_id` format: `CUS-0001` (auto oleh backend).

## 4. Services
| service_id | nama | satuan | harga | estimasi_hari | aktif |
|---|---|---|---|---|---|
| SRV-01 | Cuci Kering Reguler | kg | 7000 | 2 | TRUE |
| SRV-02 | Cuci + Setrika Reguler | kg | 10000 | 3 | TRUE |
| SRV-03 | Express 1 Hari | kg | 15000 | 1 | TRUE |
| SRV-04 | Satuan / Helm / Sepatu | pcs | 25000 | 3 | TRUE |

## 5. Orders
| order_id | tanggal_masuk | customer_id | outlet_id | kasir | total | bayar_dp | sisa | metode | status | estimasi_selesai |
|---|---|---|---|---|---|---|---|---|---|---|
- `order_id`: `LND-YYYYMMDD-0001` (generate server-side, LockService).
- `status`: DITERIMA,DICUCI,DIKERINGKAN,DISETRIKA,SIAP_DIAMBIL,SELESAI,DIBATALKAN
- `metode`: Cash,QRIS,Transfer
- `outlet_id` selalu OUT-01 di MVP (kolom disiapkan untuk multi-outlet).

## 6. OrderItems
| order_id | service_id | qty | harga_satuan | subtotal |

## 7. StatusLogs
| log_id | order_id | dari | ke | oleh | timestamp | catatan |

## 8. Payments
| payment_id | order_id | jumlah | metode | tanggal | kasir |

## Aturan
1. Aktifkan Data Validation untuk Orders.status & Orders.metode.
2. Freeze baris 1 di semua sheet.
3. Share Sheet hanya ke owner + akun deploy Apps Script.
4. Arsip per bulan jika >5000 order/bulan: Orders_2026_10.
