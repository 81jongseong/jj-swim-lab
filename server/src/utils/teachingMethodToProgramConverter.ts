/**
 * 🎓 JJ Swim Lab - 강습법 → 프로그램 변환 유틸리티
 * 
 * 📋 **유틸리티 목적**
 * - 회원의 강습법 체크리스트 진행 상황을 기반으로 실제 훈련 프로그램 생성
 * - TeachingMethod의 단계(steps)를 수영 세트로 변환
 * - 레벨별 난이도 조정 및 개인화
 * 
 * 🔄 **주요 기능**
 * 1. 다음 연습할 강습법 단계 추천
 * 2. 강습법 단계 → 워밍업/메인/쿨다운 세트 변환
 * 3. 레벨별 거리/반복 횟수 조정
 * 4. 드릴 자동 선택 및 배치
 * 
 * 🗄️ **데이터 연동**
 * - User.swimmingProfile.teachingProgress
 * - TeachingMethod (강습법 정보)
 * - SwimDrill (드릴 정보)
 * 
 * 🛠️ **필요한 설치 파일**
 * - Mongoose 7.8.7
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 초급자는 기술 중심, 상급자는 거리/강도 중심
 * 2. 드릴은 강습법 단계에 맞게 선택
 * 3. 풀 길이에 따라 거리 조정
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-01-07
 * - 상태: ✅ 완성
 */

import mongoose from 'mongoose';

// Models - default export 아님
const TeachingMethod = require('../models/TeachingMethod').default;

/**
 * 레벨별 기본 거리 설정 (미터)
 */
const LEVEL_DISTANCES = {
  beginner: {
    warmup: 200,
    main: 400,
    cooldown: 100,
    totalTarget: 1000
  },
  intermediate: {
    warmup: 300,
    main: 800,
    cooldown: 200,
    totalTarget: 1500
  },
  advanced: {
    warmup: 400,
    main: 1400,
    cooldown: 200,
    totalTarget: 2500
  },
  master: {
    warmup: 500,
    main: 2000,
    cooldown: 300,
    totalTarget: 3000
  }
};

/**
 * 강습법 진행 상황 기반 다음 단계 추천
 */
export async function getNextTeachingStep(
  userId: mongoose.Types.ObjectId,
  teachingProgress: any[],
  preferredStrokes: string[] = ['freestyle'],
  currentLevel: string = 'beginner'
): Promise<{
  methodId: mongoose.Types.ObjectId;
  methodName: string;
  stroke: string;
  nextStep: any;
  completionRate: number;
} | null> {
  try {
    // 1. 진행 중인 강습법 찾기 (완료율 < 100%)
    const inProgress = teachingProgress.filter((p: any) => p.completionRate < 100);

    // 2. 선호 영법 중 진행 중인 것 우선
    const preferredInProgress = inProgress.filter((p: any) =>
      preferredStrokes.includes(p.stroke)
    );

    let targetProgress = null;
    if (preferredInProgress.length > 0) {
      // 완료율이 가장 낮은 것 선택
      targetProgress = preferredInProgress.sort((a: any, b: any) => a.completionRate - b.completionRate)[0];
    } else if (inProgress.length > 0) {
      targetProgress = inProgress[0];
    }

    // 3. 진행 중인 게 없으면 새로운 강습법 찾기
    if (!targetProgress) {
      const completedMethodIds = teachingProgress.map((p: any) => p.methodId.toString());
      
      const newMethod = await TeachingMethod.findOne({
        _id: { $nin: completedMethodIds },
        targetLevel: { $in: [currentLevel, 'all'] },
        stroke: { $in: preferredStrokes },
        isActive: true
      }).sort({ order: 1 });

      if (!newMethod) {
        console.log('추천할 강습법이 없습니다.');
        return null;
      }

      return {
        methodId: newMethod._id as mongoose.Types.ObjectId,
        methodName: newMethod.name,
        stroke: newMethod.stroke,
        nextStep: newMethod.steps[0],
        completionRate: 0
      };
    }

    // 4. 진행 중인 강습법의 다음 단계 찾기
    const method = await TeachingMethod.findById(targetProgress.methodId);
    if (!method) {
      console.log('강습법을 찾을 수 없습니다:', targetProgress.methodId);
      return null;
    }

    const completedSteps = targetProgress.completedSteps || [];
    const nextStep = method.steps.find((step: any) => !completedSteps.includes(step.id || step._id?.toString()));

    if (!nextStep) {
      console.log('모든 단계가 완료되었습니다:', method.name);
      return null;
    }

    return {
      methodId: method._id as mongoose.Types.ObjectId,
      methodName: method.name,
      stroke: method.stroke,
      nextStep,
      completionRate: targetProgress.completionRate
    };
  } catch (error: any) {
    console.error('다음 단계 추천 실패:', error);
    return null;
  }
}

