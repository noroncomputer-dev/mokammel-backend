// server/src/models/compare.model.ts

import mongoose, { Document, Schema } from "mongoose";

export interface ICompareItem {
  product: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface ICompare extends Document {
  user: mongoose.Types.ObjectId;
  items: ICompareItem[];
  createdAt: Date;
  updatedAt: Date;
}

const compareItemSchema = new Schema<ICompareItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const compareSchema = new Schema<ICompare>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [compareItemSchema],
  },
  {
    timestamps: true,
  },
);

// ✅ اصلاح شده - فقط محدودیت تعداد محصولات
compareSchema.pre("save", function (this: ICompare, next: any) {
  if (this.items && this.items.length > 4) {
    return next(new Error("حداکثر ۴ محصول می‌توانید مقایسه کنید"));
  }
  next();
});

// ❌ ایندکس تکراری حذف شد (unique: true خودکار ایندکس میسازه)

const Compare = mongoose.model<ICompare>("Compare", compareSchema);
export default Compare;
