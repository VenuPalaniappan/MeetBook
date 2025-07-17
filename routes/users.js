import express from "express";
import {
  getUser,
  updateUser,
  getSuggestions,
  getOnlineFriends,
} from "../controllers/user.js";

const router = express.Router();

// Specific routes first
router.get("/suggestions", getSuggestions);
router.get("/online", getOnlineFriends);

// Add this to support /find/:userId
router.get("/find/:userId", getUser);

// Generic routes
router.get("/:userId", getUser);
router.put("/", updateUser);

export default router;
