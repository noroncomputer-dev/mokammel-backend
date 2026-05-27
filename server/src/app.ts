import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import orderRoutes from "./routes/order.routes";
import brandRoutes from "./routes/brand.routes";
import uploadRoutes from "./routes/upload.routes";
import paymentRoutes from "./routes/payment.routes";
import couponRoutes from "./routes/coupon.routes";
import wishlistRoutes from "./routes/wishlist.routes";
import reviewRoutes from "./routes/review.routes";
import compareRoutes from "./routes/compare.routes";
import userRoutes from "./routes/user.routes";
import settingRoutes from "./routes/setting.routes";
import notificationRoutes from "./routes/notification.routes";
import ticketRoutes from "./routes/ticket.routes";
import analyticsRoutes from "./routes/analytics.routes";
import sliderRoutes from "./routes/slider.routes";
import promoRoutes from "./routes/promo.routes";
import postRoutes from "./routes/post.routes";
import chatRoutes from "./routes/chat.routes";
import statsRoutes from "./routes/stats.routes";
import path from "path";

const app = express();

// ─── Body Parser ───────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── CORS ──────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3050",
    credentials: true,
  }),
);

// ─── Cookie Parser ─────────────────────────────────────────
app.use(cookieParser());

// ─── Static Files ──────────────────────────────────────────
app.use(
  "/uploads",
  (_req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../uploads")),
);

// ─── Health Check ──────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send("API Running...");
});

// ─── Routes ────────────────────────────────────────────────
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
app.use("/api/compare", compareRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/sliders", sliderRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/promos", promoRoutes); 
app.use("/api/chat", chatRoutes);
app.use("/api/posts", postRoutes);

app.use(errorMiddleware);

export default app;
