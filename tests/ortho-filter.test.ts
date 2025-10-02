/**
 * 🏊‍♂️ JJ Swim Lab - 정형 가이드 필터 테스트
 * 
 * 📋 목적
 * - 정형 28개 관절질환 가이드 기반 영법 선택 검증
 * - avoid 영법 제외 로직 테스트
 * - caution 영법 수정사항 적용 확인
 * 
 * 🎯 테스트 케이스
 * - 요추 디스크: 접영 avoid 제외
 * - 무릎 OA: 평영 caution 수정사항 적용
 * - 다중 관절질환: 교집합 안전 영법 선택
 */

import { buildPlan } from '../src/engine/swim-plan';
import { HealthInput } from '../src/types';

describe('정형 가이드 필터 테스트', () => {
  test('요추 디스크: 접영 avoid 제외', () => {
    const input: HealthInput = {
      demographics: { age: 45, sex: 'M' },
      anthropometrics: { height_cm: 175, weight_kg: 80 },
      vitals: { rest_bp: { sbp: 120, dbp: 80 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: ['lumbar_disc_herniation'], // 요추 디스크
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    const plan = buildPlan(input);
    const strokes = plan.sessions.flatMap(s => s.stroke_plan.map(b => b.stroke));
    expect(strokes.includes('butterfly')).toBe(false); // 접영 제외
  });

  test('무릎 OA: 평영 caution 수정사항 적용', () => {
    const input: HealthInput = {
      demographics: { age: 50, sex: 'F' },
      anthropometrics: { height_cm: 165, weight_kg: 70 },
      vitals: { rest_bp: { sbp: 125, dbp: 85 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: ['knee_oa'], // 무릎 골관절염
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    const plan = buildPlan(input);
    const constraints = plan.sessions.flatMap(s => s.constraints);
    
    // 무릎 OA의 평영 caution 수정사항이 포함되어야 함
    const hasKneeConstraint = constraints.some(c => 
      c.includes('킥 폭 축소') || 
      c.includes('narrow') || 
      c.includes('breaststroke')
    );
    expect(hasKneeConstraint).toBe(true);
  });

  test('어깨 충돌: 자유형 caution 수정사항 적용', () => {
    const input: HealthInput = {
      demographics: { age: 40, sex: 'M' },
      anthropometrics: { height_cm: 180, weight_kg: 85 },
      vitals: { rest_bp: { sbp: 130, dbp: 90 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: ['subacromial_impingement'], // 어깨 충돌
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    const plan = buildPlan(input);
    const constraints = plan.sessions.flatMap(s => s.constraints);
    
    // 어깨 충돌의 자유형 caution 수정사항이 포함되어야 함
    const hasShoulderConstraint = constraints.some(c => 
      c.includes('S-라인') || 
      c.includes('통증각') || 
      c.includes('freestyle')
    );
    expect(hasShoulderConstraint).toBe(true);
  });

  test('다중 관절질환: 교집합 안전 영법 선택', () => {
    const input: HealthInput = {
      demographics: { age: 55, sex: 'F' },
      anthropometrics: { height_cm: 160, weight_kg: 65 },
      vitals: { rest_bp: { sbp: 135, dbp: 90 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: ['knee_oa', 'chronic_nonspecific_lbp'], // 다중 질환
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    const plan = buildPlan(input);
    const strokes = plan.sessions.flatMap(s => s.stroke_plan.map(b => b.stroke));
    
    // 배영은 두 질환 모두에서 safe이므로 포함되어야 함
    expect(strokes.includes('backstroke')).toBe(true);
    
    // 접영은 요통에서 avoid이므로 제외되어야 함
    expect(strokes.includes('butterfly')).toBe(false);
  });

  test('아킬레스 건병증: 발목 관련 제약사항 적용', () => {
    const input: HealthInput = {
      demographics: { age: 35, sex: 'M' },
      anthropometrics: { height_cm: 175, weight_kg: 75 },
      vitals: { rest_bp: { sbp: 120, dbp: 80 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: ['achilles_tendinopathy'], // 아킬레스 건병증
      swim_profile: { level: 'intermediate' },
      goals: [],
      adherence_last_week: 0.8,
      symptoms_flags: []
    };
    
    const plan = buildPlan(input);
    const constraints = plan.sessions.flatMap(s => s.constraints);
    
    // 아킬레스 건병증 관련 제약사항이 포함되어야 함
    const hasAchillesConstraint = constraints.some(c => 
      c.includes('핀') || 
      c.includes('포인팅') || 
      c.includes('속도')
    );
    expect(hasAchillesConstraint).toBe(true);
  });

  test('정형 질환 없음: 모든 영법 사용 가능', () => {
    const input: HealthInput = {
      demographics: { age: 30, sex: 'F' },
      anthropometrics: { height_cm: 165, weight_kg: 60 },
      vitals: { rest_bp: { sbp: 110, dbp: 75 } },
      conditions: { 
        obesity: 'normal', 
        hypertension: 'normal', 
        dyslipidemia: false, 
        diabetes: false 
      },
      orthopedics: [], // 정형 질환 없음
      swim_profile: { level: 'advanced' },
      goals: [],
      adherence_last_week: 0.9,
      symptoms_flags: []
    };
    
    const plan = buildPlan(input);
    const strokes = plan.sessions.flatMap(s => s.stroke_plan.map(b => b.stroke));
    
    // 모든 영법이 사용 가능해야 함
    expect(strokes.includes('freestyle')).toBe(true);
    expect(strokes.includes('backstroke')).toBe(true);
    expect(strokes.includes('breaststroke')).toBe(true);
    expect(strokes.includes('butterfly')).toBe(true);
  });
});







