// src/routes/auth.ts
import { Router, Request, Response } from "express";
import User from "../models/User"; // 모델 가져오기
import jwt from "jsonwebtoken";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "이메일 또는 비밀번호가 없습니다." });
    }

    // 이미 존재하는 이메일인지 확인
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    // 새로운 사용자 생성
    const newUser = new User({ email, password });
    await newUser.save();

    return res.status(201).json({
      message: "회원가입 성공",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 이메일 확인
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "해당 이메일의 사용자가 없습니다." });
    }

    // 비밀번호 검증 (지금은 평문 비교, 나중에 bcrypt로 암호화 예정)
    if (user.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    // JWT 발급
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    return res.status(200).json({ message: "로그인 성공", token });
  } catch (error) {
    console.error("로그인 오류:", error);
    return res.status(500).json({ message: "서버 오류 발생" });
  }
});

export default router;
