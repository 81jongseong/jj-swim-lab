/**
 * 🏊 JJ Swim Lab - 프로그램 표시 카드 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 게스트 프로그램 페이지의 UI 스타일을 수영 엔진에 적용
 * - 생성된 프로그램을 보기 좋게 표시
 * - 각 세트별 상세 정보 제공
 * 
 * 🔄 **주요 기능**
 * - 프로그램 요약 정보 (거리, 시간, 강도)
 * - 세트별 상세 정보 (영법, 거리, 페이스, 휴식, 강도)
 * - 색상별 구역 표시 (Z1-Z5)
 * - 운동 이유 및 팁 표시
 */

'use client';

import React from 'react';
import { Calendar, Clock, Target, Activity } from 'lucide-react';

interface SetItem {
  stroke: string;
  zone: string;
  restSec: number;
  rpe: number;
  equipment: string[];
  subtype?: string;
  meters: number;
  desc: string;
  whyPace: string;
  whyRest: string;
  whySet: string;
  evidenceKeys: string[];
}

interface ProgramData {
  date: string;
  theme: string;
  themeDesc: string;
  sets: SetItem[];
  totalMeters: number;
  totalDuration: number;
  notes: string[];
  goal?: string;
  intensity?: number;
}

interface ProgramDisplayCardProps {
  program: ProgramData;
  showHeader?: boolean;
  className?: string;
}

const ProgramDisplayCard: React.FC<ProgramDisplayCardProps> = ({
  program,
  showHeader = true,
  className = ""
}) => {
  const getZoneColor = (zone: string) => {
    switch (zone) {
      case 'Z1': return 'border-green-500 bg-green-50';
      case 'Z2': return 'border-blue-500 bg-blue-50';
      case 'Z3': return 'border-yellow-500 bg-yellow-50';
      case 'Z4': return 'border-orange-500 bg-orange-50';
      case 'Z5': return 'border-red-500 bg-red-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getZoneTextColor = (zone: string) => {
    switch (zone) {
      case 'Z1': return 'text-green-800';
      case 'Z2': return 'text-blue-800';
      case 'Z3': return 'text-yellow-800';
      case 'Z4': return 'text-orange-800';
      case 'Z5': return 'text-red-800';
      default: return 'text-gray-800';
    }
  };

  const getZoneBadgeColor = (zone: string) => {
    switch (zone) {
      case 'Z1': return 'bg-green-200 text-green-800';
      case 'Z2': return 'bg-blue-200 text-blue-800';
      case 'Z3': return 'bg-yellow-200 text-yellow-800';
      case 'Z4': return 'bg-orange-200 text-orange-800';
      case 'Z5': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getStrokeName = (stroke: string) => {
    const strokeNames: Record<string, string> = {
      'freestyle': '자유형',
      'backstroke': '배영',
      'breaststroke': '평영',
      'butterfly': '접영'
    };
    return strokeNames[stroke] || stroke;
  };

  const formatPace = (desc: string) => {
    const paceMatch = desc.match(/@\s*(\d+):(\d+)/);
    if (paceMatch) {
      return `${paceMatch[1]}:${paceMatch[2]}`;
    }
    return '페이스 정보 없음';
  };

  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">날짜</p>
                <p className="font-semibold text-gray-900">{program.date}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">운동 시간</p>
                <p className="font-semibold text-gray-900">{program.totalDuration}분</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">목표</p>
                <p className="font-semibold text-gray-900">{program.goal || '체력 향상'}</p>
              </div>
            </div>
          </div>

          {/* 프로그램 요약 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600 mb-1">총 거리</p>
                <p className="text-2xl font-bold text-purple-600">{program.totalMeters}m</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">예상 시간</p>
                <p className="text-2xl font-bold text-blue-600">{program.totalDuration}분</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">운동 강도</p>
                <p className="text-2xl font-bold text-green-600">{program.intensity || 100}%</p>
              </div>
            </div>
            {program.themeDesc && (
              <p className="text-sm text-gray-700 mt-4 text-center">
                🎯 <strong>오늘의 테마:</strong> {program.themeDesc}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 운동 세트들 */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          📋 운동 계획
          <span className="ml-3 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
            🤖 AI 엔진 생성
          </span>
        </h3>

        {program.sets && program.sets.length > 0 ? (
          <div className="space-y-4">
            {program.sets.map((set, idx) => (
              <div 
                key={idx}
                className={`border-l-4 rounded-lg p-5 ${getZoneColor(set.zone)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className={`font-bold text-lg ${getZoneTextColor(set.zone)}`}>
                    {idx + 1}. {set.desc}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getZoneBadgeColor(set.zone)}`}>
                    {set.zone}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">영법</p>
                    <p className="font-semibold">{getStrokeName(set.stroke)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">거리</p>
                    <p className="font-semibold">{set.meters}m</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">페이스</p>
                    <p className="font-semibold">{formatPace(set.desc)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">휴식</p>
                    <p className="font-semibold">{set.restSec}초</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-gray-600 mb-1">💡 페이스 이유</p>
                    <p className="text-gray-700">{set.whyPace}</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-gray-600 mb-1">⏰ 휴식 이유</p>
                    <p className="text-gray-700">{set.whyRest}</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-gray-600 mb-1">🎯 세트 이유</p>
                    <p className="text-gray-700">{set.whySet}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>생성된 운동 세트가 없습니다.</p>
          </div>
        )}

        {/* 코치 노트 */}
        {program.notes && program.notes.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="text-lg mr-2">📝</span>
              코치 노트
            </h4>
            {program.notes.map((note, idx) => (
              <p key={idx} className="text-sm text-gray-700 mb-2">{note}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramDisplayCard;


