/**
 * JJ Swim Lab — swim-glossary.ts (Extended)
 * 목적: 수영 용어/훈련법/드릴을 "데이터 + 파서 + 설명"으로 제공
 * 버전: 2025-01-28 KST
 */

// ============================== 타입 ==============================
export type Stroke = 'FR'|'BK'|'BR'|'FL'|'IM';
export type Zone = 'Z1'|'Z2'|'Z3'|'Z4'|'Z5';

export type TermCategory =
  | 'intensity'        // EN/Z/CSS/RP/RPE 등
  | 'set_part'         // WU/PRE/MAIN/FIN/CD
  | 'stroke'           // FR/BK/BR/FL/IM
  | 'pattern'          // Descend/Build/…
  | 'notation'         // on/send-off/rest/hold/pace-note
  | 'equipment'        // paddles/fins/snorkel/buoy/etc
  | 'metric'           // SR/SPL/DPS/SC/ACWR
  | 'breathing'        // 3/5/7 hypoxic etc
  | 'start_turn'       // start/turn/breakout/flags
  | 'drill'            // drill generic
  | 'other';

export interface TermEntry {
  id: string;           // 고유 키(예: 'CSS', 'DESCEND', 'fs_6_1_6')
  ko: string;           // 한국어 명칭
  en?: string;          // 영문 표기
  cat: TermCategory;    // 분류
  def: string;          // 짧은 정의(일반인 이해 가능)
  details?: string[];   // 장점/주의/목표 등 핵심 요지
  synonyms?: string[];  // 파싱/검색용 이명
  examples?: string[];  // 예시 문자열
  strokes?: Stroke[];   // 해당되는 영법(드릴용)
}

export interface TrainingMethod {
  id: string;
  name: string;
  definition: string;
  whenToUse: string[];
  goals: string[];
  pros: string[];
  cons: string[];
  cautions: string[];
  zones: Zone[];
  examples25: string[];
  examples50: string[];
  recommendedDrillIds: string[];
}

export interface Drill {
  id: string;
  name: string;
  strokes: Stroke[];
  helps: string[];      // 효과/목표
  pros: string[];
  cons: string[];
  cautions: string[];
  cues: string[];       // 코칭 큐
  typicalUse: { zones: Zone[]; rep25?: number[]; rep50?: number[]; restSec?: number[]; };
}

