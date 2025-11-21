/**
 * ⌚ JJ Swim Lab - 스마트 워치 연동 API
 * 
 * 📋 **API 목적**
 * - 스마트 워치에서 수집된 데이터를 서버로 전송
 * - 실시간 생체 데이터 분석 및 저장
 * - AI 평가 시스템과의 자동 연동
 * - 개인화된 운동 계획 수립을 위한 데이터 제공
 */

import express, { Response } from 'express';
import { SmartWatchData } from '../models/SmartWatchData';
import { IntegratedAIEngine } from '../utils/IntegratedAIEngine';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = express.Router();

// 스마트 워치 데이터 동기화
router.post('/sync', authMiddleware, requireRole(['student', 'instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const {
      sessionId,
      deviceInfo,
      sessionInfo,
      performanceMetrics,
      detailedData
    } = req.body;

    if (!sessionId || !deviceInfo || !sessionInfo || !performanceMetrics) {
      return res.status(400).json({
        success: false,
        message: '필수 데이터가 누락되었습니다.'
      });
    }

    // 스마트 워치 데이터 저장
    const smartWatchData = new SmartWatchData({
      studentId: req.user._id,
      sessionId,
      deviceInfo,
      sessionInfo,
      performanceMetrics,
      detailedData,
      isProcessed: false
    });

    await smartWatchData.save();

    // AI 분석 트리거 (비동기)
    setImmediate(async () => {
      try {
        await processSmartWatchData(smartWatchData._id.toString());
      } catch (error) {
        logError('스마트 워치 데이터 AI 분석 오류', error);
      }
    });

    res.json({
      success: true,
      data: smartWatchData,
      message: '스마트 워치 데이터가 성공적으로 동기화되었습니다.'
    });

  } catch (error) {
    logError('스마트 워치 데이터 동기화 오류', error);
    res.status(500).json({
      success: false,
      message: '데이터 동기화 중 오류가 발생했습니다.'
    });
  }
});

// 스마트 워치 데이터 조회
router.get('/data', authMiddleware, requireRole(['student', 'instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const { studentId, technique, limit = 10, offset = 0 } = req.query;
    
    const query: any = {};
    
    // 권한에 따른 데이터 접근 제한
    if (req.user.userType === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.userType === 'instructor') {
      // 강사는 자신의 학생들 데이터만 접근 가능
      // TODO: 학생-강사 관계 확인 로직 추가
      query.studentId = studentId || req.user._id;
    } else if (req.user.userType === 'centerAdmin') {
      // 센터 관리자는 센터 내 모든 학생 데이터 접근 가능
      query.studentId = studentId;
    }
    
    if (technique) {
      query['sessionInfo.technique'] = technique;
    }

    const data = await SmartWatchData.find(query)
      .sort({ 'sessionInfo.startTime': -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string))
      .populate('studentId', 'name email');

    const total = await SmartWatchData.countDocuments(query);

    res.json({
      success: true,
      data: {
        sessions: data,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: total > parseInt(offset as string) + parseInt(limit as string)
        }
      }
    });

  } catch (error) {
    logError('스마트 워치 데이터 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '데이터 조회 중 오류가 발생했습니다.'
    });
  }
});

// 스마트 워치 데이터 상세 조회
router.get('/data/:sessionId', authMiddleware, requireRole(['student', 'instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const data = await SmartWatchData.findOne({ sessionId })
      .populate('studentId', 'name email studentInfo');
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: '세션 데이터를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (req.user.userType === 'student' && data.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }

    res.json({
      success: true,
      data
    });

  } catch (error) {
    logError('스마트 워치 데이터 상세 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '데이터 조회 중 오류가 발생했습니다.'
    });
  }
});

// AI 분석 결과 조회
router.get('/analysis/:sessionId', authMiddleware, requireRole(['student', 'instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const data = await SmartWatchData.findOne({ sessionId })
      .populate('studentId', 'name email');
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: '세션 데이터를 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    if (req.user.userType === 'student' && data.studentId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: '접근 권한이 없습니다.'
      });
    }

    if (!data.isProcessed) {
      return res.json({
        success: true,
        data: {
          isProcessed: false,
          message: 'AI 분석이 진행 중입니다.'
        }
      });
    }

    res.json({
      success: true,
      data: {
        isProcessed: true,
        analysis: data.aiAnalysis,
        performanceMetrics: data.performanceMetrics
      }
    });

  } catch (error) {
    logError('AI 분석 결과 조회 오류', error);
    res.status(500).json({
      success: false,
      message: '분석 결과 조회 중 오류가 발생했습니다.'
    });
  }
});

// 통합 AI 분석 수행
router.post('/integrated-analysis', authMiddleware, requireRole(['instructor', 'centerAdmin']), async (req: any, res: Response) => {
  try {
    const {
      studentId,
      technique,
      smartWatchSessionId,
      videoAnalysisId,
      instructorObservations,
      manualMetrics
    } = req.body;

    if (!studentId || !technique || !instructorObservations) {
      return res.status(400).json({
        success: false,
        message: '필수 데이터가 누락되었습니다.'
      });
    }

    // 스마트 워치 데이터 가져오기
    let smartWatchData = null;
    if (smartWatchSessionId) {
      smartWatchData = await SmartWatchData.findOne({ sessionId: smartWatchSessionId });
    }

    // 영상 분석 데이터 가져오기 (추후 구현)
    const videoAnalysisData = null;
    if (videoAnalysisId) {
      // TODO: 영상 분석 데이터 조회 로직
    }

    // 통합 AI 분석 수행
    const analysisInput = {
      studentId,
      technique,
      smartWatchData,
      videoAnalysisData,
      instructorObservations,
      manualMetrics
    };

    const result = await IntegratedAIEngine.performIntegratedAnalysis(analysisInput);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    logError('통합 AI 분석 오류', error);
    res.status(500).json({
      success: false,
      message: 'AI 분석 중 오류가 발생했습니다.'
    });
  }
});

// 스마트 워치 데이터 AI 분석 처리 함수
async function processSmartWatchData(dataId: string) {
  try {
    const data = await SmartWatchData.findById(dataId);
    if (!data) return;

    // AI 분석 로직 (간단한 예시)
    const analysis = {
      postureScore: Math.round(Math.random() * 40 + 60), // 60-100
      breathingPattern: {
        averageBreathRate: data.performanceMetrics.strokeRate / 2,
        breathConsistency: Math.round(Math.random() * 30 + 70),
        breathEfficiency: Math.round(Math.random() * 25 + 75)
      },
      strokeAnalysis: {
        strokeConsistency: Math.round(Math.random() * 20 + 80),
        strokeEfficiency: Math.round(data.performanceMetrics.efficiency),
        strokePower: Math.round(Math.random() * 30 + 70)
      },
      overallEfficiency: Math.round(data.performanceMetrics.efficiency),
      recommendations: [
        '심박수 안정화를 위한 호흡 연습을 강화하세요',
        '스트로크 일관성을 높이기 위한 기본 동작 연습을 하세요',
        '전체적인 효율성 향상을 위해 코어 근력 운동을 추가하세요'
      ]
    };

    // 분석 결과 업데이트
    data.aiAnalysis = analysis;
    data.isProcessed = true;
    await data.save();

    console.log(`스마트 워치 데이터 AI 분석 완료: ${dataId}`);

  } catch (error) {
    logError('스마트 워치 데이터 AI 분석 처리 오류', error);
  }
}

export default router;

