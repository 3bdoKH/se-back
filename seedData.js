const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Category = require("./models/Category");
const Product = require("./models/Product");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Sample data
const categories = [
  {
    name: "Men's Clothing",
    description: "Stylish and comfortable clothing for men",
    image: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400",
  },
  {
    name: "Women's Clothing",
    description: "Trendy and elegant fashion for women",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
  },
  {
    name: "Accessories",
    description: "Complete your look with our accessories",
    image: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400",
  },
  {
    name: "Shoes",
    description: "Step out in style with our footwear collection",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
  },
];

const products = [
  // Men's Clothing
  {
    name: "Classic White T-Shirt",
    description:
      "100% cotton classic white t-shirt. Perfect for casual wear. Soft, breathable, and durable.",
    price: 19.99,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Black", "Gray"],
    stock: 150,
    featured: true,
  },
  {
    name: "Slim Fit Denim Jeans",
    description:
      "Modern slim fit jeans with stretch. Comfortable and stylish for everyday wear.",
    price: 59.99,
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Black", "Dark Blue"],
    stock: 80,
    featured: true,
  },
  {
    name: "Casual Button-Up Shirt",
    description:
      "Versatile button-up shirt perfect for both casual and semi-formal occasions.",
    price: 39.99,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blue", "White", "Light Blue", "Pink"],
    stock: 120,
    featured: false,
  },

  // Women's Clothing
  {
    name: "Floral Summer Dress",
    description:
      "Light and breezy floral dress perfect for summer days. Made from breathable fabric.",
    price: 49.99,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Floral Blue", "Floral Pink", "Floral Yellow"],
    stock: 95,
    featured: true,
  },
  {
    name: "Elegant Black Blouse",
    description:
      "Sophisticated black blouse suitable for office and evening wear.",
    price: 44.99,
    images: [
      "https://images.unsplash.com/photo-1564859228273-274232fdb516?w=500",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White", "Navy"],
    stock: 110,
    featured: false,
  },
  {
    name: "High-Waisted Skinny Jeans",
    description:
      "Flattering high-waisted jeans with stretch for all-day comfort.",
    price: 54.99,
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Light Blue", "Dark Blue", "Black"],
    stock: 130,
    featured: true,
  },

  // Accessories
  {
    name: "Leather Crossbody Bag",
    description:
      "Genuine leather crossbody bag with adjustable strap. Perfect for everyday use.",
    price: 79.99,
    images: [
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500",
    ],
    sizes: ["XS"],
    colors: ["Brown", "Black", "Tan"],
    stock: 45,
    featured: true,
  },
  {
    name: "Classic Sunglasses",
    description:
      "UV protection sunglasses with timeless design. Lightweight and durable.",
    price: 34.99,
    images: [
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
    ],
    sizes: ["S"],
    colors: ["Black", "Tortoiseshell", "Gold"],
    stock: 200,
    featured: false,
  },
  {
    name: "Silk Scarf",
    description:
      "100% silk scarf with elegant patterns. Adds a touch of sophistication to any outfit.",
    price: 29.99,
    images: [
      "https://images.unsplash.com/photo-1601924287667-c5ee5e872e8e?w=500",
    ],
    sizes: ["M"],
    colors: ["Red", "Blue", "Green", "Pink"],
    stock: 75,
    featured: false,
  },

  // Shoes
  {
    name: "Classic White Sneakers",
    description:
      "Versatile white sneakers that go with everything. Comfortable cushioned sole.",
    price: 69.99,
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "White/Black", "All White"],
    stock: 160,
    featured: true,
  },
  {
    name: "Leather Ankle Boots",
    description:
      "Stylish leather ankle boots with low heel. Perfect for fall and winter.",
    price: 99.99,
    images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Brown", "Tan"],
    stock: 70,
    featured: false,
  },
  {
    name: "Running Shoes",
    description:
      "High-performance running shoes with excellent cushioning and support.",
    price: 89.99,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black/Red", "Blue/White", "Gray/Orange"],
    stock: 140,
    featured: true,
  },
];

const users = [
  {
    name: "Admin User",
    email: "admin@fashion.com",
    password: "admin123",
    role: "admin",
    phone: "+1234567890",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "customer",
    phone: "+1234567891",
    addresses: [
      {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "USA",
        isDefault: true,
      },
    ],
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "customer",
    phone: "+1234567892",
  },
];

// Seed function
const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create users
    console.log("👥 Creating users...");
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create categories
    console.log("📁 Creating categories...");
    const createdCategories = await Category.create(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Assign categories to products
    products[0].category = createdCategories[0]._id; // Men's T-shirt
    products[1].category = createdCategories[0]._id; // Men's Jeans
    products[2].category = createdCategories[0]._id; // Men's Shirt
    products[3].category = createdCategories[1]._id; // Women's Dress
    products[4].category = createdCategories[1]._id; // Women's Blouse
    products[5].category = createdCategories[1]._id; // Women's Jeans
    products[6].category = createdCategories[2]._id; // Bag
    products[7].category = createdCategories[2]._id; // Sunglasses
    products[8].category = createdCategories[2]._id; // Scarf
    products[9].category = createdCategories[3]._id; // White Sneakers
    products[10].category = createdCategories[3]._id; // Ankle Boots
    products[11].category = createdCategories[3]._id; // Running Shoes

    // Create products
    console.log("👕 Creating products...");
    const createdProducts = await Product.create(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Admin Account:");
    console.log("  Email: admin@fashion.com");
    console.log("  Password: admin123");
    console.log("\nCustomer Account:");
    console.log("  Email: john@example.com");
    console.log("  Password: password123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seed function
seedDatabase();
