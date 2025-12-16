/**
 * 강습법 카드 컴포넌트
 * 
 * 연동되는 데이터:
 * - method: 강습법 정보 객체
 * - onView: 상세보기 클릭
 * - onEdit: 편집 클릭
 * - onDelete: 삭제 클릭
 * - showActions: 액션 버튼 표시 여부
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/teaching-methods 등
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui';

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: string;
  steps?: string[];
  tips?: string[];
  checklist?: string[];
}

interface TeachingMethodCardProps {
  method: TeachingMethod;
  onView: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function TeachingMethodCard({ 
  method, 
  onView, 
  onEdit, 
  onDelete,
  showActions = true 
}: TeachingMethodCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200 hover:border-blue-400"
      onClick={onView}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{method.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                {method.category}
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                {method.level}
              </span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={onView}
              variant="primary"
              size="sm"
            >
              📋 상세보기
            </Button>
            {onEdit && (
              <Button
                onClick={onEdit}
                variant="warning"
                size="sm"
              >
                ✏️ 수정
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={onDelete}
                variant="danger"
                size="sm"
              >
                🗑️ 삭제
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


