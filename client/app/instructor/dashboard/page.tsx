/**
 * 👨‍🏫 JJ Swim Lab - 강사 대시보드 페이지
 *
 * 📋 **페이지 목적**
 * - 강사가 자신의 학생들과 강습 현황을 한눈에 파악할 수 있는 대시보드
 * - 학생별 체크리스트 및 진도 관리
 * - 강습 통계 및 성과 분석
 *
 * 🔄 **데이터 플로우**
 * 1. 페이지 로드 시 강사의 학생 목록을 API로 조회
 * 2. 각 학생의 체크리스트와 진도율을 실시간으로 계산
 * 3. 강습 통계를 데이터베이스에서 집계하여 표시
 *
 * 🎯 **주요 기능**
 * - 학생 목록 표시 (진도율, 출석률, 최근 강습 정보)
 * - 학생별 체크리스트 상세 보기
 * - 진도 관리 버튼 (학생별 상세 페이지로 이동)
 * - 강습 통계 및 성과 지표
 *
 * 🔧 **개발 참고사항**
 * - 모든 데이터는 데이터베이스에서 실시간 조회
 * - 하드코딩된 데이터 완전 제거
 * - API 실패 시 적절한 에러 처리 및 사용자 안내
 *
 * 📝 **수정 이력**
 * - 2024-12-19: 하드코딩된 데이터 제거 및 API 연동 완료
 * - 2024-12-19: 진도율 계산 로직을 데이터베이스 기반으로 변경
 * - 2024-12-19: 체크리스트 데이터 연동 완료
 *
 * ✅ **향후 수정 체크리스트**
 * - [ ] 실시간 데이터 업데이트 기능 추가
 * - [ ] 진도율 예측 알고리즘 구현
 * - [ ] 성과 분석 차트 고도화
 * - [ ] 알림 시스템 연동
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, Badge, Button, Progress } from '@/components/ui';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Target,
  Award,
  BookOpen
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  level: string;
  progress: number;
  lastLesson: string;
  nextLesson: string;
  attendance: number;
  totalLessons: number;
  courseId: string;
  courseName: string;
}

interface ChecklistItem {
  _id: string;
  title: string;
  description: string;
  stepOrder: number;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

interface ChecklistData {
  _id: string;
  studentId: string;
  courseId: string;
  items: ChecklistItem[];
  overallProgress: number;
  targetCompletionDate?: string;
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [checklistData, setChecklistData] = useState<ChecklistItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 통계 데이터 상태
  const [totalStudents, setTotalStudents] = useState(0);
  const [averageProgress, setAverageProgress] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);

  useEffect(() => {
    if (user?.userType === 'instructor') {
      loadStudents();
    }
  }, [user]);

  // 강사의 학생 목록 로드
  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('인증 토큰이 없습니다.');
        return;
      }

      // 강사의 학생 목록 조회 API 호출
      const response = await fetch('http://localhost:5000/api/instructor/students', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.students && Array.isArray(data.students)) {
          // 각 학생의 진도율을 체크리스트 기반으로 계산
          const studentsWithProgress = await Promise.all(
            data.students.map(async (student: any) => {
              const progress = await calculateStudentProgress(student._id, student.courseId);
              return {
                ...student,
                progress: progress
              };
            })
          );

          setStudents(studentsWithProgress);
          
          // 통계 데이터 계산
          const total = studentsWithProgress.length;
          const avgProgress = total > 0 
            ? Math.round(studentsWithProgress.reduce((sum, s) => sum + s.progress, 0) / total)
            : 0;
          
          setTotalStudents(total);
          setAverageProgress(avgProgress);
          
          // 강습 통계 계산
          const totalLessonsCount = studentsWithProgress.reduce((sum, s) => sum + s.totalLessons, 0);
          const completedLessonsCount = studentsWithProgress.reduce((sum, s) => sum + s.attendance, 0);
          
          setTotalLessons(totalLessonsCount);
          setCompletedLessons(completedLessonsCount);
        } else {
          setStudents([]);
          setError('학생 데이터 형식이 올바르지 않습니다.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || '학생 데이터를 불러오는데 실패했습니다.');
        setStudents([]);
      }
    } catch (error) {
      console.error('학생 데이터 로드 실패:', error);
      setError('네트워크 오류가 발생했습니다.');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // 학생별 진도율 계산 (체크리스트 기반)
  const calculateStudentProgress = async (studentId: string, courseId: string): Promise<number> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 0;

      const response = await fetch(`http://localhost:5000/api/checklist/student/${studentId}/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checklist && data.checklist.items && Array.isArray(data.checklist.items)) {
          const totalItems = data.checklist.items.length;
          const completedItems = data.checklist.items.filter((item: any) => item.isCompleted).length;
          return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        }
      }
      return 0;
    } catch (error) {
      console.error('진도율 계산 실패:', error);
      return 0;
    }
  };

  // 학생 체크리스트 로드
  const loadStudentChecklist = async (studentId: string, courseId?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      let url = `http://localhost:5000/api/checklist/student/${studentId}`;
      if (courseId) {
        url += `/course/${courseId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checklist && data.checklist.items) {
          const sortedItems = data.checklist.items.sort((a: any, b: any) => a.stepOrder - b.stepOrder);
          setChecklistData(sortedItems);
        } else {
          setChecklistData([]);
        }
      } else {
        setChecklistData([]);
      }
    } catch (error) {
      console.error('체크리스트 로드 실패:', error);
      setChecklistData([]);
    }
  };

  const handleStudentClick = async (student: Student) => {
    setSelectedStudent(student);
    await loadStudentChecklist(student._id, student.courseId);
    setShowProgressModal(true);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case '초급': return 'bg-blue-100 text-blue-800';
      case '중급': return 'bg-green-100 text-green-800';
      case '고급': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (user?.userType !== 'instructor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600">강사 계정으로 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadStudents} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">강사 대시보드</h1>
          <p className="text-gray-600">안녕하세요, {user?.name}님! 오늘의 강습 현황을 확인해보세요.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">전체 학생</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}명</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">평균 진도율</p>
                <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">총 강습 수</p>
                <p className="text-2xl font-bold text-gray-900">{totalLessons}회</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">완료된 강습</p>
                <p className="text-2xl font-bold text-gray-900">{completedLessons}회</p>
              </div>
            </div>
          </Card>
        </div>

        {/* 학생 목록 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">내 학생들</h2>
            <Button onClick={() => window.location.href = '/instructor/students'}>
              전체 학생 보기
            </Button>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">아직 등록된 학생이 없습니다</h3>
              <p className="text-gray-600">새로운 학생이 등록되면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <Card key={student._id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStudentClick(student)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>
                    <Badge className={getLevelColor(student.level)}>
                      {student.level}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">진도율</span>
                        <span className={`font-semibold ${getProgressColor(student.progress)}`}>
                          {student.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(student.progress)}`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">출석률:</span>
                        <span className="ml-1 font-medium">{student.attendance}/{student.totalLessons}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">코스:</span>
                        <span className="ml-1 font-medium">{student.courseName}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full"
                                                 onClick={() => {
                           window.location.href = `/instructor/progress/${student._id}`;
                         }}
                      >
                        진도관리
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* 진도 모달 */}
        {showProgressModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{selectedStudent.name} - 진도 상세</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowProgressModal(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">전체 진도율</p>
                    <p className="font-medium">{selectedStudent.progress}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">코스</p>
                    <p className="font-medium">{selectedStudent.courseName}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">체크리스트 항목</h4>
                  {checklistData.length > 0 ? (
                    <div className="space-y-2">
                      {checklistData.map((item) => (
                        <div key={item._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{item.title}</span>
                          <Badge variant={item.isCompleted ? "default" : "secondary"}>
                            {item.isCompleted ? "완료" : "진행중"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">체크리스트 항목이 없습니다.</p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowProgressModal(false)}
                    className="flex-1"
                  >
                    닫기
                  </Button>
                  <Button
                    onClick={() => {
                      setShowProgressModal(false);
                      window.location.href = `/instructor/progress/${selectedStudent._id}`;
                    }}
                    className="flex-1"
                  >
                    진도 관리
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


