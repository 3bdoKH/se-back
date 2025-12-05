const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Category = require("../models/Category");

/**
 * @desc    Get all products with filters and pagination
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = asyncHandler(async (req, res) => {
  const pageSize = 12;
  const page = Number(req.query.page) || 1;

  // Build query object
  const query = {};

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Filter by size
  if (req.query.size) {
    query.sizes = req.query.size;
  }

  // Filter by color
  if (req.query.color) {
    query.colors = req.query.color;
  }

  // Search by name or description
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Sort options
  let sortOption = {};
  if (req.query.sort === "price-asc") {
    sortOption = { price: 1 };
  } else if (req.query.sort === "price-desc") {
    sortOption = { price: -1 };
  } else if (req.query.sort === "rating") {
    sortOption = { rating: -1 };
  } else if (req.query.sort === "newest") {
    sortOption = { createdAt: -1 };
  } else {
    sortOption = { createdAt: -1 };
  }

  const count = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name")
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    data: products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name description")
    .populate("reviews.user", "name");

  if (product) {
    res.json({
      success: true,
      data: product,
    });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:categoryId
 * @access  Public
 */
exports.getProductsByCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.categoryId);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  const products = await Product.find({ category: req.params.categoryId })
    .populate("category", "name")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: products,
    category: category.name,
  });
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured/list
 * @access  Public
 */
exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true })
    .populate("category", "name")
    .limit(8)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: products,
  });
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Admin
 */
exports.createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    images,
    sizes,
    colors,
    stock,
    featured,
  } = req.body;

  // Validate required fields
  if (!name || !description || !price || !category) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(404);
    throw new Error("Category not found");
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    images: images || [],
    sizes: sizes || [],
    colors: colors || [],
    stock: stock || 0,
    featured: featured || false,
  });

  res.status(201).json({
    success: true,
    data: product,
  });
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Update fields
  product.name = req.body.name || product.name;
  product.description = req.body.description || product.description;
  product.price = req.body.price || product.price;
  product.category = req.body.category || product.category;
  product.images = req.body.images || product.images;
  product.sizes = req.body.sizes || product.sizes;
  product.colors = req.body.colors || product.colors;
  product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
  product.featured =
    req.body.featured !== undefined ? req.body.featured : product.featured;

  const updatedProduct = await product.save();

  res.json({
    success: true,
    data: updatedProduct,
  });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: "Product deleted successfully",
  });
});

/**
 * @desc    Add product review
 * @route   POST /api/products/:id/review
 * @access  Private
 */
exports.addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    res.status(400);
    throw new Error("Please provide rating and comment");
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Check if user already reviewed
  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  // Add review
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;

  // Calculate average rating
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  await product.save();

  res.status(201).json({
    success: true,
    message: "Review added successfully",
  });
});

/**
 * @desc    Get all categories
 * @route   GET /api/products/categories/all
 * @access  Public
 */
exports.getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });

  res.json({
    success: true,
    data: categories,
  });
});

/**
 * @desc    Create category
 * @route   POST /api/products/categories
 * @access  Private/Admin
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Please provide category name");
  }

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({
    name,
    description: description || "",
    image: image || "",
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Update category
 * @route   PUT /api/products/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  category.name = req.body.name || category.name;
  category.description = req.body.description || category.description;
  category.image = req.body.image || category.image;

  const updatedCategory = await category.save();

  res.json({
    success: true,
    data: updatedCategory,
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/products/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // Check if category has products
  const productsCount = await Product.countDocuments({
    category: req.params.id,
  });

  if (productsCount > 0) {
    res.status(400);
    throw new Error(
      `Cannot delete category. ${productsCount} products are using this category.`
    );
  }

  await category.deleteOne();

  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});
