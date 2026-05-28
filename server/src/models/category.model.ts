import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "نام دسته بندی الزامی است"],
      unique: true,
      trim: true,
      maxLength: [100, "نام نباید بیشتراز 100 کاراکتر باشد"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Category = mongoose.model<ICategory>("Category", categorySchema);
export default Category;
