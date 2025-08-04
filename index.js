import express from "express";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import commentRoutes from "./routes/comments.js";
import likeRoutes from "./routes/likes.js";
import relationshipRoutes from "./routes/relationships.js";
import storyRoutes from "./routes/stories.js";
import friendsRoutes from "./routes/friends.js";
import galleryRoutes from "./routes/gallery.js";
import activityRoutes from "./routes/activities.js";
import messageRoutes from "./routes/message.js";



const app = express();

// Required for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static images
app.use("/upload", express.static(path.join(__dirname, "../client/public/upload")));

app.use(cors({
  origin: "http://localhost:5173", // frontend dev server
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Upload setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../client/public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});
const upload = multer({ storage: storage });

app.post("/api/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  res.status(200).json(file.filename);
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/relationships", relationshipRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/friends", friendsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/messages", messageRoutes);


// Server start
app.listen(8800, () => {
  console.log("API working on port 8800!");
});
