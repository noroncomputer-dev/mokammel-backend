import mongoose, { Schema, Document, CallbackError } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  description: string;
  logo: string;
  origin: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: [true, "نام برند الزامی است"],
      unique: true,
      trim: true,
      maxlength: [100, "نام نباید بیشتر از 100 کاراکتر باشد"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "", trim: true },
    logo: { type: String, default: "" },
    origin: { type: String, default: "" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ✅ اصلاح شده برای TypeScript 6 + Mongoose 9
brandSchema.pre("save", function (next: (err?: CallbackError) => void) {
  if (this.isModified("name") && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/--+/g, "-");
  }
  next();
});

const Brand = mongoose.model<IBrand>("Brand", brandSchema);
export default Brand;
