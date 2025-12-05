const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * @desc    Create order from cart
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  // Validate input
  if (!shippingAddress || !paymentMethod) {
    res.status(400);
    throw new Error("Please provide shipping address and payment method");
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product"
  );

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  // Prepare order items and validate stock
  const orderItems = [];
  let itemsPrice = 0;

  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product) {
      res.status(404);
      throw new Error(`Product ${item.product.name} not found`);
    }

    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: product.price,
      image: product.images[0] || "",
    });

    itemsPrice += product.price * item.quantity;

    // Update product stock and sold count
    product.stock -= item.quantity;
    product.sold += item.quantity;
    await product.save();
  }

  // Calculate prices
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2)); // 15% tax
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    shippingPrice,
    taxPrice,
  });

  // Clear cart
  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.status(201).json({
    success: true,
    data: order,
    message: "Order placed successfully",
  });
});

/**
 * @desc    Get user's orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "name")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders,
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email phone")
    .populate("items.product", "name images");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Make sure user can only see their own orders (unless admin)
  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json({
    success: true,
    data: order,
  });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Check authorization
  if (
    order.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    res.status(403);
    throw new Error("Not authorized to cancel this order");
  }

  // Only allow cancellation if order is pending or processing
  if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
    res.status(400);
    throw new Error("Cannot cancel order that has been shipped or delivered");
  }

  if (order.orderStatus === "cancelled") {
    res.status(400);
    throw new Error("Order is already cancelled");
  }

  // Restore product stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.stock += item.quantity;
      product.sold -= item.quantity;
      await product.save();
    }
  }

  order.orderStatus = "cancelled";
  await order.save();

  res.json({
    success: true,
    data: order,
    message: "Order cancelled successfully",
  });
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
exports.getAllOrders = asyncHandler(async (req, res) => {
  const pageSize = 20;
  const page = Number(req.query.page) || 1;

  const query = {};

  // Filter by status
  if (req.query.status) {
    query.orderStatus = req.query.status;
  }

  // Filter by date range
  if (req.query.startDate || req.query.endDate) {
    query.createdAt = {};
    if (req.query.startDate) {
      query.createdAt.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      query.createdAt.$lte = new Date(req.query.endDate);
    }
  }

  const count = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: orders,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Update order status
  if (orderStatus) {
    order.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
  }

  // Update payment status
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;

    if (paymentStatus === "paid") {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
  }

  const updatedOrder = await order.save();

  res.json({
    success: true,
    data: updatedOrder,
    message: "Order updated successfully",
  });
});
