'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner } from '@/components/ui';
import { Plus, Search, Filter, Edit, Trash2, UserCheck, UserX, GraduationCap, Phone, Mail, MapPin } from 'lucide-react';
import withAuth from '../../../components/withAuth';

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

  useEffect(() => {
    if (user) {
      loadInstructors();
    }
  }, [user]);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터 (실제로는 API에서 가져옴)
      const tempInstructors: Instructor[] = [
        {
          _id: '1',
          userId: 'instructor001',
          name: '김수영',
          email: 'kim@jjswimlab.com',
          phone: '010-1234-5678',
          instructorLevel: '고급',
          specialties: ['자유형', '배영', '평영'],
          experience: 8,
          assignedCenters: ['center001'],
          isActive: true,
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2024-08-31')
        },
        {
          _id: '2',
          userId: 'instructor002',
          name: '이강사',
          email: 'lee@jjswimlab.com',
          phone: '010-2345-6789',
          instructorLevel: '중급',
          specialties: ['접영', '혼영'],
          experience: 5,
          assignedCenters: ['center001'],
          isActive: true,
          createdAt: new Date('2023-03-20'),
          updatedAt: new Date('2024-08-31')
        },
        {
          _id: '3',
          userId: 'instructor003',
          name: '박초보',
          email: 'park@jjswimlab.com',
          phone: '010-3456-7890',
          instructorLevel: '초급',
          specialties: ['기초 수영'],
          experience: 2,
          assignedCenters: ['center001'],
          isActive: false,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-08-31')
        }
      ];
      
      setInstructors(tempInstructors);
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
      // 실제로는 API 호출
      setInstructors(prev => prev.map(instructor => 
        instructor._id === instructorId 
          ? { ...instructor, isActive: !instructor.isActive }
          : instructor
      ));
    } catch (error) {
      console.error('강사 상태 변경 실패:', error);
    }
  };

  const handleDeleteInstructor = async (instructorId: string) => {
    if (confirm('정말로 이 강사를 삭제하시겠습니까?')) {
      try {
        // 실제로는 API 호출
        setInstructors(prev => prev.filter(instructor => instructor._id !== instructorId));
        alert('강사가 삭제되었습니다.');
      } catch (error) {
        console.error('강사 삭제 실패:', error);
      }
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
                    onClick={() => setEditingInstructor(instructor)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteInstructor(instructor._id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
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
                <span>센터 {instructor.assignedCenters.length}개</span>
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
                  {instructor.specialties.map((specialty, index) => (
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
    </div>
  );
}

export default withAuth(InstructorManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});

