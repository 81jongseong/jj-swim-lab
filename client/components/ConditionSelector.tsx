/**
 * 관절질환 선택 컴포넌트
 * 
 * 연동되는 데이터:
 * - 28개 관절질환 데이터
 * - 사용자 선택된 질환 목록
 * 
 * 연동되는 파일:
 * - /data/joint-conditions.ts (관절질환 데이터)
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ConditionSelectorProps {
  selectedConditions: string[];
  onConditionChange: (conditions: string[]) => void;
}

// 질환 이름 매핑 함수
const getConditionName = (conditionId: string): string => {
  const conditionNames: { [key: string]: string } = {
    'lumbar_disc_herniation': '요추 추간판 탈출증',
    'chronic_nonspecific_lbp': '만성 비특이적 요통',
    'lumbar_spinal_stenosis': '요추 척추관 협착증',
    'spondylolisthesis': '척추전방전위증',
    'cervical_spondylosis': '경추증/경추성 통증',
    'rotator_cuff_tendinopathy': '회전근개 건병증',
    'subacromial_impingement': '견봉하 충돌증후군',
    'adhesive_capsulitis': '유착성 관절낭염(오십견)',
    'gh_instability': '견관절 불안정성',
    'shoulder_labral_tear': '견관절 관절순 손상(SLAP 포함)',
    'biceps_tendinopathy': '상완이두근 장두 건병증',
    'lateral_epicondylalgia': '외측 상과염(테니스 엘보)',
    'medial_epicondylalgia': '내측 상과염(골프 엘보)',
    'de_quervain': '드꿰르벵 건초염',
    'carpal_tunnel': '수근관 증후군',
    'tfcc_injury': 'TFCC(삼각섬유연골복합체) 손상',
    'hip_oa': '고관절 골관절염',
    'femoroacetabular_impingement': 'FAI(대퇴비구 충돌)',
    'gtps_gluteal_tendinopathy': '대전자 통증증후군/둔근 건병증',
    'hip_labral_tear': '고관절 관절순 손상',
    'knee_oa': '무릎 골관절염',
    'meniscal_tear': '반월상 연골 손상',
    'patellofemoral_pain': '슬개대퇴 통증증후군',
    'acl_injury': '전방십자인대 손상',
    'ankle_sprain': '발목 염좌',
    'achilles_tendinopathy': '아킬레스 건병증',
    'plantar_fasciitis': '족저근막염',
    'ankle_oa': '발목 골관절염'
  };
  return conditionNames[conditionId] || conditionId;
};

// 질환 데이터 구조
const conditionCategories = [
  {
    name: '척추',
    emoji: '🦴',
    count: 5,
    conditions: [
      { id: 'lumbar_disc_herniation', name: '요추 추간판 탈출증' },
      { id: 'chronic_nonspecific_lbp', name: '만성 비특이적 요통' },
      { id: 'lumbar_spinal_stenosis', name: '요추 척추관 협착증' },
      { id: 'spondylolisthesis', name: '척추전방전위증' },
      { id: 'cervical_spondylosis', name: '경추증/경추성 통증' }
    ]
  },
  {
    name: '어깨',
    emoji: '🤚',
    count: 6,
    conditions: [
      { id: 'rotator_cuff_tendinopathy', name: '회전근개 건병증' },
      { id: 'subacromial_impingement', name: '견봉하 충돌증후군' },
      { id: 'adhesive_capsulitis', name: '유착성 관절낭염(오십견)' },
      { id: 'gh_instability', name: '견관절 불안정성' },
      { id: 'shoulder_labral_tear', name: '견관절 관절순 손상(SLAP 포함)' },
      { id: 'biceps_tendinopathy', name: '상완이두근 장두 건병증' }
    ]
  },
  {
    name: '팔꿈치',
    emoji: '🦾',
    count: 2,
    conditions: [
      { id: 'lateral_epicondylalgia', name: '외측 상과염(테니스 엘보)' },
      { id: 'medial_epicondylalgia', name: '내측 상과염(골프 엘보)' }
    ]
  },
  {
    name: '손목/손',
    emoji: '✋',
    count: 3,
    conditions: [
      { id: 'de_quervain', name: '드꿰르벵 건초염' },
      { id: 'carpal_tunnel', name: '수근관 증후군' },
      { id: 'tfcc_injury', name: 'TFCC(삼각섬유연골복합체) 손상' }
    ]
  },
  {
    name: '고관절',
    emoji: '🦵',
    count: 4,
    conditions: [
      { id: 'hip_oa', name: '고관절 골관절염' },
      { id: 'femoroacetabular_impingement', name: 'FAI(대퇴비구 충돌)' },
      { id: 'gtps_gluteal_tendinopathy', name: '대전자 통증증후군/둔근 건병증' },
      { id: 'hip_labral_tear', name: '고관절 관절순 손상' }
    ]
  },
  {
    name: '무릎',
    emoji: '🦵',
    count: 4,
    conditions: [
      { id: 'knee_oa', name: '무릎 골관절염' },
      { id: 'meniscal_tear', name: '반월상 연골 손상' },
      { id: 'patellofemoral_pain', name: '슬개대퇴 통증증후군' },
      { id: 'acl_injury', name: '전방십자인대 손상' }
    ]
  },
  {
    name: '발목',
    emoji: '🦶',
    count: 4,
    conditions: [
      { id: 'ankle_sprain', name: '발목 염좌' },
      { id: 'achilles_tendinopathy', name: '아킬레스 건병증' },
      { id: 'plantar_fasciitis', name: '족저근막염' },
      { id: 'ankle_oa', name: '발목 골관절염' }
    ]
  }
];

export default function ConditionSelector({ selectedConditions, onConditionChange }: ConditionSelectorProps) {
  const handleConditionToggle = (conditionId: string) => {
    if (selectedConditions.includes(conditionId)) {
      onConditionChange(selectedConditions.filter(c => c !== conditionId));
    } else {
      onConditionChange([...selectedConditions, conditionId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {conditionCategories.map((category) => (
          <div key={category.name}>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {category.emoji} {category.name} ({category.count}개)
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {category.conditions.map((condition) => (
                <label key={condition.id} className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={selectedConditions.includes(condition.id)}
                    onChange={() => handleConditionToggle(condition.id)}
                    className="rounded"
                  />
                  <span className="text-sm">{condition.name}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {selectedConditions.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            선택된 질환 ({selectedConditions.length}개)
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedConditions.map((condition) => (
              <Badge key={condition} variant="secondary">
                {getConditionName(condition)}
                <button
                  onClick={() => handleConditionToggle(condition)}
                  className="ml-1 text-xs hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

