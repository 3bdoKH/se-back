# Fashion E-Commerce Backend API

A complete RESTful API backend for a fashion e-commerce website with integrated management system. Built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Navigate to backend directory:**

```bash
cd backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Configure environment variables:**
   Edit the `.env` file with your settings:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/fashion_ecommerce
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:3000
```

4. **Seed the database with sample data:**

```bash
npm run seed
```

5. **Start the server:**

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The API will be running at `http://localhost:5000`

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@fashion.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Admin User",
    "email": "admin@fashion.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer YOUR_TOKEN
```

### Update Profile

```http
PUT /api/auth/profile
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567890",
  "addresses": [...]
}
```

### Change Password

```http
PUT /api/auth/change-password
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

---

## 👕 Product Endpoints

### Get All Products

```http
GET /api/products?page=1&category=CATEGORY_ID&minPrice=10&maxPrice=100&size=M&color=Blue&search=shirt&sort=price-asc
```

**Query Parameters:**

- `page` - Page number (default: 1)
- `category` - Filter by category ID
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `size` - Filter by size (XS, S, M, L, XL, XXL)
- `color` - Filter by color
- `search` - Search in name and description
- `sort` - Sort by: `price-asc`, `price-desc`, `rating`, `newest`

### Get Single Product

```http
GET /api/products/:id
```

### Get Featured Products

```http
GET /api/products/featured/list
```

### Get Products by Category

```http
GET /api/products/category/:categoryId
```

### Create Product (Admin)

```http
POST /api/products
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Stylish Shirt",
  "description": "A very stylish shirt",
  "price": 39.99,
  "category": "CATEGORY_ID",
  "images": ["url1", "url2"],
  "sizes": ["S", "M", "L"],
  "colors": ["Blue", "White"],
  "stock": 100,
  "featured": true
}
```

### Update Product (Admin)

```http
PUT /api/products/:id
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 49.99,
  "stock": 150
}
```

### Delete Product (Admin)

```http
DELETE /api/products/:id
Authorization: Bearer ADMIN_TOKEN
```

### Add Product Review

```http
POST /api/products/:id/review
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "rating": 5,
  "comment": "Great product!"
}
```

---

## 📁 Category Endpoints

### Get All Categories

```http
GET /api/products/categories/all
```

### Create Category (Admin)

```http
POST /api/products/categories
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "New Category",
  "description": "Description",
  "image": "image_url"
}
```

### Update Category (Admin)

```http
PUT /api/products/categories/:id
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "name": "Updated Name"
}
```

### Delete Category (Admin)

```http
DELETE /api/products/categories/:id
Authorization: Bearer ADMIN_TOKEN
```

---

## 🛒 Cart Endpoints

### Get Cart

```http
GET /api/cart
Authorization: Bearer YOUR_TOKEN
```

### Add to Cart

```http
POST /api/cart/add
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "productId": "PRODUCT_ID",
  "quantity": 2,
  "size": "M",
  "color": "Blue"
}
```

### Update Cart Item

```http
PUT /api/cart/update/:itemId
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "quantity": 3
}
```

### Remove from Cart

```http
DELETE /api/cart/remove/:itemId
Authorization: Bearer YOUR_TOKEN
```

### Clear Cart

```http
DELETE /api/cart/clear
Authorization: Bearer YOUR_TOKEN
```

---

## 📦 Order Endpoints

### Create Order

```http
POST /api/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "Cash on Delivery"
}
```

### Get My Orders

```http
GET /api/orders/my-orders
Authorization: Bearer YOUR_TOKEN
```

### Get Order by ID

```http
GET /api/orders/:id
Authorization: Bearer YOUR_TOKEN
```

### Cancel Order

```http
PUT /api/orders/:id/cancel
Authorization: Bearer YOUR_TOKEN
```

### Get All Orders (Admin)

```http
GET /api/orders?page=1&status=pending&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer ADMIN_TOKEN
```

### Update Order Status (Admin)

```http
PUT /api/orders/:id/status
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "orderStatus": "shipped",
  "paymentStatus": "paid"
}
```

**Order Status Values:**

- `pending`
- `processing`
- `shipped`
- `delivered`
- `cancelled`

**Payment Status Values:**

- `pending`
- `paid`
- `failed`

---

## 👑 Admin Endpoints

### Get Dashboard Statistics

```http
GET /api/admin/dashboard
Authorization: Bearer ADMIN_TOKEN
```

**Response includes:**

- Total users, orders, products, revenue
- Orders by status
- Recent orders
- Low stock products
- Top selling products
- Monthly sales data

### Get All Users

```http
GET /api/admin/users?page=1&role=customer&isBlocked=false&search=john
Authorization: Bearer ADMIN_TOKEN
```

### Block/Unblock User

```http
PUT /api/admin/users/:id/block
Authorization: Bearer ADMIN_TOKEN
```

### Update User Role

```http
PUT /api/admin/users/:id/role
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "role": "admin"
}
```

### Delete User

```http
DELETE /api/admin/users/:id
Authorization: Bearer ADMIN_TOKEN
```

### Get Sales Report

```http
GET /api/admin/sales?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer ADMIN_TOKEN
```

### Get Inventory Alerts

```http
GET /api/admin/inventory-alerts?threshold=10
Authorization: Bearer ADMIN_TOKEN
```

---

## 🎯 Default Test Accounts

After running `npm run seed`, use these accounts:

**Admin Account:**

- Email: `admin@fashion.com`
- Password: `admin123`

**Customer Account:**

- Email: `john@example.com`
- Password: `password123`

---

## 📊 Database Schema

### User

- name, email, password (hashed)
- role: customer | admin
- phone, addresses[]
- isBlocked

### Product

- name, description, price
- category (ref: Category)
- images[], sizes[], colors[]
- stock, sold
- rating, numReviews, reviews[]
- featured

### Category

- name, description, image

### Cart

- user (ref: User)
- items[] (product, quantity, size, color, price)
- totalPrice

### Order

- user (ref: User)
- items[] (product details)
- shippingAddress
- paymentMethod, paymentStatus
- orderStatus
- prices (total, shipping, tax)
- timestamps

---

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected routes with middleware
- Role-based access control
- Input validation
- Error handling

---

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **express-async-handler** - Async error handling
- **express-validator** - Input validation
- **cors** - Cross-origin requests
- **dotenv** - Environment variables

---

## 📝 Project Structure

```
backend/
├── config/
│   └── db.js                    # Database connection
├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── productController.js     # Product management
│   ├── orderController.js       # Order processing
│   ├── cartController.js        # Cart operations
│   └── adminController.js       # Admin operations
├── middleware/
│   ├── auth.js                  # JWT authentication
│   └── errorHandler.js          # Error handling
├── models/
│   ├── User.js                  # User schema
│   ├── Product.js               # Product schema
│   ├── Order.js                 # Order schema
│   ├── Cart.js                  # Cart schema
│   └── Category.js              # Category schema
├── routes/
│   ├── authRoutes.js            # Auth endpoints
│   ├── productRoutes.js         # Product endpoints
│   ├── orderRoutes.js           # Order endpoints
│   ├── cartRoutes.js            # Cart endpoints
│   └── adminRoutes.js           # Admin endpoints
├── utils/
│   └── generateToken.js         # JWT helper
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── server.js                    # Main server file
├── package.json                 # Dependencies
└── seedData.js                  # Sample data script
```

---

## 🐛 Error Handling

All errors return in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "stack": "Stack trace (development only)"
}
```

---

## 📞 Support

For questions or issues, please contact your instructor or project team.

---

## 📄 License

This project is for educational purposes only (Software Engineering Course Final Project).
