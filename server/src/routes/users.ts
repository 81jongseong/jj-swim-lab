// src/routes/users.ts

import express from "express";
import User from "../models/User";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

// ✅ 1. 사용자 정보 조회
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 2. 사용자 정보 수정
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.body.userId !== req.params.id) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "서버 오류" });
  }
});

// ✅ 3. 사용자 삭제
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.body.userId !== req.params.id) {
      return res.status(403).json({ message: "권한이 없습니다." });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "회원 탈퇴 완료" });
  } catch (err) {
    res.status(500).json({ message: "서버 오류" });
  }
});

export default router;
