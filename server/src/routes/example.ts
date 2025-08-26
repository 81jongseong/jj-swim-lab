import { Router, Request, Response } from 'express';
import { auth as authenticateToken } from '../middleware/auth';
import { Class } from '../models/Class';

interface AuthRequest extends Request { user?: any }

const router: Router = Router();

// 총관리자: 반(Class) 생성 및 강사/코스/센터 배정
router.post('/classes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.userType !== 'superAdmin') {
      return res.status(403).json({ error: '총관리자 권한이 필요합니다.' });
    }
    const { name, center, instructor, course, level, maxStudents, schedule, startDate, endDate, description } = req.body;
    if (!name || !center || !instructor || !course || !level || !maxStudents || !schedule?.dayOfWeek || !schedule?.startTime || !schedule?.endTime || !startDate || !endDate) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }
    const cls = new Class({
      name,
      center,
      instructor,
      course,
      level,
      maxStudents,
      schedule,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description: description || '',
    });
    await cls.save();
    return res.status(201).json({ message: '반이 생성되었습니다.', class: cls });
  } catch (error) {
    console.error('반 생성 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 총관리자: 반에 학생 등록 (배정)
router.post('/classes/:id/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.userType !== 'superAdmin') {
      return res.status(403).json({ error: '총관리자 권한이 필요합니다.' });
    }
    const { studentId } = req.body;
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ error: '반을 찾을 수 없습니다.' });
    const exists = cls.students.some(s => s.student?.toString() === studentId);
    if (!exists) {
      cls.students.push({ student: studentId, status: 'active' as const });
      cls.currentStudents = (cls.currentStudents || 0) + 1;
      await cls.save();
    }
    return res.json({ message: '학생이 반에 등록되었습니다.', class: cls });
  } catch (error) {
    console.error('반 학생 등록 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router;






































