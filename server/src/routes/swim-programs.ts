/**
 * 🏊 SwimLab - 수영 프로그램 이력 API 라우트
 * 
 * 📋 **라우트 목적**
 * - 수영 프로그램 생성 및 저장
 * - 회원별 프로그램 조회
 * - 프로그램 실행 기록 업데이트 (당일 컨디션)
 * - 사용된 훈련법 이력 조회 (3주 연속 방지)
 * 
 * 🔄 **연동되는 모델**
 * - SwimProgram (프로그램 이력)
 * - User (회원 정보)
 * 
 * 💡 **주요 엔드포인트**
 * - POST /api/swim-programs - 프로그램 생성 및 저장
 * - GET /api/swim-programs/athlete/:athleteId - 회원별 프로그램 목록
 * - GET /api/swim-programs/:id - 프로그램 상세
 * - PATCH /api/swim-programs/:id/execution - 실행 기록 업데이트
 * - GET /api/swim-programs/athlete/:athleteId/history - 최근 3주 훈련법 이력
 */

import express from 'express';
import SwimProgram from '../models/SwimProgram';
import { authMiddleware } from '../middleware/auth';
import { User } from '../models/User';
import { generateProgramFromTeachingMethod, generateDefaultTechniqueProgram } from '../utils/teachingMethodToProgramConverter';
// 실제 수영 엔진 v3.1 사용
// import { generateAdvancedCSSProgram } from '../utils/advancedProgramGenerator';

const router = express.Router();

/**
 * POST /api/swim-programs
 * 프로그램 생성 및 저장
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      athleteId,
      athleteName,
      centerId,
      programType,
      programScope,
      groupClassId,
      groupClassName,
      params,
      content,
      usedMethodIds,
      useTeachingMethod // 강습법 기반 생성 플래그
    } = req.body;
    
    // 프로그램 생성 로직 분기 처리
    const user = await User.findById(athleteId);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    
    const currentLevel = user.studentInfo?.currentLevel || 'beginner';
    const rawCSS = user.studentInfo?.swimmingProfile?.css || {};
    const cssPer100: Record<string, number> = {};
    if (rawCSS.freestyle) cssPer100.freestyle = rawCSS.freestyle;
    if (rawCSS.backstroke) cssPer100.backstroke = rawCSS.backstroke;
    if (rawCSS.breaststroke) cssPer100.breaststroke = rawCSS.breaststroke;
    if (rawCSS.butterfly) cssPer100.butterfly = rawCSS.butterfly;
    const mainStrokes = user.studentInfo?.swimmingProfile?.mainStrokes || ['freestyle'];
    const excludedStrokes = user.studentInfo?.swimmingProfile?.excludedStrokes || [];
    const poolLength = user.studentInfo?.swimmingProfile?.poolLength || 25;
    const sessionDuration = user.studentInfo?.swimmingProfile?.sessionDuration || 60;
    const goal = params?.goal || '체력 향상';
    
    let generatedContent = null;
    
    // 상급/마스터 레벨이면서 CSS가 있는 경우 - 수영 엔진 v3.1 사용
    if (['advanced', 'advanced_1', 'advanced_2', 'master', 'expert'].includes(currentLevel)) {
      const hasCSS = Object.values(cssPer100).length > 0;
      
      if (hasCSS) {
        console.log('🎯 수영 엔진 v3.1을 사용한 고급 프로그램 생성 시작');
        
        // 수영 엔진 v3.1 입력 데이터 구성
        const engineInput = {
          weeklyMinutes: sessionDuration * 3, // 3일 기준
          weeklyMeters: 0, // 엔진이 자동 계산
          days: ['화요일', '목요일', '토요일'], // 3일
          goal: goal,
          mainStrokes: mainStrokes,
          excludedStrokes: excludedStrokes,
          css100: cssPer100,
          pool: poolLength,
          conditions: [], // 질환 정보 (추후 추가)
          weekHistory: [] // 이력 정보 (추후 추가)
        };
        
        // 클라이언트의 수영 엔진 v3.1 호출
        // TODO: 실제로는 클라이언트의 엔진을 서버에서 호출하거나
        // 서버에 동일한 로직을 구현해야 함
        console.log('⚠️ 수영 엔진 v3.1 호출 필요:', engineInput);
        
        // 임시로 기본 프로그램 생성
        generatedContent = generateDefaultTechniqueProgram(
          currentLevel,
          mainStrokes,
          poolLength,
          sessionDuration
        );
        console.log('✅ 임시 기본 프로그램 생성 완료:', generatedContent?.summary);
      }
    }
    
    // 강습법 기반 생성 (초급/중급이거나 CSS가 없는 경우)
    if (!generatedContent && useTeachingMethod === true) {
      const teachingProgress = user.studentInfo?.swimmingProfile?.teachingProgress || [];
      const preferredStrokes = user.studentInfo?.swimmingProfile?.preferredStrokes || ['freestyle'];
      
      console.log('📚 강습법 기반 프로그램 생성 시작');
      generatedContent = await generateProgramFromTeachingMethod(
        athleteId,
        teachingProgress,
        {
          currentLevel,
          preferredStrokes,
          poolLength,
          sessionDuration
        }
      );
      console.log('✅ 강습법 기반 프로그램 생성 완료:', generatedContent?.summary);
    }
    
    // 기본 프로그램 생성 (모든 경우 실패 시)
    if (!generatedContent) {
      console.log('🔧 기본 기술 프로그램 생성');
      generatedContent = generateDefaultTechniqueProgram(
        currentLevel,
        mainStrokes,
        poolLength,
        sessionDuration
      );
    }
    
    // content를 생성된 것으로 대체
    if (generatedContent) {
      Object.assign(content, generatedContent);
    }
    
    // 필수 필드 검증
    if (!athleteId || !athleteName || !params || !content) {
      return res.status(400).json({ 
        error: '필수 필드가 누락되었습니다.',
        required: ['athleteId', 'athleteName', 'params', 'content']
      });
    }
    
    const scope = programScope || (groupClassId ? 'group' : 'individual');

    const program = new SwimProgram({
      athleteId,
      athleteName,
      groupClassId,
      groupClassName,
      centerId,
      programType: programType || 'weekly',
      programScope: scope,
      params,
      content,
      usedMethodIds: usedMethodIds || [],
      executionHistory: []
    });
    
    await program.save();
    
    res.status(201).json({
      message: '프로그램이 저장되었습니다.',
      programId: program._id,
      usedMethodIds: program.usedMethodIds
    });
  } catch (error: any) {
    console.error('프로그램 저장 실패:', error);
    res.status(500).json({ error: '프로그램 저장에 실패했습니다.', details: error.message });
  }
});

/**
 * GET /api/swim-programs/athlete/:athleteId/history
 * 최근 3주 훈련법 이력 조회
 * ⚠️ 이 라우트는 /athlete/:athleteId 보다 먼저 정의되어야 함!
 */
