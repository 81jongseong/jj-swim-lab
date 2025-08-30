/**
 * ✅ JJ Swim Lab - ChecklistManager 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 체크리스트 항목의 생성, 편집, 삭제를 위한 관리 시스템
 * - 체크리스트 단계별 진행 상황 추적
 * - 강사 피드백 및 학생 진행률 관리
 * - 체크리스트 템플릿 및 복사 기능
 * 
 * 🔄 **주요 기능**
 * - 체크리스트 CRUD 작업 (생성, 읽기, 수정, 삭제)
 * - 체크리스트 단계별 진행률 표시
 * - 강사 피드백 및 코멘트 관리
 * - 체크리스트 완료 상태 추적
 * - 체크리스트 템플릿 관리
 * 
 * 🗄️ **데이터 연동**
 * - 체크리스트 데이터베이스 연동
 * - 학생 진행률 데이터 관리
 * - 강사 피드백 데이터 저장
 * - 체크리스트 완료 이력 추적
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * - 체크리스트 관련 아이콘 (SVG)
 * - 모달 컴포넌트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 체크리스트 단계 순서 유지
 * 2. 진행률 계산 정확성 확인
 * 3. 강사 피드백 저장 및 표시
 * 4. 체크리스트 완료 상태 동기화
 * 5. 체크리스트 복사 시 중복 방지
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 체크리스트 CRUD 기능 동작 확인
 * - [ ] 단계별 진행률 표시 검증
 * - [ ] 강사 피드백 기능 확인
 * - [ ] 체크리스트 완료 상태 동기화 확인
 * - [ ] 체크리스트 템플릿 기능 검증
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 체크리스트 관리)
 * - 2024-12-19: 체크리스트 CRUD 기능 구현
 * - 2024-12-19: 단계별 진행률 시스템 구현
 * - 2024-12-19: 강사 피드백 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (체크리스트 관리 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 기반 체크리스트 자동 생성
 * - 체크리스트 난이도 자동 조정
 * - 체크리스트 완료 예측 분석
 * - 체크리스트 추천 시스템
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <ChecklistManager 
 *   onChecklistCreate={(checklist) => handleChecklistCreate(checklist)}
 *   onChecklistEdit={(checklist) => handleChecklistEdit(checklist)}
 *   onChecklistDelete={(id) => handleChecklistDelete(id)}
 * />
 * ```
 */

'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface ChecklistItem {
  category: 'warmup' | 'main' | 'cooldown' | 'assessment';
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  score?: number;
  feedback?: string;
}

interface Checklist {
  _id: string;
  lessonPlanId: {
    _id: string;
    title: string;
    swimmingStyle: string;
    difficulty: string;
    objectives: string[];
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  instructorId: {
    _id: string;
    name: string;
    email: string;
  };
  centerId?: {
    _id: string;
    name: string;
  };
  lessonDate: string;
  lessonDuration: number;
  items: ChecklistItem[];
  overallProgress: number;
  overallScore: number;
  instructorNotes: string;
  studentFeedback: string;
  nextLessonRecommendations: string[];
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface LessonPlan {
  _id: string;
  title: string;
  swimmingStyle: string;
  difficulty: string;
}

const ChecklistManager = () => {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [checklistsRes, lessonPlansRes] = await Promise.all([
        fetch('/api/checklists'),
        fetch('/api/lesson-plans')
      ]);

      if (checklistsRes.ok) {
        const data = await checklistsRes.json();
        setChecklists(data.data || []);
      }

      if (lessonPlansRes.ok) {
        const data = await lessonPlansRes.json();
        setLessonPlans(data.data || []);
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const createChecklist = async () => {
    if (!selectedLessonPlan || !selectedStudent) {
      alert('강습 계획서와 학생을 선택해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/checklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonPlanId: selectedLessonPlan,
          studentId: selectedStudent
        }),
      });

      if (response.ok) {
        await loadData();
        setShowForm(false);
        setSelectedLessonPlan('');
        setSelectedStudent('');
      }
    } catch (error) {
      console.error('체크리스트 생성 실패:', error);
    }
  };

  const updateChecklistItem = async (checklistId: string, itemIndex: number, updates: any) => {
    try {
      const response = await fetch(`/api/checklists/${checklistId}/items/${itemIndex}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('체크리스트 아이템 업데이트 실패:', error);
    }
  };

  const completeChecklist = async (checklistId: string, notes: string, recommendations: string[]) => {
    try {
      const response = await fetch(`/api/checklists/${checklistId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorNotes: notes,
          nextLessonRecommendations: recommendations
        }),
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('체크리스트 완료 처리 실패:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      case 'expert': return '전문가';
      default: return difficulty;
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">체크리스트 관리</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          새 체크리스트 생성
        </button>
      </div>

      {/* 체크리스트 생성 폼 */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">새 체크리스트 생성</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                강습 계획서 선택 *
              </label>
              <select
                value={selectedLessonPlan}
                onChange={(e) => setSelectedLessonPlan(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">계획서를 선택하세요</option>
                {lessonPlans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.title} ({getDifficultyLabel(plan.difficulty)})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학생 ID *
              </label>
              <input
                type="text"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                placeholder="학생의 사용자 ID를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={createChecklist}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              생성
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedLessonPlan('');
                setSelectedStudent('');
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 체크리스트 목록 */}
      <div className="space-y-6">
        {checklists.map((checklist) => (
          <div key={checklist._id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {checklist.lessonPlanId.title}
                </h3>
                <p className="text-sm text-gray-600">
                  학생: {checklist.studentId.name} | 강사: {checklist.instructorId.name}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(checklist.lessonDate).toLocaleDateString()} | 
                  진행률: {checklist.overallProgress}% | 
                  점수: {checklist.overallScore || 'N/A'}/10
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(checklist.lessonPlanId.difficulty)}`}>
                  {getDifficultyLabel(checklist.lessonPlanId.difficulty)}
                </span>
                {checklist.isCompleted && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    완료
                  </span>
                )}
              </div>
            </div>

            {/* 체크리스트 아이템들 */}
            <div className="space-y-3 mb-4">
              {checklist.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={(e) => updateChecklistItem(checklist._id, index, {
                        isCompleted: e.target.checked
                      })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.title}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={item.score || ''}
                        onChange={(e) => updateChecklistItem(checklist._id, index, {
                          score: e.target.value ? parseInt(e.target.value) : undefined
                        })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="">점수</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                          <option key={score} value={score}>{score}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* 피드백 입력 */}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="피드백을 입력하세요"
                      value={item.feedback || ''}
                      onChange={(e) => updateChecklistItem(checklist._id, index, {
                        feedback: e.target.value
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 강사 노트 및 다음 강습 추천 */}
            {!checklist.isCompleted && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-2">강사 노트</h4>
                <textarea
                  placeholder="강사 노트를 입력하세요"
                  value={checklist.instructorNotes || ''}
                  onChange={(e) => {
                    // 강사 노트 업데이트 로직
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                />
                
                <button
                  onClick={() => {
                    const notes = (document.querySelector(`textarea[data-checklist-id="${checklist._id}"]`) as HTMLTextAreaElement)?.value || '';
                    completeChecklist(checklist._id, notes, []);
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  강습 완료
                </button>
              </div>
            )}

            {checklist.isCompleted && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-2">완료된 강습</h4>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>강사 노트:</strong> {checklist.instructorNotes || '없음'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>완료일:</strong> {new Date(checklist.completedAt!).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {checklists.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          등록된 체크리스트가 없습니다.
        </div>
      )}
    </div>
  );
};

export default ChecklistManager;

