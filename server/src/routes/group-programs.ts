/**
 * 🏊‍♂️ SwimLab - 단체반 프로그램 관리 라우트
 * 
 * 📋 **주요 기능**
 * 1. 단체반 공통 프로그램 생성
 * 2. 개인별 조정사항 자동 생성
 * 3. 회원별 맞춤 프로그램 조회
 * 4. 주의사항 및 페이스 조정 안내
 */

import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';

interface AuthRequest extends Request {
  user?: any;
}
import SwimProgram from '../models/SwimProgram';
import PersonalProgramAdjustment from '../models/PersonalProgramAdjustment';
import { User } from '../models/User';
const GroupClass = require('../models/GroupClass').default;
import { Course } from '../models/Course';

const router = express.Router();

/**
 * POST /api/group-programs
 * 단체반 공통 프로그램 생성
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { groupClassId, courseId, programData } = req.body;
    
    if ((!groupClassId && !courseId) || !programData) {
      return res.status(400).json({
        success: false,
        message: '단체반 또는 강습 과정 ID와 프로그램 데이터가 필요합니다.'
      });
    }
    
    // 단체반 정보 조회
    let groupClass = groupClassId ? await GroupClass.findById(groupClassId) : null;
    let fallbackCourse: any = null;
    let resolvedGroupClassId = groupClassId;
    let resolvedClassName = groupClass?.className;
    let resolvedCenterId = groupClass?.centerId;
    let resolvedInstructorId = groupClass?.instructorId;
    let resolvedStudents: any[] = groupClass?.students || [];

    if (!groupClass) {
      if (!courseId) {
        return res.status(404).json({
          success: false,
          message: '단체반을 찾을 수 없습니다.'
        });
      }

      fallbackCourse = await Course.findById(courseId);

      if (!fallbackCourse) {
        return res.status(404).json({
          success: false,
          message: '단체반을 찾을 수 없습니다.'
        });
      }

      resolvedGroupClassId = courseId;
      resolvedClassName = fallbackCourse.classInfo?.className || fallbackCourse.name || '단체반';
      resolvedCenterId = fallbackCourse.centerId;
      resolvedInstructorId =
        fallbackCourse.instructorId ||
        fallbackCourse.instructor ||
        (fallbackCourse.teacherId || fallbackCourse.teacher);

      resolvedStudents = (fallbackCourse.enrolledStudents || []).map((enrollment: any) => ({
        userId: enrollment?.student || enrollment?.studentId,
        status: (enrollment?.status || 'active') as 'active' | 'inactive' | 'completed' | 'dropped'
      }));

      groupClass = {
        _id: courseId,
        className: resolvedClassName,
        centerId: resolvedCenterId,
        instructorId: resolvedInstructorId,
        students: resolvedStudents
      } as any;
    }
    
    console.log(`📚 단체반 프로그램 생성 시작: ${resolvedClassName}`);
    
    // 공통 프로그램 생성
    const newProgram = new SwimProgram({
      groupClassId: resolvedGroupClassId,
      groupClassName: resolvedClassName,
      centerId: resolvedCenterId,
      programType: programData.programType || 'weekly',
      programScope: 'group', // 단체반 프로그램
      params: programData.params,
      content: programData.content,
      usedMethodIds: programData.usedMethodIds || []
    });
    
    await newProgram.save();
    console.log(`✅ 단체반 공통 프로그램 생성 완료: ${newProgram._id}`);
    
    // 단체반 학생들 조회
    const activeStudents = resolvedStudents.filter((s: any) => (s?.status || 'active') === 'active');
    console.log(`👥 활성 학생 ${activeStudents.length}명에 대한 개인별 조정사항 생성 시작`);
    
    const adjustmentPromises = activeStudents.map(async (student: any) => {
      try {
        // 학생 정보 조회
        const user = await User.findById(student.userId);
        if (!user || !user.studentInfo) {
          console.warn(`⚠️ 학생 정보 없음: ${student.userId}`);
          return null;
        }
        
        // 개인별 조정사항 생성
        const adjustment = await generatePersonalAdjustment(
          newProgram._id,
          user._id,
          resolvedGroupClassId,
          user,
          programData
        );
        
        console.log(`  ✓ ${user.name}: 조정사항 생성 완료`);
        return adjustment;
      } catch (error) {
        logError(`조정사항 생성 실패: ${student.userId}`, error);
        return null;
      }
    });
    
    const adjustments = await Promise.all(adjustmentPromises);
    const successCount = adjustments.filter(a => a !== null).length;
    
    console.log(`🎯 개인별 조정사항 생성 완료: ${successCount}/${activeStudents.length}명`);
    
    return res.json({
      success: true,
      message: `단체반 프로그램 생성 완료! (${successCount}/${activeStudents.length}명의 개인별 조정사항 생성됨)`,
      data: {
        programId: newProgram._id,
        groupClassName: resolvedClassName,
        studentCount: activeStudents.length,
        adjustmentCount: successCount,
        usedFallbackCourse: Boolean(fallbackCourse)
      }
    });
    
  } catch (error: any) {
    logError('단체반 프로그램 생성 실패', error);
    return res.status(500).json({
      success: false,
      message: '단체반 프로그램 생성에 실패했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/group-programs/:groupClassId
 * 특정 단체반의 프로그램 목록 조회
 */
router.get('/:groupClassId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { groupClassId } = req.params;
    
    const programs = await SwimProgram.find({
      groupClassId,
      programScope: 'group'
    }).sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      data: {
        programs,
        total: programs.length
      }
    });
    
  } catch (error: any) {
    logError('단체반 프로그램 조회 실패', error);
    return res.status(500).json({
      success: false,
      message: '프로그램 목록 조회에 실패했습니다.'
    });
  }
});

