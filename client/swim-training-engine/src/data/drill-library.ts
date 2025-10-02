/**
 * 🏊‍♂️ JJ Swim Lab — Drills & Training Types Library (v1)
 * 목적
 *  - 드릴/훈련종류를 전문가 수준으로 체계화하고, 어디에 도움이 되는지 '도움말'까지 제공
 *  - 25m/50m 풀 모두에서 바로 쓰기 좋게 권장 랩수·레스트·존을 포함
 *  - 네가 커스터마이즈(추가/수정)할 수 있도록 확장 API 제공
 *
 * 통합: swim-planner.v2.ts 와 함께 사용하면, 세션 빌드 시 추천 드릴/훈련을 주입 가능
 */

// ========================== Types ==========================
export type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';
export type IntensityZone = 'Z1'|'Z2'|'Z3'|'Z4'|'Z5';
export type SkillTarget =
  | '스트림라인/자세'
  | '롤링/체간'
  | '캐치/물잡기'
  | '풀/프레스'
  | '킥/리듬'
  | '호흡/하이폭식'
  | '타이밍/조합'
  | '회전/턴'
  | '스타트/브레이크아웃'
  | '시야/오픈워터'
  | '근지구력'
  | '스프린트 신경';

export interface Drill {
  id: string;
  name: string;
  strokes: Stroke[];
  skillTargets: SkillTarget[];
  typicalUse: {
    zones: IntensityZone[];
    repLaps25: number[];    // 25m 풀에서 권장 랩(예: [1,2])
    repLaps50: number[];    // 50m 풀에서 권장 랩(예: [1])
    restSec: [number, number]; // 권장 레스트 범위
  };
  helps: string[];          // 어디에/왜 유용한지
  cues: string[];           // 코칭 큐
  cautions?: string[];      // 주의(건강/관절/안전)
}

export interface TrainingType {
  id: string;                // 'technique'|'aerobic_en1'|'aerobic_en2'|'threshold'|'vo2'|'sprint'|'kick'|'pull'|'hypoxic'|'im'|'skills'|'openwater'
  name: string;
  goals: string[];           // 훈련 목적
  zones: IntensityZone[];    // 주 사용 존
  restSec: [number, number]; // 세트 간 레스트 범위
  repPatterns25: string[];   // 25m 풀 예시 패턴
  repPatterns50: string[];   // 50m 풀 예시 패턴
  metrics: string[];         // RPE, 페이스, 스트로크카운트 등
  goodFor?: string[];        // 권장 상황(건강/전술)
  cautions?: string[];       // 주의 상황
  recommendedDrills?: string[]; // Drill id 목록
}

