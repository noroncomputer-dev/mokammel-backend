import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("❌ MONGODB_URI is not defined in .env");
    }
    await mongoose.connect(uri);
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
