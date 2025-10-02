import { weeklyDoseMinutes } from '../src/engine/health-policy';
import { HealthInput } from '../src/types';

test('비만 환자는 주간 250분 이상 목표 설정', () => {
  const input: HealthInput = {
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
  
  const result = weeklyDoseMinutes(input);
  expect(result).toBeGreaterThanOrEqual(250);
});







