
import { AthleteProfile, WorkoutPlan, WorkoutBlock, Zone } from '../types';
import { loadRegistry } from '../store/registry';
import { paceByZone, formatPace } from '../utils/pace';

type Pat = 'even'|'threshold'|'vo2'|'sprint'|'descend'|'ascend'|'build'|'ladder'|'pyramid'|'broken'|'fartlek'|'tempo'|'choice'|'kick'|'pull'|'drillswim';

function zoneCapFromRules(healthIds:string[]): Zone {
  const reg = loadRegistry(); let cap: Zone = 'Z5';
  for(const id of healthIds){
    const cond = reg.conditions.find(c=>c.id===id); if(!cond) continue;
    for(const r of cond.rules){
      if(r.axis==='intensity' && typeof r.adjust==='string' && r.adjust.startsWith('cap:')){
        const z = r.adjust.split(':')[1] as Zone;
        const rank = (x:Zone)=>({Z1:1,Z2:2,Z3:3,Z4:4,Z5:5}[x]); if(rank(z) < rank(cap)) cap = z;
      }
    }
  } return cap;
}
function restAdjustSec(healthIds:string[]): number {
  const reg = loadRegistry(); let add = 0;
  for(const id of healthIds){
    const cond = reg.conditions.find(c=>c.id===id); if(!cond) continue;
    for(const r of cond.rules){
      if(r.axis==='rest' && typeof r.adjust==='string' && /[+-]\d+s/.test(r.adjust)){ const n = parseInt(r.adjust.replace('s','')); if(!Number.isNaN(n)) add += n; }
    }
  } return add;
}
function techniqueNotes(healthIds:string[]): string[] {
  const reg = loadRegistry(); const notes: string[] = [];
  for(const id of healthIds){
    const cond = reg.conditions.find(c=>c.id===id); if(!cond) continue;
    for(const r of cond.rules){ if(r.axis==='technique') notes.push(`• ${cond.name}: ${r.description}`); if(r.axis==='contraindication') notes.push(`• 금기: ${cond.name} — ${r.description}`); }
  } return notes;
}
function block(title:string, lines:string[], tooltip:string): WorkoutBlock { return { title, lines, tooltip }; }

export function generatePlan(profile: AthleteProfile, pattern: Pat): WorkoutPlan {
  const css = profile.cssSec100 ?? 95;
  const cap = zoneCapFromRules(profile.healthIds);
  const restAdj = restAdjustSec(profile.healthIds);

  const sessionMeters = Math.round(profile.sessionMinutes * 20);
  const wuMeters = Math.round(sessionMeters * 0.2);
  const preMeters = Math.round(sessionMeters * 0.2);
  const mainMeters = Math.round(sessionMeters * 0.5);
  const cdMeters = sessionMeters - (wuMeters+preMeters+mainMeters);

  const wu = [`${Math.round(wuMeters/50)*2}×25 easy @ ${formatPace(paceByZone(css,'Z1'))}`];
  const pre = [`8×25 drills choice (기술/균형) r${10+restAdj}s`, ...techniqueNotes(profile.healthIds)];

  const lines:string[] = [];
  const baseRest = (pattern==='vo2'||pattern==='sprint'||pattern==='broken')? 30 : 20;
  const rest = baseRest + restAdj;
  let zone: Zone = 'Z3';
  if(pattern==='even') zone = (cap==='Z3'?'Z2':'Z3');
  else if(pattern==='threshold') zone = 'Z3';
  else if(pattern==='vo2') zone = cap==='Z3'?'Z3':'Z4';
  else if(pattern==='sprint') zone = cap==='Z3'?'Z3':'Z5';
  else if(pattern==='kick'||pattern==='pull'||pattern==='drillswim') zone = 'Z2';
  else zone = (cap==='Z3'?'Z3':'Z4');

  const p = formatPace(paceByZone(css, zone));
  const mainReps = Math.max(4, Math.round(mainMeters/100));

  switch(pattern){
    case 'even': lines.push(`${mainReps}×100 even @ ${p}, r${rest}s`); break;
    case 'threshold': lines.push(`${Math.max(3,Math.round(mainReps/2))}×200 @ ${p}, r${rest}s`); break;
    case 'vo2': lines.push(`${Math.min(16,mainReps*2)}×50 fast @ ${p}, r${rest+10}s`); break;
    case 'sprint': lines.push(`8×25 all-out, r${Math.max(45,rest+30)}s`); break;
    case 'descend': lines.push(`4×100 descend 1→4 @ ${p}, r${rest}s × ${Math.max(1,Math.round(mainReps/4))}`); break;
    case 'ascend': lines.push(`6×50 ascend 1→6 @ ${p}, r${rest-5}s × ${Math.max(1,Math.round(mainReps/3))}`); break;
    case 'build': lines.push(`8×50 build within 50 @ ${p}, r${rest}s`); break;
    case 'ladder': lines.push(`100-200-300-200-100 @ ${p}, r${rest}s`); break;
    case 'pyramid': lines.push(`50-100-150-200-150-100-50 @ ${p}, r${rest}s`); break;
    case 'broken': lines.push(`200 broken = 3×50 + 50 @ RP close, mid r10–15″, set rest ${rest+20}s`); break;
    case 'fartlek': lines.push(`${mainMeters}m continuous (ez/mod/fast 랜덤 콜)`); break;
    case 'tempo': lines.push(`8×50 SR 고정(템포 트레이너) @ ${p}, r${rest}s`); break;
    case 'choice': lines.push(`3 stations × 3 rounds (kick/pull/drill)`); break;
    case 'kick': lines.push(`8×50 kick board @ Z2 pace, r${rest}s`); break;
    case 'pull': lines.push(`6×100 pull buoy @ Z2 pace, r${rest}s`); break;
    case 'drillswim': lines.push(`(25 drill + 25 swim) × ${mainReps}, r${max(10,rest-5)}s`); break;
  }

  const cd = [`${Math.max(4,Math.round(cdMeters/50))}×25 easy choice`];

  return { profile, blocks: [ block('WU', wu, '가벼운 페이스로 체온/가동성 ↑'), block('PRE', pre, '드릴/기술 전이'), block('MAIN', lines, `패턴:${pattern} / cap:${cap} / rest +${restAdj}s 적용`), block('CD', cd, '정리/호흡 회복') ], totalMeters: sessionMeters };
}
function max(a:number,b:number){ return a>b?a:b; }
