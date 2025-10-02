/**
 * 🏊‍♂️ JJ Swim Lab - 진행(Progression) 로직
 * 
 * 📋 **기능:**
 * - 성취율·RPE 기반 자동 증감
 * - 주간별 진행 규칙
 * - 개인별 적응도 반영
 */

import { WeekPlan, UserInput, SessionSet, Zone } from './types';
import { resolveBasePace, zonePace } from './pace';

export interface ProgressionInput {
  currentPlan: WeekPlan;
  userInput: UserInput;
  achievementRate: number; // 0-1 (성취율)
  rpe: number; // 1-10 (RPE)
  feedback: {
    difficulty: 'too_easy' | 'just_right' | 'too_hard';
    enjoyment: 'low' | 'medium' | 'high';
    fatigue: 'low' | 'medium' | 'high';
  };
}

export interface ProgressionOutput {
  nextWeekPlan: WeekPlan;
  adjustments: {
    intensity: 'increase' | 'maintain' | 'decrease';
    volume: 'increase' | 'maintain' | 'decrease';
    frequency: 'increase' | 'maintain' | 'decrease';
    reasoning: string[];
  };
}

export function nextProgression(input: ProgressionInput): ProgressionOutput {
  const adjustments = calculateAdjustments(input);
  const nextWeekPlan = applyAdjustments(input.currentPlan, adjustments, input.userInput);
  
  return {
    nextWeekPlan,
    adjustments
  };
}

function calculateAdjustments(input: ProgressionInput): ProgressionOutput['adjustments'] {
  const { achievementRate, rpe, feedback } = input;
  const reasoning: string[] = [];
  
  let intensity: 'increase' | 'maintain' | 'decrease' = 'maintain';
  let volume: 'increase' | 'maintain' | 'decrease' = 'maintain';
  let frequency: 'increase' | 'maintain' | 'decrease' = 'maintain';
  
  // 성취율 기반 조정
  if (achievementRate >= 0.9) {
    intensity = 'increase';
    reasoning.push('높은 성취율로 강도 증가');
  } else if (achievementRate <= 0.6) {
    intensity = 'decrease';
    reasoning.push('낮은 성취율로 강도 감소');
  }
  
  // RPE 기반 조정
  if (rpe <= 4) {
    intensity = 'increase';
    reasoning.push('낮은 RPE로 강도 증가');
  } else if (rpe >= 8) {
    intensity = 'decrease';
    reasoning.push('높은 RPE로 강도 감소');
  }
  
  // 피드백 기반 조정
  if (feedback.difficulty === 'too_easy') {
    intensity = 'increase';
    reasoning.push('운동이 너무 쉬워서 강도 증가');
  } else if (feedback.difficulty === 'too_hard') {
    intensity = 'decrease';
    reasoning.push('운동이 너무 어려워서 강도 감소');
  }
  
  if (feedback.fatigue === 'low') {
    volume = 'increase';
    reasoning.push('낮은 피로도로 운동량 증가');
  } else if (feedback.fatigue === 'high') {
    volume = 'decrease';
    reasoning.push('높은 피로도로 운동량 감소');
  }
  
  if (feedback.enjoyment === 'high' && achievementRate >= 0.8) {
    frequency = 'increase';
    reasoning.push('높은 만족도와 성취율로 빈도 증가');
  } else if (feedback.enjoyment === 'low' && achievementRate <= 0.6) {
    frequency = 'decrease';
    reasoning.push('낮은 만족도와 성취율로 빈도 감소');
  }
  
  // 안전 제한 적용
  const safetyCaps = getSafetyCaps(input.userInput.health);
  if (intensity === 'increase' && getCurrentMaxIntensity(input.currentPlan) >= safetyCaps.maxIntensity) {
    intensity = 'maintain';
    reasoning.push('안전 제한으로 강도 증가 제한');
  }
  
  if (volume === 'increase' && getCurrentMaxDuration(input.currentPlan) >= safetyCaps.maxDuration) {
    volume = 'maintain';
    reasoning.push('안전 제한으로 운동량 증가 제한');
  }
  
  if (frequency === 'increase' && getCurrentFrequency(input.currentPlan) >= safetyCaps.maxFrequency) {
    frequency = 'maintain';
    reasoning.push('안전 제한으로 빈도 증가 제한');
  }
  
  return {
    intensity,
    volume,
    frequency,
    reasoning
  };
}

