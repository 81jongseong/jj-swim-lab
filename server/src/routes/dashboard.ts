import express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { User } from '../models/User';

// AuthRequest 타입을 import
interface AuthRequest extends express.Request {
  user?: any;
}

const router: express.Router = express.Router();

// 대시보드 통계 (관리자용)
router.get('/admin/stats', auth, requireRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalMembers = await User.countDocuments({ userType: 'member' });
    const totalInstructors = await User.countDocuments({ userType: 'instructor' });
    const totalAdmins = await User.countDocuments({ userType: 'admin' });
    
    // 최근 가입자 (7일)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    return res.json({
      stats: {
        totalUsers,
        totalMembers,
        totalInstructors,
        totalAdmins,
        recentSignups
      }
    });
  } catch (error) {
    console.error('대시보드 통계 오류:', error);
    return res.status(500).json({ error: '통계를 불러오는 데 실패했습니다.' });
  }
});

// 회원 대시보드
router.get('/member', auth, requireRole(['member']), async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    
    // 여기에 회원별 통계 로직 추가
    return res.json({
      user,
      stats: {
        // 임시 데이터
        totalLessons: 0,
        completedLessons: 0,
        currentLevel: '초급',
        nextLesson: null
      }
    });
  } catch (error) {
    console.error('회원 대시보드 오류:', error);
    return res.status(500).json({ error: '대시보드를 불러오는 데 실패했습니다.' });
  }
});

// 강사 대시보드
router.get('/instructor', auth, requireRole(['instructor']), async (req: AuthRequest, res) => {
  try {
    const user = req.user;
    
    // 여기에 강사별 통계 로직 추가
    return res.json({
      user,
      stats: {
        // 임시 데이터
        totalStudents: 0,
        activeLessons: 0,
        completedLessons: 0,
        averageRating: 0
      }
    });
  } catch (error) {
    console.error('강사 대시보드 오류:', error);
    return res.status(500).json({ error: '대시보드를 불러오는 데 실패했습니다.' });
  }
});

export default router; 