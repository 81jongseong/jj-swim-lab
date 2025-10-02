import { buildPlan } from '../src/engine/swim-plan.js';
const sample1 = {
    demographics: { age: 45, sex: 'M' },
    anthropometrics: { height_cm: 175, weight_kg: 85, bmi: 27.8 },
    vitals: { rest_hr: 72, rest_bp: { sbp: 145, dbp: 90 }, on_beta_blocker: false },
    labs: { tc: 220, ldl: 140, hdl: 45, tg: 180 },
    conditions: {
        obesity: 'overweight',
        hypertension: 'stage1',
        dyslipidemia: true,
        diabetes: false
    },
    orthopedics: ['lumbar_disc_herniation'],
    swim_profile: { level: 'intermediate' },
    goals: ['blood_pressure_control', 'fat_loss'],
    adherence_last_week: 0.8,
    symptoms_flags: []
};
const sample2 = {
    demographics: { age: 35, sex: 'F' },
    anthropometrics: { height_cm: 165, weight_kg: 60, bmi: 22.0 },
    vitals: { rest_hr: 65, rest_bp: { sbp: 120, dbp: 80 }, on_beta_blocker: false },
    conditions: {
        obesity: 'normal',
        hypertension: 'normal',
        dyslipidemia: false,
        diabetes: false
    },
    orthopedics: ['achilles_tendinopathy'],
    swim_profile: { level: 'beginner' },
    goals: ['general_fitness'],
    adherence_last_week: 0.6,
    symptoms_flags: []
};
const sample3 = {
    demographics: { age: 55, sex: 'M' },
    anthropometrics: { height_cm: 180, weight_kg: 90, bmi: 27.8 },
    vitals: { rest_hr: 68, rest_bp: { sbp: 130, dbp: 85 }, on_beta_blocker: true },
    conditions: {
        obesity: 'overweight',
        hypertension: 'elevated',
        dyslipidemia: false,
        diabetes: false
    },
    orthopedics: ['chronic_low_back_pain'],
    swim_profile: { level: 'advanced' },
    goals: ['blood_pressure_control'],
    adherence_last_week: 0.9,
    symptoms_flags: []
};
console.log('=== Sample 1: 비만+고혈압+허리디스크 ===');
console.log(JSON.stringify(buildPlan(sample1), null, 2));
console.log('\n=== Sample 2: 정상+아킬레스건염 ===');
console.log(JSON.stringify(buildPlan(sample2), null, 2));
console.log('\n=== Sample 3: 베타차단제+만성요통 ===');
console.log(JSON.stringify(buildPlan(sample3), null, 2));
