/**
 * 데이터 테이블 컴포넌트
 * 
 * 연동되는 데이터:
 * - data: 테이블에 표시할 데이터 배열
 * - columns: 컬럼 정의 (헤더, 접근자, 렌더러 등)
 * - pagination: 페이지네이션 옵션
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/dashboard, admin/center-management, admin/users 등
 */

'use client';

import React, { useState, useMemo } from 'react';

interface Column {
  key: string;
  header: string;
  accessor?: string | ((row: any) => any);
  render?: (value: any, row: any) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

interface PaginationConfig {
  enabled: boolean;
  pageSize?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  pagination?: PaginationConfig;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
  rowClassName?: (row: any) => string;
}

export default function DataTable({
  data,
  columns,
  pagination = { enabled: false },
  searchable = false,
  searchPlaceholder = "검색...",
  className = "",
  loading = false,
  emptyMessage = "데이터가 없습니다.",
  onRowClick,
  rowClassName
}: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.pageSize || 10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // 검색 필터링
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;
    
    return data.filter(row =>
      columns.some(column => {
        const value = column.accessor 
          ? (typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor])
          : row[column.key];
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [data, searchTerm, columns, searchable]);

  // 정렬
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      if (!column) return 0;
      
      const aValue = column.accessor 
        ? (typeof column.accessor === 'function' ? column.accessor(a) : a[column.accessor])
        : a[column.key];
      const bValue = column.accessor 
        ? (typeof column.accessor === 'function' ? column.accessor(b) : b[column.accessor])
        : b[column.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, columns]);

  // 페이지네이션
  const paginatedData = useMemo(() => {
    if (!pagination.enabled) return sortedData;
    
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination.enabled]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;
    
    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const getCellValue = (row: any, column: Column) => {
    const value = column.accessor 
      ? (typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor])
      : row[column.key];
    
    return column.render ? column.render(value, row) : value;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* 검색 및 컨트롤 */}
      {(searchable || pagination.showSizeChanger) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {searchable && (
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            {pagination.showSizeChanger && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">페이지 크기:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {pagination.pageSizeOptions?.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <span className={`text-xs ${sortConfig?.key === column.key && sortConfig.direction === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}>
                          ▲
                        </span>
                        <span className={`text-xs ${sortConfig?.key === column.key && sortConfig.direction === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}>
                          ▼
                        </span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName ? rowClassName(row) : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      {pagination.enabled && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              총 {filteredData.length}개 중 {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredData.length)}개 표시
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                이전
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === i + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                다음
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

