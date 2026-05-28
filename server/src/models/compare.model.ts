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

const compareItemSchema = new Schema({
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

const compareSchema = new Schema(
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

compareSchema.pre("save", function (next: (err?: Error) => void) {
  const doc = this as any;
  if (doc.items && doc.items.length > 4) {
    return next(new Error("حداکثر ۴ محصول می‌توانید مقایسه کنید"));
  }
  next();
});

const Compare = mongoose.model<ICompare>("Compare", compareSchema);
export default Compare;
