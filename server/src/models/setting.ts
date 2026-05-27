import mongoose, { Document, Schema } from "mongoose";

export interface ISetting extends Document {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeLogo: string;
  metaDescription: string;
  metaKeywords: string;
  maintenanceMode: boolean;
  allowGuestCheckout: boolean;
  minOrderAmount: number;
  shippingCost: number;
  freeShippingThreshold: number;
}

const SettingSchema = new Schema<ISetting>(
  {
    storeName: { type: String, default: "فروشگاه مکمل" },
    storeEmail: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    storeAddress: { type: String, default: "" },
    storeLogo: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },
    maintenanceMode: { type: Boolean, default: false },
    allowGuestCheckout: { type: Boolean, default: true },
    minOrderAmount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    freeShippingThreshold: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model<ISetting>("Setting", SettingSchema);
