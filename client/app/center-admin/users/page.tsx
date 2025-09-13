/**
 * @file 센터 관리자 - 센터 회원 관리 페이지
 * @description 센터 관리자가 자신의 센터에 소속된 회원들을 관리하는 페이지입니다.
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
import { Users, Search, Filter, Plus, Edit, Eye, UserCheck, UserX } from 'lucide-react';

interface CenterMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  userType: 'student' | 'instructor';
  level: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  lastActivity: string;
}

const CenterUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<CenterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'student' | 'instructor'>('all');

  useEffect(() => {
    fetchCenterMembers();
  }, []);

  const fetchCenterMembers = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 교체 필요: /api/center-admin/users
      const mockMembers: CenterMember[] = [
        {
          id: '1',
          name: '김학생',
          email: 'student1@example.com',
          phone: '010-1234-5678',
          userType: 'student',
          level: 'beginner',
          joinDate: '2024-01-15',
          status: 'active',
          lastActivity: '2024-12-19'
        },
        {
          id: '2',
          name: '박강사',
          email: 'instructor1@example.com',
          phone: '010-2345-6789',
          userType: 'instructor',
          level: 'senior',
          joinDate: '2023-06-20',
          status: 'active',
          lastActivity: '2024-12-19'
        },
        {
          id: '3',
          name: '이학생',
          email: 'student2@example.com',
          phone: '010-3456-7890',
          userType: 'student',
          level: 'intermediate',
          joinDate: '2024-03-10',
          status: 'active',
          lastActivity: '2024-12-18'
        }
      ];

      setMembers(mockMembers);
    } catch (error) {
      console.error('센터 회원 목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || member.userType === filterType;
    return matchesSearch && matchesFilter;
  });

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
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'junior': return 'bg-blue-100 text-blue-800';
      case 'senior': return 'bg-green-100 text-green-800';
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
          센터 회원 관리 👥
        </h1>
        <p className="text-gray-600">
          {user?.name}님의 센터에 소속된 회원들을 관리하세요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 회원</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}명</div>
            <p className="text-xs text-muted-foreground">
              전체 회원 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 회원</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.status === 'active').length}명
            </div>
            <p className="text-xs text-muted-foreground">
              활성 상태 회원
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수강생</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.userType === 'student').length}명
            </div>
            <p className="text-xs text-muted-foreground">
              학생 회원
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">강사</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.userType === 'instructor').length}명
            </div>
            <p className="text-xs text-muted-foreground">
              강사 회원
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>회원 검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
              >
                전체
              </Button>
              <Button
                variant={filterType === 'student' ? 'default' : 'outline'}
                onClick={() => setFilterType('student')}
              >
                수강생
              </Button>
              <Button
                variant={filterType === 'instructor' ? 'default' : 'outline'}
                onClick={() => setFilterType('instructor')}
              >
                강사
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 회원 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>센터 회원 목록</CardTitle>
          <CardDescription>
            센터에 소속된 모든 회원들의 정보를 확인하고 관리할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    회원 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    유형/레벨
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가입일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최근 활동
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <Badge className={member.userType === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                          {member.userType === 'student' ? '수강생' : '강사'}
                        </Badge>
                        <Badge className={getLevelColor(member.level)}>
                          {member.level}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(member.status)}>
                        {member.status === 'active' ? '활성' :
                         member.status === 'inactive' ? '비활성' : '정지'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.lastActivity}
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
        <p>이 페이지는 센터 관리자가 자신의 센터에 소속된 회원들만 조회할 수 있습니다.</p>
        <p>최고관리자는 모든 센터의 회원을 조회할 수 있지만, 센터 관리자는 자신의 센터 회원만 조회 가능합니다.</p>
      </div>
    </div>
  );
};

export default CenterUsersPage;
