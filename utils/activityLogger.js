import { db } from "../connect.js";

export const logActivity = (userId, type, content = "", targetId = null) => {
  const q = "INSERT INTO activities (userId, type, content, targetId) VALUES (?, ?, ?, ?)";
  db.query(q, [userId, type, content, targetId], (err) => {
    if (err) console.error("Activity logging error:", err);
  });
};