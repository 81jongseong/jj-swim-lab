/**
 * 센터 과정 관리 - 필터 버튼 컴포넌트
 * 
 * 연동 파일:
 * - client/app/center-admin/courses/page.tsx
 */

import React from 'react';

interface CourseFilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  allTags: string[]; // 모든 과정의 태그 목록
}

// 기본 시간대 필터
const defaultFilters = [
  { id: 'all', label: '전체보기', icon: '📋' },
  { id: 'dawn', label: '새벽', icon: '🌅' },
  { id: 'morning', label: '오전', icon: '🌞' },
  { id: 'afternoon', label: '오후', icon: '🌤️' },
  { id: 'evening', label: '저녁', icon: '🌙' },
];

// 태그별 기본 아이콘 매핑
const getTagIcon = (tag: string): string => {
  const iconMap: { [key: string]: string } = {
    '어린이': '👶',
    '키즈': '👶',
    '아쿠아': '💧',
    '수중': '💧',
    '초보자': '🔰',
    '경영': '🏆',
    '재활': '🏥',
    '피트니스': '💪',
    '다이어트': '🏋️',
    '실버': '👴',
    '임산부': '🤰',
    '새벽': '🌅',
    '저녁': '🌙',
    '주말': '🎉',
    '단체': '👥',
    '개인': '🙋',
    '성인': '🧑',
  };
  
  // 태그에 해당하는 아이콘 찾기
  for (const [key, icon] of Object.entries(iconMap)) {
    if (tag.includes(key)) return icon;
  }
  
  return '🏊'; // 기본 아이콘
};

export default function CourseFilterButtons({ 
  activeFilter, 
  onFilterChange,
  allTags
}: CourseFilterButtonsProps) {
  // 동적 태그 필터 생성
  const tagFilters = allTags.map(tag => ({
    id: tag,
    label: tag,
    icon: getTagIcon(tag)
  }));

  // 전체 필터 = 기본 필터 + 동적 태그 필터
  const filters = [...defaultFilters, ...tagFilters];

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">필터</h3>
        <span className="text-xs text-gray-500">
          {allTags.length > 0 ? `${allTags.length}개 사용자 정의 태그` : '시간대 필터만 사용 중'}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === filter.id
                ? 'bg-blue-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.icon} {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

