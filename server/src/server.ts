import app from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("❌ MONGODB_URI is not defined in environment");

  console.log("🔍 Connecting to MongoDB...");
  console.log(`📦 Database: ${uri.includes("localhost") ? "Local" : "Atlas (Cloud)"}`);

  await mongoose.connect(uri);
  console.log("✅ MongoDB connected successfully");
};

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
