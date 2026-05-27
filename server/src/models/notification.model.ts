// server/src/models/notification.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: "order" | "review" | "system" | "promotion" | "payment";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "کاربر الزامی است"],
    },
    type: {
      type: String,
      enum: ["order", "review", "system", "promotion", "payment"],
      required: true,
    },
    title: {
      type: String,
      required: [true, "عنوان الزامی است"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "متن اعلان الزامی است"],
      trim: true,
    },
    link: {
      type: String,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

// ✅ اصلاح شده - فقط یک ایندکس ترکیبی
notificationSchema.index({ user: 1, createdAt: -1, isRead: 1 });

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);
export default Notification;
