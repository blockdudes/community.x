import { Router } from "express";
import { getAllPost, getAllPosts } from "../controllers/postController.ts";

const router = Router();
router.get("/post/get/all", getAllPost);
router.get("/post/get/all/:id", getAllPosts);
export default router;