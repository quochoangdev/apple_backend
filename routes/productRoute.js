const express = require("express");
const router = express.Router();

//
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const {
  createProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getOneProduct,
  getProductSearch,
} = require("../controllers/productController");

router.post("/create", authMiddleware, isAdmin, createProduct);
router.put("/update/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/delete/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/search", getProductSearch);
router.get("/:slug", getOneProduct);
router.get("/", getAllProduct);

module.exports = router;
