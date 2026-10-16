# HUMORA Admin Console & Content Management System (CMS)
> *"Scroll. laugh. repeat."* — Platform Streaming Video Series Komedi & Hiburan

Prototype antarmuka admin (CMS) dan dashboard analytics modern untuk platform streaming video **HUMORA**. Dikembangkan secara konseptual dan terintegrasi dengan arsitektur data aplikasi mobile HUMORA (`fe-humora`).

---

## 🎯 Gambaran Proyek

Aplikasi ini adalah **frontend prototype tingkat profesional (SaaS-grade)** yang mendemonstrasikan alur kerja kurasi konten, manajemen katalog series dan episode, pengaturan hak akses (*Free Preview* vs *Premium*), tata letak layar beranda aplikasi mobile, serta visualisasi data analitik performa platform.

Seluruh data berjalan secara mandiri di sisi klien (*client-side*) menggunakan **React Context API** dan disinkronkan secara persisten ke **`localStorage` browser**. Tidak memerlukan backend server, database SQL/NoSQL, API eksternal, atau bucket video cloud sungguhan.

---

## 🎨 Identitas Visual & Desain Sistem

Admin Console HUMORA mengadopsi palet warna identitas HUMORA dengan penyesuaian khusus dashboard produktivitas modern:
- **Ungu Utama (`#4B0B7A`)**: Aksen navigasi aktif, tombol aksi utama (*primary action*), dan header status.
- **Ungu Gelap (`#21052F`)**: Navigasi sidebar, kontras tinggi, dan elemen branding.
- **Kuning Cerah (`#FFD52E`)**: Highlight aksen brand, lencana *Premium*, tombol rilis, dan indikator penting.
- **Latar Netral (`#F8F7FA` & `#FFFFFF`)**: Permukaan kartu (*cards*), panel konten, dan tabel untuk kenyamanan membaca dalam waktu lama.
- **Tipografi**: Menggunakan font modern **Plus Jakarta Sans** dengan hierarki ketebalan font (*weight*) yang tegas (400, 500, 600, 700, 800, 900).

---

## 🔐 Logika Model Bisnis & Aturan Hak Akses

Platform HUMORA beroperasi dengan model freemium video series:
1. **Free Preview (Episode 1 & 2)**:
   - Episode 1 dan 2 dari setiap series secara default berstatus `Free Preview`.
   - Pengguna aplikasi mobile dapat menonton tanpa harus berlangganan.
2. **Premium (Episode 3 dan seterusnya)**:
   - Episode ke-3 ke atas berstatus `Premium` dan membutuhkan langganan aktif.
   - Admin memiliki kontrol penuh melalui sakelar (*toggle*) di admin panel untuk mengubah hak akses episode kapan saja.
3. **Dimensi Status Publikasi**:
   - `Published`: Konten telah disiarkan dan langsung muncul pada aplikasi mobile.
   - `Draft`: Konten masih dalam peninjauan internal tim admin dan tidak terlihat oleh pengguna umum.

---

## 🗺️ Peta Navigasi & Fitur Halaman Admin

