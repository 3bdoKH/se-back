const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
exports.getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price images stock"
  );

  // Create cart if doesn't exist
  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
      totalPrice: 0,
    });
  }

  res.json({
    success: true,
    data: cart,
  });
});

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, size, color } = req.body;

  // Validate input
  if (!productId || !quantity || !size || !color) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if product exists and has stock
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error("Insufficient stock available");
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.color === color
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    if (product.stock < newQuantity) {
      res.status(400);
      throw new Error("Insufficient stock available");
    }

    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      size,
      color,
      price: product.price,
    });
  }

  await cart.save();

  // Populate and return updated cart
  cart = await Cart.findById(cart._id).populate(
    "items.product",
    "name price images stock"
  );

  res.json({
    success: true,
    data: cart,
    message: "Item added to cart successfully",
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/update/:itemId
 * @access  Private
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Find item in cart
  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  // Check stock availability
  const product = await Product.findById(cart.items[itemIndex].product);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    res.status(400);
    throw new Error("Insufficient stock available");
  }

  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "name price images stock"
  );

  res.json({
    success: true,
    data: updatedCart,
    message: "Cart updated successfully",
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/remove/:itemId
 * @access  Private
 */
exports.removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  // Filter out the item
  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId
  );

  await cart.save();

  // Populate and return updated cart
  const updatedCart = await Cart.findById(cart._id).populate(
    "items.product",
    "name price images stock"
  );

  res.json({
    success: true,
    data: updatedCart,
    message: "Item removed from cart successfully",
  });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
exports.clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = [];
  cart.totalPrice = 0;
  await cart.save();

  res.json({
    success: true,
    message: "Cart cleared successfully",
  });
});
