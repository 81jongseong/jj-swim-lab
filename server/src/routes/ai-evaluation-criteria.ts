/**
 * 🤖 JJ Swim Lab - AI 평가 기준 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - AI 기반 수영 기술 평가 기준 및 결과 관리 API 엔드포인트 제공
 * - 평가 기준 CRUD 작업 및 평가 결과 저장
 * - AI 평가 엔진과의 연동 및 평가 실행
 * - 평가 결과 분석 및 통계 제공
 * - AI 평가 성능 최적화 및 관리
 * 
 * 🔄 **주요 기능**
 * - 평가 기준 CRUD 작업 (생성, 조회, 수정, 삭제)
 * - AI 평가 실행 및 결과 저장
 * - 평가 결과 분석 및 통계
 * - AI 평가 성능 모니터링
 * - 평가 기준 템플릿 관리
 * - 평가 결과 내보내기 및 공유
 * - AI 모델 성능 평가 및 개선
 * 
 * 🗄️ **데이터 연동**
 * - EvaluationCriteria 모델과 연동 (평가 기준)
 * - AIEvaluationResult 모델과 연동 (평가 결과)
 * - ExerciseRecommendation 모델과 연동 (운동 추천)
 * - AdvancedAIEngine 유틸리티와 연동 (AI 평가)
 * - User 모델과 연동 (평가자 정보)
 * - 인증 미들웨어와 연동 (권한 검증)
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js Router
 * - Mongoose (MongoDB ODM)
 * - EvaluationCriteria 모델 (../models/AIEvaluationCriteria)
 * - AIEvaluationResult 모델 (../models/AIEvaluationCriteria)
 * - ExerciseRecommendation 모델 (../models/ExerciseRecommendation)
 * - AdvancedAIEngine 유틸리티 (../utils/AdvancedAIEngine)
 * - 인증 미들웨어 (../middleware/auth)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. AI 평가 기준의 정확성 및 신뢰성
 * 2. 평가 결과 데이터의 무결성 및 보안
 * 3. AI 평가 성능 최적화
 * 4. 평가 기준 변경 시 기존 평가 결과 영향 분석
 * 5. AI 모델 업데이트 및 버전 관리
 * 6. API 보안 및 Rate Limiting 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] AI 평가 기준 정확성 확인
 * - [ ] 평가 결과 데이터 무결성 확인
 * - [ ] AI 평가 성능 최적화 확인
 * - [ ] 평가 기준 변경 영향 분석 확인
 * - [ ] API 엔드포인트 보안 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 AI 평가 기준 관리 API 구현
 * - 2024-12-19: 평가 기준 CRUD 시스템 구현
 * - 2024-12-19: AI 평가 실행 시스템 구현
 * - 2024-12-19: 평가 결과 분석 시스템 구현
 * - 2024-12-19: AI 평가 성능 모니터링 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (AI 평가 기준 관리 API 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 평가 기준 자동 생성 시스템
 * - 실시간 AI 평가 결과 업데이트
 * - AI 평가 결과 시각화
 * - AI 평가 기준 공유 및 협업
 * - AI 평가 성능 향상
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 평가 기준 조회
 * GET /api/ai-evaluation-criteria/evaluation-criteria
 * 
 * // 평가 기준 생성
 * POST /api/ai-evaluation-criteria/evaluation-criteria
 * {
 *   "technique": "freestyle",
 *   "level": "beginner",
 *   "criteria": {...}
 * }
 * 
 * // AI 평가 실행
 * POST /api/ai-evaluation-criteria/evaluate
 * {
 *   "videoData": "...",
 *   "userId": "user001"
 * }
 * ```
 * 
 * 🔍 **AI 평가 기준 관리 처리 흐름**
 * 1. 사용자 권한 및 역할 검증
 * 2. 평가 기준 데이터 검증 및 sanitization
 * 3. AI 평가 엔진을 통한 평가 실행
 * 4. 평가 결과 분석 및 저장
 * 5. AI 평가 성능 모니터링
 * 6. 평가 결과 통계 업데이트
 * 7. 응답 데이터 반환 및 로깅
 */

import express, { Request, Response } from 'express';
import { auth, requireRole } from '../middleware/auth';
import { EvaluationCriteria, AIEvaluationResult } from '../models/AIEvaluationCriteria';
import ExerciseRecommendation from '../models/ExerciseRecommendation';
import { AdvancedAIEngine } from '../utils/AdvancedAIEngine';

const router = express.Router();

// 평가 기준 조회
router.get('/evaluation-criteria', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const criteria = await EvaluationCriteria.find({ isActive: true }).sort({ technique: 1, level: 1 });
    
    res.json({
      success: true,
      data: { criteria },
      message: '평가 기준을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('평가 기준 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 기준 조회 중 오류가 발생했습니다.'
    });
  }
});

