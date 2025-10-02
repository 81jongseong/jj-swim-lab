'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, Users, Target, Calendar, BarChart3, Award } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface StudentProgress {
  _id: string;
  studentId: string;
  studentName: string;
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
}

function StudentProgressManagement() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStudentProgress();
    }
  }, [user]);

  const loadStudentProgress = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempStudents: StudentProgress[] = [
        {
          _id: '1',
          studentId: 'student001',
          studentName: '김학생',
          courseId: 'course001',
          courseName: '초급 자유형 클래스',
          level: 'beginner',
          startDate: new Date('2024-01-01'),
          currentSkills: [
            { skill: '자유형 팔 동작', level: 3, lastUpdated: new Date('2024-01-20') },
            { skill: '자유형 발차기', level: 2, lastUpdated: new Date('2024-01-18') },
            { skill: '호흡법', level: 2, lastUpdated: new Date('2024-01-19') }
          ],
          achievements: [
            {
              name: '첫 수영 완주',
              earnedAt: new Date('2024-01-15'),
              description: '25m 자유형을 완주했습니다'
            }
          ],
          totalClasses: 8,
          attendanceRate: 87.5,
          lastClassDate: new Date('2024-01-20')
        },
        {
          _id: '2',
          studentId: 'student002',
          studentName: '이학생',
          courseId: 'course002',
          courseName: '중급 배영 클래스',
          level: 'intermediate',
          startDate: new Date('2023-12-01'),
          currentSkills: [
            { skill: '배영 자세', level: 4, lastUpdated: new Date('2024-01-19') },
            { skill: '배영 발차기', level: 4, lastUpdated: new Date('2024-01-17') },
            { skill: '턴 기술', level: 3, lastUpdated: new Date('2024-01-18') }
          ],
          achievements: [
            {
              name: '배영 마스터',
              earnedAt: new Date('2024-01-10'),
              description: '50m 배영을 완주했습니다'
            },
            {
              name: '완벽한 출석',
              earnedAt: new Date('2024-01-15'),
              description: '한 달간 완벽한 출석률을 달성했습니다'
            }
          ],
          totalClasses: 15,
          attendanceRate: 100,
          lastClassDate: new Date('2024-01-19')
        }
      ];
      setStudents(tempStudents);
    } catch (error) {
      console.error('학생 진도 로드 실패:', error);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">학생 진도를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">학생 진도 관리</h1>
          <p className="text-gray-600">학생들의 학습 진도와 성취를 추적하고 관리하세요</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 학생</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}명</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 출석률</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length)
                    : 0
                  }%
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 수업 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {students.reduce((sum, s) => sum + s.totalClasses, 0)}회
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
                  {students.reduce((sum, s) => sum + s.achievements.length, 0)}개
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 학생 목록 */}
        <div className="space-y-6">
          {students.map((student) => (
            <div key={student._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 mr-3">{student.studentName}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(student.level)}`}>
                      {getLevelLabel(student.level)}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{student.courseName}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>시작일: {student.startDate.toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>총 수업: {student.totalClasses}회</span>
                    <span className="mx-2">•</span>
                    <span className={getAttendanceColor(student.attendanceRate)}>
                      출석률: {student.attendanceRate}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 현재 기술 수준 */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">현재 기술 수준</h4>
                  <div className="space-y-3">
                    {student.currentSkills.map((skill, index) => (
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
                    {student.achievements.map((achievement, index) => (
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
                    {student.achievements.length === 0 && (
                      <p className="text-gray-500 text-sm">아직 획득한 성취가 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 최근 활동 */}
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-lg font-medium text-gray-900 mb-3">최근 활동</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-blue-50 rounded">
                    <div className="text-sm font-medium text-gray-900">마지막 수업</div>
                    <div className="text-sm text-gray-600">
                      {student.lastClassDate 
                        ? student.lastClassDate.toLocaleDateString()
                        : '수업 기록 없음'
                      }
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <div className="text-sm font-medium text-gray-900">평균 기술 수준</div>
                    <div className="text-sm text-gray-600">
                      {student.currentSkills.length > 0 
                        ? (student.currentSkills.reduce((sum, s) => sum + s.level, 0) / student.currentSkills.length).toFixed(1)
                        : '0'
                      }/5
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <div className="text-sm font-medium text-gray-900">학습 기간</div>
                    <div className="text-sm text-gray-600">
                      {Math.ceil((new Date().getTime() - student.startDate.getTime()) / (1000 * 60 * 60 * 24))}일
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {students.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">학생 진도 데이터가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(StudentProgressManagement, { 
  requireTypes: ['instructor'] 
});