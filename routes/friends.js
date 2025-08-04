import express from "express";
import { getSuggestedFriends,getAllFriends,addFriend,unfriend,sendFriendRequest,getFriendRequests,acceptFriendRequest,rejectFriendRequest,followUser} from "../controllers/friends.js";

const router = express.Router();

router.get("/suggestions", getSuggestedFriends);
router.get("/all", getAllFriends);
router.post("/add", addFriend);
router.post("/unfriend", unfriend);
router.post("/sendRequest", sendFriendRequest);
router.get("/requests", getFriendRequests);
router.post("/acceptRequest", acceptFriendRequest);
router.post("/rejectRequest", rejectFriendRequest);
router.post("/follow", followUser); 


export default router;