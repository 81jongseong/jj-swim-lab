/**
 * SwimLab Data Pack v4 - Condition 어댑터
 * 
 * ChatGPT 구조를 기존 HealthCondition 타입으로 변환
 */

import { CONDITIONS as RAW_CONDITIONS } from './conditions_full';
import { HealthCondition } from '../types';

// ChatGPT Condition을 HealthCondition으로 변환
export const HEALTH_CONDITIONS: HealthCondition[] = RAW_CONDITIONS.map(raw => {
  // impacts 배열을 Record로 변환
  const impactsRecord: Record<string, string> = {};
  raw.impacts.forEach(impact => {
    impactsRecord[impact.type] = impact.how + (impact.delta ? ` (${impact.delta}%)` : '');
  });

  // strokeNotes에서 avoid 추출
  const avoid: Record<string, boolean> = {};
  if (raw.strokeNotes) {
    Object.entries(raw.strokeNotes).forEach(([stroke, note]) => {
      if (note.level === 'avoid') {
        avoid[stroke] = true;
      }
    });
  }

  // category 매핑
  const categoryMap: Record<string, any> = {
    'spine': 'joint',
    'shoulder': 'joint',
    'elbow': 'joint',
    'wrist': 'joint',
    'hip': 'joint',
    'knee': 'joint',
    'ankle': 'joint',
    'skin': 'skin',
    'ent': 'general',
    'chronic': 'general',
    'mental': 'mental',
    'special': 'special',
    'other': 'general'
  };

  // cap 추출
  const intensityImpact = raw.impacts.find(i => i.type === 'intensity');
  let cap: any = undefined;
  if (intensityImpact?.how.includes('Z3')) cap = 'Z3';
  else if (intensityImpact?.how.includes('Z4')) cap = 'Z4';
  else if (intensityImpact?.how.includes('Z5')) cap = 'Z5';
  else if (intensityImpact?.how.includes('EN3')) cap = 'EN3';
  else if (intensityImpact?.how.includes('EN2')) cap = 'EN2';
  else if (intensityImpact?.how.includes('EN1')) cap = 'EN1';

  // restBonus 추출
  const restImpact = raw.impacts.find(i => i.type === 'rest');
  let restBonus = 0;
  if (restImpact?.how.includes('+')) {
    const match = restImpact.how.match(/\+(\d+)/);
    if (match) restBonus = parseInt(match[1]);
  }

  return {
    id: raw.id,
    name: raw.name,
    category: categoryMap[raw.category] || 'general',
    severity: raw.severity || 'mild',
    impacts: impactsRecord as any,
    adjustments: {
      cap,
      restBonus,
      avoid,
      notes: raw.notes || [],
      evidenceIds: raw.evidenceKeys
    },
    description: raw.impacts.map(i => i.how).join(', ')
  };
});

export { RAW_CONDITIONS as CONDITIONS };




