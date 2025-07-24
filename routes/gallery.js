import express from "express";
import { getUserImages } from "../controllers/gallery.js";

const router = express.Router();

router.get("/allImages", getUserImages );


export default router;