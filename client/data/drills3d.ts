/**
 * 🏊‍♂️ 3D 드릴/영법 샘플 데이터
 * 
 * 📋 **의존성**:
 * - ../types/drill3d.ts
 * 
 * 🔄 **사용처**:
 * - /3d-viewer (체험 페이지)
 * - 3D 갤러리 컴포넌트들
 * 
 * ⚠️ **주의사항**:
 * - 실제 구현 시 DB에서 불러오기 (현재는 샘플)
 * - modelUrl은 /public/models/ 경로 사용
 * - poster는 /public/images/drills/ 경로 사용
 * 
 * 📅 **수정 히스토리**:
 * - 2025-01-22: 초기 샘플 데이터 생성
 */

import type { Drill3D } from '../types/drill3d';

export const DRILLS_3D: Drill3D[] = [
  {
    id: 'free_catch_high_elbow',
    title: '자유형 하이엘보 캐치',
    stroke: 'FR',
    tags: ['캐치', '기술', '팔동작'],
    modelUrl: '/models/fr_hec.glb', // 실제 파일은 나중에 추가
    poster: '/images/drills/fr_hec.jpg',
    description: '전완을 세워 물을 "잡는" 구간을 시각화. 효율적인 추진력 생성의 핵심.',
    cues: [
      '전완 세우기',
      '어깨는 안정',
      '시선 아래 45°',
      '팔꿈치 고정'
    ],
    cautions: [
      '어깨 충돌 민감 시 볼륨↓',
      '회전근개 부상 주의'
    ],
    evidenceKeys: ['shoulder_load_2020'],
    difficulty: 'intermediate',
    isActive: true,
    isPublicDemo: true, // 체험 공개
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'breast_kick_timing',
    title: '평영 킥 타이밍',
    stroke: 'BR',
    tags: ['타이밍', '킥', '하체'],
    modelUrl: '/models/br_kick.glb',
    poster: '/images/drills/br_kick.jpg',
    description: '풋 스냅 타이밍과 몸통 리커버리 연결. 추진력 극대화.',
    cues: [
      '발 안쪽 스냅',
      '무릎 모으기',
      '글라이드 짧게',
      '발목 유연성'
    ],
    cautions: [
      'PFPS(슬개골통증) 시 과볼륨 금지',
      '무릎 내측 부하 주의'
    ],
    evidenceKeys: ['pfps_swim_2019'],
    difficulty: 'beginner',
    isActive: true,
    isPublicDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fly_body_wave',
    title: '접영 바디웨이브',
    stroke: 'FL',
    tags: ['리듬', '바디라인', '전신'],
    modelUrl: '/models/fl_wave.glb',
    poster: '/images/drills/fl_wave.jpg',
    description: '흉추-골반-발끝 파동을 과장해 학습. 리듬 감각 향상.',
    cues: [
      '흉추 리드',
      '과신전 금지',
      '킥 타이밍 1-1',
      '호흡 타이밍'
    ],
    cautions: [
      '요추 신전 민감 시 돌핀↓',
      '목 과신전 금지'
    ],
    evidenceKeys: ['lumbar_ext_2018'],
    difficulty: 'advanced',
    isActive: true,
    isPublicDemo: false, // 고급이라 체험 미공개
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'back_rotation',
    title: '배영 몸통 회전',
    stroke: 'BK',
    tags: ['회전', '코어', '균형'],
    modelUrl: '/models/bk_rotation.glb',
    poster: '/images/drills/bk_rotation.jpg',
    description: '몸통 회전을 통한 팔 리커버리 효율화. 어깨 부담 감소.',
    cues: [
      '골반 회전 리드',
      '어깨 릴렉스',
      '시선 천장',
      '킥 지속'
    ],
    cautions: [
      '목 과도 회전 금지',
      '허리 꺾임 주의'
    ],
    difficulty: 'intermediate',
    isActive: true,
    isPublicDemo: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'im_transition',
    title: 'IM 전환 구간',
    stroke: 'IM',
    tags: ['전환', '타이밍', '복합'],
    modelUrl: '/models/im_transition.glb',
    poster: '/images/drills/im_transition.jpg',
    description: '영법 전환 시 속도 유지 기술. 효율적인 전환 동작.',
    cues: [
      '글라이드 최소화',
      '첫 스트로크 강하게',
      '호흡 타이밍 조정',
      '킥 지속'
    ],
    cautions: [
      '급격한 속도 변화 주의',
      '호흡 실수 방지'
    ],
    difficulty: 'advanced',
    isActive: true,
    isPublicDemo: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * 영법별 드릴 필터링 헬퍼
 */
export function getDrillsByStroke(stroke: 'ALL' | 'FR' | 'BK' | 'BR' | 'FL' | 'IM') {
  if (stroke === 'ALL') return DRILLS_3D;
  return DRILLS_3D.filter(d => d.stroke === stroke);
}

/**
 * 체험 공개된 드릴만 필터링
 */
export function getPublicDrills() {
  return DRILLS_3D.filter(d => d.isPublicDemo && d.isActive);
}

/**
 * 검색 헬퍼
 */
export function searchDrills(query: string) {
  const q = query.toLowerCase();
  return DRILLS_3D.filter(d =>
    d.title.toLowerCase().includes(q) ||
    d.description.toLowerCase().includes(q) ||
    d.tags.some(tag => tag.toLowerCase().includes(q)) ||
    d.cues.some(cue => cue.toLowerCase().includes(q))
  );
}

