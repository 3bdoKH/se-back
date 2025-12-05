const mongoose = require("mongoose");

/**
 * Category Schema
 * Organizes products into categories (Men's, Women's, Accessories, etc.)
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a category name"],
      unique: true,
      trim: true,
      maxlength: [50, "Category name cannot be more than 50 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [200, "Description cannot be more than 200 characters"],
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Category", categorySchema);
