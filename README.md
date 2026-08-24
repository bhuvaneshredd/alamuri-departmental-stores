# ⚡ Alamuri Departmental Stores — Production Quick-Commerce Platform

A production-ready, full-stack, single-store quick-commerce online grocery shopping platform for **Alamuri Departmental Stores** inspired by the speed and convenience of 10-15 minute delivery apps with custom branding, comprehensive customer web application, robust backend REST API, database modeling with Prisma ORM, and store owner admin dashboard.

---

## 🌟 Key Features

### 🛒 Customer Storefront
* **Lightning Fast UX**: Mobile-first responsive interface optimized for smartphones, tablets, and desktops.
* **Smart Catalog & Navigation**:
  - Dynamic category browser (Fruits & Veggies, Dairy & Eggs, Snacks, Drinks, Instant Foods, Atta/Rice/Dals, Personal Care, Household, etc.).
  - Best Deals & Discounts badge carousel.
  - Featured Essentials & Personalized Recommendations based on order history.
* **Debounced Search**: Keyword matching, instant live suggestion dropdown, brand and category discovery.
* **Cart & Pricing Engine**:
  - Live side drawer with optimistic updates.
  - Dynamic Free Delivery Progress Bar ("Add ₹X more for FREE delivery").
  - Server-side verified subtotal, MRP savings, 5% tax breakdown, and delivery fee calculation.
* **Geolocation & Delivery Radius Check**:
  - Built-in Haversine formula calculation measuring great-circle distance between the physical store GPS coordinates and customer address.
  - Automatic validation preventing orders outside the store's configured delivery radius (default 7.5 km).
* **Multi-Step Checkout & Payment**:
  - Address selection with Flat/House No, Street, Landmark, Pincode, and coordinates.
  - Promotional coupon engine (`WELCOME50`, `QUICK100`, `SUPER20`).
  - **Razorpay Online Payment** with server-side HMAC SHA256 signature verification.
  - **Cash on Delivery (COD)** with configurable maximum order limit.
