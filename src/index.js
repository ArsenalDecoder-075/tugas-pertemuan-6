const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();
const app = express();

// Jika tidak spesifik
app.use(cors());

// Jika ingin spesifik
// const corsOptions = {
//   origin: "https://arsa.com",
//   optionSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/inventory", require("./routes/inventory.routes"));
app.use("/api/product", require("./routes/product.routes"));
app.use("/api/invoice", require("./routes/invoice.routes"));

app.get("/", (req, res) => {
  res.send("API buat arsa_postoko sudah jalan... :D");
});

// Cek apakah gambar yang diakses benar-benar ada
app.use("/uploads", (req, res, next) => {
  const filePath = path.join(__dirname, "..", "uploads", req.path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      message: `Image not found: ${req.path}`,
    });
  }
  next();
});

// Serve file gambar statis
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const PORT = process.env.PORT || 5432;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
