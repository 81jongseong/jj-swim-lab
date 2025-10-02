/**
 * 🏊‍♂️ JJ Swim Lab - 도스 규칙 테스트
 * 
 * 📋 목적
 * - 주간 도스 계산 규칙 검증
 * - 비만, 고혈압, 고지혈증별 도스 조정 테스트
 * - WHO/ACSM 기준 준수 확인
 * 
 * 🎯 테스트 케이스
 * - 비만: 250분/주 이상 목표
 * - 고혈압: 빈도 증가 및 도스 조정
 * - 고지혈증: 200분/주 이상 목표
 * - 복합 질환: 최대 도스 적용
 */

import { weeklyDoseMinutes, medicalClearanceNeeded } from '../src/engine/health-policy';
import { HealthInput } from '../src/types';

describe('도스 규칙 테스트', () => {
  test('비만이면 주당 최소 250분 이상 목표', () => {
    const input: HealthInput = {
      demographics: { age: 40, sex: 'M' },
      anthropometrics: { height_cm: 180, weight_kg: 95, bmi: 29 },
      vitals: { rest_bp: { sbp: 130, dbp: 85 } },
      conditions: { 
        obesity: 'obesity', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'beginner' },
      goals: [],
      adherence_last_week: 0.7,
      symptoms_flags: []
    };
    
    expect(weeklyDoseMinutes(input)).toBeGreaterThanOrEqual(250);
  });

  test('고혈압 Stage2면 도스 증가', () => {
    const input: HealthInput = {
      demographics: { age: 50, sex: 'F' },
      anthropometrics: { height_cm: 165, weight_kg: 70 },
      vitals: { rest_bp: { sbp: 160, dbp: 100 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'stage2', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    expect(weeklyDoseMinutes(input)).toBeGreaterThanOrEqual(210);
  });

  test('고지혈증이면 200분/주 이상 목표', () => {
    const input: HealthInput = {
      demographics: { age: 45, sex: 'M' },
      anthropometrics: { height_cm: 175, weight_kg: 80 },
      vitals: { rest_bp: { sbp: 120, dbp: 80 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: true, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.75,
      symptoms_flags: []
    };
    
    expect(weeklyDoseMinutes(input)).toBeGreaterThanOrEqual(200);
  });

  test('복합 질환시 최대 도스 적용', () => {
    const input: HealthInput = {
      demographics: { age: 55, sex: 'F' },
      anthropometrics: { height_cm: 160, weight_kg: 85, bmi: 33 },
      vitals: { rest_bp: { sbp: 150, dbp: 95 } },
      conditions: { 
        obesity: 'obesity', 
        hypertension: 'stage1', 
        dyslipidemia: true, 
        diabetes: true 
      },
      orthopedics: [],
      swim_profile: { level: 'beginner' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    const dose = weeklyDoseMinutes(input);
    expect(dose).toBeGreaterThanOrEqual(250); // 비만 기준
    expect(dose).toBeLessThanOrEqual(300); // WHO 최대치
  });

  test('순응도 낮으면 도스 감소', () => {
    const input: HealthInput = {
      demographics: { age: 35, sex: 'M' },
      anthropometrics: { height_cm: 180, weight_kg: 90, bmi: 28 },
      vitals: { rest_bp: { sbp: 125, dbp: 85 } },
      conditions: { 
        obesity: 'overweight', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'beginner' },
      goals: [],
      adherence_last_week: 0.4, // 낮은 순응도
      symptoms_flags: []
    };
    
    const dose = weeklyDoseMinutes(input);
    expect(dose).toBeLessThan(250); // 순응도 낮으면 도스 감소
  });
});







