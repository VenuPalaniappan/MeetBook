import express from "express";
import { getPosts, addPost, deletePost,sharePost,getSinglePost,updatePost } from "../controllers/post.js";
import { verifyToken } from "../middleware/verifyToken.js";


const router = express.Router();

router.get("/", getPosts);
router.post("/", addPost);
router.delete("/:id", deletePost);
router.post("/share", sharePost);
router.get("/single/:id", verifyToken, getSinglePost);
router.put("/:id", verifyToken, updatePost); 
router.put("/:id", updatePost);   

export default router;