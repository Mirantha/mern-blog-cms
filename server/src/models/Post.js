import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, trim: true, maxlength: 300, default: "" },
    tags: { type: [String], default: [] },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

export default mongoose.model("Post", postSchema);