/**
 * 🏊‍♂️ JJ Swim Lab - 진행률 추적 및 조정 로직
 * 
 * 📋 **기능:**
 * - 성취율·RPE 기반 자동 증감
 * - 주간 진행률 추적
 * - 다음 주 계획 조정
 * - 개인별 맞춤 조정
 */

import { 
  WeekPlan, 
  ProgressionData, 
  UserInput, 
  Zone, 
  SessionSet 
} from './types';
import { buildWeek } from './planner';
import { adjustPaceByRPE } from './pace';

/**
 * 다음 주 계획 조정
 */
export function nextProgression(
  currentPlan: WeekPlan,
  progressionData: ProgressionData,
  userInput: UserInput
): WeekPlan {
  const { completionRate, averageRPE, notes } = progressionData;
  
  // 성취율 기반 조정
  let adjustmentFactor = 1.0;
  
  if (completionRate >= 0.9) {
    // 90% 이상 완료 시 5-10% 증가
    adjustmentFactor = 1.05 + (completionRate - 0.9) * 0.5;
  } else if (completionRate >= 0.7) {
    // 70-90% 완료 시 유지
    adjustmentFactor = 1.0;
  } else if (completionRate >= 0.5) {
    // 50-70% 완료 시 5-10% 감소
    adjustmentFactor = 0.95 - (0.7 - completionRate) * 0.5;
  } else {
    // 50% 미만 완료 시 15-20% 감소
    adjustmentFactor = 0.8 - (0.5 - completionRate) * 0.5;
  }
  
  // RPE 기반 조정
  if (averageRPE >= 8) {
    // RPE 8 이상 시 강도 감소
    adjustmentFactor *= 0.9;
  } else if (averageRPE <= 5) {
    // RPE 5 이하 시 강도 증가
    adjustmentFactor *= 1.1;
  }
  
  // 조정된 입력으로 새 계획 생성
  const adjustedInput = adjustUserInput(userInput, adjustmentFactor);
  const newPlan = buildWeek(adjustedInput);
  
  return newPlan;
}

/**
 * 사용자 입력 조정
 */
function adjustUserInput(userInput: UserInput, adjustmentFactor: number): UserInput {
  const adjustedInput = { ...userInput };
  
  // 세션 시간 조정
  adjustedInput.avail.sessionMinutes = Math.round(
    userInput.avail.sessionMinutes * adjustmentFactor
  );
  
  // 페이스 조정 (RPE 기반)
  if (userInput.pace.cssSecPer100) {
    // adjustPaceByRPE는 pace.ts에서 2개 인자만 받음
    adjustedInput.pace.cssSecPer100 = adjustPaceByRPE(
      userInput.pace.cssSecPer100,
      7  // 실제 RPE
    );
  }
  
  return adjustedInput;
}

/**
 * 주간 진행률 계산
 */
export function calculateWeeklyProgress(
  plannedSessions: SessionSet[],
  completedSessions: SessionSet[]
): {
  completionRate: number;
  averageRPE: number;
  notes: string[];
} {
  const totalPlannedMeters = plannedSessions.reduce(
    (sum, session) => sum + (session.reps * session.distance), 
    0
  );
  
  const totalCompletedMeters = completedSessions.reduce(
    (sum, session) => sum + (session.reps * session.distance), 
    0
  );
  
  const completionRate = totalPlannedMeters > 0 
    ? totalCompletedMeters / totalPlannedMeters 
    : 0;
  
  // RPE 계산 (예시 - 실제로는 사용자 입력 필요)
  const averageRPE = calculateAverageRPE(completedSessions);
  
  // 진행률 기반 노트 생성
  const notes = generateProgressNotes(completionRate, averageRPE);
  
  return {
    completionRate,
    averageRPE,
    notes
  };
}

/**
 * 평균 RPE 계산
 */
function calculateAverageRPE(completedSessions: SessionSet[]): number {
  // 실제로는 사용자 입력을 받아야 하지만, 여기서는 예시값 사용
  const rpeValues = completedSessions.map(() => {
    // 실제 구현에서는 사용자 입력 RPE 사용
    return Math.random() * 4 + 4; // 4-8 범위의 랜덤값
  });
  
  return rpeValues.length > 0 
    ? rpeValues.reduce((sum, rpe) => sum + rpe, 0) / rpeValues.length
    : 6; // 기본값
}

/**
 * 진행률 기반 노트 생성
 */
function generateProgressNotes(completionRate: number, averageRPE: number): string[] {
  const notes: string[] = [];
  
  if (completionRate >= 0.9) {
    notes.push('우수한 완료율! 다음 주 거리를 5-10% 증가시킬 수 있습니다.');
  } else if (completionRate >= 0.7) {
    notes.push('양호한 완료율입니다. 현재 수준을 유지하세요.');
  } else if (completionRate >= 0.5) {
    notes.push('완료율이 낮습니다. 거리를 5-10% 감소시키는 것을 권장합니다.');
  } else {
    notes.push('완료율이 매우 낮습니다. 거리를 15-20% 감소시키고 의료진과 상담하세요.');
  }
  
  if (averageRPE >= 8) {
    notes.push('RPE가 높습니다. 강도를 낮추고 충분한 회복을 취하세요.');
  } else if (averageRPE <= 5) {
    notes.push('RPE가 낮습니다. 강도를 높일 수 있습니다.');
  }
  
  return notes;
}

/**
 * 개인별 맞춤 조정
 */
