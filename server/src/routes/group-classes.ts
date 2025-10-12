/**
 * 🏊 JJ Swim Lab - 단체반 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 단체반 CRUD 작업
 * - 학생 등록/제거/상태 관리
 * - 완료율 집계 및 조회
 * 
 * 🔄 **연동되는 데이터**
 * - GroupClass 모델
 * - User 모델 (강사, 학생)
 * - SwimProgram 모델
 * 
 * 💡 **주요 엔드포인트**
 * - POST /api/group-classes - 단체반 생성
 * - GET /api/group-classes - 단체반 목록 조회
 * - GET /api/group-classes/:id - 단체반 상세 조회
 * - PUT /api/group-classes/:id - 단체반 정보 수정
 * - DELETE /api/group-classes/:id - 단체반 삭제
 * - POST /api/group-classes/:id/students - 학생 추가
 * - DELETE /api/group-classes/:id/students/:studentId - 학생 제거
 * - PUT /api/group-classes/:id/students/:studentId/status - 학생 상태 변경
 * - GET /api/group-classes/:id/completion-rates - 단체반 완료율 조회
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-XX: 초기 라우트 구현
 */

import express from 'express';
import mongoose from 'mongoose';
import GroupClass from '../models/GroupClass';
import { User } from '../models/User';
import SwimProgram from '../models/SwimProgram';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/group-classes
 * 단체반 생성
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const currentUser = (req as any).user;
    
    // 권한 확인 (센터 관리자, 강사, 관리자만 생성 가능)
    if (!['center_admin', 'instructor', 'admin'].includes(currentUser.userType)) {
      return res.status(403).json({
        success: false,
        message: '단체반 생성 권한이 없습니다.'
      });
    }
    
    const groupClass = new GroupClass({
      ...req.body,
      createdBy: currentUser._id
    });
    
    await groupClass.save();
    
    res.status(201).json({
      success: true,
      message: '단체반이 성공적으로 생성되었습니다.',
      data: groupClass
    });
  } catch (error) {
    console.error('단체반 생성 오류:', error);
    next(error);
  }
});

/**
 * GET /api/group-classes
 * 단체반 목록 조회
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const currentUser = (req as any).user;
    const { 
      centerId, 
      instructorId, 
      status, 
      level,
      page = 1,
      limit = 10
    } = req.query;
    
    const query: any = {};
    
    // 센터 관리자는 자신의 센터만
    if (currentUser.userType === 'center_admin' && currentUser.centerId) {
      query.centerId = currentUser.centerId;
    } else if (centerId) {
      query.centerId = centerId;
    }
    
    // 강사는 자신이 담당하는 클래스만
    if (currentUser.userType === 'instructor') {
      query.instructorId = currentUser._id;
    } else if (instructorId) {
      query.instructorId = instructorId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (level) {
      query.level = level;
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const [groupClasses, total] = await Promise.all([
      GroupClass.find(query)
        .populate('centerId', 'name')
        .populate('instructorId', 'name email')
        .populate('students.userId', 'name email')
        .populate('programId', 'title')
        .sort({ 'period.startDate': -1 })
        .skip(skip)
        .limit(Number(limit)),
      GroupClass.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: {
        groupClasses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('단체반 목록 조회 오류:', error);
    next(error);
  }
});

/**
 * GET /api/group-classes/:id
 * 단체반 상세 조회
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const groupClass = await GroupClass.findById(id)
      .populate('centerId', 'name address')
      .populate('instructorId', 'name email phone')
      .populate('students.userId', 'name email phone')
      .populate('programId')
      .populate('createdBy', 'name');
    
    if (!groupClass) {
      return res.status(404).json({
        success: false,
        message: '단체반을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: groupClass
    });
  } catch (error) {
    console.error('단체반 조회 오류:', error);
    next(error);
  }
});

/**
 * PUT /api/group-classes/:id
 * 단체반 정보 수정
 */
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const groupClass = await GroupClass.findById(id);
    
    if (!groupClass) {
      return res.status(404).json({
        success: false,
        message: '단체반을 찾을 수 없습니다.'
      });
    }
    
    // 권한 확인
    if (
      currentUser.userType !== 'admin' &&
      groupClass.instructorId.toString() !== currentUser._id &&
      (currentUser.userType === 'center_admin' && groupClass.centerId.toString() !== currentUser.centerId)
    ) {
      return res.status(403).json({
        success: false,
        message: '단체반 수정 권한이 없습니다.'
      });
    }
    
    // students, createdBy 필드는 수정 불가
    delete req.body.students;
    delete req.body.createdBy;
    
    Object.assign(groupClass, req.body);
    await groupClass.save();
    
    res.json({
      success: true,
      message: '단체반 정보가 수정되었습니다.',
      data: groupClass
    });
  } catch (error) {
    console.error('단체반 수정 오류:', error);
    next(error);
  }
});

