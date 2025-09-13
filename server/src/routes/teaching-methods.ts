import express, { Request, Response, Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import { TeachingMethod } from '../models/TeachingMethod';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// 모든 강습법 조회 (공개)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, level, difficulty, search } = req.query;
    
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    // difficulty 파라미터를 level로 매핑 (클라이언트 호환성)
    if (difficulty) {
      query.level = difficulty;
    } else if (level) {
      query.level = level;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 강습법 조회 쿼리:', JSON.stringify(query, null, 2));
    
    const methods = await TeachingMethod.find(query)
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');
    
    console.log(`📊 쿼리 결과: ${methods.length}개의 강습법 발견`);
    
    if (methods.length > 0) {
      console.log('📋 첫 번째 강습법 샘플:', {
        id: methods[0]._id,
        name: methods[0].name,
        isActive: methods[0].isActive,
        level: methods[0].level,
        steps: methods[0].steps?.length || 0
      });
    }
    
    res.json({
      success: true,
      message: '강습법 목록 조회 성공!',
      data: methods,
      total: methods.length
    });
  } catch (error) {
    console.error('강습법 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습법 목록을 불러오는 데 실패했습니다.'
    });
  }
});

// 특정 강습법 조회 (공개)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const method = await TeachingMethod.findById(id).select('-__v');
    
    if (!method) {
      return res.status(404).json({
        success: false,
        message: '강습법을 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '강습법 조회 성공!',
      data: method
    });
  } catch (error) {
    console.error('강습법 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습법을 불러오는 데 실패했습니다.'
    });
  }
});

// 강습법 생성 (강사, 센터 관리자, 총관리자만)
router.post('/', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, category, level, steps, tips, videoUrl, imageUrl } = req.body;
    
    if (!name || !description || !category || !steps) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.'
      });
    }
    
    const newMethod = new TeachingMethod({
      name,
      description,
      category,
      level: level || 'beginner',
      steps: Array.isArray(steps) ? steps : [steps],
      tips: Array.isArray(tips) ? tips : [],
      videoUrl,
      imageUrl,
      order: req.body.order || 0, // 순서 정보 추가
      createdBy: req.user._id,
      isActive: true
    });
    
    await newMethod.save();
    
    res.status(201).json({
      success: true,
      message: '강습법이 성공적으로 생성되었습니다!',
      data: newMethod
    });
  } catch (error) {
    console.error('강습법 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습법 생성에 실패했습니다.'
    });
  }
});

// 강습법 수정 (생성자, 센터 관리자, 총관리자만)
router.put('/:id', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, category, level, steps, tips, videoUrl, imageUrl } = req.body;
    
    const method = await TeachingMethod.findById(id);
    
    if (!method) {
      return res.status(404).json({
        success: false,
        message: '강습법을 찾을 수 없습니다.'
      });
    }
    
    // 권한 확인: 생성자이거나 관리자여야 함
    if (req.user.userType !== 'superAdmin' && 
        req.user.userType !== 'centerAdmin' && 
        (!method.createdBy || method.createdBy.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: '수정 권한이 없습니다.'
      });
    }
    
    // 데이터 업데이트
    if (name) method.name = name;
    if (description) method.description = description;
    if (category) method.category = category;
    if (level) method.level = level;
    if (steps) method.steps = Array.isArray(steps) ? steps : [steps];
    if (tips) method.tips = Array.isArray(tips) ? tips : [];
    if (videoUrl !== undefined) method.videoUrl = videoUrl;
    if (imageUrl !== undefined) method.imageUrl = imageUrl;
    if (req.body.order !== undefined) method.order = req.body.order; // 순서 정보 업데이트
    
    method.updatedAt = new Date();
    
    await method.save();
    
    res.json({
      success: true,
      message: '강습법이 성공적으로 수정되었습니다!',
      data: method
    });
  } catch (error) {
    console.error('강습법 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습법 수정에 실패했습니다.'
    });
  }
});

// 강습법 삭제 (생성자, 센터 관리자, 총관리자만 - 실제 삭제)
router.delete('/:id', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ 강습법 삭제 요청: ${id}`);
    
    const method = await TeachingMethod.findById(id);
    
    if (!method) {
      console.log(`❌ 강습법을 찾을 수 없음: ${id}`);
      return res.status(404).json({
        success: false,
        message: '강습법을 찾을 수 없습니다.'
      });
    }
    
    console.log(`📋 삭제할 강습법: ${method.name} (${method.category})`);
    
    // 권한 확인: 생성자이거나 관리자여야 함
    if (req.user.userType !== 'superAdmin' && 
        req.user.userType !== 'centerAdmin' && 
        (!method.createdBy || method.createdBy.toString() !== req.user._id.toString())) {
      console.log(`❌ 삭제 권한 없음: 사용자 ${req.user.userType}, 강습법 생성자 ${method.createdBy}`);
      return res.status(403).json({
        success: false,
        message: '삭제 권한이 없습니다.'
      });
    }
    
    // 실제 삭제
    const deleteResult = await TeachingMethod.findByIdAndDelete(id);
    console.log(`✅ 강습법 삭제 완료: ${id}, 결과:`, deleteResult);
    
    res.json({
      success: true,
      message: '강습법이 성공적으로 삭제되었습니다!'
    });
  } catch (error) {
    console.error('강습법 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습법 삭제에 실패했습니다.'
    });
  }
});

// 강습법 카테고리별 통계
router.get('/stats/categories', async (req: Request, res: Response) => {
  try {
    const stats = await TeachingMethod.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          levels: { $addToSet: '$level' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      message: '카테고리별 통계 조회 성공!',
      data: stats
    });
  } catch (error) {
    console.error('카테고리 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '통계 조회에 실패했습니다.'
    });
  }
});

// 강습법 난이도별 통계
router.get('/stats/difficulties', async (req: Request, res: Response) => {
  try {
    const stats = await TeachingMethod.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      success: true,
      message: '난이도별 통계 조회 성공!',
      data: stats
    });
  } catch (error) {
    console.error('난이도 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '통계 조회에 실패했습니다.'
    });
  }
});

// 강습법 레벨 수정 (센터 관리자, 강사만)
router.put('/:id/level', auth, requireRole(['centerAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { level, instructorComment, updatedBy } = req.body;

    if (!level || !['beginner', 'intermediate', 'advanced'].includes(level)) {
      return res.status(400).json({
        success: false,
        message: '유효한 레벨을 선택해주세요. (beginner, intermediate, advanced)'
      });
    }

    const method = await TeachingMethod.findById(id);
    if (!method) {
      return res.status(404).json({
        success: false,
        message: '강습법을 찾을 수 없습니다.'
      });
    }

    // 레벨 변경 이력 저장
    const levelChangeHistory = method.levelChangeHistory || [];
    levelChangeHistory.push({
      fromLevel: method.level,
      toLevel: level,
      changedBy: req.user._id,
      changedAt: new Date(),
      reason: instructorComment || '레벨 변경'
    });

    // 강습법 업데이트
    method.level = level;
    method.instructorComments = instructorComment || method.instructorComments;
    method.levelChangeHistory = levelChangeHistory;
    method.updatedAt = new Date();

    await method.save();

    res.json({
      success: true,
      message: '강습법 레벨이 성공적으로 업데이트되었습니다!',
      data: {
        _id: method._id,
        name: method.name,
        level: method.level,
        instructorComments: method.instructorComments,
        levelChangeHistory: method.levelChangeHistory
      }
    });
  } catch (error) {
    console.error('강습법 레벨 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '강습법 레벨 수정 중 오류가 발생했습니다.'
    });
  }
});

export default router;



