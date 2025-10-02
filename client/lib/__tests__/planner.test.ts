/**
 * 수영 프로그램 생성기 단위 테스트
 * 
 * 테스트 대상:
 * - lib/planner.ts (세션 제너레이터)
 * - lib/standards.ts (기록 표준)
 * - lib/health_rules.ts (건강 규칙)
 * - lib/drill-library.ts (드릴 라이브러리)
 * 
 * 수용 기준 검증:
 * 1. 25m 풀 선택 시 모든 세트가 25m 배수 랩으로만 표기
 * 2. 고혈압 On이면 Z4·Z5 합계 ≤10%로 제한
 * 3. 평영 킥주의 질환 입력 시 평영 킥 볼륨 자동 축소/대체
 * 4. 목적=체중감량이면 주간 시간 목표가 WHO 기준 ≥150분으로 유도
 * 5. 기술 체크리스트에서 "크로스오버 있음" 체크 시 Tech block에 Fingertip Drag류 드릴 포함
 * 6. CSS 미보유·기록 없음이어도 연령표 밴드 기반으로 합리적 페이스 범위 산출
 */

import { buildWeek, validatePlan, type Inputs } from '../planner';
import { lookupBand, getTrainingDistribution } from '../standards';
import { getSafetyCaps } from '../health_rules';
import { getRecommendedDrills, getCoachingCues } from '../drill-library';

