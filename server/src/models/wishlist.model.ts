// server/src/models/wishlist.model.ts

import mongoose, { Document, Schema } from "mongoose";

export interface IWishlistItem {
  product: mongoose.Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  user: mongoose.Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const { ObjectId } = mongoose.Types;

const wishlistItemSchema = new Schema<IWishlistItem>({
  product: {
    type: ObjectId,
    ref: "Product",
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [wishlistItemSchema],
  },
  {
    timestamps: true,
  },
);

const Wishlist = mongoose.model<IWishlist>("Wishlist", wishlistSchema);
export default Wishlist;
