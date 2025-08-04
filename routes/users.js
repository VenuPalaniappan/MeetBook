import express from "express";
import {getUser,updateUser,getSuggestions,getOnlineFriends,checkProfileAccess } from "../controllers/user.js";

const router = express.Router();


router.get("/suggestions", getSuggestions);
router.get("/online", getOnlineFriends);
router.get("/find/:userId", getUser);
router.get("/:userId", getUser);
router.put("/", updateUser);
router.get("/access/:id", checkProfileAccess);

export default router;
