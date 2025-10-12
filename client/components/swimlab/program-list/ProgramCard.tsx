/**
 * 🏊 프로그램 카드 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 개별 프로그램을 카드 형식으로 표시
 * - 프로그램 요약 정보 표시
 * - 클릭 시 상세보기
 * 
 * 🔗 **연동 파일:**
 * - ProgramListView.tsx (부모 컴포넌트)
 */

'use client';

import React from 'react';
import { type SavedProgram } from '@/lib/swimlab/utils/programStorage';

interface ProgramCardProps {
  program: SavedProgram;
  onClick: () => void;
}

export default function ProgramCard({ program, onClick }: ProgramCardProps) {
  const getLevelBadge = (level: string) => {
    if (level === 'beginner') return { text: '초급', class: 'bg-green-100 text-green-700' };
    if (level.includes('intermediate')) return { text: '중급', class: 'bg-blue-100 text-blue-700' };
    if (level.includes('advanced')) return { text: '상급', class: 'bg-purple-100 text-purple-700' };
    if (level === 'master' || level === 'expert') return { text: '마스터', class: 'bg-orange-100 text-orange-700' };
    return { text: level, class: 'bg-gray-100 text-gray-700' };
  };

  const getGoalBadge = (goal: string) => {
    const badges: Record<string, string> = {
      '기술 연마': 'bg-blue-100 text-blue-700',
      '체력 향상': 'bg-green-100 text-green-700',
      '실력 향상': 'bg-purple-100 text-purple-700',
      '체중 감량': 'bg-orange-100 text-orange-700'
    };
    return badges[goal] || 'bg-gray-100 text-gray-700';
  };

  const getStrokeName = (stroke: string) => {
    const names: Record<string, string> = {
      'FR': '자유형',
      'BK': '배영',
      'BR': '평영',
      'FL': '접영',
      'IM': '개인혼영'
    };
    return names[stroke] || stroke;
  };

  const level = program.athleteLevel ? getLevelBadge(program.athleteLevel) : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer p-5"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {program.programScope === 'group' ? '📚' : '🏊‍♂️'}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {program.groupClassName || program.athleteName}
              </h4>
              {level && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${level.class}`}>
                  {level.text}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(program.createdAt).toLocaleDateString('ko-KR')}
              {program.programScope === 'group' && (
                <span className="ml-2 text-purple-600">단체반</span>
              )}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          program.programType === 'weekly'
            ? 'bg-blue-100 text-blue-700'
            : 'bg-purple-100 text-purple-700'
        }`}>
          {program.programType === 'weekly' ? '주간' : '레이스'}
        </span>
      </div>

      {/* 요약 정보 */}
      <div className="space-y-2 text-sm">
        {/* 목표 표시 */}
        {program.params?.goal && (
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGoalBadge(program.params.goal)}`}>
              🎯 {program.params.goal}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <span>📅</span>
          <span>{program.params?.startDate || '날짜 미정'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <span>📏</span>
          <span>{program.content?.totalMeters?.toLocaleString() || '0'}m / {program.params?.daysPerWeek || 3}일</span>
        </div>
        {program.params?.stroke && (
          <div className="flex items-center gap-2 text-gray-600">
            <span>🏊</span>
            <span>{getStrokeName(program.params.stroke)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <span>⚕️</span>
          <span>{program.params?.conditionIds?.length || 0}개 컨디션</span>
        </div>
      </div>

      {/* 푸터 */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          클릭하여 상세보기 →
        </p>
      </div>
    </div>
  );
}

