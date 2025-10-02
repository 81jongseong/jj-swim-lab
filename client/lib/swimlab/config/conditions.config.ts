/**
 * 🏊 SwimLab - 컨디션 설정
 * 
 * 📋 **파일 목적**
 * - ACUTE(당일 상태) / CHRONIC(질환) 컨디션 정의
 * - 확장 목록 ON/OFF 스위치 (배포시 false)
 * - 프리셋 묶음 정의
 * 
 * 🔄 **주요 기능**
 * - 기본 셋: 20개 (ACUTE 8개 + CHRONIC 12개)
 * - 확장 셋: 4개 추가 (개발/내부 전용)
 * - 프리셋: 5개 묶음
 * 
 * ⚠️ **배포 시 주의**
 * - EXPOSE_EXTENDED = false 유지 (문서 길이 최소화)
 */

// 확장 목록 노출 (기본값을 true로 전환)
export const EXPOSE_EXTENDED = true as const;

// 공용 타입 (툴팁·카테고리·태그 추가)
export type QuickCondition = {
  id: string;
  label: string;
  group: 'ACUTE'|'CHRONIC';
  category?: '어깨'|'허리'|'무릎'|'발목/발'|'전신'|'기타';
  tags?: string[];          // 필터용
  tip?: string;             // 기본 툴팁(룰 미매핑 대비)
};

// ✅ Top15 상시 노출 (카테고리/태그/툴팁 부여)
// - ACUTE(8): 당일/일시 상태
export const ACUTE_BASE: QuickCondition[] = [
  { id:'sleep_deprived', label:'수면부족', group:'ACUTE', category:'전신', tags:['피로'], tip:'볼륨↓/Z1~Z2, 킥강도 완화' },
  { id:'fatigue_high',   label:'피로 高', group:'ACUTE', category:'전신', tags:['피로'], tip:'메인세트 단축, 템포 유지' },
  { id:'upper_respiratory', label:'코감기/비염', group:'ACUTE', category:'전신', tags:['호흡'], tip:'저호흡 회피, 잠수×' },
  { id:'ear_irritation', label:'귀 불편', group:'ACUTE', category:'전신', tags:['ENT'], tip:'자주 잠수/플립턴 최소화' },
  { id:'skin_irritation',label:'피부 자극', group:'ACUTE', category:'전신', tags:['피부'], tip:'염소자극 노출 시간↓' },
  { id:'doms',           label:'근육통(DOMS)', group:'ACUTE', category:'전신', tags:['회복'], tip:'드릴/기술 비중↑' },
  { id:'menstruation',   label:'생리 영향', group:'ACUTE', category:'전신', tags:['호르몬'], tip:'복압/킥 강도 조절' },
  { id:'openwater_cold', label:'오픈워터-저수온', group:'ACUTE', category:'전신', tags:['OW','한랭'], tip:'노출시간 제한, 워밍↑' },
];

// - CHRONIC(12): 질환/특수상황 — 수영에서 빈도 높은 항목
export const CHRONIC_BASE: QuickCondition[] = [
  // 어깨 (6개로 확장)
  { id:'shoulder_impingement', label:'어깨 충돌', group:'CHRONIC', category:'어깨', tags:['견관절','어깨'], tip:'접영/과도한 PULL 회피' },
  { id:'rotator_cuff_irritation', label:'회전근개 과민', group:'CHRONIC', category:'어깨', tags:['견관절','어깨'], tip:'고강도 스프린트×' },
  { id:'scapular_dyskinesis', label:'견갑 불균형', group:'CHRONIC', category:'어깨', tags:['견갑','어깨'], tip:'스컬·캐치 타이밍 교정' },
  { id:'biceps_tendinopathy', label:'이두근건염', group:'CHRONIC', category:'어깨', tags:['견관절','어깨','건'], tip:'풀 강도↓, 팔꿈치 각도 조정' },
  { id:'subacromial_bursitis', label:'견봉하 점액낭염', group:'CHRONIC', category:'어깨', tags:['견관절','어깨','염증'], tip:'오버헤드 동작 최소화' },
  { id:'thoracic_outlet_syndrome', label:'흉곽출구증후군', group:'CHRONIC', category:'어깨', tags:['견관절','어깨','신경'], tip:'목/어깨 회전 범위 제한' },
  
  // 허리 (2개)
  { id:'lumbar_extension_intolerance', label:'허리 신전 민감', group:'CHRONIC', category:'허리', tags:['요추','허리'], tip:'돌핀킥/과신전×' },
  { id:'lumbar_flexion_intolerance', label:'허리 굴곡 민감', group:'CHRONIC', category:'허리', tags:['요추','허리'], tip:'플립턴/과굴곡×' },
  
  // 무릎 (2개)
  { id:'patellofemoral_pain', label:'무릎 PFPS', group:'CHRONIC', category:'무릎', tags:['슬개','무릎'], tip:'평영킥 회피, 볼륨↓' },
  { id:'it_band_syndrome', label:'장경인대(ITB)', group:'CHRONIC', category:'무릎', tags:['슬외측','무릎'], tip:'킥 강도/볼륨 조절' },
  
  // 목 (2개)
  { id:'cervical_disc_herniation', label:'경추 디스크', group:'CHRONIC', category:'기타', tags:['경추','목'], tip:'접영/과도한 회전×' },
  { id:'cervical_strain', label:'목 긴장', group:'CHRONIC', category:'기타', tags:['경추','목'], tip:'과도한 헤드업×' },
];

