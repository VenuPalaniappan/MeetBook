import express from "express";
import { getActivities } from "../controllers/activities.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getActivities);

export default router;
