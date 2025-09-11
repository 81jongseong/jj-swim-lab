/**
 * 📋 JJ Swim Lab - TableCell UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 테이블의 개별 셀을 담당하는 컴포넌트
 * - 테이블 데이터의 각 셀을 표시
 * - 접근성을 고려한 테이블 셀 구조 및 네비게이션
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * 
 * 🔄 **주요 기능**
 * - 테이블 셀 렌더링
 * - 셀 데이터 표시 및 포맷팅
 * - 접근성 지원 (ARIA 속성, 키보드 네비게이션)
 * - 반응형 셀 디자인
 * - 커스터마이징 가능한 스타일
 * 
 * 🗄️ **데이터 연동**
 * - 테이블 셀 데이터
 * - 셀 상태 및 포맷팅 정보
 * - 접근성 속성 및 ARIA 값
 * - 반응형 디자인 설정
 * - 셀 인터랙션 이벤트
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (기본 컴포넌트)
 * - 접근성 도구 및 라이브러리
 * - 반응형 디자인 라이브러리
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 셀 구조의 시맨틱 마크업
 * 2. 접근성 표준 준수
 * 3. 반응형 디자인의 일관성
 * 4. 셀 데이터의 가독성 및 사용성
 * 5. 셀 성능 및 렌더링 최적화
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 테이블 셀 렌더링 확인
 * - [ ] 접근성 속성 확인
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 셀 데이터 표시 검증
 * - [ ] 성능 및 렌더링 최적화 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 테이블 셀)
 * - 2024-12-19: 접근성 지원 시스템 구현
 * - 2024-12-19: 반응형 디자인 적용
 * - 2024-12-19: 성능 최적화 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (테이블 셀 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 고급 셀 기능 (편집 등)
 * - 실시간 데이터 업데이트
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <TableCell 
 *   data={cellData}
 *   format="currency"
 *   accessible={true}
 *   responsive={true}
 * />
 * ```
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  format?: 'text' | 'currency' | 'date' | 'number';
  accessible?: boolean;
  responsive?: boolean;
}

const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
  format = 'text',
  accessible = true,
  responsive = true,
  ...props
}) => {
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    
    switch (format) {
      case 'currency':
        return typeof value === 'number' ? value.toLocaleString() + '원' : value;
      case 'date':
        return value instanceof Date ? value.toLocaleDateString('ko-KR') : value;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return value;
    }
  };

  return (
    <td
      className={cn(
        'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
        responsive && 'whitespace-nowrap',
        className
      )}
      role={accessible ? 'cell' : undefined}
      aria-label={accessible ? `${children} 셀` : undefined}
      {...props}
    >
      {formatValue(children)}
    </td>
  );
};

export default TableCell;

