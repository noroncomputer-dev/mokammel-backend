import mongoose, { Schema, Document } from "mongoose";

export interface ISlider extends Document {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  order: number;
  isActive: boolean;
  buttonText: string;
  createdAt: Date;
  updatedAt: Date;
}

const sliderSchema = new Schema<ISlider>(
  {
    title: {
      type: String,
      required: [true, "عنوان اسلاید الزامی است"],
      trim: true,
    },
    subtitle: { type: String, default: "" },
    image: { type: String, required: [true, "تصویر اسلاید الزامی است"] },
    link: { type: String, default: "/products" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    buttonText: { type: String, default: "مشاهده محصولات" },
  },
  { timestamps: true },
);

// مرتب‌سازی بر اساس order
sliderSchema.index({ order: 1, isActive: -1 });

const Slider = mongoose.model<ISlider>("Slider", sliderSchema);
export default Slider;