// ========================== Drill Catalog ==========================
export const DRILLS: Drill[] = [
  // —— Freestyle Core ——
  {
    id: 'fs_catch_up',
    name: 'Catch-up (캐치업)',
    strokes: ['freestyle'],
    skillTargets: ['타이밍/조합','스트림라인/자세','캐치/물잡기'],
    typicalUse: { zones: ['Z1','Z2'], repLaps25: [1,2], repLaps50: [1], restSec: [10,20] },
    helps: ['양팔 간 타이밍 정렬','글라이드 유지로 수평자세 강화','빠른 팔 돌림 습관 교정'],
    cues: ['앞팔 정지 → 뒤팔 진입','롱 스트로크','허리 꺾임 없이 길게'],
  },
  {
    id: 'fs_fingertip_drag',
    name: 'Fingertip Drag (지퍼/핑거팁)',
    strokes: ['freestyle'],
    skillTargets: ['롤링/체간','타이밍/조합'],
    typicalUse: { zones: ['Z1'], repLaps25: [1], repLaps50: [1], restSec: [10,20] },
    helps: ['엘보 하이 포지션 감각','리커버리 궤적 안정','불필요한 어깨 들썩임 억제'],
    cues: ['팔꿈치 먼저','손끝이 수면 스치기','부드럽게 앞으로'],
  },
  {
    id: 'fs_6_1_6',
    name: '6-1-6 사이드 킥',
    strokes: ['freestyle'],
    skillTargets: ['킥/리듬','롤링/체간','스트림라인/자세'],
    typicalUse: { zones: ['Z1','Z2'], repLaps25: [1,2], repLaps50: [1], restSec: [15,25] },
    helps: ['측면 균형 및 호흡 시 정렬','킥 리듬과 상지 타이밍 연결'],
    cues: ['엉덩이-갈비-귀 일직선','아랫쪽 귀 물에 잠기게','작고 빠른 킥'],
  },
  {
    id: 'fs_single_arm',
    name: '싱글암 프리스타일(스노클 권장)',
    strokes: ['freestyle'],
    skillTargets: ['캐치/물잡기','풀/프레스','타이밍/조합'],
    typicalUse: { zones: ['Z1','Z2'], repLaps25: [1,2], repLaps50: [1], restSec: [15,25] },
    helps: ['한 팔 캐치 감각 강화','크로스오버 교정','호흡 편측화 습관 교정'],
    cues: ['입수-캐치-프레스 분리 인지','엄지보다 팔꿈치가 먼저 하강'],
  },
  {
    id: 'fs_fist_swim',
    name: '주먹쥔 수영(Fist Swim)',
    strokes: ['freestyle','backstroke'],
    skillTargets: ['캐치/물잡기'],
    typicalUse: { zones: ['Z1','Z2'], repLaps25: [1], repLaps50: [1], restSec: [10,20] },
    helps: ['전완으로 물 감기(폼드릴)','패들 과사용 보정'],
    cues: ['손보다 전완으로 밀기','스트로크 짧아지지 않게'],
  },
  {
    id: 'scull_front',
    name: '스컬 프론트(#1)',
    strokes: ['freestyle','backstroke','butterfly','breaststroke'],
    skillTargets: ['캐치/물잡기'],
    typicalUse: { zones: ['Z1'], repLaps25: [1], repLaps50: [1], restSec: [10,20] },
    helps: ['초기 캐치 각도 감각','손·전완 압력 방향 인지'],
    cues: ['손목 중립','작은 8자 궤적','전완 각도 일정'],
  },
  {
    id: 'scull_mid',
    name: '스컬 미드(#2)',
    strokes: ['freestyle','backstroke','butterfly'],
    skillTargets: ['풀/프레스'],
    typicalUse: { zones: ['Z1'], repLaps25: [1], repLaps50: [1], restSec: [10,20] },
    helps: ['프레스 구간 압력 유지'],
    cues: ['팔꿈치 고정','몸통과 함께 밀기'],
  },
  {
    id: 'scull_back',
    name: '스컬 백(#3)',
    strokes: ['freestyle','backstroke','butterfly','breaststroke'],
    skillTargets: ['풀/프레스','타이밍/조합'],
    typicalUse: { zones: ['Z1'], repLaps25: [1], repLaps50: [1], restSec: [10,20] },
    helps: ['피니시 감각','회수 전 추진 유지'],
    cues: ['손끝 뒤로 밀기','손목 꺾이지 않게'],
  },
  {
    id: 'fs_tarzan',
    name: '타잔(머리 들고 전진)',
    strokes: ['freestyle'],
    skillTargets: ['시야/오픈워터','스트림라인/자세'],
    typicalUse: { zones: ['Z1','Z2'], repLaps25: [1], repLaps50: [1], restSec: [20,30] },
    helps: ['오픈워터 사이팅','머리 들기 시 저항 관리'],
    cues: ['가슴 살짝 내려 저항 상쇄','짧은 구간만 수행'],
  },

  // —— Backstroke ——
  { id: 'bk_6_kick_switch', name: '6킥 스위치', strokes: ['backstroke'], skillTargets: ['롤링/체간','킥/리듬','스트림라인/자세'], typicalUse: { zones:['Z1','Z2'], repLaps25:[1,2], repLaps50:[1], restSec:[15,25] }, helps:['허리 과신전 억제','롤링 타이밍 안정'], cues:['턱 살짝 내리고 시선 천장','작고 빠른 킥'] },
  { id: 'bk_single_arm', name: '싱글암 배영', strokes: ['backstroke'], skillTargets: ['캐치/물잡기','타이밍/조합'], typicalUse: { zones:['Z1','Z2'], repLaps25:[1], repLaps50:[1], restSec:[15,25] }, helps:['입수-캐치 경로 인지'], cues:['손바닥 각도 일정','어깨 과회전 금지'] },
  { id: 'bk_double_arm', name: '더블암 배영', strokes: ['backstroke'], skillTargets: ['타이밍/조합','스트림라인/자세'], typicalUse: { zones:['Z1'], repLaps25:[1], repLaps50:[1], restSec:[15,25] }, helps:['허리-골반 정렬','양팔 동시 타이밍'], cues:['복부 코어 유지','팔꿈치 먼저 진입'] },

  // —— Breaststroke ——
  { id: 'br_kick_on_back', name: '평영킥 on Back', strokes:['breaststroke'], skillTargets:['킥/리듬','타이밍/조합'], typicalUse:{ zones:['Z1','Z2'], repLaps25:[1,2], repLaps50:[1], restSec:[15,25] }, helps:['무릎 벌림 과다 교정','발끝 회외/내 각도 감각'], cues:['힐 업-턴 아웃-스냅-글라이드'] },
  { id: 'br_pull_breathe_kick_glide', name: 'Pull-Breathe-Kick-Glide', strokes:['breaststroke'], skillTargets:['타이밍/조합','호흡/하이폭식'], typicalUse:{ zones:['Z1','Z2'], repLaps25:[1], repLaps50:[1], restSec:[10,20] }, helps:['풀-호흡-킥-글라이드 순서 고정','글라이드 시간 확보'], cues:['호흡 짧게','글라이드 1~2초'] },
  { id: 'br_scull_out_in', name: '브레스트 스컬(아웃/인)', strokes:['breaststroke'], skillTargets:['캐치/물잡기','풀/프레스'], typicalUse:{ zones:['Z1'], repLaps25:[1], repLaps50:[1], restSec:[10,20] }, helps:['와이드 캐치 각도','프레스 방향 인지'], cues:['어깨 힘 빼고 전완 각도 일정'] },

  // —— Butterfly ——
  { id: 'fly_body_dolphin', name: '바디 돌핀(체스트 프레스)', strokes:['butterfly'], skillTargets:['킥/리듬','타이밍/조합','스트림라인/자세'], typicalUse:{ zones:['Z1','Z2'], repLaps25:[1], repLaps50:[1], restSec:[15,25] }, helps:['체간 파동과 호흡 타이밍'], cues:['가슴으로 물 누르고 길게'] },
  { id: 'fly_3_3_3', name: '3-3-3 드릴', strokes:['butterfly'], skillTargets:['타이밍/조합','캐치/물잡기'], typicalUse:{ zones:['Z1','Z2'], repLaps25:[1], repLaps50:[1], restSec:[15,25] }, helps:['편측-편측-양측 전환 타이밍'], cues:['팔-몸통 리듬 고정'] },
  { id: 'fly_single_arm', name: '싱글암 버터플라이(스노클 권장)', strokes:['butterfly'], skillTargets:['캐치/물잡기','타이밍/조합'], typicalUse:{ zones:['Z1','Z2'], repLaps25:[1], repLaps50:[1], restSec:[15,25] }, helps:['양측호흡 전 단계','어깨 부담 완화'], cues:['한 팔 당 파동 2회 리듬'] },

  // —— Skills / Hypoxic ——
  { id: 'turns_streamline', name: '턴·스트림라인+돌핀(5m/7.5m)', strokes:['freestyle','backstroke','butterfly','breaststroke'], skillTargets:['회전/턴','스타트/브레이크아웃','스트림라인/자세'], typicalUse:{ zones:['Z1','Z2'], repLaps25:[1], repLaps50:[1], restSec:[15,25] }, helps:['푸시오프 품질','브레이크아웃 길이 표준화'], cues:['벽 강하게 차고 코어 고정','돌핀 3~5회 후 브레이크아웃'] },
  { id: 'hypoxic_3_5_7', name: '하이폭식 3/5/7 래더', strokes:['freestyle','backstroke'], skillTargets:['호흡/하이폭식','시야/오픈워터'], typicalUse:{ zones:['Z2'], repLaps25:[2], repLaps50:[1], restSec:[20,30] }, helps:['호흡 패턴 다양화','CO₂ 내성 향상(안전범위 내)'], cues:['절대 과호흡 금지','현기증 시 즉시 중단'], cautions:['어지럼 과거력/실신 병력 주의','감독·구조요원 환경 권장'] },
];

