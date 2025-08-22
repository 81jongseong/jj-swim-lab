import { Router, Request, Response } from 'express';
import { Course } from '../models/Course';
import { User } from '../models/User';
import mongoose from 'mongoose';

// Request 타입 확장
interface AuthRequest extends Request {
  user?: any;
}

const router: Router = Router();

import { auth as authenticateToken } from '../middleware/auth';

// 강사 권한 확인
const requireInstructor = async (req: AuthRequest, res: Response, next: Function) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || (user.userType !== 'instructor' && user.userType !== 'superAdmin')) {
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
    const { name, description, level, duration, price, maxStudents, schedule, instructorId } = req.body;

    // 필수 필드 검증
    if (!name || !description || !level || !duration || !price || !maxStudents) {
      return res.status(400).json({ error: '필수 필드가 누락되었습니다.' });
    }

    const courseData: any = {
      name,
      description,
      level,
      duration,
      price,
      maxStudents,
      // 총관리자는 강사를 지정할 수 있게 허용
      instructor: instructorId && instructorId !== '' && (await User.findById(req.user.userId))?.userType === 'superAdmin'
        ? instructorId
        : req.user.userId,
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
    const user = await User.findById((req as any).user._id);
    if (user?.userType !== 'superAdmin' && course.instructor.toString() !== String((req as any).user._id)) {
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
    const user = await User.findById((req as any).user._id);
    if (user?.userType !== 'superAdmin' && course.instructor.toString() !== String((req as any).user._id)) {
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
      enrollment => enrollment.student && enrollment.student.toString() === String((req as any).user._id)
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
      student: (req as any).user._id,
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

// 학생 강습 과정 등록
router.post('/:courseId/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 이미 등록되어 있는지 확인
    const existingEnrollment = course.enrolledStudents.find(
      enrollment => enrollment.student && enrollment.student.toString() === studentId.toString()
    );

    if (existingEnrollment) {
      return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
    }

    // 정원 확인
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ error: '강습 과정 정원이 가득 찼습니다.' });
    }

    // 학생 등록
    course.enrolledStudents.push({
      student: studentId,
      enrolledAt: new Date(),
      status: 'active'
    });

    await course.save();

    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(studentId, {
      $push: { 'studentInfo.enrolledCourses': courseId }
    });

    res.json({
      success: true,
      message: '강습 과정에 성공적으로 등록되었습니다.',
      data: course
    });
  } catch (error) {
    console.error('강습 과정 등록 오류:', error);
    res.status(500).json({ error: '강습 과정 등록에 실패했습니다.' });
  }
});

// 학생 강습 과정 해제
router.post('/:courseId/unenroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 등록 상태 확인
    const enrollmentIndex = course.enrolledStudents.findIndex(
      enrollment => enrollment.student && enrollment.student.toString() === studentId.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
    }

    // 학생 제거
    course.enrolledStudents.splice(enrollmentIndex, 1);
    await course.save();

    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(studentId, {
      $pull: { 'studentInfo.enrolledCourses': courseId }
    });

    res.json({
      success: true,
      message: '강습 과정에서 성공적으로 해제되었습니다.',
      data: course
    });
  } catch (error) {
    console.error('강습 과정 해제 오류:', error);
    res.status(500).json({ error: '강습 과정 해제에 실패했습니다.' });
  }
});

// 학생별 강습 과정 진도율 업데이트
router.put('/:courseId/progress/:studentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, studentId } = req.params;
    const { progress, completedSteps, notes } = req.body;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 학생 등록 상태 확인
    const enrollment = course.enrolledStudents.find(
      e => e.student && e.student.toString() === studentId
    );

    if (!enrollment) {
      return res.status(400).json({ error: '등록되지 않은 학생입니다.' });
    }

    // 진도율 정보 추가
    if (!enrollment.progress) {
      enrollment.progress = {
        percentage: 0,
        completedSteps: [] as any,
        lastUpdated: new Date(),
        notes: ''
      };
    }

    enrollment.progress.percentage = progress || enrollment.progress.percentage || 0;
    enrollment.progress.completedSteps = completedSteps || enrollment.progress.completedSteps || [];
    enrollment.progress.lastUpdated = new Date();
    enrollment.progress.notes = notes || enrollment.progress.notes || '';

    await course.save();

    res.json({
      success: true,
      message: '진도율이 성공적으로 업데이트되었습니다.',
      data: enrollment.progress
    });
  } catch (error) {
    console.error('진도율 업데이트 오류:', error);
    res.status(500).json({ error: '진도율 업데이트에 실패했습니다.' });
  }
});

