import express from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logInfo, logError } from '../utils/logger';
import { Course } from '../models/Course';

const router: express.Router = express.Router();

// 반 목록 조회 (강사별) - Course 모델과 연동
router.get('/', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const userId = (req as any).user?._id;
    const userType = (req as any).user?.userType;
    
    if (!userId) {
      return res.status(401).json({ error: '사용자 인증이 필요합니다.' });
    }
    
    // 강사는 자신이 담당하는 코스만, 센터 관리자는 센터의 모든 코스 조회
    const query: any = { isActive: true };
    
    if (userType === 'instructor') {
      query.$or = [
        { instructor: userId },
        { instructorId: userId }
      ];
    } else if (userType === 'centerAdmin') {
      const centerId = (req as any).user?.centerAdminInfo?.managedCenters?.[0];
      if (centerId) {
        query.centerId = centerId;
      }
    }
    
    // Course 모델에서 반 목록 조회
    const courses = await Course.find(query)
      .select('name level instructor instructorId instructorName centerId maxStudents enrolledStudents schedule classInfo isPersonalLesson')
      .populate('instructor', 'name email')
      .populate('instructorId', 'name email')
      .populate('centerId', 'name')
      .sort({ createdAt: -1 });
    
    // Course 데이터를 반 형식으로 변환
    const classes = courses.map(course => {
      const currentStudents = course.enrolledStudents?.filter(
        (enrollment: any) => enrollment.status === 'enrolled' || enrollment.status === 'active'
      ).length || 0;
      
      // 일정 정보 문자열 생성
      const scheduleStr = course.schedule && course.schedule.length > 0
        ? course.schedule.map((s: any) => {
            const dayMap: { [key: string]: string } = {
              monday: '월', tuesday: '화', wednesday: '수', thursday: '목',
              friday: '금', saturday: '토', sunday: '일'
            };
            return `${dayMap[s.day] || s.day} ${s.startTime}-${s.endTime}`;
          }).join(', ')
        : '일정 없음';
      
      return {
        _id: course._id.toString(),
        name: course.name,
        level: course.level,
        type: course.isPersonalLesson ? 'individual' : 'group',
        instructor: course.instructorId?.toString() || course.instructor?.toString() || userId,
        instructorName: course.instructorName || (course.instructor as any)?.name || '',
        maxStudents: course.maxStudents,
        currentStudents: currentStudents,
        schedule: scheduleStr,
        centerId: course.centerId?.toString() || '',
        className: course.classInfo?.className || course.name,
        classType: course.classInfo?.classType || (course.isPersonalLesson ? 'private' : 'regular')
      };
    });
    
    logInfo('반 목록 조회', { userId, userType, classCount: classes.length });
    
    res.json({ 
      success: true,
      data: classes 
    });
  } catch (error) {
    logError('반 목록 조회 실패', error);
    res.status(500).json({ error: '반 목록을 불러오는데 실패했습니다.' });
  }
});

// 반 상세 정보 조회
router.get('/:classId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: express.Request, res: express.Response) => {
  try {
    const { classId } = req.params;
    
    // TODO: 실제 반 모델과 연동
    const mockClass = {
      _id: classId,
      name: '초급반 A',
      level: '초급',
      type: 'group',
      instructor: (req as any).user?._id,
      maxStudents: 8,
      currentStudents: 6,
      schedule: '월,수,금 18:00-19:00',
      centerId: 'center001',
      students: [
        { _id: 'student1', name: '김학생', email: 'kim@example.com' },
        { _id: 'student2', name: '이학생', email: 'lee@example.com' }
      ]
    };
    
    logInfo('반 상세 정보 조회', { classId });
    
    res.json({ 
      success: true,
      data: mockClass 
    });
  } catch (error) {
    logError('반 상세 정보 조회 실패', error);
    res.status(500).json({ error: '반 정보를 불러오는데 실패했습니다.' });
  }
});

export default router;