// ========================== Training Types ==========================
export const TRAININGS: TrainingType[] = [
  {
    id: 'technique', name: '기술(Technique)',
    goals: ['자세/밸런스/타이밍 교정','스트로크 효율 향상'],
    zones: ['Z1','Z2'], restSec: [10,30],
    repPatterns25: ['드릴 6×25m, 레스트 20s','드릴 4×50m, 레스트 20s'],
    repPatterns50: ['드릴 6×50m, 레스트 20s'],
    metrics: ['스트로크카운트','영상/코칭노트'],
    goodFor: ['초급자 적응','부하감소 필요 시'],
    recommendedDrills: ['fs_catch_up','fs_fingertip_drag','fs_6_1_6','scull_front','fs_single_arm']
  },
  {
    id: 'aerobic_en1', name: '유산소 EN1(이지)',
    goals: ['기초 지구력','회복促진'],
    zones: ['Z1','Z2'], restSec: [10,20],
    repPatterns25: ['8×50m @ 쉬운 페이스','6×100m @ 쉬운 페이스'],
    repPatterns50: ['6×100m','4×200m'],
    metrics: ['RPE 3–4','호흡 안정'],
    goodFor: ['고혈압/정형주의: 안전 범위'],
    recommendedDrills: ['fs_fist_swim','bk_6_kick_switch']
  },
  {
    id: 'aerobic_en2', name: '유산소 EN2(중강도)',
    goals: ['지속 지구력','경제성 개선'],
    zones: ['Z2'], restSec: [15,25],
    repPatterns25: ['10×100m @ 일정 페이스','5×200m steady'],
    repPatterns50: ['6×200m steady'],
    metrics: ['RPE 4–5','페이스 일정성'],
    cautions: ['신규자 과볼륨 금지']
  },
  {
    id: 'threshold', name: '임계/템포(Threshold/CSS)',
    goals: ['라텍스 steady-state 향상','레이스 테크닉 유지'],
    zones: ['Z3'], restSec: [10,20],
    repPatterns25: ['8×100m @ CSS±','4×200m @ CSS±'],
    repPatterns50: ['6×100m @ CSS±','4×200m @ CSS±'],
    metrics: ['CSS 페이스 유지','스트로크 길이/카운트'],
    cautions: ['과한 단조성(monotony) 주의'],
    recommendedDrills: ['scull_mid','scull_back','fs_single_arm']
  },
  {
    id: 'vo2', name: 'VO₂max',
    goals: ['최대산소섭취력 자극','속도내성 향상'],
    zones: ['Z4'], restSec: [20,40],
    repPatterns25: ['12×50m @ 강하게','8×75m @ 강하게'],
    repPatterns50: ['10×50m','6×100m'],
    metrics: ['RPE 7–8','페이스 하락폭 관리'],
    cautions: ['고혈압/현기증 과거력 시 용량 축소'],
    recommendedDrills: ['turns_streamline']
  },
  {
    id: 'sprint', name: '스프린트/신경(Sprint/Power)',
    goals: ['신경근 파워','출발/브레이크아웃 품질'],
    zones: ['Z5'], restSec: [30,60],
    repPatterns25: ['16×25m @ all-out, full rest','8×25m UW 돌핀 + 25m easy'],
    repPatterns50: ['12×25m all-out','8×50m broken'],
    metrics: ['최고 속도','구간 영상/턴 품질'],
    cautions: ['충분한 휴식 필수','관절 통증 시 즉시 중단'],
    recommendedDrills: ['turns_streamline','fly_body_dolphin']
  },
  {
    id: 'kick', name: '킥 집중',
    goals: ['하체 추진/리듬','체간안정 강화'],
    zones: ['Z2','Z3'], restSec: [20,40],
    repPatterns25: ['8×50m 킥(보드/사이드)','6×50m 돌핀 킥'],
    repPatterns50: ['6×50m 킥','4×100m 킥'],
    metrics: ['킥보드 속도','사이드 밸런스'],
    cautions: ['요추 과신전/발목 통증 주의'],
    recommendedDrills: ['fs_6_1_6','fly_body_dolphin','br_kick_on_back']
  },
  {
    id: 'pull', name: '풀 집중',
    goals: ['상지 추진','캐치/프레스 감각'],
    zones: ['Z2','Z3'], restSec: [15,30],
    repPatterns25: ['6×100m 풀부이','4×150m 풀부이'],
    repPatterns50: ['4×200m 풀부이'],
    metrics: ['스트로크 길이','페이스 일정'],
    cautions: ['패들 과부하 주의(어깨/팔꿈치)'],
    recommendedDrills: ['scull_front','scull_mid','fs_fist_swim']
  },
  {
    id: 'hypoxic', name: '하이폭식(안전범위)',
    goals: ['호흡 효율/CO₂ 내성','오픈워터 사이팅 연계'],
    zones: ['Z2'], restSec: [20,40],
    repPatterns25: ['3/5/7 래더 6×50m','마지막 7.5~10m 노브리드×6'],
    repPatterns50: ['3/5/7 4×100m'],
    metrics: ['패턴 유지','현기증 여부 0'],
    cautions: ['과호흡 금지','감독 하에 실행','현기증/두통 즉시 중단'],
    recommendedDrills: ['hypoxic_3_5_7','fs_tarzan']
  },
  {
    id: 'im', name: '개인혼영(IM) 전환',
    goals: ['전환기술','다영법 조합 체력'],
    zones: ['Z2','Z3'], restSec: [15,30],
    repPatterns25: ['4×100m IM order','8×50m (FL/BK/BR/FR)'],
    repPatterns50: ['4×100m IM','6×50m 전환드릴'],
    metrics: ['전환 구간 페이스','턴 품질'],
    recommendedDrills: ['fly_3_3_3','bk_double_arm','br_pull_breathe_kick_glide','turns_streamline']
  },
  {
    id: 'skills', name: '스타트·턴·브레이크아웃',
    goals: ['출발·푸시오프 품질','브레이크아웃 거리 표준화'],
    zones: ['Z1','Z2','Z5'], restSec: [20,60],
    repPatterns25: ['15m/25m 스타트 반복','턴+브레이크아웃 드릴 12×25m'],
    repPatterns50: ['스트림라인 15m 유지 반복','파일럿 세트 8×50m(턴 연습)'],
    metrics: ['브레이크아웃 거리','돌핀 횟수/속도'],
    recommendedDrills: ['turns_streamline','fly_body_dolphin']
  },
  {
    id: 'openwater', name: '오픈워터 스킬',
    goals: ['사이팅/드래프팅','직선 유영'],
    zones: ['Z2','Z3'], restSec: [15,30],
    repPatterns25: ['사이팅 3스트로크마다 25m×8','헤드업 25m + 이지 25m ×6'],
    repPatterns50: ['헤드업 50m ×6','사이팅 50m ×6'],
    metrics: ['진로 유지','헤드업 시 페이스 저하 최소화'],
    recommendedDrills: ['fs_tarzan','hypoxic_3_5_7']
  },
];

