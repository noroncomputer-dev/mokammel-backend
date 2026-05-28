import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: "nutrition" | "training" | "supplements" | "lifestyle";
  tags: string[];
  author: string;
  views: number;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, default: "" },
    category: {
      type: String,
      enum: ["nutrition", "training", "supplements", "lifestyle"],
      required: true,
    },
    tags: [{ type: String }],
    author: { type: String, default: "مکمل‌شاپ" },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true },
);

postSchema.pre("save", async function () {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .replace(/[\s_]+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .toLowerCase();
  }
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export default mongoose.model<IPost>("Post", postSchema);