// 학생별 강습 과정 상세 정보 조회
router.get('/:courseId/student/:studentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, studentId } = req.params;

    // 강습 과정과 학생 정보 함께 조회
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email')
      .populate('enrolledStudents.student', 'name email studentInfo');

    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 해당 학생 정보 찾기
    const studentEnrollment = course.enrolledStudents.find(
      e => e.student && e.student._id.toString() === studentId
    );

    if (!studentEnrollment || !studentEnrollment.student) {
      return res.status(404).json({ error: '등록되지 않은 학생입니다.' });
    }

    res.json({
      success: true,
      message: '학생 정보 조회 성공',
      data: {
        course: {
          _id: course._id,
          name: course.name,
          level: course.level,
          instructor: course.instructor
        },
        student: studentEnrollment.student,
        enrollment: {
          enrolledAt: studentEnrollment.enrolledAt,
          status: studentEnrollment.status,
          progress: studentEnrollment.progress || {}
        }
      }
    });
  } catch (error) {
    console.error('학생 정보 조회 오류:', error);
    res.status(500).json({ error: '학생 정보 조회에 실패했습니다.' });
  }
});

// 강사별 담당 학생 목록 조회
router.get('/instructor/:instructorId/students', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user._id !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정 조회
    const courses = await Course.find({ 
      instructor: instructorId,
      isActive: true 
    }).populate('enrolledStudents.student', 'name email studentInfo');

    // 학생별 정보 정리
    const studentMap = new Map();
    
    courses.forEach(course => {
      course.enrolledStudents.forEach(enrollment => {
        if (enrollment.student && enrollment.status === 'active') {
          const student = enrollment.student as any; // populate 후 타입 캐스팅
          const studentId = student._id.toString();
          
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              _id: student._id,
              name: student.name,
              email: student.email,
              swimmingLevel: student.studentInfo?.swimmingLevel || 'beginner',
              courses: [],
              totalProgress: 0,
              averageProgress: 0
            });
          }
          
          const studentInfo = studentMap.get(studentId);
          const progress = enrollment.progress?.percentage || 0;
          
          studentInfo.courses.push({
            courseId: course._id,
            courseName: course.name,
            level: course.level,
            enrolledAt: enrollment.enrolledAt,
            progress: progress,
            status: enrollment.status
          });
          
          studentInfo.totalProgress += progress;
        }
      });
    });

    // 평균 진도율 계산
    const students = Array.from(studentMap.values()).map(student => ({
      ...student,
      averageProgress: student.courses.length > 0 ? Math.round(student.totalProgress / student.courses.length) : 0
    }));

    // 진도율 기준으로 정렬
    students.sort((a, b) => b.averageProgress - a.averageProgress);

    res.json({
      success: true,
      message: '강사별 담당 학생 목록 조회 성공',
      data: {
        instructorId,
        totalStudents: students.length,
        students
      }
    });
  } catch (error) {
    console.error('강사별 학생 목록 조회 오류:', error);
    res.status(500).json({ error: '학생 목록 조회에 실패했습니다.' });
  }
});