| Rute | Halaman | Deskripsi Fitur Utama |
|---|---|---|
| `/admin` | **Dashboard Utama** | 6 Kartu KPI utama (Total Pengguna, Views, Watch Time, Subscribers, Pendapatan, Series Aktif), grafik tren interaktif 7h/30h/90h, sebaran genre, peringkat episode terpopuler, dan linimasa aktivitas terkini. |
| `/admin/analytics` | **Analytics Mendalam** | Grafik SVG responsif tanpa library eksternal, filter rentang waktu deterministik, demografi penonton (usia, gender, kota), analisis retensi langganan, dan tabel metrik lengkap. |
| `/admin/series` | **Manajemen Series** | Tampilan *Grid View* dan *Table View*, pencarian real-time, filter kategori & status publikasi, paginasi dinamis, modal konfirmasi penghapusan aman. |
| `/admin/series/create` | **Tambah Series Baru** | Formulir lengkap metadata series dengan pratinjau kartu katalog langsung (*live catalog card preview*). |
| `/admin/series/[id]` | **Detail & Kurasi Series** | Ringkasan metrik series spesifik, daftar episode dengan tombol aksi instan ubah *Free/Premium* dan *Publish/Draft*, reordering episode. |
| `/admin/series/[id]/edit` | **Edit Series** | Modifikasi sinopsis, poster, cover backdrop, tahun rilis, genre multi-pilih, dan urutan katalog. |
| `/admin/videos` | **Videos & Episodes** | Pengelolaan seluruh episode platform, filter lintas series, status akses, status rilis, dan metadata durasi. |
| `/admin/videos/create` | **Tambah Episode Baru** | Auto-suggestion nomor episode berikutnya, radio card pilihan *Free Preview* vs *Premium*, drag-and-drop simulasi file video, dan checklist kelengkapan metadata otomatis. |
| `/admin/videos/[id]/edit` | **Edit Episode** | Perubahan judul, deskripsi, durasi menit:detik, tanggal rilis, thumbnail, dan status akses. |
| `/admin/categories` | **Kategori & Genre** | Tabel kategori lengkap, formulir tambah/edit dengan validasi keunikan slug, serta pengaman penghapusan (*deletion guard*) jika masih ada series terkait. |
| `/admin/subtitles` | **Subtitle & Kepsion** | Pengelolaan trek subtitle multi-bahasa (ID/EN) dan format (SRT/VTT), unduh simulasi file, serta **Modal Pratinjau Cue Lines Interaktif** dengan timestamp penanda waktu. |
| `/admin/users` | **Pengguna Aplikasi** | Daftar pengguna demo, status akun (Aktif/Ditangguhkan), modal detail profil pengguna beserta riwayat tontonan terakhir. |
| `/admin/subscribers` | **Pelanggan Aktif** | Distribusi paket (Bulanan/Tahunan), tanggal kedaluwarsa, nilai kontribusi LTV, dan modal linimasa riwayat perpanjangan langganan. |
| `/admin/transactions` | **Verifikasi & Transaksi** | Manajemen alur 3 status pembayaran (*Menunggu Verifikasi*, *Diverifikasi*, *Ditolak*), pemeriksaan foto bukti transfer bank/QRIS, perbandingan data nominal vs bukti, aktivasi otomatis akun Premium saat disetujui, penolakan bukti palsu/kurang bayar, dan cetak kuitansi digital. |
| `/admin/profile` | **Profil Admin** | Pengelolaan identitas administrator, pembaruan data diri, username, email resmi, kontak, bio tugas, dan pembaruan kata sandi akun pengelola. |
| `/admin/settings` | **Pengaturan Prototype** | Konfigurasi identitas platform, penyesuaian tarif langganan, pengaturan batas episode gratis default, dan tombol **Reset Data Simulasi ke Standar Pabrik**. |

---

## ⚡ Fitur Interaktivitas Tambahan

1. **Global Search Modal (`Ctrl+K` atau `Cmd+K`)**:
   - Dapat diakses dari mana saja menggunakan tombol pintas keyboard atau bilah pencarian topbar.
   - Mengindeks seluruh series, episode, kategori, dan menu navigasi secara instan.
2. **Bilah Filter Terpadu (`SearchFilterBar`)**:
   - Pencarian teks terintegrasi dengan filter multi-kriteria dan dropdown pengurutan (*sorting*).
3. **Paginasi Dinamis (`Pagination`)**:
   - Pilihan jumlah baris per halaman (5, 10, 20, 50) dengan kalkulasi halaman dan label responsif.
4. **Sistem Notifikasi Feedback (`ToastProvider`)**:
   - Pesan feedback sukses, peringatan, info, dan kesalahan yang muncul halus di pojok kanan atas.
5. **Sidebar Adaptif**:
   - Dapat diciutkan (*collapse*) ke mode ramping (*icon-only*) atau diperluas ke 260px.
   - Responsif pada layar mobile/tablet dengan drawer geser.

---

## 🛠️ Stack Teknologi

- **Framework**: Next.js 16 (App Router dengan Turbopack)
- **UI Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4, Custom CSS tokens
- **Icons**: Lucide React
- **Data & State**: React Context API + LocalStorage Persistent Sync
- **Charts**: Zero-dependency Custom Interactive SVG Charts

---

## 🚀 Panduan Memulai Cepat

### Prasyarat
- Node.js versi 18.18 atau lebih tinggi
- npm / yarn / pnpm

### Instalasi & Menjalankan Development Server

```bash
# 1. Pastikan dependensi terpasang
npm install

# 2. Jalankan server pengembangan lokal
npm run dev
```

Buka peramban di `http://localhost:3000` (akan otomatis dialihkan ke `/admin`).

### Pemeriksaan Kualitas Kode & Build Produksi

```bash
# Menjalankan linter ESLint
npm run lint

# Menjalankan build produksi Next.js
npm run build

# Menjalankan server produksi lokal
npm run start
```

---

## 📱 Hubungan dengan Prototype Mobile HUMORA

Aset gambar (poster series, thumbnail episode, cover hero banner) serta metadata series pada admin dashboard ini diselaraskan 100% dengan proyek prototype mobile `fe-humora`:
- *Kontrak Jadi Pacar* (Romcom)
- *Magang Salah Server* (Workplace Comedy)
- *Warung Kopi Gosip* (Sitcom)
- *Keluarga Anti Santai* (Family Comedy)
- *Detektif Part Time* (Action Comedy)
- *Kost Putri 24 Jam* (Youth Comedy)
- *Influencer Kampung* (Satire)
- *Rencana Nikah Batal* (Romantic Comedy)

Admin dapat mengelola katalog series, status langganan, verifikasi pembayaran transaksi, dan visibilitas episode untuk menguji skenario pengalaman pengguna (*user experience*) di kedua sisi secara komprehensif.