router.get('/athlete/:athleteId/history', authMiddleware, async (req, res) => {
  try {
    const { athleteId } = req.params;
    
    // 최근 3주간 프로그램 조회
    const threeWeeksAgo = new Date();
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    
    const programs = await SwimProgram.find({ 
      athleteId,
      createdAt: { $gte: threeWeeksAgo }
    })
      .sort({ createdAt: -1 })
      .select('usedMethodIds params.startDate')
      .limit(3);
    
    // 사용된 훈련법 ID 추출
    const usedMethodIds = programs.flatMap(p => p.usedMethodIds);
    const uniqueMethodIds = [...new Set(usedMethodIds)];
    
    res.json({
      weekHistory: uniqueMethodIds,
      recentPrograms: programs.map(p => ({
        id: p._id,
        startDate: p.params.startDate,
        methodIds: p.usedMethodIds
      }))
    });
  } catch (error: any) {
    console.error('이력 조회 실패:', error);
    res.status(500).json({ error: '이력 조회에 실패했습니다.', details: error.message });
  }
});

/**
 * GET /api/swim-programs/all
 * 모든 프로그램 조회 (센터별 또는 전체)
 */
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const { limit = 100, search } = req.query;
    
    let query: any = {};
    
    // 센터 관리자는 해당 센터 프로그램만
    if (currentUser.userType === 'centerAdmin' && currentUser.centerId) {
      query.centerId = currentUser.centerId;
    }
    // superAdmin은 모든 프로그램 조회 가능
    
    // 검색어가 있으면 회원 이름으로 필터링
    if (search && typeof search === 'string') {
      query.athleteName = { $regex: search, $options: 'i' };
    }
    
    const programs = await SwimProgram.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('-__v');
    
    res.json({
      count: programs.length,
      programs
    });
  } catch (error: any) {
    console.error('전체 프로그램 조회 실패:', error);
    res.status(500).json({ error: '프로그램 조회에 실패했습니다.', details: error.message });
  }
});

/**
 * GET /api/swim-programs/athlete/:athleteId
 * 회원별 프로그램 목록 조회
 */
