'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { User, Search, Star, Calendar, Award, Phone, Mail } from 'lucide-react';
import withAuth from '../../../components/withAuth';

interface Instructor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  experience: number; // years
  rating: number; // 1-5
  specialties: string[];
  certifications: string[];
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  totalStudents: number;
  totalClasses: number;
}

function InstructorsManagement() {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      loadInstructors();
    }
  }, [user]);

  const loadInstructors = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempInstructors: Instructor[] = [
        {
          _id: '1',
          name: '김강사',
          email: 'instructor1@example.com',
          phone: '010-1234-5678',
          experience: 5,
          rating: 4.8,
          specialties: ['자유형', '배영', '접영'],
          certifications: ['수영지도자 1급', 'CPR 자격증'],
          status: 'active',
          joinedAt: new Date('2023-01-15'),
          totalStudents: 45,
          totalClasses: 120
        },
        {
          _id: '2',
          name: '이코치',
          email: 'instructor2@example.com',
          phone: '010-2345-6789',
          experience: 8,
          rating: 4.9,
          specialties: ['평영', '접영', '종합'],
          certifications: ['수영지도자 1급', '수상안전요원', 'CPR 자격증'],
          status: 'active',
          joinedAt: new Date('2022-06-10'),
          totalStudents: 67,
          totalClasses: 200
        },
        {
          _id: '3',
          name: '박트레이너',
          email: 'instructor3@example.com',
          phone: '010-3456-7890',
          experience: 3,
          rating: 4.5,
          specialties: ['자유형', '초급자 지도'],
          certifications: ['수영지도자 2급', 'CPR 자격증'],
          status: 'pending',
          joinedAt: new Date('2024-01-01'),
          totalStudents: 12,
          totalClasses: 30
        }
      ];
      // ⭐ 가나다순 정렬
      const sortedInstructors = tempInstructors.sort((a, b) => 
        a.name.localeCompare(b.name, 'ko-KR')
      );
      setInstructors(sortedInstructors);
    } catch (error) {
      console.error('강사 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'active': '활성',
      'inactive': '비활성',
      'pending': '승인대기'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
          센터 소속 강사들을 관리하고 평가하세요
        </p>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
            placeholder="강사명, 이메일, 전문분야로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
      {/* 강사 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <User className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 강사</p>
              <p className="text-2xl font-bold text-gray-900">{instructors.length}명</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 평점</p>
              <p className="text-2xl font-bold text-gray-900">
                {instructors.length > 0 
                  ? (instructors.reduce((sum, i) => sum + i.rating, 0) / instructors.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 수업</p>
              <p className="text-2xl font-bold text-gray-900">
                {instructors.reduce((sum, i) => sum + i.totalClasses, 0)}회
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 학생</p>
              <p className="text-2xl font-bold text-gray-900">
                {instructors.reduce((sum, i) => sum + i.totalStudents, 0)}명
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 강사 목록 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredInstructors.map((instructor) => (
          <div key={instructor._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{instructor.name}</h3>
                    <p className="text-sm text-gray-500">{instructor.experience}년 경력</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(instructor.status)}`}>
                  {getStatusLabel(instructor.status)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{instructor.email}</span>
                </div>
                {instructor.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{instructor.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {renderStars(instructor.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({instructor.rating})</span>
              </div>
              
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">전문분야</p>
                <div className="flex flex-wrap gap-1">
                    {instructor.specialties.map((specialty, index) => (
                    <span
                      key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">자격증</p>
                  <div className="space-y-1">
                    {instructor.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="block text-xs text-gray-600"
                      >
                        • {cert}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{instructor.totalStudents}</p>
                    <p className="text-xs text-gray-500">담당 학생</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{instructor.totalClasses}</p>
                    <p className="text-xs text-gray-500">진행 수업</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInstructors.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default withAuth(InstructorsManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});