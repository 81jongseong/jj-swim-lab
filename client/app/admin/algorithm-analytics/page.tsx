/**
 * 📊 JJ Swim Lab - 프로그램 생성 통계 페이지
 * 
 * 📋 **페이지 목적**
 * - 수영 엔진에서 생성된 프로그램의 통계 분석
 * - 실제 LocalStorage 데이터 기반
 * 
 * 🗄️ **데이터 연동**
 * - getProgramStats() from programStorage.ts
 * 
 * 📅 **생성일**: 2025-01-22
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getProgramStats } from '../../../lib/swimlab/utils/programStorage';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  AlertCircle,
  RefreshCw,
  Calendar,
  Activity
} from 'lucide-react';

export default function AlgorithmAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 실제 프로그램 생성 통계 가져오기
  const stats = useMemo(() => getProgramStats(), [refreshKey]);
  
  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.userType !== 'admin') {
      alert('최고관리자 권한이 필요합니다');
      window.location.href = '/';
      return;
    }
    
    setLoading(false);
  }, [user, authLoading]);
  
  // 시간 범위별 필터링
  const filteredStats = useMemo(() => {
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }
    
    const recentPrograms = stats.programs.filter(p => 
      new Date(p.createdAt) >= cutoffDate
    );
    
    return {
      ...stats,
      recentCount: recentPrograms.length,
      recentPrograms
    };
  }, [stats, timeRange]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                프로그램 생성 통계
              </h1>
              <p className="text-gray-600">
                수영 엔진에서 생성된 프로그램의 통계와 분석 데이터입니다
              </p>
            </div>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              새로고침
            </button>
          </div>
        </div>

        {/* 필터 */}
        <div className="mb-6 flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">최근 7일</option>
            <option value="30d">최근 30일</option>
            <option value="90d">최근 90일</option>
            <option value="1y">최근 1년</option>
          </select>
        </div>

        {/* 주요 지표 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">총 생성 프로그램</div>
              <Target className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">
              선택 기간: {filteredStats.recentCount}개
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">참여 선수</div>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.athletes}명</div>
            <div className="text-xs text-gray-500 mt-1">
              고유 선수 수
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">최근 1주</div>
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.recentCount}</div>
            <div className="text-xs text-gray-500 mt-1">
              지난 7일간 생성
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">평균 프로그램 길이</div>
              <Activity className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.programs.length > 0 
                ? (stats.programs.reduce((sum, p) => sum + (p.numDays || 0), 0) / stats.programs.length).toFixed(1)
                : 0}일
            </div>
            <div className="text-xs text-gray-500 mt-1">
              주간 계획 평균
            </div>
          </div>
        </div>

        {/* 생성 타입 분포 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold mb-4">생성 타입 분포</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredStats.recentPrograms.filter(p => p.type === 'weekly').length}
              </div>
              <div className="text-sm text-gray-600">주간 계획</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredStats.recentPrograms.filter(p => p.type === 'race').length}
              </div>
              <div className="text-sm text-gray-600">경기 준비</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredStats.recentPrograms.filter(p => p.athleteIds && p.athleteIds.length > 1).length}
              </div>
              <div className="text-sm text-gray-600">팀 프로그램</div>
            </div>
          </div>
        </div>

        {/* 최근 생성 프로그램 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">최근 생성 프로그램</h3>
          {filteredStats.recentPrograms.length > 0 ? (
            <div className="space-y-3">
              {filteredStats.recentPrograms.slice(0, 10).map((program) => (
                <div key={program.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {program.athleteIds && program.athleteIds.length > 0 
                        ? `${program.athleteIds.join(', ')} - ${program.type === 'weekly' ? '주간 계획' : '경기 준비'}`
                        : `프로그램 #${program.id.slice(0, 8)}`}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(program.createdAt).toLocaleString('ko-KR')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {program.numDays || 0}일
                    </div>
                    <div className="text-sm text-gray-600">
                      {program.weeklyMeters || 0}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              선택한 기간에 생성된 프로그램이 없습니다
            </div>
          )}
        </div>

        {/* 데이터 수집 안내 */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <div className="font-semibold mb-1">데이터 수집 방법</div>
              <div className="text-blue-800">
                • 프로그램 생성 데이터는 LocalStorage에 저장됩니다<br/>
                • 수영 엔진의 "컨디션 설정" 탭에서 프로그램을 생성하면 자동으로 통계에 반영됩니다<br/>
                • 실시간으로 업데이트되며 브라우저 캐시 삭제 시 초기화됩니다
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