// ============================== 용어 사전 ==============================
export const GLOSSARY: TermEntry[] = [
  // ---- 강도/존/페이스 ----
  { id:'EN',  ko:'유산소 훈련(EN)', en:'Endurance', cat:'intensity',
    def:'오래 지속 가능한 강도. EN1/EN2/EN3로 세분화.',
    details:['EN1=가벼운 지속','EN2=중간 지속','EN3=임계 전후 템포'], synonyms:['endurance','en 훈련'] },
  { id:'EN1', ko:'EN1', en:'Easy Aerobic', cat:'intensity',
    def:'가벼운 유산소(회복/기초).', details:['대략 CSS+15~30″/100'], synonyms:['easy','회복','recovery'] },
  { id:'EN2', ko:'EN2', en:'Steady Aerobic', cat:'intensity',
    def:'중간 강도 유산소(지속).', details:['대략 CSS+5~14″/100'], synonyms:['steady','지속'] },
  { id:'EN3', ko:'EN3', en:'Aerobic Threshold', cat:'intensity',
    def:'임계 전후 템포.', details:['대략 CSS±0~4″/100'], synonyms:['threshold','템포'] },
  { id:'Z1',  ko:'Z1 회복', cat:'intensity', def:'아주 편안(회복).', details:['CSS+15~30″/100'] },
  { id:'Z2',  ko:'Z2 지속', cat:'intensity', def:'지속 페이스.', details:['CSS+5~14″/100'] },
  { id:'Z3',  ko:'Z3 템포', cat:'intensity', def:'임계 전후 템포.', details:['CSS±0~4″/100'] },
  { id:'Z4',  ko:'Z4 인터벌', cat:'intensity', def:'짧은 고강도 반복.', details:['CSS−2~5″/100'] },
  { id:'Z5',  ko:'Z5 스프린트', cat:'intensity', def:'전력/아주 짧게.', details:['CSS−6″ 이상 빠름'] },
  { id:'CSS', ko:'임계수영속도(CSS)', en:'Critical Swim Speed', cat:'intensity',
    def:'오래 유지 가능한 임계 페이스(400·200 TT로 추정).', synonyms:['critical','css pace'] },
  { id:'RP',  ko:'레이스 페이스(RP)', en:'Race Pace', cat:'intensity',
    def:'목표 경기에서 유지할 예상 페이스.' },
  { id:'RPE', ko:'자각강도(RPE)', en:'Rating of Perceived Exertion', cat:'intensity',
    def:'본인이 느끼는 힘듦(0~10 등급).', synonyms:['보그','자각강도'] },

  // ---- 측정/지표 ----
  { id:'SR',  ko:'스트로크율(SR)', en:'Stroke Rate', cat:'metric', def:'분당 팔돌림 수 또는 템포(비프 간격).' },
  { id:'SPL', ko:'렝스당 스트로크 수(SPL)', en:'Strokes Per Length', cat:'metric', def:'25/50m 당 팔돌림 수.', synonyms:['SC','stroke count'] },
  { id:'DPS', ko:'스트로크 당 거리(DPS)', en:'Distance Per Stroke', cat:'metric', def:'한 스트로크로 전진하는 거리.' },
  { id:'ACWR',ko:'급성/만성 부하비', en:'Acute:Chronic Workload Ratio', cat:'metric', def:'최근 1주 대비 4주 평균 부하 비.' },

  // ---- 세션 파트 ----
  { id:'WU',   ko:'워밍업(WU)', en:'Warm Up', cat:'set_part', def:'본 세트 전 준비.' , synonyms:['웜업','워업','warmup'] },
  { id:'PRE',  ko:'프리셋', en:'Pre Set', cat:'set_part', def:'메인 직전 준비 블록.' },
  { id:'MAIN', ko:'메인 세트', en:'Main Set', cat:'set_part', def:'핵심 목표 세트.' },
  { id:'FIN',  ko:'피니셔', en:'Finisher', cat:'set_part', def:'마무리용 강한 짧은 세트.' },
  { id:'CD',   ko:'쿨다운(CD)', en:'Cool Down', cat:'set_part', def:'정리 운동.' },

  // ---- 영법 ----
  { id:'FR', ko:'자유형', en:'Freestyle', cat:'stroke', def:'앞으로 수영하는 기본 영법.' , synonyms:['프리','free','freestyle'] },
  { id:'BK', ko:'배영',   en:'Backstroke', cat:'stroke', def:'등으로 누워 수영.' },
  { id:'BR', ko:'평영',   en:'Breaststroke', cat:'stroke', def:'개구리 킥, 타이밍 중요.' },
  { id:'FL', ko:'접영',   en:'Butterfly', cat:'stroke', def:'양팔 동시 + 돌핀킥.' },
  { id:'IM', ko:'개인혼영', en:'Individual Medley', cat:'stroke', def:'FL→BK→BR→FR 순.' },

  // ---- 패턴(훈련법 키워드) ----
  { id:'DESCEND', ko:'디센딩', en:'Descend', cat:'pattern', def:'반복할수록 점점 빠르게.' , synonyms:['desc','디센드','1to4 descend'] },
  { id:'ASCEND',  ko:'어센딩', en:'Ascend',  cat:'pattern', def:'반복할수록 점점 느리게.' },
  { id:'BUILD',   ko:'빌드',   en:'Build',   cat:'pattern', def:'한 반복 안에서 후반 가속.' , synonyms:['build within'] },
  { id:'NEG_SPLIT',ko:'네거티브 스플릿', en:'Negative Split', cat:'pattern', def:'후반이 전반보다 빠름.' },
  { id:'EVEN_SPLIT',ko:'이븐 스플릿', en:'Even Split', cat:'pattern', def:'전반=후반 동일 페이스.' },
  { id:'LADDER',  ko:'래더',   en:'Ladder',  cat:'pattern', def:'거리 단계 ↑ 또는 ↓.', synonyms:['사다리'] },
  { id:'PYRAMID', ko:'피라미드', en:'Pyramid', cat:'pattern', def:'대칭 구조(오르내림).'},
  { id:'BROKEN',  ko:'브로큰', en:'Broken',  cat:'pattern', def:'긴 거리를 잘라 중간 휴식 삽입.' },
  { id:'FARTLEK', ko:'파틀렉', en:'Fartlek', cat:'pattern', def:'가변 페이스(코치 콜).' },
  { id:'TEMPO_TRAINER', ko:'템포 트레이너', en:'Tempo Trainer', cat:'pattern', def:'메트로놈 비프에 SR/템포 맞춤.' },
  { id:'THRESHOLD', ko:'임계 템포', en:'Threshold/CSS', cat:'pattern', def:'임계 전후 템포 유지.' },
  { id:'VO2', ko:'고강도 인터벌(VO₂)', en:'VO2 Intervals', cat:'pattern', def:'CSS보다 빠른 간헐 고강도.' },
  { id:'SPRINT', ko:'스프린트', en:'Sprint Quality', cat:'pattern', def:'25–50m 전력, 충분 휴식.' },

  // ---- 표기/노테이션 ----
  { id:'ON', ko:'on(보내기 간격)', en:'on', cat:'notation', def:'정해진 간격마다 출발(예: on 1:30).', synonyms:['send-off'] },
  { id:'SEND_OFF', ko:'보내기 간격', en:'Send-off', cat:'notation', def:'출발 간격 자체를 의미.' },
  { id:'REST', ko:'rest(휴식)', en:'Rest', cat:'notation', def:'반복 간 휴식(예: r20″).' , synonyms:['r','레스트'] },
  { id:'HOLD', ko:'hold(유지)', en:'Hold', cat:'notation', def:'지정 페이스를 유지(예: hold 1:25/100).' },
  { id:'PACE_NOTE', ko:'페이스 주석', en:'Pace Note', cat:'notation', def:'@ CSS+6″, @ RP 등 속도 지시.' },

  // ---- 호흡/저산소 ----
  { id:'HYPOXIC', ko:'하이폭식', en:'Hypoxic', cat:'breathing', def:'호흡 간격 제한/무호흡 기반 세트(안전 제한 필요).', details:['3/5/7 래더 등'] },
  { id:'BREATHE_BI', ko:'양측 호흡', en:'Bilateral Breathing', cat:'breathing', def:'양쪽 번갈아 호흡(예: 3스트로크마다).' },

  // ---- 스타트/턴/브레이크아웃 ----
  { id:'STREAMLINE', ko:'스트림라인', en:'Streamline', cat:'start_turn', def:'푸시오프/출발 자세를 곧게 유지.' },
  { id:'BREAKOUT', ko:'브레이크아웃', en:'Breakout', cat:'start_turn', def:'수중 킥 후 수면으로 전환.' },
  { id:'FLAGS', ko:'깃발(배영)', en:'Backstroke Flags', cat:'start_turn', def:'깃발 거리 기반의 턴 타이밍.' },

  // ---- 장비 ----
  { id:'PADDLES', ko:'패들', en:'Paddles', cat:'equipment', def:'손에 착용해 캐치·프레스 감각/부하 증가.' },
  { id:'BUOY', ko:'풀부이', en:'Pull Buoy', cat:'equipment', def:'하체 부력 보조, 상지 집중.' },
  { id:'FINS', ko:'핀', en:'Fins', cat:'equipment', def:'킥 강화/리듬·속도 학습.' },
  { id:'SNORKEL', ko:'스노클', en:'Snorkel', cat:'equipment', def:'호흡 변인 제거, 정렬/캐치 집중.' },
];

