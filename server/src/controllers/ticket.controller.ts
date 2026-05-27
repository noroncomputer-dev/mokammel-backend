// server/src/controllers/ticket.controller.ts

import { Request, Response } from "express";
import asyncHandler from "../utils/asyncHandler";
import apiResponse from "../utils/apiResponse";
import Ticket from "../models/ticket.model";
import { AuthRequest } from "../middleware/auth.middleware";
import { createNotification } from "./notification.controller";

// ایجاد تیکت جدید
export const createTicket = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { subject, message, priority, category, orderId } = req.body;

    if (!subject || !message || !category) {
      res
        .status(400)
        .json(apiResponse(false, "عنوان، متن و دسته‌بندی الزامی است"));
      return;
    }

    const ticket = await Ticket.create({
      user: req.user?._id,
      orderId,
      subject,
      message,
      priority: priority || "medium",
      category,
      status: "open",
    });

    // ✅ اصلاح شده: type "ticket" به "system" تغییر کرد
    await createNotification(
      req.user?._id.toString(),
      "system",
      "تیکت پشتیبانی ثبت شد",
      `تیکت شما با عنوان "${subject}" با موفقیت ثبت شد.`,
      `/profile/tickets/${ticket._id}`,
    );

    res
      .status(201)
      .json(apiResponse(true, "تیکت با موفقیت ثبت شد", { ticket }));
  },
);

// دریافت تیکت‌های کاربر جاری
export const getMyTickets = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find({ user: req.user?._id })
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Ticket.countDocuments({ user: req.user?._id }),
    ]);

    res.json(
      apiResponse(true, "تیکت‌ها با موفقیت دریافت شد", {
        tickets,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      }),
    );
  },
);

// دریافت جزئیات یک تیکت
export const getTicketById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const ticket = await Ticket.findOne({ _id: id, user: req.user?._id })
      .populate("user", "name email")
      .lean();

    if (!ticket) {
      res.status(404).json(apiResponse(false, "تیکت یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "جزئیات تیکت دریافت شد", { ticket }));
  },
);

// پاسخ به تیکت (کاربر)
export const replyToTicket = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { message, attachments } = req.body;

    if (!message) {
      res.status(400).json(apiResponse(false, "متن پاسخ الزامی است"));
      return;
    }

    const ticket = await Ticket.findOne({ _id: id, user: req.user?._id });
    if (!ticket) {
      res.status(404).json(apiResponse(false, "تیکت یافت نشد"));
      return;
    }

    ticket.messages.push({
      user: req.user?._id,
      message,
      isAdmin: false,
      attachments: attachments || [],
      createdAt: new Date(),
    });
    ticket.status = "open";
    await ticket.save();

    res.json(apiResponse(true, "پاسخ شما با موفقیت ثبت شد", { ticket }));
  },
);

// دریافت همه تیکت‌ها (ادمین)
export const getAllTickets = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 20, status, priority } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    const filter: Record<string, any> = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    res.json(
      apiResponse(true, "لیست تیکت‌ها دریافت شد", {
        tickets,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      }),
    );
  },
);

// پاسخ ادمین به تیکت
export const adminReplyToTicket = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { message, attachments } = req.body;

    if (!message) {
      res.status(400).json(apiResponse(false, "متن پاسخ الزامی است"));
      return;
    }

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      res.status(404).json(apiResponse(false, "تیکت یافت نشد"));
      return;
    }

    ticket.messages.push({
      user: req.user?._id,
      message,
      isAdmin: true,
      attachments: attachments || [],
      createdAt: new Date(),
    });
    ticket.status = "in_progress";
    await ticket.save();

    res.json(apiResponse(true, "پاسخ ادمین با موفقیت ثبت شد", { ticket }));
  },
);

// تغییر وضعیت تیکت (ادمین)
export const updateTicketStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!ticket) {
      res.status(404).json(apiResponse(false, "تیکت یافت نشد"));
      return;
    }

    res.json(apiResponse(true, "وضعیت تیکت بروزرسانی شد", { ticket }));
  },
);