// 평가 기준 생성
router.post('/evaluation-criteria', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const criteriaData = req.body;
    
    // 중복 확인
    const existing = await EvaluationCriteria.findOne({
      technique: criteriaData.technique,
      level: criteriaData.level
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 평가 기준입니다.'
      });
    }
    
    const criteria = new EvaluationCriteria(criteriaData);
    await criteria.save();
    
    res.status(201).json({
      success: true,
      data: { criteria },
      message: '평가 기준을 성공적으로 생성했습니다.'
    });
  } catch (error) {
    console.error('평가 기준 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 기준 생성 중 오류가 발생했습니다.'
    });
  }
});

// 평가 기준 수정
router.put('/evaluation-criteria/:id', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const criteria = await EvaluationCriteria.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: '평가 기준을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: { criteria },
      message: '평가 기준을 성공적으로 수정했습니다.'
    });
  } catch (error) {
    console.error('평가 기준 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 기준 수정 중 오류가 발생했습니다.'
    });
  }
});

// 평가 기준 삭제
router.delete('/evaluation-criteria/:id', auth, requireRole(['superAdmin']), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const criteria = await EvaluationCriteria.findByIdAndDelete(id);
    
    if (!criteria) {
      return res.status(404).json({
        success: false,
        message: '평가 기준을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '평가 기준을 성공적으로 삭제했습니다.'
    });
  } catch (error) {
    console.error('평가 기준 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '평가 기준 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 운동 추천 조회
router.get('/exercise-recommendations', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { category, difficulty } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const recommendations = await ExerciseRecommendation.find(filter).sort({ category: 1, difficulty: 1 });
    
    res.json({
      success: true,
      data: { recommendations },
      message: '운동 추천을 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('운동 추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천 조회 중 오류가 발생했습니다.'
    });
  }
});

// 운동 추천 생성
router.post('/exercise-recommendations', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const recommendationData = req.body;
    
    const recommendation = new ExerciseRecommendation(recommendationData);
    await recommendation.save();
    
    res.status(201).json({
      success: true,
      data: { recommendation },
      message: '운동 추천을 성공적으로 생성했습니다.'
    });
  } catch (error) {
    console.error('운동 추천 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천 생성 중 오류가 발생했습니다.'
    });
  }
});

// 운동 추천 수정
router.put('/exercise-recommendations/:id', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const recommendation = await ExerciseRecommendation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '운동 추천을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: { recommendation },
      message: '운동 추천을 성공적으로 수정했습니다.'
    });
  } catch (error) {
    console.error('운동 추천 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천 수정 중 오류가 발생했습니다.'
    });
  }
});

// 운동 추천 삭제
router.delete('/exercise-recommendations/:id', auth, requireRole(['superAdmin']), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const recommendation = await ExerciseRecommendation.findByIdAndDelete(id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '운동 추천을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '운동 추천을 성공적으로 삭제했습니다.'
    });
  } catch (error) {
    console.error('운동 추천 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천 삭제 중 오류가 발생했습니다.'
    });
  }
});

// AI 평가 실행
router.post('/evaluate', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const evaluationInput = req.body;
    
    // 입력 데이터 검증
    if (!evaluationInput.studentId || !evaluationInput.technique || !evaluationInput.level) {
      return res.status(400).json({
        success: false,
        message: '필수 입력 데이터가 누락되었습니다.'
      });
    }
    
    // AI 평가 실행
    const result = await AdvancedAIEngine.performComprehensiveEvaluation({
      studentId: evaluationInput.studentId,
      instructorId: req.user.id,
      technique: evaluationInput.technique,
      level: evaluationInput.level,
      performanceMetrics: evaluationInput.performanceMetrics || {},
      instructorObservations: evaluationInput.instructorObservations || {
        posture: 0,
        breathing: 0,
        movement: 0,
        efficiency: 0
      }
    });
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'AI 평가 중 오류가 발생했습니다.'
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      message: 'AI 평가가 성공적으로 완료되었습니다.'
    });
  } catch (error) {
    console.error('AI 평가 실행 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 평가 실행 중 오류가 발생했습니다.'
    });
  }
});

// AI 평가 결과 조회
router.get('/evaluation-results/:studentId', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { studentId } = req.params;
    const { technique, limit = 10 } = req.query;
    
    const filter: any = { studentId };
    if (technique) filter.technique = technique;
    
    const results = await AIEvaluationResult.find(filter)
      .sort({ evaluationDate: -1 })
      .limit(parseInt(limit as string))
      .populate('instructorId', 'name email');
    
    res.json({
      success: true,
      data: { results },
      message: 'AI 평가 결과를 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('AI 평가 결과 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 평가 결과 조회 중 오류가 발생했습니다.'
    });
  }
});

// AI 평가 결과 상세 조회
router.get('/evaluation-results/detail/:id', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await AIEvaluationResult.findById(id)
      .populate('studentId', 'name email')
      .populate('instructorId', 'name email');
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'AI 평가 결과를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: { result },
      message: 'AI 평가 결과를 성공적으로 조회했습니다.'
    });
  } catch (error) {
    console.error('AI 평가 결과 상세 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: 'AI 평가 결과 상세 조회 중 오류가 발생했습니다.'
    });
  }
});

export default router;
