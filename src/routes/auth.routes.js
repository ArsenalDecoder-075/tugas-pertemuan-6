const router = require("express").Router();
const bcrypt = require("bcryptjs"); //bikin hash password
const jwt = require("jsonwebtoken"); //buat token authentikasi
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient(); //orm bawaan prisma

const { successResponse, errorResponse } = require("../utils/response"); //response standard
const cookieOptions = require("../utils/cookieOptions"); //cookies buat login dan logout

// Untuk register
router.post("/register", async (req, res) => {
  const { email, password } = req.body; //konten data
  try {
    // cek email ada yang ada gk
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(
        res,
        "Email sudah dipake. Ganti yg lain.",
        null,
        400
      );
    }
    // buat fungsi hash buat password
    const hashed = await bcrypt.hash(password, 10); //password yg diinput dihash
    const user = await prisma.user.create({
      data: { email, password: hashed }, //hasil hash dimasukin ke password dan membuat user
    });
    // hasil authentikasi sukses / gagal
    return successResponse(res, "Register successful", {
      id: user.id,
      email: user.email,
    });
  } catch (err) {
    return errorResponse(res, "Register failed", { error: err.message }, 500);
  }
});

// Unutk login
router.post("/login", async (req, res) => {
  const { email, password } = req.body; // isi data badan
  // Akan dicek apakah ada user dengan email tersebut, lalu apakah password input sesuai password pada table
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return errorResponse(res, "Invalid credentials", null, 401);
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res.cookie("token", token, cookieOptions(req)); // save token in cookie
  return successResponse(res, "Login successful", {
    userId: user.id,
    email: email,
    token: token,
  });
});

// Untuk logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    ...cookieOptions(req),
    maxAge: undefined, // override maxAge biar cookie benar-benar terhapus
  });

  return successResponse(res, "Logout successful");
});

module.exports = router;
