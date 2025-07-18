// src/index.ts
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth";

dotenv.config();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes); // ← 경로 바인딩 확인!!

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI || "")
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ 서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB 연결 실패:", err);
  });