// 강사별 강습 과정 통계
router.get('/instructor/:instructorId/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user._id !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정 통계
    const stats = await Course.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId), isActive: true } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: { $size: '$enrolledStudents' } },
          activeStudents: {
            $sum: {
              $size: {
                $filter: {
                  input: '$enrolledStudents',
                  cond: { $eq: ['$$this.status', 'active'] }
                }
              }
            }
          },
          averageProgress: {
            $avg: {
              $avg: '$enrolledStudents.progress.percentage'
            }
          }
        }
      }
    ]);

    // 강습 과정별 상세 통계
    const courseStats = await Course.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId), isActive: true } },
      {
        $project: {
          name: 1,
          level: 1,
          enrolledCount: { $size: '$enrolledStudents' },
          averageProgress: { $avg: '$enrolledStudents.progress.percentage' },
          completionRate: {
            $divide: [
              { $size: { $filter: { input: '$enrolledStudents', cond: { $eq: ['$$this.status', 'completed'] } } } },
              { $size: '$enrolledStudents' }
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      message: '강사별 통계 조회 성공',
      data: {
        instructorId,
        overview: stats[0] || {
          totalCourses: 0,
          totalStudents: 0,
          activeStudents: 0,
          averageProgress: 0
        },
        courseStats
      }
    });
  } catch (error) {
    console.error('강사별 통계 조회 오류:', error);
    res.status(500).json({ error: '통계 조회에 실패했습니다.' });
  }
});

// 강사가 관리하는 반 목록 가져오기
router.get('/instructor/:instructorId/classes', async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    const classes = await Course.find({ 
      instructor: instructorId
      // isActive 필드 체크 제거 - 모든 과정 반환
    })
    .populate('instructor', 'name userId')
    .populate('enrolledStudents.student', 'name userId email')
    .populate('teachingMethods.methodId')
    .sort({ 'classInfo.startDate': 1 });
    
    res.json({
      success: true,
      data: {
        classes: classes.map(course => ({
          _id: course._id,
          name: course.name, // 기존 name 필드 사용
          level: course.level,
          classInfo: course.classInfo,
          instructor: course.instructor,
          enrolledStudents: course.enrolledStudents,
          teachingMethods: course.teachingMethods,
          schedule: course.schedule,
          isActive: course.isActive !== false // isActive가 false가 아니면 true로 처리
        }))
      }
    });
  } catch (error) {
    console.error('강사 반 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '강사 반 목록 조회에 실패했습니다.' });
  }
});

// 특정 반의 회원 진도 관리
router.get('/class/:classId/students/progress', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const course = await Course.findById(classId)
      .populate('enrolledStudents.student', 'name userId email')
      .populate('teachingMethods.methodId')
      .populate('enrolledStudents.progress.completedSteps.methodId');
    
    if (!course) {
      return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
    }
    
    // 각 회원의 체크리스트 진행 상황 계산
    const studentsProgress = course.enrolledStudents.map(enrollment => {
      const student = enrollment.student as any;
      // progress는 항상 존재함 (모델에서 default 설정)
      const progress = enrollment.progress || {
        percentage: 0,
        completedSteps: [],
        lastUpdated: new Date(),
        notes: ''
      };
      
      // 전체 체크리스트 단계 수 계산
      const totalSteps = course.teachingMethods.reduce((total, tm) => {
        const method = tm.methodId as any;
        return total + (method?.steps?.length || 0);
      }, 0);
      
      // 완료된 단계 수 계산
      const completedSteps = (progress.completedSteps as any[]).length;
      
      // 진행률 계산
      const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      return {
        student: {
          _id: student._id,
          name: student.name || student.userId,
          userId: student.userId,
          email: student.email
        },
        enrollment: {
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
          progress: {
            ...progress,
            percentage,
            totalSteps,
            completedSteps: completedSteps
          }
        },
        teachingMethods: course.teachingMethods.map(tm => {
          const method = tm.methodId as any;
          const methodCompletedSteps = (progress.completedSteps as any[]).filter(
            (step: any) => step.methodId?.toString() === method._id.toString()
          );
          
          return {
            _id: method._id,
            name: method.name,
            description: method.description,
            steps: method.steps || [],
            tips: method.tips || [],
            order: tm.order,
            isRequired: tm.isRequired,
            progress: {
              totalSteps: method.steps?.length || 0,
              completedSteps: methodCompletedSteps.length,
              percentage: method.steps?.length > 0 
                ? Math.round((methodCompletedSteps.length / method.steps.length) * 100) 
                : 0
            }
          };
        })
      };
    });
    
    res.json({
      success: true,
      data: {
        classInfo: {
          _id: course._id,
          name: course.name,
          level: course.level,
          classInfo: course.classInfo
        },
        studentsProgress
      }
    });
  } catch (error) {
    console.error('반 회원 진도 조회 실패:', error);
    res.status(500).json({ success: false, message: '반 회원 진도 조회에 실패했습니다.' });
  }
});

