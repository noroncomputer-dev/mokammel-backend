import mongoose, { Document, Schema, HydratedDocument } from "mongoose";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  flavor?: string;
  weight?: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  postalCode: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  coupon?: mongoose.Types.ObjectId;
  couponCode?: string;
  couponDiscount?: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded";
  paymentMethod: "zarinpal" | "cod";
  zarinpalAuthority?: string;
  zarinpalRefId?: string;
  paidAt?: Date;
  deliveredAt?: Date;
  trackingCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "کاربر الزامی است"],
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        flavor: { type: String, default: "" },
        weight: { type: String, default: "" },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      province: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    coupon: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
    },
    couponCode: {
      type: String,
      default: "",
    },
    couponDiscount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["zarinpal", "cod"],
      required: true,
      default: "zarinpal",
    },
    zarinpalAuthority: { type: String, default: "" },
    zarinpalRefId: { type: String, default: "" },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
    trackingCode: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

// ایجاد شماره سفارش خودکار
orderSchema.pre("save", async function (this: HydratedDocument<IOrder>) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const Order = mongoose.model("Order");
    const count = await Order.countDocuments();
    this.orderNumber = `ORD-${year}${month}${day}-${(count + 1).toString().padStart(4, "0")}`;
  }
});

orderSchema.index({
  user: 1,
  status: 1,
  paymentStatus: 1,
  orderNumber: 1,
  createdAt: -1,
});

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
