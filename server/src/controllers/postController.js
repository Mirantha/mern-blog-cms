import crypto from "crypto";
import mongoose from "mongoose";
import { z } from "zod";
import Post from "../models/Post.js";

const baseSchema = z.object({
  title: z.string().min(3).max(120),
  content: z.string().min(10, "Content is too short"),
  excerpt: z.string().max(300).optional(),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(8).optional(),
  status: z.enum(["draft", "published"]).optional(),
});
const createSchema = baseSchema;
const updateSchema = baseSchema.partial();

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// සිංහල title වලට slug එක හිස් වෙනවා, ඒ නිසා fallback "post"
const makeSlug = (title) =>
  `${slugify(title) || "post"}-${crypto.randomBytes(3).toString("hex")}`;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validationFail = (res, error) =>
  res.status(400).json({
    message: "Validation failed",
    errors: error.flatten().fieldErrors,
  });

const canModify = (post, user) =>
  user.role === "admin" || post.author.equals(user._id);

// GET /api/posts?search=&tag=&page=&limit=
export const getPosts = async (req, res, next) => {
  try {
    const { search, tag, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(Number(page) || 1, 1);
    const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const filter = { status: "published" };
    if (tag) filter.tags = String(tag).toLowerCase();
    if (search) filter.title = { $regex: escapeRegex(String(search)), $options: "i" };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .select("-content")
        .populate("author", "name")
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Post.countDocuments(filter),
    ]);

    res.json({
      data: posts,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/mine (login ඕන)
export const getMyPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .select("-content")
      .sort({ updatedAt: -1 });
    res.json({ data: posts });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:slug
export const getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug }).populate("author", "name");
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.status !== "published") {
      const allowed = req.user && canModify(post, req.user);
      if (!allowed) return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
};

// POST /api/posts
export const createPost = async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);

    const data = parsed.data;
    const post = await Post.create({
      ...data,
      slug: makeSlug(data.title),
      author: req.user._id,
      publishedAt: data.status === "published" ? new Date() : undefined,
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

// PUT /api/posts/:id
export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return validationFail(res, parsed.error);

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!canModify(post, req.user)) {
      return res.status(403).json({ message: "You can only edit your own posts" });
    }

    const data = parsed.data;
    // Slug එක වෙනස් කරන්නේ නෑ (URLs කැඩෙන්නේ නැති වෙන්න)
    Object.assign(post, data);
    if (data.status === "published" && !post.publishedAt) {
      post.publishedAt = new Date();
    }
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!canModify(post, req.user)) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    next(err);
  }
};