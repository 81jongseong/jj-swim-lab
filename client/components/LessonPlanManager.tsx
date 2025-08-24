'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface LessonPlan {
  _id: string;
  title: string;
  description: string;
  swimmingStyle: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  objectives: string[];
  prerequisites: string[];
  materials: string[];
  warmUp: {
    duration: number;
    exercises: string[];
  };
  mainContent: {
    duration: number;
    exercises: {
      name: string;
      description: string;
      duration: number;
      focus: string[];
      technique: string;
    }[];
  };
  coolDown: {
    duration: number;
    exercises: string[];
  };
  assessment: {
    criteria: string[];
    methods: string[];
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
    userType: string;
  };
  centerId?: {
    _id: string;
    name: string;
    address: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface LessonPlanFormData {
  title: string;
  description: string;
  swimmingStyle: 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number;
  objectives: string[];
  prerequisites: string[];
  materials: string[];
  warmUp: {
    duration: number;
    exercises: string[];
  };
  mainContent: {
    duration: number;
    exercises: {
      name: string;
      description: string;
      duration: number;
      focus: string[];
      technique: string;
    }[];
  };
  coolDown: {
    duration: number;
    exercises: string[];
  };
  assessment: {
    criteria: string[];
    methods: string[];
  };
  tags: string[];
}

const LessonPlanManager = () => {
  const { user } = useAuth();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LessonPlan | null>(null);
  const [formData, setFormData] = useState<LessonPlanFormData>({
    title: '',
    description: '',
    swimmingStyle: 'freestyle',
    difficulty: 'beginner',
    duration: 60,
    objectives: [''],
    prerequisites: [''],
    materials: [''],
    warmUp: {
      duration: 10,
      exercises: ['']
    },
    mainContent: {
      duration: 40,
      exercises: [{
        name: '',
        description: '',
        duration: 10,
        focus: [''],
        technique: ''
      }]
    },
    coolDown: {
      duration: 10,
      exercises: ['']
    },
    assessment: {
      criteria: [''],
      methods: ['']
    },
    tags: ['']
  });

  useEffect(() => {
    loadLessonPlans();
  }, []);

  const loadLessonPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lesson-plans');
      if (response.ok) {
        const data = await response.json();
        setLessonPlans(data.data || []);
      }
    } catch (error) {
      console.error('강습 계획서 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: keyof Pick<LessonPlanFormData, 'objectives' | 'prerequisites' | 'materials' | 'tags'>, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: keyof Pick<LessonPlanFormData, 'objectives' | 'prerequisites' | 'materials' | 'tags'>) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };

  const removeArrayItem = (field: keyof Pick<LessonPlanFormData, 'objectives' | 'prerequisites' | 'materials' | 'tags'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPlan ? `/api/lesson-plans/${editingPlan._id}` : '/api/lesson-plans';
      const method = editingPlan ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await loadLessonPlans();
        setShowForm(false);
        setEditingPlan(null);
        resetForm();
      }
    } catch (error) {
      console.error('강습 계획서 저장 실패:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      swimmingStyle: 'freestyle',
      difficulty: 'beginner',
      duration: 60,
      objectives: [''],
      prerequisites: [''],
      materials: [''],
      warmUp: {
        duration: 10,
        exercises: ['']
      },
      mainContent: {
        duration: 40,
        exercises: [{
          name: '',
          description: '',
          duration: 10,
          focus: [''],
          technique: ''
        }]
      },
      coolDown: {
        duration: 10,
        exercises: ['']
      },
      assessment: {
        criteria: [''],
        methods: ['']
      },
      tags: ['']
    });
  };

  const editPlan = (plan: LessonPlan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      description: plan.description,
      swimmingStyle: plan.swimmingStyle,
      difficulty: plan.difficulty,
      duration: plan.duration,
      objectives: plan.objectives,
      prerequisites: plan.prerequisites,
      materials: plan.materials,
      warmUp: plan.warmUp,
      mainContent: plan.mainContent,
      coolDown: plan.coolDown,
      assessment: plan.assessment,
      tags: plan.tags
    });
    setShowForm(true);
  };

  const deletePlan = async (id: string) => {
    if (!confirm('정말로 이 강습 계획서를 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/lesson-plans/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadLessonPlans();
      }
    } catch (error) {
      console.error('강습 계획서 삭제 실패:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">강습 계획서 관리</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          새 계획서 작성
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            {editingPlan ? '강습 계획서 수정' : '새 강습 계획서 작성'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수영 스타일 *
                </label>
                <select
                  value={formData.swimmingStyle}
                  onChange={(e) => handleInputChange('swimmingStyle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="freestyle">자유형</option>
                  <option value="backstroke">배영</option>
                  <option value="breaststroke">평영</option>
                  <option value="butterfly">접영</option>
                  <option value="mixed">혼영</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* 목표 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                학습 목표
              </label>
              {formData.objectives.map((objective, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleArrayInputChange('objectives', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('objectives', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('objectives')}
                className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                목표 추가
              </button>
            </div>

            {/* 메인 콘텐츠 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메인 운동 내용
              </label>
              {formData.mainContent.exercises.map((exercise, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="운동명"
                      value={exercise.name}
                      onChange={(e) => {
                        const newExercises = [...formData.mainContent.exercises];
                        newExercises[index].name = e.target.value;
                        handleInputChange('mainContent', { ...formData.mainContent, exercises: newExercises });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="지속시간 (분)"
                      value={exercise.duration}
                      onChange={(e) => {
                        const newExercises = [...formData.mainContent.exercises];
                        newExercises[index].duration = parseInt(e.target.value);
                        handleInputChange('mainContent', { ...formData.mainContent, exercises: newExercises });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    placeholder="운동 설명"
                    value={exercise.description}
                    onChange={(e) => {
                      const newExercises = [...formData.mainContent.exercises];
                      newExercises[index].description = e.target.value;
                      handleInputChange('mainContent', { ...formData.mainContent, exercises: newExercises });
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const newExercises = formData.mainContent.exercises.filter((_, i) => i !== index);
                        handleInputChange('mainContent', { ...formData.mainContent, exercises: newExercises });
                      }}
                      className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      운동 삭제
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newExercises = [...formData.mainContent.exercises, {
                    name: '',
                    description: '',
                    duration: 10,
                    focus: [''],
                    technique: ''
                  }];
                  handleInputChange('mainContent', { ...formData.mainContent, exercises: newExercises });
                }}
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                운동 추가
              </button>
            </div>

            {/* 버튼 */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingPlan ? '수정' : '저장'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPlan(null);
                  resetForm();
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 강습 계획서 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lessonPlans.map((plan) => (
          <div key={plan._id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{plan.title}</h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                plan.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                plan.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                plan.difficulty === 'advanced' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {plan.difficulty === 'beginner' ? '초급' :
                 plan.difficulty === 'intermediate' ? '중급' :
                 plan.difficulty === 'advanced' ? '고급' : '전문가'}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
            
            <div className="space-y-2 text-sm text-gray-500">
              <div>수영 스타일: {plan.swimmingStyle}</div>
              <div>강습 시간: {plan.duration}분</div>
              <div>운동 수: {plan.mainContent.exercises.length}개</div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => editPlan(plan)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                수정
              </button>
              <button
                onClick={() => deletePlan(plan._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {lessonPlans.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          등록된 강습 계획서가 없습니다.
        </div>
      )}
    </div>
  );
};

export default LessonPlanManager;

