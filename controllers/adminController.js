const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Total users
  const totalUsers = await User.countDocuments({ role: "customer" });

  // Total orders
  const totalOrders = await Order.countDocuments();

  // Total products
  const totalProducts = await Product.countDocuments();

  // Total revenue
  const revenueData = await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: ["processing", "shipped", "delivered"] },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
      },
    },
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: "$orderStatus",
        count: { $sum: 1 },
      },
    },
  ]);

  // Recent orders (last 5)
  const recentOrders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(5);

  // Low stock products (stock < 10)
  const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
    .select("name stock")
    .limit(10);

  // Top selling products
  const topProducts = await Product.find()
    .sort({ sold: -1 })
    .limit(5)
    .select("name sold price images");

  // Monthly sales (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        orderStatus: { $in: ["processing", "shipped", "delivered"] },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        totalSales: { $sum: "$totalPrice" },
        orderCount: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue: totalRevenue.toFixed(2),
      },
      ordersByStatus,
      recentOrders,
      lowStockProducts,
      topProducts,
      monthlySales,
    },
  });
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.page) || 1;

  const query = {};

  // Filter by role
  if (req.query.role) {
    query.role = req.query.role;
  }

  // Filter by blocked status
  if (req.query.isBlocked) {
    query.isBlocked = req.query.isBlocked === "true";
  }

  // Search by name or email
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const count = await User.countDocuments(query);
  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: users,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/**
 * @desc    Block/Unblock user
 * @route   PUT /api/admin/users/:id/block
 * @access  Private/Admin
 */
exports.toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot block admin users");
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
  });
});

/**
 * @desc    Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !["customer", "admin"].includes(role)) {
    res.status(400);
    throw new Error("Invalid role");
  }

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role;
  await user.save();

  res.json({
    success: true,
    data: user,
    message: "User role updated successfully",
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (user.role === "admin") {
    res.status(400);
    throw new Error("Cannot delete admin users");
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: "User deleted successfully",
  });
});

/**
 * @desc    Get sales report
 * @route   GET /api/admin/sales
 * @access  Private/Admin
 */
exports.getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = {
    orderStatus: { $in: ["processing", "shipped", "delivered"] },
  };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const orders = await Order.find(query)
    .populate("user", "name email")
    .populate("items.product", "name category")
    .sort({ createdAt: -1 });

  const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
  const totalOrders = orders.length;

  // Sales by category
  const salesByCategory = await Order.aggregate([
    { $match: query },
    { $unwind: "$items" },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    { $unwind: "$productInfo" },
    {
      $lookup: {
        from: "categories",
        localField: "productInfo.category",
        foreignField: "_id",
        as: "categoryInfo",
      },
    },
    { $unwind: "$categoryInfo" },
    {
      $group: {
        _id: "$categoryInfo.name",
        totalSales: {
          $sum: { $multiply: ["$items.price", "$items.quantity"] },
        },
        itemsSold: { $sum: "$items.quantity" },
      },
    },
    { $sort: { totalSales: -1 } },
  ]);

  res.json({
    success: true,
    data: {
      orders,
      summary: {
        totalSales: totalSales.toFixed(2),
        totalOrders,
        averageOrderValue: (totalSales / totalOrders || 0).toFixed(2),
      },
      salesByCategory,
    },
  });
});

/**
 * @desc    Get inventory alerts (low stock products)
 * @route   GET /api/admin/inventory-alerts
 * @access  Private/Admin
 */
exports.getInventoryAlerts = asyncHandler(async (req, res) => {
  const threshold = Number(req.query.threshold) || 10;

  const lowStockProducts = await Product.find({
    stock: { $lt: threshold, $gt: 0 },
  })
    .populate("category", "name")
    .sort({ stock: 1 });

  const outOfStockProducts = await Product.find({ stock: 0 })
    .populate("category", "name")
    .sort({ name: 1 });

  res.json({
    success: true,
    data: {
      lowStock: lowStockProducts,
      outOfStock: outOfStockProducts,
      totalAlerts: lowStockProducts.length + outOfStockProducts.length,
    },
  });
});
