/**
 * @file 수업 계획 API 라우트
 * @description 강사가 강습법을 기반으로 수업 계획을 관리하는 API
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import express, { Response } from 'express';
import mongoose from 'mongoose';
import { LessonPlan } from '../models/LessonPlan';
import { TeachingMethod } from '../models/TeachingMethod';
import { User } from '../models/User';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

// 수업 계획 목록 조회
router.get('/', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;
    const { status, date, studentId } = req.query;

    const query: any = { instructorId };

    if (status) query.status = status;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.date = { $gte: startDate, $lt: endDate };
    }
    if (studentId) query.students = studentId;

    const lessonPlans = await LessonPlan.find(query)
      .populate('teachingMethods', 'name description category level')
      .populate('students', 'name email')
      .populate('centerId', 'name address')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      data: lessonPlans
    });
  } catch (error) {
    logError('❌ 수업 계획 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '수업 계획 목록 조회 중 오류가 발생했습니다.'
    });
  }
});

// 특정 수업 계획 조회
router.get('/:planId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;
    const { planId } = req.params;

    const lessonPlan = await LessonPlan.findOne({
      _id: planId,
      instructorId
    })
      .populate('teachingMethods', 'name description category level steps tips')
      .populate('students', 'name email')
      .populate('centerId', 'name address');

    if (!lessonPlan) {
      return res.status(404).json({
        success: false,
        message: '수업 계획을 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      data: lessonPlan
    });
  } catch (error) {
    logError('❌ 수업 계획 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '수업 계획 조회 중 오류가 발생했습니다.'
    });
  }
});

// 수업 계획 생성
router.post('/', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;
    const {
      title,
      description,
      teachingMethods,
      students,
      duration,
      date,
      time,
      location,
      objectives,
      materials,
      notes,
      centerId
    } = req.body;

    // 필수 필드 검증
    if (!title || !description || !duration || !date || !time || !location) {
      return res.status(400).json({
        success: false,
        message: '필수 정보를 모두 입력해주세요.'
      });
    }

    // 강습법 존재 확인
    if (teachingMethods && teachingMethods.length > 0) {
      const methods = await TeachingMethod.find({ _id: { $in: teachingMethods } });
      if (methods.length !== teachingMethods.length) {
        return res.status(400).json({
          success: false,
          message: '일부 강습법을 찾을 수 없습니다.'
        });
      }
    }

    // 학생 존재 확인
    if (students && students.length > 0) {
      const studentUsers = await User.find({ 
        _id: { $in: students },
        userType: 'student'
      });
      if (studentUsers.length !== students.length) {
        return res.status(400).json({
          success: false,
          message: '일부 학생을 찾을 수 없습니다.'
        });
      }
    }

    const lessonPlan = new LessonPlan({
      instructorId,
      centerId: centerId || req.user.centerId,
      title,
      description,
      teachingMethods: teachingMethods || [],
      students: students || [],
      duration,
      date: new Date(date),
      time,
      location,
      objectives: objectives || [],
      materials: materials || [],
      notes: notes || '',
      status: 'draft'
    });

    await lessonPlan.save();
    await lessonPlan.populate('teachingMethods', 'name description category level');
    await lessonPlan.populate('students', 'name email');

    res.status(201).json({
      success: true,
      data: lessonPlan,
      message: '수업 계획이 생성되었습니다.'
    });
  } catch (error) {
    logError('❌ 수업 계획 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '수업 계획 생성 중 오류가 발생했습니다.'
    });
  }
});

// 수업 계획 수정
router.put('/:planId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;
    const { planId } = req.params;
    const updateData = req.body;

    const lessonPlan = await LessonPlan.findOne({
      _id: planId,
      instructorId
    });

    if (!lessonPlan) {
      return res.status(404).json({
        success: false,
        message: '수업 계획을 찾을 수 없습니다.'
      });
    }

    // 수정 가능한 필드들만 업데이트
    const allowedFields = [
      'title', 'description', 'teachingMethods', 'students',
      'duration', 'date', 'time', 'location', 'objectives',
      'materials', 'notes', 'status'
    ];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        (lessonPlan as any)[field] = updateData[field];
      }
    }

    await lessonPlan.save();
    await lessonPlan.populate('teachingMethods', 'name description category level');
    await lessonPlan.populate('students', 'name email');

    res.json({
      success: true,
      data: lessonPlan,
      message: '수업 계획이 수정되었습니다.'
    });
  } catch (error) {
    logError('❌ 수업 계획 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '수업 계획 수정 중 오류가 발생했습니다.'
    });
  }
});

// 수업 계획 삭제
router.delete('/:planId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;
    const { planId } = req.params;

    const lessonPlan = await LessonPlan.findOne({
      _id: planId,
      instructorId
    });

    if (!lessonPlan) {
      return res.status(404).json({
        success: false,
        message: '수업 계획을 찾을 수 없습니다.'
      });
    }

    await LessonPlan.findByIdAndDelete(planId);

    res.json({
      success: true,
      message: '수업 계획이 삭제되었습니다.'
    });
  } catch (error) {
    logError('❌ 수업 계획 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '수업 계획 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 출석 체크
router.put('/:planId/attendance', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;
    const { planId } = req.params;
    const { attendance } = req.body;

    const lessonPlan = await LessonPlan.findOne({
      _id: planId,
      instructorId
    });

    if (!lessonPlan) {
      return res.status(404).json({
        success: false,
        message: '수업 계획을 찾을 수 없습니다.'
      });
    }

    lessonPlan.attendance = attendance;
    await lessonPlan.save();

    res.json({
      success: true,
      data: lessonPlan,
      message: '출석이 기록되었습니다.'
    });
  } catch (error) {
    logError('❌ 출석 체크 오류:', error);
    res.status(500).json({
      success: false,
      message: '출석 체크 중 오류가 발생했습니다.'
    });
  }
});

// 수업 피드백
router.put('/:planId/feedback', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;
    const { planId } = req.params;
    const { feedback } = req.body;

    const lessonPlan = await LessonPlan.findOne({
      _id: planId,
      instructorId
    });

    if (!lessonPlan) {
      return res.status(404).json({
        success: false,
        message: '수업 계획을 찾을 수 없습니다.'
      });
    }

    lessonPlan.feedback = feedback;
    await lessonPlan.save();

    res.json({
      success: true,
      data: lessonPlan,
      message: '피드백이 기록되었습니다.'
    });
  } catch (error) {
    logError('❌ 수업 피드백 오류:', error);
    res.status(500).json({
      success: false,
      message: '수업 피드백 중 오류가 발생했습니다.'
    });
  }
});

// 강사 통계 조회
router.get('/stats/instructor', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;

    const stats = await LessonPlan.aggregate([
      { $match: { instructorId: new mongoose.Types.ObjectId(instructorId) } },
      {
        $group: {
          _id: null,
          totalPlans: { $sum: 1 },
          completedPlans: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          scheduledPlans: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
          draftPlans: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          totalStudents: { $sum: { $size: '$students' } },
          averageRating: { $avg: '$feedback.rating' }
        }
      }
    ]);

    const result = stats[0] || {
      totalPlans: 0,
      completedPlans: 0,
      scheduledPlans: 0,
      draftPlans: 0,
      totalStudents: 0,
      averageRating: 0
    };

    // 담당 학생 수 조회
    const assignedStudents = await User.countDocuments({
      userType: 'student',
      'instructorInfo.assignedInstructor': instructorId
    });

    res.json({
      success: true,
      data: {
        ...result,
        assignedStudents,
        averageRating: Math.round(result.averageRating * 100) / 100
      }
    });
  } catch (error) {
    logError('❌ 강사 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강사 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

// 학생별 수업 계획 조회
router.get('/student/:studentId', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;
    const { studentId } = req.params;

    const lessonPlans = await LessonPlan.find({
      instructorId,
      students: studentId
    })
      .populate('teachingMethods', 'name description category level')
      .populate('students', 'name email')
      .sort({ date: 1, time: 1 });

    res.json({
      success: true,
      data: lessonPlans
    });
  } catch (error) {
    logError('❌ 학생별 수업 계획 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '학생별 수업 계획 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;