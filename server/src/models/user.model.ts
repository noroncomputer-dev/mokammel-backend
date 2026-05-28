import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "super_admin";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLogin: Date;
  addresses: {
    fullName: string;
    phone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
    isDefault: boolean;
  }[];
  wishlist: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const addressSchema = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "نام الزامی است"],
      trim: true,
      minlength: [2, "نام باید حداقل ۲ کاراکتر باشد"],
      maxlength: [50, "نام نباید بیشتر از ۵۰ کاراکتر باشد"],
    },
    email: {
      type: String,
      required: [true, "ایمیل الزامی است"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "فرمت ایمیل صحیح نیست"],
    },
    password: {
      type: String,
      required: [true, "رمز عبور الزامی است"],
      minlength: [6, "رمز عبور باید حداقل ۶ کاراکتر باشد"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "super_admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    addresses: [addressSchema],
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  {
    timestamps: true,
  },
);

// هش کردن رمز قبل از ذخیره
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// متد مقایسه رمز عبور
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);
export default User;
