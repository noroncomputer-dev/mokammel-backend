import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDB from "./config/db";

const app = express();
const PORT = process.env.PORT || 5000;

// اتصال به دیتابیس
connectDB();

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
