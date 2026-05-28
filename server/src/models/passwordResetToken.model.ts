import mongoose, { Schema } from "mongoose";

export interface IPasswordResetToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const passwordResetTokenSchema = new Schema({
  email: { type: String, required: true, lowercase: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // auto-delete after 1 hour
});

export default mongoose.model<IPasswordResetToken>(
  "PasswordResetToken",
  passwordResetTokenSchema,
);