* **Live Order Tracking & Timeline**:
  - Real-time step progress (`PLACED` ➔ `CONFIRMED` ➔ `PACKING` ➔ `READY_FOR_DELIVERY` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED`).
  - Order cancellation with automatic inventory restoration.
  - **1-Click Reorder**: Instantly adds previously ordered available products to cart.
* **Customer Profile**: Personal details, password changes, and saved address book.

---

### 👑 Store Owner Admin Dashboard (`/admin`)
* **Real-time Operations Metrics**:
  - Today's Orders, Today's Revenue, Total Customers, Total Products, Pending Orders, Low Stock Alerts.
  - Interactive 7-Day Revenue Trend Area Chart using Recharts.
* **Instant Store Open/Closed Master Switch**: Manual one-click toggle to open or close store orders with public banner notice.
* **Order Processing Hub**:
  - View incoming orders in real-time.
  - Step-by-step status transitions with validation rules preventing invalid state progression.
  - Full receipt inspection with address snapshots and delivery instructions.
* **Product & Category CRUD**:
  - Create, update, soft-delete, and toggle product availability.
  - Automated discount percentage computation from MRP and selling price.
  - Image upload abstraction (Cloudinary SDK integration + URL fallback).
* **Inventory Management**:
  - Low-stock inventory table highlighting items with ≤ 10 units.
  - Quick inline stock restock updates.
* **Customer Management**:
  - View registered customers, lifetime spend, order count, and disable/enable accounts.
* **Coupon & Discount Engine**:
  - Create Percentage or Fixed Amount promo codes with minimum cart thresholds, maximum discount caps, usage limits, and expiration dates.
* **Store Rules & Configuration**:
  - Store identity, contact email/phone, physical address.
  - Store latitude & longitude GPS coordinates.
  - Maximum delivery radius in kilometers.
  - Minimum order amount, delivery fee, free delivery threshold, and operating hours.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, React Router v6, TanStack Query, Lucide Icons, Recharts, Canvas Confetti |
| **Backend** | Node.js, Express.js, TypeScript, REST API, JWT Authentication, bcryptjs, Zod validation |
| **Database & ORM** | PostgreSQL (Production) / SQLite (Zero-config local dev), Prisma ORM v5 |
| **Payments** | Razorpay SDK (Online UPI / Cards / NetBanking + COD) |
| **Media Storage** | Cloudinary SDK abstraction |
| **Security** | Helmet, CORS, Express Rate Limiting, Server-side Price & Stock Verification |
| **Documentation** | Swagger / OpenAPI UI at `/api/docs` |
| **Testing** | Vitest unit & integration test suite |

---

## 📁 Monorepo Structure

```text
store-app/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/          # AdminLayout, StatCard, RevenueChart, Modals
│   │   │   ├── cart/           # CartDrawer, BillSummary
│   │   │   ├── checkout/       # AddressSelector, PaymentSelector
│   │   │   ├── common/         # Navbar, MobileBottomNav, Footer, ProductCard, SearchBar
│   │   │   ├── home/           # HeroCarousel, CategoryGrid, DealsSection, FeaturedSection
│   │   │   └── tracking/       # OrderTimeline, OrderStatusBadge
│   │   ├── contexts/           # AuthContext, CartContext, LocationContext, StoreConfigContext
│   │   ├── pages/              # HomePage, CategoryPage, ProductDetailPage, SearchPage, CartPage,
│   │   │   │                   # CheckoutPage, OrderConfirmationPage, OrderTrackingPage,
│   │   │   │                   # MyOrdersPage, ProfilePage, NotFoundPage
│   │   │   └── admin/          # AdminLoginPage, AdminDashboardPage, AdminProductsPage,
│   │   │                       # AdminCategoriesPage, AdminOrdersPage, AdminCustomersPage,
│   │   │                       # AdminInventoryPage, AdminCouponsPage, AdminSettingsPage
│   │   ├── services/           # Axios REST API client modules
│   │   ├── types/              # Domain TypeScript interfaces
│   │   ├── App.tsx             # Application router & provider tree
│   │   ├── main.tsx            # DOM Root
│   │   └── index.css           # Tailwind base styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                     # Express + TypeScript REST API
│   ├── src/
│   │   ├── config/             # Environment, Prisma, Razorpay, Cloudinary
│   │   ├── controllers/        # Auth, Category, Product, Cart, Address, Order, Payment, Admin, Settings
│   │   ├── docs/               # OpenAPI / Swagger specification
│   │   ├── middleware/         # JWT Auth, Role Gate, Zod Validator, Rate Limiter, Error Handler
│   │   ├── routes/             # Express route aggregators
│   │   ├── services/           # Geolocation Haversine, Pricing Engine, Stock Service, Razorpay, Notifications
│   │   ├── utils/              # API Response, JWT, Password Hashing, Slugify
│   │   ├── validators/         # Zod schemas
│   │   ├── app.ts              # Express App configuration
│   │   └── server.ts           # Server bootstrap
│   ├── prisma/
│   │   ├── schema.prisma       # Active Prisma schema (SQLite / PostgreSQL)
│   │   ├── schema.postgresql.prisma # PostgreSQL Production schema
│   │   └── seed.ts             # 12+ categories, 60+ products, demo accounts & coupons
│   ├── tests/                  # Vitest backend integration test suite
│   ├── tsconfig.json
│   └── package.json
│
├── .env.example
├── package.json                # Monorepo workspace scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v20/v26)
- **npm** v9+

### 2. Installation
Clone the repository and install all root and workspace dependencies:

```bash
cd store-app
npm run install:all
```

### 3. Setup Database & Seed Data
Initialize the database and populate 12 categories, 60+ realistic grocery items, default store settings, coupons, and test accounts:

```bash
# Push schema to database
npm run db:generate
npm run db:migrate # or npm run prisma:push --workspace=server

# Seed demo data
npm run db:seed
```

### 4. Run Development Servers
Start both the Express Backend (Port `5000`) and the Vite React Frontend (Port `5173`) concurrently:

```bash
npm run dev
```

- **Customer Website**: [http://localhost:5173](http://localhost:5173)
- **Admin Dashboard**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- **Interactive Swagger Docs**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)

---

## 🔑 Demo Accounts & Test Credentials

| Account Role | Email Address | Password |
|---|---|---|
| **Store Owner (Admin)** | `admin@quickstore.com` | `Admin@123456` |
| **Demo Customer** | `customer@example.com` | `Customer@123456` |

> *Tip: Both the customer login modal and admin login page include a one-click **"Quick Demo"** button to auto-fill credentials for rapid testing.*

---

## 🎟️ Active Promotional Coupons

| Coupon Code | Discount | Minimum Order | Details |
|---|---|---|---|
| `WELCOME50` | 50% OFF | ₹199 | Max discount ₹100 |
| `QUICK100` | Flat ₹100 OFF | ₹499 | Instant flat reduction |
| `SUPER20` | 20% OFF | ₹299 | Max discount ₹150 |

---

## 🧪 Running Tests

Run the backend test suite verifying password hashing, JWT authorization, geolocation calculations, slug generation, and payment signatures:

```bash
npm test
```

---

## 🚢 Production Deployment Guide

### Deploying Frontend (Vercel / Netlify / Cloudflare Pages)
1. Set the root directory to `client`.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Set Environment Variables:
   - `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api`
   - `VITE_RAZORPAY_KEY_ID=rzp_live_YourKeyId`
   - `VITE_STORE_NAME=QuickStore`

### Deploying Backend (Render / Railway / AWS EC2)
1. Set the root directory to `server`.
2. Build Command: `npm run build && npx prisma generate`
3. Start Command: `npm start`
4. Set Environment Variables:
   - `DATABASE_URL=postgresql://user:password@host:5432/quickstore?sslmode=require`
   - `JWT_SECRET=your_super_strong_production_jwt_secret`
   - `RAZORPAY_KEY_ID=rzp_live_...`
   - `RAZORPAY_KEY_SECRET=...`
   - `CLOUDINARY_CLOUD_NAME=...`
   - `CLOUDINARY_API_KEY=...`
   - `CLOUDINARY_API_SECRET=...`
   - `CLIENT_URL=https://your-store.vercel.app`

---

## 🔒 Security Architecture

1. **Zero-Trust Pricing**: All totals (subtotals, taxes, discounts, delivery fees) are recalculated from database product records on the server.
2. **Atomic Inventory Control**: Stock is decremented within a Prisma transaction upon order placement and restored upon cancellation.
3. **Cryptographic Payment Verification**: Online orders are only marked confirmed after verifying the HMAC SHA256 signature generated with `RAZORPAY_KEY_SECRET`.
4. **Rate Limiting & Headers**: Configured with `helmet` security headers, strict CORS origin policies, and route rate limiters.