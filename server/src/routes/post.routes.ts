import express from "express";
import {
  getPublishedPosts,
  getPostBySlug,
  getRelatedPosts,
  getPostsByCategory,
  searchPosts,
} from "../controllers/post.controller";

const router = express.Router();

// ⚠️ IMPORTANT: مسیرهای خاص باید قبل از مسیرهای عمومی قرار بگیرند
router.get("/search", searchPosts);
router.get("/related", getRelatedPosts);
router.get("/category/:category", getPostsByCategory);
router.get("/", getPublishedPosts);
router.get("/:slug", getPostBySlug);

export default router;
