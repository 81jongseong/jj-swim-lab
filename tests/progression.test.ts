/**
 * 🏊‍♂️ JJ Swim Lab - 프로그레션 테스트
 * 
 * 📋 목적
 * - 성취율 기반 프로그레션 알고리즘 검증
 * - 다음 주 조정 결정 로직 테스트
 * - 증상 플래그 영향 확인
 * 
 * 🎯 테스트 케이스
 * - 성취율 ≥0.8 & 무증상 → progress
 * - 성취율 0.6–0.79 → maintain
 * - 성취율 <0.6 또는 증상 → deload
 */

import { buildPlan } from '../src/engine/swim-plan';
import { HealthInput } from '../src/types';

describe('프로그레션 테스트', () => {
  test('성취율 0.85 & 무증상 → progress', () => {
    const input: HealthInput = {
      demographics: { age: 40, sex: 'M' },
      anthropometrics: { height_cm: 175, weight_kg: 80 },
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
      adherence_last_week: 0.85, // 높은 성취율
      symptoms_flags: [] // 무증상
    };
    
    const plan = buildPlan(input);
    expect(['progress_+5%', 'progress_+10%']).toContain(plan.next_week_adjustment);
  });

  test('성취율 0.7 → maintain', () => {
    const input: HealthInput = {
      demographics: { age: 45, sex: 'F' },
      anthropometrics: { height_cm: 165, weight_kg: 65 },
      vitals: { rest_bp: { sbp: 125, dbp: 85 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.7, // 중간 성취율
      symptoms_flags: []
    };
    
    const plan = buildPlan(input);
    expect(plan.next_week_adjustment).toBe('maintain');
  });

  test('성취율 0.4 → deload', () => {
    const input: HealthInput = {
      demographics: { age: 50, sex: 'M' },
      anthropometrics: { height_cm: 180, weight_kg: 85 },
      vitals: { rest_bp: { sbp: 130, dbp: 90 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.4, // 낮은 성취율
      symptoms_flags: []
    };
    
    const plan = buildPlan(input);
    expect(['deload_-10%', 'deload_-20%']).toContain(plan.next_week_adjustment);
  });

  test('증상 플래그 존재 → deload', () => {
    const input: HealthInput = {
      demographics: { age: 35, sex: 'F' },
      anthropometrics: { height_cm: 160, weight_kg: 60 },
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
      adherence_last_week: 0.9, // 높은 성취율이지만
      symptoms_flags: ['chest_pain'] // 증상 존재
    };
    
    const plan = buildPlan(input);
    expect(['deload_-10%', 'deload_-20%']).toContain(plan.next_week_adjustment);
  });

  test('의료 확인 필요 시 maintain', () => {
    const input: HealthInput = {
      demographics: { age: 60, sex: 'M' },
      anthropometrics: { height_cm: 175, weight_kg: 90 },
      vitals: { rest_bp: { sbp: 185, dbp: 115 } }, // 고혈압 위험 수치
      conditions: { 
        obesity: 'normal', 
        hypertension: 'stage2', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [],
      swim_profile: { level: 'beginner' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    const plan = buildPlan(input);
    expect(plan.medical_clearance_required).toBe(true);
    expect(plan.next_week_adjustment).toBe('maintain');
  });
});







