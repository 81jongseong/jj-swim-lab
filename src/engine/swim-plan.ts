/**
 * 🏊‍♂️ JJ Swim Lab - 수영 계획 생성기
 * 
 * 📋 목적
 * - 건강검진 데이터와 정형 28개 관절질환 가이드를 기반으로 한 수영 계획 생성
 * - 안전한 영법 선택 및 제약사항 적용
 * - 성취율 기반 프로그레션 알고리즘
 * - 투명성 노트 포함 (추측입니다, 확실하지 않음, 모르겠습니다)
 * 
 * 🎯 사용 목적
 * - 개인화된 주간 수영 계획 생성
 * - 안전한 운동 강도 및 영법 선택
 * - 점진적 부하 증가 관리
 * 
 * 📅 개발 히스토리
 * - 2025-09-23: 초기 계획 생성기 설계
 * - 2025-09-23: 정형 가이드 기반 영법 선택 알고리즘 구현
 * - 2025-09-23: 성취율 기반 프로그레션 시스템 추가
 * 
 * 👨‍💻 개발자 정보
 * - 작성자: AI Assistant
 * - 최종 수정: 2025-09-23
 * - 상태: ✅ 완성 (모든 계획 생성 로직 구현)
 */

import { 
  HealthInput, 
  PlanOutput, 
  SessionPlan, 
  Stroke, 
  StrokeBlock,
  ProgressionType 
} from '../types';
import { 
  medicalClearanceNeeded, 
  weeklyDoseMinutes, 
  levelSessionRange, 
  rpePrimary, 
  hrSecondary, 
  BP_STOP_RULE,
  COMMON_STOP_RULES,
  calculateFrequency,
  calculateSessionDuration,
  getIntensityAdjustment,
  safetyCheck
} from './health-policy';
import { allJointConditions } from '../data/jj-swim-lab-joint-guidance';

// ────────────────────────────────────────────────────────────────────────────────
// 안전한 영법 선택 알고리즘
// ────────────────────────────────────────────────────────────────────────────────
function pickSafeStrokes(orthopedics: string[]): Stroke[] {
  // 다수 orthopedics가 있을 수 있으므로 safe 교집합 우선, 그 다음 caution 후보
  const strokeSet = new Map<Stroke, { safe: number; caution: number; avoid: number; mods: Set<string>; }>();
  const strokes: Stroke[] = ['freestyle', 'backstroke', 'breaststroke', 'butterfly', 'elementary_backstroke', 'sidestroke'];
  
  // 초기화
  for (const s of strokes) {
    strokeSet.set(s, { safe: 0, caution: 0, avoid: 0, mods: new Set() });
  }

  // 각 관절질환에 대해 영법별 안전도 계산
  for (const conditionId of orthopedics) {
    const condition = allJointConditions.find(c => c.conditionId === conditionId);
    if (!condition) continue;
    
    for (const stroke of strokes) {
      const guidance = condition.swimmingGuidance[stroke];
      const obj = strokeSet.get(stroke)!;
      
      if (guidance.level === 'safe') obj.safe++;
      if (guidance.level === 'caution') { 
        obj.caution++; 
        guidance.modifications.forEach(m => obj.mods.add(m)); 
      }
      if (guidance.level === 'avoid') obj.avoid++;
    }
  }

  // 전략: avoid>0 이면 제외, safe 합이 높은 순 → 후보, 필요시 caution 일부 포함
  const safeList = strokes
    .filter(s => strokeSet.get(s)!.avoid === 0)
    .sort((a, b) => strokeSet.get(b)!.safe - strokeSet.get(a)!.safe);
  
  // safe 영법이 있으면 그것을 우선 사용
  if (safeList.length > 0) {
    return safeList;
  }
  
  // safe 영법이 없으면 caution 영법 중에서 선택
  return strokes.filter(s => strokeSet.get(s)!.avoid === 0 && strokeSet.get(s)!.caution > 0);
}