/**
 * 강습법 단계 → 훈련 세트 변환
 */
export function convertTeachingStepToTrainingSet(
  step: any,
  stroke: string,
  level: string,
  poolLength: number = 25
): any {
  const distances = LEVEL_DISTANCES[level as keyof typeof LEVEL_DISTANCES] || LEVEL_DISTANCES.beginner;

  // 단계 설명에서 반복 횟수나 거리 추출 (간단한 예시)
  const description = step.description || '';
  const hasDistance = description.match(/(\d+)m/);
  const hasReps = description.match(/(\d+)회/);

  let distance = hasDistance ? parseInt(hasDistance[1]) : poolLength * 4;
  let reps = hasReps ? parseInt(hasReps[1]) : 4;

  // 레벨별 조정
  if (level === 'beginner') {
    distance = Math.min(distance, poolLength * 4);
    reps = Math.min(reps, 4);
  } else if (level === 'intermediate') {
    distance = Math.min(distance, poolLength * 8);
    reps = Math.min(reps, 6);
  } else if (level === 'advanced') {
    distance = Math.min(distance, poolLength * 16);
    reps = Math.min(reps, 8);
  } else {
    distance = Math.min(distance, poolLength * 20);
    reps = Math.min(reps, 10);
  }

  return {
    type: 'drill',
    distance,
    reps,
    stroke,
    intensity: level === 'beginner' || level === 'intermediate' ? 'easy' : 'moderate',
    pace: 'technique-focus',
    rest: level === 'beginner' ? 30 : (level === 'intermediate' ? 20 : 15),
    description: step.name || '기술 연습',
    focusPoints: step.focusPoints || [step.description],
    equipment: step.equipment || []
  };
}

/**
 * 강습법 기반 전체 프로그램 생성
 */
export async function generateProgramFromTeachingMethod(
  userId: mongoose.Types.ObjectId,
  teachingProgress: any[],
  memberData: {
    currentLevel: string;
    preferredStrokes: string[];
    poolLength: number;
    sessionDuration: number;
  }
): Promise<{
  summary: string;
  planExplanation: string;
  totalDuration: number;
  totalMeters: number;
  blocks: any[];
} | null> {
  try {
    const { currentLevel, preferredStrokes, poolLength, sessionDuration } = memberData;

    // 1. 다음 연습할 단계 추천
    const nextRecommendation = await getNextTeachingStep(
      userId,
      teachingProgress,
      preferredStrokes,
      currentLevel
    );

    if (!nextRecommendation) {
      console.log('추천할 강습법이 없습니다. 기본 프로그램을 생성합니다.');
      return null;
    }

    const distances = LEVEL_DISTANCES[currentLevel as keyof typeof LEVEL_DISTANCES] || LEVEL_DISTANCES.beginner;

    // 2. 워밍업 (자유형 위주)
    const warmup = {
      type: 'warmup' as const,
      distance: distances.warmup,
      reps: 1,
      stroke: 'freestyle',
      intensity: 'easy' as const,
      pace: 'comfortable',
      rest: 0,
      description: '워밍업 - 편안한 자유형',
      focusPoints: ['호흡 안정화', '스트로크 체크'],
      equipment: []
    };

    // 3. 메인 세트 (강습법 단계 기반)
    const mainSet = convertTeachingStepToTrainingSet(
      nextRecommendation.nextStep,
      nextRecommendation.stroke,
      currentLevel,
      poolLength
    );

    // 4. 쿨다운
    const cooldown = {
      type: 'cooldown' as const,
      distance: distances.cooldown,
      reps: 1,
      stroke: 'freestyle',
      intensity: 'easy' as const,
      pace: 'recovery',
      rest: 0,
      description: '쿨다운 - 가벼운 수영',
      focusPoints: ['근육 이완', '호흡 회복'],
      equipment: []
    };

    const totalMeters = warmup.distance + (mainSet.distance * mainSet.reps) + cooldown.distance;

    return {
      summary: `${nextRecommendation.methodName} - ${nextRecommendation.nextStep.name}`,
      planExplanation: `${currentLevel.toUpperCase()} 레벨 회원을 위한 ${nextRecommendation.methodName} 훈련입니다. 현재 진행률: ${nextRecommendation.completionRate}%. 이번 세션에서는 "${nextRecommendation.nextStep.name}" 단계를 중점적으로 연습합니다.`,
      totalDuration: sessionDuration,
      totalMeters,
      blocks: [
        {
          name: '워밍업',
          sets: [warmup]
        },
        {
          name: `메인 세트 - ${nextRecommendation.nextStep.name}`,
          sets: [mainSet]
        },
        {
          name: '쿨다운',
          sets: [cooldown]
        }
      ]
    };
  } catch (error: any) {
    console.error('강습법 기반 프로그램 생성 실패:', error);
    return null;
  }
}

