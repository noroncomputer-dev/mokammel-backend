// backend/src/models/promo.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPromo extends Document {
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  link: string;
  buttonText: string;
  icon: "Percent" | "Zap" | "Gift" | "Clock" | "Sparkles";
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromoSchema = new Schema<IPromo>(
  {
    title: {
      type: String,
      required: [true, "عنوان بنر الزامی است"],
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
    },
    badge: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      required: [true, "تصویر بنر الزامی است"],
    },
    link: {
      type: String,
      default: "/products",
    },
    buttonText: {
      type: String,
      default: "مشاهده محصولات",
    },
    icon: {
      type: String,
      enum: ["Percent", "Zap", "Gift", "Clock", "Sparkles"],
      default: "Percent",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ایندکس برای مرتب‌سازی
PromoSchema.index({ order: 1, isActive: -1 });

const Promo = mongoose.model<IPromo>("Promo", PromoSchema);
export default Promo;
