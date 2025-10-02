/**
 * 🏊 SwimLab - 컨디션 ID 정규화 및 동의어 매핑
 * 
 * 📋 **파일 목적**
 * - 컨디션 ID 정규화 (오탈자/동의어 처리)
 * - 자동 시드 기능
 * - 대소문자, 공백, 하이픈 등 무시
 * 
 * 🔄 **주요 기능**
 * - normalizeConditionId: 입력 문자열을 정규 ID로 변환
 * - seedConditionIds: 컨디션 목록으로 동의어 자동 생성
 * - dumpAliases: 현재 등록된 모든 동의어 확인
 */

const RUNTIME_ALIASES: Record<string, string> = Object.create(null);

const BASE_ALIASES: Record<string, string> = {
  'impingement':'shoulder_impingement',
  'rc_irritation':'rotator_cuff_irritation',
  'rotator-cuff':'rotator_cuff_irritation',
  'labrum':'labral_irritation',
  'ac-joint':'ac_joint_pain',
  'scap-dyskinesis':'scapular_dyskinesis',
  'tos':'thoracic_outlet_syndrome',
  'rib-stress':'rib_stress_irritation',
  'cervical':'cervical_strain',
  'lumbar-ext':'lumbar_extension_intolerance',
  'lumbar-flex':'lumbar_flexion_intolerance',
  'costo':'costochondritis',
  'golfers-elbow':'medial_epicondylitis',
  'tennis-elbow':'lateral_epicondylitis',
  'wrist':'wrist_tendinopathy',
  'hand-tenosynovitis':'tenosynovitis_hand',
  'tmj':'tmj_irritation',
  'hip-flexor':'hip_flexor_strain',
  'fai':'hip_fai_irritation',
  'adductor':'groin_adductor_strain',
  'pfps':'patellofemoral_pain',
  'patellar-tendon':'patellar_tendinopathy',
  'itb':'it_band_syndrome',
  'ankle-sprain':'ankle_sprain_history',
  'achilles':'achilles_tendinopathy',
  'pf':'plantar_fasciitis',
  'deconditioning':'general_deconditioning',
  'long-covid':'long_covid_fatigue',
};

function norm(s:string){ 
  return s.trim().toLowerCase()
    .replace(/[()]/g,'')
    .replace(/[\s\-]+/g,'_')
    .replace(/__+/g,'_'); 
}

export function normalizeConditionId(input:string){ 
  if(!input) return ''; 
  const k=norm(input); 
  return RUNTIME_ALIASES[k] || BASE_ALIASES[k] || k; 
}

export function seedConditionIds(ids: string[], customAliases?: Record<string, string[]>) {
  const setAlias = (alias:string, canonical:string)=>{
    const a=norm(alias), c=norm(canonical); 
    if(!RUNTIME_ALIASES[a]) RUNTIME_ALIASES[a]=c; 
  };
  
  ids.forEach(id=>{ 
    const c=norm(id); 
    [c, c.replace(/_/g,'-'), c.replace(/_/g,' '), c.replace(/_/g,'')].forEach(v=>setAlias(v,c)); 
    const parts=c.split('_'); 
    if(parts.length>1){ 
      const initials=parts.map(p=>p[0]).join(''); 
      setAlias(initials, c); 
    } 
  });
  
  if(customAliases){ 
    Object.entries(customAliases).forEach(([canonical, arr])=> 
      arr.forEach(a=>setAlias(a, canonical))
    ); 
  }
}

export function dumpAliases(){ 
  return { ...BASE_ALIASES, ...RUNTIME_ALIASES }; 
}