/**
 * DELETE /api/group-classes/:id
 * 단체반 삭제
 */
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUser = (req as any).user;
    
    const groupClass = await GroupClass.findById(id);
    
    if (!groupClass) {
      return res.status(404).json({
        success: false,
        message: '단체반을 찾을 수 없습니다.'
      });
    }
    
    // 권한 확인 (관리자, 센터 관리자만 삭제 가능)
    if (
      currentUser.userType !== 'admin' &&
      (currentUser.userType === 'center_admin' && groupClass.centerId.toString() !== currentUser.centerId)
    ) {
      return res.status(403).json({
        success: false,
        message: '단체반 삭제 권한이 없습니다.'
      });
    }
    
    await GroupClass.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '단체반이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('단체반 삭제 오류:', error);
    next(error);
  }
});

/**
 * POST /api/group-classes/:id/students
 * 학생 추가
 */
router.post('/:id/students', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId가 필요합니다.'
      });
    }
    
    const groupClass = await GroupClass.findById(id);
    
    if (!groupClass) {
      return res.status(404).json({
        success: false,
        message: '단체반을 찾을 수 없습니다.'
      });
    }
    
    // 학생 존재 확인
    const student = await User.findById(userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '학생을 찾을 수 없습니다.'
      });
    }
    
    await groupClass.addStudent(new mongoose.Types.ObjectId(userId));
    
    res.json({
      success: true,
      message: '학생이 추가되었습니다.',
      data: groupClass
    });
  } catch (error: any) {
    console.error('학생 추가 오류:', error);
    if (error.message === 'Class is full' || error.message === 'Student already enrolled') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

/**
 * DELETE /api/group-classes/:id/students/:studentId
 * 학생 제거
 */
router.delete('/:id/students/:studentId', authMiddleware, async (req, res, next) => {
  try {
    const { id, studentId } = req.params;
    
    const groupClass = await GroupClass.findById(id);
    
    if (!groupClass) {
      return res.status(404).json({
        success: false,
        message: '단체반을 찾을 수 없습니다.'
      });
    }
    
    await groupClass.removeStudent(new mongoose.Types.ObjectId(studentId));
    
    res.json({
      success: true,
      message: '학생이 제거되었습니다.',
      data: groupClass
    });
  } catch (error: any) {
    console.error('학생 제거 오류:', error);
    if (error.message === 'Student not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

/**
 * PUT /api/group-classes/:id/students/:studentId/status
 * 학생 상태 변경
 */
router.put('/:id/students/:studentId/status', authMiddleware, async (req, res, next) => {
  try {
    const { id, studentId } = req.params;
    const { status } = req.body;
    
    if (!['active', 'inactive', 'completed', 'dropped'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상태입니다.'
      });
    }
    
    const groupClass = await GroupClass.findById(id);
    
    if (!groupClass) {
      return res.status(404).json({
        success: false,
        message: '단체반을 찾을 수 없습니다.'
      });
    }
    
    await groupClass.updateStudentStatus(new mongoose.Types.ObjectId(studentId), status);
    
    res.json({
      success: true,
      message: '학생 상태가 변경되었습니다.',
      data: groupClass
    });
  } catch (error: any) {
    console.error('학생 상태 변경 오류:', error);
    if (error.message === 'Student not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
});

/**
 * GET /api/group-classes/:id/completion-rates
 * 단체반 완료율 조회 (학생별)
 */
router.get('/:id/completion-rates', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const groupClass = await GroupClass.findById(id)
      .populate('students.userId', 'name email')
      .populate('programId');
    
    if (!groupClass) {
      return res.status(404).json({
        success: false,
        message: '단체반을 찾을 수 없습니다.'
      });
    }
    
    // 프로그램이 연동되어 있으면 각 학생의 완료율 조회
    const completionRates = [];
    
    if (groupClass.programId) {
      for (const student of groupClass.students) {
        const program = await SwimProgram.findById(groupClass.programId)
          .where('athleteId').equals(student.userId);
        
        if (program) {
          const totalSessions = program.content.sessions.length;
          const completedSessions = program.content.sessions.filter(
            (s: any) => s.completion && s.completion.completionRate !== undefined
          ).length;
          
          const avgCompletionRate = completedSessions > 0
            ? program.content.sessions
                .filter((s: any) => s.completion && s.completion.completionRate !== undefined)
                .reduce((sum: number, s: any) => sum + s.completion.completionRate, 0) / completedSessions
            : 0;
          
          completionRates.push({
            studentId: student.userId._id,
            studentName: (student.userId as any).name,
            totalSessions,
            completedSessions,
            avgCompletionRate: Math.round(avgCompletionRate)
          });
        }
      }
    }
    
    // 단체반 전체 평균 완료율
    const overallAvgCompletionRate = completionRates.length > 0
      ? completionRates.reduce((sum, s) => sum + s.avgCompletionRate, 0) / completionRates.length
      : 0;
    
    res.json({
      success: true,
      data: {
        groupClass: {
          _id: groupClass._id,
          className: groupClass.className,
          level: groupClass.level
        },
        completionRates,
        overallAvgCompletionRate: Math.round(overallAvgCompletionRate)
      }
    });
  } catch (error) {
    console.error('완료율 조회 오류:', error);
    next(error);
  }
});

export default router;










