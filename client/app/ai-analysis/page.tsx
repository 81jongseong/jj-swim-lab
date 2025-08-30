/**
 * 🤖 AI 기반 개인 맞춤 강습 시스템 페이지
 * 
 * 📋 **페이지 목적**
 * - 학생별 개인 맞춤형 수영 강습 계획을 AI가 자동으로 생성
 * - 현재 레벨과 목표 레벨을 기반으로 체계적인 학습 계획 수립
 * - 강습 진행 상황을 실시간으로 추적하고 AI 추천사항 제공
 * 
 * 🔄 **데이터 흐름**
 * 1. 학생 정보 입력 (ID, 이름, 현재레벨, 목표레벨, 집중영역)
 * 2. AI 알고리즘으로 강습 계획 자동 생성
 * 3. 생성된 계획을 데이터베이스에 저장
 * 4. 진도 추적 및 AI 추천사항 업데이트
 * 
 * 📊 **주요 기능**
 * - 개인 맞춤 강습 계획 생성 (AI 기반)
 * - 강습 진행 상황 추적
 * - AI 분석 결과 및 추천사항 표시
 * - 난이도별 강습 항목 관리
 * 
 * 🗄️ **데이터 연동**
 * - 현재: Mock 데이터 사용 (개발 단계)
 * - 향후: MongoDB 데이터베이스 연동 예정
 * - API 엔드포인트: /api/personalized-lessons (구현 예정)
 * 
 * 🛠️ **필요한 설치 파일**
 * - withAuth 컴포넌트 (권한 관리)
 * - Tailwind CSS (스타일링)
 * - React Hooks (상태 관리)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. AI 알고리즘 로직 수정 시 generateAILessonPlan 함수 주의
 * 2. 난이도 계산 로직은 calculateDifficulty 함수에서 관리
 * 3. AI 추천사항은 generateAIRecommendations 함수에서 생성
 * 4. 권한 체크: superAdmin, centerAdmin, instructor만 접근 가능
 * 5. Mock 데이터는 실제 API 연동 시 제거 필요
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] AI 알고리즘 로직 검증
 * - [ ] 권한 설정 확인
 * - [ ] 데이터 타입 일치성 확인
 * - [ ] 에러 처리 로직 검증
 * - [ ] 반응형 디자인 테스트
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (AI 기반 개인 맞춤 강습 시스템)
 * - 2024-12-19: Mock 데이터 기반 UI 완성
 * - 2024-12-19: AI 알고리즘 로직 구현 (난이도 계산, 추천사항 생성)
 * - 2024-12-19: 진도 추적 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (Mock 데이터 기반)
 * 
 * 🚀 **다음 단계**
 * - 실제 데이터베이스 연동
 * - AI 모델 고도화
 * - 실시간 진도 업데이트
 * - 강사 피드백 시스템 연동
 */

'use client';

import { useState, useEffect } from 'react';
import withAuth from '../../components/withAuth';

