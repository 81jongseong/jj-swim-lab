import mongoose from "mongoose";

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ MongoDB 연결 성공");
  } catch (err) {
    console.error("❌ MongoDB 연결 실패", err);
    process.exit(1);
  }
};