function applyAdjustments(
  currentPlan: WeekPlan, 
  adjustments: ProgressionOutput['adjustments'], 
  userInput: UserInput
): WeekPlan {
  const nextPlan = JSON.parse(JSON.stringify(currentPlan)); // 깊은 복사
  
  // 강도 조정
  if (adjustments.intensity === 'increase') {
    nextPlan.sessions.forEach(session => {
      session.sets.forEach(set => {
        if (set.paceNote.includes('Z1')) {
          set.paceNote = set.paceNote.replace('Z1', 'Z2');
        } else if (set.paceNote.includes('Z2')) {
          set.paceNote = set.paceNote.replace('Z2', 'Z3');
        } else if (set.paceNote.includes('Z3')) {
          set.paceNote = set.paceNote.replace('Z3', 'Z4');
        }
      });
    });
  } else if (adjustments.intensity === 'decrease') {
    nextPlan.sessions.forEach(session => {
      session.sets.forEach(set => {
        if (set.paceNote.includes('Z4')) {
          set.paceNote = set.paceNote.replace('Z4', 'Z3');
        } else if (set.paceNote.includes('Z3')) {
          set.paceNote = set.paceNote.replace('Z3', 'Z2');
        } else if (set.paceNote.includes('Z2')) {
          set.paceNote = set.paceNote.replace('Z2', 'Z1');
        }
      });
    });
  }
  
  // 운동량 조정
  if (adjustments.volume === 'increase') {
    nextPlan.sessions.forEach(session => {
      session.sets.forEach(set => {
        if (set.label === 'Main') {
          set.reps = Math.min(set.reps + 1, 12); // 최대 12회로 제한
        }
      });
    });
  } else if (adjustments.volume === 'decrease') {
    nextPlan.sessions.forEach(session => {
      session.sets.forEach(set => {
        if (set.label === 'Main') {
          set.reps = Math.max(set.reps - 1, 2); // 최소 2회로 제한
        }
      });
    });
  }
  
  // 빈도 조정
  if (adjustments.frequency === 'increase') {
    // 새로운 세션 추가
    const newSession = createAdditionalSession(userInput, nextPlan.sessions.length);
    nextPlan.sessions.push(newSession);
  } else if (adjustments.frequency === 'decrease') {
    // 세션 제거 (최소 2회 유지)
    if (nextPlan.sessions.length > 2) {
      nextPlan.sessions.pop();
    }
  }
  
  // 총 거리 재계산
  nextPlan.summary.totalMeters = nextPlan.sessions.reduce((sum, s) => sum + s.totalMeters, 0);
  nextPlan.summary.sessions = nextPlan.sessions.length;
  
  return nextPlan;
}

function createAdditionalSession(userInput: UserInput, dayIndex: number): any {
  const css = resolveBasePace(userInput.pace);
  const zones = zonePace(css);
  
  return {
    dayIndex,
    totalMeters: userInput.avail.sessionMinutes * 2, // 대략적 계산
    sets: [
      {
        label: 'Warm-up',
        reps: userInput.avail.pool === 25 ? 4 : 2,
        distance: userInput.avail.pool,
        paceNote: `@ ${formatPace(zones.Z1[1])} (Z1)`,
        restSec: 15,
        stroke: userInput.stroke,
        cues: ['편안한 속도', '기술에 집중']
      },
      {
        label: 'Main',
        reps: userInput.avail.pool === 25 ? 6 : 4,
        distance: userInput.avail.pool * 2,
        paceNote: `@ ${formatPace(zones.Z2[1])} (Z2)`,
        restSec: 20,
        stroke: userInput.stroke,
        cues: ['일정한 페이스', '기술 유지']
      },
      {
        label: 'Cool-down',
        reps: userInput.avail.pool === 25 ? 4 : 2,
        distance: userInput.avail.pool,
        paceNote: `@ ${formatPace(zones.Z1[1])} (Z1)`,
        restSec: 15,
        stroke: userInput.stroke,
        cues: ['편안한 속도', '회복에 집중']
      }
    ],
    safetyBadges: []
  };
}

function getCurrentMaxIntensity(plan: WeekPlan): Zone {
  let maxZone: Zone = 'Z1';
  
  plan.sessions.forEach(session => {
    session.sets.forEach(set => {
      if (set.paceNote.includes('Z5')) maxZone = 'Z5';
      else if (set.paceNote.includes('Z4') && maxZone !== 'Z5') maxZone = 'Z4';
      else if (set.paceNote.includes('Z3') && maxZone !== 'Z5' && maxZone !== 'Z4') maxZone = 'Z3';
      else if (set.paceNote.includes('Z2') && maxZone !== 'Z5' && maxZone !== 'Z4' && maxZone !== 'Z3') maxZone = 'Z2';
    });
  });
  
  return maxZone;
}

function getCurrentMaxDuration(plan: WeekPlan): number {
  return plan.sessions.reduce((max, session) => {
    const sessionDuration = session.sets.reduce((sum, set) => {
      const setDuration = set.reps * set.distance / 25; // 대략적 분 계산
      return sum + setDuration;
    }, 0);
    return Math.max(max, sessionDuration);
  }, 0);
}

function getCurrentFrequency(plan: WeekPlan): number {
  return plan.sessions.length;
}

function getSafetyCaps(health: any): any {
  // 간단한 안전 제한 (실제로는 health_rules.ts에서 가져와야 함)
  return {
    maxIntensity: 'Z5',
    maxDuration: 60,
    maxFrequency: 7
  };
}

function formatPace(secPer100: number): string {
  const minutes = Math.floor(secPer100 / 60);
  const seconds = secPer100 % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}/100m`;
}










