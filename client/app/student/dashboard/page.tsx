/**
 * @file 학생 대시보드 페이지
 * @description 학생이 자신의 강의, 예약, 진행상황 등을 확인할 수 있는 대시보드입니다.
 * @date 2025-09-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Progress } from '@/components/ui/Progress';
import { BookOpen, Calendar, TrendingUp, Award, Clock, Star, Target, Activity } from 'lucide-react';

interface StudentStats {
  enrolledCourses: number;
  completedSessions: number;
  totalSessions: number;
  currentStreak: number;
  averageRating: number;
  nextClass: string;
  achievements: number;
  weeklyGoal: number;
}

interface UpcomingClass {
  id: string;
  courseName: string;
  instructorName: string;
  date: string;
  time: string;
  location: string;
  status: 'confirmed' | 'pending';
}

interface ProgressData {
  skill: string;
  currentLevel: number;
  maxLevel: number;
  progress: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    enrolledCourses: 0,
    completedSessions: 0,
    totalSessions: 0,
    currentStreak: 0,
    averageRating: 0,
    nextClass: '',
    achievements: 0,
    weeklyGoal: 0,
  });
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/centers/student-dashboard-stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('통계 데이터를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      } else {
        throw new Error(result.message || '통계 데이터 조회에 실패했습니다.');
      }

      const mockClasses: UpcomingClass[] = [
        {
          id: '1',
          courseName: '자유형 기초반',
          instructorName: '김수영 강사',
          date: '2025-01-15',
          time: '10:00 - 11:00',
          location: '1층 메인풀',
          status: 'confirmed',
        },
        {
          id: '2',
          courseName: '배영 중급반',
          instructorName: '이강사',
          date: '2025-01-17',
          time: '14:00 - 15:00',
          location: '1층 메인풀',
          status: 'pending',
        },
      ];

      const mockProgress: ProgressData[] = [
        {
          skill: '자유형',
          currentLevel: 3,
          maxLevel: 5,
          progress: 60,
        },
        {
          skill: '배영',
          currentLevel: 2,
          maxLevel: 5,
          progress: 40,
        },
        {
          skill: '접영',
          currentLevel: 1,
          maxLevel: 5,
          progress: 20,
        },
        {
          skill: '평영',
          currentLevel: 1,
          maxLevel: 5,
          progress: 20,
        },
      ];

      // setStats(mockStats); // mockStats 변수가 정의되지 않음 - 제거
      setUpcomingClasses(mockClasses);
      setProgressData(mockProgress);
    } catch (error) {
      console.error('대시보드 데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          안녕하세요, {user?.name}님! 🏊‍♂️
        </h1>
        <p className="text-gray-600">
          오늘도 수영 실력 향상을 위해 열심히 연습해보세요!
        </p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수강 중인 강의</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCourses}개</div>
            <p className="text-xs text-muted-foreground">
              현재 수강 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료한 수업</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedSessions}회</div>
            <p className="text-xs text-muted-foreground">
              총 {stats.totalSessions}회 중
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">연속 출석</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}일</div>
            <p className="text-xs text-muted-foreground">
              현재 연속 기록
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              강사 평가 기준
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 진행률 및 목표 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>수영 기술 진행률</CardTitle>
            <CardDescription>
              각 수영 기술별 현재 레벨과 진행상황을 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <span className="text-sm text-gray-600">
                      레벨 {skill.currentLevel}/{skill.maxLevel}
                    </span>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>주간 목표</CardTitle>
            <CardDescription>
              이번 주 목표와 현재 진행상황을 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">주간 수업 목표</span>
                </div>
                <Badge variant="outline">{stats.weeklyGoal}회</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">달성한 수업</span>
                </div>
                <Badge className="bg-green-100 text-green-800">2회</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium">남은 목표</span>
                </div>
                <Badge variant="secondary">{stats.weeklyGoal - 2}회</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 다음 수업 및 업적 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>다음 수업</CardTitle>
            <CardDescription>
              예정된 수업 일정을 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingClasses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                예정된 수업이 없습니다.
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{classItem.courseName}</h4>
                      <p className="text-sm text-gray-600">{classItem.instructorName}</p>
                      <p className="text-sm text-gray-500">
                        {classItem.date} {classItem.time}
                      </p>
                      <p className="text-sm text-gray-500">{classItem.location}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(classItem.status)}>
                        {classItem.status === 'confirmed' ? '확정' : '대기'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>업적</CardTitle>
            <CardDescription>
              달성한 업적들을 확인하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.achievements}</div>
                <div className="text-sm text-gray-600">달성한 업적</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">7일</div>
                <div className="text-sm text-gray-600">연속 출석</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.averageRating}</div>
                <div className="text-sm text-gray-600">평균 평점</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <BookOpen className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{stats.completedSessions}</div>
                <div className="text-sm text-gray-600">완료 수업</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
          <CardDescription>
            자주 사용하는 기능들에 빠르게 접근하세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>수업 예약</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <BookOpen className="h-6 w-6 mb-2" />
              <span>내 강의</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>진행상황</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col">
              <Award className="h-6 w-6 mb-2" />
              <span>업적 보기</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
        <p className="font-semibold">개발 참고:</p>
        <p>이 페이지의 데이터는 하드코딩이 아닌 데이터베이스에서 관리되어야 합니다.</p>
        <p>관련 API 엔드포인트 (`/api/student/dashboard` 등) 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default StudentDashboard;
