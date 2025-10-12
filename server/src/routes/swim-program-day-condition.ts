/**
 * 🌤️ SwimLab - 당일 컨디션 입력 API
 * 
 * 📋 **API 목적**
 * - 운동 시작 전 당일 컨디션 입력
 * - 강사 또는 회원 본인이 입력 가능
 * - 컨디션에 따라 프로그램 자동 조절 (선택사항)
 * 
 * 🔄 **연동되는 데이터**
 * - SwimProgram 모델 (프로그램 정보)
 * - User 모델 (입력자 정보)
 * 
 * 🔐 **권한**
 * - 회원 본인: 자신의 프로그램에만 입력 가능
 * - 강사: 담당 회원의 프로그램에 입력 가능
 * - 센터 관리자: 센터 내 모든 회원 입력 가능
 */

import express from 'express';
import SwimProgram from '../models/SwimProgram';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

/**
 * POST /api/swim-programs/:programId/sessions/:sessionIdx/day-condition
 * 당일 컨디션 입력
 */
router.post('/:programId/sessions/:sessionIdx/day-condition', authMiddleware, async (req, res) => {
  try {
    const { programId, sessionIdx } = req.params;
    const { condition, hasPain, painLocation, sleepQuality, stressLevel } = req.body;
    const currentUserId = (req as any).userId;

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: '인증이 필요합니다.' });
    }

    // 프로그램 조회
    const program = await SwimProgram.findById(programId);
    if (!program) {
      return res.status(404).json({ success: false, message: '프로그램을 찾을 수 없습니다.' });
    }

    const sessionIndex = parseInt(sessionIdx);
    if (isNaN(sessionIndex) || sessionIndex < 0) {
      return res.status(400).json({ success: false, message: '잘못된 세션 인덱스입니다.' });
    }

    // 권한 확인
    const canEdit = await canEditDayCondition(currentUserId, program);
    if (!canEdit) {
      return res.status(403).json({ success: false, message: '당일 컨디션을 입력할 권한이 없습니다.' });
    }

    // 입력자 역할 확인
    const currentUser = await User.findById(currentUserId);
    const isInstructor = (currentUser as any)?.userType === 'instructor' || 
                         (currentUser as any)?.userType === 'centerAdmin';
    const inputByRole = isInstructor ? 'instructor' : 'self';

    // 세션 업데이트
    if (!program.content.sessions[sessionIndex]) {
      return res.status(404).json({ success: false, message: '세션을 찾을 수 없습니다.' });
    }

    (program.content.sessions[sessionIndex] as any).dayCondition = {
      condition,
      hasPain,
      painLocation,
      sleepQuality,
      stressLevel,
      inputBy: currentUserId as any,
      inputByRole,
      inputAt: new Date()
    };

    await program.save();

    res.json({
      success: true,
      message: '당일 컨디션이 저장되었습니다.',
      data: {
        sessionIdx: sessionIndex,
        dayCondition: (program.content.sessions[sessionIndex] as any).dayCondition
      }
    });
  } catch (error: any) {
    console.error('당일 컨디션 저장 오류:', error);
    res.status(500).json({ 
      success: false, 
      message: '당일 컨디션 저장에 실패했습니다.', 
      error: error.message 
    });
  }
});

/**
 * 당일 컨디션 입력 권한 확인
 */
async function canEditDayCondition(currentUserId: string, program: any): Promise<boolean> {
  // 1. 본인의 프로그램
  if (program.athleteId && program.athleteId.toString() === currentUserId) {
    return true;
  }

  // 2. 단체반의 멤버
  if (program.groupClassId) {
    const currentUser = await User.findById(currentUserId);
    if (currentUser && (currentUser as any).studentInfo?.assignedGroups) {
      const assignedGroups = (currentUser as any).studentInfo.assignedGroups;
      for (const group of assignedGroups) {
        if (group.groupClass && group.groupClass.toString() === program.groupClassId.toString()) {
          return true;
        }
      }
    }
  }

  // 3. 강사 (담당 회원)
  const targetUserId = program.athleteId?.toString();
  if (targetUserId) {
    const member = await User.findById(targetUserId);
    if (member && (member as any).studentInfo?.assignedInstructors) {
      const instructors = (member as any).studentInfo.assignedInstructors;
      if (instructors.some((inst: any) => inst.instructor?.toString() === currentUserId)) {
        return true;
      }
    }

    // 그룹 강사
    if (member && (member as any).assignedGroups) {
      for (const group of (member as any).assignedGroups) {
        if (group.instructor && group.instructor.toString() === currentUserId) {
          return true;
        }
      }
    }
  }

  // 4. 강사 또는 센터 관리자 (추가 권한)
  const currentUser = await User.findById(currentUserId);
  if (currentUser && ((currentUser as any).userType === 'instructor' || (currentUser as any).userType === 'centerAdmin')) {
    return true;
  }

  return false;
}

export default router;

