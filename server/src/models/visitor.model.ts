import mongoose, { Schema } from "mongoose";

export interface IVisitor extends mongoose.Document {
  sessionId: string;
  userId?: mongoose.Types.ObjectId;
  ip: string;
  userAgent: string;
  page: string;
  referrer: string;
  duration: number;
  createdAt: Date;
}

const { ObjectId } = mongoose.Types;

const visitorSchema = new Schema<IVisitor>(
  {
    sessionId: { type: String, required: true },
    userId: { type: ObjectId, ref: "User" },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    page: { type: String, required: true },
    referrer: { type: String, default: "" },
    duration: { type: Number, default: 0 },
  },
  { timestamps: true },
);

visitorSchema.index({ sessionId: 1, createdAt: -1 });
visitorSchema.index({ createdAt: -1 });

export default mongoose.model<IVisitor>("Visitor", visitorSchema);
