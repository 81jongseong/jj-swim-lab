/**
 * 🏊‍♂️ JJ Swim Lab - 가드레일 테스트
 * 
 * 📋 목적
 * - 의료 확인 필요성 판단 검증
 * - 혈압 기준 및 증상 플래그 테스트
 * - 안전성 체크 기능 확인
 * 
 * 🎯 테스트 케이스
 * - 고혈압 위험 수치: SBP≥180 or DBP≥110
 * - 증상 플래그 존재 시 의료 확인 필요
 * - Stage2 고혈압 + 고급 레벨 조합
 * - 당뇨병 + 고혈압 조합
 */

import { medicalClearanceNeeded, safetyCheck } from '../src/engine/health-policy';
import { HealthInput } from '../src/types';

describe('가드레일 테스트', () => {
  test('휴식 SBP>=180 또는 DBP>=110이면 clearance 필요', () => {
    const input: HealthInput = {
      demographics: { age: 60, sex: 'F' },
      anthropometrics: { height_cm: 160, weight_kg: 70 },
      vitals: { rest_bp: { sbp: 182, dbp: 112 } },
      conditions: { 
        obesity: 'overweight', 
        hypertension: 'stage2', 
        dyslipidemia: true, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'beginner' },
      goals: [],
      adherence_last_week: 0.9,
      symptoms_flags: []
    };
    
    expect(medicalClearanceNeeded(input)).toBe(true);
  });

  test('증상 플래그 존재 시 의료 확인 필요', () => {
    const input: HealthInput = {
      demographics: { age: 45, sex: 'M' },
      anthropometrics: { height_cm: 175, weight_kg: 80 },
      vitals: { rest_bp: { sbp: 140, dbp: 90 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'stage1', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: ['chest_pain', 'unusual_dyspnea'] // 증상 플래그
    };
    
    expect(medicalClearanceNeeded(input)).toBe(true);
  });

  test('Stage2 고혈압 + 고급 레벨 조합 시 의료 확인 필요', () => {
    const input: HealthInput = {
      demographics: { age: 50, sex: 'M' },
      anthropometrics: { height_cm: 180, weight_kg: 85 },
      vitals: { rest_bp: { sbp: 165, dbp: 105 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'stage2', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'advanced' }, // 고급 레벨
      goals: [],
      adherence_last_week: 0.9,
      symptoms_flags: []
    };
    
    expect(medicalClearanceNeeded(input)).toBe(true);
  });

  test('당뇨병 + 고혈압 조합 시 의료 확인 필요', () => {
    const input: HealthInput = {
      demographics: { age: 55, sex: 'F' },
      anthropometrics: { height_cm: 165, weight_kg: 75 },
      vitals: { rest_bp: { sbp: 150, dbp: 95 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'stage1', 
        dyslipidemia: false, 
        diabetes: true // 당뇨병
      },
      orthopedics: [],
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    expect(medicalClearanceNeeded(input)).toBe(true);
  });

  test('고령자 + 다중 위험요인 시 의료 확인 필요', () => {
    const input: HealthInput = {
      demographics: { age: 70, sex: 'M' }, // 고령자
      anthropometrics: { height_cm: 175, weight_kg: 80 },
      vitals: { rest_bp: { sbp: 145, dbp: 90 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'stage1', 
        dyslipidemia: true, // 다중 위험요인
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'beginner' },
      goals: [],
      adherence_last_week: 0.7,
      symptoms_flags: []
    };
    
    expect(medicalClearanceNeeded(input)).toBe(true);
  });

  test('정상 범위에서는 의료 확인 불필요', () => {
    const input: HealthInput = {
      demographics: { age: 35, sex: 'F' },
      anthropometrics: { height_cm: 165, weight_kg: 60 },
      vitals: { rest_bp: { sbp: 120, dbp: 80 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    expect(medicalClearanceNeeded(input)).toBe(false);
  });

  test('안전성 체크 - 고혈압 경고', () => {
    const input: HealthInput = {
      demographics: { age: 50, sex: 'M' },
      anthropometrics: { height_cm: 175, weight_kg: 80 },
      vitals: { rest_bp: { sbp: 165, dbp: 100 } }, // 고혈압
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
    
    const safety = safetyCheck(input);
    expect(safety.warnings).toContain('고혈압 주의: 운동 중 혈압 모니터링 필요');
  });

  test('안전성 체크 - 고령자 경고', () => {
    const input: HealthInput = {
      demographics: { age: 75, sex: 'F' }, // 고령자
      anthropometrics: { height_cm: 160, weight_kg: 65 },
      vitals: { rest_bp: { sbp: 130, dbp: 85 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'beginner' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    const safety = safetyCheck(input);
    expect(safety.warnings).toContain('고령자: 점진적 강도 증가 권장');
  });
});







