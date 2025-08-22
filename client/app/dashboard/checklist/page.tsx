'use client';

import { useState, useEffect } from 'react';
import withAuth from '../../../components/withAuth';

interface ChecklistItem {
  methodId: string;
  methodName: string;
  totalSteps: number;
  completedSteps: number;
  progressPercentage: number;
  isCompleted: boolean;
}

interface CourseProgress {
  courseId: string;
  courseName: string;
  level: string;
  instructor: any;
  enrolledAt: string;
  overallProgress: number;
  checklistProgress: ChecklistItem[];
}

interface TeachingMethod {
  _id: string;
  name: string;
  description: string;
  category: string;
  difficulty: string;
  steps: string[];
  tips: string[];
  order: number;
}

function MemberChecklistPage() {
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseProgress | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [teachingMethods, setTeachingMethods] = useState<TeachingMethod[]>([]);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      
      // 최고관리자의 강습목록 체크리스트 가져오기
      const response = await fetch('/api/teaching-methods', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeachingMethods(data.data || []);
        
        // 사용자의 진행 상황도 가져오기
        await loadUserProgress();
      } else {
        console.error('강습목록을 가져오는데 실패했습니다:', response.statusText);
        // 폴백: 기본 데이터 표시
        setTeachingMethods([]);
      }
    } catch (error) {
      console.error('체크리스트 로딩 오류:', error);
      setTeachingMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      // 학생의 체크리스트 진행상황 가져오기
      const checklistResponse = await fetch('/api/progress/my-checklist', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (checklistResponse.ok) {
        const checklistData = await checklistResponse.json();
        console.log('체크리스트 진행상황:', checklistData);
        
        // 체크리스트 데이터를 courseProgress 형식으로 변환
        if (checklistData.data && checklistData.data.length > 0) {
          const convertedProgress = checklistData.data.map((item: any) => ({
            courseId: item.course?._id || 'unknown',
            courseName: item.course?.name || '미정',
            level: item.level || '미정',
            instructor: { name: item.instructor?.name || '미정' },
            enrolledAt: new Date(item.createdAt).toLocaleDateString(),
            overallProgress: item.percentage || 0,
            checklistProgress: [{
              methodId: item._id,
              methodName: item.name || '체크리스트',
              totalSteps: item.totalSteps || 1,
              completedSteps: item.completedSteps || 0,
              progressPercentage: item.percentage || 0,
              isCompleted: item.percentage >= 100
            }]
          }));
          
          setCourseProgress(convertedProgress);
        }
      }
    } catch (error) {
      console.error('진행 상황 로딩 오류:', error);
    }
  };

  const handleCourseClick = (course: CourseProgress) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return '미정';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">체크리스트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">학습 체크리스트</h1>
          <p className="text-gray-600">수영 강습 과정의 진행 상황을 확인하고 관리하세요</p>
        </div>

        {/* 강습 과정 목록 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courseProgress.map((course) => (
            <div
              key={course.courseId}
              onClick={() => handleCourseClick(course)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {course.courseName}
                  </h3>
                  <p className="text-sm text-gray-500">{course.level}</p>
                </div>
                <span className="text-xs text-gray-400">{course.enrolledAt}</span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">전체 진행률</span>
                  <span className={`text-sm font-semibold ${getProgressColor(course.overallProgress)}`}>
                    {course.overallProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.overallProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                {course.checklistProgress.slice(0, 3).map((item) => (
                  <div key={item.methodId} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate">{item.methodName}</span>
                    <span className={`text-xs font-medium ${getProgressColor(item.progressPercentage)}`}>
                      {item.progressPercentage}%
                    </span>
                  </div>
                ))}
                {course.checklistProgress.length > 3 && (
                  <p className="text-xs text-gray-400 text-center">
                    +{course.checklistProgress.length - 3}개 더
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  강사: {course.instructor?.name || '미정'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 강습 방법 목록 */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">전체 강습 방법</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {teachingMethods.map((method) => (
              <div key={method._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(method.difficulty)}`}>
                    {getDifficultyText(method.difficulty)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{method.description}</p>
                
                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {method.category}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">단계:</span> {method.steps.length}개
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">순서:</span> {method.order}
                  </p>
                </div>

                {method.tips.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-2">팁:</p>
                    <ul className="space-y-1">
                      {method.tips.slice(0, 2).map((tip, index) => (
                        <li key={index} className="text-xs text-gray-600">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 상세 모달 */}
        {showDetailModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.courseName}</h2>
                    <p className="text-gray-600">{selectedCourse.level} • {selectedCourse.instructor?.name}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedCourse.checklistProgress.map((item) => (
                    <div key={item.methodId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-gray-900">{item.methodName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getProgressColor(item.progressPercentage)}`}>
                          {item.progressPercentage}%
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${item.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm text-gray-600">
                        <span>완료: {item.completedSteps}/{item.totalSteps}</span>
                        <span className={item.isCompleted ? 'text-green-600' : 'text-gray-500'}>
                          {item.isCompleted ? '완료' : '진행중'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">전체 진행률</span>
                    <span className={`text-2xl font-bold ${getProgressColor(selectedCourse.overallProgress)}`}>
                      {selectedCourse.overallProgress}%
                    </span>
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

export default withAuth(MemberChecklistPage);



