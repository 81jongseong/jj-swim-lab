import { HealthInput, PlanOutput, SessionPlan, Stroke } from '../types';
import { medicalClearanceNeeded, weeklyDoseMinutes, levelSessionRange, rpePrimary, hrSecondary, BP_STOP_RULE } from './health-policy';
import { allJointConditions } from '../data/jj-swim-lab-joint-guidance';

function pickSafeStrokes(orthos:string[]): Stroke[] {
  const strokeSet = new Map<Stroke, {safe:number; caution:number; avoid:number; mods:Set<string>;}>();
  const strokes: Stroke[] = ['freestyle','backstroke','breaststroke','butterfly','elementary_backstroke','sidestroke'];
  for (const s of strokes) strokeSet.set(s,{safe:0,caution:0,avoid:0,mods:new Set()});

  for (const cid of orthos) {
    const cond = allJointConditions.find(c=>c.conditionId===cid);
    if (!cond) continue;
    for (const s of strokes) {
      const g = cond.swimmingGuidance[s];
      const obj = strokeSet.get(s)!;
      if (g.level==='safe') obj.safe++;
      if (g.level==='caution') { obj.caution++; g.modifications.forEach(m=>obj.mods.add(m)); }
      if (g.level==='avoid') obj.avoid++;
    }
  }
  const safeList = strokes.filter(s=>strokeSet.get(s)!.avoid===0).sort((a,b)=>strokeSet.get(b)!.safe - strokeSet.get(a)!.safe);
  return safeList.length? safeList : strokes.filter(s=>strokeSet.get(s)!.avoid===0 && strokeSet.get(s)!.caution>0);
}

export function buildPlan(i:HealthInput): PlanOutput {
  const clearance = medicalClearanceNeeded(i);
  const weeklyMin = weeklyDoseMinutes(i);
  const [minPer, maxPer] = levelSessionRange(i.swim_profile.level);
  const days = (i.conditions.hypertension!=='normal') ? 5 : 4;
  const perSession = Math.min(maxPer, Math.ceil(weeklyMin/days));
  const strokes = pickSafeStrokes(i.orthopedics);
  const constraints:string[] = [];

  for (const cid of i.orthopedics) {
    const cond = allJointConditions.find(c=>c.conditionId===cid);
    if (!cond) continue;
    for (const s of (['freestyle','backstroke','breaststroke'] as Stroke[])) {
      const g = cond.swimmingGuidance[s];
      if (g.level==='caution') constraints.push(...g.modifications, ...g.prohibitedMovements.map(p=>'피하기: '+p));
    }
  }

  const daysOfWeek = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const sessions: SessionPlan[] = [];
  for (let d=0; d<days; d++) {
    const main: Stroke[] = strokes.slice(0,2).length? strokes.slice(0,2) : ['backstroke','elementary_backstroke'];
    const blocks = [
      { stroke: (main[0]??'backstroke') as Stroke, block: `${Math.round(perSession*0.3)}' easy`},
      { stroke: (main[1]??'freestyle') as Stroke,  block: `${Math.max(6, Math.round(perSession*0.5))}' @${rpePrimary()}`},
      { stroke: 'elementary_backstroke' as Stroke, block: `${Math.round(perSession*0.2)}' easy`}
    ];
    sessions.push({
      day: daysOfWeek[d],
      focus: i.goals,
      stroke_plan: blocks,
      constraints: Array.from(new Set(constraints)).slice(0,8),
      intensity_cues: { primary: rpePrimary(), secondary: hrSecondary(i) },
      stop_rules: [BP_STOP_RULE,'chest_pain','unusual_dyspnea']
    });
  }

  let next:'progress_+5%'|'progress_+10%'|'maintain'|'deload_-10%'|'deload_-20%';
  if (i.adherence_last_week>=0.8 && i.symptoms_flags.length===0) next = Math.random()<0.5? 'progress_+5%':'progress_+10%';
  else if (i.adherence_last_week>=0.6) next = 'maintain';
  else next = Math.random()<0.5? 'deload_-10%':'deload_-20%';

  const notes = [
    '수중 HR은 개인차가 큼 — 확실하지 않음',
    ...(i.vitals?.on_beta_blocker? ['베타차단제 복용: HR 지표 비활성화'] : []),
    ...(strokes.includes('breaststroke')? ['평영 킥 폭 축소 — 추측입니다'] : [])
  ];

  const finalSessions = clearance? [{
    day:'Mon',
    focus:['safety_hold'],
    stroke_plan:[{stroke:'elementary_backstroke' as Stroke, block:'10\' very easy'},{stroke:'backstroke' as Stroke, block:'10\' easy'}],
    constraints:['의료확인 필요 플래그: 고혈압 또는 증상','강도 상승 금지'],
    intensity_cues:{primary:'RPE 9–10(매우 가벼움)'},
    stop_rules:[BP_STOP_RULE,'chest_pain','unusual_dyspnea']
  }]: sessions;

  return {
    microcycle_week: 1,
    weekly_target_min: clearance? 60 : weeklyMin,
    medical_clearance_required: clearance,
    sessions: finalSessions,
    strength_days: 2,
    next_week_adjustment: next,
    notes
  };
}
