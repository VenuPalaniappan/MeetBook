import express from "express";
import { getSuggestedFriends,getAllFriends,addFriend,unfriend} from "../controllers/friends.js";

const router = express.Router();

router.get("/suggestions", getSuggestedFriends);
router.get("/allFriends", getAllFriends);
router.post("/add", addFriend);
router.post("/unfriend", unfriend);

export default router;