// 회원 체크리스트 단계 완료 처리
router.post('/class/:classId/student/:studentId/complete-step', async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const { methodId, stepName, notes } = req.body;
    
    const course = await Course.findById(classId);
    if (!course) {
      return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
    }
    
    // 해당 회원의 등록 정보 찾기
    const enrollment = course.enrolledStudents.find(
      e => e.student && e.student.toString() === studentId
    );
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: '해당 회원이 이 반에 등록되어 있지 않습니다.' });
    }
    
    // progress는 항상 존재함 (모델에서 default 설정)
    const progress = enrollment.progress;
    
    // 이미 완료된 단계인지 확인
    const existingStep = (progress.completedSteps as any[]).find(
      step => step.methodId && step.methodId.toString() === methodId && step.stepName === stepName
    );
    
    if (existingStep) {
      return res.status(400).json({ success: false, message: '이미 완료된 단계입니다.' });
    }
    
    // 새로운 완료 단계 추가
    (progress.completedSteps as any[]).push({
      methodId,
      stepName,
      completedAt: new Date(),
      notes: notes || ''
    });
    
    // 진행률 업데이트
    const totalSteps = course.teachingMethods.reduce((total, tm) => {
      return total + (tm.methodId.toString() === methodId ? 1 : 0);
    }, 0);
    
    progress.percentage = Math.round(
      ((progress.completedSteps as any[]).length / totalSteps) * 100
    );
    progress.lastUpdated = new Date();
    
    await course.save();
    
    res.json({
      success: true,
      message: '체크리스트 단계가 완료되었습니다.',
      data: {
        completedSteps: progress.completedSteps,
        percentage: progress.percentage
      }
    });
  } catch (error) {
    console.error('체크리스트 단계 완료 처리 실패:', error);
    res.status(500).json({ success: false, message: '체크리스트 단계 완료 처리에 실패했습니다.' });
  }
});

// 학생 강습 과정 등록
router.post('/:courseId/enroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 이미 등록되어 있는지 확인
    const existingEnrollment = course.enrolledStudents.find(
      enrollment => enrollment.student && enrollment.student.toString() === studentId.toString()
    );

    if (existingEnrollment) {
      return res.status(400).json({ error: '이미 등록된 강습 과정입니다.' });
    }

    // 정원 확인
    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ error: '강습 과정 정원이 가득 찼습니다.' });
    }

    // 학생 등록
    course.enrolledStudents.push({
      student: studentId,
      enrolledAt: new Date(),
      status: 'active'
    });

    await course.save();

    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(studentId, {
      $push: { 'studentInfo.enrolledCourses': courseId }
    });

    res.json({
      success: true,
      message: '강습 과정에 성공적으로 등록되었습니다.',
      data: course
    });
  } catch (error) {
    console.error('강습 과정 등록 오류:', error);
    res.status(500).json({ error: '강습 과정 등록에 실패했습니다.' });
  }
});

// 학생 강습 과정 해제
router.post('/:courseId/unenroll', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 등록 상태 확인
    const enrollmentIndex = course.enrolledStudents.findIndex(
      enrollment => enrollment.student && enrollment.student.toString() === studentId.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ error: '등록되지 않은 강습 과정입니다.' });
    }

    // 학생 제거
    course.enrolledStudents.splice(enrollmentIndex, 1);
    await course.save();

    // 사용자 정보 업데이트
    await User.findByIdAndUpdate(studentId, {
      $pull: { 'studentInfo.enrolledCourses': courseId }
    });

    res.json({
      success: true,
      message: '강습 과정에서 성공적으로 해제되었습니다.',
      data: course
    });
  } catch (error) {
    console.error('강습 과정 해제 오류:', error);
    res.status(500).json({ error: '강습 과정 해제에 실패했습니다.' });
  }
});

