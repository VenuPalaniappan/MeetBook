import { db } from "../connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

// Replace with your actual Google Client ID
const client = new OAuth2Client("312406723411-vqjb9kr969fd4giig6dvmm8l7gfucclk.apps.googleusercontent.com");

// TEST
export const test = (req, res) => {
  res.send("Auth route is working!");
};

// REGISTER USER
export const register = (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length) return res.status(409).json("User already exists!");

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const q1 =
      "INSERT INTO users (`username`, `email`, `password`, `name`) VALUES (?)";
    const values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.name,
    ];

    db.query(q1, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("New user created successfully");
    });
  });
};

// LOGIN USER
export const login = (req, res) => {
  const q = "SELECT * FROM users WHERE username = ?";

  db.query(q, [req.body.username], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found");

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      data[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Wrong username or password");

    const token = jwt.sign({ id: data[0].id }, "secretkey");

    const { password, ...others } = data[0];
    res
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "Lax", // or "None" if using HTTPS
        secure: false,   // true if HTTPS
      })
      .status(200)
      .json(others);
  });
};

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "312406723411-vqjb9kr969fd4giig6dvmm8l7gfucclk.apps.googleusercontent.com", 
    });

    const payload = ticket.getPayload();

    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [payload.email], (err, data) => {
      if (err) return res.status(500).json(err);

      if (data.length === 0) {
        // New user: register
        const insertQ =
          "INSERT INTO users (`username`, `email`, `name`, `password`) VALUES (?)";
        const values = [
          payload.email,
          payload.email,
          payload.name,
          "",
        ];

        db.query(insertQ, [values], (err, result) => {
          if (err) return res.status(500).json(err);

          const newUserId = result.insertId;
          const token = jwt.sign({ id: newUserId }, "secretkey");

          res
            .cookie("accessToken", token, {
              httpOnly: true,
              sameSite: "Lax",
              secure: false,
            })
            .status(200)
            .json({
              id: newUserId,
              username: payload.email,
              name: payload.name,
              email: payload.email,
            });
        });
      } else {
        // Existing user
        const token = jwt.sign({ id: data[0].id }, "secretkey");
        const { password, ...others } = data[0];

        res
          .cookie("accessToken", token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: false,
          })
          .status(200)
          .json(others);
      }
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json("Invalid Google token");
  }
};

// LOGOUT USER
export const logout = (req, res) => {
  res
    .clearCookie("accessToken", {
      sameSite: "Lax", // "None" if cross-site
      secure: false,   // true if using HTTPS
    })
    .status(200)
    .json("User logged out");
};
