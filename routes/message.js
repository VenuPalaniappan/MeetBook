import express from "express";
import { getMessages, sendMessage } from "../controllers/message.js";

const router = express.Router();

// Get all messages for a conversation
router.get("/:conversationId", getMessages);

// Send a new message
router.post("/", sendMessage);

export default router;
