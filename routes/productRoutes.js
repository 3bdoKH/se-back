const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/auth");

// Public routes
router.get("/", getProducts);
router.get("/featured/list", getFeaturedProducts);
router.get("/categories/all", getAllCategories);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:id", getProductById);

// Protected routes
router.post("/:id/review", protect, addProductReview);

// Admin routes
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

// Category management (Admin only)
router.post("/categories", protect, admin, createCategory);
router.put("/categories/:id", protect, admin, updateCategory);
router.delete("/categories/:id", protect, admin, deleteCategory);

module.exports = router;
