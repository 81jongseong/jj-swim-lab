import express, { Request, Response, Router } from 'express';
import { auth, requireRole } from '../middleware/auth';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

const router: Router = express.Router();

// 학생 레벨 변경
router.put('/:studentId/level', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { newLevel, reason } = req.body;
    const { user } = req;

    if (!newLevel) {
      return res.status(400).json({
        success: false,
        message: '새로운 레벨이 필요합니다.'
      });
    }

    // 학생 정보 조회
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: '학생을 찾을 수 없습니다.'
      });
    }

    if (student.userType !== 'student') {
      return res.status(400).json({
        success: false,
        message: '학생만 레벨을 변경할 수 있습니다.'
      });
    }

    // 권한 확인
    let hasPermission = false;
    
    if (user.userType === 'superAdmin') {
      hasPermission = true;
    } else if (user.userType === 'centerAdmin') {
      // 센터 관리자는 자신의 센터 학생만 변경 가능
      if (student.centerId && student.centerId.toString() === user.centerId) {
        hasPermission = true;
      }
    } else if (user.userType === 'instructor') {
      // 강사는 자신이 담당하는 학생만 변경 가능
      if (student.instructorInfo?.assignedInstructor?.toString() === user._id.toString()) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '이 학생의 레벨을 변경할 권한이 없습니다.'
      });
    }

    const oldLevel = student.studentInfo?.currentLevel || student.studentInfo?.swimmingLevel || 'beginner';

    // 레벨 변경 이력 추가
    const levelChangeRecord = {
      fromLevel: oldLevel,
      toLevel: newLevel,
      changedBy: user._id,
      changedByType: user.userType,
      reason: reason || '',
      changedAt: new Date()
    };

    // 학생 정보 업데이트
    const updateData: any = {
      'studentInfo.currentLevel': newLevel,
      'studentInfo.swimmingLevel': newLevel,
      'level': newLevel
    };

    // 레벨 변경 이력 배열에 추가 (최대 10개 유지)
    if (!student.studentInfo.levelChangeHistory) {
      student.studentInfo.levelChangeHistory = [];
    }
    
    student.studentInfo.levelChangeHistory.push(levelChangeRecord);
    
    // 최대 10개만 유지
    if (student.studentInfo.levelChangeHistory.length > 10) {
      student.studentInfo.levelChangeHistory = student.studentInfo.levelChangeHistory.slice(-10);
    }

    // 데이터베이스 업데이트
    const updatedStudent = await User.findByIdAndUpdate(
      studentId,
      updateData,
      { new: true, runValidators: true }
    ).populate('studentInfo.levelChangeHistory.changedBy', 'name userId userType');

    res.json({
      success: true,
      message: '학생 레벨이 성공적으로 변경되었습니다.',
      data: {
        studentId: updatedStudent._id,
        oldLevel,
        newLevel,
        changedBy: {
          userId: user.userId,
          name: user.name,
          userType: user.userType
        },
        changedAt: levelChangeRecord.changedAt,
        reason: levelChangeRecord.reason
      }
    });

  } catch (error) {
    console.error('학생 레벨 변경 오류:', error);
    res.status(500).json({
      success: false,
      message: '학생 레벨 변경에 실패했습니다.'
    });
  }
});

// 학생 레벨 변경 이력 조회
router.get('/:studentId/level-history', auth, requireRole(['instructor', 'centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { user } = req;

    // 학생 정보 조회
    const student = await User.findById(studentId)
      .populate('studentInfo.levelChangeHistory.changedBy', 'name userId userType')
      .select('studentInfo.levelChangeHistory studentInfo.currentLevel name');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: '학생을 찾을 수 없습니다.'
      });
    }

    // 권한 확인
    let hasPermission = false;
    
    if (user.userType === 'superAdmin') {
      hasPermission = true;
    } else if (user.userType === 'centerAdmin') {
      if (student.centerId && student.centerId.toString() === user.centerId) {
        hasPermission = true;
      }
    } else if (user.userType === 'instructor') {
      if (student.instructorInfo?.assignedInstructor?.toString() === user._id.toString()) {
        hasPermission = true;
      }
    }

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '이 학생의 레벨 변경 이력을 조회할 권한이 없습니다.'
      });
    }

    const levelHistory = student.studentInfo?.levelChangeHistory || [];
    const currentLevel = student.studentInfo?.currentLevel || 'beginner';

    res.json({
      success: true,
      message: '학생 레벨 변경 이력 조회 성공!',
      data: {
        studentId: student._id,
        studentName: student.name,
        currentLevel,
        levelHistory: levelHistory.sort((a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      }
    });

  } catch (error) {
    console.error('학생 레벨 변경 이력 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '학생 레벨 변경 이력을 조회하는 데 실패했습니다.'
    });
  }
});

// 센터별 학생 레벨 현황 조회
router.get('/center/:centerId/levels', auth, requireRole(['centerAdmin', 'superAdmin']), async (req: AuthRequest, res: Response) => {
  try {
    const { centerId } = req.params;
    const { user } = req;

    // 권한 확인
    if (user.userType === 'centerAdmin' && user.centerId?.toString() !== centerId) {
      return res.status(403).json({
        success: false,
        message: '다른 센터의 학생 레벨 현황을 조회할 수 없습니다.'
      });
    }

    // 센터 학생들의 레벨 현황 조회
    const students = await User.find({
      userType: 'student',
      centerId: centerId
    }).select('name studentInfo.currentLevel studentInfo.swimmingLevel createdAt');

    // 레벨별 학생 수 집계
    const levelStats = students.reduce((acc, student) => {
      const level = student.studentInfo?.currentLevel || student.studentInfo?.swimmingLevel || 'beginner';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    res.json({
      success: true,
      message: '센터별 학생 레벨 현황 조회 성공!',
      data: {
        centerId,
        totalStudents: students.length,
        levelStats,
        students: students.map(student => ({
          id: student._id,
          name: student.name,
          currentLevel: student.studentInfo?.currentLevel || student.studentInfo?.swimmingLevel || 'beginner',
          enrolledAt: student.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('센터별 학생 레벨 현황 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '센터별 학생 레벨 현황을 조회하는 데 실패했습니다.'
    });
  }
});

export default router;
