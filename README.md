# Sistem Identifikasi Gangguan Fiber Optik

Web statis berbasis Bootstrap untuk identifikasi gangguan jaringan fiber optik pada PT Telkom Maluku menggunakan metode forward chaining.

## Fitur Utama

- Form konsultasi gejala berbasis checklist.
- Mesin inferensi forward chaining (aturan IF-THEN).
- Hasil diagnosis gangguan beserta rekomendasi tindakan.
- Jejak inferensi aturan yang ditembak (fired rules).
- Tampilan basis pengetahuan: gejala, gangguan, dan aturan.

## Struktur Proyek

- `index.html` : halaman utama.
- `style.css` : gaya visual kustom.
- `app.js` : data pengetahuan + logika inferensi.

## Cara Menjalankan

1. Buka folder proyek di browser.
2. Jalankan file `index.html`.
3. Pilih gejala yang sesuai kondisi lapangan.
4. Klik **Identifikasi Gangguan** untuk melihat hasil.

## Catatan

Sistem ini adalah prototipe sistem pakar berbasis aturan. Basis pengetahuan dapat dikembangkan lebih lanjut sesuai SOP, data gangguan historis, dan validasi tim teknis lapangan PT Telkom Maluku.
