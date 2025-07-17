import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");

export const googleLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "YOUR_GOOGLE_CLIENT_ID",
    });

    const payload = ticket.getPayload();

    // Check if user exists in DB
    const q = "SELECT * FROM users WHERE email = ?";
    db.query(q, [payload.email], (err, data) => {
      if (err) return res.status(500).json(err);

      if (data.length === 0) {
        // Register new user
        const qInsert =
          "INSERT INTO users (`username`, `email`, `name`, `password`) VALUES (?)";
        const values = [
          payload.email, // username = email for simplicity
          payload.email,
          payload.name,
          "", // password is empty or random string if needed
        ];

        db.query(qInsert, [values], (err, result) => {
          if (err) return res.status(500).json(err);

          const newUserId = result.insertId;
          const token = jwt.sign({ id: newUserId }, "secretkey");

          res
            .cookie("access_token", token, { httpOnly: true })
            .status(200)
            .json({
              id: newUserId,
              username: payload.email,
              name: payload.name,
              email: payload.email,
            });
        });
      } else {
        // Existing user: login
        const token = jwt.sign({ id: data[0].id }, "secretkey");

        const { password, ...others } = data[0];
        res
          .cookie("access_token", token, { httpOnly: true })
          .status(200)
          .json(others);
      }
    });
  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(401).json("Invalid token");
  }
};
