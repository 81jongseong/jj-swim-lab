/**
 * 정렬 옵션 컴포넌트
 * 
 * 컴포넌트 목적:
 * - 여러 페이지에서 중복 사용되는 정렬 옵션을 통합
 * - 일관된 정렬 UI 제공
 * 
 * 연동 파일:
 * - 모든 정렬 기능이 필요한 페이지
 */

'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export interface SortOption {
  value: string;
  label: string;
}

interface SortOptionsProps {
  value: string;
  onChange: (value: string) => void;
  options: SortOption[];
  className?: string;
  label?: string;
}

export default function SortOptions({
  value,
  onChange,
  options,
  className = '',
  label
}: SortOptionsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <ArrowUpDown className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none bg-white"
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

