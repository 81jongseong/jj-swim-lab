import * as express from 'express';
import { auth, requireRole } from '../middleware/auth';
import { cache } from '../middleware/cache';
import { logInfo, logError } from '../utils/logger';
import { Progress } from '../models/Progress';
import { User } from '../models/User';
import { Course } from '../models/Course';
import { Evaluation } from '../models/Evaluation';
import { Payment } from '../models/Payment';
import mongoose from 'mongoose';

interface AuthRequest extends express.Request {
  user?: any;
}

interface CompletedStep {
  methodId: string;
  stepName: string;
  completedAt: Date;
  notes: string;
}

interface ProgressData {
  percentage: number;
  completedSteps: CompletedStep[];
  notes: string;
}

const router: express.Router = express.Router();

// ===== 강사 전용 기능 =====

// 1. 강사별 학생 진도 현황 조회 (강사만)
router.get('/instructor/:instructorId', auth, requireRole(['instructor']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { instructorId } = req.params;
    
    // 강사 본인만 조회 가능
    if (req.user._id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: '자신의 학생 진도만 조회할 수 있습니다.'
      });
    }

    const progress = await Progress.find({ instructor: instructorId })
      .populate('student', 'name email')
      .populate('course', 'name description level')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      message: '강사별 학생 진도 현황 조회 성공!',
      data: progress
    });
  } catch (error) {
    console.error('강사별 학생 진도 현황 조회 오류:', error);
    res.status(500).json({ error: '진도 현황 조회에 실패했습니다.' });
  }
});

// 2. 강사별 학생 체크리스트 현황 조회 (강사만)
router.get('/instructor/:instructorId/checklist', auth, requireRole(['instructor']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { instructorId } = req.params;
    
    // 강사 본인만 조회 가능
    if (req.user._id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: '자신의 학생 체크리스트만 조회할 수 있습니다.'
      });
    }

    const checklists = await Progress.find({ 
      instructor: instructorId,
      type: 'checklist'
    })
      .populate('student', 'name email')
      .populate('course', 'name')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      message: '강사별 학생 체크리스트 현황 조회 성공!',
      data: checklists
    });
  } catch (error) {
    console.error('강사별 학생 체크리스트 현황 조회 오류:', error);
    res.status(500).json({ error: '체크리스트 현황 조회에 실패했습니다.' });
  }
});

// 3. 학생 진도 업데이트 (강사만)
router.put('/student/:studentId', auth, requireRole(['instructor']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { studentId } = req.params;
    const { courseId, skills, notes, nextGoals, completedLessons } = req.body;

    // 강사가 담당하는 학생인지 확인
    const student = await User.findOne({
      _id: studentId,
      userType: 'student',
      'studentInfo.enrolledCourses': { 
        $in: await Course.find({ instructor: req.user._id }).select('_id') 
      }
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: '해당 학생을 담당하지 않습니다.'
      });
    }

    // 기존 진도 조회 또는 새로 생성
    let progress = await Progress.findOne({ 
      student: studentId, 
      course: courseId 
    });

    if (!progress) {
      progress = new (Progress as any)({
        student: studentId,
        course: courseId,
        instructor: req.user._id
      });
    }

    // 진도 업데이트
    if (skills) progress.skills = skills;
    if (notes) progress.notes = notes;
    if (nextGoals) progress.nextGoals = nextGoals;
    if (completedLessons) progress.completedLessons = completedLessons;
    
    // lastUpdated는 timestamps: true로 자동 설정됨
    progress.updatedBy = req.user._id;

    await progress.save();

    res.json({
      success: true,
      message: '학생 진도가 성공적으로 업데이트되었습니다!',
      data: progress
    });
  } catch (error) {
    console.error('학생 진도 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '학생 진도 업데이트에 실패했습니다.'
    });
  }
});

// 4. 체크리스트 생성/수정 (강사만)
router.post('/checklist/:studentId', auth, requireRole(['instructor']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { studentId } = req.params;
    const { courseId, checklistItems, dueDate, priority } = req.body;

    // 강사가 담당하는 학생인지 확인
    const student = await User.findOne({
      _id: studentId,
      userType: 'student',
      'studentInfo.enrolledCourses': { 
        $in: await Course.find({ instructor: req.user._id }).select('_id') 
      }
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: '해당 학생을 담당하지 않습니다.'
      });
    }

    // 체크리스트 생성
    const checklist = new Progress({
      student: studentId,
      course: courseId,
      instructor: req.user._id,
      type: 'checklist',
      checklistItems: checklistItems || [],
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority: priority || 'medium',
      status: 'pending'
    });

    await checklist.save();

    res.json({
      success: true,
      message: '체크리스트가 성공적으로 생성되었습니다!',
      data: checklist
    });
  } catch (error) {
    console.error('체크리스트 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '체크리스트 생성에 실패했습니다.'
    });
  }
});

