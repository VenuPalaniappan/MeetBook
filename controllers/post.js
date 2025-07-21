import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const values =
      userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id];

    const q =
      userId !== "undefined"
        ? `
      SELECT 
        p.*, 
        u.id AS userId, u.name AS userName, u.profilePic AS userProfilePic,
        op.desc AS originalDesc, op.img AS originalImg, 
        ou.id AS originalUserId, ou.name AS originalUserName, ou.profilePic AS originalProfilePic
      FROM posts AS p
      JOIN users AS u ON u.id = p.userId
      LEFT JOIN posts AS op ON p.sharedPostId = op.id
      LEFT JOIN users AS ou ON op.userId = ou.id
      WHERE p.userId = ?
      ORDER BY p.createdAt DESC
      `
        : `
      SELECT 
        p.*, 
        u.id AS userId, u.name AS userName, u.profilePic AS userProfilePic,
        op.desc AS originalDesc, op.img AS originalImg, 
        ou.id AS originalUserId, ou.name AS originalUserName, ou.profilePic AS originalProfilePic
      FROM posts AS p
      JOIN users AS u ON u.id = p.userId
      LEFT JOIN posts AS op ON p.sharedPostId = op.id
      LEFT JOIN users AS ou ON op.userId = ou.id
      LEFT JOIN relationships AS r ON p.userId = r.followedUserId
      WHERE r.followerUserId = ? OR p.userId = ?
      ORDER BY p.createdAt DESC
      `;

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const addPost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "INSERT INTO posts(`desc`, `img`, `place`, `friends`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.desc,
      req.body.img || null,
      req.body.place || null,
      req.body.friends || null,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Post has been created.");
    });
  });
};
export const deletePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q =
      "DELETE FROM posts WHERE `id`=? AND `userId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if(data.affectedRows>0) return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post")
    });
  });
};

export const sharePost = (req, res) => {
  const { originalPostId, userId, desc } = req.body;

  console.log("🔥 SHARE POST HIT");
  console.log("Request body:", req.body);

  const q = `
    INSERT INTO posts (\`desc\`, \`img\`, \`place\`, \`friends\`, \`userId\`, \`createdAt\`, \`isShared\`, \`sharedPostId\`)
    SELECT ?, \`img\`, \`place\`, \`friends\`, ?, NOW(), 1, \`id\`
    FROM posts
    WHERE id = ?
  `;

  db.query(q, [desc, userId, originalPostId], (err, data) => {
    if (err) {
      console.error("❌ SQL ERROR in sharePost:", err);
      return res.status(500).json({ message: "DB error", error: err });
    }

    console.log("✅ Share inserted successfully");
    return res.status(200).json("Post shared successfully");
  });
};