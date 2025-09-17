/**
 * @file 강사용 수업 계획 페이지
 * @description 강사가 강습법을 기반으로 수업 계획을 세우고 학생들을 관리할 수 있는 페이지
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import { Progress } from '../../../components/ui/Progress';

// 강습법 카테고리 상수
const TEACHING_METHOD_CATEGORIES = [
  '자유형',
  '배영',
  '평영',
  '접영',
  '혼영',
  '기초기술',
  '호흡법',
  '발차기',
  '손짓',
  '턴',
  '스타트',
  '안전수칙',
  '체력향상',
  '기타'
] as const;

// 강습법 레벨 상수
const TEACHING_METHOD_LEVELS = [
  { value: 'beginner', label: '초급', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: '중급', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: '고급', color: 'bg-red-100 text-red-800' }
] as const;

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  steps: string[];
  tips: string[];
  videoUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolledCourses: string[];
  progress: {
    teachingMethodId: string;
    completedSteps: number[];
    totalSteps: number;
    progress: number;
  }[];
}

interface LessonPlan {
  _id: string;
  title: string;
  description: string;
  teachingMethods: string[];
  students: string[];
  duration: number; // 분
  date: string;
  time: string;
  location: string;
  objectives: string[];
  materials: string[];
  notes: string;
  status: 'draft' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface InstructorData {
  teachingMethods: TeachingMethod[];
  students: Student[];
  lessonPlans: LessonPlan[];
  stats: {
    totalStudents: number;
    activeStudents: number;
    totalLessons: number;
    completedLessons: number;
    averageStudentProgress: number;
  };
}

export default function LessonPlannerPage() {
  const { user } = useAuth();
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'methods' | 'students' | 'plans'>('methods');
  const [isCreatePlanModalOpen, setIsCreatePlanModalOpen] = useState(false);
  const [isStudentDetailModalOpen, setIsStudentDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<LessonPlan>>({
    title: '',
    description: '',
    teachingMethods: [],
    students: [],
    duration: 60,
    date: '',
    time: '',
    location: '',
    objectives: [],
    materials: [],
    notes: '',
    status: 'draft'
  });

  useEffect(() => {
    if (user?.userType === 'instructor' || user?.userType === 'centerAdmin') {
      fetchInstructorData();
    }
  }, [user]);

  const fetchInstructorData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('❌ JWT 토큰이 없습니다.');
        return;
      }

      // 강습법 데이터 가져오기
      const methodsResponse = await fetch('http://localhost:5000/api/teaching-methods', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (methodsResponse.ok) {
        const methodsData = await methodsResponse.json();
        const methods = methodsData.data || methodsData;
        
        // 학생 데이터 가져오기 (임시로 로컬 스토리지 사용)
        const studentsData = JSON.parse(localStorage.getItem('studentsData') || '[]');
        
        // 수업 계획 데이터 가져오기 (임시로 로컬 스토리지 사용)
        const lessonPlansData = JSON.parse(localStorage.getItem('lessonPlans') || '[]');
        
        // 통계 계산
        const stats = calculateStats(methods, studentsData, lessonPlansData);
        
        setInstructorData({
          teachingMethods: methods,
          students: studentsData,
          lessonPlans: lessonPlansData,
          stats
        });
      } else {
        console.error('❌ 강습법 조회 실패:', methodsResponse.status);
      }
    } catch (error) {
      console.error('❌ 강사 데이터 조회 중 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (methods: TeachingMethod[], students: Student[], plans: LessonPlan[]) => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.enrolledCourses.length > 0).length;
    const totalLessons = plans.length;
    const completedLessons = plans.filter(p => p.status === 'completed').length;
    
    let totalProgress = 0;
    students.forEach(student => {
      const studentProgress = student.progress.reduce((sum, p) => sum + p.progress, 0);
      totalProgress += studentProgress / student.progress.length;
    });
    const averageStudentProgress = totalStudents > 0 ? totalProgress / totalStudents : 0;

    return {
      totalStudents,
      activeStudents,
      totalLessons,
      completedLessons,
      averageStudentProgress
    };
  };

  const createLessonPlan = () => {
    if (!instructorData || !newPlan.title || !newPlan.date || !newPlan.time) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    const plan: LessonPlan = {
      _id: Date.now().toString(),
      title: newPlan.title!,
      description: newPlan.description || '',
      teachingMethods: newPlan.teachingMethods || [],
      students: newPlan.students || [],
      duration: newPlan.duration || 60,
      date: newPlan.date!,
      time: newPlan.time!,
      location: newPlan.location || '',
      objectives: newPlan.objectives || [],
      materials: newPlan.materials || [],
      notes: newPlan.notes || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedPlans = [...instructorData.lessonPlans, plan];
    const updatedData = {
      ...instructorData,
      lessonPlans: updatedPlans,
      stats: calculateStats(instructorData.teachingMethods, instructorData.students, updatedPlans)
    };

    setInstructorData(updatedData);
    localStorage.setItem('lessonPlans', JSON.stringify(updatedPlans));
    
    // 폼 초기화
    setNewPlan({
      title: '',
      description: '',
      teachingMethods: [],
      students: [],
      duration: 60,
      date: '',
      time: '',
      location: '',
      objectives: [],
      materials: [],
      notes: '',
      status: 'draft'
    });
    setIsCreatePlanModalOpen(false);
  };

  const getStudentProgress = (studentId: string) => {
    const student = instructorData?.students.find(s => s._id === studentId);
    if (!student || student.progress.length === 0) return 0;
    
    const totalProgress = student.progress.reduce((sum, p) => sum + p.progress, 0);
    return totalProgress / student.progress.length;
  };

  if (!user || (user.userType !== 'instructor' && user.userType !== 'centerAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
          <p className="text-gray-600">강사 또는 센터 관리자만 이 페이지에 접근할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">강사 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            📋 수업 계획 관리
          </h1>
          <p className="mt-2 text-gray-600">
            강습법을 활용하여 체계적인 수업 계획을 세우고 학생들을 관리하세요.
          </p>
        </div>

        {/* 통계 섹션 */}
        {instructorData && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">총 학생</p>
                    <p className="text-2xl font-bold text-blue-900">{instructorData.stats.totalStudents}명</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">활성 학생</p>
                    <p className="text-2xl font-bold text-green-900">{instructorData.stats.activeStudents}명</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">총 수업</p>
                    <p className="text-2xl font-bold text-purple-900">{instructorData.stats.totalLessons}개</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-600">완료 수업</p>
                    <p className="text-2xl font-bold text-yellow-900">{instructorData.stats.completedLessons}개</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-500 rounded-full">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-orange-600">평균 진도</p>
                    <p className="text-2xl font-bold text-orange-900">{instructorData.stats.averageStudentProgress.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 탭 네비게이션 */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('methods')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'methods'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📚 강습법 관리
              </button>
              <button
                onClick={() => setSelectedTab('students')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'students'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 학생 관리
              </button>
              <button
                onClick={() => setSelectedTab('plans')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === 'plans'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📋 수업 계획
              </button>
            </nav>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        {selectedTab === 'methods' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">강습법 목록</h2>
              <Button
                onClick={() => window.open('/admin/teaching-methods', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                강습법 관리
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorData?.teachingMethods.map((method) => (
                <Card key={method._id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                      <div className="flex gap-2">
                        <Badge className={TEACHING_METHOD_LEVELS.find(l => l.value === method.level)?.color || 'bg-gray-100 text-gray-800'}>
                          {TEACHING_METHOD_LEVELS.find(l => l.value === method.level)?.label}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800">
                          📂 {method.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {method.description}
                    </p>

                    <div className="text-sm text-gray-500 mb-4">
                      {method.steps.length}개 단계
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => window.open(`/admin/teaching-methods?method=${method._id}`, '_blank')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        📖 상세보기
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'students' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">학생 목록</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorData?.students.map((student) => (
                <Card key={student._id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                      <Badge className={TEACHING_METHOD_LEVELS.find(l => l.value === student.level)?.color || 'bg-gray-100 text-gray-800'}>
                        {TEACHING_METHOD_LEVELS.find(l => l.value === student.level)?.label}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{student.email}</p>

                    {/* 학생 진도 */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">학습 진도</span>
                        <span className="text-sm text-gray-500">{getStudentProgress(student._id).toFixed(1)}%</span>
                      </div>
                      <Progress value={getStudentProgress(student._id)} className="h-2" />
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      수강 코스: {student.enrolledCourses.length}개
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedStudent(student);
                          setIsStudentDetailModalOpen(true);
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      >
                        📊 진도보기
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {selectedTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">수업 계획</h2>
              <Button
                onClick={() => setIsCreatePlanModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                📝 새 수업 계획
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructorData?.lessonPlans.map((plan) => (
                <Card key={plan._id} className="hover:shadow-lg transition-shadow duration-200">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{plan.title}</h3>
                      <Badge className={
                        plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        plan.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        plan.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {plan.status === 'completed' ? '완료' :
                         plan.status === 'scheduled' ? '예정' :
                         plan.status === 'cancelled' ? '취소' : '초안'}
                      </Badge>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {plan.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div>📅 {plan.date} {plan.time}</div>
                      <div>⏱️ {plan.duration}분</div>
                      <div>📍 {plan.location}</div>
                      <div>👥 {plan.students.length}명</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          // 수업 계획 상세보기 로직
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        📖 상세보기
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 수업 계획 생성 모달 */}
        {isCreatePlanModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">새 수업 계획</h3>
                  <button
                    onClick={() => setIsCreatePlanModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">수업 제목 *</label>
                      <input
                        type="text"
                        value={newPlan.title || ''}
                        onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="수업 제목을 입력하세요"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">수업 시간 (분)</label>
                      <input
                        type="number"
                        value={newPlan.duration || 60}
                        onChange={(e) => setNewPlan({ ...newPlan, duration: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="30"
                        max="180"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">수업 설명</label>
                    <textarea
                      value={newPlan.description || ''}
                      onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="수업 설명을 입력하세요"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">수업 날짜 *</label>
                      <input
                        type="date"
                        value={newPlan.date || ''}
                        onChange={(e) => setNewPlan({ ...newPlan, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">수업 시간 *</label>
                      <input
                        type="time"
                        value={newPlan.time || ''}
                        onChange={(e) => setNewPlan({ ...newPlan, time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">수업 장소</label>
                    <input
                      type="text"
                      value={newPlan.location || ''}
                      onChange={(e) => setNewPlan({ ...newPlan, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="수업 장소를 입력하세요"
                    />
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => setIsCreatePlanModalOpen(false)}
                      variant="outline"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={createLessonPlan}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      생성
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 학생 상세보기 모달 */}
        {isStudentDetailModalOpen && selectedStudent && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">{selectedStudent.name} 학생 상세</h3>
                  <button
                    onClick={() => {
                      setIsStudentDetailModalOpen(false);
                      setSelectedStudent(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">이름</h4>
                      <p className="text-gray-600">{selectedStudent.name}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">레벨</h4>
                      <p className="text-gray-600">{TEACHING_METHOD_LEVELS.find(l => l.value === selectedStudent.level)?.label}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">이메일</h4>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">수강 코스</h4>
                    <p className="text-gray-600">{selectedStudent.enrolledCourses.length}개</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">학습 진도</h4>
                    <div className="space-y-3">
                      {selectedStudent.progress.map((progress, index) => {
                        const method = instructorData?.teachingMethods.find(m => m._id === progress.teachingMethodId);
                        return (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">{method?.name || '알 수 없는 강습법'}</span>
                              <span className="text-sm text-gray-500">{progress.progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress.progress} className="h-2" />
                            <div className="text-xs text-gray-500 mt-1">
                              {progress.completedSteps.length} / {progress.totalSteps} 단계 완료
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      onClick={() => {
                        setIsStudentDetailModalOpen(false);
                        setSelectedStudent(null);
                      }}
                      variant="outline"
                    >
                      닫기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
