import { db } from "../connect.js";
import jwt from "jsonwebtoken";

// ✅ Get user by ID with null check
export const getUser = (req, res) => {
  const userId = req.params.userId;
  const q = "SELECT * FROM users WHERE id=?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found");

    const { password, ...info } = data[0];
    return res.json(info);
  });
};

// ✅ Update user (requires JWT)
export const updateUser = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const { name, city, website, profilePic, coverPic } = req.body;

    const q = `
      UPDATE users SET name=?, city=?, website=?, profilePic=?, coverPic=? 
      WHERE id=?
    `;

    db.query(
      q,
      [name, city, website, profilePic, coverPic, userInfo.id],
      (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.affectedRows === 0) {
          return res.status(403).json("You can update only your account!");
        }

        // ✅ Insert into gallery if profilePic was updated
        if (profilePic) {
          db.query(
            "INSERT INTO gallery (userId, image, type) VALUES (?, ?, 'profile')",
            [userInfo.id, profilePic],
            (err) => {
              if (err) console.error("Failed to insert profilePic into gallery:", err);
            }
          );
        }

        // ✅ Insert into gallery if coverPic was updated
        if (coverPic) {
          db.query(
            "INSERT INTO gallery (userId, image, type) VALUES (?, ?, 'cover')",
            [userInfo.id, coverPic],
            (err) => {
              if (err) console.error("Failed to insert coverPic into gallery:", err);
            }
          );
        }

        return res.status(200).json("User updated successfully!");
      }
    );
  });
};

// ✅ Get friend suggestions (excluding self)
export const getSuggestions = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT id, name, profilePic 
      FROM users 
      WHERE id != ?
        AND id NOT IN (
          SELECT r1.followedUserId
          FROM relationships r1
          JOIN relationships r2
            ON r1.followedUserId = r2.followerUserId
           AND r1.followerUserId = r2.followedUserId
          WHERE r1.followerUserId = ?
        )
        AND id NOT IN (
          SELECT followedUserId FROM relationships WHERE followerUserId = ?
        )
      LIMIT 5
    `;


    db.query(q, [userInfo.id,userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

// ✅ Get online friends
export const getOnlineFriends = (req, res) => {
  const q = "SELECT id, name, profilePic FROM users WHERE online = 1 LIMIT 10";

  db.query(q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

export const checkProfileAccess = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Invalid token");

    const profileUserId = req.params.id;

    if (parseInt(userInfo.id) === parseInt(profileUserId)) {
      return res.status(200).json({ access: "full" });
    }

    const q = `
      SELECT * FROM relationships
      WHERE followerUserId = ? AND followedUserId = ?
    `;

    db.query(q, [userInfo.id, profileUserId], (err, data) => {
      if (err) return res.status(500).json(err);

      if (data.length > 0) {
        return res.status(200).json({ access: "posts" });
      } else {
        return res.status(403).json({ access: "none" });
      }
    });
  });
};