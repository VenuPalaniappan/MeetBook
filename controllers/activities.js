import { db } from "../connect.js";

export const getActivities = (req, res) => {
  const userId = req.user.id;

  const q = `
    SELECT a.*, u.name, u.profilePic 
    FROM activities AS a
    JOIN users AS u ON u.id = a.userId
    WHERE a.userId IN (
      SELECT followedUserId FROM relationships WHERE followerUserId = ?
    )
    ORDER BY a.createdAt DESC
    LIMIT 10
  `;

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
};
