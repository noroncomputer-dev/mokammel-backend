import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

// ==================== Import Routes ====================
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

// ==================== Import Middleware ====================
import errorMiddleware from "./middleware/error.middleware";

const app = express();

// ==================== CORS ====================
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((o) => o.trim())
  : ["http://localhost:3050", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ==================== Middleware ====================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ==================== Static Files ====================
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ==================== Health Check ====================
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Mokammel Backend is running 🚀" });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

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

// ==================== Error Middleware (must be last) ====================
app.use(errorMiddleware);

export default app;
