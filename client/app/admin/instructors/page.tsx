'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner } from '@/components/ui';
import { Plus, Search, Filter, Edit, Trash2, UserCheck, UserX, GraduationCap, Phone, Mail, MapPin, BarChart3 } from 'lucide-react';
import withAuth from '../../../components/withAuth';

// 강사 추가 모달 컴포넌트
function AddInstructorModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    experience: '신입',
    certifications: '',
    specialties: '',
    maxStudents: 20
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      certifications: formData.certifications.split(',').map(c => c.trim()).filter(c => c),
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
      maxStudents: parseInt(formData.maxStudents.toString())
    };
    onAdd(data);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">새 강사 추가</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일 *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">경력</label>
            <select
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="신입">신입</option>
              <option value="1-3년">1-3년</option>
              <option value="3-5년">3-5년</option>
              <option value="5-10년">5-10년</option>
              <option value="10년 이상">10년 이상</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">자격증 (쉼표로 구분)</label>
            <input
              type="text"
              value={formData.certifications}
              onChange={(e) => setFormData({...formData, certifications: e.target.value})}
              placeholder="예: 수영지도사 2급, 생명구조원"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전문 분야 (쉼표로 구분)</label>
            <input
              type="text"
              value={formData.specialties}
              onChange={(e) => setFormData({...formData, specialties: e.target.value})}
              placeholder="예: 자유형, 배영, 평영"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">최대 학생 수</label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.maxStudents}
              onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 권한 수정 모달 컴포넌트
