import express from "express";
import { getSuggestedFriends,getAllFriends} from "../controllers/friends.js";

const router = express.Router();

router.get("/suggestions", getSuggestedFriends);
router.get("/all", getAllFriends);

export default router;