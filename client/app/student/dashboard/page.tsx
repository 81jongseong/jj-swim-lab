/**
 * @file 학생 대시보드 페이지
 * @description 학생이 자신의 강의, 예약, 진행상황 등을 확인할 수 있는 대시보드입니다.
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { BookOpen, Calendar, TrendingUp, Award, Clock, Star, Target, Activity } from 'lucide-react';

interface StudentStats {
  enrolledCourses: number;
  completedSessions: number;
  totalSessions: number;
  currentStreak: number;
  averageRating: number;
  weeklyGoal: number;
}

interface ProgressData {
  skill: string;
  level: string;
  progress: number;
  nextMilestone: string;
}

interface UpcomingClass {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending';
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    completedSessions: 0,
    totalSessions: 0,
    currentStreak: 0,
    averageRating: 0,
    weeklyGoal: 3
  });

  const [progressData, setProgressData] = useState<ProgressData[]>([
    {
      skill: '자유형',
      level: '초급',
      progress: 75,
      nextMilestone: '중급 자유형'
    },
    {
      skill: '배영',
      level: '초급',
      progress: 60,
      nextMilestone: '중급 배영'
    },
    {
      skill: '평영',
      level: '입문',
      progress: 30,
      nextMilestone: '초급 평영'
    },
    {
      skill: '접영',
      level: '입문',
      progress: 15,
      nextMilestone: '초급 접영'
    }
  ]);

  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([
    {
      id: '1',
      title: '자유형 초급',
      instructor: '김강사',
      date: '2025-01-15',
      time: '14:00',
      location: '1번 레인',
      status: 'confirmed'
    },
    {
      id: '2',
      title: '배영 기초',
      instructor: '이강사',
      date: '2025-01-17',
      time: '16:00',
      location: '2번 레인',
      status: 'pending'
    }
  ]);

  useEffect(() => {
    // 실제 데이터 로드 로직
    const loadStudentData = async () => {
      try {
        // API 호출 로직
        console.log('학생 데이터 로드 중...');
      } catch (error) {
        console.error('학생 데이터 로드 실패:', error);
      }
    };

    loadStudentData();
  }, []);

  const getStatusColor = (status: string) => {
    return status === 'confirmed' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학생 대시보드</h1>
          <p className="text-gray-600 mt-2">안녕하세요, {user?.name || '학생'}님! 오늘도 수영 연습을 시작해보세요.</p>
        </div>
        <button
          onClick={() => router.push('/student/statistics')}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
        >
          📊 내 훈련 통계
        </button>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">수강 중인 강의</h3>
            <BookOpen className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.enrolledCourses}개</div>
          <p className="text-xs text-gray-500 mt-1">현재 수강 중</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">완료한 수업</h3>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.completedSessions}회</div>
          <p className="text-xs text-gray-500 mt-1">총 {stats.totalSessions}회 중</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">연속 출석</h3>
            <Award className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.currentStreak}일</div>
          <p className="text-xs text-gray-500 mt-1">현재 연속 기록</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">평균 평점</h3>
            <Star className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
          <p className="text-xs text-gray-500 mt-1">강사 평가 기준</p>
        </div>
      </div>

      {/* 진행률 및 목표 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">수영 기술 진행률</h3>
            <p className="text-sm text-gray-600">각 수영 기술별 현재 레벨과 진행상황을 확인하세요.</p>
          </div>
          <div className="space-y-4">
            {progressData.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                  <span className="text-sm text-gray-500">{skill.level}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressColor(skill.progress)}`}
                    style={{ width: `${skill.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">다음 목표: {skill.nextMilestone}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">주간 목표</h3>
            <p className="text-sm text-gray-600">이번 주 목표와 현재 진행상황을 확인하세요.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">주간 수업 목표</span>
              </div>
              <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {stats.weeklyGoal}회
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">달성한 수업</span>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                2회
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">남은 목표</span>
              </div>
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                {stats.weeklyGoal - 2}회
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 다음 수업 및 업적 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">다음 수업</h3>
            <p className="text-sm text-gray-600">예정된 수업 일정을 확인하세요.</p>
          </div>
          {upcomingClasses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">예정된 수업이 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{classItem.title}</h4>
                    <p className="text-sm text-gray-600">{classItem.instructor} 강사</p>
                    <p className="text-sm text-gray-500">{classItem.date} {classItem.time}</p>
                    <p className="text-sm text-gray-500">{classItem.location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-sm ${getStatusColor(classItem.status)}`}>
                      {classItem.status === 'confirmed' ? '확정' : '대기'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">업적</h3>
            <p className="text-sm text-gray-600">달성한 업적들을 확인하세요.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">첫 수업</h4>
              <p className="text-xs text-gray-500">완료</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">연속 출석</h4>
              <p className="text-xs text-gray-500">7일</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">기술 향상</h4>
              <p className="text-xs text-gray-500">자유형</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium text-gray-900">목표 달성</h4>
              <p className="text-xs text-gray-500">주간</p>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div className="bg-white rounded-lg shadow p-6 mt-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">빠른 액션</h3>
          <p className="text-sm text-gray-600">자주 사용하는 기능들에 빠르게 접근하세요.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/student/bookings'}
          >
            <Calendar className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">수업 예약</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/student/courses'}
          >
            <BookOpen className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">내 강의</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/student/progress'}
          >
            <TrendingUp className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">진행상황</span>
          </button>
          <button 
            className="h-20 flex flex-col items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => window.location.href = '/student/achievements'}
          >
            <Award className="h-6 w-6 mb-2 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">업적 보기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;