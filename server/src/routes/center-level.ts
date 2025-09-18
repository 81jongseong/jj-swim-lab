import express from 'express';
import { CenterLevel } from '../models/CenterLevel';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// 모든 센터 레벨 조회 (기본값 반환)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // 기본 레벨 설정 반환
    const defaultLevels = [
      { 
        _id: 'default-beginner',
        name: 'beginner', 
        displayName: '초급',
        order: 1, 
        description: '기본 동작을 익히는 단계', 
        color: 'green',
        isActive: true
      },
      { 
        _id: 'default-intermediate',
        name: 'intermediate', 
        displayName: '중급',
        order: 2, 
        description: '다양한 수영법을 배우는 단계', 
        color: 'yellow',
        isActive: true
      },
      { 
        _id: 'default-advanced',
        name: 'advanced', 
        displayName: '상급',
        order: 3, 
        description: '고급 기술을 연마하는 단계', 
        color: 'red',
        isActive: true
      }
    ];
    
    res.json({
      success: true,
      data: defaultLevels
    });
  } catch (error) {
    console.error('센터 레벨 조회 실패:', error);
    res.status(500).json({ 
      success: false,
      error: '센터 레벨 조회에 실패했습니다.' 
    });
  }
});

// 센터별 레벨 설정 조회
router.get('/:centerId', authMiddleware, async (req, res) => {
  try {
    const { centerId } = req.params;
    
    let centerLevel = await CenterLevel.findOne({ centerId });
    
    // 기본값이 없으면 기본 레벨 생성
    if (!centerLevel) {
      centerLevel = new CenterLevel({
        centerId,
        levels: [
          { name: '기초', order: 1, description: '수영을 처음 배우는 단계', color: 'blue' },
          { name: '초급', order: 2, description: '기본 동작을 익히는 단계', color: 'green' },
          { name: '중급', order: 3, description: '다양한 수영법을 배우는 단계', color: 'yellow' },
          { name: '상급', order: 4, description: '고급 기술을 연마하는 단계', color: 'orange' },
          { name: '마스터', order: 5, description: '완벽한 수영 기술을 갖춘 단계', color: 'red' }
        ]
      });
      await centerLevel.save();
    }
    
    res.json(centerLevel);
  } catch (error) {
    console.error('센터 레벨 조회 실패:', error);
    res.status(500).json({ error: '센터 레벨 조회에 실패했습니다.' });
  }
});

// 센터별 레벨 설정 업데이트 (센터 관리자만)
router.put('/:centerId', authMiddleware, async (req, res) => {
  try {
    const { centerId } = req.params;
    const { levels } = req.body;
    
    // 권한 확인 (센터 관리자 또는 슈퍼 관리자)
    if ((req as any).user?.userType !== 'superAdmin' && 
        (req as any).user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }
    
    // 레벨 데이터 검증
    if (!Array.isArray(levels) || levels.length === 0) {
      return res.status(400).json({ error: '레벨 정보가 올바르지 않습니다.' });
    }
    
    // order 값이 순차적인지 확인
    const sortedLevels = levels.sort((a, b) => a.order - b.order);
    for (let i = 0; i < sortedLevels.length; i++) {
      if (sortedLevels[i].order !== i + 1) {
        return res.status(400).json({ error: '레벨 순서가 올바르지 않습니다.' });
      }
    }
    
    const centerLevel = await CenterLevel.findOneAndUpdate(
      { centerId },
      { 
        levels: sortedLevels,
        isActive: true 
      },
      { 
        new: true, 
        upsert: true 
      }
    );
    
    res.json(centerLevel);
  } catch (error) {
    console.error('센터 레벨 업데이트 실패:', error);
    res.status(500).json({ error: '센터 레벨 업데이트에 실패했습니다.' });
  }
});

// 센터별 레벨 설정 삭제 (비활성화)
router.delete('/:centerId', authMiddleware, async (req, res) => {
  try {
    const { centerId } = req.params;
    
    // 권한 확인
    if ((req as any).user?.userType !== 'superAdmin' && 
        (req as any).user?.userType !== 'centerAdmin') {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }
    
    await CenterLevel.findOneAndUpdate(
      { centerId },
      { isActive: false }
    );
    
    res.json({ message: '센터 레벨이 비활성화되었습니다.' });
  } catch (error) {
    console.error('센터 레벨 삭제 실패:', error);
    res.status(500).json({ error: '센터 레벨 삭제에 실패했습니다.' });
  }
});

export default router;