// ============================== 용어 맵/노말라이저 ==============================
const _MAP: Record<string, TermEntry> = Object.fromEntries(
  GLOSSARY.flatMap(e => {
    const base = [[e.id.toLowerCase(), e]] as [string, TermEntry][];
    const syns = (e.synonyms||[]).map(s => [s.toLowerCase(), e] as [string, TermEntry]);
    const labels = [e.ko, e.en].filter(Boolean).map(s => [String(s).toLowerCase(), e] as [string, TermEntry]);
    return [...base, ...syns, ...labels];
  })
);

/** 약어/이명/국문·영문을 표준 용어로 정규화 */
export function normalizeTerm(raw: string): TermEntry | null {
  const key = (raw||'').trim().toLowerCase().replace(/\s+/g,' ');
  return _MAP[key] ?? null;
}

// ============================== 파서/토큰 ==============================
export type Token =
  | { kind:'set'; reps:number; dist:number }                // 8×50, 6x100
  | { kind:'pace'; text:string }                            // @ CSS+6″, @ RP, hold 1:25/100
  | { kind:'rest'; seconds:number }                         // r20″
  | { kind:'sendoff'; seconds:number }                      // on 1:00
  | { kind:'stroke'; entry:TermEntry }                      // FR/BK/BR/FL/IM
  | { kind:'method'; entry:TermEntry }                      // DESCEND/BUILD 등
  | { kind:'equipment'; entry:TermEntry }                   // PADDLES/FINS/...
  | { kind:'term'; entry:TermEntry }                        // 기타 용어
  | { kind:'text'; text:string };                           // 설명 등

