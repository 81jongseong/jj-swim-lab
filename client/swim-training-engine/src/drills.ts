/**
 * JJ Swim Lab: 드릴 카탈로그
 * 목표/효과·장단점/주의·코칭포인트를 데이터로 보관
 */

import { Drill } from './types';

export const DRILLS: Drill[] = [
  {
    id: 'fs_catch_up',
    name: 'Catch-up Drill',
    strokes: ['FR'],
    helps: ['풀링 타이밍', '균형 유지', '롤링 개선'],
    pros: ['풀링 효율성 향상', '균형감 개선'],
    cons: ['속도 저하', '자연스러운 리듬 방해'],
    cautions: ['과도한 지연 금지', '어깨 부상 주의'],
    cues: ['한 팔이 완전히 앞으로 갈 때까지 기다려', '몸통 롤링 활용', '엄지손가락이 먼저 들어가게'],
    typicalUse: {
      zones: ['Z1', 'Z2'],
      rep25: [4, 6, 8],
      rep50: [2, 4, 6],
      restSec: [15, 20, 25]
    }
  },
  {
    id: 'fs_6_1_6',
    name: '6-1-6 Drill',
    strokes: ['FR'],
    helps: ['킥과 풀링 조화', '리듬감 향상', '지구력 향상'],
    pros: ['킥-풀링 조화', '리듬감 개선'],
    cons: ['킥 과부하', '다리 피로'],
    cautions: ['무릎 과신전 주의', '킥 강도 조절'],
    cues: ['6번 킥 후 1번 풀링', '킥과 풀링 동기화', '몸통 롤링 활용'],
    typicalUse: {
      zones: ['Z2', 'Z3'],
      rep25: [4, 6],
      rep50: [2, 4],
      restSec: [20, 30]
    }
  },
  {
    id: 'fs_single_arm',
    name: 'Single Arm Drill',
    strokes: ['FR'],
    helps: ['풀링 기술', '균형감', '롤링 개선'],
    pros: ['풀링 기술 향상', '균형감 개선'],
    cons: ['비대칭 자세', '어깨 부상 위험'],
    cautions: ['양팔 균등 훈련', '어깨 부상 주의'],
    cues: ['한 팔만 사용', '몸통 롤링 활용', '반대팔 앞으로 유지'],
    typicalUse: {
      zones: ['Z1', 'Z2'],
      rep25: [4, 6, 8],
      rep50: [2, 4, 6],
      restSec: [15, 20, 25]
    }
  },
  {
    id: 'fs_fingertip',
    name: 'Fingertip Drag',
    strokes: ['FR'],
    helps: ['엘보우 높이', '리커버리 개선', '어깨 유연성'],
    pros: ['엘보우 높이 향상', '리커버리 개선'],
    cons: ['속도 저하', '자연스러운 움직임 방해'],
    cautions: ['과도한 드래그 금지', '어깨 부상 주의'],
    cues: ['엘보우 높이 유지', '손가락끝으로 물 드래그', '몸통 롤링 활용'],
    typicalUse: {
      zones: ['Z1', 'Z2'],
      rep25: [4, 6, 8],
      rep50: [2, 4, 6],
      restSec: [15, 20, 25]
    }
  },
  {
    id: 'fs_fist',
    name: 'Fist Drill',
    strokes: ['FR'],
    helps: ['풀링 효율성', '전완 활용', '워터감각'],
    pros: ['풀링 효율성 향상', '전완 활용 개선'],
    cons: ['속도 저하', '자연스러운 움직임 방해'],
    cautions: ['과도한 힘 금지', '어깨 부상 주의'],
    cues: ['주먹 쥐고 수영', '전완으로 물 밀기', '워터감각 향상'],
    typicalUse: {
      zones: ['Z1', 'Z2'],
      rep25: [4, 6],
      rep50: [2, 4],
      restSec: [20, 30]
    }
  },
  {
    id: 'fs_scull1',
    name: 'Sculling Drill',
    strokes: ['FR'],
    helps: ['워터감각', '풀링 효율성', '전완 활용'],
    pros: ['워터감각 향상', '풀링 효율성 개선'],
    cons: ['속도 저하', '자연스러운 움직임 방해'],
    cautions: ['과도한 힘 금지', '어깨 부상 주의'],
    cues: ['8자 모양으로 스컬링', '전완으로 물 밀기', '워터감각 향상'],
    typicalUse: {
      zones: ['Z1', 'Z2'],
      rep25: [4, 6],
      rep50: [2, 4],
      restSec: [20, 30]
    }
  },
  {
    id: 'bk_kick',
    name: 'Backstroke Kick',
    strokes: ['BK'],
    helps: ['킥 기술', '균형감', '지구력'],
    pros: ['킥 기술 향상', '균형감 개선'],
    cons: ['목 부상 위험', '방향 감각 상실'],
    cautions: ['목 과신전 주의', '충분한 공간 확보'],
    cues: ['엄지발가락이 먼저 들어가게', '무릎 과신전 금지', '몸통 안정성 유지'],
    typicalUse: {
      zones: ['Z1', 'Z2'],
      rep25: [4, 6, 8],
      rep50: [2, 4, 6],
      restSec: [15, 20, 25]
    }
  },
  {
    id: 'br_pull',
    name: 'Breaststroke Pull',
    strokes: ['BR'],
    helps: ['풀링 기술', '타이밍', '워터감각'],
    pros: ['풀링 기술 향상', '타이밍 개선'],
    cons: ['어깨 부상 위험', '과도한 힘 사용'],
    cautions: ['어깨 부상 주의', '과도한 힘 금지'],
    cues: ['Y자 모양으로 풀링', '엘보우 높이 유지', '타이밍 조화'],
    typicalUse: {
      zones: ['Z1', 'Z2'],
      rep25: [4, 6],
      rep50: [2, 4],
      restSec: [20, 30]
    }
  },
  {
    id: 'fl_dolphin',
    name: 'Dolphin Kick',
    strokes: ['FL'],
    helps: ['킥 기술', '코어 강화', '리듬감'],
    pros: ['킥 기술 향상', '코어 강화'],
    cons: ['허리 부상 위험', '과도한 힘 사용'],
    cautions: ['허리 부상 주의', '과도한 힘 금지'],
    cues: ['엉덩이부터 킥', '무릎 과신전 금지', '리듬감 유지'],
    typicalUse: {
      zones: ['Z1', 'Z2'],
      rep25: [4, 6],
      rep50: [2, 4],
      restSec: [20, 30]
    }
  },
  {
    id: 'im_transition',
    name: 'IM Transition',
    strokes: ['IM'],
    helps: ['전환 기술', '타이밍', '지구력'],
    pros: ['전환 기술 향상', '타이밍 개선'],
    cons: ['복잡한 기술', '과부하 위험'],
    cautions: ['과부하 주의', '충분한 휴식'],
    cues: ['부드러운 전환', '타이밍 조화', '지구력 유지'],
    typicalUse: {
      zones: ['Z2', 'Z3'],
      rep25: [2, 4],
      rep50: [1, 2],
      restSec: [30, 45]
    }
  }
];