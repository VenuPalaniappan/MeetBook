import { db } from "../connect.js";
import jwt from "jsonwebtoken";


export const getUserImages  = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token not valid!");

    const q = `
      SELECT profilePic, coverPic
      FROM users
      WHERE id = ?
    `;

    db.query(q, [userInfo.id], (err, data) => {
      if (err) {
        console.error("Error fetching user images:", err);
        return res.status(500).json(err);
      }

   
      const images = [];
      if (data[0]?.profilePic) images.push(data[0].profilePic);
      if (data[0]?.coverPic) images.push(data[0].coverPic);

      return res.status(200).json(images);
    });
  });
};
