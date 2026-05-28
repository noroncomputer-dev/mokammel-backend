import mongoose, { Schema, Document } from "mongoose";

export interface ITicketMessage {
  user: mongoose.Types.ObjectId;
  message: string;
  isAdmin: boolean;
  attachments?: string[];
  createdAt: Date;
}

export interface ITicket extends Document {
  user: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId;
  ticketNumber: string;
  subject: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  category: "payment" | "delivery" | "product" | "account" | "other";
  attachments: string[];
  messages: ITicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const { ObjectId } = mongoose.Types;

const ticketMessageSchema = new Schema<ITicketMessage>({
  user: { type: ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const ticketSchema = new Schema<ITicket>(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: [true, "کاربر الزامی است"],
    },
    orderId: {
      type: ObjectId,
      ref: "Order",
    },
    ticketNumber: {
      type: String,
      unique: true,
    },
    subject: {
      type: String,
      required: [true, "عنوان تیکت الزامی است"],
      trim: true,
      maxlength: [200, "عنوان نباید بیشتر از 200 کاراکتر باشد"],
    },
    message: {
      type: String,
      required: [true, "متن تیکت الزامی است"],
      trim: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    category: {
      type: String,
      enum: ["payment", "delivery", "product", "account", "other"],
      required: true,
    },
    attachments: [{ type: String }],
    messages: [ticketMessageSchema],
  },
  { timestamps: true },
);

// ✅ اصلاح شده - با مشخص کردن نوع this
ticketSchema.pre("save", async function (this: ITicket, next) {
  if (!this.ticketNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const Ticket = mongoose.model<ITicket>("Ticket");
    const count = await Ticket.countDocuments();
    this.ticketNumber = `TKT-${year}${month}-${(count + 1).toString().padStart(4, "0")}`;
  }
  next();
});

// ایندکس ترکیبی
ticketSchema.index({
  user: 1,
  status: 1,
  ticketNumber: 1,
  priority: 1,
  createdAt: -1,
});

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
export default Ticket;
