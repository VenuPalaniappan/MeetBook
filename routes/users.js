import express from "express";
import {getUser,updateUser,getSuggestions,getOnlineFriends,checkProfileAccess,searchUsers } from "../controllers/user.js";

const router = express.Router();


router.get("/suggestions", getSuggestions);
router.get("/online", getOnlineFriends);
router.get("/access/:id", checkProfileAccess);
router.get("/search", searchUsers);
router.get("/find/:userId", getUser);
router.put("/", updateUser);
router.get("/:userId", getUser);





export default router;
