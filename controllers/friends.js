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
      SELECT DISTINCT  u.id, u.name, u.profilePic
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

export const addFriend = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = "INSERT INTO relationships (followerUserId, followedUserId) VALUES (?, ?)";

    db.query(q, [userInfo.id, req.body.friendId], (err, data) => {
      if (err) {
        console.error("Error adding friend:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json("Friend added successfully!");
    });
  });
};

export const unfriend = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = "DELETE FROM relationships WHERE followerUserId = ? AND followedUserId = ?";

    db.query(q, [userInfo.id, req.body.friendId], (err, data) => {
      if (err) {
        console.error("Error unfriending user:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json("Unfriended successfully!");
    });
  });
};

export const sendFriendRequest = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    console.log("Sending request from:", userInfo.id, "to:", req.body.receiverId);
    if (err) {
  console.error("DB insert error:", err);
}
    if (err) return res.status(403).json("Token not valid!");

    const q = "INSERT INTO friend_requests (senderId, receiverId) VALUES (?, ?)";

    db.query(q, [userInfo.id, req.body.receiverId], (err, data) => {
      if (err) {
        console.error("Error sending request:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json("Request sent");
    });
  });
};

export const getFriendRequests = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = `
      SELECT fr.id AS requestId, u.id, u.name, u.profilePic
      FROM friend_requests AS fr
      JOIN users AS u ON u.id = fr.senderId
      WHERE fr.receiverId = ?
    `;

    db.query(q, [userInfo.id], (err, data) => {
      if (err) {
        console.error("Error fetching friend requests:", err);
        return res.status(500).json(err);
      }
      return res.status(200).json(data);
    });
  });
};

export const acceptFriendRequest = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const senderId = req.body.senderId;

    const addRelation = `
      INSERT INTO relationships (followerUserId, followedUserId) VALUES (?, ?), (?, ?);
    `;
    const deleteRequest = `
      DELETE FROM friend_requests WHERE senderId = ? AND receiverId = ?;
    `;

    db.query(addRelation, [userInfo.id, senderId, senderId, userInfo.id], (err) => {
      if (err) return res.status(500).json(err);
      db.query(deleteRequest, [senderId, userInfo.id], (err2) => {
        if (err2) return res.status(500).json(err2);
        return res.status(200).json("Friend request accepted!");
      });
    });
  });
};

export const rejectFriendRequest = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = "DELETE FROM friend_requests WHERE senderId = ? AND receiverId = ?";
    db.query(q, [req.body.senderId, userInfo.id], (err) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Friend request rejected.");
    });
  });
};