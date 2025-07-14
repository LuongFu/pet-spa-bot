import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.VITE_API_KEY);

app.post("/chat", async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = await model.startChat({ history: [] });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const text = await response.text();

    res.json({ text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
