import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { verifyToken } from "../middleware/auth";

const router = Router();

// 회원가입
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "이메일 또는 비밀번호가 누락되었습니다." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: "회원가입 성공", userId: newUser._id });
  } catch (error) {
    return res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 로그인
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "해당 이메일의 사용자가 없습니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "1h",
    });

    return res.status(200).json({ message: "로그인 성공", token });
  } catch (error) {
    return res.status(500).json({ message: "서버 오류 발생" });
  }
});

// 인증된 사용자 확인용 라우트
router.get("/profile", verifyToken, async (req: Request, res: Response) => {
  const user = (req as any).user; // verifyToken에서 추가됨
  return res.status(200).json({
    message: "인증된 사용자입니다.",
    userId: user.userId,
  });
});

export default router;
