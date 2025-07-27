import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getStories = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) {
      console.error("JWT verification error:", err);
      return res.status(403).json("Token is not valid!");
    }

    console.log("User ID from token:", userInfo.id);

    const q = `
     SELECT s.*, u.name, u.profilePic 
      FROM stories AS s 
      JOIN users AS u ON (u.id = s.userId)
      WHERE s.userId = ? OR s.userId IN (
        SELECT followedUserId FROM relationships WHERE followerUserId = ?
      )
      ORDER BY s.createdAt DESC
      LIMIT 4
    `;

    db.query(q, [userInfo.id,userInfo.id], (err, data) => {
      if (err) {
        console.error("💥 SQL Error in /api/stories:", err.sqlMessage || err);
        return res.status(500).json("Server error");
      }

      return res.status(200).json(data);
    });
  });
};

export const addStory = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO stories(`img`, `createdAt`, `userId`) VALUES (?)";
    const values = [
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, [values], (err, data) => {
      if (err) {
        console.error("Add story error:", err);
        return res.status(500).json("Server error");
      }
      return res.status(200).json("Story has been created.");
    });
  });
};

export const deleteStory = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM stories WHERE `id` = ? AND `userId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) {
        console.error("Delete story error:", err);
        return res.status(500).json("Server error");
      }
      if (data.affectedRows > 0)
        return res.status(200).json("Story has been deleted.");
      return res.status(403).json("You can delete only your story!");
    });
  });
};