// 학생별 강습 과정 진도율 업데이트
router.put('/:courseId/progress/:studentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, studentId } = req.params;
    const { progress, completedSteps, notes } = req.body;

    // 강습 과정 확인
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 학생 등록 상태 확인
    const enrollment = course.enrolledStudents.find(
      e => e.student && e.student.toString() === studentId
    );

    if (!enrollment) {
      return res.status(400).json({ error: '등록되지 않은 학생입니다.' });
    }

    // 진도율 정보 추가
    if (!enrollment.progress) {
      enrollment.progress = {
        percentage: 0,
        completedSteps: [] as any,
        lastUpdated: new Date(),
        notes: ''
      };
    }

    enrollment.progress.percentage = progress || enrollment.progress.percentage || 0;
    enrollment.progress.completedSteps = completedSteps || enrollment.progress.completedSteps || [];
    enrollment.progress.lastUpdated = new Date();
    enrollment.progress.notes = notes || enrollment.progress.notes || '';

    await course.save();

    res.json({
      success: true,
      message: '진도율이 성공적으로 업데이트되었습니다.',
      data: enrollment.progress
    });
  } catch (error) {
    console.error('진도율 업데이트 오류:', error);
    res.status(500).json({ error: '진도율 업데이트에 실패했습니다.' });
  }
});

// 학생별 강습 과정 상세 정보 조회
router.get('/:courseId/student/:studentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, studentId } = req.params;

    // 강습 과정과 학생 정보 함께 조회
    const course = await Course.findById(courseId)
      .populate('instructor', 'name email')
      .populate('enrolledStudents.student', 'name email studentInfo');

    if (!course) {
      return res.status(404).json({ error: '강습 과정을 찾을 수 없습니다.' });
    }

    // 해당 학생 정보 찾기
    const studentEnrollment = course.enrolledStudents.find(
      e => e.student && e.student._id.toString() === studentId
    );

    if (!studentEnrollment || !studentEnrollment.student) {
      return res.status(404).json({ error: '등록되지 않은 학생입니다.' });
    }

    res.json({
      success: true,
      message: '학생 정보 조회 성공',
      data: {
        course: {
          _id: course._id,
          name: course.name,
          level: course.level,
          instructor: course.instructor
        },
        student: studentEnrollment.student,
        enrollment: {
          enrolledAt: studentEnrollment.enrolledAt,
          status: studentEnrollment.status,
          progress: studentEnrollment.progress || {}
        }
      }
    });
  } catch (error) {
    console.error('학생 정보 조회 오류:', error);
    res.status(500).json({ error: '학생 정보 조회에 실패했습니다.' });
  }
});

// 강사별 담당 학생 목록 조회
router.get('/instructor/:instructorId/students', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user._id !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정 조회
    const courses = await Course.find({ 
      instructor: instructorId,
      isActive: true 
    }).populate('enrolledStudents.student', 'name email studentInfo');

    // 학생별 정보 정리
    const studentMap = new Map();
    
    courses.forEach(course => {
      course.enrolledStudents.forEach(enrollment => {
        if (enrollment.student && enrollment.status === 'active') {
          const student = enrollment.student as any; // populate 후 타입 캐스팅
          const studentId = student._id.toString();
          
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              _id: student._id,
              name: student.name,
              email: student.email,
              swimmingLevel: student.studentInfo?.swimmingLevel || 'beginner',
              courses: [],
              totalProgress: 0,
              averageProgress: 0
            });
          }
          
          const studentInfo = studentMap.get(studentId);
          const progress = enrollment.progress?.percentage || 0;
          
          studentInfo.courses.push({
            courseId: course._id,
            courseName: course.name,
            level: course.level,
            enrolledAt: enrollment.enrolledAt,
            progress: progress,
            status: enrollment.status
          });
          
          studentInfo.totalProgress += progress;
        }
      });
    });

    // 평균 진도율 계산
    const students = Array.from(studentMap.values()).map(student => ({
      ...student,
      averageProgress: student.courses.length > 0 ? Math.round(student.totalProgress / student.courses.length) : 0
    }));

    // 진도율 기준으로 정렬
    students.sort((a, b) => b.averageProgress - a.averageProgress);

    res.json({
      success: true,
      message: '강사별 담당 학생 목록 조회 성공',
      data: {
        instructorId,
        totalStudents: students.length,
        students
      }
    });
  } catch (error) {
    console.error('강사별 학생 목록 조회 오류:', error);
    res.status(500).json({ error: '학생 목록 조회에 실패했습니다.' });
  }
});

