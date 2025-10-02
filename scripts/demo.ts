/**
 * 🏊‍♂️ JJ Swim Lab - 수영 트레이닝 규칙 엔진 데모
 * 
 * 📋 목적
 * - 3명의 샘플 케이스로 수영 계획 생성 데모
 * - 다양한 건강 상태와 관절질환에 대한 맞춤형 계획 확인
 * - 투명성 노트 및 안전성 체크 기능 검증
 * 
 * 🎯 샘플 케이스
 * - Case A: 비만+고혈압+무릎OA (52세 남성)
 * - Case B: 고지혈증+아킬레스건병증 (41세 여성)
 * - Case C: 정상혈압+만성요통+베타차단제 (47세 남성)
 * 
 * 📅 개발 히스토리
 * - 2025-09-23: 초기 데모 스크립트 작성
 * - 2025-09-23: 3가지 대표 케이스 구현
 * - 2025-09-23: JSON 출력 및 결과 분석 추가
 * 
 * 👨‍💻 개발자 정보
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-23
 * - 상태: ✅ 완성 (모든 데모 케이스 구현)
 */

import { buildPlan } from '../src/engine/swim-plan';
import { HealthInput } from '../src/types';

// ────────────────────────────────────────────────────────────────────────────────
// Case A: 비만+고혈압+무릎OA (52세 남성)
// ────────────────────────────────────────────────────────────────────────────────
const caseA: HealthInput = {
  demographics: { age: 52, sex: 'M' },
  anthropometrics: { height_cm: 175, weight_kg: 92, bmi: 30.0 },
  vitals: { 
    rest_hr: 74, 
    rest_bp: { sbp: 145, dbp: 92 }, 
    on_beta_blocker: false 
  },
  labs: { 
    tc: 230, ldl: 150, hdl: 40, tg: 220, fpg: 105 
  },
  conditions: { 
    obesity: 'obesity', 
    hypertension: 'stage1', 
    dyslipidemia: true, 
    diabetes: false 
  },
  orthopedics: ['knee_oa'],
  swim_profile: { 
    level: 'beginner', 
    rpe_tolerance: '11-13' 
  },
  goals: ['blood_pressure_control', 'fat_loss'],
  adherence_last_week: 0.65, 
  symptoms_flags: []
};

// ────────────────────────────────────────────────────────────────────────────────
// Case B: 고지혈증+아킬레스건병증 (41세 여성)
// ────────────────────────────────────────────────────────────────────────────────
const caseB: HealthInput = {
  demographics: { age: 41, sex: 'F' },
  anthropometrics: { height_cm: 165, weight_kg: 64, bmi: 23.5 },
  vitals: { 
    rest_hr: 68, 
    rest_bp: { sbp: 122, dbp: 78 }, 
    on_beta_blocker: false 
  },
  labs: { 
    tc: 210, ldl: 135, hdl: 48, tg: 190 
  },
  conditions: { 
    obesity: 'normal', 
    hypertension: 'normal', 
    dyslipidemia: true, 
    diabetes: false 
  },
  orthopedics: ['achilles_tendinopathy'],
  swim_profile: { 
    level: 'intermediate', 
    rpe_tolerance: '11-13' 
  },
  goals: ['fat_loss', 'lipid_control'],
  adherence_last_week: 0.82, 
  symptoms_flags: []
};

// ────────────────────────────────────────────────────────────────────────────────
// Case C: 정상혈압+만성요통+베타차단제 (47세 남성)
// ────────────────────────────────────────────────────────────────────────────────
const caseC: HealthInput = {
  demographics: { age: 47, sex: 'M' },
  anthropometrics: { height_cm: 178, weight_kg: 76, bmi: 24.0 },
  vitals: { 
    rest_hr: 62, 
    rest_bp: { sbp: 126, dbp: 82 }, 
    on_beta_blocker: true // HR 보조지표 미사용
  },
  conditions: { 
    obesity: 'overweight', 
    hypertension: 'elevated', 
    dyslipidemia: false, 
    diabetes: false 
  },
  orthopedics: ['chronic_nonspecific_lbp'],
  swim_profile: { 
    level: 'advanced', 
    rpe_tolerance: '11-13' 
  },
  goals: ['performance', 'pain_control'],
  adherence_last_week: 0.55, 
  symptoms_flags: []
};

