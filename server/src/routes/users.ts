import express from 'express';
import { User } from '../models/User';

const router = express.Router();

// 전체 사용자 조회
router.get('/', async (_req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: '사용자 목록을 불러오는 데 실패했습니다.' });
  }
});

// 사용자 추가
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  try {
    const newUser = new User({ name, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: '사용자 추가에 실패했습니다.', detail: err });
  }
});

export default router;
