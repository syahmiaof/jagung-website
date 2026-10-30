# Bedah Seni & Seni Bina: Pioneer – Corn. Revolutionized. (Resn)

Dokumen ini membedah secara menyeluruh struktur kejuruteraan, grafik 3D, dan seni bina interaktif laman web **[Pioneer – Corn. Revolutionized.](https://cornrevolution.resn.global/)** yang dibina oleh agensi kreatif bertaraf dunia, **Resn**.

---

## 1. Seni Bina Sistem (Architecture Overview)

Laman web ini bukanlah laman web biasa dengan teks DOM/HTML, sebaliknya merupakan **aplikasi 3D WebGL interaktif penuh**. Hampir 99% elemen visual — termasuklah tipografi tajuk dan nombor — dilukis terus di dalam kanvas WebGL menggunakan GPU.

### Ringkasan Stack:
* **Enjin Grafik:** Three.js r102 (diintegrasikan bersama enjin proprietary Resn, *Jelly Web3D*).
* **Enjin Animasi & Fizik Kamera:** GreenSock Animation Platform (GSAP v2.1.2 — TweenLite, TimelineMax, CustomEase, Power3/Quart).
* **Pemampatan Tekstur GPU:** Khronos KTX 1.1 (`WEBGL_compressed_texture_s3tc` untuk PC/Desktop, ASTC/PVRTC untuk mobile).
* **Format Model 3D:** Khronos glTF 2.0 (ASCII `.gltf` + Binary buffers `.bin`).
* **Tipografi 3D WebGL:** MSDF (*Multi-channel Signed Distance Field*) Text Meshes (menggunakan library `msdf-jam-3` & shader khas).
* **State Management:** Reactive Store (Store/Event Dispatcher tersuai untuk kawalan bab/seksyen, scroll delta, dan status interaksi).

---

## 2. Bedah Komponen Utama

### A. Bab 1: "Landing" (Jagung 3D Ultra-Realistik)
* **Model:** 
  * `cobb_test.gltf` + `.bin` (isi dan tongkol jagung).
  * `hair.gltf` + `.bin` (bulu/rambut jagung — *corn silk*).
* **Shader & Teknik Tekstur:**
  * Menggunakan teknik **Multi-Texture Blending**: Array 5 keping tekstur KTX beresolusi tinggi (`uTextures[5]`: `TOP_L`, `TOP_R`, `BOTTOM_L`, `BOTTOM_R`, dan `alpha.ktx`).
  * Vertex shader menggunakan **GPU Skeletal Skinning (`SkinnedMesh`)** dan formula sinus/kosinus halus untuk memberikan kesan bulu jagung bergoyang ditiup angin.
  * Fragment shader mengira *depth point displacement* dan *color gradient blending* untuk memisahkan tongkol dan lapisan bulu jagung secara telus (*transparent depth test*).

### B. Bab 2: "Science / Germplasm Library" (Ladang & Molekul)
* **Model & Alam Sekitar:**
  * `assets/pot3.gltf` & `assets/bg_pot.gltf`.
* **Teknik Instancing Tanah & Ladang:**
  * Menggunakan **Hardware Instanced Meshes** (`tile-instances-vs.glsl`). Daripada memuatkan ribuan pokok jagung secara manual, Resn melukis grid jubin (*tiles*) menggunakan satu arahan *draw call* (`gl.drawArraysInstanced`).
  * Lapisan tanah (`ground-vs.glsl` & `ground-fs.glsl`) mengadun tekstur `map-ground-diffuse@mipmaps.ktx` dan peta hingar awan `map-cloud-noise@mipmaps.ktx` untuk menghasilkan bayang-bayang awan yang bergerak di atas ladang secara real-time.

### C. Bab 3: "Real World Testing" (Batang Jagung Beranimasi & Stress Test)
* **Model:**
  * `images/stalk/stalk_rigged3.gltf` + `stalk_rigged3.bin` (Batang jagung dengan rig tulang / *skeleton armature*).
  * `SingleStalk12_db.gltf` + `.bin`.
* **Simulasi Ujian Lapangan (Wind, Drought, Nutrients):**
  * **Ujian Angin (Wind):** Tulang-tulang (*bones*) pada `stalk_rigged3` dilenturkan menggunakan pengiraan fizik spring matematik dalam GSAP untuk mensimulasikan mesin angin *Boreas*.
  * **Ujian Kemarau (Drought):** Menggunakan teknik **Reveal Map Shading** (`SingleStalk_DifF_0007_DEAD.ktx` vs `SingleStalk_DifF_0007_reveal.ktx`). Apabila pengguna memilih keadaan kemarau, shader menginterpolasikan nilai warna daripada hijau segar kepada layu/kering secara lancar tanpa perlu memuatkan model baru.
  * **Tanah & Nutrien:** Tekstur tanah bertukar dinamik mengikut jenis nutrien: `soil_nutrients_clay`, `soil_nutrients_loam`, dan `soil_nutrients_sand`.

### D. Bab 4: "Result" (Anatomi Butiran Biji Jagung / Kernel)
* **Model:** `models/kernel/KERNAL.gltf` + `KERNAL.bin`.
* **Shader:** Menggunakan teknik **Matcap Shading** (`map_matcap_mult.ktx` dan `map_matcap_screen.ktx`) bersama peta benjolan (*bump map* `map_bump_kernel.ktx`). Teknik ini memberikan pantulan cahaya studio berkilat pada biji jagung tanpa bebanan pengiraan lampu dinamik sebenar (*expensive real-time ray-traced shadows*).

---

## 3. Rahsia Tipografi 3D: MSDF (Multi-channel Signed Distance Field)

Dalam pembangunan WebGL biasa, teks HTML diletakkan terapung (*absolute positioning*) di atas kanvas. Namun Resn meletakkan teks **di dalam 3D scene itu sendiri**:
1. Font Gilroy dan Manifold CF ditukar kepada peta MSDF:
   * `fonts/Gilroy/gilroy-msdf.png` + `gilroy.json`
   * `fonts/Manifold/manifold-msdf.png` + `manifold.json`
2. Shader membaca jarak vektor RGB pada tekstur MSDF.
3. **Kelebihan:** Teks tidak pernah kabur (*blurry*) atau pecah pixel walaupun kamera 3D dizum rapat, diputar bersudut condong, atau digerakkan pada monitor 4K.

---

## 4. Cara Menjalankan & Bereksperimen Secara Lokal

Kod dan aset original telah diekstrak dan dibina semula ke dalam direktori:
`c:\Users\USER\Desktop\ui-gempak\ui-jagung`

### Langkah Menjalankan:
1. Buka terminal di dalam folder `ui-jagung`:
   ```powershell
   cd C:\Users\USER\Desktop\ui-gempak\ui-jagung
   npm run dev
   ```
2. Buka pelayar web di:
   **`http://127.0.0.1:4180`**

### Idea Eksperimen yang Boleh Dicuba:
1. **Tukar Warna / Pencahayaan Kernel:**
   Ubah suai fail tekstur `public/compressed/s3tc/kernel/map_diffuse_kernel.ktx` atau ubah suai shader matcap.
2. **Ubah Suai Salinan Teks (Copywriting):**
   Buka `public/main.76ceb4644b28bd9c30b5.js` pada Module `369` untuk menukar sebarang teks tajuk, penerangan, dan CTA.
3. **Gantikan Model 3D:**
   Eksport model glTF anda sendiri (cth: Blender) dan letakkan menggantikan `models/landing/cobb_test.gltf` atau `models/kernel/KERNAL.gltf`.
