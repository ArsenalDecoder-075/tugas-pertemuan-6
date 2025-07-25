const cookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true, //Cookie gak bisa diakses lewat JavaScript di browser biar aman dari XSS.
    secure: isProduction && req.hostname !== "localhost", // ⛔ cookie harus HTTPS di production
    sameSite: "Strict", //Mencegah cookie dikirim lintas domain — buat keamanan terhadap CSRF.
    path: "/", //Cookie tersedia untuk semua path di domain kamu (bukan hanya 1 route).
    maxAge: 24 * 60 * 60 * 1000, // Perhitunagn milidetik jadi acookie aktif 1 hari
  };
};

module.exports = cookieOptions;
