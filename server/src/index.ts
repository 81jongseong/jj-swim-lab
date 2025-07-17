// src/index.ts

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());

// 라우터
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// 루트
app.get("/", (req, res) => {
  res.send("JJ Swim Lab Server is running.");
});

// DB 연결
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("MongoDB 연결 성공");
    app.listen(PORT, () => console.log(`서버 실행 중: http://localhost:${PORT}`));
  })
  .catch((err) => console.error("MongoDB 연결 실패:", err));
