/**
 * SwimLab Data Pack v4 - 훈련법 카탈로그 (25개)
 * 
 * 새로운 구조: title, whenToUse, whoShouldUse, howToDo, intensityAndVolume, 
 * pros, cons, cautions, category, recommendedDrills, evidence
 * 
 * 관련 파일:
 * - client/src/swimlab/types/index.ts (TrainingMethod 인터페이스)
 * - client/src/swimlab/data/drills.ts (연동되는 드릴 데이터)
 * - client/app/admin/swim-training-engine/page.tsx (UI 표시)
 */

import { TrainingMethod } from '../types';

export const TRAINING_METHODS: TrainingMethod[] = [
  {
    id: '01',
    title: '어센딩 인터벌',
    whenToUse: '페이스 조절과 후반 피니시 강화를 노릴 때',
    whoShouldUse: 'CSS 기반 페이스 훈련에 익숙한 중급 이상',
    howToDo: '4×100m: CSS+6″→+4″→+2″→CSS, r20″',
    intensityAndVolume: 'Z3~Z4, 400~800m, 주 1~2회',
    pros: '분배 능력·집중력·후반 유지력 강화',
    cons: '페이스 감각 부족 시 효율 감소',
    cautions: '초반 과속 금지, 스트로크 품질 우선',
    category: 'RaceStrategy',
    recommendedDrills: ['D28','D29','D01'],
    evidence: [
      {label:'CSS 개요/활용', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10875687/'}
    ]
  },
  {
    id: '02',
    title: '디센딩 인터벌(반복마다 기록 단축)',
    whenToUse: '피로 속 가속 능력·스피드 감각 향상',
    whoShouldUse: '중상급, 50/100/200 기록 향상 목표자',
    howToDo: '4×50m: 40″→38″→36″→34″, r15″',
    intensityAndVolume: 'Z4~Z5, 200~400m, 주 1회',
    pros: '스피드·후반 가속력 강화',
    cons: '회복 부족 시 기술 붕괴',
    cautions: '워밍업 충분, 호흡 리듬 유지',
    category: 'Speed',
    recommendedDrills: ['D37','D36','D16'],
    evidence: [
      {label:'반복 스프린트 회복비', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10356687/'}
    ]
  },
  {
    id: '03',
    title: '네거티브 스플릿(후반 가속)',
    whenToUse: '장거리 레이스 전략·분배 능력 훈련',
    whoShouldUse: '모든 수준(초보자는 거리 축소)',
    howToDo: '2×400m: 전반 steady, 후반 CSS~CSS-2″',
    intensityAndVolume: 'Z2→Z3~Z4, 800~1200m, 주 1회',
    pros: '에너지 보존·후반 추진력 강화',
    cons: '전반 과도 완화 시 전체 기록 저하',
    cautions: '스플릿 기록 체크, 후반 기술 유지',
    category: 'RaceStrategy',
    recommendedDrills: ['D28','D29','D01'],
    evidence: [
      {label:'임계속도·페이스 근거', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8107465/'}
    ]
  },
  {
    id: '04',
    title: '빌드업 200',
    whenToUse: '한 거리 내 가속 감각·피니시 품질 강화',
    whoShouldUse: '모든 수준(중급 이상 권장)',
    howToDo: '3×200m: 50m마다 페이스↑, 마지막 50m 강하게',
    intensityAndVolume: 'Z2→Z4/5, 600~1000m, 주 1~2회',
    pros: '가속 능력·피니시 품질 향상',
    cons: '과가속 시 초반 탈진',
    cautions: '템포 증가에도 스트로크 길이 유지',
    category: 'Speed',
    recommendedDrills: ['D10','D11','D29'],
    evidence: [
      {label:'스트로크 효율·리듬', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9909090/'}
    ]
  },
  {
    id: '05',
    title: '템포 홀드(CSS 유지)',
    whenToUse: '지속 페이스 유지·경제성 향상',
    whoShouldUse: 'CSS 산출자 전원',
    howToDo: '3×400m @CSS, r30″, 템포 일정 유지(메트로놈 권장)',
    intensityAndVolume: 'Z3, 1200~1600m, 주 1회',
    pros: '지구력·페이스 안정성↑',
    cons: '단조로울 수 있음',
    cautions: '템포·스플릿 주기적 확인',
    category: 'Endurance',
    recommendedDrills: ['D29','D28','D01'],
    evidence: [
      {label:'CSS·MLSS 근거', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8107465/'}
    ]
  },
  {
    id: '06',
    title: '역치(Threshold/LT) 인터벌',
    whenToUse: '젖산 역치·지속 속도 유지력 향상',
    whoShouldUse: '기본 지구력 보유 중급 이상',
    howToDo: '8×100m @LT, r15~30″ (4+4, 묶음 간 1′)',
    intensityAndVolume: 'Z3~Z4, 800~1600m, 주 1회',
    pros: '젖산 내성·유지력 강화',
    cons: '피로 누적 시 자세 붕괴',
    cautions: '페이스 과대 설정 금지',
    category: 'Endurance',
    recommendedDrills: ['D29','D28','D35'],
    evidence: [
      {label:'MLSS/LT와 성능', url:'https://www.nature.com/articles/s41598-023-36983-8'}
    ]
  },
  {
    id: '07',
    title: '레이스 페이스(USRPT 스타일)',
    whenToUse: '목표 경기 페이스 정밀 적응',
    whoShouldUse: '중상급·대회 준비기',
    howToDo: '20×25m @목표 100/200 페이스, 실패 시 1~2회 휴식 후 재개',
    intensityAndVolume: 'Z4~Z5, 500~800m, 주 1~2회',
    pros: '페이스 정확도·경제성 향상',
    cons: '정신적 부담·성공률 관리 필요',
    cautions: '짧고 엄격한 휴식(10~20″) 유지',
    category: 'RaceStrategy',
    recommendedDrills: ['D29','D17','D37'],
    evidence: [
      {label:'USRPT 리뷰', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6789176/'}
    ]
  },
  {
    id: '08',
    title: '스프린트 반복(무산소 파워)',
    whenToUse: '최대 속도·신경계 자극',
    whoShouldUse: '상급·스프린트 목표자',
    howToDo: '10×25m all-out r1′30″ 또는 8×50m all-out r2′',
    intensityAndVolume: 'Z5, 250~400m, 주 1회',
    pros: '최고 속도·출력 향상',
    cons: '과부하·회복 지연 위험',
    cautions: '1:5~1:8 휴식비 유지, 쿨다운 철저',
    category: 'Speed',
    recommendedDrills: ['D16','D37','D38'],
    evidence: [
      {label:'반복 스프린트·회복비', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10356687/'}
    ]
  },
  {
    id: '09',
    title: '킥 파워 집중',
    whenToUse: '하체 추진력·밸런스 강화',
    whoShouldUse: '모든 수준(허리·무릎 민감자는 주의)',
    howToDo: '6×50m 킥보드 킥 @Z3 r20″ + 4×25m 하드 킥 @Z4 r30″',
    intensityAndVolume: 'Z3~Z4, 400~600m, 주 1~2회',
    pros: '킥 속도·체간 안정↑',
    cons: '허리/고관절 피로',
    cautions: '과신전 금지, 호흡 리듬 유지',
    category: 'Technique',
    recommendedDrills: ['D13','D14','D15'],
    evidence: [
      {label:'스트림라인·킥의 중요', url:'https://www.usaswimming.org/news/2021/10/05/five-freestyle-tips-to-start-your-season'}
    ]
  },
  {
    id: '10',
    title: '풀 집중(Pull Buoy)',
    whenToUse: '상지 근지구력·라인 유지 강화',
    whoShouldUse: '모든 수준(하체 회복일에 유용)',
    howToDo: '5×200m Pull steady, r20~30″',
    intensityAndVolume: 'Z2~Z3, 1000~1500m, 주 1회',
    pros: '상지 지구력·정렬 유지',
    cons: '킥 약화·균형감 저하 가능',
    cautions: '팔꿈치 높이 유지·좌우 비대칭 점검',
    category: 'Endurance',
    recommendedDrills: ['D35','D36','D05'],
    evidence: [
      {label:'스트로크 효율 메타', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9909090/'}
    ]
  },
  {
    id: '11',
    title: '패들 파워',
    whenToUse: '스트로크 힘·캐치 효율 강화',
    whoShouldUse: '중급 이상(어깨 민감자 소형 패들)',
    howToDo: '12×50m 패들 @Z3~Z4, r20″ (3×4)',
    intensityAndVolume: 'Z3~Z4, 600m, 주 1회',
    pros: '추진력·물감각 향상',
    cons: '어깨 부담',
    cautions: '통증 시 즉시 중단, 오버스트로킹 금지',
    category: 'Technique',
    recommendedDrills: ['D36','D05','D20'],
    evidence: [
      {label:'팔 스트로크 효율', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC6926714/'}
    ]
  },
  {
    id: '12',
    title: '핀 보조 스피드(Assisted)',
    whenToUse: '고속 템포 감각·신경계 자극',
    whoShouldUse: '중급 이상',
    howToDo: '8×50m fins @Z3~Z4, 25m 고속 + 25m 유지, r20″',
    intensityAndVolume: 'Z3~Z4, 400m, 주 1회',
    pros: '고속 리듬·템포 체득',
    cons: '장비 의존 가능',
    cautions: '핀 해제 후 본영 연결 세트 포함',
    category: 'Speed',
    recommendedDrills: ['D37','D16','D11'],
    evidence: [
      {label:'프리 기술/리듬', url:'https://swimswam.com/freestyle-stroke-technique/'}
    ]
  },
  {
    id: '13',
    title: '스컬링·캐치 품질',
    whenToUse: '물감각·접촉 시점 교정',
    whoShouldUse: '모든 수준',
    howToDo: '30″ 스컬×6, r15″ + 50m 자유 연결',
    intensityAndVolume: 'Z1~Z2, 300~600m, 주 1~2회',
    pros: '캐치 타이밍·추진 효율↑',
    cons: '속도 향상 체감 낮음',
    cautions: '손목 과사용 금지, 팔꿈치 높이 유지',
    category: 'Technique',
    recommendedDrills: ['D05','D06','D07'],
    evidence: [
      {label:'USMS Sculling 자료', url:'https://www.usms.org/fitness-and-training/articles-and-videos/articles/sculling-drills?Oldid=324'}
    ]
  },
  {
    id: '14',
    title: '하이-로우(강·약 교대)',
    whenToUse: '회복력·변속 능력 동시 강화',
    whoShouldUse: '모든 수준(초보자는 거리 축소)',
    howToDo: '8×50m: 1개 하드(Z4)→1개 이지(Z2), r20″',
    intensityAndVolume: 'Z2↔Z4, 400~800m, 주 1회',
    pros: '심폐·회복능력 동시 자극',
    cons: '심박 변동 커서 피로 누적',
    cautions: '하드에서도 스트로크 품질 유지',
    category: 'Endurance',
    recommendedDrills: ['D01','D29','D28'],
    evidence: [
      {label:'반복 고강도 반응', url:'https://www.sciencedirect.com/science/article/pii/S1728869X21000150'}
    ]
  },
  {
    id: '15',
    title: '브로큰 100/200',
    whenToUse: '긴 거리 집중·페이스 관리 훈련',
    whoShouldUse: '중급 이상',
    howToDo: '200m=(3×50+1×50) r5~10″ ×3세트',
    intensityAndVolume: 'Z2~Z3, 600~1000m, 주 1회',
    pros: '집중력·분할 페이스 감각↑',
    cons: '설계 번거로움',
    cautions: '짧은 휴식 과다 사용 금지(흐름 유지)',
    category: 'RaceStrategy',
    recommendedDrills: ['D28','D29','D01'],
    evidence: [
      {label:'지속·페이스 훈련', url:'https://onlinelibrary.wiley.com/doi/10.1002/ejsc.12179'}
    ]
  },
  {
    id: '16',
    title: '브로큰 사다리',
    whenToUse: '지구력과 변화 적응 동시 강화',
    whoShouldUse: '중급 이상',
    howToDo: '200+150+100+50+100+150+200, 각 r15~30″',
    intensityAndVolume: 'Z2~Z4, 950m, 주 1회',
    pros: '다양한 리듬 체득, 단조로움 감소',
    cons: '페이스 관리 난도↑',
    cautions: '급격한 페이스 변화 금지',
    category: 'Endurance',
    recommendedDrills: ['D10','D11','D29'],
    evidence: [
      {label:'리듬·템포 훈련', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10616301/'}
    ]
  },
  {
    id: '17',
    title: '피라미드(거리/강도 가감)',
    whenToUse: '변속 적응·리듬 훈련',
    whoShouldUse: '모든 수준',
    howToDo: '50→100→150→100→50, r15~30″',
    intensityAndVolume: 'Z2→Z4→Z2, 450~750m, 주 1회',
    pros: '변화 내성·집중력 강화',
    cons: '후반 피로로 품질 저하 가능',
    cautions: '초·후반 과속 금지, 휴식 균형',
    category: 'RaceStrategy',
    recommendedDrills: ['D10','D11','D29'],
    evidence: [
      {label:'템포·리듬 유지', url:'https://www.journalofexpertise.org/articles/volume6_issue2/JoE_6_2_Williams_etal.pdf'}
    ]
  },
  {
    id: '18',
    title: '스트로크 카운트(SPL) 효율',
    whenToUse: '효율·경제성 개선',
    whoShouldUse: '모든 수준',
    howToDo: '10×25m: 목표 스트로크 수 이하(SPL 12 등), r15″',
    intensityAndVolume: 'Z2, 250~500m, 주 1~2회',
    pros: '글라이드·정렬 개선, 에너지 절약',
    cons: '속도 저하 가능',
    cautions: '과도 글라이드 금지',
    category: 'Technique',
    recommendedDrills: ['D28','D01','D29'],
    evidence: [
      {label:'SPL·효율 관계', url:'https://ojs.ub.uni-konstanz.de/cpa/article/view/3872/3590'}
    ]
  },
  {
    id: '19',
    title: '저호흡(표면·안전중시)',
    whenToUse: '호흡 패턴·CO₂ 내성(표면 드릴 중심) 강화',
    whoShouldUse: '숙련자, 안전감독 하에',
    howToDo: '8×50m: 3-5-7-9 호흡 패턴, r20″',
    intensityAndVolume: 'Z2~Z3, 400m, 격주 1회',
    pros: '패턴 다양화·집중력 향상',
    cons: '안전 리스크',
    cautions: '과호흡/잠영 지속 금지, 감독 동반',
    category: 'Technique',
    recommendedDrills: ['D19','D17','D18'],
    evidence: [
      {label:'Hypoxic blackout 공동 성명', url:'https://www.redcross.org/content/dam/redcross/training-services/scientific-advisory-council/2022%20Hypoxic%20Blackout%20-%20Joint%20Statement%20-%20Red%20Cross%20Y%20USA%20Swimming%2010-31-2022.pdf'}
    ]
  },
  {
    id: '20',
    title: '턴·언더워터 돌핀 킥',
    whenToUse: '스타트/턴 이후 가속·브레이크아웃 품질 향상',
    whoShouldUse: '모든 수준(허리 주의)',
    howToDo: '15×25m: 턴 후 5~10m 돌핀+스윔 연결',
    intensityAndVolume: 'Z2~Z4, 375m, 주 1~2회',
    pros: '브레이크아웃 속도·라인 향상',
    cons: '허리 피로',
    cautions: '과잠영 금지, 점진 증량',
    category: 'Technique',
    recommendedDrills: ['D27','D26','D16'],
    evidence: [
      {label:'언더워터 돌핀 킥', url:'https://swimswam.com/underwater-dolphin-kick-book/'}
    ]
  },
  {
    id: '21',
    title: '스타트 반응·브레이크아웃',
    whenToUse: '출발 반응·초속도 향상',
    whoShouldUse: '대회 준비자',
    howToDo: '10×15m 다이브 스타트 + 10~12m 브레이크아웃, r1′',
    intensityAndVolume: 'Z4~Z5(짧은 구간), 150m, 주 1회',
    pros: '초기 가속·라인 유지',
    cons: '짧은 거리로 기술 집중 필요',
    cautions: '안전요원·공간 확보',
    category: 'Speed',
    recommendedDrills: ['D26','D27','D21'],
    evidence: [
      {label:'브레이크아웃 팁', url:'https://www.usaswimming.org/news/2021/10/05/five-freestyle-tips-to-start-your-season'}
    ]
  },
  {
    id: '22',
    title: '오픈워터 모의(사이팅/드래프팅)',
    whenToUse: 'OW/트라이애슬론 대비',
    whoShouldUse: '중급 이상',
    howToDo: '6×200m: 25m마다 사이팅 2회 + 동료 드래프팅, r30″',
    intensityAndVolume: 'Z3, 1200m, 주 1회',
    pros: '방향 유지·집단 대응력↑',
    cons: '실내 풀 구현 제한',
    cautions: '접촉·충돌 주의',
    category: 'OpenWater',
    recommendedDrills: ['D30','D32','D33'],
    evidence: [
      {label:'드래프팅 저항 감소', url:'https://www.jssm.org/jssm-07-60.xml-Fulltext'}
    ]
  },
  {
    id: '23',
    title: '템포 트레이너(메트로놈) 유지',
    whenToUse: '스트로크 템포·페이스 일관화',
    whoShouldUse: '모든 수준',
    howToDo: '8×100m @CSS, 템포 0.95~1.05 s/stroke',
    intensityAndVolume: 'Z3, 800~1200m, 주 1회',
    pros: '리듬·재현성 향상',
    cons: '기기 의존 위험',
    cautions: '템포 맞추되 품질 우선',
    category: 'Endurance',
    recommendedDrills: ['D29','D28','D01'],
    evidence: [
      {label:'템포·리듬 훈련', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10616301/'}
    ]
  },
  {
    id: '24',
    title: 'IM 혼합 인터벌',
    whenToUse: '영법 전환 능력·전신 밸런스 강화',
    whoShouldUse: '중급 이상(약한 영법 거리 축소)',
    howToDo: '4×200m IM(50m씩), r20~30″',
    intensityAndVolume: 'Z3~Z4, 800~1200m, 주 1회',
    pros: '전신 조화·다양 피로 대응',
    cons: '약한 영법에서 부담↑',
    cautions: '호흡 패턴 유지',
    category: 'Endurance',
    recommendedDrills: ['D10','D22','D12'],
    evidence: [
      {label:'기술·효율 리뷰', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC9909090/'}
    ]
  },
  {
    id: '25',
    title: 'LSD(장거리 저강도) 지속 수영',
    whenToUse: '기초 지구력·심폐 기반 구축, 회복 세션',
    whoShouldUse: '모든 수준',
    howToDo: '1500~3000m 연속 또는 5×500m r30~60″',
    intensityAndVolume: 'Z1~Z2, 1500~3000m, 주 1회',
    pros: '기반 체력·경제성 향상, 관절 부담 적음',
    cons: '속도 향상 제한·지루함',
    cautions: '자세 흐트러짐 주의, 과도한 거리 금지',
    category: 'Endurance',
    recommendedDrills: ['D35','D01','D28'],
    evidence: [
      {label:'지속운동·임계속도', url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC8107465/'}
    ]
  }
];

// 편의 함수: ID로 훈련법 찾기
export function findMethodById(id: string): TrainingMethod | undefined {
  return TRAINING_METHODS.find(m => m.id === id);
}

// 편의 함수: 카테고리로 필터링
export function getMethodsByCategory(category: TrainingMethod['category']): TrainingMethod[] {
  return TRAINING_METHODS.filter(m => m.category === category);
}



