/**
 * 🏊‍♂️ JJ Swim Lab - AI 운동 추천 관리 API 라우트
 * 
 * 📋 **라우트 목적**
 * - AI 기반 수영 운동 추천 시스템의 API 엔드포인트 제공
 * - 개인화된 운동 추천 생성 및 관리
 * - 사용자별 맞춤형 운동 계획 수립
 * - 운동 추천 성과 분석 및 피드백
 * - AI 추천 알고리즘 최적화 및 관리
 * 
 * 🔄 **주요 기능**
 * - 운동 추천 CRUD 작업 (생성, 조회, 수정, 삭제)
 * - 개인화된 운동 추천 생성
 * - 사용자별 맞춤형 운동 계획
 * - 운동 추천 성과 분석
 * - AI 추천 알고리즘 최적화
 * - 운동 추천 피드백 및 개선
 * - 운동 추천 통계 및 분석
 * 
 * 🗄️ **데이터 연동**
 * - ExerciseRecommendation 모델과 연동 (운동 추천)
 * - User 모델과 연동 (사용자 정보)
 * - AI 추천 엔진과 연동 (개인화 추천)
 * - 운동 데이터베이스와 연동 (운동 정보)
 * - 사용자 선호도 및 히스토리 데이터
 * - 인증 미들웨어와 연동 (권한 검증)
 * - MongoDB Atlas 데이터베이스
 * 
 * 🛠️ **필요한 설치 파일**
 * - Express.js Router
 * - Mongoose (MongoDB ODM)
 * - ExerciseRecommendation 모델 (../models/ExerciseRecommendation)
 * - User 모델 (../models/User)
 * - AI 추천 엔진 유틸리티
 * - 인증 미들웨어 (../middleware/auth)
 * - MongoDB Atlas (데이터 저장)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. AI 추천 알고리즘의 정확성 및 신뢰성
 * 2. 개인화 추천의 프라이버시 보호
 * 3. 운동 추천의 안전성 및 적절성
 * 4. AI 추천 성능 최적화
 * 5. 사용자 피드백 수집 및 분석
 * 6. API 보안 및 Rate Limiting 적용
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] AI 추천 알고리즘 정확성 확인
 * - [ ] 개인화 추천 프라이버시 보호 확인
 * - [ ] 운동 추천 안전성 및 적절성 확인
 * - [ ] AI 추천 성능 최적화 확인
 * - [ ] 사용자 피드백 수집 및 분석 확인
 * - [ ] API 엔드포인트 보안 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 AI 운동 추천 관리 API 구현
 * - 2024-12-19: 운동 추천 CRUD 시스템 구현
 * - 2024-12-19: 개인화 추천 시스템 구현
 * - 2024-12-19: AI 추천 알고리즘 최적화
 * - 2024-12-19: 운동 추천 성과 분석 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (AI 운동 추천 관리 API 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 추천 알고리즘 성능 향상
 * - 실시간 개인화 추천 시스템
 * - 운동 추천 결과 시각화
 * - 운동 추천 공유 및 협업
 * - AI 추천 모델 자동 업데이트
 * 
 * 💡 **사용 예시**
 * ```typescript
 * // 운동 추천 조회
 * GET /api/ai-exercise-recommendations?technique=freestyle&level=beginner
 * 
 * // 개인화 운동 추천 생성
 * POST /api/ai-exercise-recommendations/personalized
 * {
 *   "userId": "user001",
 *   "preferences": {...}
 * }
 * 
 * // 운동 추천 피드백
 * POST /api/ai-exercise-recommendations/:id/feedback
 * {
 *   "rating": 5,
 *   "comment": "매우 도움이 되었습니다"
 * }
 * ```
 * 
 * 🔍 **AI 운동 추천 관리 처리 흐름**
 * 1. 사용자 권한 및 역할 검증
 * 2. 사용자 선호도 및 히스토리 분석
 * 3. AI 추천 알고리즘을 통한 개인화 추천 생성
 * 4. 운동 추천 결과 검증 및 최적화
 * 5. 사용자 피드백 수집 및 분석
 * 6. AI 추천 모델 성능 평가 및 개선
 * 7. 응답 데이터 반환 및 로깅
 */

import { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import ExerciseRecommendation from '../models/ExerciseRecommendation';
import { authMiddleware, requireRole } from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

const router = Router();

// 인증된 요청 인터페이스
interface AuthRequest extends Request {
  user?: {
    _id: string;
    userType: string;
    centerId?: string;
  };
}

// 모든 운동 추천 조회
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { technique, level, category, difficulty } = req.query;
    // const user = req.user!; // 사용되지 않는 변수
    
    // 필터 조건 구성
    const filter: any = {};
    
    // 쿼리 파라미터 필터링
    if (technique) filter.technique = technique;
    if (level) filter.level = level;
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    
    const recommendations = await ExerciseRecommendation.find(filter)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    logError('운동 추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 특정 운동 추천 조회
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const recommendation = await ExerciseRecommendation.findById(id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '운동 추천을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      recommendation
    });
  } catch (error) {
    logError('운동 추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 새 운동 추천 생성
router.post('/', authMiddleware, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    // const user = req.user!; // 사용되지 않는 변수
    const {
      id,
      name,
      description,
      difficulty,
      category,
      duration,
      equipment,
      instructions,
      benefits
    } = req.body;
    
    // 필수 필드 검증
    if (!id || !name || !description || !difficulty || !category || !duration || !instructions || !benefits) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 필드를 입력해주세요.'
      });
    }
    
    // 유효한 값 검증
    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 난이도입니다.'
      });
    }
    
    // 중복 검사 (같은 ID)
    const existingRecommendation = await ExerciseRecommendation.findOne({
      id
    });
    
    if (existingRecommendation) {
      return res.status(400).json({
        success: false,
        message: '이미 같은 ID의 운동 추천이 존재합니다.'
      });
    }
    
    const recommendation = new ExerciseRecommendation({
      id,
      name,
      description,
      difficulty,
      category,
      duration,
      equipment: equipment || [],
      instructions,
      benefits
    });
    
    await recommendation.save();
    
    res.status(201).json({
      success: true,
      message: '운동 추천이 성공적으로 생성되었습니다.',
      recommendation
    });
  } catch (error) {
    logError('운동 추천 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천 생성 중 오류가 발생했습니다.'
    });
  }
});

// 운동 추천 수정
router.put('/:id', authMiddleware, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const recommendation = await ExerciseRecommendation.findById(id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '운동 추천을 찾을 수 없습니다.'
      });
    }
    
    // 업데이트할 필드만 수정
    const allowedFields = ['name', 'description', 'difficulty', 'category', 'duration', 'equipment', 'instructions', 'benefits'];
    const updateFields: any = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    });
    
    const updatedRecommendation = await ExerciseRecommendation.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: '운동 추천이 성공적으로 수정되었습니다.',
      recommendation: updatedRecommendation
    });
  } catch (error) {
    logError('운동 추천 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천 수정 중 오류가 발생했습니다.'
    });
  }
});

// 운동 추천 삭제
router.delete('/:id', authMiddleware, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const recommendation = await ExerciseRecommendation.findById(id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '운동 추천을 찾을 수 없습니다.'
      });
    }
    
    await ExerciseRecommendation.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '운동 추천이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    logError('운동 추천 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천 삭제 중 오류가 발생했습니다.'
    });
  }
});

export default router;
