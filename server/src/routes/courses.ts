import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Course } from '../models/Course';
import { User } from '../models/User';

// Request 타입 확장
interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

// 인증 미들웨어
const authenticateToken = (req: AuthRequest, res: Response, next: Function) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }
};

// 강사 권한 확인
const requireInstructor = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || (user.userType !== 'instructor' && user.userType !== 'admin')) {
      return res.status(403).json({ error: '강사 권한이 필요합니다.' });
    }
    return next();
  } catch (error) {
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};

// 모든 강습 과정 조회
router.get('/', async (req: Request, res: Response) => {
  try {
    const { level, instructor, isActive } = req.query;
    const filter: any = {};
    
    if (level) filter.level = level;
    if (instructor) filter.instructor = instructor;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const courses = await Course.find(filter)
      .populate('instructor', 'name userId')
      .populate('enrolledStudents.student', 'name userId')
      .sort({ createdAt: -1 });

    return res.json({ courses });
  } catch (error) {
    console.error('강습 과정 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 특정 강습 과정 조회
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name userId experience certifications specialties')
      .populate('enrolledStudents.student', 'name userId email phone');

    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    return res.json({ course });
  } catch (error) {
    console.error('강습 과정 조회 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강습 과정 생성 (강사/관리자만)
router.post('/', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, level, duration, price, maxStudents, schedule } = req.body;

    // 필수 필드 검증
    if (!name || !description || !level || !duration || !price || !maxStudents) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    const courseData = {
      name,
      description,
      level,
      duration,
      price,
      maxStudents,
      instructor: req.user.userId,
      schedule: schedule || [],
    };

    const course = new Course(courseData);
    await course.save();

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name userId');

    return res.status(201).json({
      message: '강습 과정이 생성되었습니다.',
      course: populatedCourse
    });
  } catch (error) {
    console.error('강습 과정 생성 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강습 과정 수정 (강사/관리자만)
router.put('/:id', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 강사 본인의 과정만 수정 가능 (관리자는 모든 과정 수정 가능)
    const user = await User.findById(req.user.userId);
    if (user?.userType !== 'admin' && course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('instructor', 'name userId');

    return res.json({
      message: '강습 과정이 수정되었습니다.',
      course: updatedCourse
    });
  } catch (error) {
    console.error('강습 과정 수정 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강습 과정 삭제 (강사/관리자만)
router.delete('/:id', authenticateToken, requireInstructor, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 강사 본인의 과정만 삭제 가능 (관리자는 모든 과정 삭제 가능)
    const user = await User.findById(req.user.userId);
    if (user?.userType !== 'admin' && course.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    await Course.findByIdAndDelete(req.params.id);

    return res.json({ message: '강습 과정이 삭제되었습니다.' });
  } catch (error) {
    console.error('강습 과정 삭제 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강습 과정 등록
router.post('/:id/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    if (!course.isActive) {
      return res.status(400).json({ error: '비활성화된 강습 과정입니다.' });
    }

    // 이미 등록된 학생인지 확인
    const alreadyEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.student && enrollment.student.toString() === req.user.userId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
    }

    // 최대 학생 수 확인
    const activeStudents = course.enrolledStudents.filter(
      enrollment => enrollment.status === 'active'
    ).length;

    if (activeStudents >= course.maxStudents) {
      return res.status(400).json({ error: '강습 과정이 가득 찼습니다.' });
    }

    course.enrolledStudents.push({
      student: req.user.userId,
      status: 'active'
    });

    await course.save();

    return res.json({ message: '강습 과정에 등록되었습니다.' });
  } catch (error) {
    console.error('강습 과정 등록 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 강습 과정 취소
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    const enrollmentIndex = course.enrolledStudents.findIndex(
      enrollment => enrollment.student && enrollment.student.toString() === req.user.userId
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
    }

    course.enrolledStudents[enrollmentIndex].status = 'dropped';
    await course.save();

    return res.json({ message: '강습 과정이 취소되었습니다.' });
  } catch (error) {
    console.error('강습 과정 취소 오류:', error);
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

export default router; 