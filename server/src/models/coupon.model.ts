import mongoose, { Document, Schema } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, "کد تخفیف الزامی است"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    value: {
      type: Number,
      required: [true, "مقدار تخفیف الزامی است"],
      min: [0, "مقدار تخفیف نمیتواند منفی باشد"],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
    },
    usageLimit: {
      type: Number,
      default: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "تاریخ انقضا الزامی است"],
    },
  },
  { timestamps: true },
);

const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
export default Coupon;