export function personalizePlan(
  basePlan: WeekPlan,
  userProfile: {
    experience: 'beginner' | 'intermediate' | 'advanced';
    age: number;
    health: any;
    preferences: string[];
  }
): WeekPlan {
  const personalizedPlan = { ...basePlan };
  
  // 경험 수준별 조정
  switch (userProfile.experience) {
    case 'beginner':
      // 초급자: 거리 감소, 회복 시간 증가
      personalizedPlan.sessions.forEach(session => {
        session.totalMeters = Math.round(session.totalMeters * 0.8);
        session.sets.forEach(set => {
          if (typeof set.restSec === 'number') {
            set.restSec = Math.round(set.restSec * 1.2);
          }
        });
      });
      break;
      
    case 'advanced':
      // 고급자: 거리 증가, 회복 시간 감소
      personalizedPlan.sessions.forEach(session => {
        session.totalMeters = Math.round(session.totalMeters * 1.2);
        session.sets.forEach(set => {
          if (typeof set.restSec === 'number') {
            set.restSec = Math.round(set.restSec * 0.8);
          }
        });
      });
      break;
      
    case 'intermediate':
    default:
      // 중급자: 기본값 유지
      break;
  }
  
  // 연령별 조정
  if (userProfile.age >= 65) {
    // 고령자: 거리 감소, 회복 시간 증가
    personalizedPlan.sessions.forEach(session => {
      session.totalMeters = Math.round(session.totalMeters * 0.9);
      session.sets.forEach(set => {
        if (typeof set.restSec === 'number') {
          set.restSec = Math.round(set.restSec * 1.1);
        }
      });
    });
  }
  
  // 건강 상태별 조정
  if (userProfile.health.hypertension) {
    // 고혈압: 고강도 세트 제한
    personalizedPlan.sessions.forEach(session => {
      session.sets = session.sets.filter(set => 
        !set.paceNote.includes('Z4') && !set.paceNote.includes('Z5')
      );
    });
  }
  
  if (userProfile.health.obesity) {
    // 비만: 킥 세트 제한
    personalizedPlan.sessions.forEach(session => {
      session.sets = session.sets.filter(set => 
        !set.drillIds?.includes('kick_board') && 
        !set.drillIds?.includes('dolphin_kick')
      );
    });
  }
  
  return personalizedPlan;
}

/**
 * 목표별 조정
 */
export function adjustForGoal(
  plan: WeekPlan,
  goal: 'fatloss' | 'endurance' | 'performance'
): WeekPlan {
  const adjustedPlan = { ...plan };
  
  switch (goal) {
    case 'fatloss':
      // 체중감량: Z2 비율 증가, Z4/Z5 제한
      adjustedPlan.sessions.forEach(session => {
        session.sets.forEach(set => {
          if (set.paceNote.includes('Z2')) {
            set.reps = Math.round(set.reps * 1.2);
          }
          if (set.paceNote.includes('Z4') || set.paceNote.includes('Z5')) {
            set.reps = Math.round(set.reps * 0.5);
          }
        });
      });
      break;
      
    case 'endurance':
      // 지구력: Z2 비율 증가, Z1 회복 세트 추가
      adjustedPlan.sessions.forEach(session => {
        session.sets.forEach(set => {
          if (set.paceNote.includes('Z2')) {
            set.reps = Math.round(set.reps * 1.3);
          }
        });
        
        // Z1 회복 세트 추가
        const recoverySet: SessionSet = {
          label: 'Recovery',
          reps: 4,
          distance: 50,
          paceNote: '@ Easy (Z1)',
          restSec: 10,
          cues: ['편안한 페이스', '회복']
        };
        session.sets.push(recoverySet);
      });
      break;
      
    case 'performance':
      // 기록향상: Z3/Z4 비율 증가, Z5 스프린트 추가
      adjustedPlan.sessions.forEach(session => {
        session.sets.forEach(set => {
          if (set.paceNote.includes('Z3')) {
            set.reps = Math.round(set.reps * 1.2);
          }
          if (set.paceNote.includes('Z4')) {
            set.reps = Math.round(set.reps * 1.1);
          }
        });
        
        // Z5 스프린트 세트 추가
        const sprintSet: SessionSet = {
          label: 'Sprint',
          reps: 8,
          distance: 25,
          paceNote: '@ All-out (Z5)',
          restSec: 30,
          cues: ['최대 속도', '완전 회복']
        };
        session.sets.push(sprintSet);
      });
      break;
  }
  
  return adjustedPlan;
}

/**
 * 계절별 조정
 */
export function adjustForSeason(
  plan: WeekPlan,
  season: 'spring' | 'summer' | 'autumn' | 'winter'
): WeekPlan {
  const adjustedPlan = { ...plan };
  
  switch (season) {
    case 'spring':
      // 봄: 점진적 증가
      adjustedPlan.sessions.forEach(session => {
        session.totalMeters = Math.round(session.totalMeters * 1.1);
      });
      break;
      
    case 'summer':
      // 여름: 최대 거리
      adjustedPlan.sessions.forEach(session => {
        session.totalMeters = Math.round(session.totalMeters * 1.2);
      });
      break;
      
    case 'autumn':
      // 가을: 유지
      break;
      
    case 'winter':
      // 겨울: 거리 감소, 실내 위주
      adjustedPlan.sessions.forEach(session => {
        session.totalMeters = Math.round(session.totalMeters * 0.9);
      });
      break;
  }
  
  return adjustedPlan;
}