/**
 * GET /api/group-programs/:programId/my-adjustment
 * 내 개인별 조정사항 조회 (회원용)
 */
router.get('/:programId/my-adjustment', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { programId } = req.params;
    const userId = (req as any).user._id;
    
    // 공통 프로그램 조회
    const program = await SwimProgram.findById(programId);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: '프로그램을 찾을 수 없습니다.'
      });
    }
    
    // 개인별 조정사항 조회
    const adjustment = await PersonalProgramAdjustment.findOne({
      programId,
      userId
    });
    
    // 조회 기록 업데이트
    if (adjustment && !adjustment.viewedByMember) {
      adjustment.viewedByMember = true;
      adjustment.viewedAt = new Date();
      await adjustment.save();
    }
    
    return res.json({
      success: true,
      data: {
        program,
        adjustment
      }
    });
    
  } catch (error: any) {
    logError('개인별 조정사항 조회 실패', error);
    return res.status(500).json({
      success: false,
      message: '조정사항 조회에 실패했습니다.'
    });
  }
});

/**
 * 개인별 조정사항 생성 헬퍼 함수
 */
async function generatePersonalAdjustment(
  programId: any,
  userId: any,
  groupClassId: any,
  user: any,
  programData: any
) {
  const healthProfile = user.studentInfo?.healthProfile || {};
  const swimmingProfile = user.studentInfo?.swimmingProfile || {};
  
  // 질환 및 컨디션 수집
  const healthConditions = [
    ...(healthProfile.chronicConditions || []),
    ...(healthProfile.allergies || [])
  ];
  const conditionIds = swimmingProfile.conditionIds || [];
  
  // 페이스 조정 계산
  let globalPaceAdjustment = 0;
  let globalPaceReason = '';
  const warnings: any[] = [];
  const avoidStrokes: string[] = [];
  const avoidDrills: string[] = [];
  const avoidEquipment: string[] = [];
  
  // 질환별 조정사항 적용
  if (healthConditions.includes('shoulder_impingement') || healthConditions.includes('rotator_cuff')) {
    globalPaceAdjustment += 3; // 3% 느리게
    globalPaceReason = '어깨 질환으로 인한 페이스 조정';
    avoidStrokes.push('butterfly');
    avoidEquipment.push('paddles', 'large_paddles');
    warnings.push({
      type: 'health',
      severity: 'warning',
      message: '⚠️ 어깨에 무리가 가지 않도록 팔 동작 범위를 축소하세요. 통증이 느껴지면 즉시 중단하세요.',
      relatedCondition: 'shoulder_impingement'
    });
  }
  
  if (healthConditions.includes('knee_pain') || healthConditions.includes('patellofemoral_pain')) {
    avoidStrokes.push('breaststroke');
    warnings.push({
      type: 'health',
      severity: 'warning',
      message: '⚠️ 무릎 통증: 평영 동작을 피하고, 킥보드 대신 풀부이를 사용하세요.',
      relatedCondition: 'knee_pain'
    });
  }
  
  if (healthConditions.includes('asthma') || healthConditions.includes('chlorine_sensitivity')) {
    globalPaceAdjustment += 5; // 5% 느리게
    globalPaceReason = globalPaceReason 
      ? `${globalPaceReason}, 호흡기 질환으로 인한 추가 조정`
      : '호흡기 질환으로 인한 페이스 조정';
    avoidDrills.push('hypoxic', 'underwater', 'breath_control');
    warnings.push({
      type: 'health',
      severity: 'critical',
      message: '🚨 호흡기 주의: 고강도 세트는 건너뛰고, 충분한 휴식을 취하세요. 호흡 곤란 시 즉시 중단하세요.',
      relatedCondition: 'asthma'
    });
  }
  
  // 컨디션별 조정
  if (conditionIds.includes('피곤함') || conditionIds.includes('매우 피곤함')) {
    globalPaceAdjustment += 5;
    globalPaceReason = globalPaceReason 
      ? `${globalPaceReason}, 피로도 고려`
      : '피로도를 고려한 페이스 조정';
    warnings.push({
      type: 'condition',
      severity: 'info',
      message: '💡 오늘은 피곤한 상태입니다. 무리하지 말고 여유있게 진행하세요.',
      relatedCondition: 'fatigue'
    });
  }
  
  // 세션별 조정사항 생성
  const sessionAdjustments = programData.content.sessions.map((session: any) => ({
    sessionDate: session.date || '',
    dayOfWeek: session.day,
    paceAdjustment: globalPaceAdjustment,
    restAdjustment: healthConditions.length > 0 ? 10 : 0, // 질환 있으면 휴식 10초 추가
    skipBlocks: [],
    modifiedBlocks: [],
    notes: `${user.name}님을 위한 맞춤 조정: ${globalPaceReason || '기본 프로그램 유지'}`
  }));
  
  // 조정사항 저장
  const adjustment = new PersonalProgramAdjustment({
    programId,
    userId,
    groupClassId,
    adjustments: {
      globalPaceAdjustment,
      globalPaceReason,
      avoidStrokes,
      avoidDrills,
      avoidEquipment,
      warnings,
      sessionAdjustments
    },
    generatedBy: {
      conditionIds,
      healthConditions,
      currentCondition: 'normal',
      generatedAt: new Date()
    }
  });
  
  await adjustment.save();
  return adjustment;
}

export default router;

