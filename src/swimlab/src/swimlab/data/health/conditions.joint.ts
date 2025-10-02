
import { HealthCondition } from '../../types';
export const JOINT_CONDITIONS: HealthCondition[] = [
  { id:'lumbar_disc_herniation', name:'요추 추간판탈출증', category:'joint', affectsProgram:true,
    rules:[
      { id:'LDH-int-cap', axis:'intensity', description:'접영/돌핀 강한 신전 회피, Z4 이내', adjust:'cap:Z4', evidenceIds:['JOSPT_LBP_2021','NASS_LDH_2012'] },
      { id:'LDH-tech', axis:'technique', description:'접영 금지 또는 장기 회피', adjust:'avoid:FL', evidenceIds:['JOSPT_LBP_2021'] },
      { id:'LDH-rest', axis:'rest', description:'세트간 휴식 +10s', adjust:'+10s', evidenceIds:['JOSPT_LBP_2021'] }
    ]},
  { id:'lumbar_spinal_stenosis', name:'요추관협착증', category:'joint', affectsProgram:true,
    rules:[{ id:'LSS-cap', axis:'intensity', description:'장시간 신전 유발 고강도 회피(Z3 이내)', adjust:'cap:Z3', evidenceIds:['JOA_LSS_2021'] }]},
  { id:'pfps', name:'슬개대퇴통증(PFPS)', category:'joint', affectsProgram:true,
    rules:[{ id:'PFPS-tech', axis:'technique', description:'평영 킥 범위 축소/회피', adjust:'limit:BR-kick', evidenceIds:['JOSPT_PFPS_2019'] }]},
  { id:'knee_lig', name:'무릎 인대 손상', category:'joint', affectsProgram:true,
    rules:[{ id:'KNEE-tech', axis:'technique', description:'평영 킥 금지(내반/회전)', adjust:'avoid:BR-kick', evidenceIds:['JOSPT_KNEE_LIG_2017'] }]},
  { id:'meniscus', name:'반월상연골 손상', category:'joint', affectsProgram:true,
    rules:[{ id:'MEN-turn', axis:'technique', description:'턴 pivot 회전 축소', adjust:'limit:turn-pivot', evidenceIds:['JOSPT_MENISCUS_2018'] }]},
  { id:'achilles', name:'아킬레스건병증', category:'joint', affectsProgram:true,
    rules:[{ id:'AT-kick', axis:'technique', description:'킥 범위 축소, 핀 회피', adjust:'limit:kick', evidenceIds:['JOSPT_ACHILLES_2024'] }]},
  { id:'plantar', name:'족저근막염', category:'joint', affectsProgram:true,
    rules:[{ id:'PF-foot', axis:'technique', description:'푸시오프 강도↓, 핀 금지', adjust:'avoid:fins', evidenceIds:['JOSPT_PLANTAR_2023'] }]},
  { id:'axspa', name:'축성 척추관절염', category:'joint', affectsProgram:true,
    rules:[{ id:'AXS-int', axis:'intensity', description:'서서히 증량, 장시간 고정자세 회피', adjust:'cap:Z4', evidenceIds:['AXSPA_2022'] }]}
];
