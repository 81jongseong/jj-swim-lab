/**
 * 🏊‍♂️ JJ Swim Lab - 훈련법 카탈로그
 * 
 * 📋 **기능:**
 * - 15가지 훈련법 정의 (정의·목표·장단점·주의·예시)
 * - 목적별 훈련법 분류
 * - 드릴 권장 목록
 */

import { TrainingMethod, Zone } from './types';

export const TRAINING_METHODS: TrainingMethod[] = [
  {
    id: 'technique',
    name: '기술 훈련',
    definition: '수영 기술 향상을 위한 집중적인 연습',
    whenToUse: ['기술 교정이 필요한 경우', '초보자 적응기', '부상 회복 후'],
    goals: ['자세/밸런스/타이밍 교정', '스트로크 효율 향상'],
    pros: ['기술 향상', '효율성 증대', '부상 예방', '자신감 향상'],
    cons: ['속도가 느림', '지루할 수 있음', '시간이 오래 걸림'],
    cautions: ['올바른 자세 유지', '과도한 반복 피하기', '통증 발생 시 중단'],
    examples25: ['드릴 6×25m, 레스트 20s', '드릴 4×50m, 레스트 20s'],
    examples50: ['드릴 6×50m, 레스트 20s'],
    zones: ['Z1', 'Z2'],
    recommendedDrillIds: ['catch_up', 'fingertip_drag', '6_1_6', 'scull_front', 'single_arm']
  },
  {
    id: 'aerobic_en1',
    name: '유산소 EN1(이지)',
    definition: '기초 지구력 향상을 위한 저강도 지속 수영',
    whenToUse: ['기초 체력 구축', '회복일', '고혈압/정형외과 환자'],
    goals: ['기초 지구력', '회복 촉진', '기초 체력 구축'],
    pros: ['심폐기능 향상', '지구력 증진', '칼로리 소모', '스트레스 해소'],
    cons: ['속도 향상 효과 제한', '시간이 오래 걸림'],
    cautions: ['충분한 준비운동', '수분 섭취', '과도한 운동량 피하기'],
    examples25: ['8×50m @ 쉬운 페이스', '6×100m @ 쉬운 페이스'],
    examples50: ['6×100m', '4×200m'],
    zones: ['Z1', 'Z2'],
    recommendedDrillIds: ['fist_swim', '6_kick_switch']
  },
  {
    id: 'aerobic_en2',
    name: '유산소 EN2(중강도)',
    definition: '지속 지구력과 경제성 개선을 위한 중강도 수영',
    whenToUse: ['기초 체력 확보 후', '지구력 향상 목표', '체중 감량'],
    goals: ['지속 지구력', '경제성 개선', '지구력 증진'],
    pros: ['지구력 향상', '경제성 개선', '칼로리 소모', '체력 향상'],
    cons: ['신규자에게 부담', '단조로움'],
    cautions: ['신규자 과볼륨 금지', '점진적 강도 증가', '충분한 휴식'],
    examples25: ['10×100m @ 일정 페이스', '5×200m steady'],
    examples50: ['6×200m steady'],
    zones: ['Z2'],
    recommendedDrillIds: ['scull_mid', 'scull_back', 'single_arm']
  },
  {
    id: 'threshold',
    name: '임계/템포(Threshold/CSS)',
    definition: '라텍스 steady-state 향상을 위한 임계점 훈련',
    whenToUse: ['기록 향상 목표', '지구력 향상', '경쟁 준비'],
    goals: ['라텍스 steady-state 향상', '레이스 테크닉 유지'],
    pros: ['지구력 향상', '경제성 개선', '기록 향상'],
    cons: ['고강도로 인한 피로', '단조로움'],
    cautions: ['과한 단조성(monotony) 주의', '충분한 휴식', '점진적 강도 증가'],
    examples25: ['8×100m @ CSS±', '4×200m @ CSS±'],
    examples50: ['6×100m @ CSS±', '4×200m @ CSS±'],
    zones: ['Z3'],
    recommendedDrillIds: ['scull_mid', 'scull_back', 'single_arm']
  },
  {
    id: 'vo2max',
    name: 'VO₂max',
    definition: '최대산소섭취력 자극을 위한 고강도 간헐 훈련',
    whenToUse: ['기록 향상 목표', '속도 향상', '경쟁 준비'],
    goals: ['최대산소섭취력 자극', '속도내성 향상'],
    pros: ['속도 향상', '파워 개발', '기록 향상'],
    cons: ['고강도로 인한 피로', '부상 위험'],
    cautions: ['고혈압/현기증 과거력 시 용량 축소', '충분한 휴식', '점진적 강도 증가'],
    examples25: ['12×50m @ 강하게', '8×75m @ 강하게'],
    examples50: ['10×50m', '6×100m'],
    zones: ['Z4'],
    recommendedDrillIds: ['turns_streamline']
  },
  {
    id: 'sprint',
    name: '스프린트/신경(Sprint/Power)',
    definition: '신경근 파워와 출발/브레이크아웃 품질 향상',
    whenToUse: ['속도 향상 목표', '출발 기술 향상', '경쟁 준비'],
    goals: ['신경근 파워', '출발/브레이크아웃 품질'],
    pros: ['속도 향상', '파워 개발', '출발 기술 향상'],
    cons: ['고강도로 인한 피로', '부상 위험'],
    cautions: ['충분한 휴식 필수', '관절 통증 시 즉시 중단', '점진적 강도 증가'],
    examples25: ['16×25m @ all-out, full rest', '8×25m UW 돌핀 + 25m easy'],
    examples50: ['12×25m all-out', '8×50m broken'],
    zones: ['Z5'],
    recommendedDrillIds: ['turns_streamline', 'body_dolphin']
  },
  {
    id: 'kick',
    name: '킥 집중',
    definition: '하체 추진과 리듬, 체간안정 강화',
    whenToUse: ['킥 기술 향상', '하체 근력 강화', '균형감 개선'],
    goals: ['하체 추진/리듬', '체간안정 강화'],
    pros: ['킥 기술 향상', '하체 근력 강화', '균형감 개선'],
    cons: ['상체 근력 향상 제한', '단조로움'],
    cautions: ['요추 과신전/발목 통증 주의', '점진적 강도 증가'],
    examples25: ['8×50m 킥(보드/사이드)', '6×50m 돌핀 킥'],
    examples50: ['6×50m 킥', '4×100m 킥'],
    zones: ['Z2', 'Z3'],
    recommendedDrillIds: ['6_1_6', 'body_dolphin', 'kick_on_back']
  },
  {
    id: 'pull',
    name: '풀 집중',
    definition: '상지 추진과 캐치/프레스 감각 향상',
    whenToUse: ['상체 근력 강화', '풀 기술 향상', '균형감 개선'],
    goals: ['상지 추진', '캐치/프레스 감각'],
    pros: ['상체 근력 강화', '풀 기술 향상', '추진력 향상'],
    cons: ['하체 근력 향상 제한', '단조로움'],
    cautions: ['패들 과부하 주의(어깨/팔꿈치)', '점진적 강도 증가'],
    examples25: ['6×100m 풀부이', '4×150m 풀부이'],
    examples50: ['4×200m 풀부이'],
    zones: ['Z2', 'Z3'],
    recommendedDrillIds: ['scull_front', 'scull_mid', 'fist_swim']
  },
  {
    id: 'hypoxic',
    name: '하이폭식(안전범위)',
    definition: '호흡 효율과 CO₂ 내성 향상, 오픈워터 사이팅 연계',
    whenToUse: ['호흡 기술 향상', '오픈워터 준비', '고급자 훈련'],
    goals: ['호흡 효율/CO₂ 내성', '오픈워터 사이팅 연계'],
    pros: ['호흡 효율 향상', 'CO₂ 내성 향상', '오픈워터 기술 향상'],
    cons: ['현기증 위험', '고강도'],
    cautions: ['과호흡 금지', '감독 하에 실행', '현기증/두통 즉시 중단'],
    examples25: ['3/5/7 래더 6×50m', '마지막 7.5~10m 노브리드×6'],
    examples50: ['3/5/7 4×100m'],
    zones: ['Z2'],
    recommendedDrillIds: ['hypoxic_3_5_7', 'tarzan']
  },
  {
    id: 'im',
    name: '개인혼영(IM) 전환',
    definition: '전환기술과 다영법 조합 체력 향상',
    whenToUse: ['혼영 기술 향상', '전환 기술 향상', '다양한 영법 훈련'],
    goals: ['전환기술', '다영법 조합 체력'],
    pros: ['혼영 기술 향상', '전환 기술 향상', '다양한 영법 훈련'],
    cons: ['복잡한 기술', '고강도'],
    cautions: ['점진적 강도 증가', '올바른 기술 유지'],
    examples25: ['4×100m IM order', '8×50m (FL/BK/BR/FR)'],
    examples50: ['4×100m IM', '6×50m 전환드릴'],
    zones: ['Z2', 'Z3'],
    recommendedDrillIds: ['fly_3_3_3', 'double_arm', 'pull_breathe_kick_glide', 'turns_streamline']
  },
  {
    id: 'skills',
    name: '스타트·턴·브레이크아웃',
    definition: '출발·푸시오프 품질과 브레이크아웃 거리 표준화',
    whenToUse: ['출발 기술 향상', '턴 기술 향상', '경쟁 준비'],
    goals: ['출발·푸시오프 품질', '브레이크아웃 거리 표준화'],
    pros: ['출발 기술 향상', '턴 기술 향상', '기록 향상'],
    cons: ['고강도', '부상 위험'],
    cautions: ['충분한 휴식', '점진적 강도 증가', '안전한 환경'],
    examples25: ['15m/25m 스타트 반복', '턴+브레이크아웃 드릴 12×25m'],
    examples50: ['스트림라인 15m 유지 반복', '파일럿 세트 8×50m(턴 연습)'],
    zones: ['Z1', 'Z2', 'Z5'],
    recommendedDrillIds: ['turns_streamline', 'body_dolphin']
  },
  {
    id: 'openwater',
    name: '오픈워터 스킬',
    definition: '사이팅/드래프팅과 직선 유영 기술',
    whenToUse: ['오픈워터 준비', '사이팅 기술 향상', '드래프팅 기술 향상'],
    goals: ['사이팅/드래프팅', '직선 유영'],
    pros: ['오픈워터 기술 향상', '사이팅 기술 향상', '드래프팅 기술 향상'],
    cons: ['특수 기술', '고강도'],
    cautions: ['안전한 환경', '점진적 강도 증가'],
    examples25: ['사이팅 3스트로크마다 25m×8', '헤드업 25m + 이지 25m ×6'],
    examples50: ['헤드업 50m ×6', '사이팅 50m ×6'],
    zones: ['Z2', 'Z3'],
    recommendedDrillIds: ['tarzan', 'hypoxic_3_5_7']
  },
  {
    id: 'recovery',
    name: '회복 수영',
    definition: '피로 회복과 활성 회복을 위한 저강도 수영',
    whenToUse: ['고강도 훈련 후', '회복일', '피로 회복'],
    goals: ['피로 회복', '활성 회복', '혈액 순환 개선'],
    pros: ['피로 회복', '활성 회복', '혈액 순환 개선', '스트레스 해소'],
    cons: ['기록 향상 효과 제한'],
    cautions: ['편안한 속도 유지', '무리하지 않기'],
    examples25: ['8×50m @ 매우 쉬운 페이스', '6×100m @ 매우 쉬운 페이스'],
    examples50: ['6×100m @ 매우 쉬운 페이스', '4×200m @ 매우 쉬운 페이스'],
    zones: ['Z1'],
    recommendedDrillIds: ['easy_swim', '6_kick_switch']
  },
  {
    id: 'endurance',
    name: '지구력 수영',
    definition: '장시간 지속 수영을 통한 심폐지구력 향상',
    whenToUse: ['지구력 향상 목표', '장거리 준비', '체력 향상'],
    goals: ['심폐지구력 향상', '지속력 향상', '체력 향상'],
    pros: ['지구력 향상', '체력 향상', '칼로리 소모', '심폐기능 향상'],
    cons: ['시간이 오래 걸림', '단조로움'],
    cautions: ['점진적 강도 증가', '충분한 수분 섭취', '과도한 운동량 피하기'],
    examples25: ['20×50m @ 일정 페이스', '10×100m @ 일정 페이스'],
    examples50: ['15×100m @ 일정 페이스', '8×200m @ 일정 페이스'],
    zones: ['Z2', 'Z3'],
    recommendedDrillIds: ['fist_swim', '6_kick_switch', 'scull_mid']
  }
];