// ────────────────────────────────────────────────────────────────────────────────
// 데모 실행 함수
// ────────────────────────────────────────────────────────────────────────────────
function runDemo() {
  console.log('🏊‍♂️ JJ Swim Lab - 수영 트레이닝 규칙 엔진 데모');
  console.log('=' .repeat(80));
  
  // Case A 실행
  console.log('\n📋 Case A: 비만+고혈압+무릎OA (52세 남성)');
  console.log('-'.repeat(50));
  const planA = buildPlan(caseA);
  console.log(JSON.stringify(planA, null, 2));
  
  // Case B 실행
  console.log('\n📋 Case B: 고지혈증+아킬레스건병증 (41세 여성)');
  console.log('-'.repeat(50));
  const planB = buildPlan(caseB);
  console.log(JSON.stringify(planB, null, 2));
  
  // Case C 실행
  console.log('\n📋 Case C: 정상혈압+만성요통+베타차단제 (47세 남성)');
  console.log('-'.repeat(50));
  const planC = buildPlan(caseC);
  console.log(JSON.stringify(planC, null, 2));
  
  // 결과 분석
  console.log('\n📊 결과 분석');
  console.log('=' .repeat(80));
  
  console.log('\n🔍 Case A 분석:');
  console.log(`- 주간 목표: ${planA.weekly_target_min}분`);
  console.log(`- 세션 수: ${planA.sessions.length}개`);
  console.log(`- 의료 확인 필요: ${planA.medical_clearance_required ? '예' : '아니오'}`);
  console.log(`- 다음 주 조정: ${planA.next_week_adjustment}`);
  console.log(`- 투명성 노트: ${planA.notes.length}개`);
  
  console.log('\n🔍 Case B 분석:');
  console.log(`- 주간 목표: ${planB.weekly_target_min}분`);
  console.log(`- 세션 수: ${planB.sessions.length}개`);
  console.log(`- 의료 확인 필요: ${planB.medical_clearance_required ? '예' : '아니오'}`);
  console.log(`- 다음 주 조정: ${planB.next_week_adjustment}`);
  console.log(`- 투명성 노트: ${planB.notes.length}개`);
  
  console.log('\n🔍 Case C 분석:');
  console.log(`- 주간 목표: ${planC.weekly_target_min}분`);
  console.log(`- 세션 수: ${planC.sessions.length}개`);
  console.log(`- 의료 확인 필요: ${planC.medical_clearance_required ? '예' : '아니오'}`);
  console.log(`- 다음 주 조정: ${planC.next_week_adjustment}`);
  console.log(`- 투명성 노트: ${planC.notes.length}개`);
  
  // 영법 분석
  console.log('\n🏊‍♂️ 영법 분석:');
  const strokesA = planA.sessions.flatMap(s => s.stroke_plan.map(b => b.stroke));
  const strokesB = planB.sessions.flatMap(s => s.stroke_plan.map(b => b.stroke));
  const strokesC = planC.sessions.flatMap(s => s.stroke_plan.map(b => b.stroke));
  
  console.log(`- Case A 사용 영법: ${[...new Set(strokesA)].join(', ')}`);
  console.log(`- Case B 사용 영법: ${[...new Set(strokesB)].join(', ')}`);
  console.log(`- Case C 사용 영법: ${[...new Set(strokesC)].join(', ')}`);
  
  // 제약사항 분석
  console.log('\n⚠️ 제약사항 분석:');
  const constraintsA = planA.sessions.flatMap(s => s.constraints);
  const constraintsB = planB.sessions.flatMap(s => s.constraints);
  const constraintsC = planC.sessions.flatMap(s => s.constraints);
  
  console.log(`- Case A 제약사항: ${[...new Set(constraintsA)].slice(0, 3).join(', ')}`);
  console.log(`- Case B 제약사항: ${[...new Set(constraintsB)].slice(0, 3).join(', ')}`);
  console.log(`- Case C 제약사항: ${[...new Set(constraintsC)].slice(0, 3).join(', ')}`);
  
  console.log('\n✅ 데모 완료!');
}

// ────────────────────────────────────────────────────────────────────────────────
// 메인 실행
// ────────────────────────────────────────────────────────────────────────────────
if (require.main === module) {
  runDemo();
}

export { caseA, caseB, caseC, runDemo };







