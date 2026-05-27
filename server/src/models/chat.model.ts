import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  user: mongoose.Types.ObjectId;
  message: string;
  response: string;
  sessionId: string;
  isRead: boolean;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    message: { type: String, required: true },
    response: { type: String, required: true },
    sessionId: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<IChatMessage>("ChatMessage", chatMessageSchema);
