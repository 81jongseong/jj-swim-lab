/**
 * 🎴 드릴 카드 컴포넌트
 * 
 * 📋 **의존성**:
 * - framer-motion (애니메이션)
 * - ../../types/drill3d.ts
 * - ../../stores/threeStore.ts
 * 
 * 🔄 **사용처**:
 * - DrillGrid 컴포넌트
 * - /3d-viewer 페이지
 * 
 * 🎨 **기능**:
 * - 드릴 썸네일, 제목, 설명 표시
 * - 태그, 난이도, 주의사항 표시
 * - 클릭 시 선택 상태 변경 (Zustand)
 * - 선택 시 ring 효과
 * - Hover 애니메이션
 * 
 * 📅 **수정 히스토리**:
 * - 2025-01-22: 초기 생성
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Drill3D } from '../../types/drill3d';
import { useThreeStore } from '../../stores/threeStore';

interface DrillCardProps {
  item: Drill3D;
}

export default function DrillCard({ item }: DrillCardProps) {
  const { selectedId, setSelected } = useThreeStore();
  const active = selectedId === item.id;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢 초급';
      case 'intermediate': return '🟡 중급';
      case 'advanced': return '🔴 고급';
      default: return difficulty;
    }
  };

  const getStrokeText = (stroke: string) => {
    switch (stroke) {
      case 'FR': return '🏊‍♂️ 자유형';
      case 'BK': return '🏊‍♀️ 배영';
      case 'BR': return '🏊 평영';
      case 'FL': return '🦋 접영';
      case 'IM': return '🎯 IM';
      default: return stroke;
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSelected(item.id)}
      className={`text-left border rounded-2xl overflow-hidden w-full bg-white transition-all duration-200 ${
        active ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      {/* 썸네일 */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-blue-50 to-cyan-50 overflow-hidden">
        {/* 실제 이미지가 없을 때 플레이스홀더 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl">{getStrokeText(item.stroke).split(' ')[0]}</div>
        </div>
        
        {/* 실제 이미지 (나중에 추가) */}
        {/* <img 
          src={item.poster} 
          alt={item.title} 
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        /> */}
        
        {/* 난이도 배지 */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getDifficultyColor(item.difficulty)}`}>
            {getDifficultyText(item.difficulty)}
          </span>
        </div>
        
        {/* 주의사항 아이콘 */}
        {item.cautions && item.cautions.length > 0 && (
          <div className="absolute top-2 left-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-800" title={item.cautions.join(', ')}>
              ⚠️ 주의
            </span>
          </div>
        )}
      </div>

      {/* 내용 */}
      <div className="p-4">
        {/* 제목 & 영법 */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="text-sm font-semibold text-gray-900 line-clamp-1">
            {item.title}
          </div>
          <div className="text-xs text-gray-500 flex-shrink-0">
            {getStrokeText(item.stroke)}
          </div>
        </div>

        {/* 설명 */}
        <div className="text-xs text-gray-600 line-clamp-2 mb-3">
          {item.description}
        </div>

        {/* 태그 */}
        <div className="flex gap-1 flex-wrap">
          {item.tags.slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] border border-gray-200 rounded-full px-2 py-0.5 text-gray-600"
            >
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className="text-[10px] text-gray-400">
              +{item.tags.length - 3}
            </span>
          )}
        </div>

        {/* 선택 표시 */}
        {active && (
          <div className="mt-3 pt-3 border-t border-blue-100">
            <div className="text-xs text-blue-600 font-medium flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              선택됨 - 우측에서 3D 보기
            </div>
          </div>
        )}
      </div>
    </motion.button>
  );
}

