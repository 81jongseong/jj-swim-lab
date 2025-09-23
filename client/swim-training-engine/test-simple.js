// 간단한 테스트 스크립트
const { weeklyDoseMinutes } = require('./dist/src/engine/health-policy.js');
const { buildPlan } = require('./dist/src/engine/swim-plan.js');

console.log('=== 간단한 테스트 ===');

// 비만 환자 테스트
const obeseInput = {
  demographics: { age: 40, sex: 'M' },
  anthropometrics: { height_cm: 170, weight_kg: 80 },
  vitals: {},
  conditions: {
    obesity: 'obesity',
    hypertension: 'normal',
    dyslipidemia: false,
    diabetes: false
  },
  orthopedics: [],
  swim_profile: { level: 'intermediate' },
  goals: ['fat_loss'],
  adherence_last_week: 0.8,
  symptoms_flags: []
};

const weeklyMinutes = weeklyDoseMinutes(obeseInput);
console.log('비만 환자 주간 목표 시간:', weeklyMinutes, '분');

// 허리 디스크 환자 테스트
const discInput = {
  demographics: { age: 40, sex: 'M' },
  anthropometrics: { height_cm: 175, weight_kg: 80 },
  vitals: {},
  conditions: {
    obesity: 'normal',
    hypertension: 'normal',
    dyslipidemia: false,
    diabetes: false
  },
  orthopedics: ['lumbar_disc_herniation'],
  swim_profile: { level: 'intermediate' },
  goals: ['general_fitness'],
  adherence_last_week: 0.8,
  symptoms_flags: []
};

const plan = buildPlan(discInput);
console.log('허리 디스크 환자 수영 계획:');
console.log('- 주간 목표 시간:', plan.weekly_target_min, '분');
console.log('- 세션 수:', plan.sessions.length);
console.log('- 다음 주 조정:', plan.next_week_adjustment);
console.log('- 사용된 영법들:', plan.sessions[0].stroke_plan.map(sp => sp.stroke));

console.log('\n=== 테스트 완료 ===');
