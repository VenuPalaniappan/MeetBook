import express from "express";
import { getPosts, addPost, deletePost,sharePost } from "../controllers/post.js";


const router = express.Router();

router.get("/", getPosts);
router.post("/", addPost);
router.delete("/:id", deletePost);
router.post("/share", sharePost);

export default router;