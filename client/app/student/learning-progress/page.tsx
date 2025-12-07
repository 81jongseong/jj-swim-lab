'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Target, Calendar, Award, BarChart3 } from 'lucide-react';
import withAuth from '@/components/withAuth';
import { logger } from '@/lib/logger';
import { LoadingState, PageHeader } from '@/components/common';

interface LearningProgress {
  _id: string;
  courseId: string;
  courseName: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  startDate: Date;
  currentSkills: Array<{
    skill: string;
    level: number; // 1-5
    lastUpdated: Date;
  }>;
  achievements: Array<{
    name: string;
    earnedAt: Date;
    description: string;
  }>;
  totalClasses: number;
  attendanceRate: number;
  lastClassDate?: Date;
  nextGoal?: string;
}

function StudentLearningProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    }
  }, [user]);

  const loadProgress = async () => {
    try {
      setIsLoading(true);
      const apiClient = (await import('@/utils/api')).default;
      const response = await apiClient.getStudentLearningProgress();
      
      if (response.success && response.data) {
        const progressData = response.data.map((p: any) => ({
          _id: p._id || p.courseId || '',
          courseId: p.courseId || '',
          courseName: p.courseName || '제목 없음',
          level: p.level || 'beginner',
          startDate: p.startDate ? new Date(p.startDate) : new Date(),
          currentSkills: p.currentSkills || [],
          achievements: p.achievements || [],
          totalClasses: p.totalClasses || 0,
          attendanceRate: p.attendanceRate || 0,
          lastClassDate: p.lastClassDate ? new Date(p.lastClassDate) : undefined,
          nextGoal: p.nextGoal || '목표 설정 필요'
        }));
        setProgress(progressData);
      }
    } catch (error) {
      logger.error('학습 진도 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    const levels: { [key: string]: string } = {
      'beginner': '초급',
      'intermediate': '중급',
      'advanced': '고급'
    };
    return levels[level] || level;
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return 'bg-green-500';
    if (level >= 3) return 'bg-yellow-500';
    if (level >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="학습 진도를 불러오는 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <PageHeader
          title="학습 진도"
          description="나의 수영 학습 진도와 성취를 확인하세요"
        />

        {/* 전체 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">수강 중인 강의</p>
                <p className="text-2xl font-bold text-gray-900">{progress.length}개</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 수업 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress.reduce((sum, p) => sum + p.totalClasses, 0)}회
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 출석률</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress.length > 0 
                    ? Math.round(progress.reduce((sum, p) => sum + p.attendanceRate, 0) / progress.length)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 성취</p>
                <p className="text-2xl font-bold text-gray-900">
                  {progress.reduce((sum, p) => sum + p.achievements.length, 0)}개
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 강의별 진도 */}
        <div className="space-y-6">
          {progress.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 mr-3">{course.courseName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                      {getLevelLabel(course.level)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>시작일: {course.startDate.toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>총 수업: {course.totalClasses}회</span>
                    <span className="mx-2">•</span>
                    <span className={getAttendanceColor(course.attendanceRate)}>
                      출석률: {course.attendanceRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 현재 기술 수준 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">현재 기술 수준</h4>
                  <div className="space-y-3">
                    {course.currentSkills.map((skill, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                          <span className="text-sm text-gray-500">{skill.level}/5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getSkillLevelColor(skill.level)}`}
                            style={{ width: `${(skill.level / 5) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          마지막 업데이트: {skill.lastUpdated.toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 성취 목록 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">성취 목록</h4>
                  <div className="space-y-3">
                    {course.achievements.map((achievement, index) => (
                      <div key={index} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center mb-1">
                          <Award className="w-4 h-4 text-yellow-600 mr-2" />
                          <span className="font-medium text-gray-900">{achievement.name}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{achievement.description}</p>
                        <p className="text-xs text-gray-500">
                          획득일: {achievement.earnedAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                    {course.achievements.length === 0 && (
                      <p className="text-gray-500 text-sm">아직 획득한 성취가 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 다음 목표 및 최근 활동 */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="text-sm font-medium text-gray-900">마지막 수업</div>
                    <div className="text-sm text-gray-600">
                      {course.lastClassDate 
                        ? course.lastClassDate.toLocaleDateString()
                        : '수업 기록 없음'
                      }
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <div className="text-sm font-medium text-gray-900">평균 기술 수준</div>
                    <div className="text-sm text-gray-600">
                      {course.currentSkills.length > 0 
                        ? (course.currentSkills.reduce((sum, s) => sum + s.level, 0) / course.currentSkills.length).toFixed(1)
                        : '0'
                      }/5
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <div className="text-sm font-medium text-gray-900">다음 목표</div>
                    <div className="text-sm text-gray-600">
                      {course.nextGoal || '목표 설정 필요'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {progress.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">학습 진도 데이터가 없습니다.</p>
            <p className="text-sm text-gray-400 mt-2">강의에 등록하면 여기서 진도를 확인할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(StudentLearningProgress, { 
  requireTypes: ['student'] 
});