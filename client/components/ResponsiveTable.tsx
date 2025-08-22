import React from 'react';

interface ResponsiveTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export default function ResponsiveTable({ headers, children, className = '' }: ResponsiveTableProps) {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Flexbox 방식의 테이블 - 100% 확실하게 작동 */}
      <div className="flex-table-container">
        {/* 헤더 */}
        <div className="flex-table-header">
          {headers.map((header, index) => (
            <div key={index} className="flex-header-cell">
              {header}
            </div>
          ))}
        </div>
        
        {/* 데이터 행들 */}
        <div className="flex-table-body">
          {children}
        </div>
      </div>
    </div>
  );
}

// 모바일용 카드 컴포넌트
export function MobileCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-50 rounded-lg p-4 border ${className}`}>
      {children}
    </div>
  );
}

// 모바일용 카드 행 컴포넌트
export function MobileCardRow({ label, value, className = '' }: { 
  label: string; 
  value: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-center py-2 ${className}`}>
      <span className="text-sm font-medium text-gray-500 min-w-0 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900 text-right flex-1 ml-4 text-single-line">{value}</span>
    </div>
  );
}
