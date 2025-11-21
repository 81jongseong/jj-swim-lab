/**
 * 날짜 선택기 컴포넌트
 * 
 * 컴포넌트 목적:
 * - 유지보수가 필요한 날짜 선택 기능을 통합
 * - 일관된 날짜 선택 UI 제공
 * 
 * 연동 파일:
 * - 모든 날짜 선택이 필요한 페이지
 */

'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  min?: string;
  max?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

export default function DatePicker({
  value,
  onChange,
  label,
  min,
  max,
  required = false,
  className = '',
  error
}: DatePickerProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          required={required}
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

