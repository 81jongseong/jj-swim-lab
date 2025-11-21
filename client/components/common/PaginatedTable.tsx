/**
 * 페이지네이션 테이블 컴포넌트
 * 
 * 컴포넌트 목적:
 * - 복잡한 페이지네이션 로직을 포함한 테이블 컴포넌트
 * - 대용량 데이터를 효율적으로 표시
 * 
 * 연동 파일:
 * - 모든 페이지네이션이 필요한 테이블
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SortableTable, { SortableColumn } from './SortableTable';

interface PaginatedTableProps<T> {
  data: T[];
  columns: SortableColumn<T>[];
  itemsPerPage?: number;
  defaultSort?: {
    key: keyof T | string;
    direction: 'asc' | 'desc';
  };
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
}

export default function PaginatedTable<T extends Record<string, any>>({
  data,
  columns,
  itemsPerPage = 10,
  defaultSort,
  onRowClick,
  className = '',
  emptyMessage = '데이터가 없습니다.'
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 데이터 변경 시 첫 페이지로 리셋
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  return (
    <div className={className}>
      <SortableTable
        data={paginatedData}
        columns={columns}
        defaultSort={defaultSort}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4 py-3 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-700">
            {((currentPage - 1) * itemsPerPage + 1)} - {Math.min(currentPage * itemsPerPage, data.length)} / {data.length}개
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

