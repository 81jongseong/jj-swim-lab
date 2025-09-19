/**
 * 🏊‍♂️ JJ Swim Lab - 반응형 테이블 UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 모든 화면 크기에서 최적화된 테이블 표시
 * - 가로 스크롤과 세로 스크롤 지원
 * - 모바일에서도 사용하기 편한 테이블
 * 
 * 🎨 **디자인 특징**
 * - 가로 스크롤: 내용이 잘리지 않음
 * - 고정 헤더: 스크롤 시에도 헤더 보임
 * - 반응형 패딩: 화면 크기별 최적화
 * - 호버 효과: 행별 하이라이트
 * 
 * 🔧 **사용 방법**
 * ```tsx
 * import { ResponsiveTable, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/ResponsiveTable';
 * 
 * <ResponsiveTable>
 *   <TableHeader>
 *     <TableRow>
 *       <TableCell header>이름</TableCell>
 *       <TableCell header>이메일</TableCell>
 *     </TableRow>
 *   </TableHeader>
 *   <TableBody>
 *     <TableRow>
 *       <TableCell>김강사</TableCell>
 *       <TableCell>kim@example.com</TableCell>
 *     </TableRow>
 *   </TableBody>
 * </ResponsiveTable>
 * ```
 */

import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  header?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  minWidth?: string;
}

/**
 * 반응형 테이블 컨테이너
 */
export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  children, 
  className = '', 
  maxHeight = '70vh' 
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}>
      <div 
        className="overflow-x-auto overflow-y-auto"
        style={{ maxHeight }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    </div>
  );
};

/**
 * 테이블 헤더
 */
export const TableHeader: React.FC<TableHeaderProps> = ({ children, className = '' }) => {
  return (
    <thead className={`bg-gray-50 sticky top-0 z-10 ${className}`}>
      {children}
    </thead>
  );
};

/**
 * 테이블 바디
 */
export const TableBody: React.FC<TableBodyProps> = ({ children, className = '' }) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
};

/**
 * 테이블 행
 */
export const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '', 
  onClick 
}) => {
  return (
    <tr 
      className={`hover:bg-gray-50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

/**
 * 테이블 셀
 */
export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '', 
  header = false,
  align = 'left',
  width,
  minWidth = '120px'
}) => {
  const baseClasses = header 
    ? 'px-3 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider'
    : 'px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900';
    
  const alignClasses = {
    left: 'text-left',
    center: 'text-center', 
    right: 'text-right'
  };

  const Tag = header ? 'th' : 'td';

  return (
    <Tag 
      className={`${baseClasses} ${alignClasses[align]} ${className}`}
      style={{ width, minWidth }}
    >
      {children}
    </Tag>
  );
};

export default ResponsiveTable;