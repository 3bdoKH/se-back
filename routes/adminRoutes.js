const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleBlockUser,
  updateUserRole,
  deleteUser,
  getSalesReport,
  getInventoryAlerts,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/auth");

// All admin routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard & Analytics
router.get("/dashboard", getDashboardStats);
router.get("/sales", getSalesReport);
router.get("/inventory-alerts", getInventoryAlerts);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id/block", toggleBlockUser);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

module.exports = router;
