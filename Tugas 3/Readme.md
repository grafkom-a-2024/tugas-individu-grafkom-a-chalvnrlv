### 3D Kubus, Piramid, dan Kerucut

![Screenshot 2024-09-22 235849](https://github.com/user-attachments/assets/cad7320a-8d50-4507-94a8-29d88a406657)
![Screenshot 2024-09-22 235857](https://github.com/user-attachments/assets/8fa2c769-9b80-473e-85a0-fa12f83dd866)
![Screenshot 2024-09-22 235911](https://github.com/user-attachments/assets/3eda2247-2511-4a86-a135-44e16fbe7d8c)

Program ini adalah aplikasi WebGL yang menampilkan objek 3D (kubus, kerucut, atau piramida) dengan kontrol interaktif. Berikut adalah penjelasan singkat tentang komponen utamanya:

1. **HTML Struktur**: 
   - Menggunakan elemen `<canvas>` untuk menggambar objek 3D.
   - Menggunakan elemen `<div>` untuk kontrol seperti kecepatan rotasi, translasi, rotasi, dan skala objek.

2. **Style CSS**:
   - Mengatur tampilan kanvas dan kontrol agar terlihat rapi di halaman.

3. **JavaScript**:
   - Menginisialisasi konteks WebGL dan memeriksa apakah didukung oleh browser.
   - Menangani input dari kontrol untuk mengubah parameter objek seperti kecepatan rotasi, posisi, rotasi, dan skala.
   - Mengatur buffer untuk menyimpan data vertice dan indeks sesuai bentuk yang dipilih.
   - Mendefinisikan shader (kode untuk pengolahan grafis) untuk menggambar objek dengan tekstur.
   - Menghitung matriks transformasi untuk mengatur perspektif, translasi, rotasi, dan skala objek.
   - Fungsi `drawScene` menggambar objek di kanvas dan memperbarui frame menggunakan `requestAnimationFrame`.

4. **Tekstur**:
   - Menggunakan tekstur dari gambar yang dimuat untuk memberikan tampilan lebih realistis pada objek.

Dengan aplikasi ini, pengguna dapat berinteraksi secara langsung dengan objek 3D, mengubah tampilannya melalui kontrol yang disediakan.
