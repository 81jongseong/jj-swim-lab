import express, { Request, Response, Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import CenterLevel from '../models/CenterLevel';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// 센터별 레벨 목록 조회
router.get('/center/:centerId', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.params;
    
    const levels = await CenterLevel.find({ 
      centerId, 
      isActive: true 
    }).sort({ levelOrder: 1 });
    
    res.json({
      success: true,
      message: '센터 레벨 목록 조회 성공!',
      data: levels
    });
  } catch (error) {
    console.error('센터 레벨 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 레벨을 불러오는 데 실패했습니다.'
    });
  }
});

// 센터별 레벨 생성 (센터 관리자, 총관리자, 위임받은 강사만)
router.post('/', auth, requireRole(['centerAdmin', 'superAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { centerId, levelName, levelOrder, levelColor, description } = req.body;
    
    if (!centerId || !levelName || !levelOrder) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다.'
      });
    }
    
    // 권한 확인 (센터 관리자는 자신의 센터만, 강사는 센터에서 위임받은 경우만)
    if (req.user?.userType === 'centerAdmin' && req.user?.centerId?.toString() !== centerId) {
      return res.status(403).json({
        success: false,
        message: '자신의 센터만 관리할 수 있습니다.'
      });
    }
    
    // 강사인 경우 센터에서 레벨 관리 권한을 위임받았는지 확인
    if (req.user?.userType === 'instructor') {
      // TODO: 센터에서 강사에게 레벨 관리 권한을 위임했는지 확인하는 로직 필요
      // 현재는 임시로 허용 (실제로는 권한 테이블에서 확인해야 함)
      console.log(`🔐 강사 ${req.user.name}이 센터 ${centerId}의 레벨을 생성하려고 시도`);
    }
    
    const newLevel = new CenterLevel({
      centerId,
      levelName,
      levelOrder,
      levelColor: levelColor || 'bg-gray-500',
      description
    });
    
    await newLevel.save();
    
    res.status(201).json({
      success: true,
      message: '센터 레벨 생성 성공!',
      data: newLevel
    });
  } catch (error) {
    console.error('센터 레벨 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 레벨 생성에 실패했습니다.'
    });
  }
});

// 센터별 레벨 수정 (센터 관리자, 총관리자, 위임받은 강사만)
router.put('/:id', auth, requireRole(['centerAdmin', 'superAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { levelName, levelOrder, levelColor, description } = req.body;
    
    const level = await CenterLevel.findById(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: '센터 레벨을 찾을 수 없습니다.'
      });
    }
    
    // 권한 확인 (센터 관리자는 자신의 센터만)
    if (req.user?.userType === 'centerAdmin' && req.user?.centerId?.toString() !== level.centerId?.toString()) {
      return res.status(403).json({
        success: false,
        message: '자신의 센터만 관리할 수 있습니다.'
      });
    }
    
    const updatedLevel = await CenterLevel.findByIdAndUpdate(
      id,
      { levelName, levelOrder, levelColor, description },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: '센터 레벨 수정 성공!',
      data: updatedLevel
    });
  } catch (error) {
    console.error('센터 레벨 수정 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 레벨 수정에 실패했습니다.'
    });
  }
});

// 센터별 레벨 삭제 (센터 관리자, 총관리자, 위임받은 강사만)
router.delete('/:id', auth, requireRole(['centerAdmin', 'superAdmin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const level = await CenterLevel.findById(id);
    if (!level) {
      return res.status(404).json({
        success: false,
        message: '센터 레벨을 찾을 수 없습니다.'
      });
    }
    
    // 권한 확인 (센터 관리자는 자신의 센터만)
    if (req.user?.userType === 'centerAdmin' && req.user?.centerId?.toString() !== level.centerId?.toString()) {
      return res.status(403).json({
        success: false,
        message: '자신의 센터만 관리할 수 있습니다.'
      });
    }
    
    await CenterLevel.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: '센터 레벨 삭제 성공!'
    });
  } catch (error) {
    console.error('센터 레벨 삭제 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터 레벨 삭제에 실패했습니다.'
    });
  }
});

// 기본 센터 레벨 생성 (총관리자만)
router.post('/default/:centerId', auth, requireRole(['superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.params;
    
    // 기존 레벨 삭제
    await CenterLevel.deleteMany({ centerId });
    
    // 기본 레벨 생성
    const defaultLevels = [
      { levelName: '입문', levelOrder: 1, levelColor: 'bg-blue-500', description: '수영을 처음 시작하는 단계' },
      { levelName: '기초', levelOrder: 2, levelColor: 'bg-indigo-500', description: '기본 동작을 배우는 단계' },
      { levelName: '초급', levelOrder: 3, levelColor: 'bg-green-500', description: '초급 기술을 연마하는 단계' },
      { levelName: '중급', levelOrder: 4, levelColor: 'bg-yellow-500', description: '중급 기술을 연마하는 단계' },
      { levelName: '상급', levelOrder: 5, levelColor: 'bg-orange-500', description: '상급 기술을 연마하는 단계' },
      { levelName: '마스터', levelOrder: 6, levelColor: 'bg-red-500', description: '마스터 수준의 기술을 구사하는 단계' }
    ];
    
    const createdLevels = await CenterLevel.insertMany(
      defaultLevels.map(level => ({ ...level, centerId }))
    );
    
    res.status(201).json({
      success: true,
      message: '기본 센터 레벨 생성 성공!',
      data: createdLevels
    });
  } catch (error) {
    console.error('기본 센터 레벨 생성 오류:', error);
    res.status(500).json({
      success: false,
      message: '기본 센터 레벨 생성에 실패했습니다.'
    });
  }
});

export default router;
