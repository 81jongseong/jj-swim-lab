/**
 * 건강 플래그별 강도·드릴 제한 규칙
 * 
 * 연동되는 데이터:
 * - 고혈압, 비만, 고지혈증, 당뇨 등 건강 상태
 * - 근골격계 28질환 데이터
 * - 의학적 가이드라인 (ACSM, WHO, AHA 등)
 * 
 * 연동되는 파일:
 * - lib/planner.ts (안전 규칙 적용)
 * - components/PlannerForm.tsx (건강 상태 입력)
 * - data/joint-conditions.ts (근골격계 질환)
 * 
 * 근거 자료:
 * - ACSM 2025 핸드아웃: 고혈압 환자 운동 가이드라인
 * - WHO 2020 신체활동 가이드라인: 주당 150-300분 중강도 권고
 * - 대한고혈압학회 2022 업데이트: 진단·관리 총론
 * - AHA/ACC 2019: 생활활동·1차 예방 권고
 */

export type HealthFlags = {
  hypertension?: boolean;
  obesity?: boolean;
  dyslipidemia?: boolean;
  diabetes?: boolean;
  msd?: string[]; // 근골격계 질환 (Musculoskeletal Disorders)
};

export interface SafetyCaps {
  zones: {
    Z4maxPct: number; // Z4 최대 비율 (%)
    Z5maxPct: number; // Z5 최대 비율 (%)
    maxIntensity: number; // 최대 강도 (RPE)
  };
  hypoxic: {
    enabled: boolean; // 하이폭식 드릴 허용 여부
    maxMeters: number; // 최대 하이폭식 거리 (m)
  };
  kickVolume: {
    maxPct: number; // 킥 볼륨 최대 비율 (%)
    restrictedStrokes: string[]; // 제한된 영법
  };
  session: {
    maxDuration: number; // 최대 세션 시간 (분)
    minRestBetweenSets: number; // 세트 간 최소 휴식 (초)
  };
  restrictions: {
    forbiddenDrills: string[]; // 금지된 드릴
    forbiddenStrokes: string[]; // 금지된 영법
    specialCues: string[]; // 특별 주의사항
  };
}

export interface HealthRule {
  condition: string;
  rule: string;
  value: number | boolean | string[];
  citationId: string;
  description: string;
}

// 건강 상태별 규칙 정의
const HEALTH_RULES: HealthRule[] = [
  // 고혈압 규칙
  {
    condition: 'hypertension',
    rule: 'Z4_Z5_max_percentage',
    value: 10,
    citationId: 'ACSM_2025',
    description: '고혈압 환자는 Z4·Z5 합계 ≤10%로 제한'
  },
  {
    condition: 'hypertension',
    rule: 'hypoxic_max_meters',
    value: 10,
    citationId: 'ACSM_2025',
    description: '하이폭식 드릴 최대 10m로 제한'
  },
  {
    condition: 'hypertension',
    rule: 'max_intensity_rpe',
    value: 6,
    citationId: 'ACSM_2025',
    description: '최대 강도 RPE 6 이하 권장'
  },
  {
    condition: 'hypertension',
    rule: 'session_max_duration',
    value: 60,
    citationId: 'ACSM_2025',
    description: '세션 최대 60분 권장'
  },
  {
    condition: 'hypertension',
    rule: 'forbidden_drills',
    value: ['발살바', '무호흡스프린트'],
    citationId: 'ACSM_2025',
    description: '발살바 동작 및 무호흡 스프린트 금지'
  },
  
  // 비만 규칙
  {
    condition: 'obesity',
    rule: 'weekly_minutes_min',
    value: 150,
    citationId: 'WHO_2020',
    description: '주당 최소 150분 중강도 활동 권장'
  },
  {
    condition: 'obesity',
    rule: 'weekly_minutes_max',
    value: 300,
    citationId: 'WHO_2020',
    description: '주당 최대 300분 중강도 활동 권장'
  },
  {
    condition: 'obesity',
    rule: 'kick_volume_max_pct',
    value: 20,
    citationId: 'ACSM_2025',
    description: '킥 볼륨 최대 20%로 제한 (충격 최소화)'
  },
  {
    condition: 'obesity',
    rule: 'session_max_duration',
    value: 45,
    citationId: 'ACSM_2025',
    description: '초기 세션 최대 45분 권장'
  },
  
  // 고지혈증 규칙
  {
    condition: 'dyslipidemia',
    rule: 'endurance_focus',
    value: true,
    citationId: 'AHA_ACC_2019',
    description: 'EN1→EN2 중심 빈도↑/지속시간↑ 권장'
  },
  {
    condition: 'dyslipidemia',
    rule: 'high_intensity_limit',
    value: 15,
    citationId: 'AHA_ACC_2019',
    description: '고강도는 내성 쌓은 뒤 소량(15% 이하) 권장'
  },
  {
    condition: 'dyslipidemia',
    rule: 'weekly_frequency_min',
    value: 5,
    citationId: 'AHA_ACC_2019',
    description: '주 5일 이상 규칙적 활동 권장'
  },
  
  // 당뇨 규칙
  {
    condition: 'diabetes',
    rule: 'hypoxic_forbidden',
    value: true,
    citationId: 'ACSM_2025',
    description: '무호흡 드릴 제외 (저혈당 리스크)'
  },
  {
    condition: 'diabetes',
    rule: 'min_rest_between_sets',
    value: 30,
    citationId: 'ACSM_2025',
    description: '세트 간 최소 30초 휴식 권장'
  },
  {
    condition: 'diabetes',
    rule: 'session_max_duration',
    value: 50,
    citationId: 'ACSM_2025',
    description: '세션 최대 50분 권장'
  },
  {
    condition: 'diabetes',
    rule: 'special_cues',
    value: ['저혈당 증상 주의', '충분한 수분 섭취', '혈당 모니터링'],
    citationId: 'ACSM_2025',
    description: '저혈당 리스크 고려한 특별 주의사항'
  }
];

