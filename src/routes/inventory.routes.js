const router = require("express").Router();
const { PrismaClient } = require("../../generated/prisma");
// const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const auth = require("../middleware/auth.middleware");
const { successResponse, errorResponse } = require("../utils/response"); //response standard

router.use(auth);

// cari semua
router.get("/", async (req, res) => {
  const items = await prisma.inventory.findMany();
  return successResponse(res, "get inventory successful", items);
});

// buat inventory
router.post("/", async (req, res) => {
  const { name, description } = req.body;
  const item = await prisma.inventory.create({ data: { name, description } });

  return successResponse(res, "Inventory Created", item);
});

// cari 1 item berdasarkan id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const item = await prisma.inventory.findUnique({ where: { id } });

    if (!item) {
      return errorResponse(res, "Inventory not found", null, 404);
    }

    return successResponse(res, "Get inventory successful", item);
  } catch (err) {
    return errorResponse(
      res,
      "Failed to get inventory",
      { error: err.message },
      500
    );
  }
});

// cari spesifik
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // cek inventory sesuai id
    const existing = await prisma.inventory.findUnique({ where: { id } });
    // kalo gk ada hasilkan error
    if (!existing) {
      return errorResponse(res, "Inventory gk ada", null, 404);
    }
    // kalo ada langsung update
    const item = await prisma.inventory.update({
      where: { id },
      data: { name, description },
    });
    //selesai sukses / gagal
    return successResponse(res, "Inventory Updated", item);
  } catch (err) {
    return errorResponse(res, "failed", { error: err.message }, 500);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Check existing data
    const existing = await prisma.inventory.findUnique({ where: { id } });

    if (!existing) {
      return errorResponse(res, "Inventory not found", null, 404);
    }

    // delete data dan save result
    const item = await prisma.inventory.delete({ where: { id } });

    // send success response
    return successResponse(res, "Inventory deleted", item);
  } catch (err) {
    return errorResponse(
      res,
      "Failed to delete inventory",
      { error: err.message },
      500
    );
  }
});
// export buat dijalanin di index.js
module.exports = router;
