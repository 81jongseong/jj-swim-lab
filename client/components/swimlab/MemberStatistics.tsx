/**
 * 📊 SwimLab - 회원 훈련 통계 대시보드
 * 
 * 📋 **컴포넌트 목적**
 * - 회원의 훈련 이력 통계 표시
 * - CSS 추이, 완료율, 훈련량 그래프
 * - 생리학적 지표 변화 추적
 * 
 * 🔄 **연동되는 데이터**
 * - SwimProgram (프로그램 이력)
 * - User.swimmingProfile (CSS, 생리학적 지표)
 * 
 * 💡 **사용 대상**
 * - 회원 본인: 자신의 통계 확인
 * - 강사: 담당 회원 통계 확인
 * - 센터 관리자: 모든 회원 통계 확인
 */

'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/utils/api';

interface MemberStatisticsProps {
  memberId: string;
  memberName: string;
  onClose: () => void;
}

interface ProgramHistory {
  _id: string;
  createdAt: string;
  programType: 'weekly' | 'race';
  content: {
    totalMeters: number;
    totalDuration: number;
    sessions: Array<{
      date?: string;
      completion?: {
        completionRate: number;
        feeling: string;
      };
    }>;
  };
}

interface CSSHistory {
  date: string;
  css: {
    freestyle?: number;
    backstroke?: number;
    breaststroke?: number;
    butterfly?: number;
  };
}

export default function MemberStatistics({
  memberId,
  memberName,
  onClose
}: MemberStatisticsProps) {
  const [programs, setPrograms] = useState<ProgramHistory[]>([]);
  const [cssHistory, setCssHistory] = useState<CSSHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, [memberId]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      
      // 프로그램 이력 조회
      const programsResponse = await apiClient.get(`/api/swim-programs/athlete/${memberId}`);
      setPrograms((programsResponse as any).programs || []);
      
      // CSS 이력 조회 (TODO: API 구현 필요)
      // const cssResponse = await apiClient.get(`/api/users/${memberId}/css-history`);
      // setCssHistory(cssResponse.data || []);
      
      setLoading(false);
    } catch (error) {
      logger.error('통계 로드 오류:', error);
      setLoading(false);
    }
  };

  // 📊 통계 계산
  const statistics = useMemo(() => {
    if (programs.length === 0) return null;

    // 완료율 계산
    const completions = programs.flatMap(p => 
      p.content.sessions
        .filter(s => s.completion)
        .map(s => ({
          date: s.date,
          rate: s.completion!.completionRate,
          feeling: s.completion!.feeling
        }))
    );

    const avgCompletionRate = completions.length > 0
      ? Math.round(completions.reduce((sum, c) => sum + c.rate, 0) / completions.length)
      : 0;

    // 훈련량 계산
    const totalMeters = programs.reduce((sum, p) => sum + (p.content.totalMeters || 0), 0);
    const totalMinutes = programs.reduce((sum, p) => sum + (p.content.totalDuration || 0), 0);

    // 최근 4주 평균
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const recentPrograms = programs.filter(p => new Date(p.createdAt) >= fourWeeksAgo);
    const recentMeters = recentPrograms.reduce((sum, p) => sum + (p.content.totalMeters || 0), 0);
    const weeklyAvgMeters = recentPrograms.length > 0 ? Math.round(recentMeters / 4) : 0;

    return {
      totalPrograms: programs.length,
      avgCompletionRate,
      totalMeters,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      weeklyAvgMeters,
      completions,
      recentPrograms: recentPrograms.length
    };
  }, [programs]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
          <p className="text-center text-gray-600">통계 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">통계 없음</h3>
          <p className="text-gray-600 mb-4">
            {memberName}님의 프로그램 이력이 없습니다.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-blue-900">{memberName}님의 훈련 통계</h3>
              <p className="text-sm text-blue-700 mt-1">전체 {statistics.totalPrograms}개 프로그램 분석</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 핵심 지표 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border-2 border-green-300">
              <p className="text-sm text-green-700 font-medium mb-1">평균 완료율</p>
              <p className="text-3xl font-bold text-green-900">{statistics.avgCompletionRate}%</p>
              <p className="text-xs text-green-600 mt-1">{statistics.completions.length}개 세션</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-300">
              <p className="text-sm text-blue-700 font-medium mb-1">총 훈련 거리</p>
              <p className="text-3xl font-bold text-blue-900">{(statistics.totalMeters / 1000).toFixed(1)}km</p>
              <p className="text-xs text-blue-600 mt-1">{statistics.totalPrograms}개 프로그램</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border-2 border-purple-300">
              <p className="text-sm text-purple-700 font-medium mb-1">총 훈련 시간</p>
              <p className="text-3xl font-bold text-purple-900">{statistics.totalHours}h</p>
              <p className="text-xs text-purple-600 mt-1">{Math.round(statistics.totalMinutes / statistics.totalPrograms)}분/프로그램</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border-2 border-orange-300">
              <p className="text-sm text-orange-700 font-medium mb-1">주간 평균 거리</p>
              <p className="text-3xl font-bold text-orange-900">{(statistics.weeklyAvgMeters / 1000).toFixed(1)}km</p>
              <p className="text-xs text-orange-600 mt-1">최근 4주 기준</p>
            </div>
          </div>

          {/* CSS 추이 (준비 중) */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">📈 CSS 추이</h4>
            <div className="h-64 flex items-center justify-center bg-white rounded border border-gray-200">
              <p className="text-gray-500">CSS 추이 그래프 준비 중...</p>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 CSS 측정 데이터가 축적되면 시간별 변화 그래프가 표시됩니다.
            </p>
          </div>

          {/* 완료율 추이 */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">📊 완료율 추이</h4>
            {statistics.completions.length > 0 ? (
              <div className="space-y-2">
                {statistics.completions.slice(-10).map((comp, idx) => {
                  const rateColor = comp.rate >= 90 ? 'green' : comp.rate >= 80 ? 'blue' : comp.rate >= 70 ? 'yellow' : 'red';
                  const feelingEmoji = {
                    'easy': '😊',
                    'moderate': '😐',
                    'hard': '😓',
                    'very_hard': '😰'
                  }[comp.feeling] || '😐';

                  return (
                    <div key={idx} className="flex items-center gap-3 bg-white rounded p-3 border border-gray-200">
                      <span className="text-xs text-gray-600 w-24">{comp.date}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 bg-${rateColor}-500 rounded`} style={{ width: `${comp.rate}%` }}></div>
                          <span className="text-sm font-semibold text-gray-900">{comp.rate}%</span>
                        </div>
                      </div>
                      <span className="text-lg">{feelingEmoji}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">완료율 데이터가 없습니다.</p>
            )}
          </div>

          {/* 프로그램 이력 */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">📅 프로그램 이력</h4>
            <div className="space-y-2">
              {programs.slice(-10).map((program, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white rounded p-3 border border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {program.programType === 'race' ? '🏆 레이스 플랜' : '🏊 주간 훈련'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(program.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-900">
                      {(program.content.totalMeters / 1000).toFixed(1)}km
                    </p>
                    <p className="text-xs text-gray-600">
                      {program.content.totalDuration}분
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 생리학적 지표 변화 (준비 중) */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">🧬 생리학적 지표 변화</h4>
            <div className="h-48 flex items-center justify-center bg-white rounded border border-gray-200">
              <p className="text-gray-500">VO2max, 심박수 변화 그래프 준비 중...</p>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 스마트워치 연동 시 자동으로 수집됩니다.
            </p>
          </div>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}


