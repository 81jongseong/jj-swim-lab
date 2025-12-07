'use client';

import { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Calendar,
  Clock,
  ArrowRight,
  Plus,
  Edit,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/StatCard';
import { CardGrid, PageHeader } from '@/components/common';
import { Button } from '@/components/ui';

export default function HealthPage() {
  const [healthSummary, setHealthSummary] = useState({
    riskLevel: 'moderate',
    currentProgram: {
      weeklyMinutes: 150,
      sessionsPerWeek: 5,
      nextSession: 'Mon'
    },
    recentSessions: [
      { date: '2024-01-15', duration: 30, satisfaction: 8, painLevel: 2 },
      { date: '2024-01-12', duration: 25, satisfaction: 7, painLevel: 3 }
    ],
    goals: [
      { name: '체중 감량', progress: 60, target: '65kg', current: '68kg' },
      { name: '심박수 개선', progress: 100, target: '70bpm', current: '75bpm' }
    ]
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return '고위험';
      case 'moderate': return '중위험';
      case 'low': return '저위험';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <PageHeader
        title="건강관리"
        description="나의 건강 상태와 맞춤형 수영 프로그램을 확인하고 관리합니다."
      />

      {/* 빠른 액션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/swimlab/trial">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">🏊 스윔랩 체험</h3>
              <Plus className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">AI 프로그램 생성</div>
            <p className="text-xs text-gray-500 mt-2">☕ 커피 한 잔 값 ₩4,900/월</p>
            <p className="text-xs text-gray-500">건강정보를 입력하여 맞춤형 프로그램을 받아보세요</p>
          </div>
        </Link>

        <Link href="/health/history">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">📋 프로그램 이력</h3>
              <FileText className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">프로그램 관리</div>
            <p className="text-xs text-gray-500">생성된 운동 프로그램을 확인하고 관리하세요</p>
          </div>
        </Link>

        <Link href="/health/measurements">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">측정 데이터</h3>
              <Activity className="h-4 w-4 text-gray-500" />
            </div>
            <div className="text-2xl font-bold">데이터 관리</div>
            <p className="text-xs text-gray-500">건강 지표를 측정하고 기록하세요</p>
          </div>
        </Link>
      </div>

      {/* 건강 상태 요약 */}
      <CardGrid gap={6} className="mb-8">
        <StatCard
          title="건강 위험도"
          value={getRiskText(healthSummary.riskLevel)}
          icon="⚠️"
          color={healthSummary.riskLevel === 'high' ? 'red' : healthSummary.riskLevel === 'moderate' ? 'orange' : 'green'}
          subtitle="현재 건강 상태"
          change={{ value: healthSummary.riskLevel === 'low' ? 10 : healthSummary.riskLevel === 'moderate' ? 5 : -5, type: healthSummary.riskLevel === 'high' ? 'decrease' : 'increase' }}
        />

        <StatCard
          title="주간 목표"
          value={`${healthSummary.currentProgram.weeklyMinutes}분`}
          icon="🎯"
          color="blue"
          subtitle="주간 총 운동 시간"
          change={{ value: 5.2, type: 'increase' }}
        />

        <StatCard
          title="운동 빈도"
          value={`${healthSummary.currentProgram.sessionsPerWeek}회`}
          icon="📅"
          color="green"
          subtitle="주간 운동 횟수"
          change={{ value: 2.1, type: 'increase' }}
        />

        <StatCard
          title="다음 운동"
          value={healthSummary.currentProgram.nextSession}
          icon="⏰"
          color="purple"
          subtitle="다음 운동 예정일"
          change={{ value: 0, type: 'increase' }}
        />
      </CardGrid>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 최근 운동 기록 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              최근 운동 기록
            </h3>
            <p className="text-sm text-gray-600">최근 운동 세션 기록입니다.</p>
          </div>
          <div className="space-y-4">
            {healthSummary.recentSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">{session.date}</div>
                  <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">{session.duration}분</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">만족도: {session.satisfaction}/10</div>
                  <div className="text-sm text-gray-600">통증: {session.painLevel}/10</div>
                </div>
              </div>
            ))}
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              전체 기록 보기
            </button>
          </div>
        </div>

        {/* 건강 목표 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              건강 목표
            </h3>
            <p className="text-sm text-gray-600">건강 목표 진행 상황입니다.</p>
          </div>
          <div className="space-y-4">
            {healthSummary.goals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{goal.name}</span>
                  <span className="text-sm text-gray-600">{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>현재: {goal.current}</span>
                  <span>목표: {goal.target}</span>
                </div>
              </div>
            ))}
            <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              목표 설정하기
            </button>
          </div>
        </div>
      </div>

      {/* 운동 프로그램 미리보기 */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5" />
              현재 운동 프로그램
            </h3>
            <p className="text-sm text-gray-600">이번 주 운동 계획을 확인하세요</p>
          </div>
          <Link href="/health/history">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              프로그램 이력 보기
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
            <div key={day} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium text-sm mb-1">{day}</div>
              <div className="text-xs text-gray-600 mb-2">30분</div>
              <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded">
                배영 + 자유형
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 건강 팁 */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm text-green-800">
              <strong>건강한 수영을 위한 팁:</strong> 운동 전 충분한 워밍업을 하고, 운동 중 통증이나 불편함이 있으면 즉시 중단하세요. 
              규칙적인 운동이 건강 개선에 가장 효과적입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}