// ────────────────────────────────────────────────────────────────────────────────
// 제약사항 수집
// ────────────────────────────────────────────────────────────────────────────────
function collectConstraints(orthopedics: string[]): string[] {
  const constraints: string[] = [];
  
  for (const conditionId of orthopedics) {
    const condition = allJointConditions.find(c => c.conditionId === conditionId);
    if (!condition) continue;
    
    // 주요 영법들에 대한 caution 수정사항 수집
    const mainStrokes: Stroke[] = ['freestyle', 'backstroke', 'breaststroke'];
    for (const stroke of mainStrokes) {
      const guidance = condition.swimmingGuidance[stroke];
      if (guidance.level === 'caution') {
        constraints.push(...guidance.modifications);
        constraints.push(...guidance.prohibitedMovements.map(p => `피하기: ${p}`));
      }
    }
  }
  
  // 중복 제거 및 최대 8개로 제한
  return Array.from(new Set(constraints)).slice(0, 8);
}

// ────────────────────────────────────────────────────────────────────────────────
// 세션 계획 생성
// ────────────────────────────────────────────────────────────────────────────────
function createSessionPlan(
  day: string,
  input: HealthInput,
  strokes: Stroke[],
  constraints: string[],
  sessionDuration: number
): SessionPlan {
  const mainStrokes: Stroke[] = strokes.slice(0, 2).length > 0 ? strokes.slice(0, 2) : ['backstroke', 'elementary_backstroke'];
  
  // 세션 구성: 워밍업(30%) + 메인(50%) + 쿨다운(20%)
  const warmupDuration = Math.round(sessionDuration * 0.3);
  const mainDuration = Math.max(6, Math.round(sessionDuration * 0.5));
  const cooldownDuration = Math.round(sessionDuration * 0.2);
  
  const blocks: StrokeBlock[] = [
    { stroke: mainStrokes[0] ?? 'backstroke', block: `${warmupDuration}' easy` },
    { stroke: mainStrokes[1] ?? 'freestyle', block: `${mainDuration}' @${rpePrimary()}` },
    { stroke: 'elementary_backstroke', block: `${cooldownDuration}' easy` }
  ];

  return {
    day,
    focus: input.goals,
    stroke_plan: blocks,
    constraints: constraints,
    intensity_cues: { 
      primary: rpePrimary(), 
      secondary: hrSecondary(input) 
    },
    stop_rules: COMMON_STOP_RULES
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// 프로그레션 결정
// ────────────────────────────────────────────────────────────────────────────────
function determineProgression(input: HealthInput): ProgressionType {
  const adherence = input.adherence_last_week;
  const hasSymptoms = input.symptoms_flags.length > 0;
  
  // 성취율 ≥0.8 & 이상반응 없음 → progress
  if (adherence >= 0.8 && !hasSymptoms) {
    return Math.random() < 0.5 ? 'progress_+5%' : 'progress_+10%';
  }
  
  // 성취율 0.6–0.79 → maintain
  if (adherence >= 0.6) {
    return 'maintain';
  }
  
  // 성취율 <0.6 또는 증상 → deload
  return Math.random() < 0.5 ? 'deload_-10%' : 'deload_-20%';
}

// ────────────────────────────────────────────────────────────────────────────────
// 투명성 노트 생성
// ────────────────────────────────────────────────────────────────────────────────
function generateNotes(input: HealthInput, strokes: Stroke[]): string[] {
  const notes: string[] = [];
  
  // 수중 HR 보정에 대한 불확실성
  notes.push('수중 HR은 개인차가 큼 — 확실하지 않음');
  
  // 베타차단제 관련 노트
  if (input.vitals?.on_beta_blocker) {
    notes.push('베타차단제 복용: HR 지표 비활성화');
  }
  
  // 평영 관련 노트
  if (strokes.includes('breaststroke')) {
    notes.push('평영 킥 폭 축소 — 추측입니다');
  }
  
  // 접영 관련 노트
  if (strokes.includes('butterfly')) {
    notes.push('접영은 고강도 — 개인 반응 모니터링 필요');
  }
  
  // 다중 관절질환 관련 노트
  if (input.orthopedics.length > 1) {
    notes.push('다중 관절질환: 개별 반응 차이는 큼 — 모르겠습니다');
  }
  
  // 고령자 관련 노트
  if (input.demographics.age >= 65) {
    notes.push('고령자: 점진적 부하 증가 권장 — 추측입니다');
  }
  
  return notes;
}

// ────────────────────────────────────────────────────────────────────────────────
// 메인 계획 생성 함수
// ────────────────────────────────────────────────────────────────────────────────
export function buildPlan(input: HealthInput): PlanOutput {
  // 1. 의료 확인 필요성 평가
  const clearance = medicalClearanceNeeded(input);
  
  // 2. 주간 목표 시간 계산
  const weeklyMin = weeklyDoseMinutes(input);
  
  // 3. 안전한 영법 선택
  const strokes = pickSafeStrokes(input.orthopedics);
  
  // 4. 제약사항 수집
  const constraints = collectConstraints(input.orthopedics);
  
  // 5. 프로그레션 결정
  const progression = determineProgression(input);
  
  // 6. 투명성 노트 생성
  const notes = generateNotes(input, strokes);
  
  // 7. 의료 확인 필요 시 최소 세션만 생성
  if (clearance) {
    const safetySession: SessionPlan = {
      day: 'Mon',
      focus: ['safety_hold'],
      stroke_plan: [
        { stroke: 'elementary_backstroke', block: '10\' very easy' },
        { stroke: 'backstroke', block: '10\' easy' }
      ],
      constraints: [
        '의료확인 필요 플래그: 고혈압 또는 증상',
        '강도 상승 금지'
      ],
      intensity_cues: { primary: 'RPE 9–10(매우 가벼움)' },
      stop_rules: COMMON_STOP_RULES
    };
    
    return {
      microcycle_week: 1,
      weekly_target_min: 60,
      medical_clearance_required: true,
      sessions: [safetySession],
      strength_days: 0,
      next_week_adjustment: 'maintain',
      notes: [...notes, '의료 확인 후 정상 계획으로 전환']
    };
  }
  
  // 8. 정상 계획 생성
  const frequency = calculateFrequency(input);
  const sessionDuration = calculateSessionDuration(input);
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const sessions: SessionPlan[] = [];
  for (let d = 0; d < frequency; d++) {
    const session = createSessionPlan(
      daysOfWeek[d],
      input,
      strokes,
      constraints,
      sessionDuration
    );
    sessions.push(session);
  }
  
  // 9. 안전성 체크
  const safety = safetyCheck(input);
  if (!safety.safe) {
    notes.push(...safety.warnings);
  }
  
  return {
    microcycle_week: 1,
    weekly_target_min: weeklyMin,
    medical_clearance_required: false,
    sessions,
    strength_days: 2, // 일반적으로 주 2회 근력운동 권장
    next_week_adjustment: progression,
    notes
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// 계획 검증 함수
// ────────────────────────────────────────────────────────────────────────────────
export function validatePlan(plan: PlanOutput): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // 세션 수 체크
  if (plan.sessions.length === 0) {
    issues.push('세션이 없습니다');
  }
  
  // 주간 목표 시간 체크
  if (plan.weekly_target_min < 60) {
    issues.push('주간 목표 시간이 너무 적습니다');
  }
  
  // 의료 확인 필요 시 체크
  if (plan.medical_clearance_required && plan.sessions.length > 1) {
    issues.push('의료 확인 필요 시에는 최소 세션만 제공해야 합니다');
  }
  
  // 각 세션의 영법 블록 체크
  for (const session of plan.sessions) {
    if (session.stroke_plan.length === 0) {
      issues.push(`${session.day} 세션에 영법 블록이 없습니다`);
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}