// 강사별 강습 과정 통계
router.get('/instructor/:instructorId/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { instructorId } = req.params;
    
    // 권한 확인: 본인이거나 관리자
    if (req.user._id !== instructorId && 
        req.user.userType !== 'centerAdmin' && 
        req.user.userType !== 'superAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 강사가 담당하는 강습 과정 통계
    const stats = await Course.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId), isActive: true } },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: { $size: '$enrolledStudents' } },
          activeStudents: {
            $sum: {
              $size: {
                $filter: {
                  input: '$enrolledStudents',
                  cond: { $eq: ['$$this.status', 'active'] }
                }
              }
            }
          },
          averageProgress: {
            $avg: {
              $avg: '$enrolledStudents.progress.percentage'
            }
          }
        }
      }
    ]);

    // 강습 과정별 상세 통계
    const courseStats = await Course.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId), isActive: true } },
      {
        $project: {
          name: 1,
          level: 1,
          enrolledCount: { $size: '$enrolledStudents' },
          averageProgress: { $avg: '$enrolledStudents.progress.percentage' },
          completionRate: {
            $divide: [
              { $size: { $filter: { input: '$enrolledStudents', cond: { $eq: ['$$this.status', 'completed'] } } } },
              { $size: '$enrolledStudents' }
            ]
          }
        }
      }
    ]);

    res.json({
      success: true,
      message: '강사별 통계 조회 성공',
      data: {
        instructorId,
        overview: stats[0] || {
          totalCourses: 0,
          totalStudents: 0,
          activeStudents: 0,
          averageProgress: 0
        },
        courseStats
      }
    });
  } catch (error) {
    console.error('강사별 통계 조회 오류:', error);
    res.status(500).json({ error: '통계 조회에 실패했습니다.' });
  }
});

// 강사가 관리하는 반 목록 가져오기
router.get('/instructor/:instructorId/classes', async (req, res) => {
  try {
    const { instructorId } = req.params;
    
    const classes = await Course.find({ 
      instructor: instructorId
      // isActive 필드 체크 제거 - 모든 과정 반환
    })
    .populate('instructor', 'name userId')
    .populate('enrolledStudents.student', 'name userId email')
    .populate('teachingMethods.methodId')
    .sort({ 'classInfo.startDate': 1 });
    
    res.json({
      success: true,
      data: {
        classes: classes.map(course => ({
          _id: course._id,
          name: course.name, // 기존 name 필드 사용
          level: course.level,
          classInfo: course.classInfo,
          instructor: course.instructor,
          enrolledStudents: course.enrolledStudents,
          teachingMethods: course.teachingMethods,
          schedule: course.schedule,
          isActive: course.isActive !== false // isActive가 false가 아니면 true로 처리
        }))
      }
    });
  } catch (error) {
    console.error('강사 반 목록 조회 실패:', error);
    res.status(500).json({ success: false, message: '강사 반 목록 조회에 실패했습니다.' });
  }
});