// 근골격계 질환별 영법 제한 규칙
const MSD_RULES: Record<string, {
  forbiddenStrokes: string[];
  restrictedStrokes: string[];
  specialCues: string[];
}> = {
  '무릎_관절염': {
    forbiddenStrokes: ['접영'],
    restrictedStrokes: ['평영'],
    specialCues: ['무릎 부하 최소화', '킥 강도 조절']
  },
  '고관절_관절염': {
    forbiddenStrokes: ['접영'],
    restrictedStrokes: ['평영'],
    specialCues: ['고관절 부하 최소화', '킥 범위 제한']
  },
  '어깨_충돌증후군': {
    forbiddenStrokes: ['접영'],
    restrictedStrokes: ['자유형', '배영'],
    specialCues: ['어깨 회전 범위 제한', '풀 동작 조절']
  },
  '허리_디스크': {
    forbiddenStrokes: ['접영'],
    restrictedStrokes: ['배영'],
    specialCues: ['허리 신전 최소화', '코어 안정화 강화']
  },
  '목_디스크': {
    forbiddenStrokes: ['접영'],
    restrictedStrokes: ['배영'],
    specialCues: ['목 신전 최소화', '호흡 자세 조절']
  }
};

/**
 * 건강 플래그에 따른 안전 제한사항 계산
 * @param flags 건강 플래그
 * @returns 안전 제한사항
 */
export function getSafetyCaps(flags: HealthFlags): SafetyCaps {
  const caps: SafetyCaps = {
    zones: {
      Z4maxPct: 25, // 기본값
      Z5maxPct: 15, // 기본값
      maxIntensity: 8 // 기본값
    },
    hypoxic: {
      enabled: true, // 기본값
      maxMeters: 50 // 기본값
    },
    kickVolume: {
      maxPct: 30, // 기본값
      restrictedStrokes: []
    },
    session: {
      maxDuration: 60, // 기본값
      minRestBetweenSets: 15 // 기본값
    },
    restrictions: {
      forbiddenDrills: [],
      forbiddenStrokes: [],
      specialCues: []
    }
  };

  // 고혈압 규칙 적용
  if (flags.hypertension) {
    caps.zones.Z4maxPct = 10;
    caps.zones.Z5maxPct = 0;
    caps.zones.maxIntensity = 6;
    caps.hypoxic.maxMeters = 10;
    caps.session.maxDuration = 60;
    caps.restrictions.forbiddenDrills.push('발살바', '무호흡스프린트');
    caps.restrictions.specialCues.push('혈압 모니터링', '호흡 조절');
  }

  // 비만 규칙 적용
  if (flags.obesity) {
    caps.kickVolume.maxPct = 20;
    caps.session.maxDuration = Math.min(caps.session.maxDuration, 45);
    caps.restrictions.specialCues.push('충격 최소화', '점진적 강도 증가');
  }

  // 고지혈증 규칙 적용
  if (flags.dyslipidemia) {
    caps.zones.Z4maxPct = Math.min(caps.zones.Z4maxPct, 15);
    caps.zones.Z5maxPct = Math.min(caps.zones.Z5maxPct, 10);
    caps.restrictions.specialCues.push('지속적 유산소 강조', '규칙적 활동');
  }

  // 당뇨 규칙 적용
  if (flags.diabetes) {
    caps.hypoxic.enabled = false;
    caps.session.maxDuration = Math.min(caps.session.maxDuration, 50);
    caps.session.minRestBetweenSets = Math.max(caps.session.minRestBetweenSets, 30);
    caps.restrictions.specialCues.push('저혈당 증상 주의', '충분한 수분 섭취', '혈당 모니터링');
  }

  // 근골격계 질환 규칙 적용
  if (flags.msd && flags.msd.length > 0) {
    flags.msd.forEach(condition => {
      const rule = MSD_RULES[condition];
      if (rule) {
        caps.restrictions.forbiddenStrokes.push(...rule.forbiddenStrokes);
        caps.restrictions.specialCues.push(...rule.specialCues);
        
        // 제한된 영법에 대한 킥 볼륨 제한
        if (rule.restrictedStrokes.length > 0) {
          caps.kickVolume.restrictedStrokes.push(...rule.restrictedStrokes);
          caps.kickVolume.maxPct = Math.min(caps.kickVolume.maxPct, 15);
        }
      }
    });
  }

  // 중복 제거
  caps.restrictions.forbiddenDrills = [...new Set(caps.restrictions.forbiddenDrills)];
  caps.restrictions.forbiddenStrokes = [...new Set(caps.restrictions.forbiddenStrokes)];
  caps.restrictions.specialCues = [...new Set(caps.restrictions.specialCues)];
  caps.kickVolume.restrictedStrokes = [...new Set(caps.kickVolume.restrictedStrokes)];

  return caps;
}

