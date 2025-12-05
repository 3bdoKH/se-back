const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Fashion E-commerce API is running!",
    version: "1.0.0",
  });
});

// API documentation route
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Fashion E-commerce API",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        profile: "GET /api/auth/profile",
        updateProfile: "PUT /api/auth/profile",
        changePassword: "PUT /api/auth/change-password",
      },
      products: {
        getAll: "GET /api/products",
        getById: "GET /api/products/:id",
        getFeatured: "GET /api/products/featured/list",
        getByCategory: "GET /api/products/category/:categoryId",
        create: "POST /api/products (admin)",
        update: "PUT /api/products/:id (admin)",
        delete: "DELETE /api/products/:id (admin)",
        addReview: "POST /api/products/:id/review",
      },
      categories: {
        getAll: "GET /api/products/categories/all",
        create: "POST /api/products/categories (admin)",
        update: "PUT /api/products/categories/:id (admin)",
        delete: "DELETE /api/products/categories/:id (admin)",
      },
      cart: {
        get: "GET /api/cart",
        add: "POST /api/cart/add",
        update: "PUT /api/cart/update/:itemId",
        remove: "DELETE /api/cart/remove/:itemId",
        clear: "DELETE /api/cart/clear",
      },
      orders: {
        create: "POST /api/orders",
        getMyOrders: "GET /api/orders/my-orders",
        getById: "GET /api/orders/:id",
        cancel: "PUT /api/orders/:id/cancel",
        getAll: "GET /api/orders (admin)",
        updateStatus: "PUT /api/orders/:id/status (admin)",
      },
      admin: {
        dashboard: "GET /api/admin/dashboard",
        users: "GET /api/admin/users",
        blockUser: "PUT /api/admin/users/:id/block",
        updateUserRole: "PUT /api/admin/users/:id/role",
        deleteUser: "DELETE /api/admin/users/:id",
        salesReport: "GET /api/admin/sales",
        inventoryAlerts: "GET /api/admin/inventory-alerts",
      },
    },
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  process.exit(1);
});
