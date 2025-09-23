import { buildPlan } from '../src/engine/swim-plan';
import { HealthInput } from '../src/types';

test('허리 디스크에서 나비영 제외', () => {
  const input: HealthInput = {
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
  
  const result = buildPlan(input);
  const allStrokes = result.sessions.flatMap(s => s.stroke_plan.map(sp => sp.stroke));
  expect(allStrokes).not.toContain('butterfly');
});