// 🔓 확장 목록 (EXPOSE_EXTENDED=true일 때 병합 노출)
export const ACUTE_EXTENDED: QuickCondition[] = [
  { id:'allergy', label:'알레르기/천식', group:'ACUTE', category:'전신', tags:['호흡'], tip:'자극 회피, 저강도' },
  { id:'gi_discomfort', label:'위장 불편', group:'ACUTE', category:'전신', tags:['GI'], tip:'충격↓, 템포 일정' },
  { id:'dizzy', label:'어지러움/저혈당', group:'ACUTE', category:'전신', tags:['저혈당'], tip:'저강도·휴식 충분' },
];

export const CHRONIC_EXTENDED: QuickCondition[] = [
  // 발목/발
  { id:'achilles_tendinopathy', label:'아킬레스', group:'CHRONIC', category:'발목/발', tags:['건','발목'], tip:'벽차기 강도↓' },
  { id:'plantar_fasciitis', label:'족저근막', group:'CHRONIC', category:'발목/발', tags:['건막','발'], tip:'벽차기·스프린트 주의' },
  
  // 고관절
  { id:'hip_fai_irritation', label:'고관절 FAI', group:'CHRONIC', category:'기타', tags:['고관절','엉덩이'], tip:'평영킥 가동범위 제한' },
  
  // 전신
  { id:'long_covid_fatigue', label:'장기 COVID 피로', group:'CHRONIC', category:'전신', tags:['피로','전신'], tip:'간헐·볼륨↓' },
  { id:'general_deconditioning', label:'전신 컨디션 저하', group:'CHRONIC', category:'전신', tags:['탈훈련','전신'], tip:'지구력 기초 재구축' },
  
  // 무릎 (추가)
  { id:'patellar_tendinopathy', label:'슬개건 통증', group:'CHRONIC', category:'무릎', tags:['건','무릎'], tip:'킥 볼륨 제한' },
  { id:'meniscus_injury', label:'반월상연골', group:'CHRONIC', category:'무릎', tags:['연골','무릎'], tip:'회전 동작 주의' },
  
  // 어깨 (추가 확장)
  { id:'shoulder_labral_tear', label:'관절와순 손상', group:'CHRONIC', category:'어깨', tags:['견관절','어깨','파열'], tip:'회전 범위 제한, 풀 강도↓' },
  { id:'frozen_shoulder', label:'오십견/동결견', group:'CHRONIC', category:'어깨', tags:['견관절','어깨','가동범위'], tip:'가동범위 내에서만, 무리×' },
];

// 프리셋 묶음(버튼 한 번)
export const PRESETS: { name: string; ids: string[] }[] = [
  { name:'어깨 패키지', ids:['shoulder_impingement','rotator_cuff_irritation','scapular_dyskinesis'] },
  { name:'무릎 패키지', ids:['patellofemoral_pain','it_band_syndrome'] },
  { name:'허리 민감(신전)', ids:['lumbar_extension_intolerance'] },
  { name:'피로+수면', ids:['fatigue_high','sleep_deprived'] },
  { name:'감기 세이프', ids:['upper_respiratory','ear_irritation'] },
];

