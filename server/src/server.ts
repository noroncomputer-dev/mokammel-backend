import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// ساده‌ترین مسیرها
app.get("/", (req, res) => {
  res.json({ message: "Mokammel API is running 🚀" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

app.get("/api/products", (req, res) => {
  res.json({ products: [], message: "Products endpoint working" });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
