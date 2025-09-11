import express, { Request, Response, Router } from 'express';
import mongoose from 'mongoose';
import ExerciseRecommendation, { IExerciseRecommendation } from '../models/ExerciseRecommendation';
import { auth, requireRole } from '../middleware/auth';

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
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { technique, level, category, isActive } = req.query;
    const user = req.user!;
    
    // 필터 조건 구성
    const filter: any = {};
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    // 쿼리 파라미터 필터링
    if (technique) filter.technique = technique;
    if (level) filter.level = level;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    const recommendations = await ExerciseRecommendation.find(filter)
      .populate('createdBy', 'name email')
      .populate('centerId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('운동 추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 특정 운동 추천 조회
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    const recommendation = await ExerciseRecommendation.findOne(filter)
      .populate('createdBy', 'name email')
      .populate('centerId', 'name');
    
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
    console.error('운동 추천 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천을 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// 새 운동 추천 생성
router.post('/', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const {
      technique,
      level,
      category,
      exercises,
      workoutPlan,
      isActive = true
    } = req.body;
    
    // 필수 필드 검증
    if (!technique || !level || !category) {
      return res.status(400).json({
        success: false,
        message: '수영 기법, 레벨, 카테고리는 필수입니다.'
      });
    }
    
    // 유효한 값 검증
    const validTechniques = ['freestyle', 'backstroke', 'breaststroke', 'butterfly'];
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const validCategories = ['posture', 'breathing', 'movement', 'efficiency'];
    
    if (!validTechniques.includes(technique)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 수영 기법입니다.'
      });
    }
    
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 레벨입니다.'
      });
    }
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 카테고리입니다.'
      });
    }
    
    // 중복 검사 (같은 기법, 레벨, 카테고리 조합)
    const existingRecommendation = await ExerciseRecommendation.findOne({
      technique,
      level,
      category,
      centerId: user.centerId
    });
    
    if (existingRecommendation) {
      return res.status(400).json({
        success: false,
        message: '이미 같은 기법, 레벨, 카테고리의 운동 추천이 존재합니다.'
      });
    }
    
    const recommendation = new ExerciseRecommendation({
      technique,
      level,
      category,
      exercises: exercises || [],
      workoutPlan: workoutPlan || [],
      isActive,
      createdBy: user._id,
      centerId: user.centerId
    });
    
    await recommendation.save();
    
    // 생성된 데이터를 다시 조회하여 반환
    const savedRecommendation = await ExerciseRecommendation.findById(recommendation._id)
      .populate('createdBy', 'name email')
      .populate('centerId', 'name');
    
    res.status(201).json({
      success: true,
      message: '운동 추천이 성공적으로 생성되었습니다.',
      recommendation: savedRecommendation
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
router.put('/:id', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const updateData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    // 권한 확인 (생성자이거나 관리자인 경우만 수정 가능)
    if (user.userType !== 'admin') {
      filter.createdBy = user._id;
    }
    
    const recommendation = await ExerciseRecommendation.findOne(filter);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '운동 추천을 찾을 수 없거나 수정 권한이 없습니다.'
      });
    }
    
    // 업데이트할 필드만 수정
    const allowedFields = ['technique', 'level', 'category', 'exercises', 'workoutPlan', 'isActive'];
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
    ).populate('createdBy', 'name email')
     .populate('centerId', 'name');
    
    res.json({
      success: true,
      message: '운동 추천이 성공적으로 수정되었습니다.',
      recommendation: updatedRecommendation
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
router.delete('/:id', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    // 권한 확인 (생성자이거나 관리자인 경우만 삭제 가능)
    if (user.userType !== 'admin') {
      filter.createdBy = user._id;
    }
    
    const recommendation = await ExerciseRecommendation.findOne(filter);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '운동 추천을 찾을 수 없거나 삭제 권한이 없습니다.'
      });
    }
    
    await ExerciseRecommendation.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '운동 추천이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('운동 추천 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천 삭제 중 오류가 발생했습니다.'
    });
  }
});

// 운동 추천 활성화/비활성화 토글
router.patch('/:id/toggle', auth, requireRole(['superAdmin', 'admin', 'centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 ID입니다.'
      });
    }
    
    const filter: any = { _id: id };
    
    // 센터별 필터링 (관리자가 아닌 경우)
    if (user.userType !== 'admin' && user.centerId) {
      filter.centerId = user.centerId;
    }
    
    const recommendation = await ExerciseRecommendation.findOne(filter);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: '운동 추천을 찾을 수 없습니다.'
      });
    }
    
    recommendation.isActive = !recommendation.isActive;
    await recommendation.save();
    
    res.json({
      success: true,
      message: `운동 추천이 ${recommendation.isActive ? '활성화' : '비활성화'}되었습니다.`,
      recommendation
    });
  } catch (error) {
    console.error('운동 추천 토글 오류:', error);
    res.status(500).json({
      success: false,
      message: '운동 추천 상태 변경 중 오류가 발생했습니다.'
    });
  }
});

export default router;
