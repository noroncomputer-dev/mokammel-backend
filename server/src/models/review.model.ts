import mongoose, { Schema, Document, HydratedDocument } from "mongoose";

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  likes: mongoose.Types.ObjectId[];
  dislikes: mongoose.Types.ObjectId[];
  isApproved: boolean;
  adminReply?: {
    comment: string;
    createdAt: Date;
    adminName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "کاربر الزامی است"],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "محصول الزامی است"],
    },
    rating: {
      type: Number,
      required: [true, "امتیاز الزامی است"],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: [true, "عنوان نظر الزامی است"],
      trim: true,
      maxlength: [100, "عنوان نباید بیشتر از 100 کاراکتر باشد"],
    },
    comment: {
      type: String,
      required: [true, "متن نظر الزامی است"],
      trim: true,
      maxlength: [1000, "نظر نباید بیشتر از 1000 کاراکتر باشد"],
    },
    images: {
      type: [String],
      default: [],
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isApproved: {
      type: Boolean,
      default: false,
    },
    adminReply: {
      comment: { type: String },
      createdAt: { type: Date },
      adminName: { type: String },
    },
  },
  { timestamps: true },
);

// هر کاربر فقط یک نظر برای هر محصول
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, isApproved: 1 });

// آپدیت rating محصول بعد از ثبت نظر
reviewSchema.post("save", async function (this: HydratedDocument<IReview>) {
  const Product = mongoose.model("Product");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { product: this.product, isApproved: true } },
    {
      $group: {
        _id: "$product",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

const Review = mongoose.model<IReview>("Review", reviewSchema);
export default Review;
