import express from "express";
import { sendMessage, getChatHistory } from "../controllers/chat.controller";

const router = express.Router();

// ✅ حذف protect - چت‌بات برای همه آزاد باشد
router.post("/send", sendMessage);
router.get("/history/:sessionId", getChatHistory);

export default router;
