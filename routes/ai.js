import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai"; // 

dotenv.config();

const router = express.Router();


const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generate-post", async (req, res) => {
  const { prompt } = req.body;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt || "Suggest a fun social media post");
    const response = await result.response;
    const text = await response.text();

    res.status(200).json({ text });
  } catch (err) {
    console.error("Gemini AI error:", err.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to generate AI content" });
  }
});

export default router;
