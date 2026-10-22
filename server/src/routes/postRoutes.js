import { Router } from "express";
import {
  getPosts,
  getMyPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
} from "../controllers/postController.js";
import { protect, authorize, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", getPosts);
router.get("/mine", protect, getMyPosts); // /:slug එකට කලින් තියෙන්න ඕන
router.get("/:slug", optionalAuth, getPostBySlug);

router.post("/", protect, authorize("editor", "admin"), createPost);
router.put("/:id", protect, authorize("editor", "admin"), updatePost);
router.delete("/:id", protect, authorize("editor", "admin"), deletePost);

export default router;