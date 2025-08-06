import { Router, Request, Response } from 'express';
import { Progress } from '../models/Progress';
import { Class } from '../models/Class';
import { SkillTemplate } from '../models/SkillTemplate';
import { Evaluation } from '../models/Evaluation';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// 강사: 학생 진도 조회
router.get('/student/:studentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { instructorId } = req.user as any;
    
    const progress = await Progress.find({
      student: studentId,
      instructor: instructorId,
      isActive: true
    })
    .populate('course', 'name level')
    .populate('class', 'name')
    .populate('center', 'name')
    .sort({ evaluationDate: -1 });
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('진도 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '진도 정보를 불러오는데 실패했습니다.'
    });
  }
});

// 강사: 학생 진도 업데이트
router.post('/student/:studentId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const { instructorId } = req.user as any;
    const { courseId, classId, centerId, skills, overallProgress, instructorComments, nextGoals } = req.body;
    
    const progress = new Progress({
      student: studentId,
      instructor: instructorId,
      course: courseId,
      class: classId,
      center: centerId,
      evaluationDate: new Date(),
      skills,
      overallProgress,
      instructorComments,
      nextGoals
    });
    
    await progress.save();
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('진도 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      error: '진도 업데이트에 실패했습니다.'
    });
  }
});

// 회원: 내 진도 조회
router.get('/my-progress', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user as any;
    
    const progress = await Progress.find({
      student: userId,
      isActive: true
    })
    .populate('instructor', 'name')
    .populate('course', 'name level')
    .populate('class', 'name')
    .populate('center', 'name')
    .sort({ evaluationDate: -1 });
    
    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('내 진도 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '진도 정보를 불러오는데 실패했습니다.'
    });
  }
});

// 강사: 반별 학생 목록 조회
router.get('/class/:classId/students', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const { userId } = req.user as any;
    
    const classInfo = await Class.findById(classId)
      .populate('students.student', 'name email phone')
      .populate('course', 'name level');
    
    if (!classInfo || classInfo.instructor.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: '접근 권한이 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: classInfo
    });
  } catch (error) {
    console.error('반 학생 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '학생 목록을 불러오는데 실패했습니다.'
    });
  }
});

// 강사: 스킬 템플릿 조회
router.get('/skill-templates', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { category, level } = req.query;
    
    let query: any = { isActive: true };
    if (category) query.category = category;
    if (level) query.level = level;
    
    const templates = await SkillTemplate.find(query)
      .populate('prerequisites', 'name description');
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('스킬 템플릿 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '스킬 템플릿을 불러오는데 실패했습니다.'
    });
  }
});

// 회원: 강습 평가 제출
router.post('/evaluation', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user as any;
    const { courseId, classId, courseEndDate, ratings, comments, isAnonymous } = req.body;
    
    // 평가 제출 기간 체크
    const endDate = new Date(courseEndDate);
    const evaluationDeadline = new Date(endDate.getTime() + (10 * 24 * 60 * 60 * 1000));
    const now = new Date();
    
    if (now > evaluationDeadline) {
      return res.status(400).json({
        success: false,
        error: '평가 제출 기간이 종료되었습니다. (강습 종료 후 10일)'
      });
    }
    
    // 기존 평가 확인
    const existingEvaluation = await Evaluation.findOne({
      student: userId,
      course: courseId,
      class: classId
    });
    
    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        error: '이미 평가를 제출했습니다.'
      });
    }
    
    const evaluation = new Evaluation({
      student: userId,
      course: courseId,
      class: classId,
      courseEndDate: endDate,
      ratings,
      comments,
      isAnonymous,
      isSubmitted: true
    });
    
    await evaluation.save();
    
    res.json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('평가 제출 오류:', error);
    res.status(500).json({
      success: false,
      error: '평가 제출에 실패했습니다.'
    });
  }
});

// 회원: 평가 가능한 강습 목록 조회
router.get('/evaluations/available', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user as any;
    
    // 평가 기간 내의 완료된 강습 조회
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));
    
    const availableEvaluations = await Evaluation.find({
      student: userId,
      courseEndDate: { $gte: tenDaysAgo },
      isSubmitted: false
    })
    .populate('course', 'name level')
    .populate('class', 'name')
    .populate('instructor', 'name');
    
    res.json({
      success: true,
      data: availableEvaluations
    });
  } catch (error) {
    console.error('평가 가능 강습 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '평가 가능한 강습을 불러오는데 실패했습니다.'
    });
  }
});

export default router; 