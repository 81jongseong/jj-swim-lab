/**
 * 정렬 가능한 테이블 컴포넌트
 * 
 * 컴포넌트 목적:
 * - 복잡한 정렬 로직을 포함한 테이블 컴포넌트
 * - 클릭으로 컬럼 정렬 가능
 * 
 * 연동 파일:
 * - 모든 정렬 가능한 테이블이 필요한 페이지
 */

'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

export interface SortableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface SortableTableProps<T> {
  data: T[];
  columns: SortableColumn<T>[];
  defaultSort?: {
    key: keyof T | string;
    direction: 'asc' | 'desc';
  };
  onRowClick?: (row: T) => void;
  className?: string;
  emptyMessage?: string;
}

export default function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  defaultSort,
  onRowClick,
  className = '',
  emptyMessage = '데이터가 없습니다.'
}: SortableTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | string;
    direction: 'asc' | 'desc';
  } | null>(defaultSort || null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'ko-KR');
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: keyof T | string) => {
    if (!sortConfig || sortConfig.key !== key) {
      setSortConfig({ key, direction: 'asc' });
    } else if (sortConfig.direction === 'asc') {
      setSortConfig({ key, direction: 'desc' });
    } else {
      setSortConfig(null);
    }
  };

  if (data.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => {
              const isSortable = column.sortable !== false;
              const isSorted = sortConfig?.key === column.key;
              const sortDirection = isSorted ? sortConfig.direction : null;

              return (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    isSortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => isSortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {isSortable && (
                      <span className="flex flex-col">
                        {sortDirection === 'asc' ? (
                          <ArrowUp className="h-3 w-3 text-blue-600" />
                        ) : sortDirection === 'desc' ? (
                          <ArrowDown className="h-3 w-3 text-blue-600" />
                        ) : (
                          <ArrowUp className="h-3 w-3 text-gray-300" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
            >
              {columns.map((column) => (
                <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