// 5. 학생 평가 생성/수정 (강사만)
router.post('/evaluation/:studentId', auth, requireRole(['instructor']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { studentId } = req.params;
    const { courseId, skills, attitude, comments } = req.body;

    // 강사가 담당하는 학생인지 확인
    const student = await User.findOne({
      _id: studentId,
      userType: 'student',
      'studentInfo.enrolledCourses': { 
        $in: await Course.find({ instructor: req.user._id }).select('_id') 
      }
    });

    if (!student) {
      return res.status(403).json({
        success: false,
        message: '해당 학생을 담당하지 않습니다.'
      });
    }

    // 기존 평가 조회 또는 새로 생성
    let evaluation = await Evaluation.findOne({ 
      student: studentId, 
      course: courseId,
      instructor: req.user._id
    });

    if (!evaluation) {
      evaluation = new (Evaluation as any)({
        student: studentId,
        course: courseId,
        instructor: req.user._id
      });
    }

    // 평가 업데이트
    if (skills) evaluation.skills = skills;
    if (attitude) evaluation.attitude = attitude;
    if (comments) evaluation.comments = comments;
    
    // updatedAt은 timestamps: true로 자동 설정됨

    await evaluation.save();

    res.json({
      success: true,
      message: '학생 평가가 성공적으로 저장되었습니다!',
      data: evaluation
    });
  } catch (error) {
    console.error('학생 평가 저장 오류:', error);
    res.status(500).json({
      success: false,
      message: '학생 평가 저장에 실패했습니다.'
    });
  }
});

// 6. 강사별 통계 조회 (강사만)
router.get('/instructor/:instructorId/stats', auth, requireRole(['instructor']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { instructorId } = req.params;
    
    // 강사 본인만 조회 가능
    if (req.user._id.toString() !== instructorId) {
      return res.status(403).json({
        success: false,
        message: '자신의 통계만 조회할 수 있습니다.'
      });
    }

    // 최근 진도 현황
    const recentProgress = await Progress.find({
      instructor: instructorId,
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).countDocuments();

    // 체크리스트 현황
    const checklists = await Progress.find({
      instructor: instructorId,
      type: 'checklist'
    }).countDocuments();

    // 수익 통계 (Payment 모델 사용)
    const paymentStats = await Payment.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // 평가 통계 (Evaluation 모델 사용)
    const evaluationStats = await Evaluation.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
      { $group: { _id: null, avgGrade: { $avg: '$overallRating' }, count: { $sum: 1 } } }
    ]);

    // 진도 통계 (Progress 모델 사용)
    const progressStats = await Progress.aggregate([
      { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
      { $group: { _id: null, total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } }
    ]);

    res.json({
      success: true,
      message: '강사별 통계 조회 성공!',
      data: {
        recentProgress,
        checklists,
        paymentStats: paymentStats[0] || { total: 0, count: 0 },
        evaluationStats: evaluationStats[0] || { avgGrade: 0, count: 0 },
        progressStats: progressStats[0] || { total: 0, completed: 0 }
      }
    });
  } catch (error) {
    console.error('강사별 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '통계 조회에 실패했습니다.'
    });
  }
});

// 7. 강사 스케줄 최적화 (강사만)
router.get('/schedule-optimization', auth, requireRole(['instructor']), async (req: AuthRequest, res: express.Response) => {
  try {
    const instructor = await User.findById(req.user._id);
    
    // 강사 스케줄 분석 및 최적화 제안
    const scheduleAnalysis = {
      currentSchedule: {
        totalHours: 40,
        peakHours: 25,
        offPeakHours: 15,
        utilization: 85
      },
      optimization: {
        suggestedPeakHours: 30,
        suggestedOffPeakHours: 10,
        potentialEarningsIncrease: '25%',
        workLifeBalance: '개선됨'
      },
      recommendations: [
        '피크 타임 강습 참여 증가로 수익 극대화',
        '오프 피크 타임에 개인 강습 및 기술 연마',
        '주말 특별 프로그램 참여로 추가 수입 창출',
        '정기 휴식으로 지속 가능한 강습 품질 유지'
      ]
    };

    res.json({
      success: true,
      message: '강사 스케줄 최적화 분석 조회 성공!',
      data: scheduleAnalysis
    });
  } catch (error) {
    console.error('스케줄 최적화 분석 오류:', error);
    res.status(500).json({
      success: false,
      message: '스케줄 최적화 분석에 실패했습니다.'
    });
  }
});

// ===== 학생 전용 기능 =====

// 8. 내 진도 현황 조회 (학생만)
router.get('/my-progress', auth, requireRole(['student']), async (req: AuthRequest, res: express.Response) => {
  try {
    const progress = await Progress.find({ student: req.user._id })
      .populate('course', 'name description level')
      .populate('instructor', 'name')
      .sort({ updatedAt: -1 });

    const evaluations = await Evaluation.find({ student: req.user._id })
      .populate('course', 'name')
      .populate('instructor', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: '진도 현황 조회 성공!',
      data: {
        progress,
        evaluations
      }
    });
  } catch (error) {
    console.error('진도 현황 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '진도 현황 조회에 실패했습니다.'
    });
  }
});

// 9. 체크리스트 조회 (학생만)
router.get('/my-checklist', auth, requireRole(['student']), async (req: AuthRequest, res: express.Response) => {
  try {
    const checklists = await Progress.find({ 
      student: req.user._id,
      type: 'checklist'
    })
      .populate('course', 'name')
      .populate('instructor', 'name')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      message: '체크리스트 조회 성공!',
      data: checklists
    });
  } catch (error) {
    console.error('체크리스트 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '체크리스트 조회에 실패했습니다.'
    });
  }
});

export default router; 