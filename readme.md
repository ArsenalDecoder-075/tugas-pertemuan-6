<!-- buat root folder dan buka terminal

ketik "npm init -y"
|->bikin file package.json secara otomatis tanpa nanya-nanya buat nyimpen info project dan semua dependency

ketik "npm install bcryptjs cors dotenv express jsonwebtoken uuid multer cookie-parser @prisma/client"
|-> install package yang butuhin buat jalanin aplikasi Node.js
bcryptjs, menghash password
cors, setting url untuk setiap domain
dotenv,
express, framework buat bikin API
jsonwebtoken, buat bikin dan verifikasi token JWT (buat sistem login).
uuid, buat generate ID unik
multer, buat handle upload file
cookie-parser, buat baca cookies dari request
@prisma/client, bagian dari Prisma ORM buat interaksi database

ketik "npm install nodemon prisma --save-dev"
|-> install tool dev-only buat pas ngembangin, gak buat production

buat 1 folder bernama src
buat 3 folder dalam /src bernama middleware, routes, dan utils

npx prisma init --db
|-> buat bikin folder prisma/ dan file schema.prisma dalemnya, bikin file .env buat nyimpen URL database, dan otomatis set database provider di file schema.prisma.

Pada prima/schema.prisma ubah provider menjadi "mysql" pada datasourscedb.

Pada .env tambahkan:
JWT_SECRET, node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
PORT, 5432
BASE_URL, http://localhost:5432

Buat database (arsa_postoko)

Untuk DATABASE_URL pada .env sesuaikan provider database, nama pengguna database, nomor port localhost, dan nama database yang inging digunakan.
|-> mysql://root:root@localhost:3306/arsa_postoko

Pada prisma/schema.prisma isilah dengan model yang ingin dimiliki table.

Pada src/middleware tambahkan file "auth.middleware.js" yang beraksi sebagai middleware yang ngecek dan verifikasi token JWT buat ngejaga route yang butuh user login.

Pada src/routes buat route auth.routes.js, inventory.routes.js, product.routes.js. Untuk setiap route pastikan ada fungsi CRUD.

Buat file cookieOptions.js di folder src/utils buat nyimpen konfigurasi opsi cookie sesuai environment (development atau production), untuk dipakai di seluruh aplikasi saat setting cookie HTTP.

File response.js di folder src/utils helper functions untuk mengirimkan response standar dari server ke client dalam format JSON, agar response API konsisten dan mudah dipahami.

upload.js menanganin process upload dengan menentukan multer, destinasi folder menampung foto, dan menentukan nama file saat diupload.

Isi index.js dengan setup Express, dengan CORS, parsing JSON, route API, pengecekan file gambar, dan serve file statis, lalu jalankan server di port pada .env.

cli jalankan prisma (prisma.schema) di terminal sebagai migrasi
|-> npx prisma generate (migrasi)
|-> npx prisma migrate dev --name init-uuid (inisiasi ini prisma dan uuid)

Jalankan di terminal dengan:
|-> npm run dev
\*pastikan path generated/prisma sesuai dengan build (index.js didalem /src dan /generated ada diluar jadi harus back dari folder dua kali = ../../ untuk bisa dibaca alurnya.)

Cek Fungsi pada Postman dengan url: http://localhost:5432 -->
