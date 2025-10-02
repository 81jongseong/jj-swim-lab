/**
 * 🏊‍♂️ JJ Swim Lab - 메인 인덱스
 * 
 * 📋 **기능:**
 * - 모든 모듈 통합
 * - 간단한 UI 컴포넌트 제공
 * - 기존 엔진과의 호환성 유지
 */

export * from './types';
export * from './pace';
export * from './training_methods';
export * from './drills';
export * from './health_rules';
export * from './planner';
export * from './progression';

// 기존 엔진과의 호환성을 위한 함수
export function buildPlan(input: any): any {
  try {
    // 기존 입력 형식을 새 형식으로 변환
    const newInput = {
      demographics: {
        age: input.age || 30,
        sex: input.sex || 'M'
      },
      health: {
        hypertension: input.conditions?.hypertension !== 'normal',
        obesity: input.conditions?.obesity !== 'normal',
        dyslipidemia: input.conditions?.dyslipidemia,
        diabetes: input.conditions?.diabetes,
        jointConditions: input.orthopedics || []
      },
      technique: {},
      pace: {
        cssSecPer100: input.pace?.cssSecPer100 || 95
      },
      avail: {
        pool: 25,
        daysPerWeek: input.weeklySessions || 3,
        sessionMinutes: input.sessionMinutes || 45
      },
      goal: input.goals?.includes('체중 감량') ? 'fatloss' :
            input.goals?.includes('기록 향상') ? 'performance' : 'endurance',
      stroke: 'FR'
    };

    const { buildWeek } = require('./planner');
    const weekPlan = buildWeek(newInput);

    // 기존 출력 형식으로 변환
    return {
      microcycle_week: 1,
      weekly_target_min: weekPlan.summary.totalMeters / 25, // 대략적 분 계산
      weekly_target_distance: weekPlan.summary.totalMeters,
      medical_clearance_required: false,
      sessions: weekPlan.sessions.map(session => ({
        day: `Day ${session.dayIndex + 1}`,
        sessionType: 'Mixed',
        intensity: 70,
        exercises: session.sets.map(set => ({
          stroke: 'freestyle',
          distance: set.distance,
          sets: set.reps,
          rest: set.restSec
        }))
      })),
      strength_days: 0,
      next_week_adjustment: 'maintain' as const,
      notes: weekPlan.sessions.flatMap(s => s.safetyBadges),
      exercisePrescription: {
        totalDuration: weekPlan.summary.totalMeters / 25,
        totalDistance: weekPlan.summary.totalMeters,
        averagePace: 95,
        intensity: 70,
        grade: 'intermediate'
      }
    };
  } catch (error) {
    console.error('Plan generation error:', error);
    throw new Error('Failed to generate swim plan');
  }
}

// 엔진 상태 확인
export function getEngineStatus() {
  return {
    status: 'ready',
    version: '2.0.0',
    modules: {
      types: 'loaded',
      pace: 'loaded',
      training_methods: 'loaded',
      drills: 'loaded',
      health_rules: 'loaded',
      planner: 'loaded',
      progression: 'loaded'
    }
  };
}

// 엔진 초기화
export function initializeEngine() {
  console.log('🏊‍♂️ JJ Swim Lab Engine initialized');
  return getEngineStatus();
}