describe('수영 프로그램 생성기 테스트', () => {
  // 기본 입력 데이터
  const baseInputs: Inputs = {
    pool: 25,
    daysAvailable: ['월', '수', '금'],
    sessionMinutes: 45,
    goal: 'endurance',
    age: 30,
    sex: 'M',
    health: {},
    pace: {
      css: 120,
      best100: 65,
      z2: 150
    },
    technique: {
      freestyle: {
        followThrough: true,
        eliteCatch: true,
        crossover: false, // 크로스오버 문제
        highElbow: false,
        bilateralBreathing: true,
        kickTempo: true,
        headPosition: true
      },
      backstroke: {
        bodyPosition: true,
        armRecovery: true,
        kickTiming: true,
        headPosition: true
      },
      breaststroke: {
        kickTiming: true,
        pullTiming: true,
        breathing: true,
        glide: true
      },
      butterfly: {
        bodyUndulation: true,
        armRecovery: true,
        kickTiming: true,
        breathing: true
      }
    }
  };

  describe('기본 계획 생성 테스트', () => {
    test('기본 입력으로 계획이 성공적으로 생성되어야 함', () => {
      const plan = buildWeek(baseInputs);
      
      expect(plan).toBeDefined();
      expect(plan.sessions).toHaveLength(3); // 월, 수, 금
      expect(plan.weeklyMinutes).toBeGreaterThan(0);
      expect(plan.weeklyDistance).toBeGreaterThan(0);
      expect(plan.goal).toBe('endurance');
    });

    test('계획 검증이 통과해야 함', () => {
      const plan = buildWeek(baseInputs);
      const validation = validatePlan(plan);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('수용 기준 1: 25m 풀 선택 시 모든 세트가 25m 배수 랩으로만 표기', () => {
    test('25m 풀에서 모든 세트의 거리가 25m 배수여야 함', () => {
      const inputs25m: Inputs = {
        ...baseInputs,
        pool: 25
      };
      
      const plan = buildWeek(inputs25m);
      
      plan.sessions.forEach(session => {
        session.sets.forEach(set => {
          expect(set.distance % 25).toBe(0);
          expect(set.laps).toBe(set.distance / 25);
        });
      });
    });

    test('50m 풀에서 모든 세트의 거리가 50m 배수여야 함', () => {
      const inputs50m: Inputs = {
        ...baseInputs,
        pool: 50
      };
      
      const plan = buildWeek(inputs50m);
      
      plan.sessions.forEach(session => {
        session.sets.forEach(set => {
          expect(set.distance % 50).toBe(0);
          expect(set.laps).toBe(set.distance / 50);
        });
      });
    });
  });

  describe('수용 기준 2: 고혈압 On이면 Z4·Z5 합계 ≤10%로 제한', () => {
    test('고혈압 환자의 Z4·Z5 비율이 10% 이하여야 함', () => {
      const hypertensionInputs: Inputs = {
        ...baseInputs,
        health: {
          hypertension: true
        }
      };
      
      const plan = buildWeek(hypertensionInputs);
      const validation = validatePlan(plan);
      
      expect(validation.isValid).toBe(true);
      
      // Z4·Z5 세트 비율 계산
      const totalSets = plan.sessions.reduce((sum, session) => sum + session.sets.length, 0);
      const z4z5Sets = plan.sessions.reduce((sum, session) => {
        return sum + session.sets.filter(set => 
          set.zone.includes('Z4') || set.zone.includes('Z5')
        ).length;
      }, 0);
      
      const z4z5Percentage = (z4z5Sets / totalSets) * 100;
      expect(z4z5Percentage).toBeLessThanOrEqual(10);
    });

    test('고혈압 환자의 안전 제한사항이 적용되어야 함', () => {
      const safetyCaps = getSafetyCaps({ hypertension: true });
      
      expect(safetyCaps.zones.Z4maxPct).toBe(10);
      expect(safetyCaps.zones.Z5maxPct).toBe(0);
      expect(safetyCaps.zones.maxIntensity).toBe(6);
      expect(safetyCaps.hypoxic.maxMeters).toBe(10);
    });
  });

  describe('수용 기준 3: 평영 킥주의 질환 입력 시 평영 킥 볼륨 자동 축소/대체', () => {
    test('무릎 관절염 환자의 킥 볼륨이 제한되어야 함', () => {
      const kneeArthritisInputs: Inputs = {
        ...baseInputs,
        health: {
          msd: ['무릎_관절염']
        }
      };
      
      const safetyCaps = getSafetyCaps({ msd: ['무릎_관절염'] });
      
      expect(safetyCaps.kickVolume.maxPct).toBeLessThanOrEqual(15);
      expect(safetyCaps.kickVolume.restrictedStrokes).toContain('평영');
      expect(safetyCaps.restrictions.forbiddenStrokes).toContain('접영');
    });

    test('고관절 관절염 환자의 킥 볼륨이 제한되어야 함', () => {
      const hipArthritisInputs: Inputs = {
        ...baseInputs,
        health: {
          msd: ['고관절_관절염']
        }
      };
      
      const safetyCaps = getSafetyCaps({ msd: ['고관절_관절염'] });
      
      expect(safetyCaps.kickVolume.maxPct).toBeLessThanOrEqual(15);
      expect(safetyCaps.kickVolume.restrictedStrokes).toContain('평영');
      expect(safetyCaps.restrictions.forbiddenStrokes).toContain('접영');
    });
  });

  describe('수용 기준 4: 목적=체중감량이면 주간 시간 목표가 WHO 기준 ≥150분으로 유도', () => {
    test('체중감량 목적의 주간 시간이 150분 이상이어야 함', () => {
      const fatLossInputs: Inputs = {
        ...baseInputs,
        goal: 'fatloss',
        daysAvailable: ['월', '수', '금'],
        sessionMinutes: 30 // 90분이지만 최소 150분으로 조정되어야 함
      };
      
      const plan = buildWeek(fatLossInputs);
      const validation = validatePlan(plan);
      
      expect(validation.isValid).toBe(true);
      expect(plan.weeklyMinutes).toBeGreaterThanOrEqual(150);
    });

    test('체중감량 목적의 검증이 통과해야 함', () => {
      const fatLossInputs: Inputs = {
        ...baseInputs,
        goal: 'fatloss',
        daysAvailable: ['월', '수', '금'],
        sessionMinutes: 30
      };
      
      const plan = buildWeek(fatLossInputs);
      const validation = validatePlan(plan);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('수용 기준 5: 기술 체크리스트에서 "크로스오버 있음" 체크 시 Tech block에 Fingertip Drag류 드릴 포함', () => {
    test('크로스오버 문제가 있을 때 Fingertip Drag 드릴이 추천되어야 함', () => {
      const techniqueWithCrossover: Inputs['technique'] = {
        ...baseInputs.technique,
        freestyle: {
          ...baseInputs.technique.freestyle,
          crossover: false // 크로스오버 문제
        }
      };
      
      const recommendedDrills = getRecommendedDrills(techniqueWithCrossover, 'technique');
      const hasFingertipDrag = recommendedDrills.some(drill => 
        drill.name.includes('Fingertip') || drill.techniqueFocus.includes('크로스오버 방지')
      );
      
      expect(hasFingertipDrag).toBe(true);
    });

    test('크로스오버 문제가 있을 때 적절한 코칭 큐가 제공되어야 함', () => {
      const techniqueWithCrossover: Inputs['technique'] = {
        ...baseInputs.technique,
        freestyle: {
          ...baseInputs.technique.freestyle,
          crossover: false
        }
      };
      
      const coachingCues = getCoachingCues(techniqueWithCrossover);
      
      expect(coachingCues).toContain('크로스오버 방지');
      expect(coachingCues).toContain('하이엘보 유지');
    });
  });

  describe('수용 기준 6: CSS 미보유·기록 없음이어도 연령표 밴드 기반으로 합리적 페이스 범위 산출', () => {
    test('페이스 데이터가 없을 때 연령 기반 추정 페이스가 생성되어야 함', () => {
      const noPaceInputs: Inputs = {
        ...baseInputs,
        pace: {} // 페이스 데이터 없음
      };
      
      const plan = buildWeek(noPaceInputs);
      
      expect(plan).toBeDefined();
      expect(plan.sessions.length).toBeGreaterThan(0);
      
      // 모든 세트에 합리적인 페이스가 있어야 함
      plan.sessions.forEach(session => {
        session.sets.forEach(set => {
          expect(set.pace).toBeDefined();
          expect(set.pace).not.toBe('');
        });
      });
    });

    test('연령별 밴드 조회가 정상적으로 작동해야 함', () => {
      const band = lookupBand({
        age: 30,
        sex: 'M',
        event: 'FR100',
        timeSec: 65
      });
      
      expect(band).toBeDefined();
      expect(['B', 'BB', 'A', 'AA', 'AAA', 'AAAA', 'NA']).toContain(band);
    });

    test('밴드별 훈련 분배가 정상적으로 작동해야 함', () => {
      const distribution = getTrainingDistribution('A');
      
      expect(distribution.endurance.EN1).toBeGreaterThan(0);
      expect(distribution.endurance.EN2).toBeGreaterThan(0);
      expect(distribution.threshold).toBeGreaterThan(0);
      expect(distribution.vo2max).toBeGreaterThan(0);
      expect(distribution.sprint).toBeGreaterThan(0);
      expect(distribution.technique).toBeGreaterThan(0);
      
      // 총합이 100%에 가까워야 함
      const total = distribution.endurance.EN1 + distribution.endurance.EN2 + 
                   distribution.threshold + distribution.vo2max + 
                   distribution.sprint + distribution.technique;
      expect(total).toBeCloseTo(100, 0);
    });
  });

  describe('건강 상태별 안전 규칙 테스트', () => {
    test('비만 환자의 킥 볼륨이 제한되어야 함', () => {
      const safetyCaps = getSafetyCaps({ obesity: true });
      
      expect(safetyCaps.kickVolume.maxPct).toBe(20);
      expect(safetyCaps.session.maxDuration).toBeLessThanOrEqual(45);
    });

    test('당뇨 환자의 하이폭식이 금지되어야 함', () => {
      const safetyCaps = getSafetyCaps({ diabetes: true });
      
      expect(safetyCaps.hypoxic.enabled).toBe(false);
      expect(safetyCaps.session.maxDuration).toBeLessThanOrEqual(50);
      expect(safetyCaps.session.minRestBetweenSets).toBeGreaterThanOrEqual(30);
    });

    test('고지혈증 환자의 고강도가 제한되어야 함', () => {
      const safetyCaps = getSafetyCaps({ dyslipidemia: true });
      
      expect(safetyCaps.zones.Z4maxPct).toBeLessThanOrEqual(15);
      expect(safetyCaps.zones.Z5maxPct).toBeLessThanOrEqual(10);
    });
  });

  describe('기술 체크리스트 기반 드릴 추천 테스트', () => {
    test('하이엘보 문제가 있을 때 적절한 드릴이 추천되어야 함', () => {
      const techniqueWithHighElbow: Inputs['technique'] = {
        ...baseInputs.technique,
        freestyle: {
          ...baseInputs.technique.freestyle,
          highElbow: false
        }
      };
      
      const coachingCues = getCoachingCues(techniqueWithHighElbow);
      
      expect(coachingCues).toContain('하이엘보 유지');
      expect(coachingCues).toContain('리커버리 높게');
    });

    test('양측 호흡 문제가 있을 때 적절한 코칭 큐가 제공되어야 함', () => {
      const techniqueWithBreathing: Inputs['technique'] = {
        ...baseInputs.technique,
        freestyle: {
          ...baseInputs.technique.freestyle,
          bilateralBreathing: false
        }
      };
      
      const coachingCues = getCoachingCues(techniqueWithBreathing);
      
      expect(coachingCues).toContain('양측 호흡 연습');
      expect(coachingCues).toContain('호흡 리듬 유지');
    });
  });

  describe('계획 검증 테스트', () => {
    test('유효하지 않은 계획이 적절히 검증되어야 함', () => {
      const invalidPlan = {
        ...buildWeek(baseInputs),
        weeklyMinutes: 100, // 체중감량 목적인데 150분 미만
        goal: 'fatloss' as const
      };
      
      const validation = validatePlan(invalidPlan);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('경고사항이 적절히 표시되어야 함', () => {
      const plan = buildWeek(baseInputs);
      const validation = validatePlan(plan);
      
      expect(validation.warnings).toBeDefined();
      expect(Array.isArray(validation.warnings)).toBe(true);
    });
  });

  describe('진행률 업데이트 테스트', () => {
    test('완료율 85% 이상일 때 볼륨이 증가해야 함', () => {
      const plan = buildWeek(baseInputs);
      const sessionResults = [
        { sessionId: 'session_1', completionRate: 90, rpe: 5, painFlag: false },
        { sessionId: 'session_2', completionRate: 85, rpe: 6, painFlag: false },
        { sessionId: 'session_3', completionRate: 88, rpe: 5, painFlag: false }
      ];
      
      const updatedPlan = updateProgression(plan, sessionResults);
      
      expect(updatedPlan.progression.volumeIncrease).toBeGreaterThan(plan.progression.volumeIncrease);
      expect(updatedPlan.progression.restDecrease).toBeGreaterThan(plan.progression.restDecrease);
      expect(updatedPlan.progression.intensityIncrease).toBeGreaterThan(plan.progression.intensityIncrease);
    });

    test('완료율 70% 미만일 때 볼륨이 감소해야 함', () => {
      const plan = buildWeek(baseInputs);
      const sessionResults = [
        { sessionId: 'session_1', completionRate: 60, rpe: 8, painFlag: false },
        { sessionId: 'session_2', completionRate: 65, rpe: 7, painFlag: false },
        { sessionId: 'session_3', completionRate: 55, rpe: 9, painFlag: false }
      ];
      
      const updatedPlan = updateProgression(plan, sessionResults);
      
      expect(updatedPlan.progression.volumeIncrease).toBeLessThan(plan.progression.volumeIncrease);
      expect(updatedPlan.progression.restDecrease).toBeLessThan(plan.progression.restDecrease);
      expect(updatedPlan.progression.intensityIncrease).toBeLessThan(plan.progression.intensityIncrease);
    });

    test('통증 플래그가 있을 때 볼륨이 감소해야 함', () => {
      const plan = buildWeek(baseInputs);
      const sessionResults = [
        { sessionId: 'session_1', completionRate: 90, rpe: 5, painFlag: true },
        { sessionId: 'session_2', completionRate: 85, rpe: 6, painFlag: false },
        { sessionId: 'session_3', completionRate: 88, rpe: 5, painFlag: false }
      ];
      
      const updatedPlan = updateProgression(plan, sessionResults);
      
      expect(updatedPlan.progression.volumeIncrease).toBeLessThan(plan.progression.volumeIncrease);
      expect(updatedPlan.progression.restDecrease).toBeLessThan(plan.progression.restDecrease);
      expect(updatedPlan.progression.intensityIncrease).toBeLessThan(plan.progression.intensityIncrease);
    });
  });
});

// 진행률 업데이트 함수 (테스트용)
function updateProgression(plan: any, sessionResults: any[]) {
  const avgCompletion = sessionResults.reduce((sum, result) => sum + result.completionRate, 0) / sessionResults.length;
  const avgRpe = sessionResults.reduce((sum, result) => sum + result.rpe, 0) / sessionResults.length;
  const hasPain = sessionResults.some(result => result.painFlag);
  
  let volumeAdjustment = 0;
  let restAdjustment = 0;
  let intensityAdjustment = 0;
  
  if (avgCompletion >= 85 && avgRpe <= 6) {
    volumeAdjustment = 5;
    restAdjustment = -5;
    intensityAdjustment = 2;
  }
  
  if (avgCompletion < 70 || hasPain) {
    volumeAdjustment = -20;
    restAdjustment = 10;
    intensityAdjustment = -5;
  }
  
  return {
    ...plan,
    progression: {
      volumeIncrease: Math.max(0, plan.progression.volumeIncrease + volumeAdjustment),
      restDecrease: Math.max(0, plan.progression.restDecrease + restAdjustment),
      intensityIncrease: Math.max(0, plan.progression.intensityIncrease + intensityAdjustment)
    }
  };
}

