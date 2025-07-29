import { db } from "../connect.js";
import jwt from "jsonwebtoken";

// GET /api/messages/:conversationId
export const getMessages = (req, res) => {
  const { conversationId } = req.params;

  const q = "SELECT * FROM messages WHERE conversationId = ? ORDER BY createdAt ASC";

  db.query(q, [conversationId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};

// POST /api/messages

export const sendMessage = (req, res) => {
  const { conversationId, senderId, receiverId, text } = req.body;

  const q = `
  INSERT INTO messages 
  (conversationId, senderId, receiverId, text, isRead, createdAt)
  VALUES (?, ?, ?, ?, ?, ?)
`;
 const values = [conversationId, senderId, receiverId, text, 0, new Date()];

  db.query(q, values, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json({ id: data.insertId, conversationId, senderId, text });
  });
};

export const getUnreadMessages = (req, res) => {
   const userId = req.params.userId;


    const q = `
      SELECT * FROM messages 
      WHERE receiverId = ? AND isRead = 0
    `;

    db.query(q, [userId], (err, data) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
    return res.status(200).json(data);
  });
};