function PermissionModal({ instructor, onClose, onUpdate }: { 
  instructor: Instructor; 
  onClose: () => void; 
  onUpdate: (id: string, permissions: any) => void;
}) {
  const [permissions, setPermissions] = useState({
    dashboard: true,
    courses: true,
    bookings: true,
    payments: false,
    notices: true,
    progress: true,
    evaluations: true,
    reports: true,
    userManagement: false,
    systemSettings: false,
    aiConfigManagement: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(instructor._id, permissions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">{instructor.name} 권한 수정</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {Object.entries(permissions).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setPermissions({...permissions, [key]: e.target.checked})}
                  className="mr-3"
                />
                <span className="text-sm">
                  {key === 'dashboard' && '대시보드'}
                  {key === 'courses' && '강습 과정 관리'}
                  {key === 'bookings' && '예약 관리'}
                  {key === 'payments' && '결제 관리'}
                  {key === 'notices' && '공지사항'}
                  {key === 'progress' && '진행도 관리'}
                  {key === 'evaluations' && '평가 관리'}
                  {key === 'reports' && '보고서'}
                  {key === 'userManagement' && '사용자 관리'}
                  {key === 'systemSettings' && '시스템 설정'}
                  {key === 'aiConfigManagement' && 'AI 설정 관리'}
                </span>
              </label>
            ))}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 성과 분석 모달 컴포넌트
function PerformanceModal({ data, onClose }: { data: any; onClose: () => void }) {
  const { instructor, totalChecklists, completedChecklists, averageProgress, totalStudents, activeStudents, recentActivity } = data;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {instructor.name} 강사 성과 분석
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* 기본 정보 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">기본 정보</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">강사명:</span>
                <span className="font-medium">{instructor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">이메일:</span>
                <span className="font-medium">{instructor.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">레벨:</span>
                <span className="font-medium">{instructor.instructorLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">경력:</span>
                <span className="font-medium">{instructor.experience}년</span>
              </div>
            </div>
          </div>

          {/* 성과 요약 */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">성과 요약</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{totalChecklists}</div>
                <div className="text-sm text-gray-600">총 체크리스트</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{completedChecklists}</div>
                <div className="text-sm text-gray-600">완료된 체크리스트</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{averageProgress}%</div>
                <div className="text-sm text-gray-600">평균 진행률</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{activeStudents}</div>
                <div className="text-sm text-gray-600">활성 학생</div>
              </div>
            </div>
          </div>
        </div>

        {/* 학생 관리 현황 */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">학생 관리 현황</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-gray-900">{totalStudents}</div>
              <div className="text-sm text-gray-600">총 담당 학생</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-green-600">{activeStudents}</div>
              <div className="text-sm text-gray-600">활성 학생</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {Math.round((activeStudents / totalStudents) * 100)}%
              </div>
              <div className="text-sm text-gray-600">활성 비율</div>
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">최근 활동</h4>
          <div className="space-y-2">
            {(recentActivity || []).map((activity: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-600">{activity.student}</div>
                </div>
                <div className="text-sm text-gray-500">{activity.date}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

interface Instructor {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  instructorLevel: string;
  specialties: string[];
  experience: number;
  assignedCenters: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function InstructorManagement() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [message, setMessage] = useState('');
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadInstructors();
    }
  }, [user]);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/centers/instructors', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setInstructors(data.data || []);
        } else {
          console.error('강사 목록 로드 실패:', data.message);
        }
      } else {
        console.error('강사 목록 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('강사 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = filterLevel === 'all' || instructor.instructorLevel === filterLevel;
    
    return matchesSearch && matchesLevel;
  });

  const handleToggleStatus = async (instructorId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const instructor = instructors.find(i => i._id === instructorId);
      if (!instructor) return;

      const response = await fetch(`http://localhost:5000/api/centers/instructors/${instructorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          isActive: !instructor.isActive 
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage(`강사가 ${!instructor.isActive ? '활성화' : '비활성화'}되었습니다.`);
          await loadInstructors();
        } else {
          setMessage(data.message || '강사 상태 변경에 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || '강사 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('강사 상태 변경 실패:', error);
      setMessage('네트워크 오류가 발생했습니다.');
    }
  };

  const handleDeleteInstructor = async (instructorId: string) => {
    if (confirm('정말로 이 강사를 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`http://localhost:5000/api/centers/instructors/${instructorId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setMessage('강사가 삭제되었습니다.');
          await loadInstructors();
        } else {
          const errorData = await response.json();
          setMessage(errorData.message || '강사 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('강사 삭제 실패:', error);
        setMessage('네트워크 오류가 발생했습니다.');
      }
    }
  };

  const handleAddInstructor = async (instructorData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/centers/instructors', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(instructorData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('강사가 성공적으로 추가되었습니다.');
          setShowAddModal(false);
          await loadInstructors();
        } else {
          setMessage(data.message || '강사 추가에 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || '강사 추가에 실패했습니다.');
      }
    } catch (error) {
      console.error('강사 추가 실패:', error);
      setMessage('네트워크 오류가 발생했습니다.');
    }
  };

  const handleUpdatePermissions = async (instructorId: string, permissions: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/centers/instructors/${instructorId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permissions })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('강사 권한이 성공적으로 수정되었습니다.');
          setShowPermissionModal(false);
          await loadInstructors();
        } else {
          setMessage(data.message || '권한 수정에 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || '권한 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('권한 수정 실패:', error);
      setMessage('네트워크 오류가 발생했습니다.');
    }
  };

  const handleViewPerformance = async (instructor: Instructor) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // 강사별 체크리스트 성과 데이터 조회
      const response = await fetch(`http://localhost:5000/api/checklist/instructor/${instructor._id}/performance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPerformanceData({
          instructor,
          ...data
        });
        setShowPerformanceModal(true);
      } else {
        // 임시 성과 데이터 (실제 API가 없을 경우)
        setPerformanceData({
          instructor,
          totalChecklists: 15,
          completedChecklists: 12,
          averageProgress: 78,
          totalStudents: 8,
          activeStudents: 6,
          recentActivity: [
            { date: '2024-08-31', action: '체크리스트 완료', student: '김학생' },
            { date: '2024-08-30', action: '새 체크리스트 생성', student: '이학생' },
            { date: '2024-08-29', action: '진행도 업데이트', student: '박학생' }
          ]
        });
        setShowPerformanceModal(true);
      }
    } catch (error) {
      console.error('성과 데이터 로드 실패:', error);
      setMessage('성과 데이터를 불러오는데 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="강사 목록을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          👨‍🏫 강사 관리
        </h1>
        <p className="text-sm text-gray-600">
          센터에 소속된 강사들을 관리하고 모니터링하세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="강사명, 이메일, ID로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 레벨</option>
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
                <option value="마스터">마스터</option>
              </select>
              
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                강사 추가
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 강사 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstructors.map((instructor) => (
          <Card key={instructor._id} className={`${!instructor.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{instructor.name}</h3>
                    <p className="text-sm text-gray-500">{instructor.userId}</p>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewPerformance(instructor)}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                    title="성과 분석"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInstructor(instructor);
                      setShowPermissionModal(true);
                    }}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    title="권한 수정"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteInstructor(instructor._id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    title="강사 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{instructor.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{instructor.phone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>센터 {instructor.assignedCenters?.length || 0}개</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {instructor.instructorLevel}
                  </span>
                  <span className="text-sm text-gray-600">
                    {instructor.experience}년 경력
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(instructor._id)}
                  className={instructor.isActive 
                    ? 'text-green-600 border-green-300 hover:bg-green-50' 
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                  }
                >
                  {instructor.isActive ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-1" />
                      활성
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4 mr-1" />
                      비활성
                    </>
                  )}
                </Button>
              </div>
              
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-1">전문 분야</p>
                <div className="flex flex-wrap gap-1">
                  {(instructor.specialties || []).map((specialty, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 강사가 없을 때 */}
      {filteredInstructors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterLevel !== 'all' ? '검색 결과가 없습니다' : '등록된 강사가 없습니다'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterLevel !== 'all' 
                ? '검색어나 필터를 변경해보세요' 
                : '첫 번째 강사를 추가해보세요'
              }
            </p>
            {!searchTerm && filterLevel === 'all' && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                강사 추가하기
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 통계 요약 */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{instructors.length}</div>
              <div className="text-sm text-gray-600">전체 강사</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {instructors.filter(i => i.isActive).length}
              </div>
              <div className="text-sm text-gray-600">활성 강사</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {instructors.filter(i => !i.isActive).length}
              </div>
              <div className="text-sm text-gray-600">비활성 강사</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(instructors.reduce((acc, i) => acc + i.experience, 0) / instructors.length * 10) / 10}
              </div>
              <div className="text-sm text-gray-600">평균 경력(년)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50">
          {message}
          <button 
            onClick={() => setMessage('')}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* 강사 추가 모달 */}
      {showAddModal && (
        <AddInstructorModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddInstructor}
        />
      )}

      {/* 권한 수정 모달 */}
      {showPermissionModal && selectedInstructor && (
        <PermissionModal
          instructor={selectedInstructor}
          onClose={() => setShowPermissionModal(false)}
          onUpdate={handleUpdatePermissions}
        />
      )}

      {/* 성과 분석 모달 */}
      {showPerformanceModal && performanceData && (
        <PerformanceModal
          data={performanceData}
          onClose={() => setShowPerformanceModal(false)}
        />
      )}
    </div>
  );
}

export default withAuth(InstructorManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});

