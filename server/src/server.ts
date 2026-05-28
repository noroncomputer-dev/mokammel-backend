import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// import routes
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import brandRoutes from "./routes/brand.routes";
import orderRoutes from "./routes/order.routes";
import uploadRoutes from "./routes/upload.routes";
import paymentRoutes from "./routes/payment.routes";
import couponRoutes from "./routes/coupon.routes";
import reviewRoutes from "./routes/review.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import userRoutes from "./routes/user.routes";
import analyticsRoutes from "./routes/analytics.routes";
import settingRoutes from "./routes/setting.routes";
import notificationRoutes from "./routes/notification.routes";
import ticketRoutes from "./routes/ticket.routes";
import sliderRoutes from "./routes/slider.routes";
import promoRoutes from "./routes/promo.routes";
import statsRoutes from "./routes/stats.routes";
import postRoutes from "./routes/post.routes";
import chatRoutes from "./routes/chat.routes";
import compareRoutes from "./routes/compare.routes";

const app = express();
const PORT = process.env.PORT || 8080;

// ==================== CORS - تنظیمات کامل ====================
// لیست آدرس‌های مجاز
const allowedOrigins = [
  "http://localhost:3050",
  "http://localhost:3000",
  "https://mokammel-backend.vercel.app",
  "https://mokammel-backend-dadd.vercel.app",
  /\.vercel\.app$/, // همه دامنه‌های Vercel
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Check if origin is allowed
      const isAllowed = allowedOrigins.some((pattern) => {
        if (typeof pattern === "string") return pattern === origin;
        return pattern.test(origin);
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        console.log(`Blocked origin: ${origin}`);
        callback(null, true); // برای تست موقت، همه رو قبول کن
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cookie",
      "X-Requested-With",
    ],
  }),
);

// ==================== Middleware ====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ==================== Static Files ====================
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==================== Routes ====================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/promos", promoRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/compare", compareRoutes);

// ==================== Health Check ====================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Server is running",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ==================== Connect to MongoDB ====================
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined");

    console.log("🔍 Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// ==================== Start Server ====================
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
};

startServer();
