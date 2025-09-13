/**
 * @file 센터 관리자 - 센터 강사 관리 페이지
 * @description 센터 관리자가 자신의 센터에 소속된 강사들을 관리하는 페이지입니다.
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { Users, Search, Plus, Edit, Eye, UserCheck, UserX, Star } from 'lucide-react';

interface CenterInstructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  instructorLevel: 'junior' | 'senior' | 'master';
  experience: string;
  specialties: string[];
  maxStudents: number;
  currentStudents: number;
  averageRating: number;
  totalCourses: number;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActivity: string;
}

const CenterInstructorsPage: React.FC = () => {
  const { user } = useAuth();
  const [instructors, setInstructors] = useState<CenterInstructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCenterInstructors();
  }, []);

  const fetchCenterInstructors = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 교체 필요: /api/center-admin/instructors
      const mockInstructors: CenterInstructor[] = [
        {
          id: '1',
          name: '박강사',
          email: 'instructor1@example.com',
          phone: '010-2345-6789',
          instructorLevel: 'senior',
          experience: '5년',
          specialties: ['자유형', '배영', '접영'],
          maxStudents: 20,
          currentStudents: 15,
          averageRating: 4.8,
          totalCourses: 12,
          joinDate: '2023-06-20',
          status: 'active',
          lastActivity: '2024-12-19'
        },
        {
          id: '2',
          name: '김강사',
          email: 'instructor2@example.com',
          phone: '010-3456-7890',
          instructorLevel: 'junior',
          experience: '2년',
          specialties: ['평영', '자유형'],
          maxStudents: 15,
          currentStudents: 10,
          averageRating: 4.5,
          totalCourses: 8,
          joinDate: '2024-03-15',
          status: 'active',
          lastActivity: '2024-12-18'
        },
        {
          id: '3',
          name: '이강사',
          email: 'instructor3@example.com',
          phone: '010-4567-8901',
          instructorLevel: 'master',
          experience: '10년',
          specialties: ['자유형', '배영', '접영', '평영'],
          maxStudents: 25,
          currentStudents: 22,
          averageRating: 4.9,
          totalCourses: 20,
          joinDate: '2022-01-10',
          status: 'active',
          lastActivity: '2024-12-19'
        }
      ];

      setInstructors(mockInstructors);
    } catch (error) {
      console.error('센터 강사 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'junior': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-green-100 text-green-800';
      case 'master': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          센터 강사 관리 👨‍🏫
        </h1>
        <p className="text-gray-600">
          {user?.name}님의 센터에 소속된 강사들을 관리하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 강사</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instructors.length}명</div>
            <p className="text-xs text-muted-foreground">
              전체 강사 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 강사</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {instructors.filter(i => i.status === 'active').length}명
            </div>
            <p className="text-xs text-muted-foreground">
              활성 상태 강사
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 평점</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(instructors.reduce((acc, i) => acc + i.averageRating, 0) / instructors.length).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              전체 강사 평점
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 수강생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {instructors.reduce((acc, i) => acc + i.currentStudents, 0)}명
            </div>
            <p className="text-xs text-muted-foreground">
              현재 수강 중인 학생
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 액션 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>강사 검색 및 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="강사 이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              새 강사 추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 강사 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>센터 강사 목록</CardTitle>
          <CardDescription>
            센터에 소속된 모든 강사들의 정보를 확인하고 관리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    강사 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    레벨/경력
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    전문 분야
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    수강생 현황
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평점/강의
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstructors.map((instructor) => (
                  <tr key={instructor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {instructor.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {instructor.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {instructor.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <Badge className={getLevelColor(instructor.instructorLevel)}>
                          {instructor.instructorLevel === 'junior' ? '주니어' :
                           instructor.instructorLevel === 'senior' ? '시니어' : '마스터'}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          경력 {instructor.experience}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {instructor.specialties.map((specialty, index) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800 text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {instructor.currentStudents}/{instructor.maxStudents}명
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(instructor.currentStudents / instructor.maxStudents) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="font-medium">{instructor.averageRating}</span>
                        </div>
                        <div className="text-gray-500">
                          {instructor.totalCourses}개 강의
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(instructor.status)}>
                        {instructor.status === 'active' ? '활성' :
                         instructor.status === 'inactive' ? '비활성' : '정지'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          보기
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          수정
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
        <p className="font-semibold">개발 참고:</p>
        <p>이 페이지는 센터 관리자가 자신의 센터에 소속된 강사들만 조회할 수 있습니다.</p>
        <p>강사 추가, 권한 수정, 수강생 할당 등의 기능이 구현되어야 합니다.</p>
      </div>
    </div>
  );
};

export default CenterInstructorsPage;
