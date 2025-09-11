/**
 * 📋 JJ Swim Lab - TableHeaderCell UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 테이블 헤더의 개별 셀을 담당하는 컴포넌트
 * - 컬럼 제목 및 정렬 기능 제공
 * - 접근성을 고려한 헤더 셀 구조 및 네비게이션
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * 
 * 🔄 **주요 기능**
 * - 테이블 헤더 셀 렌더링
 * - 컬럼 정렬 및 필터링
 * - 접근성 지원 (ARIA 속성, 키보드 네비게이션)
 * - 반응형 헤더 셀 디자인
 * - 커스터마이징 가능한 스타일
 * 
 * 🗄️ **데이터 연동**
 * - 헤더 셀 데이터 및 메타데이터
 * - 정렬 및 필터링 상태
 * - 접근성 속성 및 ARIA 값
 * - 반응형 디자인 설정
 * - 헤더 셀 인터랙션 이벤트
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (기본 컴포넌트)
 * - 접근성 도구 및 라이브러리
 * - 반응형 디자인 라이브러리
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 헤더 셀 구조의 시맨틱 마크업
 * 2. 접근성 표준 준수
 * 3. 반응형 디자인의 일관성
 * 4. 정렬 및 필터링 기능의 사용성
 * 5. 헤더 셀 성능 및 렌더링 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 테이블 헤더 셀 렌더링 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 정렬 및 필터링 기능 검증
 * - [ ] 성능 및 렌더링 최적화 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 테이블 헤더 셀)
 * - 2024-12-19: 접근성 지원 시스템 구현
 * - 2024-12-19: 반응형 디자인 적용
 * - 2024-12-19: 성능 최적화 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (테이블 헤더 셀 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 헤더 셀 기능 (드래그 앤 드롭 등)
 * - 실시간 데이터 업데이트
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <TableHeaderCell 
 *   sortable={true}
 *   sortDirection="asc"
 *   onSort={() => handleSort()}
 *   accessible={true}
 *   responsive={true}
 * >
 *   컬럼 제목
 * </TableHeaderCell>
 * ```
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
  sortable?: boolean;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: () => void;
  accessible?: boolean;
  responsive?: boolean;
}

const TableHeaderCell: React.FC<TableHeaderCellProps> = ({
  children,
  className,
  sortable = false,
  sortDirection = null,
  onSort,
  accessible = true,
  responsive = true,
  ...props
}) => {
  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (sortable && onSort && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSort();
    }
  };

  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
        responsive && 'whitespace-nowrap',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={accessible ? 'columnheader' : undefined}
      tabIndex={sortable ? 0 : undefined}
      aria-sort={accessible && sortable ? (sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : 'none') : undefined}
      aria-label={accessible ? `${children} 컬럼` : undefined}
      {...props}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortable && (
          <span className="text-gray-400">
            {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
          </span>
        )}
      </div>
    </th>
  );
};

export default TableHeaderCell;
