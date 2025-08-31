import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import { logActivity } from "../utils/activityLogger.js";

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
      SELECT DISTINCT
        p.*, p.place_id AS placeId,p.place_lat AS placeLat,p.place_lng AS placeLng,
        u.id AS userId, u.name AS userName, u.profilePic AS profilePic,
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
      SELECT DISTINCT
        p.*, p.place_id AS placeId,p.place_lat AS placeLat,p.place_lng AS placeLng,
        u.id AS userId, u.name AS userName, u.profilePic AS profilePic,
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
    console.log("Post data from frontend:", req.body);

   const {
      desc,
      img,
      place,     
      placeId,    
      placeLat,   
      placeLng, 
      friends,
    } = req.body;

   const lat =
      placeLat === null || placeLat === undefined || placeLat === ""
        ? null
        : Number(placeLat);
    const lng =
      placeLng === null || placeLng === undefined || placeLng === ""
        ? null
        : Number(placeLng);

     const q = `
      INSERT INTO posts
        (\`desc\`, \`img\`, \`userId\`, \`place\`, \`place_id\`, \`place_lat\`, \`place_lng\`, \`friends\`, \`createdAt\`)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const values = [
      desc || null,
      img || null,
      userInfo.id,
      place || null,
      placeId || null,
      Number.isFinite(lat) ? lat : null,
      Number.isFinite(lng) ? lng : null,
      friends || null,
    ];

     db.query(q, values, (sqlErr, data) => {
      if (sqlErr) {
        // 🔎 Make the real cause visible in your terminal
        console.error("AddPost SQL error:", sqlErr?.sqlMessage || sqlErr, {
          values,
        });
        return res.status(500).json(sqlErr);
      }
      try {
        logActivity(userInfo.id, "post", desc || "", data.insertId);
      } catch (_) {}
      return res.status(200).json({ id: data.insertId, ok: true });
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

        

        const q = `
            INSERT INTO posts(\`desc\`, \`img\`, \`userId\`,\`createdAt\`, \`updatedAt\`,\`place\`, \`friends\`,\`sharedPostId\`, \`isShared\`,\`place_id\`, \`place_lat\`, \`place_lng\`)
            SELECT ?, p.img,?,NOW(),NOW(),p.place, p.friends,p.id,1,            
              p.place_id, p.place_lat, p.place_lng
            FROM posts p
            WHERE p.id = ?;
          `;
        db.query(q, [desc, userId, originalPostId], (err, data) => {
          if (err) {
            console.error("❌ SQL ERROR in sharePost:", err);
            return res.status(500).json({ message: "DB error", error: err });
          }

        
          return res.status(200).json("Post shared successfully");
        });
      };

        export const getSinglePost = (req, res) => {
          const postId = req.params.id;

          const q = `
            SELECT p.*, p.place_id AS placeId,p.place_lat AS placeLat,p.place_lng AS placeLng,
            u.id AS userId, u.name AS userName, u.profilePic
            FROM posts AS p
            JOIN users AS u ON u.id = p.userId
            WHERE p.id = ?
          `;

          db.query(q, [postId], (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.length === 0) return res.status(404).json("Post not found");
            return res.status(200).json(data[0]);
          });
        };

export const updatePost = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const postId = Number(req.params.id);
    const {
      desc,
      img,
      place,
      placeId,
      placeLat,
      placeLng,
      friends,
    } = req.body;

    const lat =
      placeLat === null || placeLat === undefined || placeLat === ""
        ? null
        : Number(placeLat);
    const lng =
      placeLng === null || placeLng === undefined || placeLng === ""
        ? null
        : Number(placeLng);

    // Ensure the post exists and belongs to the user
    db.query("SELECT userId FROM posts WHERE id = ?", [postId], (e1, rows) => {
      if (e1) return res.status(500).json(e1);
      if (!rows.length) return res.status(404).json("Post not found");
      if (rows[0].userId !== userInfo.id)
        return res.status(403).json("You can update only your post");

      // Update: keep old values when you pass null/undefined (COALESCE)
      const q = `
        UPDATE posts
           SET \`desc\`      = COALESCE(?, \`desc\`),
               \`img\`       = COALESCE(?, \`img\`),
               \`place\`     = COALESCE(?, \`place\`),
               \`place_id\`  = COALESCE(?, \`place_id\`),
               \`place_lat\` = COALESCE(?, \`place_lat\`),
               \`place_lng\` = COALESCE(?, \`place_lng\`),
               \`friends\`   = COALESCE(?, \`friends\`),
               \`updatedAt\` = NOW()
         WHERE id = ? AND userId = ?`;

      const values = [
        desc ?? null,
        img ?? null,
        place ?? null,
        placeId ?? null,
        Number.isFinite(lat) ? lat : null,
        Number.isFinite(lng) ? lng : null,
        friends ?? null,
        postId,
        userInfo.id,
      ];

      db.query(q, values, (e2) => {
        if (e2) return res.status(500).json(e2);

        // Return fresh row (same shape as getSinglePost)
        const q2 = `
          SELECT p.*, p.place_id AS placeId, p.place_lat AS placeLat, p.place_lng AS placeLng,
                 u.id AS userId, u.name AS userName, u.profilePic
            FROM posts AS p
            JOIN users AS u ON u.id = p.userId
           WHERE p.id = ?`;
        db.query(q2, [postId], (e3, rows2) => {
          if (e3) return res.status(500).json(e3);
          try { logActivity(userInfo.id, "post_update", desc || "", postId); } catch (_) {}
          return res.status(200).json(rows2[0]);
        });
      });
    });
  });
};