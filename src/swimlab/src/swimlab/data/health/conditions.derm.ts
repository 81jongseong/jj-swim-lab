
import { HealthCondition } from '../../types';
export const DERM_CONDITIONS: HealthCondition[] = [
  { id:'open_wound', name:'개방성 상처', category:'derm', affectsProgram:true,
    rules:[{ id:'WOUND-no', axis:'contraindication', description:'치유 전 공용 수영장 금지(감염 예방)', adjust:'no-swim', evidenceIds:['CDC_POOL_ILLNESS'] }]},
  { id:'skin_infection', name:'피부 감염', category:'derm', affectsProgram:true,
    rules:[{ id:'SKIN-no', axis:'contraindication', description:'전염성 기간 수영 금지', adjust:'no-swim', evidenceIds:['CDC_POOL_ILLNESS'] }]}
];
