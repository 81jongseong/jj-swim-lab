import { medicalClearanceNeeded } from '../src/engine/health-policy';
test('고혈압 위험 수치에서 의료 확인 필요', () => {
    const input = {
        demographics: { age: 50, sex: 'M' },
        anthropometrics: { height_cm: 175, weight_kg: 80 },
        vitals: { rest_bp: { sbp: 185, dbp: 105 } },
        conditions: {
            obesity: 'normal',
            hypertension: 'stage2',
            dyslipidemia: false,
            diabetes: false
        },
        orthopedics: [],
        swim_profile: { level: 'intermediate' },
        goals: ['blood_pressure_control'],
        adherence_last_week: 0.8,
        symptoms_flags: []
    };
    const result = medicalClearanceNeeded(input);
    expect(result).toBe(true);
});
