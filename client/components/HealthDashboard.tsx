/**
 * 🏥 JJ Swim Lab - 건강 대시보드 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 개인 회원의 건강 상태 및 운동 현황을 종합적으로 표시
 * - 건강 위험도, 운동 목표, 최근 기록 등을 한눈에 확인
 * - 건강 데이터 기반 맞춤형 권장사항 제공
 * 
 * 🔄 **주요 기능**
 * - 건강 위험도 평가 및 시각화
 * - 주간 운동 목표 및 진행률 표시
 * - 최근 운동 기록 및 만족도 추적
 * - 건강 목표 설정 및 진행 상황
 * - 현재 운동 프로그램 미리보기
 * 
 * 🗄️ **데이터 연동**
 * - 사용자 건강 데이터 API와 연동
 * - 운동 기록 및 통계 데이터 연동
 * - 목표 설정 및 진행률 데이터 연동
 * - 프로그램 생성 시스템과 연동
 */

'use client';

import React from 'react';
import { TrendingUp, Target, Activity, Calendar, Heart, Scale, Zap } from 'lucide-react';
// Weight는 lucide-react에 없음, Scale 사용

interface HealthData {
  riskLevel: 'low' | 'medium' | 'high';
  riskChange: number;
  weeklyGoal: number;
  weeklyTotal: number;
  weeklyChange: number;
  exerciseFrequency: number;
  frequencyChange: number;
  nextWorkout: string;
  nextWorkoutChange: number;
}

interface ExerciseRecord {
  date: string;
  duration: number;
  satisfaction: number;
  pain: number;
}

interface HealthGoal {
  name: string;
  current: number;
  target: number;
  progress: number;
  unit: string;
}

interface WeeklyProgram {
  _id?: string;
  programId?: string;
  courseId?: string;
  courseName?: string;
  instructorName?: string;
  day: string;
  duration: number;
  strokes: string;
  summary?: string;
}

interface HealthDashboardProps {
  healthData: HealthData;
  exerciseRecords: ExerciseRecord[];
  healthGoals: HealthGoal[];
  weeklyProgram: WeeklyProgram[];
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({
  healthData,
  exerciseRecords,
  healthGoals,
  weeklyProgram
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRiskText = (level: string) => {
    switch (level) {
      case 'low': return '저위험';
      case 'medium': return '중위험';
      case 'high': return '고위험';
      default: return '평가중';
    }
  };

  return (
    <div className="space-y-6">
      {/* 건강 위험도 및 현재 상태 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">건강 위험도</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(healthData.riskLevel)}`}>
              {getRiskText(healthData.riskLevel)}
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span>전월 대비 ↗️ {Math.abs(healthData.riskChange)}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">주간 목표</h3>
            <Target className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-2">{healthData.weeklyGoal}분</div>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span>전월 대비 ↗️ {Math.abs(healthData.weeklyChange)}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">운동 빈도</h3>
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-2">{healthData.exerciseFrequency}회</div>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
            <span>전월 대비 ↗️ {Math.abs(healthData.frequencyChange)}%</span>
          </div>
        </div>
      </div>

      {/* 최근 운동 기록 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 운동 기록</h3>
        <div className="space-y-3">
          {exerciseRecords.map((record, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{record.date}</span>
                <span className="text-gray-600">{record.duration}분</span>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <Heart className="h-4 w-4 text-red-500 mr-1" />
                  <span>만족도: {record.satisfaction}/10</span>
                </div>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-orange-500 mr-1" />
                  <span>통증: {record.pain}/10</span>
                </div>
              </div>
            </div>
          ))}
          <button className="w-full mt-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
            전체 기록 보기
          </button>
        </div>
      </div>

      {/* 건강 목표 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">건강 목표</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            목표 설정하기
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthGoals.map((goal, index) => (
            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                <span className="text-sm font-bold text-blue-600">{goal.progress}%</span>
              </div>
              <div className="mb-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>현재: {goal.current}{goal.unit}</span>
                <span>목표: {goal.target}{goal.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주간 운동 프로그램 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">주간 운동 프로그램</h3>
          {weeklyProgram.length > 0 && weeklyProgram[0]?.programId && (
            <button 
              onClick={() => window.location.href = `/health/history`}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              프로그램 이력 보기
            </button>
          )}
        </div>
        {weeklyProgram.length > 0 ? (
          <>
            {weeklyProgram[0]?.courseName && (
              <div className="mb-3 text-sm text-gray-600">
                <span className="font-medium">{weeklyProgram[0].courseName}</span>
                {weeklyProgram[0].instructorName && (
                  <span className="ml-2">· {weeklyProgram[0].instructorName} 강사</span>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {weeklyProgram.map((day, index) => (
                <div 
                  key={index} 
                  className="p-3 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    if (day.programId) {
                      window.location.href = `/health/history`;
                    }
                  }}
                >
                  <div className="font-semibold text-gray-900 mb-1">{day.day}</div>
                  <div className="text-sm text-blue-600 mb-1">{day.duration}분</div>
                  <div className="text-xs text-gray-600">{day.strokes}</div>
                </div>
              ))}
            </div>
            {weeklyProgram[0]?.summary && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 line-clamp-2">{weeklyProgram[0].summary}</p>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">강사가 생성한 프로그램이 없습니다.</p>
            <p className="text-gray-400 text-xs mt-2">등록된 반의 강사가 프로그램을 생성하면 여기에 표시됩니다.</p>
          </div>
        )}
      </div>

      {/* 건강 팁 */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Zap className="h-6 w-6 text-green-600 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">건강한 수영을 위한 팁</h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              운동 전 충분한 워밍업을 하고, 운동 중 통증이나 불편함이 있으면 즉시 중단하세요. 
              규칙적인 운동이 건강 개선에 가장 효과적입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;


