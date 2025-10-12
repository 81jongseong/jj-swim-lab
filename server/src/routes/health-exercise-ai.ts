/**
 * 🏥 JJ Swim Lab - 건강정보 기반 운동량 조정 API
 * 
 * 📋 **기능**
 * - 개인 건강정보를 기반으로 한 맞춤형 운동량 계산 API
 * - 건강 상태별 위험도 평가 및 운동 강도 조정 API
 * - 실시간 건강 모니터링 및 운동량 자동 조절 API
 * - 건강정보 가중치를 활용한 개인화된 운동 추천 API
 * 
 * 🔒 **인증 필요**: 예
 * 👤 **접근 권한**: 모든 사용자 (개인 건강정보는 본인만 접근)
 */

import express from 'express';
import { auth as authMiddleware } from '../middleware/auth';
import { HealthBasedExerciseAI } from '../utils/HealthBasedExerciseAI';
import { HealthData } from '../models/HealthData';
import { User } from '../models/User';

const router = express.Router();

/**
 * POST /api/health-exercise-ai/calculate
 * 건강정보 기반 운동량 계산
 */
router.post('/calculate', authMiddleware, async (req, res) => {
  try {
    const { userId, currentFitnessLevel, exerciseGoals, medicalConditions, currentExerciseCapacity } = req.body;
    
    // 권한 확인 - 본인 또는 관리자만 접근 가능
    if (req.user._id.toString() !== userId && !['superAdmin', 'centerAdmin', 'instructor'].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }
    
    // 사용자 건강정보 조회
    const healthData = await HealthData.findOne({ userId }).lean();
    if (!healthData) {
      return res.status(404).json({
        success: false,
        message: '건강정보를 찾을 수 없습니다.'
      });
    }
    
    // AI 분석 수행
    const result = await HealthBasedExerciseAI.calculateHealthBasedExercise({
      userId,
      healthData,
      currentFitnessLevel: currentFitnessLevel || 'beginner',
      exerciseGoals: exerciseGoals || [],
      medicalConditions: medicalConditions || [],
      currentExerciseCapacity
    });
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || '운동량 계산 중 오류가 발생했습니다.'
      });
    }
    
    // 결과 반환
    res.json({
      success: true,
      data: result.data,
      message: '건강정보 기반 운동량 계산이 완료되었습니다.'
    });
    
  } catch (error) {
    console.error('건강정보 기반 운동량 계산 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/health-exercise-ai/adjust-realtime
 * 실시간 운동량 조정
 */
router.post('/adjust-realtime', authMiddleware, async (req, res) => {
  try {
    const { userId, currentHeartRate, currentIntensity, exerciseRecommendation } = req.body;
    
    // 권한 확인
    if (req.user._id.toString() !== userId && !['superAdmin', 'centerAdmin', 'instructor'].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }
    
    // 필수 파라미터 확인
    if (!currentHeartRate || !currentIntensity || !exerciseRecommendation) {
      return res.status(400).json({
        success: false,
        message: '필수 파라미터가 누락되었습니다.'
      });
    }
    
    // 실시간 조정 수행
    const adjustment = await HealthBasedExerciseAI.adjustExerciseInRealTime(
      userId,
      currentHeartRate,
      currentIntensity,
      exerciseRecommendation
    );
    
    res.json({
      success: true,
      data: adjustment,
      message: '실시간 운동량 조정이 완료되었습니다.'
    });
    
  } catch (error) {
    console.error('실시간 운동량 조정 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/health-exercise-ai/user/:userId
 * 사용자별 건강기반 운동 추천 조회
 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 권한 확인
    if (req.user._id.toString() !== userId && !['superAdmin', 'centerAdmin', 'instructor'].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }
    
    // 사용자 정보 조회
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }
    
    // 건강정보 조회
    const healthData = await HealthData.findOne({ userId }).lean();
    if (!healthData) {
      return res.status(404).json({
        success: false,
        message: '건강정보를 찾을 수 없습니다.'
      });
    }
    
    // 기본 설정으로 운동량 계산
    const result = await HealthBasedExerciseAI.calculateHealthBasedExercise({
      userId,
      healthData,
      currentFitnessLevel: (user as any).fitnessLevel || 'beginner',
      exerciseGoals: (user as any).exerciseGoals || [],
      medicalConditions: (healthData as any).medicalConditions || [],
      currentExerciseCapacity: (user as any).currentExerciseCapacity
    });
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message || '운동 추천 조회 중 오류가 발생했습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          age: (healthData as any).age,
          fitnessLevel: (user as any).fitnessLevel || 'beginner'
        },
        recommendation: result.data
      },
      message: '건강기반 운동 추천을 조회했습니다.'
    });
    
  } catch (error) {
    console.error('건강기반 운동 추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/health-exercise-ai/health-weights/:userId
 * 사용자별 건강정보 가중치 조회
 */
router.get('/health-weights/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 권한 확인
    if (req.user._id.toString() !== userId && !['superAdmin', 'centerAdmin', 'instructor'].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }
    
    // 건강정보 조회
    const healthData = await HealthData.findOne({ userId }).lean();
    if (!healthData) {
      return res.status(404).json({
        success: false,
        message: '건강정보를 찾을 수 없습니다.'
      });
    }
    
    // 가중치 계산 (private 메서드를 public으로 노출하기 위한 임시 방법)
    const result = await HealthBasedExerciseAI.calculateHealthBasedExercise({
      userId,
      healthData,
      currentFitnessLevel: 'intermediate',
      exerciseGoals: [],
      medicalConditions: [],
    });
    
    if (!result.success || !result.data) {
      return res.status(500).json({
        success: false,
        message: '건강정보 가중치 계산 중 오류가 발생했습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        healthWeights: result.data.healthWeights,
        adjustmentFactors: result.data.adjustmentFactors,
        riskAssessment: result.data.riskAssessment
      },
      message: '건강정보 가중치를 조회했습니다.'
    });
    
  } catch (error) {
    console.error('건강정보 가중치 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
});

export default router;

