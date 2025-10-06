/**
 * 템플릿 카드 컴포넌트
 * 
 * 연동되는 데이터:
 * - template: 템플릿 정보 객체
 * - onEdit: 편집 버튼 클릭 이벤트
 * - onDelete: 삭제 버튼 클릭 이벤트
 * - onView: 카드 클릭 이벤트
 * 
 * 연동되는 파일:
 * - 사용하는 페이지: admin/lesson-plans 등
 */

'use client';

import React from 'react';
import Button from './Button';

interface Template {
  _id: string;
  templateName: string;
  description: string;
  category: string;
  level: string;
  totalDuration: number;
  totalSessions: number;
  sessionDuration: number;
  stages: any[];
  isPublic: boolean;
}

interface TemplateCardProps {
  template: Template;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  getCategoryIcon: (category: string) => string;
  getLevelBadge: (level: string) => { color: string; icon: string };
}

export default function TemplateCard({ 
  template, 
  onEdit, 
  onDelete, 
  onView,
  getCategoryIcon,
  getLevelBadge 
}: TemplateCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-200 hover:border-blue-400"
      onClick={onView}
    >
      <div className="p-6">
        {/* 템플릿 헤더 */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getCategoryIcon(template.category)}</span>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{template.templateName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadge(template.level).color}`}>
                  {getLevelBadge(template.level).icon} {template.level}
                </span>
                <span className="text-sm text-gray-500">📅 {template.totalDuration}주</span>
                <span className="text-sm text-gray-500">📚 {template.totalSessions}회</span>
              </div>
            </div>
          </div>
          {template.isPublic && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
              🌐 공개
            </span>
          )}
        </div>

        {/* 템플릿 설명 */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* 단계 정보 */}
        <div className="space-y-2 mb-4">
          <h4 className="font-semibold text-gray-900 text-sm">📋 커리큘럼 단계</h4>
          {template.stages?.slice(0, 3).map((stage: any, index: number) => (
            <div key={index} className="bg-gray-50 rounded p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700 truncate">{stage.stageName}</span>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{stage.duration}주</span>
              </div>
            </div>
          ))}
          {template.stages && template.stages.length > 3 && (
            <p className="text-xs text-gray-500 text-center">외 {template.stages.length - 3}개 단계</p>
          )}
        </div>

        {/* 템플릿 정보 */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>사용:</span>
            <span className="font-medium">{(template as any).usageCount || 0}회</span>
          </div>
          <div className="flex justify-between">
            <span>시간:</span>
            <span className="font-medium">{template.sessionDuration}분</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            onClick={onEdit}
            variant="primary"
            size="sm"
            fullWidth
          >
            ✏️ 편집
          </Button>
          <Button
            onClick={onDelete}
            variant="danger"
            size="sm"
            fullWidth
          >
            🗑️ 삭제
          </Button>
        </div>
      </div>
    </div>
  );
}

