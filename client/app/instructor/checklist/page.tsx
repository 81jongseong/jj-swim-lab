'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, Badge, Button, Progress } from '../../../components/ui';
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
  User
} from 'lucide-react';

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

export default function InstructorChecklistPage() {
  const { user } = useAuth();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);

  useEffect(() => {
    loadChecklists();
  }, []);

  // 체크리스트 로드
  const loadChecklists = async () => {
    try {
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
          <Button
            onClick={() => window.location.href = '/instructor/students'}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            새 체크리스트 생성
          </Button>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
