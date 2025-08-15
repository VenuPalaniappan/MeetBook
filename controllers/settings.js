import { db } from "../connect.js";
import jwt from "jsonwebtoken";

const withAuth = (req, res, cb) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json("Not logged in!");
  jwt.verify(token, "secretkey", (err, user) => {
    if (err) return res.status(403).json("Invalid token!");
    cb(user.id);
  });
};


const AUDIENCE_VALUES = new Set([
  "public",
  "friends",
  "friends_except",
  "specific_friends",
  "only_me",
  "custom",
]);
const DISCOVER_VALUES = new Set(["everyone", "friends", "no_one"]);

const KEY_VALIDATORS = {
  defaultAudience: AUDIENCE_VALUES,
  discoverByName: DISCOVER_VALUES,
  emailVisibility: AUDIENCE_VALUES,
  birthdayVisibility: AUDIENCE_VALUES,
  marriedVisibility: AUDIENCE_VALUES,
  cityVisibility: AUDIENCE_VALUES,
  friendsListVisibility: AUDIENCE_VALUES,
  followingVisibility: AUDIENCE_VALUES,
  profileFindVisibility: AUDIENCE_VALUES,
};
const ALLOWED_KEYS = new Set(Object.keys(KEY_VALIDATORS));

export const getSettings = (req, res) => {
  withAuth(req, res, (uid) => {
    const q = `
      SELECT userId, defaultAudience, discoverByName, emailVisibility, birthdayVisibility,
              cityVisibility,marriedVisibility, friendsListVisibility, followingVisibility,profileFindVisibility
      FROM user_settings
      WHERE userId = ?
    `;
    db.query(q, [uid], (err, rows) => {
      if (err) {
        console.error("getSettings DB error:", err);
        return res.status(500).json({ error: "DB error" });
      }
      const data =
        rows[0] || {
          userId: uid,
          defaultAudience: "friends",
          discoverByName: "everyone",
          emailVisibility: "only_me",
          birthdayVisibility: "only_me",
          marriedVisibility: "only_me",
          cityVisibility: "only_me",
          friendsListVisibility: "friends",
          followingVisibility: "friends",
          profileFindVisibility: "friends",
        };
      res.status(200).json(data);
    });
  });
};

export const updateSetting = (req, res) => {
  withAuth(req, res, (uid) => {
    const { settingKey, settingValue } = req.body || {};
    if (!ALLOWED_KEYS.has(settingKey)) {
      return res.status(400).json({ error: "Unknown settingKey", settingKey });
    }
    const allowed = KEY_VALIDATORS[settingKey];
    if (!allowed.has(settingValue)) {
      return res.status(400).json({ error: "Invalid value", settingKey, settingValue });
    }

    const q = `
      INSERT INTO user_settings (userId, ${settingKey})
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE ${settingKey} = VALUES(${settingKey})
    `;
    db.query(q, [uid, settingValue], (err) => {
      if (err) {
        console.error("updateSetting DB error:", err);
        return res.status(500).json({ error: "DB error" });
      }
      res.status(200).json({ userId: uid, [settingKey]: settingValue });
    });
  });
};
