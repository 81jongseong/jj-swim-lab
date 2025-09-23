import { buildPlan } from '../src/engine/swim-plan';
test('높은 순응도와 증상 없음에서 진행 조정', () => {
    const input = {
        demographics: { age: 35, sex: 'F' },
        anthropometrics: { height_cm: 165, weight_kg: 60 },
        vitals: {},
        conditions: {
            obesity: 'normal',
            hypertension: 'normal',
            dyslipidemia: false,
            diabetes: false
        },
        orthopedics: [],
        swim_profile: { level: 'intermediate' },
        goals: ['general_fitness'],
        adherence_last_week: 0.9,
        symptoms_flags: []
    };
    const result = buildPlan(input);
    expect(['progress_+5%', 'progress_+10%']).toContain(result.next_week_adjustment);
});
