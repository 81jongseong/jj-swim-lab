/**
 * JJ Swim Lab — drills.ts
 * 확장된 드릴 카탈로그 (35+ 종류)
 */

import { Drill, Stroke, Zone } from './swim-glossary';

export const DRILLS: Drill[] = [
  // ---- Freestyle ----
  { id:'fs_6_1_6', name:'6-1-6 사이드킥', strokes:['FR'],
    helps:['롤링/체간 밸런스','호흡 정렬'], pros:['호흡 안정','정렬 개선'],
    cons:['속도 감소'], cautions:['요추 과신전 금지'],
    cues:['귀-어깨-엉덩이 일직선','작고 빠른 킥'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6,8], restSec:[15,20] } },
  { id:'fs_fingertip', name:'Fingertip Drag', strokes:['FR'],
    helps:['하이엘보 리커버리','크로스오버 예방'], pros:['어깨 리듬 안정'],
    cons:['들썩임 과다 주의'], cautions:['어깨 과회전 금지'],
    cues:['팔꿈치 먼저','손끝 수면 스치기'],
    typicalUse:{ zones:['Z1'], rep25:[4,6], restSec:[10,15] } },
  { id:'fs_single_arm', name:'싱글암(스노클 권장)', strokes:['FR'],
    helps:['캐치/프레스 감각','비대칭 교정'], pros:['호흡 변인 제거'],
    cons:['골반 흔들림'], cautions:['허리 비틀림 금지'],
    cues:['팔꿈치가 손보다 먼저'], typicalUse:{ zones:['Z1','Z2'], rep25:[4,6], restSec:[15,20] } },
  { id:'fs_fist', name:'주먹쥔 수영(Fist)', strokes:['FR'],
    helps:['전완 감각(DPS 향상)'], pros:['패들 의존↓'], cons:['속도 저하'],
    cautions:['스트록 짧아짐 금지'], cues:['전완으로 압력 유지'],
    typicalUse:{ zones:['Z1'], rep25:[4,6], restSec:[10,15] } },
  { id:'fs_scull1', name:'Scull #1(프론트)', strokes:['FR'],
    helps:['캐치 각도'], pros:['감각↑'], cons:['손목 피로'],
    cautions:['손목 중립'], cues:['전완 각 15~20°'],
    typicalUse:{ zones:['Z1'], rep25:[3,4,6], restSec:[10,15] } },
  { id:'fs_scull2', name:'Scull #2(미드)', strokes:['FR'],
    helps:['프레스 유지'], pros:['압력 방향 학습'], cons:['전완 피로'],
    cautions:['손목 과굴신 금지'], cues:['전완/손 압력 일정'],
    typicalUse:{ zones:['Z1'], rep25:[3,4,6], restSec:[10,15] } },
  { id:'fs_scull3', name:'Scull #3(피니시)', strokes:['FR'],
    helps:['피니시 감각'], pros:['추진 마무리 인지'], cons:['손목 피로'],
    cautions:['손목 과굴신 금지'], cues:['뒤로 밀어내기'],
    typicalUse:{ zones:['Z1'], rep25:[3,4], restSec:[10,15] } },
  { id:'fs_zipper', name:'Zipper(지퍼)', strokes:['FR'],
    helps:['리커버리 경로'], pros:['하이엘보 습득'], cons:['과한 끌기 금지'],
    cautions:['승모 과긴장 주의'], cues:['겨드랑이 스치듯'],
    typicalUse:{ zones:['Z1'], rep25:[4,6], restSec:[10,15] } },
  { id:'fs_tarzan', name:'Tarzan(헤드업)', strokes:['FR'],
    helps:['사이팅','헤드업 저항 관리'], pros:['OW 전이'],
    cons:['목/허리 피로'], cautions:['짧게 사용'],
    cues:['시선 수평','킥 유지'], typicalUse:{ zones:['Z2'], rep25:[4,6], restSec:[20] } },
  { id:'fs_streamline', name:'Streamline + Dolphin 5–7.5m', strokes:['FR'],
    helps:['브레이크아웃 품질'], pros:['푸시오프 표준화'], cons:['요추 부하'],
    cautions:['무리한 돌핀 금지'], cues:['핵심은 스트림라인'],
    typicalUse:{ zones:['Z2'], rep25:[4,6], restSec:[15,20] } },
  { id:'fs_dogpaddle', name:'Dog Paddle', strokes:['FR'],
    helps:['초기 캐치 감각'], pros:['저속 감각화'], cons:['전이 속도↓'],
    cautions:['머리 들림 과다 금지'], cues:['가슴 낮추기'],
    typicalUse:{ zones:['Z1'], rep25:[4,6], restSec:[10,15] } },
  { id:'fs_catchup', name:'Catch-up', strokes:['FR'],
    helps:['양팔 타이밍','글라이드'], pros:['균형','타이밍'],
    cons:['과한 글라이드로 속도↓'], cautions:['크로스오버 금지'],
    cues:['손이 만난 뒤 스트로크'], typicalUse:{ zones:['Z1'], rep25:[4,6], restSec:[10,15] } },
  { id:'fs_breathe3', name:'3스트로크 양측호흡', strokes:['FR'],
    helps:['대칭 호흡','롤링'], pros:['균형','OW대비'], cons:['CO2 축적'],
    cautions:['현기증 주의'], cues:['3마다 짧고 낮게'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[6], restSec:[10,15] } },

  // ---- Backstroke ----
  { id:'bk_6switch', name:'6-kick Switch Back', strokes:['BK'],
    helps:['롤링/코어'], pros:['밸런스'], cons:['허리 과신전'],
    cautions:['중립 유지'], cues:['갈비-골반 간격 일정'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6], restSec:[15] } },
  { id:'bk_single', name:'Single-arm Back', strokes:['BK'],
    helps:['입수-캐치 경로'], pros:['리듬'], cons:['편측 과부하'],
    cautions:['양측 교대'], cues:['엄지 먼저 입수'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6], restSec:[15] } },
  { id:'bk_double', name:'Double-arm Back', strokes:['BK'],
    helps:['대칭 리듬','수면 타이밍'], pros:['타이밍 체득'],
    cons:['어깨 부하'], cautions:['느린 템포'],
    cues:['등 유연히 롤링'], typicalUse:{ zones:['Z1'], rep25:[4], restSec:[15] } },
  { id:'bk_flagcount', name:'Flags Count', strokes:['BK'],
    helps:['턴 타이밍'], pros:['일관성↑'], cons:['단조로움'],
    cautions:['깃발 거리 일정 확인'], cues:['카운트 기록'],
    typicalUse:{ zones:['Z1'], rep25:[6], restSec:[10] } },
  { id:'bk_kick_stream', name:'Back Kick Streamline', strokes:['BK'],
    helps:['킥 추진','정렬'], pros:['하체 강화'], cons:['허리 피로'],
    cautions:['요추 중립'], cues:['엉덩이 수면 가까이'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6,8], restSec:[15,20] } },

  // ---- Breaststroke ----
  { id:'br_pull_order', name:'Pull–Breathe–Kick–Glide', strokes:['BR'],
    helps:['타이밍 고정'], pros:['리듬 안정'], cons:['속도↓'],
    cautions:['무릎/고관절 범위 제한'], cues:['풀→호흡→킥→글라이드'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6], restSec:[15,20] } },
  { id:'br_kick_back', name:'BR Kick on Back', strokes:['BR'],
    helps:['무릎 벌림 각','발 스냅'], pros:['허리 보호'], cons:['수면 제어 필요'],
    cautions:['요추 중립'], cues:['발목 외회전 각만큼 스냅'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6], restSec:[15,20] } },
  { id:'br_pull_free_kick', name:'BR Arms + FR Kick', strokes:['BR','FR'],
    helps:['팔 타이밍 우선'], pros:['허리/무릎 부하↓'], cons:['전이 필요'],
    cautions:['킥 리듬 과속 금지'], cues:['팔 우선 학습'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6], restSec:[15] } },
  { id:'br_wrist_scull', name:'BR Wrist Scull', strokes:['BR'],
    helps:['스컬 감각','입수-캐치'], pros:['감각↑'], cons:['손목 피로'],
    cautions:['손목 중립'], cues:['가슴 앞에서 부드럽게'],
    typicalUse:{ zones:['Z1'], rep25:[4,6], restSec:[10,15] } },
  { id:'br_narrow_kick', name:'Narrow Kick BR', strokes:['BR'],
    helps:['무릎 내반/회전 스트레스↓'], pros:['무릎 보호'], cons:['추진↓'],
    cautions:['범위 과축소 금지'], cues:['무릎 간격 일정'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6], restSec:[15] } },

  // ---- Butterfly ----
  { id:'fl_bodydolph', name:'Body Dolphin', strokes:['FL'],
    helps:['체간 파동','호흡 리듬'], pros:['접영 전이'],
    cons:['요추 부하'], cautions:['디스크/요통 회피'],
    cues:['가슴으로 물을 눌러 파동'], typicalUse:{ zones:['Z1','Z2'], rep25:[4,6], restSec:[15,20] } },
  { id:'fl_single', name:'Single-arm Fly', strokes:['FL'],
    helps:['편측→양측 전환'], pros:['부하 분산'], cons:['대칭 재구성 필요'],
    cautions:['양측 교대'], cues:['두번 킥 리듬 기억'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6], restSec:[15,20] } },
  { id:'fl_3_3_3', name:'3-3-3 Fly', strokes:['FL'],
    helps:['리듬','전환'], pros:['단계적 전이'], cons:['피로↑'],
    cautions:['짧은 구간'], cues:['킥-풀-킥 리듬'],
    typicalUse:{ zones:['Z2'], rep25:[4], restSec:[20] } },
  { id:'fl_kick_back', name:'Dolphin Kick on Back', strokes:['FL','BK'],
    helps:['돌핀킥 추진','브레이크아웃'], pros:['허리 부담↓'], cons:['목 피로'],
    cautions:['깊이 일정'], cues:['복압 유지'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[4,6,8], restSec:[15,20] } },
  { id:'fl_breath2', name:'Every-2 Fly', strokes:['FL'],
    helps:['호흡 리듬 안정'], pros:['페이스 유지'], cons:['산소요구↑'],
    cautions:['짧은 세트'], cues:['머리 낮게'],
    typicalUse:{ zones:['Z2'], rep25:[4,6], restSec:[20] } },

  // ---- 공통/스타트/턴 ----
  { id:'st_streamline', name:'Streamline Push', strokes:['FR','BK','BR','FL'],
    helps:['푸시오프 품질'], pros:['전 구간 공통 핵심'], cons:['지루함'],
    cautions:['목/허리 과신전 금지'], cues:['귀 붙이고 손끝 전방'],
    typicalUse:{ zones:['Z1'], rep25:[4,6], restSec:[10,15] } },
  { id:'turn_flip', name:'Flip Turn Drill', strokes:['FR','BK'],
    helps:['턴 일관성','브레이크아웃'], pros:['페이스 유지'], cons:['현기증'],
    cautions:['짧은 반복'], cues:['마지막 스트록 길게'],
    typicalUse:{ zones:['Z1'], rep25:[6], restSec:[10,15] } },
  { id:'turn_twohand', name:'Two-hand Touch Drill', strokes:['BR','FL'],
    helps:['규정 터치 습득'], pros:['실전 안전'], cons:['속도↓'],
    cautions:['벽 과충돌 금지'], cues:['양손 동시에'],
    typicalUse:{ zones:['Z1'], rep25:[6], restSec:[10,15] } },
  { id:'start_track', name:'Track Start Lean', strokes:['FR','FL','BR','BK'],
    helps:['출발 가속'], pros:['반응 향상'], cons:['미끄럼 위험'],
    cautions:['안전한 스타트 블록'], cues:['앞발 압력/뒤발 밀기'],
    typicalUse:{ zones:['Z1'], rep25:[6], restSec:[20] } },
  { id:'uw_kick', name:'UW Dolphin 7.5m', strokes:['FR','FL','BK'],
    helps:['수중 구간 품질'], pros:['유효 속도↑'], cons:['요추 부하'],
    cautions:['거리 제한'], cues:['핵심은 스트림라인'],
    typicalUse:{ zones:['Z2'], rep25:[6,8], restSec:[15,20] } },
  { id:'scull_combo', name:'Sculling Combo 1-2-3', strokes:['FR','BR','FL'],
    helps:['손/전완 감각','프레스 방향'], pros:['감각↑'], cons:['속도↓'],
    cautions:['손목 과굴신 금지'], cues:['압력 방향 일정'],
    typicalUse:{ zones:['Z1'], rep25:[6], restSec:[10,15] } },
  { id:'im_switch', name:'IM Switch 25s', strokes:['IM','FR','BK','BR','FL'],
    helps:['영법 전환','페이스 유지'], pros:['다양성'], cons:['난이도↑'],
    cautions:['법규 준수'], cues:['전환 직후 3스트로크 안정'],
    typicalUse:{ zones:['Z1','Z2'], rep25:[8], restSec:[15] } },
  { id:'im_turns', name:'IM Transition Turns', strokes:['IM'],
    helps:['전환 턴 합법/효율'], pros:['실전 대비'], cons:['속도↓'],
    cautions:['규정 확인'], cues:['접근 속도 일정'],
    typicalUse:{ zones:['Z1'], rep25:[6], restSec:[15] } },
  { id:'ow_sight', name:'OW Sighting', strokes:['FR'],
    helps:['오픈워터 사이팅'], pros:['헤드업 기술'], cons:['목 피로'],
    cautions:['짧게'], cues:['눈만 내밀기'],
    typicalUse:{ zones:['Z2'], rep25:[6], restSec:[15] } },
];

