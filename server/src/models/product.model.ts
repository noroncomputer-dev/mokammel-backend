// backend/src/models/product.model.ts
import mongoose, { Schema, Document } from "mongoose";

// ==================== تایپ‌ها ====================
export interface IProductFlavor {
  name: string;
  inStock: boolean;
  priceAdjustment?: number;
  label?: string;
}

export interface IProductNutritionFactExtra {
  label: string;
  value: string;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  stock: number;
  sold: number;
  rating: number;
  reviewCount: number;
  flavors: string[];
  weights: string[];
  nutritionFacts: {
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    extra?: IProductNutritionFactExtra[];
  };
  specifications: {
    weight: string;
    servingSize: string;
    servingsPerContainer: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar: number;
    sodium: number;
    caffeine: number;
    creatine: number;
    betaAlanine: number;
    bcaa: number;
    glutamine: number;
  };
  ingredients: string[];
  howToUse: string;
  warnings: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== اسکیما ====================
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "نام محصول الزامی است"],
      trim: true,
      maxlength: [200, "نام محصول نباید بیشتر از ۲۰۰ کاراکتر باشد"],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "توضیحات محصول الزامی است"],
    },
    shortDescription: {
      type: String,
      maxlength: [300, "توضیح کوتاه نباید بیشتر از ۳۰۰ کاراکتر باشد"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "قیمت محصول الزامی است"],
      min: [0, "قیمت نمیتواند منفی باشد"],
    },
    discountPrice: {
      type: Number,
      min: [0, "قیمت تخفیف نمیتواند منفی باشد"],
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "دسته‌بندی محصول الزامی است"],
      index: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: "Brand",
      required: [true, "برند محصول الزامی است"],
      index: true,
    },
    stock: {
      type: Number,
      required: [true, "موجودی محصول الزامی است"],
      min: [0, "موجودی نمیتواند منفی باشد"],
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    flavors: {
      type: [String],
      default: [],
    },
    weights: {
      type: [String],
      default: [],
    },
    nutritionFacts: {
      servingSize: { type: String, default: "" },
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      extra: [
        {
          label: { type: String, default: "" },
          value: { type: String, default: "" },
        },
      ],
    },
    specifications: {
      weight: { type: String, default: "" },
      servingSize: { type: String, default: "" },
      servingsPerContainer: { type: Number, default: 0 },
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      sugar: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
      caffeine: { type: Number, default: 0 },
      creatine: { type: Number, default: 0 },
      betaAlanine: { type: Number, default: 0 },
      bcaa: { type: Number, default: 0 },
      glutamine: { type: Number, default: 0 },
    },
    ingredients: {
      type: [String],
      default: [],
    },
    howToUse: {
      type: String,
      default: "",
    },
    warnings: {
      type: String,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ==================== تابع کمکی برای ساخت اسلاگ ====================
const generateSlug = (name: string): string => {
  if (!name) return `product-${Date.now()}`;

  return (
    name
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || `product-${Date.now()}`
  );
};

// ==================== میدلور pre-save برای ساخت اسلاگ ====================
productSchema.pre("save", async function () {
  try {
    // اگر slug وجود دارد و نام تغییر نکرده، نیازی به تغییر نیست
    if (this.slug && !this.isModified("name")) {
      return;
    }

    if (!this.name) {
      this.slug = `product-${Date.now()}`;
      return;
    }

    let baseSlug = generateSlug(this.name);
    let finalSlug = baseSlug;
    let counter = 1;

    const Product = mongoose.model<IProduct>("Product");

    while (await Product.findOne({ slug: finalSlug, _id: { $ne: this._id } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = finalSlug;
  } catch (error) {
    console.error("Error generating slug:", error);
    this.slug = `product-${Date.now()}`;
  }
});
// ==================== میدلور pre-update برای slug ====================
productSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as any;

  if (update.$set?.name) {
    const name = update.$set.name;
    const baseSlug = generateSlug(name);
    let finalSlug = baseSlug;
    let counter = 1;

    const Product = mongoose.model<IProduct>("Product");
    const currentDoc = await this.model.findOne(this.getQuery());

    while (
      await Product.findOne({ slug: finalSlug, _id: { $ne: currentDoc?._id } })
    ) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    update.$set.slug = finalSlug;
  }
});

// ==================== فیلد مجازی قیمت نهایی ====================
productSchema.virtual("finalPrice").get(function (this: IProduct) {
  return this.discountPrice && this.discountPrice > 0
    ? this.discountPrice
    : this.price;
});

// ==================== فیلد مجازی درصد تخفیف ====================
productSchema.virtual("discountPercent").get(function (this: IProduct) {
  if (this.discountPrice && this.discountPrice > 0 && this.price > 0) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// ==================== فیلد مجازی موجود بودن ====================
productSchema.virtual("inStock").get(function (this: IProduct) {
  return this.stock > 0 && this.isActive;
});

// ==================== ایندکس‌ها ====================
productSchema.index({
  name: "text",
  description: "text",
  shortDescription: "text",
});
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ brand: 1, isActive: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

// ==================== کامپایل مدل ====================
const Product = mongoose.model<IProduct>("Product", productSchema);
export default Product;
