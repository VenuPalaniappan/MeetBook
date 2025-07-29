import express from "express";
import { getMessages, sendMessage,getUnreadMessages } from "../controllers/messages.js";

const router = express.Router();

router.get("/:conversationId", getMessages);
router.post("/", sendMessage);
router.get("/unread/:userId", getUnreadMessages);

export default router;