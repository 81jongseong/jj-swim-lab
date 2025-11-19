/**
 * 📋 JJ Swim Lab - 반 체크리스트 관리 페이지
 * 
 * 📋 **목적**
 * - 강사가 반별 체크리스트를 생성하고 관리하는 페이지
 * - 반 선택 기능을 통해 특정 반의 체크리스트 생성/조회
 * - 학생별 진행도 관리 기능
 * 
 * 🔄 **주요 기능**
 * - 반 선택 드롭다운
 * - 반 체크리스트 생성/조회
 * - 학생별 진행도 표시 및 관리
 * 
 * 🔗 **연동되는 파일**
 * - client/lib/api/checklist.ts (체크리스트 API)
 * - server/src/routes/class-checklist.ts (반 체크리스트 API)
 * - server/src/routes/classes.ts (반 목록 API)
 * - server/src/routes/student-progress.ts (학생 진행도 API)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { checklistApi, Class, ClassChecklist, StudentProgress } from '../../../lib/api/checklist';
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
  ChevronDown
} from 'lucide-react';

export default function ClassChecklistPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [classChecklist, setClassChecklist] = useState<ClassChecklist | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [progressLoading, setProgressLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLevel, setCreateLevel] = useState<string>('초급');
  const [isPrivateLesson, setIsPrivateLesson] = useState(false);

  // 반 목록 로드
  useEffect(() => {
    loadClasses();
  }, []);

  // 선택한 반이 변경되면 체크리스트와 진행도 로드
  useEffect(() => {
    if (selectedClassId) {
      loadClassChecklist();
      loadStudentProgress();
    } else {
      setClassChecklist(null);
      setStudentProgress([]);
    }
  }, [selectedClassId]);

  const loadClasses = async () => {
    try {
      setLoading(true);
      const classList = await checklistApi.getClasses();
      setClasses(classList);
      
      // 첫 번째 반을 자동 선택
      if (classList.length > 0 && !selectedClassId) {
        setSelectedClassId(classList[0]._id);
        setSelectedClass(classList[0]);
      }
    } catch (error) {
      console.error('반 목록 로드 실패:', error);
      alert('반 목록을 불러오는데 실패했습니다.');
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
      // 체크리스트가 없으면 null로 설정 (생성 가능 상태)
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

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId);
    const selected = classes.find(c => c._id === classId);
    setSelectedClass(selected || null);
    setIsPrivateLesson(selected?.type === 'individual');
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
        // 개인레슨인 경우 모든 레벨 항목 포함
        checklist = await checklistApi.createPersonalLessonChecklist(selectedClassId);
      } else {
        // 단체반인 경우 레벨 선택
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
          <h1 className="text-3xl font-bold text-gray-900">반 체크리스트 관리</h1>
          <Button
            onClick={() => window.location.href = '/instructor/checklist'}
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            개별 체크리스트
          </Button>
        </div>

        {/* 반 선택 섹션 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">반 선택</h2>
            <Button
              onClick={loadClasses}
              variant="outline"
              size="sm"
            >
              새로고침
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                반 선택
              </label>
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
                    <span className="font-medium">
                      {selectedClass.type === 'individual' ? '개인레슨' : '단체반'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">학생 수:</span>
                    <span className="font-medium">
                      {selectedClass.currentStudents} / {selectedClass.maxStudents}
                    </span>
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
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
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
                  <StatCard
                    title="총 항목 수"
                    value={classChecklist.items.length.toString()}
                    icon="📋"
                    color="blue"
                    subtitle="체크리스트 항목"
                  />
                  <StatCard
                    title="커스텀 항목"
                    value={classChecklist.customItems?.length?.toString() || '0'}
                    icon="✏️"
                    color="purple"
                    subtitle="추가된 항목"
                  />
                  <StatCard
                    title="레벨"
                    value={classChecklist.level}
                    icon="📊"
                    color="green"
                    subtitle="체크리스트 레벨"
                  />
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">체크리스트 항목</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {classChecklist.items.map((item, index) => (
                      <div key={item._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <span className="text-sm font-medium text-gray-500 w-8">
                          {item.stepOrder || index + 1}.
                        </span>
                        <span className="flex-1 text-sm text-gray-900">{item.stepName}</span>
                        {item.difficulty && (
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            {item.difficulty}
                          </Badge>
                        )}
                      </div>
                    ))}
                    {classChecklist.customItems && classChecklist.customItems.length > 0 && (
                      <>
                        <div className="border-t border-gray-200 my-2"></div>
                        <h4 className="font-medium text-gray-700 mb-2">커스텀 항목</h4>
                        {classChecklist.customItems.map((item, index) => (
                          <div key={item._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                            <span className="text-sm font-medium text-gray-500 w-8">
                              {item.stepOrder || classChecklist.items.length + index + 1}.
                            </span>
                            <span className="flex-1 text-sm text-gray-900">{item.stepName}</span>
                            <Badge className="bg-purple-100 text-purple-800 text-xs">
                              커스텀
                            </Badge>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FileText className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">체크리스트가 없습니다</h3>
                <p className="text-gray-600 mb-4">반 체크리스트를 생성해주세요.</p>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
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
              <Button
                onClick={loadStudentProgress}
                variant="outline"
                size="sm"
                disabled={progressLoading}
              >
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
                      <Badge className="bg-green-100 text-green-800">
                        {progress.progressPercentage}%
                      </Badge>
                    </div>
                    
                    <Progress value={progress.progressPercentage} className="w-full mb-3" />
                    
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>완료 항목</span>
                      <span className="font-medium">
                        {progress.completedItems.length} / {progress.totalItems}
                      </span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        마지막 업데이트: {new Date(progress.lastUpdated).toLocaleDateString()}
                      </p>
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
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {!isPrivateLesson && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      레벨 선택
                    </label>
                    <select
                      value={createLevel}
                      onChange={(e) => setCreateLevel(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="초급">초급</option>
                      <option value="중급">중급</option>
                      <option value="고급">고급</option>
                    </select>
                  </div>
                )}

                {isPrivateLesson && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      개인레슨의 경우 모든 레벨의 항목이 포함됩니다.
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={handleCreateChecklist}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={checklistLoading}
                  >
                    {checklistLoading ? '생성 중...' : '생성'}
                  </Button>
                  <Button
                    onClick={() => setShowCreateModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    취소
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



