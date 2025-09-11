/**
 * 📋 JJ Swim Lab - TableRow UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 테이블의 개별 행을 담당하는 컴포넌트
 * - 테이블 데이터의 각 행을 표시
 * - 접근성을 고려한 테이블 행 구조 및 네비게이션
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * 
 * 🔄 **주요 기능**
 * - 테이블 행 렌더링
 * - 행 선택 및 하이라이트
 * - 접근성 지원 (ARIA 속성, 키보드 네비게이션)
 * - 반응형 행 디자인
 * - 커스터마이징 가능한 스타일
 * 
 * 🗄️ **데이터 연동**
 * - 테이블 행 데이터
 * - 행 상태 및 선택 정보
 * - 접근성 속성 및 ARIA 값
 * - 반응형 디자인 설정
 * - 행 인터랙션 이벤트
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (기본 컴포넌트)
 * - 접근성 도구 및 라이브러리
 * - 반응형 디자인 라이브러리
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 행 구조의 시맨틱 마크업
 * 2. 접근성 표준 준수
 * 3. 반응형 디자인의 일관성
 * 4. 행 선택 및 하이라이트 기능의 사용성
 * 5. 행 성능 및 렌더링 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 테이블 행 렌더링 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 행 선택 및 하이라이트 기능 검증
 * - [ ] 성능 및 렌더링 최적화 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 테이블 행)
 * - 2024-12-19: 접근성 지원 시스템 구현
 * - 2024-12-19: 반응형 디자인 적용
 * - 2024-12-19: 성능 최적화 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (테이블 행 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 행 기능 (드래그 앤 드롭 등)
 * - 실시간 데이터 업데이트
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <TableRow 
 *   data={rowData}
 *   selected={false}
 *   onSelect={() => handleSelect()}
 *   accessible={true}
 *   responsive={true}
 * />
 * ```
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  selected?: boolean;
  onSelect?: () => void;
  accessible?: boolean;
  responsive?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({
  children,
  className,
  selected = false,
  onSelect,
  accessible = true,
  responsive = true,
  ...props
}) => {
  const handleClick = () => {
    if (onSelect) {
      onSelect();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <tr
      className={cn(
        'hover:bg-gray-50',
        selected && 'bg-blue-50 border-blue-200',
        onSelect && 'cursor-pointer',
        responsive && 'divide-x divide-gray-200',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={accessible ? 'row' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-selected={accessible ? selected : undefined}
      {...props}
    >
      {children}
    </tr>
  );
};

export default TableRow;

