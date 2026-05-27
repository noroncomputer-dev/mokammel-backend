import express from "express";
import {
  requestPayment,
  verifyPayment,
  getPaymentStatus,
} from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/zarinpal", protect, requestPayment);
router.get("/verify", verifyPayment);
router.get("/status/:orderId", protect, getPaymentStatus);

export default router;
