/**
 * @file 학습 진도 API 라우트
 * @description 학생의 강습법 학습 진도를 관리하는 API
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import express, { Response } from 'express';
import mongoose from 'mongoose';
import { LearningProgress } from '../models/LearningProgress';
import { TeachingMethod } from '../models/TeachingMethod';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Course } from '../models/Course';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

// 학습 진도 조회 (학생 본인)
router.get('/', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;
    const { category, level, status } = req.query;

    const query: any = { studentId };

    // 카테고리 필터
    if (category && category !== 'all') {
      const teachingMethods = await TeachingMethod.find({ category });
      const methodIds = teachingMethods.map(m => m._id);
      query.teachingMethodId = { $in: methodIds };
    }

    // 레벨 필터
    if (level && level !== 'all') {
      const teachingMethods = await TeachingMethod.find({ level });
      const methodIds = teachingMethods.map(m => m._id);
      if (query.teachingMethodId) {
        query.teachingMethodId = { $in: query.teachingMethodId.$in.filter((id: any) => methodIds.includes(id)) };
      } else {
        query.teachingMethodId = { $in: methodIds };
      }
    }

    // 상태 필터
    if (status === 'completed') {
      query.progress = 100;
    } else if (status === 'in_progress') {
      query.progress = { $gt: 0, $lt: 100 };
    } else if (status === 'not_started') {
      query.progress = 0;
    }

    const progressData = await LearningProgress.find(query)
      .populate('teachingMethodId', 'name description category level steps tips')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    logError('❌ 학습 진도 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '학습 진도 조회 중 오류가 발생했습니다.'
    });
  }
});

// 특정 강습법 진도 조회
router.get('/:teachingMethodId', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;
    const { teachingMethodId } = req.params;

    const progress = await LearningProgress.findOne({
      studentId,
      teachingMethodId
    }).populate('teachingMethodId', 'name description category level steps tips');

    if (!progress) {
      // 진도가 없으면 새로 생성
      const teachingMethod = await TeachingMethod.findById(teachingMethodId);
      if (!teachingMethod) {
        return res.status(404).json({
          success: false,
          message: '강습법을 찾을 수 없습니다.'
        });
      }

      const newProgress = new LearningProgress({
        studentId,
        teachingMethodId,
        completedSteps: [],
        totalSteps: teachingMethod.steps.length,
        progress: 0,
        lastStudied: new Date()
      });

      await newProgress.save();
      await newProgress.populate('teachingMethodId', 'name description category level steps tips');

      return res.json({
        success: true,
        data: newProgress
      });
    }

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logError('❌ 강습법 진도 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습법 진도 조회 중 오류가 발생했습니다.'
    });
  }
});

// 학습 진도 업데이트
router.put('/:teachingMethodId', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;
    const { teachingMethodId } = req.params;
    const { completedSteps, notes, rating, studyTime } = req.body;

    const teachingMethod = await TeachingMethod.findById(teachingMethodId);
    if (!teachingMethod) {
      return res.status(404).json({
        success: false,
        message: '강습법을 찾을 수 없습니다.'
      });
    }

    let progress = await LearningProgress.findOne({
      studentId,
      teachingMethodId
    });

    if (!progress) {
      progress = new LearningProgress({
        studentId,
        teachingMethodId,
        completedSteps: completedSteps || [],
        totalSteps: teachingMethod.steps.length,
        progress: 0,
        lastStudied: new Date()
      });
    } else {
      progress.completedSteps = completedSteps || progress.completedSteps;
      progress.lastStudied = new Date();
    }

    if (notes !== undefined) progress.notes = notes;
    if (rating !== undefined) progress.rating = rating;
    if (studyTime !== undefined) progress.studyTime += studyTime;

    await progress.save();
    await progress.populate('teachingMethodId', 'name description category level steps tips');

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    logError('❌ 학습 진도 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '학습 진도 업데이트 중 오류가 발생했습니다.'
    });
  }
});

// 학습 통계 조회
router.get('/stats/overview', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;

    const stats = await LearningProgress.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $group: {
          _id: null,
          totalMethods: { $sum: 1 },
          completedMethods: { $sum: { $cond: [{ $eq: ['$progress', 100] }, 1, 0] } },
          inProgressMethods: { $sum: { $cond: [{ $and: [{ $gt: ['$progress', 0] }, { $lt: ['$progress', 100] }] }, 1, 0] } },
          averageProgress: { $avg: '$progress' },
          totalStudyTime: { $sum: '$studyTime' }
        }
      }
    ]);

    const result = stats[0] || {
      totalMethods: 0,
      completedMethods: 0,
      inProgressMethods: 0,
      averageProgress: 0,
      totalStudyTime: 0
    };

    // 학습 연속일 계산
    const recentProgress = await LearningProgress.find({
      studentId,
      lastStudied: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }).sort({ lastStudied: -1 });

    let studyStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const hasStudyOnDate = recentProgress.some(p => {
        const studyDate = new Date(p.lastStudied);
        studyDate.setHours(0, 0, 0, 0);
        return studyDate.getTime() === checkDate.getTime();
      });

      if (hasStudyOnDate) {
        studyStreak++;
      } else {
        break;
      }
    }

    res.json({
      success: true,
      data: {
        ...result,
        studyStreak,
        averageProgress: Math.round(result.averageProgress * 100) / 100
      }
    });
  } catch (error) {
    logError('❌ 학습 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '학습 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

// 카테고리별 진도 조회
router.get('/stats/by-category', authMiddleware, requireRole(['student']), async (req: any, res: Response) => {
  try {
    const studentId = req.user.id;

    const categoryStats = await LearningProgress.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: 'teachingmethods',
          localField: 'teachingMethodId',
          foreignField: '_id',
          as: 'teachingMethod'
        }
      },
      { $unwind: '$teachingMethod' },
      {
        $group: {
          _id: '$teachingMethod.category',
          totalMethods: { $sum: 1 },
          completedMethods: { $sum: { $cond: [{ $eq: ['$progress', 100] }, 1, 0] } },
          averageProgress: { $avg: '$progress' },
          totalStudyTime: { $sum: '$studyTime' }
        }
      },
      { $sort: { averageProgress: -1 } }
    ]);

    res.json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    logError('❌ 카테고리별 진도 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '카테고리별 진도 조회 중 오류가 발생했습니다.'
    });
  }
});

// 강사용 학생 진도 조회
router.get('/instructor/students', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const instructorId = req.user.id;
    const { studentId, category, level } = req.query;

    // 강사가 담당하는 학생들 조회
    const instructorObjectId = mongoose.Types.ObjectId.isValid(instructorId)
      ? new mongoose.Types.ObjectId(instructorId)
      : null;

    const studentMatchConditions: any[] = [
      { 'instructorInfo.assignedInstructor': instructorId },
      { 'studentInfo.instructorId': instructorId },
      { 'studentInfo.assignedInstructor': instructorId },
      { 'studentInfo.assignedInstructors': instructorId },
      { 'studentInfo.assignedInstructors.instructor': instructorId },
      { 'studentInfo.assignedInstructors.instructorId': instructorId },
      { assignedInstructor: instructorId }
    ];

    if (instructorObjectId) {
      studentMatchConditions.push(
        { 'instructorInfo.assignedInstructor': instructorObjectId },
        { 'studentInfo.instructorId': instructorObjectId },
        { 'studentInfo.assignedInstructor': instructorObjectId },
        { 'studentInfo.assignedInstructors': instructorObjectId },
        { 'studentInfo.assignedInstructors.instructor': instructorObjectId },
        { 'studentInfo.assignedInstructors.instructorId': instructorObjectId },
        { assignedInstructor: instructorObjectId }
      );
    }

    const students = await User.find({
      userType: 'student',
      $or: studentMatchConditions
    });

    const studentDocs = [...students];

    if (instructorObjectId) {
      const additionalStudentIds = new Set<string>();

      const bookingStudentIds = await Booking.distinct('studentId', {
        instructorId: instructorObjectId
      });
      bookingStudentIds
        .filter((id: any) => id)
        .forEach((id: any) => additionalStudentIds.add(id.toString()));

      const instructorCourses = await Course.find({
        $or: [
          { instructorId: instructorObjectId },
          { instructor: instructorObjectId }
        ]
      })
        .select('enrolledStudents studentIds students')
        .lean();

      instructorCourses.forEach((course: any) => {
        const enrolled = course?.enrolledStudents || [];
        enrolled.forEach((entry: any) => {
          if (entry?.student) {
            const id = entry.student._id || entry.student;
            if (id) additionalStudentIds.add(id.toString());
          }
        });
        const studentIds = course?.studentIds || course?.students || [];
        studentIds.forEach((id: any) => {
          if (id) additionalStudentIds.add(id.toString());
        });
      });

      const existingIds = new Set(studentDocs.map((doc) => doc._id.toString()));
      const missingIds = Array.from(additionalStudentIds).filter((id) => !existingIds.has(id));

      if (missingIds.length > 0) {
        const extraStudents = await User.find({
          userType: 'student',
          _id: { $in: missingIds }
        });
        studentDocs.push(...extraStudents);
      }
    }

    if (!studentDocs || studentDocs.length === 0) {
      console.warn('⚠️ 담당 학생 없음', {
        instructorId,
        matchConditions: studentMatchConditions
      });
    }

    if (studentId) {
      // 특정 학생의 진도만 조회
      const progress = await LearningProgress.find({ studentId })
        .populate('teachingMethodId', 'name description category level steps tips')
        .populate('studentId', 'name email');

      return res.json({
        success: true,
        data: progress
      });
    }

    // 모든 학생의 진도 조회
    const studentIds = studentDocs.map(s => s._id);
    const query: any = { studentId: { $in: studentIds } };

    // 필터 적용
    if (category && category !== 'all') {
      const teachingMethods = await TeachingMethod.find({ category });
      const methodIds = teachingMethods.map(m => m._id);
      query.teachingMethodId = { $in: methodIds };
    }

    if (level && level !== 'all') {
      const teachingMethods = await TeachingMethod.find({ level });
      const methodIds = teachingMethods.map(m => m._id);
      if (query.teachingMethodId) {
        query.teachingMethodId = { $in: query.teachingMethodId.$in.filter((id: any) => methodIds.includes(id)) };
      } else {
        query.teachingMethodId = { $in: methodIds };
      }
    }

    const progressData = await LearningProgress.find(query)
      .populate('teachingMethodId', 'name description category level steps tips')
      .populate('studentId', 'name email')
      .sort({ updatedAt: -1 });

    const studentSummaries = studentDocs.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      centerId: student.centerId,
      studentInfo: student.studentInfo,
      instructorInfo: student.instructorInfo
    }));

    res.json({
      success: true,
      students: studentSummaries,
      data: progressData
    });
  } catch (error) {
    logError('❌ 강사용 학생 진도 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '학생 진도 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
