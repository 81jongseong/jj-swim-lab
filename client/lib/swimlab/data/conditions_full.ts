/**
 * 🏊 SwimLab - 전체 컨디션 목록
 * 
 * 📋 **파일 목적**
 * - 수영과 관련된 모든 컨디션 정의
 * - AllConditionsDrawer에서 사용
 * - 검색 가능한 풀 데이터셋
 * 
 * 🔄 **포함 항목**
 * - BASE (20개) + EXTENDED (4개)
 * - 추가 정형외과/내과 조건 (~50개)
 * - 키워드/동의어 포함
 */

export type ConditionFull = {
  id: string;
  label: string;
  group: 'ACUTE' | 'CHRONIC';
  category?: string;
  keywords?: string[];
};

export const CONDITIONS: ConditionFull[] = [
  // ===== ACUTE (당일 컨디션) =====
  { id: 'sleep_deprived', label: '수면부족', group: 'ACUTE', category: '피로', keywords: ['잠', '불면', '수면'] },
  { id: 'upper_respiratory', label: '코감기/비염', group: 'ACUTE', category: '호흡기', keywords: ['감기', '코막힘', '비염'] },
  { id: 'ear_irritation', label: '귀 불편(염증 의심)', group: 'ACUTE', category: '귀', keywords: ['귀통증', '중이염'] },
  { id: 'skin_irritation', label: '피부 자극/염증', group: 'ACUTE', category: '피부', keywords: ['피부염', '발진'] },
  { id: 'doms', label: '근육통(DOMS)', group: 'ACUTE', category: '근육', keywords: ['근육통', '뻐근함'] },
  { id: 'menstruation', label: '생리 주기 영향', group: 'ACUTE', category: '생리', keywords: ['월경', '생리통'] },
  { id: 'fatigue_high', label: '피로 高', group: 'ACUTE', category: '피로', keywords: ['피곤', '탈진'] },
  { id: 'openwater_cold', label: '오픈워터-저수온', group: 'ACUTE', category: '환경', keywords: ['찬물', '저수온'] },
  { id: 'allergy', label: '알레르기/천식', group: 'ACUTE', category: '호흡기', keywords: ['알레르기', '천식', '호흡곤란'] },
  { id: 'gi_discomfort', label: '위장 불편', group: 'ACUTE', category: '소화기', keywords: ['소화불량', '복통'] },

  // ===== CHRONIC (질환·특수상황) =====
  // 어깨
  { id: 'shoulder_impingement', label: '어깨 충돌', group: 'CHRONIC', category: '어깨', keywords: ['impingement', '충돌증후군'] },
  { id: 'rotator_cuff_irritation', label: '회전근개 과민', group: 'CHRONIC', category: '어깨', keywords: ['회전근개', 'rotator cuff'] },
  { id: 'scapular_dyskinesis', label: '견갑 불균형', group: 'CHRONIC', category: '어깨', keywords: ['견갑골', '날개뼈'] },
  { id: 'labral_irritation', label: '관절와순 손상', group: 'CHRONIC', category: '어깨', keywords: ['labrum', '관절순'] },
  { id: 'ac_joint_pain', label: 'AC 관절 통증', group: 'CHRONIC', category: '어깨', keywords: ['견봉쇄골관절'] },
  
  // 무릎
  { id: 'patellofemoral_pain', label: '무릎 PFPS', group: 'CHRONIC', category: '무릎', keywords: ['슬개대퇴', 'runner\'s knee'] },
  { id: 'patellar_tendinopathy', label: '슬개건 통증', group: 'CHRONIC', category: '무릎', keywords: ['jumper\'s knee', '슬개건염'] },
  { id: 'it_band_syndrome', label: '장경인대(ITB)', group: 'CHRONIC', category: '무릎', keywords: ['ITB', '장경인대증후군'] },
  { id: 'meniscus_irritation', label: '반월상연골 손상', group: 'CHRONIC', category: '무릎', keywords: ['반월판', 'meniscus'] },
  
  // 허리
  { id: 'lumbar_extension_intolerance', label: '허리 신전 민감', group: 'CHRONIC', category: '허리', keywords: ['요추신전', '허리펴기'] },
  { id: 'lumbar_flexion_intolerance', label: '허리 굴곡 민감', group: 'CHRONIC', category: '허리', keywords: ['요추굴곡', '허리굽히기'] },
  { id: 'disc_herniation', label: '추간판탈출증', group: 'CHRONIC', category: '허리', keywords: ['디스크', 'herniation'] },
  { id: 'spinal_stenosis', label: '척추관협착증', group: 'CHRONIC', category: '허리', keywords: ['협착증', 'stenosis'] },
  { id: 'lumbar_spinal_stenosis', label: '요추관협착증', group: 'CHRONIC', category: '허리', keywords: ['요추협착', 'lumbar stenosis'] },
  
  // 목
  { id: 'cervical_strain', label: '목 긴장', group: 'CHRONIC', category: '목', keywords: ['경추', '목통증'] },
  { id: 'thoracic_outlet_syndrome', label: '흉곽출구증후군', group: 'CHRONIC', category: '목/어깨', keywords: ['TOS', '흉곽출구'] },
  
  // 고관절
  { id: 'hip_fai_irritation', label: '고관절 FAI', group: 'CHRONIC', category: '고관절', keywords: ['FAI', 'femoroacetabular'] },
  { id: 'hip_flexor_strain', label: '고관절 굴곡근 긴장', group: 'CHRONIC', category: '고관절', keywords: ['장요근', 'iliopsoas'] },
  { id: 'groin_adductor_strain', label: '서혜부 내전근 긴장', group: 'CHRONIC', category: '고관절', keywords: ['내전근', 'groin'] },
  
  // 발목/발
  { id: 'achilles_tendinopathy', label: '아킬레스', group: 'CHRONIC', category: '발목', keywords: ['아킬레스건', 'achilles'] },
  { id: 'plantar_fasciitis', label: '족저근막', group: 'CHRONIC', category: '발', keywords: ['족저근막염', 'PF'] },
  { id: 'ankle_sprain_history', label: '발목 염좌 이력', group: 'CHRONIC', category: '발목', keywords: ['발목접질림', 'sprain'] },
  
  // 팔꿈치/손목
  { id: 'medial_epicondylitis', label: '골프 엘보', group: 'CHRONIC', category: '팔꿈치', keywords: ['내측상과염', 'golfer\'s elbow'] },
  { id: 'lateral_epicondylitis', label: '테니스 엘보', group: 'CHRONIC', category: '팔꿈치', keywords: ['외측상과염', 'tennis elbow'] },
  { id: 'wrist_tendinopathy', label: '손목 건염', group: 'CHRONIC', category: '손목', keywords: ['손목통증', 'wrist'] },
  
  // 전신/내과
  { id: 'long_covid_fatigue', label: '장기 COVID 피로', group: 'CHRONIC', category: '전신', keywords: ['롱코비드', 'long covid'] },
  { id: 'general_deconditioning', label: '전신 컨디션 저하', group: 'CHRONIC', category: '전신', keywords: ['디컨디셔닝', '체력저하'] },
  { id: 'chronic_fatigue_syndrome', label: '만성피로증후군', group: 'CHRONIC', category: '전신', keywords: ['CFS', '만성피로'] },
  { id: 'fibromyalgia', label: '섬유근육통', group: 'CHRONIC', category: '전신', keywords: ['fibromyalgia', '근육통'] },
  
  // 심폐
  { id: 'asthma_exercise', label: '운동성 천식', group: 'CHRONIC', category: '호흡기', keywords: ['천식', 'EIB'] },
  { id: 'copd', label: 'COPD', group: 'CHRONIC', category: '호흡기', keywords: ['만성폐쇄성폐질환'] },
  { id: 'hypertension_controlled', label: '조절된 고혈압', group: 'CHRONIC', category: '심혈관', keywords: ['고혈압', 'HTN'] },
  { id: 'arrhythmia', label: '부정맥', group: 'CHRONIC', category: '심혈관', keywords: ['심장부정맥'] },
  
  // 대사
  { id: 'diabetes_type2', label: '제2형 당뇨병', group: 'CHRONIC', category: '대사', keywords: ['당뇨', 'T2DM'] },
  { id: 'obesity', label: '비만', group: 'CHRONIC', category: '대사', keywords: ['과체중'] },
  
  // 특수 상황
  { id: 'pregnancy_trimester1', label: '임신 1분기', group: 'CHRONIC', category: '임신', keywords: ['임산부', '초기임신'] },
  { id: 'pregnancy_trimester2', label: '임신 2분기', group: 'CHRONIC', category: '임신', keywords: ['임산부', '중기임신'] },
  { id: 'pregnancy_trimester3', label: '임신 3분기', group: 'CHRONIC', category: '임신', keywords: ['임산부', '후기임신'] },
  { id: 'postpartum', label: '산후 회복', group: 'CHRONIC', category: '산후', keywords: ['출산후', 'postpartum'] },
  { id: 'post_surgery_shoulder', label: '어깨 수술 후', group: 'CHRONIC', category: '수술후', keywords: ['어깨수술', 'post-op'] },
  { id: 'post_surgery_knee', label: '무릎 수술 후', group: 'CHRONIC', category: '수술후', keywords: ['무릎수술', 'ACL'] },
  
  // 정신건강
  { id: 'anxiety_disorder', label: '불안장애', group: 'CHRONIC', category: '정신건강', keywords: ['불안', 'anxiety'] },
  { id: 'depression', label: '우울증', group: 'CHRONIC', category: '정신건강', keywords: ['우울', 'depression'] },
  
  // 피부
  { id: 'eczema', label: '습진/아토피', group: 'CHRONIC', category: '피부', keywords: ['아토피', 'eczema'] },
  { id: 'psoriasis', label: '건선', group: 'CHRONIC', category: '피부', keywords: ['건선', 'psoriasis'] },
  
  // 신경
  { id: 'peripheral_neuropathy', label: '말초신경병증', group: 'CHRONIC', category: '신경', keywords: ['신경병증', 'neuropathy'] },
  { id: 'migraine', label: '편두통', group: 'CHRONIC', category: '신경', keywords: ['두통', 'migraine'] },
  
  // 추가 어깨 질환 (수영 특화)
  { id: 'shoulder_bursitis', label: '어깨 점액낭염', group: 'CHRONIC', category: '어깨', keywords: ['어깨염증', 'bursitis', '어깨', '점액낭'] },
  { id: 'shoulder_tendinitis', label: '어깨 건염', group: 'CHRONIC', category: '어깨', keywords: ['어깨건염', 'tendinitis', '어깨', '건'] },
  { id: 'shoulder_instability', label: '어깨 불안정성', group: 'CHRONIC', category: '어깨', keywords: ['어깨탈구', 'instability', '어깨', '불안정'] },
  { id: 'shoulder_arthritis', label: '어깨 관절염', group: 'CHRONIC', category: '어깨', keywords: ['어깨관절염', 'arthritis', '어깨', '관절염'] },
  { id: 'shoulder_fracture_history', label: '어깨 골절 이력', group: 'CHRONIC', category: '어깨', keywords: ['어깨골절', 'fracture', '어깨', '골절'] },
  { id: 'shoulder_nerve_impingement', label: '어깨 신경 압박', group: 'CHRONIC', category: '어깨', keywords: ['어깨신경', 'nerve', '어깨', '신경'] },
  { id: 'biceps_tendinopathy', label: '이두근건염', group: 'CHRONIC', category: '어깨', keywords: ['이두근', 'biceps', '어깨', '건염'] },
  { id: 'subacromial_bursitis', label: '견봉하 점액낭염', group: 'CHRONIC', category: '어깨', keywords: ['견봉', 'subacromial', '어깨', '점액낭'] },
  { id: 'shoulder_labral_tear', label: '관절와순 파열', group: 'CHRONIC', category: '어깨', keywords: ['관절순', 'labral tear', '어깨', '파열'] },
  { id: 'frozen_shoulder', label: '오십견/동결견', group: 'CHRONIC', category: '어깨', keywords: ['오십견', 'frozen shoulder', '어깨', '동결'] },
  { id: 'thoracic_outlet_syndrome', label: '흉곽출구증후군', group: 'CHRONIC', category: '어깨', keywords: ['TOS', 'thoracic outlet', '어깨', '흉곽'] },
  
  // 추가 정신건강
  { id: 'ptsd', label: 'PTSD', group: 'CHRONIC', category: '정신건강', keywords: ['외상후스트레스', 'ptsd'] },
  { id: 'vestibular_disorder', label: '전정기능장애', group: 'CHRONIC', category: '신경', keywords: ['어지럼증', 'vertigo'] },
];

