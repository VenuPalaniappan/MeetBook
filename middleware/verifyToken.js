import dotenv from "dotenv";
dotenv.config(); // 

import jwt from "jsonwebtoken";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not authenticated");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid");
    req.user = userInfo;
    next();
  });
};

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Explain how AI works in a few words");
    const response = await result.response;
    const text = await response.text();
    console.log(text); // 👈 AI output here
  } catch (error) {
    console.error("Gemini AI Error:", error.message);
  }
}

main();