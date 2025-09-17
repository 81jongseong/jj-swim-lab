/**
 * AI 기반 부상 위험 예측 API 라우트
 */

import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { AIInjuryPredictionService, IInjuryAssessmentRequest } from '../services/aiInjuryPredictionService';
import { InjuryPrediction } from '../models/InjuryPrediction';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * POST /api/ai-injury-prediction/assess
 * AI 기반 부상 위험 예측 수행
 */
router.post('/assess', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ error: '인증이 필요합니다.' });
    }

    const {
      userProfile,
      trainingData,
      biomechanicalData,
      recoveryData,
      environmentalFactors
    } = req.body;

    // 입력값 검증
    if (!userProfile || !trainingData || !biomechanicalData || !recoveryData) {
      return res.status(400).json({ 
        error: '필수 정보가 누락되었습니다.',
        required: ['userProfile', 'trainingData', 'biomechanicalData', 'recoveryData']
      });
    }

    // 부상 위험 평가 요청 객체 생성
    const assessmentRequest: IInjuryAssessmentRequest = {
      userId: new mongoose.Types.ObjectId(userId),
      userProfile: {
        age: parseInt(userProfile.age) || 25,
        weight: parseFloat(userProfile.weight) || 70,
        height: parseFloat(userProfile.height) || 170,
        experience: parseInt(userProfile.experience) || 0,
        currentLevel: userProfile.currentLevel || 'beginner',
        medicalHistory: userProfile.medicalHistory || [],
        previousInjuries: userProfile.previousInjuries || []
      },
      trainingData: trainingData.map((data: any) => ({
        date: new Date(data.date),
        duration: parseInt(data.duration) || 60,
        intensity: parseInt(data.intensity) || 5,
        volume: parseInt(data.volume) || 1000,
        perceivedExertion: parseInt(data.perceivedExertion) || 5,
        heartRateAvg: data.heartRateAvg ? parseInt(data.heartRateAvg) : undefined,
        heartRateMax: data.heartRateMax ? parseInt(data.heartRateMax) : undefined,
        strokeCount: data.strokeCount ? parseInt(data.strokeCount) : undefined,
        restTime: data.restTime ? parseInt(data.restTime) : undefined
      })),
      biomechanicalData: biomechanicalData.map((data: any) => ({
        date: new Date(data.date),
        strokeEfficiency: parseInt(data.strokeEfficiency) || 5,
        bodyPosition: parseInt(data.bodyPosition) || 5,
        breathingPattern: parseInt(data.breathingPattern) || 5,
        strokeRate: parseInt(data.strokeRate) || 30,
        strokeLength: parseFloat(data.strokeLength) || 2.0,
        symmetry: parseInt(data.symmetry) || 5,
        flexibility: parseInt(data.flexibility) || 5,
        strength: parseInt(data.strength) || 5
      })),
      recoveryData: recoveryData.map((data: any) => ({
        date: new Date(data.date),
        sleepHours: parseFloat(data.sleepHours) || 8,
        sleepQuality: parseInt(data.sleepQuality) || 7,
        stressLevel: parseInt(data.stressLevel) || 5,
        fatigue: parseInt(data.fatigue) || 5,
        soreness: parseInt(data.soreness) || 3,
        nutrition: parseInt(data.nutrition) || 7,
        hydration: parseInt(data.hydration) || 7,
        restDaysTaken: parseInt(data.restDaysTaken) || 1
      })),
      environmentalFactors: environmentalFactors || {
        poolConditions: {
          temperature: 26,
          chlorineLevel: 2,
          crowdedness: 5
        },
        equipmentCondition: 8,
        coachingQuality: 8,
        trainingEnvironment: 8
      }
    };

    // AI 부상 위험 예측 수행
    const prediction = await AIInjuryPredictionService.predictInjuryRisk(assessmentRequest);

    res.status(201).json({
      message: 'AI 부상 위험 예측이 성공적으로 완료되었습니다.',
      data: prediction
    });

  } catch (error) {
    console.error('AI 부상 위험 예측 오류:', error);
    res.status(500).json({ 
      error: 'AI 부상 위험 예측에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-injury-prediction/user/:userId
 * 사용자별 부상 위험 예측 목록 조회
 */
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestUserId = req.user?._id;

    // 본인 또는 관리자만 조회 가능
    if (userId !== requestUserId && req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    const predictions = await AIInjuryPredictionService.getUserPredictions(
      new mongoose.Types.ObjectId(userId)
    );

    res.json({
      message: '부상 위험 예측 목록을 성공적으로 조회했습니다.',
      data: predictions
    });

  } catch (error) {
    console.error('부상 위험 예측 조회 오류:', error);
    res.status(500).json({ 
      error: '부상 위험 예측 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-injury-prediction/:predictionId
 * 특정 부상 위험 예측 상세 조회
 */
router.get('/:predictionId', authMiddleware, async (req, res) => {
  try {
    const { predictionId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(predictionId)) {
      return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
    }

    const prediction = await InjuryPrediction.findById(predictionId)
      .populate('userId', 'name email');

    if (!prediction) {
      return res.status(404).json({ error: '부상 위험 예측을 찾을 수 없습니다.' });
    }

    // 본인 또는 관리자만 조회 가능
    if (prediction.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    res.json({
      message: '부상 위험 예측을 성공적으로 조회했습니다.',
      data: prediction
    });

  } catch (error) {
    console.error('부상 위험 예측 상세 조회 오류:', error);
    res.status(500).json({ 
      error: '부상 위험 예측 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * PUT /api/ai-injury-prediction/:predictionId/acknowledge-alert
 * 알림 확인 처리
 */
router.put('/:predictionId/acknowledge-alert', authMiddleware, async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { alertIndex } = req.body;

    if (!mongoose.Types.ObjectId.isValid(predictionId)) {
      return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
    }

    const prediction = await InjuryPrediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ error: '부상 위험 예측을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (prediction.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 알림 확인 처리
    if (alertIndex !== undefined && alertIndex >= 0 && alertIndex < prediction.monitoring.alertsGenerated.length) {
      prediction.monitoring.alertsGenerated[alertIndex].acknowledged = true;
    } else {
      // 모든 알림 확인
      prediction.monitoring.alertsGenerated.forEach(alert => {
        alert.acknowledged = true;
      });
    }

    await prediction.save();

    res.json({
      message: '알림이 성공적으로 확인 처리되었습니다.',
      data: prediction
    });

  } catch (error) {
    console.error('알림 확인 처리 오류:', error);
    res.status(500).json({ 
      error: '알림 확인 처리에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * POST /api/ai-injury-prediction/:predictionId/add-alert
 * 수동 알림 추가 (관리자/강사용)
 */
router.post('/:predictionId/add-alert', authMiddleware, async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { level, message } = req.body;

    // 관리자 또는 강사만 가능
    if (req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin' && 
        req.user?.userType !== 'instructor') {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    if (!mongoose.Types.ObjectId.isValid(predictionId)) {
      return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
    }

    if (!level || !message) {
      return res.status(400).json({ 
        error: '필수 정보가 누락되었습니다.',
        required: ['level', 'message']
      });
    }

    const prediction = await InjuryPrediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ error: '부상 위험 예측을 찾을 수 없습니다.' });
    }

    // 알림 추가
    (prediction as any).generateAlert(level, message);
    await prediction.save();

    res.json({
      message: '알림이 성공적으로 추가되었습니다.',
      data: prediction
    });

  } catch (error) {
    console.error('알림 추가 오류:', error);
    res.status(500).json({ 
      error: '알림 추가에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-injury-prediction/high-risk/users
 * 고위험 사용자 목록 조회 (관리자용)
 */
router.get('/high-risk/users', authMiddleware, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }

    const highRiskUsers = await AIInjuryPredictionService.getHighRiskUsers();

    res.json({
      message: '고위험 사용자 목록을 성공적으로 조회했습니다.',
      data: highRiskUsers
    });

  } catch (error) {
    console.error('고위험 사용자 조회 오류:', error);
    res.status(500).json({ 
      error: '고위험 사용자 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-injury-prediction/statistics/overview
 * 부상 위험 통계 조회 (관리자용)
 */
router.get('/statistics/overview', authMiddleware, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user?.userType !== 'superAdmin' && req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '관리자 권한이 필요합니다.' });
    }

    const statistics = await AIInjuryPredictionService.getInjuryStatistics();

    // 추가 통계 계산
    const totalPredictions = await InjuryPrediction.countDocuments({ isActive: true });
    const recentPredictions = await InjuryPrediction.countDocuments({
      isActive: true,
      assessmentDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const followUpRequired = await InjuryPrediction.countDocuments({
      isActive: true,
      'monitoring.followUpRequired': true
    });

    res.json({
      message: '부상 위험 통계를 성공적으로 조회했습니다.',
      data: {
        overview: {
          totalPredictions,
          recentPredictions,
          followUpRequired
        },
        riskLevelDistribution: statistics
      }
    });

  } catch (error) {
    console.error('부상 위험 통계 조회 오류:', error);
    res.status(500).json({ 
      error: '부상 위험 통계 조회에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * PUT /api/ai-injury-prediction/:predictionId/update-recommendations
 * 권장사항 업데이트 (전문가용)
 */
router.put('/:predictionId/update-recommendations', authMiddleware, async (req, res) => {
  try {
    const { predictionId } = req.params;
    const { immediate, shortTerm, longTerm } = req.body;

    // 전문가 권한 확인 (관리자, 강사)
    if (req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin' && 
        req.user?.userType !== 'instructor') {
      return res.status(403).json({ error: '전문가 권한이 필요합니다.' });
    }

    if (!mongoose.Types.ObjectId.isValid(predictionId)) {
      return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
    }

    const prediction = await InjuryPrediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ error: '부상 위험 예측을 찾을 수 없습니다.' });
    }

    // 권장사항 업데이트
    (prediction as any).updateRecommendations(immediate, shortTerm, longTerm);
    await prediction.save();

    res.json({
      message: '권장사항이 성공적으로 업데이트되었습니다.',
      data: prediction
    });

  } catch (error) {
    console.error('권장사항 업데이트 오류:', error);
    res.status(500).json({ 
      error: '권장사항 업데이트에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * GET /api/ai-injury-prediction/:predictionId/needs-update
 * 예측 업데이트 필요 여부 확인
 */
router.get('/:predictionId/needs-update', authMiddleware, async (req, res) => {
  try {
    const { predictionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(predictionId)) {
      return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
    }

    const prediction = await InjuryPrediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ error: '부상 위험 예측을 찾을 수 없습니다.' });
    }

    // 권한 확인
    if (prediction.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    const needsUpdate = (prediction as any).needsUpdate();
    const daysSinceUpdate = Math.floor(
      (Date.now() - prediction.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    res.json({
      message: '업데이트 필요 여부를 성공적으로 확인했습니다.',
      data: {
        needsUpdate,
        daysSinceUpdate,
        lastUpdateDate: prediction.updatedAt,
        nextAssessmentDate: prediction.monitoring.nextAssessmentDate,
        followUpRequired: prediction.monitoring.followUpRequired,
        riskLevel: prediction.prediction.riskLevel
      }
    });

  } catch (error) {
    console.error('업데이트 필요 여부 확인 오류:', error);
    res.status(500).json({ 
      error: '업데이트 필요 여부 확인에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

/**
 * DELETE /api/ai-injury-prediction/:predictionId
 * 부상 위험 예측 삭제 (비활성화)
 */
router.delete('/:predictionId', authMiddleware, async (req, res) => {
  try {
    const { predictionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(predictionId)) {
      return res.status(400).json({ error: '유효하지 않은 예측 ID입니다.' });
    }

    const prediction = await InjuryPrediction.findById(predictionId);
    if (!prediction) {
      return res.status(404).json({ error: '부상 위험 예측을 찾을 수 없습니다.' });
    }

    // 권한 확인 (본인 또는 관리자)
    if (prediction.userId.toString() !== req.user?._id && 
        req.user?.userType !== 'superAdmin' && 
        req.user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '접근 권한이 없습니다.' });
    }

    // 소프트 삭제 (비활성화)
    prediction.isActive = false;
    await prediction.save();

    res.json({
      message: '부상 위험 예측이 성공적으로 삭제되었습니다.',
      data: { predictionId, deletedAt: new Date() }
    });

  } catch (error) {
    console.error('부상 위험 예측 삭제 오류:', error);
    res.status(500).json({ 
      error: '부상 위험 예측 삭제에 실패했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
});

export default router;
