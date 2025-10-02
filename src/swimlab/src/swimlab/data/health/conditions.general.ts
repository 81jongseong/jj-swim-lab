
import { HealthCondition } from '../../types';

export const GENERAL_CONDITIONS: HealthCondition[] = [
  { id:'hypertension', name:'고혈압', category:'general', affectsProgram:true,
    rules:[
      { id:'HTN-cap', axis:'intensity', description:'미조절 시 Z3 이내', adjust:'cap:Z3', evidenceIds:['AHA_BP_2019'] },
      { id:'HTN-rest', axis:'rest', description:'혈압 급상승 방지 위해 +15s', adjust:'+15s', evidenceIds:['AHA_BP_2019'] }
    ]},
  { id:'diabetes', name:'당뇨병', category:'general', affectsProgram:true,
    rules:[
      { id:'DM-cap', axis:'intensity', description:'저혈당 위험 고려 Z3 이내 시작', adjust:'cap:Z3', evidenceIds:['ADA_SOC_2025'] },
      { id:'DM-rest', axis:'rest', description:'보급/모니터링 위해 +10s', adjust:'+10s', evidenceIds:['ADA_SOC_2025'] }
    ]},
  { id:'asthma', name:'천식/운동유발천식', category:'general', affectsProgram:true,
    rules:[
      { id:'AST-cap', axis:'intensity', description:'Z3 이내 시작, 서서히 증량', adjust:'cap:Z3', evidenceIds:['GINA_2024'] },
      { id:'AST-rest', axis:'rest', description:'호흡 회복 +10s', adjust:'+10s', evidenceIds:['GINA_2024'] }
    ]},
  { id:'pregnancy', name:'임신(정상)', category:'general', affectsProgram:true,
    rules:[
      { id:'PREG-cap', axis:'intensity', description:'중등도(Z3 이내) 권고', adjust:'cap:Z3', evidenceIds:['ACOG_2020'] },
      { id:'PREG-rest', axis:'rest', description:'체온/피로 관리 +15s', adjust:'+15s', evidenceIds:['ACOG_2020'] }
    ]}
];

export const MENTAL_CONDITIONS: HealthCondition[] = [
  { id:'depression', name:'우울', category:'mental', affectsProgram:true,
    rules:[{ id:'DEP-volume', axis:'volume', description:'초기 총량 -20% 후 주 10–20% 증량', adjust:'-20%', evidenceIds:['BMJ_EXERCISE_DEP_2023'] }]},
  { id:'anxiety', name:'불안', category:'mental', affectsProgram:true,
    rules:[{ id:'ANX-int', axis:'intensity', description:'고강도 스트레스 최소화(Z3 중심)', adjust:'cap:Z3', evidenceIds:[] }]}
];

export const SPECIAL_CASES: HealthCondition[] = [
  { id:'open_water_beginner', name:'오픈워터 입문', category:'special', affectsProgram:true,
    rules:[{ id:'OW-tech', axis:'technique', description:'헤드업/사이팅 드릴 비중↑', adjust:'add:tarzan', evidenceIds:[] }]},
  { id:'cold_pool', name:'저수온', category:'special', affectsProgram:true,
    rules:[{ id:'COLD-rest', axis:'rest', description:'저체온 방지 위해 세트 간 휴식 단축(움직임 유지)', adjust:'-5s', evidenceIds:[] }]}
];