// 특정 반의 회원 진도 관리
router.get('/class/:classId/students/progress', async (req, res) => {
  try {
    const { classId } = req.params;
    
    const course = await Course.findById(classId)
      .populate('enrolledStudents.student', 'name userId email')
      .populate('teachingMethods.methodId')
      .populate('enrolledStudents.progress.completedSteps.methodId');
    
    if (!course) {
      return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
    }
    
    // 각 회원의 체크리스트 진행 상황 계산
    const studentsProgress = course.enrolledStudents.map(enrollment => {
      const student = enrollment.student as any;
      // progress는 항상 존재함 (모델에서 default 설정)
      const progress = enrollment.progress || {
        percentage: 0,
        completedSteps: [],
        lastUpdated: new Date(),
        notes: ''
      };
      
      // 전체 체크리스트 단계 수 계산
      const totalSteps = course.teachingMethods.reduce((total, tm) => {
        const method = tm.methodId as any;
        return total + (method?.steps?.length || 0);
      }, 0);
      
      // 완료된 단계 수 계산
      const completedSteps = (progress.completedSteps as any[]).length;
      
      // 진행률 계산
      const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      return {
        student: {
          _id: student._id,
          name: student.name || student.userId,
          userId: student.userId,
          email: student.email
        },
        enrollment: {
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
          progress: {
            ...progress,
            percentage,
            totalSteps,
            completedSteps: completedSteps
          }
        },
        teachingMethods: course.teachingMethods.map(tm => {
          const method = tm.methodId as any;
          const methodCompletedSteps = (progress.completedSteps as any[]).filter(
            (step: any) => step.methodId?.toString() === method._id.toString()
          );
          
          return {
            _id: method._id,
            name: method.name,
            description: method.description,
            steps: method.steps || [],
            tips: method.tips || [],
            order: tm.order,
            isRequired: tm.isRequired,
            progress: {
              totalSteps: method.steps?.length || 0,
              completedSteps: methodCompletedSteps.length,
              percentage: method.steps?.length > 0 
                ? Math.round((methodCompletedSteps.length / method.steps.length) * 100) 
                : 0
            }
          };
        })
      };
    });
    
    res.json({
      success: true,
      data: {
        classInfo: {
          _id: course._id,
          name: course.name,
          level: course.level,
          classInfo: course.classInfo
        },
        studentsProgress
      }
    });
  } catch (error) {
    console.error('반 회원 진도 조회 실패:', error);
    res.status(500).json({ success: false, message: '반 회원 진도 조회에 실패했습니다.' });
  }
});

// 회원 체크리스트 단계 완료 처리
router.post('/class/:classId/student/:studentId/complete-step', async (req, res) => {
  try {
    const { classId, studentId } = req.params;
    const { methodId, stepName, notes } = req.body;
    
    const course = await Course.findById(classId);
    if (!course) {
      return res.status(404).json({ success: false, message: '반을 찾을 수 없습니다.' });
    }
    
    // 해당 회원의 등록 정보 찾기
    const enrollment = course.enrolledStudents.find(
      e => e.student && e.student.toString() === studentId
    );
    
    if (!enrollment) {
      return res.status(404).json({ success: false, message: '해당 회원이 이 반에 등록되어 있지 않습니다.' });
    }
    
    // progress는 항상 존재함 (모델에서 default 설정)
    const progress = enrollment.progress;
    
    // 이미 완료된 단계인지 확인
    const existingStep = (progress.completedSteps as any[]).find(
      step => step.methodId && step.methodId.toString() === methodId && step.stepName === stepName
    );
    
    if (existingStep) {
      return res.status(400).json({ success: false, message: '이미 완료된 단계입니다.' });
    }
    
    // 새로운 완료 단계 추가
    (progress.completedSteps as any[]).push({
      methodId,
      stepName,
      completedAt: new Date(),
      notes: notes || ''
    });
    
    // 진행률 업데이트
    const totalSteps = course.teachingMethods.reduce((total, tm) => {
      return total + (tm.methodId.toString() === methodId ? 1 : 0);
    }, 0);
    
    progress.percentage = Math.round(
      ((progress.completedSteps as any[]).length / totalSteps) * 100
    );
    progress.lastUpdated = new Date();
    
    await course.save();
    
    res.json({
      success: true,
      message: '체크리스트 단계가 완료되었습니다.',
      data: {
        completedSteps: progress.completedSteps,
        percentage: progress.percentage
      }
    });
  } catch (error) {
    console.error('체크리스트 단계 완료 처리 실패:', error);
    res.status(500).json({ success: false, message: '체크리스트 단계 완료 처리에 실패했습니다.' });
  }
});

export default router; 