/** "1:30" | "90" | "1.30" → 초 */
function _secFromTime(s: string): number | null {
  const raw = s.trim().replace(/[″"'s초]/g,'');
  if (/^\d+:\d{1,2}$/.test(raw)) {
    const [m, ss] = raw.split(':').map(Number);
    return m*60 + ss;
  }
  if (/^\d+(\.\d+)?$/.test(raw)) return Math.round(parseFloat(raw));
  return null;
}

export function parseWorkoutLine(line: string): Token[] {
  const out: Token[] = [];
  const s = (line||'').replace(/，/g,',').replace(/：/g,':').trim();
  const lower = s.toLowerCase();

  // 1) set: 8x50, 6×100
  const setMatch = s.match(/(\d+)\s*(?:x|×|X)\s*(\d+)\s*(?:m|미터)?/);
  if (setMatch) out.push({ kind:'set', reps: Number(setMatch[1]), dist: Number(setMatch[2]) });

  // 2) pace block: @ CSS±, @ RP, hold 1:25/100
  const paceMatch = s.match(/@?\s*(css\s*[+\-]?\s*\d*″?|rp|hold\s*[\d:/.]+(?:\/100)?)/i);
  if (paceMatch) out.push({ kind:'pace', text: paceMatch[0].replace(/^@/,'').trim() });

  // 3) rest: r20″ or rest 20
  const restMatch = s.match(/\b(?:r|rest)\s*([0-9]{1,3})(?:\s*(?:\"|″|s|초))?/i);
  if (restMatch) out.push({ kind:'rest', seconds: Number(restMatch[1]) });

  // 4) send-off: on 1:00
  const onMatch = s.match(/\bon\s*([0-9:."″]+)\b/i);
  if (onMatch) {
    const secs = _secFromTime(onMatch[1]);
    if (secs!=null) out.push({ kind:'sendoff', seconds: secs });
  }

  // 5) stroke: FR/BK/BR/FL/IM
  const strokeMatch = s.match(/\b(FR|BK|BR|FL|IM)\b/i);
  if (strokeMatch) {
    const entry = normalizeTerm(strokeMatch[1].toUpperCase());
    if (entry) out.push({ kind:'stroke', entry });
  }

  // 6) method keywords
  const methodKeys: string[] = [
    'descend','ascend','build','negative split','neg split','even split',
    'ladder','pyramid','broken','fartlek','tempo','threshold','vo2','sprint'
  ];
  for (const key of methodKeys) {
    if (lower.includes(key)) {
      const found = GLOSSARY.find(g => g.cat==='pattern' && (g.id.toLowerCase()===key.replace(/\s/g,'') || (g.en||'').toLowerCase().includes(key) || (g.ko||'').includes(key) || (g.synonyms||[]).some(syn=>syn.toLowerCase()===key)));
      if (found) out.push({ kind:'method', entry: found });
    }
  }

  // 7) equipment tags
  for (const eq of ['paddles','fins','snorkel','buoy']) {
    if (lower.includes(eq)) {
      const e = normalizeTerm(eq);
      if (e) out.push({ kind:'equipment', entry: e });
    }
  }

  // 8) generic known terms found literally
  for (const id of ['CSS','RP','Z1','Z2','Z3','Z4','Z5','REST','SEND_OFF','TEMPO_TRAINER','HYPOXIC']) {
    if (new RegExp(`\\b${id.toLowerCase()}\\b`).test(lower)) {
      const entry = GLOSSARY.find(g => g.id===id)!;
      out.push({ kind:'term', entry });
    }
  }

  // 9) 원문 보존
  out.push({ kind:'text', text: s });
  return out;
}

// ============================== 설명/서치 헬퍼 ==============================
export function explainToken(t: Token): string {
  switch (t.kind) {
    case 'set':      return `${t.reps}×${t.dist}m 세트(반복×거리). 풀 길이 배수로 맞춰 진행.`;
    case 'pace':     return `페이스 지시: "${t.text}". 예) CSS=임계페이스, RP=레이스페이스, hold=지정페이스 유지.`;
    case 'rest':     return `반복 간 휴식: ${t.seconds}초.`;
    case 'sendoff':  return `보내기 간격(on): ${t.seconds}초마다 출발.`;
    case 'stroke':   return `${t.entry.ko}(${t.entry.en||t.entry.id}). ${t.entry.def}`;
    case 'method':   return `${t.entry.ko} — ${t.entry.def}`;
    case 'equipment':return `${t.entry.ko} 사용 — ${t.entry.def}`;
    case 'term':     return `${t.entry.ko} — ${t.entry.def}`;
    case 'text':     return t.text;
  }
}

export function formatTokensHuman(tokens: Token[]): string {
  return tokens.map(explainToken).join(' | ');
}

export function searchTerms(q: string, cat?: TermCategory): TermEntry[] {
  const s = (q||'').toLowerCase();
  return GLOSSARY.filter(t =>
    (!cat || t.cat===cat) &&
    ([t.id, t.ko, t.en, ...(t.synonyms||[]), ...(t.details||[])].filter(Boolean) as string[])
      .some(x => x.toLowerCase().includes(s))
  );
}

export const STATS = {
  terms: GLOSSARY.length,
  drills: 0, // 나중에 추가
  methods: 0, // 나중에 추가
};









