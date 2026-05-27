import express from "express";
import {
  createTicket,
  getMyTickets,
  getTicketById,
  replyToTicket,
  getAllTickets,
  adminReplyToTicket,
  updateTicketStatus,
} from "../controllers/ticket.controller";
import { protect, admin } from "../middleware/auth.middleware";

const router = express.Router();

// همه مسیرها نیاز به احراز هویت دارند
router.use(protect);

// کاربر
router.post("/", createTicket);
router.get("/my-tickets", getMyTickets);
router.get("/:id", getTicketById);
router.post("/:id/reply", replyToTicket);

// ادمین
router.get("/admin/all", admin, getAllTickets);
router.post("/admin/:id/reply", admin, adminReplyToTicket);
router.put("/admin/:id/status", admin, updateTicketStatus);

export default router;
