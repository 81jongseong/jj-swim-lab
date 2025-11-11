/**
 * 🏃‍♂️ JJ Swim Lab - 운동 처방 API 라우트
 * 
 * 📋 **API 개요**
 * - 개인별 맞춤 운동 처방 생성/조회/수정
 * - 운동 이력 기록 및 성과 분석
 * - 강사/센터 관리자용 처방 조정
 * - 일반회원용 자동 조정 시스템
 * 
 * 🔗 **연동 모델**
 * - ExercisePrescription: 운동 처방 데이터
 * - User: 사용자 정보
 * - HealthData: 건강 정보
 * - Center: 센터 정보
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-22: 운동 처방 API 구현
 */

import express from 'express';
import mongoose from 'mongoose';
import { ExercisePrescription } from '../models/ExercisePrescription';
import { User } from '../models/User';
import { HealthData } from '../models/HealthData';
import { ExercisePrescriptionSystem } from '../utils/ExercisePrescriptionSystem';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * 개인별 운동 처방 생성
 * POST /api/exercise-prescription/create
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { userId, centerId, instructorId, creationReason } = req.body;
    const currentUser = req.user;
    
    console.log(`🏃‍♂️ 운동 처방 생성 요청: 사용자 ${userId}, 센터 ${centerId}`);
    
    // 권한 확인
    if (currentUser.userType === 'member' && currentUser._id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: '본인의 운동 처방만 생성할 수 있습니다.' 
      });
    }
    
    if (currentUser.userType === 'instructor' && !instructorId) {
      return res.status(400).json({ 
        success: false, 
        message: '강사 처방 시 instructorId가 필요합니다.' 
      });
    }
    
    // 사용자 정보 조회
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '사용자를 찾을 수 없습니다.' 
      });
    }
    
    // 건강 정보 조회
    const healthData = await HealthData.findOne({ userId }).sort({ createdAt: -1 });
    if (!healthData) {
      return res.status(404).json({ 
        success: false, 
        message: '건강 정보가 없어 운동 처방을 생성할 수 없습니다.' 
      });
    }
    
    // 기존 운동 처방 확인
    const existingPrescription = await ExercisePrescription.findOne({ 
      userId, 
      'status.isActive': true 
    });
    
    if (existingPrescription) {
      return res.status(400).json({ 
        success: false, 
        message: '이미 활성화된 운동 처방이 있습니다. 기존 처방을 수정하거나 비활성화 후 새로 생성해주세요.' 
      });
    }
    
    // 건강 상태 등급 분류
    const healthGrade = ExercisePrescriptionSystem.classifyHealthGrade(healthData, user);
    
    // 운동 처방 생성
    const prescription = ExercisePrescriptionSystem.generateExercisePrescription(
      healthGrade,
      healthData,
      user
    );
    
    // 다음 검토 날짜 계산 (1주일 후)
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + 7);
    
    // 데이터베이스에 저장
    const newPrescription = new ExercisePrescription({
      userId,
      centerId: centerId || null,
      instructorId: instructorId || null,
      healthGrade,
      currentPrescription: prescription,
      prescriptionInfo: {
        createdBy: currentUser.userType === 'member' ? 'user' : 
                   currentUser.userType === 'instructor' ? 'instructor' :
                   currentUser.userType === 'center_admin' ? 'center_admin' : 'system',
        createdByUserId: currentUser._id,
        creationReason: creationReason || '시스템 자동 생성',
        baseHealthData: healthData,
        algorithmVersion: '1.0'
      },
      adjustmentHistory: [],
      exerciseHistory: [],
      status: {
        isActive: true,
        lastUpdated: new Date(),
        nextReviewDate,
        totalSessions: 0,
        averageCompletionRate: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    });
    
    await newPrescription.save();
    
    console.log(`✅ 운동 처방 생성 완료: 등급 ${healthGrade.overallGrade}, 강도 ${prescription.targetHeartRate.optimal}bpm`);
    
    res.json({
      success: true,
      data: {
        prescriptionId: newPrescription._id,
        healthGrade,
        prescription,
        nextReviewDate
      },
      message: '운동 처방이 성공적으로 생성되었습니다.'
    });
    
  } catch (error) {
    console.error('❌ 운동 처방 생성 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '운동 처방 생성 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * 개인별 운동 처방 조회
 * GET /api/exercise-prescription/:userId
 */
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;
    
    // 권한 확인
    if (currentUser.userType === 'member' && currentUser._id !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: '본인의 운동 처방만 조회할 수 있습니다.' 
      });
    }
    
    const prescription = await ExercisePrescription.findOne({ 
      userId, 
      'status.isActive': true 
    }).populate('user', 'name email').populate('center', 'name').populate('instructor', 'name');
    
    if (!prescription) {
      return res.status(404).json({ 
        success: false, 
        message: '활성화된 운동 처방이 없습니다.' 
      });
    }
    
    res.json({
      success: true,
      data: prescription,
      message: '운동 처방을 성공적으로 조회했습니다.'
    });
    
  } catch (error) {
    console.error('❌ 운동 처방 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '운동 처방 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * 운동 이력 기록
 * POST /api/exercise-prescription/:prescriptionId/session
 */
router.post('/:prescriptionId/session', authMiddleware, async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { 
      actualPerformance, 
      feedback, 
      instructorNotes 
    } = req.body;
    const currentUser = req.user;
    
    console.log(`📝 운동 이력 기록: 처방 ${prescriptionId}`);
    
    const prescription = await ExercisePrescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ 
        success: false, 
        message: '운동 처방을 찾을 수 없습니다.' 
      });
    }
    
    // 권한 확인
    if (currentUser.userType === 'member' && prescription.userId.toString() !== currentUser._id) {
      return res.status(403).json({ 
        success: false, 
        message: '본인의 운동 이력만 기록할 수 있습니다.' 
      });
    }
    
    // 세션 ID 생성
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 운동 이력 추가
    const exerciseSession = {
      sessionId,
      userId: prescription.userId,
      date: new Date(),
      prescribedExercise: prescription.currentPrescription,
      actualPerformance: {
        duration: actualPerformance.duration || 0,
        distance: actualPerformance.distance || 0,
        averageHeartRate: actualPerformance.averageHeartRate || 0,
        maxHeartRate: actualPerformance.maxHeartRate || 0,
        perceivedExertion: actualPerformance.perceivedExertion || 5,
        completionRate: actualPerformance.completionRate || 0
      },
      feedback: {
        difficulty: feedback.difficulty || 'appropriate',
        fatigue: feedback.fatigue || 'moderate',
        enjoyment: feedback.enjoyment || 'moderate',
        instructorNotes: instructorNotes || ''
      },
      nextAdjustment: {
        intensityChange: 0,
        durationChange: 0,
        reason: '처음 기록'
      }
    };
    
    prescription.exerciseHistory.push(exerciseSession);
    
    // 통계 업데이트
    prescription.status.totalSessions += 1;
    prescription.status.currentStreak += 1;
    prescription.status.longestStreak = Math.max(
      prescription.status.longestStreak, 
      prescription.status.currentStreak
    );
    
    // 평균 완주율 계산
    const totalCompletionRate = prescription.exerciseHistory.reduce(
      (sum, session) => sum + session.actualPerformance.completionRate, 0
    );
    prescription.status.averageCompletionRate = totalCompletionRate / prescription.exerciseHistory.length;
    
    await prescription.save();
    
    // 동적 조정 계산
    const adjustment = ExercisePrescriptionSystem.calculateHistoryBasedAdjustment(
      prescription.exerciseHistory as any[]
    );
    
    console.log(`✅ 운동 이력 기록 완료: 완주율 ${actualPerformance.completionRate}%, 조정 ${adjustment.adjustmentType}`);
    
    res.json({
      success: true,
      data: {
        sessionId,
        adjustment,
        updatedStats: {
          totalSessions: prescription.status.totalSessions,
          averageCompletionRate: prescription.status.averageCompletionRate,
          currentStreak: prescription.status.currentStreak
        }
      },
      message: '운동 이력이 성공적으로 기록되었습니다.'
    });
    
  } catch (error) {
    console.error('❌ 운동 이력 기록 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '운동 이력 기록 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * 운동 처방 동적 조정
 * PUT /api/exercise-prescription/:prescriptionId/adjust
 */
router.put('/:prescriptionId/adjust', authMiddleware, async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const { 
      adjustmentType, 
      adjustmentAmount, 
      reason, 
      manualAdjustment 
    } = req.body;
    const currentUser = req.user;
    
    console.log(`🔄 운동 처방 조정: 처방 ${prescriptionId}, 타입 ${adjustmentType}`);
    
    const prescription = await ExercisePrescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ 
        success: false, 
        message: '운동 처방을 찾을 수 없습니다.' 
      });
    }
    
    // 권한 확인
    if (currentUser.userType === 'member' && prescription.userId.toString() !== currentUser._id) {
      return res.status(403).json({ 
        success: false, 
        message: '본인의 운동 처방만 조정할 수 있습니다.' 
      });
    }
    
    // 이전 처방 백업
    const previousPrescription = { ...prescription.currentPrescription };
    
    // 조정 적용
    const newPrescription = { ...prescription.currentPrescription };
    
    if (manualAdjustment) {
      // 수동 조정
      if (manualAdjustment.sessionDuration) {
        newPrescription.sessionDuration = manualAdjustment.sessionDuration;
      }
      if (manualAdjustment.totalDistance) {
        newPrescription.totalDistance = manualAdjustment.totalDistance;
      }
      if (manualAdjustment.weeklyFrequency) {
        newPrescription.weeklyFrequency = manualAdjustment.weeklyFrequency;
      }
    } else {
      // 자동 조정
      const adjustmentFactor = 1 + (adjustmentAmount / 100);
      
      if (adjustmentType === 'increase') {
        newPrescription.sessionDuration = Math.round(newPrescription.sessionDuration * adjustmentFactor);
        newPrescription.totalDistance = Math.round(newPrescription.totalDistance * adjustmentFactor);
      } else if (adjustmentType === 'decrease') {
        newPrescription.sessionDuration = Math.round(newPrescription.sessionDuration / adjustmentFactor);
        newPrescription.totalDistance = Math.round(newPrescription.totalDistance / adjustmentFactor);
      }
    }
    
    // 조정 이력 추가
    const adjustmentRecord = {
      adjustmentId: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      type: adjustmentType,
      amount: adjustmentAmount,
      reason: Array.isArray(reason) ? reason : [reason],
      confidence: manualAdjustment ? 1.0 : 0.8,
      adjustedBy: (currentUser.userType === 'member' ? 'user' : 
                  currentUser.userType === 'instructor' ? 'instructor' :
                  currentUser.userType === 'center_admin' ? 'center_admin' : 'system') as 'user' | 'instructor' | 'center_admin' | 'system',
      adjustedByUserId: new mongoose.Types.ObjectId(currentUser._id),
      previousPrescription,
      newPrescription
    };
    
    prescription.currentPrescription = newPrescription;
    prescription.adjustmentHistory.push(adjustmentRecord);
    prescription.status.lastUpdated = new Date();
    
    await prescription.save();
    
    console.log(`✅ 운동 처방 조정 완료: ${adjustmentType} ${adjustmentAmount}%`);
    
    res.json({
      success: true,
      data: {
        adjustmentRecord,
        newPrescription
      },
      message: '운동 처방이 성공적으로 조정되었습니다.'
    });
    
  } catch (error) {
    console.error('❌ 운동 처방 조정 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '운동 처방 조정 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * 센터별 운동 처방 목록 조회 (강사/센터 관리자용)
 * GET /api/exercise-prescription/center/:centerId
 */
router.get('/center/:centerId', authMiddleware, async (req, res) => {
  try {
    const { centerId } = req.params;
    const { page = 1, limit = 10, status = 'active' } = req.query;
    const currentUser = req.user;
    
    // 권한 확인
    if (currentUser.userType === 'member') {
      return res.status(403).json({ 
        success: false, 
        message: '센터별 운동 처방 조회 권한이 없습니다.' 
      });
    }
    
    const query: any = { centerId };
    if (status === 'active') {
      query['status.isActive'] = true;
    }
    
    const prescriptions = await ExercisePrescription.find(query)
      .populate('user', 'name email phone')
      .populate('instructor', 'name')
      .sort({ 'status.lastUpdated': -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await ExercisePrescription.countDocuments(query);
    
    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          current: page,
          pages: Math.ceil(total / Number(limit)),
          total
        }
      },
      message: '센터별 운동 처방을 성공적으로 조회했습니다.'
    });
    
  } catch (error) {
    console.error('❌ 센터별 운동 처방 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '센터별 운동 처방 조회 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * 운동 처방 통계 조회
 * GET /api/exercise-prescription/:prescriptionId/stats
 */
router.get('/:prescriptionId/stats', authMiddleware, async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const currentUser = req.user;
    
    const prescription = await ExercisePrescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ 
        success: false, 
        message: '운동 처방을 찾을 수 없습니다.' 
      });
    }
    
    // 권한 확인
    if (currentUser.userType === 'member' && prescription.userId.toString() !== currentUser._id) {
      return res.status(403).json({ 
        success: false, 
        message: '본인의 운동 처방 통계만 조회할 수 있습니다.' 
      });
    }
    
    // 통계 계산
    const stats = {
      totalSessions: prescription.status.totalSessions,
      averageCompletionRate: prescription.status.averageCompletionRate,
      currentStreak: prescription.status.currentStreak,
      longestStreak: prescription.status.longestStreak,
      totalAdjustments: prescription.adjustmentHistory.length,
      recentPerformance: prescription.exerciseHistory.slice(-5).map(session => ({
        date: session.date,
        completionRate: session.actualPerformance.completionRate,
        difficulty: session.feedback.difficulty,
        fatigue: session.feedback.fatigue
      })),
      healthGrade: prescription.healthGrade,
      currentPrescription: prescription.currentPrescription
    };
    
    res.json({
      success: true,
      data: stats,
      message: '운동 처방 통계를 성공적으로 조회했습니다.'
    });
    
  } catch (error) {
    console.error('❌ 운동 처방 통계 조회 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '운동 처방 통계 조회 중 오류가 발생했습니다.' 
    });
  }
});

export default router;