/**
 * 건강 상태별 권장 주간 활동량 계산
 * @param flags 건강 플래그
 * @returns 권장 주간 활동량 (분)
 */
export function getRecommendedWeeklyMinutes(flags: HealthFlags): { min: number; max: number } {
  let min = 150; // WHO 기본 권장
  let max = 300; // WHO 기본 권장

  if (flags.hypertension) {
    min = 150; // ACSM 권장
    max = 300;
  }

  if (flags.obesity) {
    min = 150; // WHO 권장
    max = 300;
  }

  if (flags.dyslipidemia) {
    min = 200; // AHA/ACC 권장
    max = 300;
  }

  if (flags.diabetes) {
    min = 150; // ACSM 권장
    max = 250; // 보수적 접근
  }

  return { min, max };
}

/**
 * 건강 상태별 권장 세션 수 계산
 * @param flags 건강 플래그
 * @returns 권장 세션 수
 */
export function getRecommendedSessions(flags: HealthFlags): { min: number; max: number } {
  let min = 3;
  let max = 5;

  if (flags.hypertension) {
    min = 5; // ACSM 권장: 주당 5-7일
    max = 7;
  }

  if (flags.dyslipidemia) {
    min = 5; // AHA/ACC 권장: 주 5일 이상
    max = 6;
  }

  if (flags.diabetes) {
    min = 3; // 보수적 접근
    max = 5;
  }

  return { min, max };
}

/**
 * 건강 상태별 특별 주의사항 조회
 * @param flags 건강 플래그
 * @returns 특별 주의사항 배열
 */
export function getSpecialCues(flags: HealthFlags): string[] {
  const cues: string[] = [];

  if (flags.hypertension) {
    cues.push('혈압 모니터링', '호흡 조절', '점진적 강도 증가');
  }

  if (flags.obesity) {
    cues.push('충격 최소화', '점진적 강도 증가', '체중 부하 고려');
  }

  if (flags.dyslipidemia) {
    cues.push('지속적 유산소 강조', '규칙적 활동', '점진적 강도 증가');
  }

  if (flags.diabetes) {
    cues.push('저혈당 증상 주의', '충분한 수분 섭취', '혈당 모니터링', '규칙적 식사');
  }

  if (flags.msd && flags.msd.length > 0) {
    cues.push('관절 부하 최소화', '통증 발생 시 즉시 중단', '점진적 강도 증가');
  }

  return [...new Set(cues)];
}

/**
 * 건강 규칙의 근거 자료 조회
 * @param condition 건강 상태
 * @returns 근거 자료 배열
 */
export function getHealthRuleCitations(condition: string): Array<{
  citationId: string;
  description: string;
  url?: string;
}> {
  const citations: Record<string, Array<{ citationId: string; description: string; url?: string }>> = {
    hypertension: [
      {
        citationId: 'ACSM_2025',
        description: 'ACSM 2025 핸드아웃: 고혈압 환자 운동 가이드라인',
        url: 'https://www.acsm.org/'
      },
      {
        citationId: '대한고혈압학회_2022',
        description: '대한고혈압학회 2022 업데이트: 진단·관리 총론',
        url: 'https://www.koreanhypertension.org/'
      }
    ],
    obesity: [
      {
        citationId: 'WHO_2020',
        description: 'WHO 2020 신체활동 가이드라인: 주당 150-300분 중강도 권고',
        url: 'https://www.who.int/news-room/fact-sheets/detail/physical-activity'
      }
    ],
    dyslipidemia: [
      {
        citationId: 'AHA_ACC_2019',
        description: 'AHA/ACC 2019: 생활활동·1차 예방 권고',
        url: 'https://www.ahajournals.org/'
      }
    ],
    diabetes: [
      {
        citationId: 'ACSM_2025',
        description: 'ACSM 2025: 당뇨 환자 운동 가이드라인',
        url: 'https://www.acsm.org/'
      }
    ]
  };

  return citations[condition] || [];
}