export function getDrillsByStroke(stroke: Stroke): Drill[] {
  return DRILLS.filter(d => d.strokes.includes(stroke));
}

export function findDrillById(id: string): Drill | undefined {
  const low = id.toLowerCase();
  return DRILLS.find(d => d.id.toLowerCase()===low || d.name.toLowerCase()===low);
}

export function suggestDrillsForMethod(methodId: string): Drill[] {
  // 훈련법별 추천 드릴 매핑
  const drillMap: Record<string, string[]> = {
    'descend': ['fs_6_1_6', 'fs_fingertip'],
    'ascend': ['fs_fist', 'fs_scull1'],
    'build': ['fs_6_1_6', 'fs_single_arm'],
    'neg_split': ['fs_fingertip', 'fs_scull2'],
    'even': ['fs_6_1_6'],
    'ladder': ['fs_6_1_6'],
    'pyramid': ['fs_scull1', 'fs_scull2'],
    'broken': ['fs_tarzan'],
    'fartlek': ['fs_tarzan'],
    'tempo_trainer': ['fs_fist'],
    'threshold': ['fs_6_1_6'],
    'vo2': ['fs_single_arm'],
    'sprint': ['fs_streamline'],
    'pull': ['fs_fist'],
    'drillswim': ['fs_6_1_6', 'fs_fingertip'],
    'rp25': ['fs_tarzan', 'fl_3_3_3'],
    'turn_focus': ['turn_flip', 'st_streamline'],
    'sr_lock': ['fs_fist'],
    'hypoxic_set': ['fs_6_1_6'],
    'aerobic_mix': ['fs_fingertip'],
    'quality': ['fs_streamline'],
    'recovery': ['fs_scull1', 'st_streamline'],
    'skps': ['fs_6_1_6', 'br_kick_back'],
  };
  
  const drillIds = drillMap[methodId] || [];
  return DRILLS.filter(d => drillIds.includes(d.id));
}









