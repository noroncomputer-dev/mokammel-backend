import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  amount: number;
  authority: string;
  refId: string;
  status: "pending" | "success" | "failed";
  cardPan: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    authority: { type: String, required: true },
    refId: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    cardPan: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model<IPayment>("Payment", paymentSchema);
