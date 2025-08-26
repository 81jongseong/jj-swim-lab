import express, { Request, Response, Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import { CenterLevel } from '../models/CenterLevel';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// 센터별 레벨 목록 조회
router.get('/', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.user;
    
    if (!centerId && req.user.userType !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: '센터 정보가 없습니다.'
      });
    }

    const query = req.user.userType === 'superAdmin' ? {} : { centerId };
    
    const levels = await CenterLevel.find(query)
      .sort({ order: 1, createdAt: 1 })
      .select('-__v');

    res.json({
      success: true,
      message: '센터 레벨 목록 조회 성공!',
      data: levels,
      total: levels.length
    });
  } catch (error) {
    console.error('센터 레벨 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 레벨 목록을 불러오는 데 실패했습니다.'
    });
  }
});

// 특정 센터 레벨 조회
router.get('/:id', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { centerId } = req.user;
    
    const level = await CenterLevel.findById(id).select('-__v');
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: '센터 레벨을 찾을 수 없습니다.'
      });
    }

    // 센터 관리자는 자신의 센터 레벨만 조회 가능
    if (req.user.userType === 'centerAdmin' && level.centerId.toString() !== centerId) {
      return res.status(403).json({
        success: false,
        message: '다른 센터의 레벨을 조회할 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      message: '센터 레벨 조회 성공!',
      data: level
    });
  } catch (error) {
    console.error('센터 레벨 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 레벨을 불러오는 데 실패했습니다.'
    });
  }
});

// 센터 레벨 생성
router.post('/', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.user;
    const { name, displayName, order, color, description } = req.body;
    
    if (!centerId && req.user.userType !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: '센터 정보가 없습니다.'
      });
    }

    // 필수 필드 검증
    if (!name || !displayName || order === undefined) {
      return res.status(400).json({
        success: false,
        message: '필수 필드가 누락되었습니다.'
      });
    }

    const levelData = {
      centerId: req.user.userType === 'superAdmin' ? req.body.centerId : centerId,
      name,
      displayName,
      order: parseInt(order),
      color: color || 'blue',
      description
    };

    const newLevel = new CenterLevel(levelData);
    await newLevel.save();

    res.status(201).json({
      success: true,
      message: '센터 레벨이 성공적으로 생성되었습니다.',
      data: newLevel
    });
  } catch (error) {
    console.error('센터 레벨 생성 오류:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 레벨 이름이거나 순서입니다.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '센터 레벨 생성에 실패했습니다.'
    });
  }
});

// 센터 레벨 수정
router.put('/:id', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { centerId } = req.user;
    const { name, displayName, order, color, description, isActive } = req.body;
    
    const level = await CenterLevel.findById(id);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: '센터 레벨을 찾을 수 없습니다.'
      });
    }

    // 센터 관리자는 자신의 센터 레벨만 수정 가능
    if (req.user.userType === 'centerAdmin' && level.centerId.toString() !== centerId) {
      return res.status(403).json({
        success: false,
        message: '다른 센터의 레벨을 수정할 수 없습니다.'
      });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (order !== undefined) updateData.order = parseInt(order);
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedLevel = await CenterLevel.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      message: '센터 레벨이 성공적으로 수정되었습니다.',
      data: updatedLevel
    });
  } catch (error) {
    console.error('센터 레벨 수정 오류:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: '이미 존재하는 레벨 이름이거나 순서입니다.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: '센터 레벨 수정에 실패했습니다.'
    });
  }
});

// 센터 레벨 삭제
router.delete('/:id', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { centerId } = req.user;
    
    const level = await CenterLevel.findById(id);
    
    if (!level) {
      return res.status(404).json({
        success: false,
        message: '센터 레벨을 찾을 수 없습니다.'
      });
    }

    // 센터 관리자는 자신의 센터 레벨만 삭제 가능
    if (req.user.userType === 'centerAdmin' && level.centerId.toString() !== centerId) {
      return res.status(403).json({
        success: false,
        message: '다른 센터의 레벨을 삭제할 수 없습니다.'
      });
    }

    await CenterLevel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '센터 레벨이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    console.error('센터 레벨 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 레벨 삭제에 실패했습니다.'
    });
  }
});

export default router;
