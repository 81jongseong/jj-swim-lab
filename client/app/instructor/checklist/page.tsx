/**
 * 📋 JJ Swim Lab - 체크리스트 관리 페이지
 * 
 * 📋 **목적**
 * - 강사가 체크리스트를 관리하는 통합 페이지
 * - 탭 구조로 개별 체크리스트, 템플릿, 반 체크리스트 관리
 * 
 * 🔄 **주요 기능**
 * - 탭 1: 개별 체크리스트 (학생별 체크리스트 관리)
 * - 탭 2: 체크리스트 템플릿 (템플릿 생성/수정/삭제)
 * - 탭 3: 반 체크리스트 (반별 체크리스트 및 학생 진행도 관리)
 * 
 * 🔗 **연동되는 파일**
 * - client/lib/api/checklist.ts (체크리스트 API)
 * - client/lib/api/checklist-template.ts (템플릿 API)
 * - server/src/routes/checklist.ts (체크리스트 API)
 * - server/src/routes/checklist-template.ts (템플릿 API)
 * - server/src/routes/class-checklist.ts (반 체크리스트 API)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';
import { Card, Badge, Progress } from '../../../components/ui';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Eye,
  Edit,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Users,
  FileText,
  Layout,
  ChevronDown
} from 'lucide-react';
import { checklistApi, Class, ClassChecklist, StudentProgress } from '../../../lib/api/checklist';

interface ChecklistItem {
  _id: string;
  stepName: string;
  stepOrder: number;
  isCompleted: boolean;
  completedAt?: string;
  category?: string;
  difficulty?: string;
  tips?: string;
  notes?: string;
  instructorNotes?: string;
}

interface Checklist {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
  };
  courseId: {
    _id: string;
    name: string;
  };
  instructorId: {
    _id: string;
    name: string;
  };
  items: ChecklistItem[];
  overallProgress: number;
  lastUpdated: string;
  startDate: string;
  targetCompletionDate?: string;
  status: 'active' | 'completed' | 'paused';
  notes?: string;
}

type TabType = 'individual' | 'template' | 'class';

export default function InstructorChecklistPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('individual');
  
  // 개별 체크리스트 관련 상태
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  // 반 체크리스트 관련 상태
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classChecklist, setClassChecklist] = useState<ClassChecklist | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLevel, setCreateLevel] = useState<string>('초급');
  const [isPrivateLesson, setIsPrivateLesson] = useState(false);

  // 체크리스트 로드
  const loadChecklists = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/checklist', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChecklists(data.checklists || []);
      }
    } catch (error) {
      console.error('체크리스트 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 반 체크리스트 관련 함수
  const loadClasses = async () => {
    try {
      setLoading(true);
      const classList = await checklistApi.getClasses();
      setClasses(classList);
      
      if (classList.length > 0 && !selectedClassId) {
        setSelectedClassId(classList[0]._id);
        setSelectedClass(classList[0]);
        setIsPrivateLesson(classList[0].type === 'individual');
      }
    } catch (error) {
      console.error('반 목록 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassChecklist = async () => {
    if (!selectedClassId) return;
    
    try {
      setChecklistLoading(true);
      const checklist = await checklistApi.getClassChecklist(selectedClassId);
      setClassChecklist(checklist);
    } catch (error) {
      console.error('체크리스트 로드 실패:', error);
      setClassChecklist(null);
    } finally {
      setChecklistLoading(false);
    }
  };

  const loadStudentProgress = async () => {
    if (!selectedClassId) return;
    
    try {
      setProgressLoading(true);
      const progress = await checklistApi.getStudentProgress(selectedClassId);
      setStudentProgress(progress);
    } catch (error) {
      console.error('학생 진행도 로드 실패:', error);
      setStudentProgress([]);
    } finally {
      setProgressLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'individual') {
      loadChecklists();
    } else if (activeTab === 'class') {
      loadClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (selectedClassId && activeTab === 'class') {
      loadClassChecklist();
      loadStudentProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClassId, activeTab]);

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const selected = classes.find(c => c._id === classId);
    setSelectedClass(selected || null);
    setIsPrivateLesson(selected?.type === 'individual' || false);
  };

  const handleCreateChecklist = async () => {
    if (!selectedClassId) {
      alert('반을 선택해주세요.');
      return;
    }

    try {
      setChecklistLoading(true);
      let checklist: ClassChecklist;
      
      if (isPrivateLesson) {
        checklist = await checklistApi.createPersonalLessonChecklist(selectedClassId);
      } else {
        checklist = await checklistApi.createClassChecklist(selectedClassId, createLevel);
      }
      
      setClassChecklist(checklist);
      setShowCreateModal(false);
      alert('체크리스트가 생성되었습니다.');
    } catch (error: any) {
      console.error('체크리스트 생성 실패:', error);
      alert(error.message || '체크리스트 생성에 실패했습니다.');
    } finally {
      setChecklistLoading(false);
    }
  };

  // 체크리스트 아이템 업데이트
  const updateChecklistItem = async (checklistId: string, itemId: string, isCompleted: boolean) => {
    setUpdatingItem(itemId);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/checklist/${checklistId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isCompleted,
          completedAt: isCompleted ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        await loadChecklists();
      }
    } catch (error) {
      console.error('체크리스트 아이템 업데이트 실패:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  // 필터링된 체크리스트
  const filteredChecklists = checklists.filter(checklist => {
    const matchesSearch = checklist.studentId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         checklist.courseId.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || checklist.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || 
                        checklist.items.some(item => item.difficulty === filterLevel);
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 난이도별 색상
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">체크리스트 관리</h1>
          {activeTab === 'individual' && (
            <Button
              onClick={() => window.location.href = '/instructor/students'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 체크리스트 생성
            </Button>
          )}
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('individual')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'individual'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                개별 체크리스트
              </button>
              <button
                onClick={() => setActiveTab('template')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'template'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Layout className="h-4 w-4 inline mr-2" />
                체크리스트 템플릿
              </button>
              <button
                onClick={() => setActiveTab('class')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'class'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                반 체크리스트
              </button>
            </nav>
          </div>
        </div>

        {/* 탭별 컨텐츠 */}
        {activeTab === 'individual' && (
          <>
        {/* 통계 카드 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard
            title="전체 체크리스트"
            value={checklists.length.toString()}
            icon="📋"
            color="blue"
            subtitle="생성된 체크리스트 수"
            change={{ value: 5.2, type: 'increase' }}
          />
          <StatCard
            title="활성 체크리스트"
            value={checklists.filter(c => c.status === 'active').length.toString()}
            icon="🔄"
            color="green"
            subtitle="진행 중인 체크리스트"
            change={{ value: 2.1, type: 'increase' }}
          />
          <StatCard
            title="완료된 체크리스트"
            value={checklists.filter(c => c.status === 'completed').length.toString()}
            icon="✅"
            color="purple"
            subtitle="완료된 체크리스트"
            change={{ value: 8.7, type: 'increase' }}
          />
          <StatCard
            title="일시정지된 체크리스트"
            value={checklists.filter(c => c.status === 'paused').length.toString()}
            icon="⏸️"
            color="orange"
            subtitle="일시정지 상태"
            change={{ value: 0, type: 'increase' }}
          />
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="학생명 또는 클래스명"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="active">진행중</option>
                <option value="completed">완료</option>
                <option value="paused">일시정지</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={loadChecklists}
                variant="outline"
                className="w-full"
              >
                새로고침
              </Button>
            </div>
          </div>
        </div>

        {/* 체크리스트 목록 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredChecklists.map((checklist) => (
            <Card key={checklist._id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {checklist.studentId.name}
                  </h3>
                  <p className="text-sm text-gray-600">{checklist.courseId.name}</p>
                </div>
                <Badge className={getStatusColor(checklist.status)}>
                  {checklist.status === 'active' ? '진행중' : 
                   checklist.status === 'completed' ? '완료' : '일시정지'}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">진행률</span>
                  <span className="font-medium">{checklist.overallProgress}%</span>
                </div>
                <Progress value={checklist.overallProgress} className="w-full" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">총 항목</span>
                  <span className="font-medium">{checklist.items.length}개</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">완료 항목</span>
                  <span className="font-medium">
                    {checklist.items.filter(item => item.isCompleted).length}개
                  </span>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedChecklist(checklist);
                    setShowDetailModal(true);
                  }}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  상세보기
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.location.href = `/instructor/students`}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  수정
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredChecklists.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">체크리스트가 없습니다</h3>
            <p className="text-gray-600 mb-4">학생을 위한 체크리스트를 생성해보세요.</p>
            <Button
              onClick={() => window.location.href = '/instructor/students'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              체크리스트 생성
            </Button>
          </div>
        )}

        {/* 체크리스트 상세 모달 */}
        {showDetailModal && selectedChecklist && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedChecklist.studentId.name} - {selectedChecklist.courseId.name}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">기본 정보</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">학생:</span>
                      <span className="font-medium">{selectedChecklist.studentId.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">클래스:</span>
                      <span className="font-medium">{selectedChecklist.courseId.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">시작일:</span>
                      <span className="font-medium">
                        {new Date(selectedChecklist.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">마지막 업데이트:</span>
                      <span className="font-medium">
                        {new Date(selectedChecklist.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">진행 상황</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">전체 진행률:</span>
                      <span className="font-medium">{selectedChecklist.overallProgress}%</span>
                    </div>
                    <Progress value={selectedChecklist.overallProgress} className="w-full" />
                    <div className="flex justify-between">
                      <span className="text-gray-600">완료된 항목:</span>
                      <span className="font-medium">
                        {selectedChecklist.items.filter(item => item.isCompleted).length} / {selectedChecklist.items.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">체크리스트 항목</h4>
                <div className="space-y-3">
                  {selectedChecklist.items.map((item, index) => (
                    <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500">
                            {item.stepOrder}.
                          </span>
                          <h5 className="font-medium text-gray-900">{item.stepName}</h5>
                          {item.difficulty && (
                            <Badge className={getDifficultyColor(item.difficulty)}>
                              {item.difficulty === 'beginner' ? '초급' :
                               item.difficulty === 'intermediate' ? '중급' : '고급'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={(e) => updateChecklistItem(selectedChecklist._id, item._id, e.target.checked)}
                            disabled={updatingItem === item._id}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          {item.isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </div>
                      
                      {item.category && (
                        <p className="text-sm text-gray-600 mb-2">
                          카테고리: {item.category}
                        </p>
                      )}
                      
                      {item.tips && (
                        <p className="text-sm text-gray-600 mb-2">
                          팁: {item.tips}
                        </p>
                      )}
                      
                      {item.notes && (
                        <p className="text-sm text-gray-600 mb-2">
                          메모: {item.notes}
                        </p>
                      )}
                      
                      {item.completedAt && (
                        <p className="text-sm text-green-600">
                          완료일: {new Date(item.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}

        {activeTab === 'template' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <Layout className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">체크리스트 템플릿</h3>
              <p className="text-gray-600 mb-4">템플릿 관리 기능은 곧 추가될 예정입니다.</p>
            </div>
          </div>
        )}

        {activeTab === 'class' && (
          <>
            {/* 반 선택 섹션 */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">반 선택</h2>
                <Button onClick={loadClasses} variant="outline" size="sm">새로고침</Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">반 선택</label>
                  <div className="relative">
                    <select
                      value={selectedClassId}
                      onChange={(e) => handleClassChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                    >
                      <option value="">반을 선택하세요</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} ({cls.level}) - {cls.type === 'individual' ? '개인레슨' : '단체반'}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {selectedClass && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">반명:</span>
                        <span className="font-medium">{selectedClass.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">레벨:</span>
                        <span className="font-medium">{selectedClass.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">타입:</span>
                        <span className="font-medium">{selectedClass.type === 'individual' ? '개인레슨' : '단체반'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">학생 수:</span>
                        <span className="font-medium">{selectedClass.currentStudents} / {selectedClass.maxStudents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">일정:</span>
                        <span className="font-medium">{selectedClass.schedule}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 체크리스트 섹션 */}
            {selectedClassId && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">반 체크리스트</h2>
                  {!classChecklist && (
                    <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      체크리스트 생성
                    </Button>
                  )}
                </div>

                {checklistLoading ? (
                  <div className="text-center py-8">체크리스트를 불러오는 중...</div>
                ) : classChecklist ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <StatCard title="총 항목 수" value={classChecklist.items.length.toString()} icon="📋" color="blue" subtitle="체크리스트 항목" />
                      <StatCard title="커스텀 항목" value={classChecklist.customItems?.length?.toString() || '0'} icon="✏️" color="purple" subtitle="추가된 항목" />
                      <StatCard title="레벨" value={classChecklist.level} icon="📊" color="green" subtitle="체크리스트 레벨" />
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-3">체크리스트 항목</h3>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {classChecklist.items.map((item, index) => (
                          <div key={item._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <span className="text-sm font-medium text-gray-500 w-8">{item.stepOrder || index + 1}.</span>
                            <span className="flex-1 text-sm text-gray-900">{item.stepName}</span>
                            {item.difficulty && <Badge className="bg-blue-100 text-blue-800 text-xs">{item.difficulty}</Badge>}
                          </div>
                        ))}
                        {classChecklist.customItems && classChecklist.customItems.length > 0 && (
                          <>
                            <div className="border-t border-gray-200 my-2"></div>
                            <h4 className="font-medium text-gray-700 mb-2">커스텀 항목</h4>
                            {classChecklist.customItems.map((item, index) => (
                              <div key={item._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                                <span className="text-sm font-medium text-gray-500 w-8">{item.stepOrder || classChecklist.items.length + index + 1}.</span>
                                <span className="flex-1 text-sm text-gray-900">{item.stepName}</span>
                                <Badge className="bg-purple-100 text-purple-800 text-xs">커스텀</Badge>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">체크리스트가 없습니다</h3>
                    <p className="text-gray-600 mb-4">반 체크리스트를 생성해주세요.</p>
                    <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      체크리스트 생성
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* 학생별 진행도 섹션 */}
            {selectedClassId && classChecklist && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">학생별 진행도</h2>
                  <Button onClick={loadStudentProgress} variant="outline" size="sm" disabled={progressLoading}>
                    새로고침
                  </Button>
                </div>

                {progressLoading ? (
                  <div className="text-center py-8">학생 진행도를 불러오는 중...</div>
                ) : studentProgress.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentProgress.map((progress) => (
                      <Card key={progress._id} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{progress.studentName}</h3>
                            <p className="text-sm text-gray-600">학생 ID: {progress.studentId}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">{progress.progressPercentage}%</Badge>
                        </div>
                        <Progress value={progress.progressPercentage} className="w-full mb-3" />
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>완료 항목</span>
                          <span className="font-medium">{progress.completedItems.length} / {progress.totalItems}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">마지막 업데이트: {new Date(progress.lastUpdated).toLocaleDateString()}</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">학생 진행도 데이터가 없습니다.</p>
                  </div>
                )}
              </div>
            )}

            {/* 체크리스트 생성 모달 */}
            {showCreateModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">체크리스트 생성</h3>
                    <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>
                  <div className="space-y-4">
                    {!isPrivateLesson && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">레벨 선택</label>
                        <select value={createLevel} onChange={(e) => setCreateLevel(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="초급">초급</option>
                          <option value="중급">중급</option>
                          <option value="고급">고급</option>
                        </select>
                      </div>
                    )}
                    {isPrivateLesson && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">개인레슨의 경우 모든 레벨의 항목이 포함됩니다.</p>
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <Button onClick={handleCreateChecklist} className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={checklistLoading}>
                        {checklistLoading ? '생성 중...' : '생성'}
                      </Button>
                      <Button onClick={() => setShowCreateModal(false)} variant="outline" className="flex-1">취소</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