router.get('/athlete/:athleteId', authMiddleware, async (req, res) => {
  try {
    const { athleteId } = req.params;
    const { limit = 10 } = req.query;
    
    const programs = await SwimProgram.find({ athleteId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('-__v');
    
    res.json({
      count: programs.length,
      programs
    });
  } catch (error: any) {
    console.error('프로그램 조회 실패:', error);
    res.status(500).json({ error: '프로그램 조회에 실패했습니다.', details: error.message });
  }
});

/**
 * GET /api/swim-programs/:id
 * 프로그램 상세 조회
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const program = await SwimProgram.findById(id).select('-__v');
    
    if (!program) {
      return res.status(404).json({ error: '프로그램을 찾을 수 없습니다.' });
    }
    
    res.json(program);
  } catch (error: any) {
    console.error('프로그램 조회 실패:', error);
    res.status(500).json({ error: '프로그램 조회에 실패했습니다.', details: error.message });
  }
});

/**
 * PATCH /api/swim-programs/:id/execution
 * 프로그램 실행 기록 업데이트 (당일 컨디션 입력)
 */
router.patch('/:id/execution', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      dayOfWeek,
      condition,
      hasPain,
      adjustedPace,
      adjustedRest,
      notes,
      completed,
      rpe
    } = req.body;

    // 필수 값 검증 (날짜/요일 필수, 컨디션 미입력 시 기본값 사용)
    if (!date || !dayOfWeek) {
      return res.status(400).json({ 
        error: '필수 필드가 누락되었습니다.',
        required: ['date', 'dayOfWeek']
      });
    }
    
    const program = await SwimProgram.findById(id);
    
    if (!program) {
      return res.status(404).json({ error: '프로그램을 찾을 수 없습니다.' });
    }
    
    // 기존 실행 기록이 있는지 확인
    const existingIndex = program.executionHistory.findIndex(
      h => h.date === date && h.dayOfWeek === dayOfWeek
    );
    
    const executionRecord = {
      date,
      dayOfWeek,
      condition: condition || 'normal',
      hasPain: hasPain || false,
      rpe: typeof rpe === 'number' ? rpe : undefined,
      adjustedPace,
      adjustedRest,
      notes,
      completed: completed || false
    };
    
    if (existingIndex >= 0) {
      // 업데이트
      program.executionHistory[existingIndex] = executionRecord as any;
    } else {
      // 추가
      program.executionHistory.push(executionRecord as any);
    }
    
    await program.save();
    
    res.json({
      message: '실행 기록이 업데이트되었습니다.',
      executionHistory: program.executionHistory
    });
  } catch (error: any) {
    console.error('실행 기록 업데이트 실패:', error);
    res.status(500).json({ error: '실행 기록 업데이트에 실패했습니다.', details: error.message });
  }
});

/**
 * DELETE /api/swim-programs/:id
 * 프로그램 삭제
 */
// PUT /api/swim-programs/:id - 프로그램 수정
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { content, params } = req.body;
    
    console.log(`✏️ 프로그램 수정 요청: ${id}`);
    
    const program = await SwimProgram.findById(id);
    
    if (!program) {
      console.log(`❌ 프로그램 없음: ${id}`);
      return res.status(404).json({ success: false, error: '프로그램을 찾을 수 없습니다.' });
    }
    
    // content 업데이트
    if (content) {
      program.content = content;
    }
    
    // params 업데이트
    if (params) {
      program.params = { ...program.params, ...params };
    }
    
    await program.save();
    
    console.log(`✅ 프로그램 수정 성공: ${id}`);
    res.json({ 
      success: true, 
      message: '프로그램이 수정되었습니다.',
      data: program 
    });
  } catch (error: any) {
    console.error('프로그램 수정 실패:', error);
    res.status(500).json({ success: false, error: '프로그램 수정에 실패했습니다.', details: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ 프로그램 삭제 요청: ${id}`);
    
    const result = await SwimProgram.findByIdAndDelete(id);
    
    if (!result) {
      console.log(`❌ 프로그램 없음: ${id}`);
      return res.status(404).json({ success: false, error: '프로그램을 찾을 수 없습니다.' });
    }
    
    console.log(`✅ 프로그램 삭제 성공: ${id}`);
    res.json({ success: true, message: '프로그램이 삭제되었습니다.' });
  } catch (error: any) {
    console.error('프로그램 삭제 실패:', error);
    res.status(500).json({ success: false, error: '프로그램 삭제에 실패했습니다.', details: error.message });
  }
});

export default router;

