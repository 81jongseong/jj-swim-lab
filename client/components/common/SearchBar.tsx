/**
 * 검색 바 컴포넌트
 * 
 * 컴포넌트 목적:
 * - 여러 페이지에서 중복 사용되는 검색 바를 통합
 * - 일관된 검색 UI 제공
 * 
 * 연동 파일:
 * - 모든 검색 기능이 필요한 페이지
 */

'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
  showClearButton?: boolean;
  icon?: React.ReactNode;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = '검색...',
  onSearch,
  className = '',
  showClearButton = true,
  icon
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    onChange('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="relative">
        {icon || (
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-4' : 'pl-10'} pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none`}
        />
        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  );
}

