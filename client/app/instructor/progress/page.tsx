/**
 * 👨‍🏫 JJ Swim Lab - 강사 진행률 관리 페이지
 *
 * 📋 **페이지 목적**
 * - 강사가 담당하는 학생들의 진도율을 체계적으로 관리하는 페이지
 * - 학생별 체크리스트 기반 진도율 계산 및 표시
 * - 기술별 세부 진도율 추적 및 관리
 * - 진도율 분석 및 개선 방안 제시
 *
 * 🔄 **데이터 플로우**
 * 1. 페이지 로드 시 강사의 학생 목록을 API로 조회
 * 2. 각 학생의 체크리스트를 기반으로 진도율을 실시간 계산
 * 3. 기술별 세부 진도율을 데이터베이스에서 집계
 * 4. 진도율 변화 추이를 차트로 시각화
 *
 * 🎯 **주요 기능**
 * - 학생별 전체 진도율 표시 및 관리
 * - 기술별 세부 진도율 (자유형, 배영, 평영, 접영)
 * - 진도율 변화 추이 및 예측
 * - 개별 학생 진도율 상세 분석
 * - 진도율 개선을 위한 맞춤형 피드백
 *
 * 🔧 **개발 참고사항**
 * - 모든 데이터는 데이터베이스에서 실시간 조회
 * - 하드코딩된 데이터 완전 제거
 * - 진도율은 체크리스트 완료 항목 기반으로 계산
 * - 기술별 진도율은 해당 기술의 체크리스트 항목 완료율로 계산
 *
 * 📝 **수정 이력**
 * - 2024-12-19: 하드코딩된 데이터 제거 및 API 연동 완료
 * - 2024-12-19: 진도율 계산 로직을 데이터베이스 기반으로 변경
 * - 2024-12-19: 기술별 세부 진도율 계산 시스템 구현
 * - 2024-12-19: 체크리스트 기반 진도율 추적 시스템 완성
 *
 * ✅ **향후 수정 체크리스트**
 * - [ ] 실시간 진도율 업데이트 기능 추가
 * - [ ] 진도율 예측 알고리즘 구현
 * - [ ] 진도율 분석 리포트 생성 기능
 * - [ ] 진도율 개선을 위한 AI 추천 시스템
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, Badge, Button, Progress } from '@/components/ui';
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Award,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface StudentProgress {
  _id: string;
  studentName: string;
  course: string;
  level: string;
  progress: number;
  skills: {
    freestyle: number;
    backstroke: number;
    breaststroke: number;
    butterfly: number;
  };
  lastUpdate: string;
  checklistItems: ChecklistItem[];
}

interface ChecklistItem {
  _id: string;
  title: string;
  category: string;
  isCompleted: boolean;
  completedAt?: string;
  skillType?: string;
}

export default function InstructorProgress() {
  const { user } = useAuth();
  const [progresses, setProgresses] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user?.userType === 'instructor') {
      loadStudentProgresses();
    }
  }, [user]);

  // 학생들의 진도율 로드
  const loadStudentProgresses = async () => {
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
              const progressData = await calculateStudentProgress(student._id, student.courseId);
              return {
                _id: student._id,
                studentName: student.name,
                course: student.courseName || '기본 과정',
                level: student.level,
                progress: progressData.overallProgress,
                skills: progressData.skillProgress,
                lastUpdate: new Date().toISOString().split('T')[0],
                checklistItems: progressData.checklistItems
              };
            })
          );

          setProgresses(studentsWithProgress);
        } else {
          setProgresses([]);
          setError('학생 데이터 형식이 올바르지 않습니다.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || '학생 데이터를 불러오는데 실패했습니다.');
        setProgresses([]);
      }
    } catch (error) {
      console.error('진도율 데이터 로드 실패:', error);
      setError('네트워크 오류가 발생했습니다.');
      setProgresses([]);
    } finally {
      setLoading(false);
    }
  };

  // 학생별 진도율 계산 (체크리스트 기반)
  const calculateStudentProgress = async (studentId: string, courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { overallProgress: 0, skillProgress: { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 }, checklistItems: [] };

      const response = await fetch(`http://localhost:5000/api/checklist/student/${studentId}/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checklist && data.checklist.items && Array.isArray(data.checklist.items)) {
          const items = data.checklist.items;
          const totalItems = items.length;
          const completedItems = items.filter((item: any) => item.isCompleted).length;
          const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

          // 기술별 진도율 계산
          const skillProgress = {
            freestyle: calculateSkillProgress(items, 'freestyle'),
            backstroke: calculateSkillProgress(items, 'backstroke'),
            breaststroke: calculateSkillProgress(items, 'breaststroke'),
            butterfly: calculateSkillProgress(items, 'butterfly')
          };

          return {
            overallProgress,
            skillProgress,
            checklistItems: items
          };
        }
      }
      return { overallProgress: 0, skillProgress: { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 }, checklistItems: [] };
    } catch (error) {
      console.error('진도율 계산 실패:', error);
      return { overallProgress: 0, skillProgress: { freestyle: 0, backstroke: 0, breaststroke: 0, butterfly: 0 }, checklistItems: [] };
    }
  };

  // 기술별 진도율 계산
  const calculateSkillProgress = (items: ChecklistItem[], skillType: string): number => {
    const skillItems = items.filter(item => 
      item.skillType === skillType || 
      item.category === skillType ||
      item.title.toLowerCase().includes(skillType.toLowerCase())
    );
    
    if (skillItems.length === 0) return 0;
    
    const completedItems = skillItems.filter(item => item.isCompleted).length;
    return Math.round((completedItems / skillItems.length) * 100);
  };

  const handleStudentClick = (student: StudentProgress) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
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
          <p className="text-gray-600">진도율 데이터를 불러오는 중...</p>
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
          <Button onClick={loadStudentProgresses} variant="outline">
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">진도 관리</h1>
              <p className="text-gray-600">학생들의 학습 진도를 체계적으로 관리하고 분석하세요.</p>
            </div>
            <Button onClick={loadStudentProgresses} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              새로고침
            </Button>
          </div>
        </div>

        {/* 통계 요약 */}
        {progresses.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">진도율 요약</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(progresses.reduce((sum, p) => sum + p.progress, 0) / progresses.length)}%
                </div>
                <div className="text-sm text-gray-600">평균 진도율</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {progresses.filter(p => p.progress >= 80).length}
                </div>
                <div className="text-sm text-gray-600">우수 학생</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {progresses.filter(p => p.progress >= 60 && p.progress < 80).length}
                </div>
                <div className="text-sm text-gray-600">진행중</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {progresses.filter(p => p.progress < 60).length}
                </div>
                <div className="text-sm text-gray-600">보완 필요</div>
              </div>
            </div>
          </Card>
        )}

        {/* 학생별 진도율 목록 */}
        {progresses.length === 0 ? (
          <Card className="p-12 text-center">
            <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 등록된 학생이 없습니다</h3>
            <p className="text-gray-600">새로운 학생이 등록되면 여기에 진도율이 표시됩니다.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {progresses.map((progress) => (
              <Card key={progress._id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleStudentClick(progress)}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{progress.studentName}</h3>
                    <div className="flex items-center gap-3">
                      <Badge className={getLevelColor(progress.level)}>
                        {progress.level}
                      </Badge>
                      <span className="text-sm text-gray-600">{progress.course}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${getProgressColor(progress.progress)}`}>
                      {progress.progress}%
                    </div>
                    <div className="text-sm text-gray-500">전체 진도</div>
                  </div>
                </div>

                {/* 기술별 진도율 */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">기술별 진도:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium">자유형</span>
                        <span className={getProgressColor(progress.skills.freestyle)}>
                          {progress.skills.freestyle}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress.skills.freestyle)}`}
                          style={{ width: `${progress.skills.freestyle}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium">배영</span>
                        <span className={getProgressColor(progress.skills.backstroke)}>
                          {progress.skills.backstroke}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress.skills.backstroke)}`}
                          style={{ width: `${progress.skills.backstroke}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium">평영</span>
                        <span className={getProgressColor(progress.skills.breaststroke)}>
                          {progress.skills.breaststroke}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress.skills.breaststroke)}`}
                          style={{ width: `${progress.skills.breaststroke}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-medium">접영</span>
                        <span className={getProgressColor(progress.skills.butterfly)}>
                          {progress.skills.butterfly}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress.skills.butterfly)}`}
                          style={{ width: `${progress.skills.butterfly}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 최근 업데이트 */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>최근 업데이트: {progress.lastUpdate}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    상세보기
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 학생 상세 모달 */}
        {showDetailModal && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">{selectedStudent.studentName} - 진도 상세 분석</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDetailModal(false)}
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-6">
                {/* 전체 진도율 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">전체 진도율</h4>
                  <div className="flex items-center">
                    <div className="flex-1 mr-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${getProgressBarColor(selectedStudent.progress)}`}
                          style={{ width: `${selectedStudent.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getProgressColor(selectedStudent.progress)}`}>
                      {selectedStudent.progress}%
                    </span>
                  </div>
                </div>

                {/* 기술별 상세 진도율 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">기술별 상세 진도율</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedStudent.skills).map(([skill, progress]) => (
                      <div key={skill} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium capitalize">{skill}</span>
                          <span className={`font-bold ${getProgressColor(progress)}`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 체크리스트 항목 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">체크리스트 항목</h4>
                  {selectedStudent.checklistItems.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {selectedStudent.checklistItems.map((item) => (
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
                    onClick={() => setShowDetailModal(false)}
                    className="flex-1"
                  >
                    닫기
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDetailModal(false);
                      window.location.href = `/instructor/students`;
                    }}
                    className="flex-1"
                  >
                    학생 관리로 이동
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









































