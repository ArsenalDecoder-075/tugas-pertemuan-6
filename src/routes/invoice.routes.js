const router = require("express").Router();
const { PrismaClient } = require("../../generated/prisma");
// const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const auth = require("../middleware/auth.middleware");

const { successResponse, errorResponse } = require("../utils/response");

// Semua route di bawah ini butuh autentikasi
router.use(auth);

// ✅ GET semua invoice milik user yang login
router.get("/", async (req, res) => {
  const invoice = await prisma.invoice.findMany();
  return successResponse(res, "get invoice successful", invoice);
});

// ✅ GET invoice spesifik (hanya milik user)
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: parseInt(id) },
    });

    if (!invoice || invoice.userId !== userId) {
      return errorResponse(res, "Invoice not found or unauthorized", null, 404);
    }

    return successResponse(res, "Get invoice successful", invoice);
  } catch (error) {
    return errorResponse(
      res,
      "Failed to get invoice",
      { error: error.message },
      500
    );
  }
});

// GET invoices berdasarkan email dan userId (hanya milik user)
router.get("/email/:email", async (req, res) => {
  const { email } = req.params;
  const { userId } = req.user;

  try {
    // Cari invoice yang sesuai email dan userId
    const invoices = await prisma.invoice.findMany({
      where: {
        email: email,
        userId: userId,
      },
    });

    if (!invoices || invoices.length === 0) {
      return errorResponse(
        res,
        "Invoices not found or unauthorized",
        null,
        404
      );
    }

    return successResponse(res, "Get invoices successful", invoices);
  } catch (error) {
    return errorResponse(
      res,
      "Failed to get invoices",
      { error: error.message },
      500
    );
  }
});

// ✅ POST buat invoice baru
router.post("/", async (req, res) => {
  const { email, name, phone, items } = req.body;
  const { userId } = req.user;

  let total = 0;
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (product) {
      total += product.price * item.qty;
    }
  }

  try {
    const invoice = await prisma.invoice.create({
      data: {
        email,
        name,
        phone,
        // items: typeof items === "string" ? items : JSON.stringify(items),
        items: JSON.stringify(items),
        total,
        date: new Date(),
        userId,
      },
    });

    return successResponse(res, "Invoice created successfully", invoice);
  } catch (error) {
    return errorResponse(
      res,
      "Failed to create invoice",
      { error: error.message },
      500
    );
  }
});

// ✅ put buat invoice baru
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { email, name, phone, items } = req.body;
  const { userId } = req.user;

  try {
    // Pastikan invoice-nya milik user yang sedang login
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!existingInvoice || existingInvoice.userId !== userId) {
      return errorResponse(res, "Invoice not found or unauthorized", null, 404);
    }

    // Hitung ulang total berdasarkan items baru
    let total = 0;
    const parsedItems = typeof items === "string" ? JSON.parse(items) : items;

    for (const item of parsedItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return errorResponse(
          res,
          `Product with ID ${item.productId} not found`,
          null,
          404
        );
      }
      total += product.price * item.qty;
    }

    // Update invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: {
        email,
        name,
        phone,
        items: JSON.stringify(parsedItems),
        total,
        date: new Date(), // Optional: bisa kamu hilangkan jika tidak mau ubah waktu
      },
    });

    return successResponse(res, "Invoice updated successfully", updatedInvoice);
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      "Failed to update invoice",
      { error: error.message },
      500
    );
  }
});

// ✅ DELETE invoice milik user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id }, // ✅ id tetap dalam string
    });

    if (!invoice || invoice.userId !== userId) {
      return errorResponse(res, "Invoice not found or unauthorized", null, 404);
    }

    await prisma.invoice.delete({ where: { id } }); // ✅ juga di sini

    return successResponse(res, "Invoice deleted successfully");
  } catch (error) {
    return errorResponse(
      res,
      "Failed to delete invoice",
      { error: error.message },
      500
    );
  }
});
module.exports = router;
