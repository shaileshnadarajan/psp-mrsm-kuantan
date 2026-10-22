# PSP MRSM Kuantan — laman web responsif

Fail ini ialah asas laman web responsif untuk komputer dan telefon. Ia mengandungi homepage, pautan WebOPAC/SpTeks/portal MRSM, kalendar V-Booking, borang permohonan, pengumuman, galeri, kemudahan, waktu operasi, video YouTube dan dashboard admin.

## Pilihan hosting yang disyorkan

**Firebase Hosting + Firestore + Authentication** ialah pilihan mudah untuk laman statik dengan kandungan yang disimpan online. Kandungan yang diubah oleh admin akan dikongsi kepada semua pelawat selepas Firebase dikonfigurasi.

### 1. Buat projek Firebase
1. Pergi ke https://console.firebase.google.com/ dan pilih **Add project**.
2. Dalam Project settings, tambah **Web app**.
3. Salin konfigurasi web dan gantikan nilai `PASTE_...` dalam `firebase-config.js`.
4. Dalam **Authentication → Sign-in method**, aktifkan **Email/Password**.
5. Dalam **Authentication → Users**, tambah akaun admin secara manual. Jangan letak kata laluan dalam fail kod.
6. Cipta **Firestore Database**.
7. Tampal kandungan `firestore.rules` ke tab Rules dan tekan Publish.
8. Dalam **Storage**, aktifkan Firebase Storage jika anda mahu tambah muat naik fail gambar pada versi seterusnya. Buat masa ini galeri dan gambar menggunakan URL HTTPS.

### 2. Jalankan dan terbitkan
Cara paling mudah untuk pengguna baharu:
1. Pasang Node.js daripada https://nodejs.org/
2. Pasang Firebase CLI: `npm install -g firebase-tools`
3. Dalam folder laman web ini, jalankan `firebase login`
4. Jalankan `firebase init hosting`, pilih projek Firebase anda, tetapkan folder public sebagai folder semasa (`.`), dan jangan overwrite fail `index.html`.
5. Pilih konfigurasi single-page app: **No**.
6. Terbitkan dengan `firebase deploy --only hosting`.

Jika anda belum biasa dengan command line, gunakan panduan rasmi Firebase Hosting: https://firebase.google.com/docs/hosting/quickstart

## Cara edit
- Buka URL laman web diikuti `/admin.html`.
- Log masuk menggunakan akaun admin yang telah dibuat di Firebase Authentication.
- Edit bahagian melalui tab dan tekan butang **Simpan**.
- Untuk senarai seperti pautan dan galeri, satu item bagi setiap baris, dengan medan dipisahkan menggunakan ` | `.
- Contoh pautan: `WebOPAC | Cari koleksi buku | https://pspmrsmkuantan.com/opac/ | ⌕`
- Untuk YouTube, masukkan pautan video biasa seperti `https://www.youtube.com/watch?v=VIDEO_ID`.

## Penting tentang keselamatan
- Firebase web config bukan kata laluan; keselamatan mesti dikawal melalui Authentication dan Firestore Rules.
- Rules dalam fail ini membenarkan mana-mana akaun yang log masuk mengubah kandungan. Untuk penggunaan rasmi, hadkan hak tulis kepada e-mel pentadbir yang diluluskan atau custom claims sebelum menerbitkan.
- Pengunjung boleh menghantar permohonan tempahan; hanya pengguna log masuk boleh melihat dan mengurus tempahan dalam dashboard.
- Kalendar ini menerima permohonan dan memaparkan tarikh. Ia belum menghalang tempahan bertindih secara automatik dan tidak menjamin bilik telah ditempah; admin perlu mengesahkan status.
- Tanpa konfigurasi Firebase, laman utama masih boleh dibuka sebagai pratonton, tetapi edit online dan perkongsian tempahan tidak akan berfungsi. Borang tempahan pratonton hanya disimpan pada peranti yang digunakan.
- Teks, imej dan waktu operasi yang disediakan ialah kandungan contoh. Sahkan maklumat rasmi PSP sebelum penerbitan.

## Pautan sistem yang telah dimasukkan
- SpTeks: https://pspmrsmkuantan.com/spteks/login.php
- WebOPAC: https://pspmrsmkuantan.com/opac/
- Portal MRSM Kuantan: https://kuantan.mrsm.edu.my/
