const router = require("express").Router();
const { PrismaClient } = require("../../generated/prisma");
const prisma = new PrismaClient();
const auth = require("../middleware/auth.middleware");
const upload = require("../utils/upload");

const fs = require("fs");
const path = require("path");
require("dotenv").config();
const BASE_URL = process.env.BASE_URL || "http://localhost:5432";

const { successResponse, errorResponse } = require("../utils/response");

// buat bersihin url untuk gambar, dimanan dipastikan gk ada slash 2x
const cleanImageUrl = (base, imagePath) =>
  base.replace(/\/$/, "") + "/" + imagePath.replace(/^\//, "");

// ambil semua produk
router.get("/", async (req, res) => {
  const products = await prisma.product.findMany();

  if (!products || products.length === 0) {
    return errorResponse(res, "No products found", null, 404);
  }

  const base = `${req.protocol}://${req.get("host")}`;
  const productsWithImageUrl = products.map((product) => ({
    ...product,
    image: product.image ? cleanImageUrl(base, product.image) : null,
  }));

  return successResponse(
    res,
    "Get all products successful",
    productsWithImageUrl
  );
});

// ambil semua produk yang ada inventory
router.get("/inventory/:id", async (req, res) => {
  const { id } = req.params;

  const products = await prisma.product.findMany({
    where: { inventoryId: id },
  });

  if (!products || products.length === 0) {
    return errorResponse(
      res,
      "No products found for this inventory",
      null,
      404
    );
  }

  const base = `${req.protocol}://${req.get("host")}`;
  const productsWithImageUrl = products.map((product) => ({
    ...product,
    image: product.image ? cleanImageUrl(base, product.image) : null,
  }));

  return successResponse(
    res,
    "Get products by inventory successful",
    productsWithImageUrl
  );
});

// GET single product by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return errorResponse(res, "Product not found", null, 404);
  }

  const base = `${req.protocol}://${req.get("host")}`;
  const productWithImage = {
    ...product,
    image: product.image ? cleanImageUrl(base, product.image) : null,
  };

  return successResponse(res, "Get product by id successful", productWithImage);
});

// All routes below require authentication
router.use(auth);

// POST create product
router.post("/", upload.single("image"), async (req, res) => {
  const { name, price, description, stock, inventoryId } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });
    if (!inventory) {
      return errorResponse(
        res,
        `Inventory with ID ${inventoryId} not found`,
        null,
        404
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        image,
        price: parseInt(price),
        description,
        stock: parseInt(stock),
        inventoryId,
      },
    });

    return successResponse(res, "Create Product successful", {
      ...product,
      image: product.image ? cleanImageUrl(BASE_URL, product.image) : null,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Create Product failed",
      { error: error.message },
      500
    );
  }
});

// PUT update product
router.put("/:id", upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, price, description, stock, inventoryId } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });
    if (!inventory) {
      return errorResponse(
        res,
        `Inventory with ID ${inventoryId} not found`,
        null,
        404
      );
    }

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      return errorResponse(res, "Product not found", null, 404);
    }

    if (image && existingProduct.image) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        path.basename(existingProduct.image)
      );
      fs.unlink(oldImagePath, (err) => {
        if (err) console.warn("Failed to delete old image:", oldImagePath);
        else console.log("Old image deleted:", oldImagePath);
      });
    }

    const updateData = {
      name,
      price: parseInt(price),
      description,
      stock: parseInt(stock),
      inventoryId,
    };
    if (image) updateData.image = image;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return successResponse(res, "Update Product successful", {
      ...updatedProduct,
      image: updatedProduct.image
        ? cleanImageUrl(BASE_URL, updatedProduct.image)
        : null,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Update Product failed",
      { error: error.message },
      500
    );
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return errorResponse(res, "Product not found", null, 404);
    }

    if (product.image) {
      const imagePath = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        path.basename(product.image)
      );
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.warn(`Gagal menghapus file: ${imagePath}`);
        } else {
          console.log(`File terhapus: ${imagePath}`);
        }
      });
    }

    await prisma.product.delete({ where: { id } });

    return successResponse(res, "Product deleted successfully");
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Gagal menghapus produk",
      { error: error.message },
      500
    );
  }
});

module.exports = router;
