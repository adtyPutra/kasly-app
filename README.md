# Kasly — Aplikasi Manajemen Kas Kelas

[![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vue.js)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## Deskripsi

Kasly adalah aplikasi web manajemen kas kelas yang dirancang untuk memudahkan pengelolaan keuangan kelas secara transparan dan terstruktur. Aplikasi ini menyediakan fitur pencatatan pembayaran kas anggota, manajemen pengeluaran, penarikan dana, laporan keuangan, hingga ekspor data ke format Excel dan PDF.

Sistem ini menggunakan mekanisme autentikasi berbasis role, dengan dua peran utama: **Bendahara** dan **Admin**.

---

## Fitur Aplikasi

| Fitur | Deskripsi |
|---|---|
| Dashboard | Ringkasan keuangan real-time: saldo kas, total pemasukan, pengeluaran bulan ini, dan grafik tren 6 bulan terakhir |
| Pembayaran Kas | Pencatatan pembayaran kas anggota per periode, dengan deteksi status tepat waktu atau terlambat secara otomatis |
| Keuangan | Manajemen pengeluaran kelas dan penarikan dana anggota |
| Data Anggota | Pengelolaan data anggota kelas (tambah, edit, hapus) |
| Laporan | Laporan keuangan lengkap dengan fitur ekspor ke Excel (.xlsx) dan PDF |
| Kegiatan | Pencatatan kegiatan dan aktivitas kelas |
| Manajemen Pengguna | Pengelolaan akun pengguna sistem (Admin only) |
| Notifikasi | Sistem notifikasi internal untuk aktivitas penting |
| Akses Berbasis Role | Kontrol akses menu dan fitur berdasarkan role pengguna (Admin / Bendahara) |
| Responsif | Tampilan yang optimal di perangkat mobile, tablet, dan desktop |

---

## Teknologi yang Digunakan

| Kategori | Teknologi | Versi |
|---|---|---|
| Framework UI | Vue.js | 3 |
| Build Tool | Vite | 8 |
| Database & Autentikasi | Supabase (PostgreSQL) | 2.x |
| State Management | Vue Composables + Reactive Refs | — |
| Routing | Vue Router | 5 |
| Visualisasi Data | Chart.js | 4 |
| Ekspor PDF | jsPDF + jsPDF-AutoTable | 4.x |
| Ekspor Excel | SheetJS (xlsx) | 0.18 |
| Ikon | Lucide Vue Next | 1.x |
| Dialog Konfirmasi | SweetAlert2 | 11 |
| Styling | Vanilla CSS (Custom Design System) | — |

---

## Struktur Direktori

```
kasly/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   └── logo.png
├── src/
│   ├── assets/                         # Aset statis (gambar, ilustrasi)
│   ├── components/
│   │   └── common/
│   │       ├── ConfirmDialog.vue       # Komponen dialog konfirmasi
│   │       ├── Icon.vue                # Wrapper komponen ikon
│   │       ├── Modal.vue               # Komponen modal reusable
│   │       ├── Sidebar.vue             # Navigasi sidebar dengan role-based menu
│   │       ├── Toast.vue               # Komponen notifikasi toast
│   │       └── Topbar.vue              # Komponen header/topbar
│   ├── composables/
│   │   └── useConfirm.js               # Composable untuk dialog konfirmasi
│   ├── lib/
│   │   └── supabase.js                 # Inisialisasi Supabase client
│   ├── router/
│   │   └── index.js                    # Konfigurasi Vue Router dan navigation guard
│   ├── stores/                         # State management (Reactive Stores)
│   │   ├── auth.js                     # Autentikasi, manajemen sesi, dan manajemen user
│   │   ├── anggota.js                  # Data anggota kelas
│   │   ├── categories.js               # Kategori transaksi
│   │   ├── debts.js                    # Pencatatan hutang
│   │   ├── kegiatan.js                 # Data kegiatan/acara kelas
│   │   ├── notifications.js            # Sistem notifikasi internal
│   │   ├── pembayaranKas.js            # Pembayaran kas per periode
│   │   ├── penarikanDana.js            # Penarikan dana anggota
│   │   ├── pengeluaranKelas.js         # Pengeluaran operasional kelas
│   │   ├── periodeKas.js               # Manajemen periode pembayaran kas
│   │   ├── saldo.js                    # Kalkulasi saldo dan ringkasan keuangan
│   │   ├── transactions.js             # Riwayat transaksi gabungan
│   │   └── activities.js              # Log aktivitas sistem
│   ├── utils/
│   │   ├── exportExcel.js              # Logika ekspor laporan ke format .xlsx
│   │   ├── exportPDF.js                # Logika ekspor laporan ke format PDF
│   │   ├── formatters.js               # Fungsi pemformatan angka, tanggal, dan mata uang
│   │   ├── statusHelper.js             # Helper untuk label dan badge status
│   │   ├── storage.js                  # Abstraksi penyimpanan data lokal
│   │   └── uploadFile.js               # Utilitas unggah file ke Supabase Storage
│   ├── views/
│   │   ├── LoginView.vue               # Halaman login
│   │   ├── DashboardView.vue           # Dashboard utama dengan statistik dan grafik
│   │   ├── KasPembayaranView.vue       # Manajemen pembayaran kas anggota per periode
│   │   ├── KeuanganView.vue            # Manajemen pengeluaran dan penarikan dana
│   │   ├── AnggotaView.vue             # Manajemen data anggota
│   │   ├── ReportsView.vue             # Laporan keuangan dan ekspor data
│   │   ├── ActivitiesView.vue          # Manajemen kegiatan kelas
│   │   ├── NotificationsView.vue       # Halaman notifikasi
│   │   ├── CategoriesView.vue          # Manajemen kategori
│   │   ├── DebtView.vue                # Pencatatan hutang
│   │   └── UsersView.vue               # Manajemen pengguna (Admin only)
│   ├── App.vue                         # Root component
│   ├── main.js                         # Entry point aplikasi
│   └── style.css                       # Global stylesheet dan design system
├── .env                                # Environment variables (tidak di-commit)
├── package.json
└── vite.config.js
```

---

## Sistem Autentikasi dan Role

Autentikasi menggunakan **Supabase Auth** dengan pola username berbasis internal. Username dikonversi ke format email `{username}@kasly.com` sebelum dikirim ke Supabase.

Setiap pengguna memiliki satu dari dua role berikut:

| Role | Akses |
|---|---|
| `admin` | Seluruh fitur, termasuk manajemen pengguna sistem dan semua fitur bendahara |
| `bendahara` | Dashboard, Anggota, Kas, Keuangan, Kegiatan, Laporan |

Navigation guard pada Vue Router secara otomatis membatasi akses halaman berdasarkan role yang tersimpan di tabel `profiles`.

---

## Skema Database

Aplikasi terhubung ke **Supabase** (PostgreSQL) dengan tabel-tabel utama sebagai berikut:

```sql
-- Profil pengguna (disinkronkan dari Supabase Auth)
CREATE TABLE profiles (
    id        UUID PRIMARY KEY REFERENCES auth.users(id),
    nama      TEXT NOT NULL,
    username  TEXT UNIQUE NOT NULL,
    role      TEXT NOT NULL  -- 'admin' atau 'bendahara'
);

-- Data anggota kelas
CREATE TABLE anggota (
    id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama  TEXT NOT NULL
);

-- Periode pembayaran kas (contoh: Januari 2025)
CREATE TABLE periode_kas (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bulan             INTEGER NOT NULL,
    tahun             INTEGER NOT NULL,
    nominal           NUMERIC NOT NULL,
    batas_pembayaran  DATE,
    UNIQUE (bulan, tahun)
);

-- Riwayat pembayaran kas anggota
CREATE TABLE pembayaran_kas (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anggota_id     UUID REFERENCES anggota(id),
    periode_id     UUID REFERENCES periode_kas(id),
    nominal        NUMERIC NOT NULL,
    tanggal_bayar  DATE NOT NULL,
    status         TEXT NOT NULL,  -- 'sudah_bayar' atau 'telat_bayar'
    dicatat_oleh   UUID REFERENCES profiles(id),
    created_at     TIMESTAMPTZ DEFAULT now(),
    updated_at     TIMESTAMPTZ DEFAULT now(),
    UNIQUE (anggota_id, periode_id)
);

-- Penarikan dana anggota
CREATE TABLE penarikan_dana (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anggota_id  UUID REFERENCES anggota(id),
    nominal     NUMERIC NOT NULL,
    tanggal     DATE NOT NULL,
    keterangan  TEXT,
    status      TEXT DEFAULT 'aktif'
);

-- Pengeluaran operasional kelas
CREATE TABLE pengeluaran_kelas (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nominal      NUMERIC NOT NULL,
    tanggal      DATE NOT NULL,
    keterangan   TEXT,
    kategori_id  UUID,
    status       TEXT DEFAULT 'aktif'
);
```

---

## Instalasi dan Menjalankan Secara Lokal

### Prasyarat

- Node.js versi 18 atau lebih baru
- npm (disertakan dalam instalasi Node.js)
- Akun Supabase aktif (tersedia gratis di [supabase.com](https://supabase.com))

### Langkah-langkah

**1. Clone repository**

```bash
git clone https://github.com/adtyPutra/kasly-app.git
cd kasly-app
```

**2. Install dependensi**

```bash
npm install
```

**3. Konfigurasi environment variables**

Buat file `.env` di root direktori proyek dengan isi berikut:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Nilai tersebut dapat diperoleh dari: **Supabase Dashboard > Project Settings > API**

**4. Setup database**

Jalankan skrip SQL skema di atas melalui Supabase SQL Editor, kemudian tambahkan akun pengguna pertama (admin) melalui Supabase Authentication.

**5. Jalankan server development**

```bash
npm run dev
```

Aplikasi dapat diakses di `http://localhost:5173`.

---

## Perintah yang Tersedia

| Perintah | Keterangan |
|---|---|
| `npm run dev` | Menjalankan server development Vite dengan hot-reload |
| `npm run build` | Mem-build aplikasi untuk lingkungan production |
| `npm run preview` | Menjalankan preview hasil build secara lokal |

---

## Fitur Ekspor Laporan

Aplikasi menyediakan dua format ekspor laporan keuangan:

**Ekspor Excel (.xlsx)**
- Menggunakan library SheetJS
- Menyertakan ringkasan saldo, rincian pembayaran per anggota, pengeluaran, dan penarikan dana
- File yang dihasilkan siap dibuka di Microsoft Excel atau Google Sheets

**Ekspor PDF**
- Menggunakan library jsPDF dan jsPDF-AutoTable
- Menyertakan kop laporan, tabel data terformat, dan ringkasan akhir
- Cocok untuk keperluan dokumentasi dan pencetakan fisik

---

## Alur Penggunaan Aplikasi

```
Halaman Login
  └── Masukkan username dan password
        └── Autentikasi via Supabase Auth
              └── Redirect ke Dashboard berdasarkan role

Dashboard
  ├── Kas Pembayaran        (Bendahara / Admin)
  │     └── Pilih periode → Catat pembayaran anggota → Update status otomatis
  ├── Keuangan              (Bendahara / Admin)
  │     ├── Tambah pengeluaran kelas
  │     └── Catat penarikan dana anggota
  ├── Data Anggota          (Bendahara / Admin)
  │     └── Tambah / edit / hapus anggota
  ├── Laporan               (Bendahara / Admin)
  │     └── Lihat rekap keuangan → Ekspor ke Excel atau PDF
  ├── Kegiatan              (Bendahara / Admin)
  │     └── Catat kegiatan dan aktivitas kelas
  └── Manajemen Pengguna    (Admin only)
        └── Tambah / edit / hapus akun pengguna sistem
```

---

## Informasi Pengembang

| Keterangan | Detail |
|---|---|
| Nama | Putra Aditya Hartanto |
| GitHub | [adtyPutra](https://github.com/adtyPutra) |

---

*Seluruh hak cipta dimiliki oleh pengembang. Dilarang menggunakan, menyalin, atau mendistribusikan ulang tanpa izin tertulis dari pemilik.*
