const mongoose = require("mongoose");

/**
 * Review Sub-Schema
 * Embedded in Product schema for product reviews
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Product Schema
 * Stores all product information including inventory
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxlength: [100, "Product name cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a product description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide a category"],
    },
    images: {
      type: [String],
      default: [],
    },
    sizes: {
      type: [String],
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      required: [true, "Please provide stock quantity"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
      min: [0, "Sold quantity cannot be negative"],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    reviews: [reviewSchema],
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster searches
productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
