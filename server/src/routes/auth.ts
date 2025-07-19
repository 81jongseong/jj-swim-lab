import { Router } from 'express';

const router = Router();

// 예시 로그인 라우트
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  res.json({ message: `${username} 로그인 시도` });
});

export default router;