/**
 * 기본 기술 프로그램 생성 (강습법 진행 상황이 없을 때)
 */
export function generateDefaultTechniqueProgram(
  currentLevel: string,
  mainStrokes: string[] = ['freestyle'],
  poolLength: number = 25,
  sessionDuration: number = 60
): {
  summary: string;
  planExplanation: string;
  totalDuration: number;
  totalMeters: number;
  blocks: any[];
} {
  const distances = LEVEL_DISTANCES[currentLevel as keyof typeof LEVEL_DISTANCES] || LEVEL_DISTANCES.beginner;
  const primaryStroke = mainStrokes[0] || 'freestyle';

  const warmup = {
    type: 'warmup' as const,
    distance: distances.warmup,
    reps: 1,
    stroke: 'freestyle',
    intensity: 'easy' as const,
    pace: 'comfortable',
    rest: 0,
    description: '워밍업 - 편안한 자유형',
    focusPoints: ['호흡 안정화', '스트로크 체크'],
    equipment: []
  };

  const mainSet = {
    type: 'drill' as const,
    distance: poolLength * 4,
    reps: Math.ceil(distances.main / (poolLength * 4)),
    stroke: primaryStroke,
    intensity: currentLevel === 'beginner' || currentLevel === 'intermediate' ? 'easy' : 'moderate',
    pace: 'technique-focus',
    rest: currentLevel === 'beginner' ? 30 : (currentLevel === 'intermediate' ? 20 : 15),
    description: `${primaryStroke} 기본 기술 연습`,
    focusPoints: ['스트로크 정확도', '자세 교정', '리듬 유지'],
    equipment: []
  };

  const cooldown = {
    type: 'cooldown' as const,
    distance: distances.cooldown,
    reps: 1,
    stroke: 'freestyle',
    intensity: 'easy' as const,
    pace: 'recovery',
    rest: 0,
    description: '쿨다운 - 가벼운 수영',
    focusPoints: ['근육 이완', '호흡 회복'],
    equipment: []
  };

  const totalMeters = warmup.distance + (mainSet.distance * mainSet.reps) + cooldown.distance;

  return {
    summary: `${currentLevel.toUpperCase()} 레벨 기본 기술 훈련`,
    planExplanation: `${currentLevel.toUpperCase()} 레벨 회원을 위한 ${primaryStroke} 기본 기술 훈련 프로그램입니다. 정확한 자세와 기술 습득에 중점을 둡니다.`,
    totalDuration: sessionDuration,
    totalMeters,
    blocks: [
      {
        name: '워밍업',
        sets: [warmup]
      },
      {
        name: `메인 세트 - ${primaryStroke} 기술 연습`,
        sets: [mainSet]
      },
      {
        name: '쿨다운',
        sets: [cooldown]
      }
    ]
  };
}

