import { db } from "../connect.js";
import jwt from "jsonwebtoken";


export const getSuggestedFriends = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = `
      SELECT DISTINCT u.id, u.name, u.profilePic
      FROM users u
      JOIN relationships r2 ON u.id = r2.followedUserId
      WHERE r2.followerUserId IN (
          SELECT followedUserId
          FROM relationships
          WHERE followerUserId = ?
      )
      AND u.id != ?
      AND u.id NOT IN (
          SELECT followedUserId
          FROM relationships
          WHERE followerUserId = ?
      )
      LIMIT 10
    `;

    db.query(q, [userInfo.id, userInfo.id, userInfo.id], (err, data) => {
      if (err) {
        console.error("Error suggesting friends:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json(data);
    });
  });
};


export const getAllFriends = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = `
      SELECT u.id, u.name, u.profilePic
      FROM users u
      JOIN relationships r ON u.id = r.followedUserId
      WHERE r.followerUserId = ?
    `;

    db.query(q, [userInfo.id], (err, data) => {
      if (err) {
        console.error("Error fetching all friends:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json(data);
    });
  });
};
