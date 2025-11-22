/**
 * 🏊‍♂️ SwimLab - 통합 프로그램 생성 라우트
 * 
 * 📋 **주요 기능**
 * - 개인 PT와 단체반을 동일한 방식으로 처리
 * - 단체반 선택 시 자동으로 전체 회원에게 프로그램 배포
 * - 개인별 질환/컨디션 기반 조정사항 자동 생성
 */

import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import SwimProgram from '../models/SwimProgram';
import { User } from '../models/User';
import { logInfo, logError, logWarn, logDebug } from '../utils/logger';
const GroupClass = require('../models/GroupClass').default;

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

/**
 * POST /api/unified-program/generate
 * 통합 프로그램 생성 (개인 PT + 단체반)
 */
router.post('/generate', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { athleteProfile, programData } = req.body;
    
    console.log('🚀 통합 프로그램 생성 요청:', athleteProfile.name);
    
    // 단체반인지 확인
    const isGroupClass = !!athleteProfile.groupClassId;
    
    if (isGroupClass) {
      console.log(`📚 단체반 프로그램: ${athleteProfile.groupClassName}`);
      
      // 단체반 정보 조회
      const groupClass = await GroupClass.findById(athleteProfile.groupClassId);
      if (!groupClass) {
        return res.status(404).json({
          success: false,
          message: '단체반을 찾을 수 없습니다.'
        });
      }
      
      // 공통 프로그램 생성
      const newProgram = new SwimProgram({
        groupClassId: groupClass._id,
        groupClassName: groupClass.className,
        centerId: groupClass.centerId,
        programType: programData.programType || 'weekly',
        programScope: 'group',
        params: programData.params,
        content: programData.content,
        usedMethodIds: programData.usedMethodIds || []
      });
      
      await newProgram.save();
      console.log(`✅ 단체반 공통 프로그램 생성: ${newProgram._id}`);
      
      // 각 회원에게 개인별 조정사항 생성
      const activeStudents = groupClass.students.filter((s: any) => s.status === 'active');
      let adjustmentCount = 0;
      
      for (const student of activeStudents) {
        try {
          const user = await User.findById(student.userId);
          if (!user) continue;
          
          // 개인별 조정사항 생성
          await generatePersonalAdjustment(
            newProgram._id,
            user._id,
            groupClass._id,
            user,
            programData
          );
          
          adjustmentCount++;
          console.log(`  ✓ ${user.name}: 조정사항 생성`);
        } catch (error) {
          logError(`조정사항 생성 실패: ${student.userId}`, error);
        }
      }
      
      return res.json({
        success: true,
        message: `단체반 프로그램 생성 완료! (${adjustmentCount}명)`,
        programId: newProgram._id,
        isGroupProgram: true,
        adjustmentCount
      });
      
    } else {
      console.log(`🏊 개인 PT 프로그램: ${athleteProfile.name}`);
      
      // 개인 프로그램 생성
      const newProgram = new SwimProgram({
        athleteId: programData.athleteId,
        athleteName: athleteProfile.name,
        centerId: programData.centerId,
        programType: programData.programType || 'weekly',
        programScope: 'individual',
        params: programData.params,
        content: programData.content,
        usedMethodIds: programData.usedMethodIds || []
      });
      
      await newProgram.save();
      console.log(`✅ 개인 프로그램 생성: ${newProgram._id}`);
      
      return res.json({
        success: true,
        message: '프로그램이 저장되었습니다.',
        programId: newProgram._id,
        isGroupProgram: false
      });
    }
    
  } catch (error: any) {
    logError('프로그램 생성 실패', error);
    return res.status(500).json({
      success: false,
      message: '프로그램 생성에 실패했습니다.',
      error: error.message
    });
  }
});

/**
 * 개인별 조정사항 생성 헬퍼
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
  
  const healthConditions = [
    ...(healthProfile.chronicConditions || []),
    ...(healthProfile.allergies || [])
  ];
  const conditionIds = swimmingProfile.conditionIds || [];
  
  let globalPaceAdjustment = 0;
  let globalPaceReason = '';
  const warnings: any[] = [];
  const avoidStrokes: string[] = [];
  const avoidDrills: string[] = [];
  const avoidEquipment: string[] = [];
  
  // 질환별 조정
  if (healthConditions.includes('shoulder_impingement') || healthConditions.includes('rotator_cuff')) {
    globalPaceAdjustment += 3;
    globalPaceReason = '어깨 질환';
    avoidStrokes.push('butterfly');
    avoidEquipment.push('paddles');
    warnings.push({
      type: 'health',
      severity: 'warning',
      message: '⚠️ 어깨에 무리가 가지 않도록 팔 동작 범위를 축소하세요.'
    });
  }
  
  if (healthConditions.includes('knee_pain') || healthConditions.includes('patellofemoral_pain')) {
    avoidStrokes.push('breaststroke');
    warnings.push({
      type: 'health',
      severity: 'warning',
      message: '⚠️ 무릎 통증: 평영을 피하고 풀부이를 사용하세요.'
    });
  }
  
  if (healthConditions.includes('asthma') || healthConditions.includes('chlorine_sensitivity')) {
    globalPaceAdjustment += 5;
    globalPaceReason = globalPaceReason ? `${globalPaceReason}, 호흡기 질환` : '호흡기 질환';
    avoidDrills.push('hypoxic', 'underwater');
    warnings.push({
      type: 'health',
      severity: 'critical',
      message: '🚨 호흡 곤란 시 즉시 중단하세요.'
    });
  }
  
  const sessionAdjustments = (programData.content.sessions || []).map((session: any) => ({
    sessionDate: session.date || '',
    dayOfWeek: session.day,
    paceAdjustment: globalPaceAdjustment,
    restAdjustment: healthConditions.length > 0 ? 10 : 0,
    skipBlocks: [],
    modifiedBlocks: [],
    notes: `${user.name}님 맞춤: ${globalPaceReason || '기본 유지'}`
  }));
  
  const PersonalProgramAdjustment = require('../models/PersonalProgramAdjustment').default;
  
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