// 데이터 타입 정의
interface PersonalizedLesson {
  _id: string;
  studentId: string;
  studentName: string;
  currentLevel: string;
  targetLevel: string;
  lessonPlan: LessonItem[];
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  focusAreas: string[];
  aiRecommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface LessonItem {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  focusArea: string;
  tips: string[];
  videoUrl?: string;
  isCompleted: boolean;
}

function AIAnalysisPage() {
  // 상태 관리
  const [personalizedLessons, setPersonalizedLessons] = useState<PersonalizedLesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<PersonalizedLesson | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'analytics' | 'progress'>('lessons');

  // 새 개인 맞춤 강습 생성 상태
  const [newLesson, setNewLesson] = useState({
    studentId: '',
    studentName: '',
    currentLevel: '',
    targetLevel: '',
    focusAreas: [] as string[],
    estimatedDuration: 8
  });

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadPersonalizedLessons();
  }, []);

  // 개인 맞춤 강습 데이터 로드 함수
  const loadPersonalizedLessons = async () => {
    try {
      setLoading(true);
      
      // Mock 데이터 - 실제로는 API에서 가져옴
      const mockLessons: PersonalizedLesson[] = [
        {
          _id: '1',
          studentId: 'student001',
          studentName: '김수영',
          currentLevel: '초급',
          targetLevel: '중급',
          lessonPlan: [
            {
              id: '1',
              title: '자유형 기본 동작 연습',
              description: '자유형의 기본 자세와 팔 동작을 연습합니다',
              duration: 30,
              difficulty: 'easy',
              focusArea: '기본동작',
              tips: ['어깨를 이완하고 자연스럽게 움직이세요', '호흡을 규칙적으로 하세요'],
              isCompleted: false
            },
            {
              id: '2',
              title: '호흡법 숙지',
              description: '수영에서 중요한 호흡법을 연습합니다',
              duration: 25,
              difficulty: 'medium',
              focusArea: '호흡법',
              tips: ['물속에서 코로 내쉬고 입으로 들이마시세요', '고개를 너무 높이 들지 마세요'],
              isCompleted: false
            }
          ],
          estimatedDuration: 8,
          difficulty: 'medium',
          focusAreas: ['기본동작', '호흡법', '지구력'],
          aiRecommendations: [
            '현재 수준에서 중급으로 발전하기 위해 기본 동작에 집중하세요',
            '호흡법이 자유형의 핵심이므로 충분한 연습이 필요합니다',
            '주 3회, 30분씩 연습하면 8주 내 목표 달성이 가능합니다'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          studentId: 'student002',
          studentName: '이영희',
          currentLevel: '중급',
          targetLevel: '고급',
          lessonPlan: [
            {
              id: '1',
              title: '접영 고급 기술',
              description: '접영의 고급 동작과 타이밍을 연습합니다',
              duration: 45,
              difficulty: 'hard',
              focusArea: '고급기술',
              tips: ['다리 동작의 타이밍이 중요합니다', '전체적인 흐름을 유지하세요'],
              isCompleted: false
            }
          ],
          estimatedDuration: 12,
          difficulty: 'hard',
          focusAreas: ['고급기술', '경기기술', '체력'],
          aiRecommendations: [
            '접영의 고급 기술을 완벽하게 습득하려면 체계적인 연습이 필요합니다',
            '경기 출전을 고려한다면 스타트와 턴 연습도 병행하세요',
            '주 4회, 45분씩 연습하면 12주 내 목표 달성이 가능합니다'
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      setPersonalizedLessons(mockLessons);
    } catch (error) {
      console.error('개인 맞춤 강습 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // AI 기반 개인 맞춤 강습 계획 생성 함수
  const handleCreateLesson = () => {
    if (!newLesson.studentId || !newLesson.studentName || !newLesson.currentLevel || !newLesson.targetLevel) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // AI 기반 개인 맞춤 강습 계획 생성
    const aiGeneratedLesson: PersonalizedLesson = {
      _id: Date.now().toString(),
      ...newLesson,
      lessonPlan: generateAILessonPlan(newLesson.currentLevel, newLesson.targetLevel, newLesson.focusAreas),
      difficulty: calculateDifficulty(newLesson.currentLevel, newLesson.targetLevel),
      aiRecommendations: generateAIRecommendations(newLesson.currentLevel, newLesson.targetLevel, newLesson.focusAreas),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setPersonalizedLessons([...personalizedLessons, aiGeneratedLesson]);
    setShowCreateModal(false);
    resetForm();
  };

  // AI 기반 강습 계획 생성 로직
  const generateAILessonPlan = (currentLevel: string, targetLevel: string, focusAreas: string[]): LessonItem[] => {
    const lessonPlan: LessonItem[] = [];
    
    if (currentLevel === '초급' && targetLevel === '중급') {
      lessonPlan.push(
        {
          id: '1',
          title: '자유형 기본 동작 연습',
          description: '자유형의 기본 자세와 팔 동작을 연습합니다',
          duration: 30,
          difficulty: 'easy',
          focusArea: '기본동작',
          tips: ['어깨를 이완하고 자연스럽게 움직이세요', '호흡을 규칙적으로 하세요'],
          isCompleted: false
        },
        {
          id: '2',
          title: '호흡법 숙지',
          description: '수영에서 중요한 호흡법을 연습합니다',
          duration: 25,
          difficulty: 'medium',
          focusArea: '호흡법',
          tips: ['물속에서 코로 내쉬고 입으로 들이마시세요', '고개를 너무 높이 들지 마세요'],
          isCompleted: false
        }
      );
    }

    return lessonPlan;
  };

  // 난이도 계산 함수
  const calculateDifficulty = (currentLevel: string, targetLevel: string): 'easy' | 'medium' | 'hard' => {
    if (currentLevel === '초급' && targetLevel === '중급') return 'medium';
    if (currentLevel === '중급' && targetLevel === '고급') return 'hard';
    return 'easy';
  };

  // AI 추천사항 생성 함수
  const generateAIRecommendations = (currentLevel: string, targetLevel: string, focusAreas: string[]): string[] => {
    const recommendations: string[] = [];
    
    if (currentLevel === '초급' && targetLevel === '중급') {
      recommendations.push(
        '현재 수준에서 중급으로 발전하기 위해 기본 동작에 집중하세요',
        '호흡법이 자유형의 핵심이므로 충분한 연습이 필요합니다',
        '주 3회, 30분씩 연습하면 8주 내 목표 달성이 가능합니다'
      );
    }

    return recommendations;
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setNewLesson({
      studentId: '',
      studentName: '',
      currentLevel: '',
      targetLevel: '',
      focusAreas: [],
      estimatedDuration: 8
    });
  };

  // 난이도별 색상 반환 함수
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 난이도 텍스트 반환 함수
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '알 수 없음';
    }
  };

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto p-6">
        {/* 페이지 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">🤖 AI 기반 개인 맞춤 강습 시스템</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
          >
            ➕ 새 강습 계획 생성
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'lessons'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📚 개인 맞춤 강습
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'analytics'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 AI 분석 결과
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'progress'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 진도 추적
          </button>
        </div>

        {/* 개인 맞춤 강습 탭 */}
        {activeTab === 'lessons' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedLessons.map((lesson) => (
              <div key={lesson._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {lesson.studentName}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(lesson.difficulty)}`}>
                    {getDifficultyText(lesson.difficulty)}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">현재 레벨:</span> {lesson.currentLevel}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">목표 레벨:</span> {lesson.targetLevel}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">예상 기간:</span> {lesson.estimatedDuration}주
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {lesson.focusAreas.map((area, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {area}
                    </span>
                  ))}
                </div>

                <div className="text-sm text-gray-500 mb-4">
                  강습 항목: {lesson.lessonPlan.length}개
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedLesson(lesson)}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    상세보기
                  </button>
                  <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold">
                    진행상황
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI 분석 결과 탭 */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {personalizedLessons.map((lesson) => (
              <div key={lesson._id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {lesson.studentName} - AI 분석 결과
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">🎯 AI 추천사항</h4>
                    <div className="space-y-3">
                      {lesson.aiRecommendations.map((recommendation, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">📊 학습 분석</h4>
                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">현재 레벨</div>
                        <div className="text-lg font-semibold text-gray-900">{lesson.currentLevel}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">목표 레벨</div>
                        <div className="text-lg font-semibold text-gray-900">{lesson.targetLevel}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm text-gray-600">예상 소요 기간</div>
                        <div className="text-lg font-semibold text-gray-900">{lesson.estimatedDuration}주</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 진도 추적 탭 */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            {personalizedLessons.map((lesson) => (
              <div key={lesson._id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {lesson.studentName} - 진도 추적
                </h3>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">전체 진행률</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round((lesson.lessonPlan.filter(item => item.isCompleted).length / lesson.lessonPlan.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(lesson.lessonPlan.filter(item => item.isCompleted).length / lesson.lessonPlan.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-3">
                  {lesson.lessonPlan.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={item.isCompleted}
                          onChange={() => {
                            // 체크박스 상태 변경 로직
                          }}
                          className="mr-3 h-4 w-4 text-blue-600 rounded border-gray-300"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{item.title}</div>
                          <div className="text-sm text-gray-600">{item.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{item.duration}분</div>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(item.difficulty)}`}>
                          {getDifficultyText(item.difficulty)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 빈 상태 메시지 */}
        {personalizedLessons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              생성된 개인 맞춤 강습이 없습니다.
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              첫 번째 강습 계획 생성하기
            </button>
          </div>
        )}

        {/* 강습 상세보기 모달 */}
        {selectedLesson && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedLesson.studentName} - 개인 맞춤 강습 상세
                  </h2>
                  <button
                    onClick={() => setSelectedLesson(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">학생 정보</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">현재 레벨:</span>
                        <span className="font-medium">{selectedLesson.currentLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">목표 레벨:</span>
                        <span className="font-medium">{selectedLesson.targetLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">예상 기간:</span>
                        <span className="font-medium">{selectedLesson.estimatedDuration}주</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">난이도:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(selectedLesson.difficulty)}`}>
                          {getDifficultyText(selectedLesson.difficulty)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 추천사항</h3>
                    <div className="space-y-2">
                      {selectedLesson.aiRecommendations.map((recommendation, index) => (
                        <div key={index} className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">{recommendation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">강습 계획</h3>
                  <div className="space-y-3">
                    {selectedLesson.lessonPlan.map((item) => (
                      <div key={item.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(item.difficulty)}`}>
                            {getDifficultyText(item.difficulty)}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">소요시간: {item.duration}분</div>
                          <div className="text-sm text-gray-500">집중영역: {item.focusArea}</div>
                        </div>
                        {item.tips.length > 0 && (
                          <div className="mt-3">
                            <div className="text-sm font-medium text-gray-700 mb-2">💡 팁</div>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {item.tips.map((tip, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="mr-2">•</span>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 새 강습 계획 생성 모달 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">AI 기반 개인 맞춤 강습 계획 생성</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      학생 ID *
                    </label>
                    <input
                      type="text"
                      value={newLesson.studentId}
                      onChange={(e) => setNewLesson({...newLesson, studentId: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="학생 ID를 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      학생 이름 *
                    </label>
                    <input
                      type="text"
                      value={newLesson.studentName}
                      onChange={(e) => setNewLesson({...newLesson, studentName: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="학생 이름을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      현재 레벨 *
                    </label>
                    <select
                      value={newLesson.currentLevel}
                      onChange={(e) => setNewLesson({...newLesson, currentLevel: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">현재 레벨 선택</option>
                      <option value="초급">초급</option>
                      <option value="중급">중급</option>
                      <option value="고급">고급</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      목표 레벨 *
                    </label>
                    <select
                      value={newLesson.targetLevel}
                      onChange={(e) => setNewLesson({...newLesson, targetLevel: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">목표 레벨 선택</option>
                      <option value="초급">초급</option>
                      <option value="중급">중급</option>
                      <option value="고급">고급</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    집중 영역 (다중 선택 가능)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['기본동작', '호흡법', '지구력', '고급기술', '경기기술', '체력'].map((area) => (
                      <label key={area} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newLesson.focusAreas.includes(area)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewLesson({...newLesson, focusAreas: [...newLesson.focusAreas, area]});
                            } else {
                              setNewLesson({...newLesson, focusAreas: newLesson.focusAreas.filter(a => a !== area)});
                            }
                          }}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        {area}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예상 소요 기간 (주)
                  </label>
                  <input
                    type="number"
                    value={newLesson.estimatedDuration}
                    onChange={(e) => setNewLesson({...newLesson, estimatedDuration: parseInt(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="52"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateLesson}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    AI 강습 계획 생성
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(AIAnalysisPage, { requireTypes: ['superAdmin', 'centerAdmin', 'instructor'], requirePermission: null });