// ========================== Query/Help API ==========================
export function listDrillsByStroke(stroke: Stroke): Drill[] { return DRILLS.filter(d => d.strokes.includes(stroke)); }
export function listDrillsBySkill(target: SkillTarget): Drill[] { return DRILLS.filter(d => d.skillTargets.includes(target)); }
export function listTrainingTypes(): TrainingType[] { return TRAININGS; }

export function getHelp(kind: 'drill'|'training', id: string): string {
  if (kind==='drill') {
    const d = DRILLS.find(x => x.id===id); if (!d) return '드릴을 찾을 수 없습니다.';
    const zones = d.typicalUse.zones.join(', ');
    const reps25 = d.typicalUse.repLaps25.map(l=> `${l}랩`).join('/');
    const reps50 = d.typicalUse.repLaps50.map(l=> `${l}랩`).join('/');
    return [
      `【${d.name}】`,
      `스트로크: ${d.strokes.join(', ')}`,
      `목표 스킬: ${d.skillTargets.join(', ')}`,
      `권장 존: ${zones} | 25m: ${reps25} | 50m: ${reps50} | 레스트: ${d.typicalUse.restSec[0]}–${d.typicalUse.restSec[1]}s`,
      `효과: ${d.helps.join(' · ')}`,
      `코칭 포인트: ${d.cues.join(' · ')}`,
      d.cautions?.length ? `주의: ${d.cautions.join(' · ')}` : ''
    ].filter(Boolean).join('\n');
  }
  const t = TRAININGS.find(x => x.id===id); if (!t) return '훈련 타입을 찾을 수 없습니다.';
  return [
    `【${t.name}】`,
    `목표: ${t.goals.join(' · ')}`,
    `존/레스트: ${t.zones.join(', ')} / ${t.restSec[0]}–${t.restSec[1]}s`,
    `25m 예: ${t.repPatterns25.join(' | ')}`,
    `50m 예: ${t.repPatterns50.join(' | ')}`,
    `측정: ${t.metrics.join(' · ')}`,
    t.goodFor?.length ? `권장: ${t.goodFor.join(' · ')}` : '',
    t.cautions?.length ? `주의: ${t.cautions.join(' · ')}` : '',
    t.recommendedDrills?.length ? `추천 드릴: ${t.recommendedDrills.join(', ')}` : ''
  ].filter(Boolean).join('\n');
}

// ========================== Extensibility ==========================
export function addDrill(newDrill: Drill): void { DRILLS.push(newDrill); }
export function addTrainingType(newType: TrainingType): void { TRAININGS.push(newType); }



