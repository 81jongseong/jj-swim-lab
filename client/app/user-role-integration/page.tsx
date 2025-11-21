'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/button';
import { Badge } from '@/components/ui';
import withAuth from '../../components/withAuth';

interface UserRole {
  id: string;
  name: string;
  type: string;
  permissions: string[];
  dataAccess: string[];
}

const roles: UserRole[] = [
  {
    id: 'superAdmin',
    name: '최고 관리자',
    type: 'superAdmin',
    permissions: ['전체 시스템 관리', '사용자 권한 관리', '데이터 백업/복원'],
    dataAccess: ['전체 데이터', '시스템 로그', '사용자 활동 기록']
  },
  {
    id: 'centerAdmin',
    name: '센터 관리자',
    type: 'centerAdmin',
    permissions: ['센터 관리', '강사 관리', '수강생 관리'],
    dataAccess: ['센터 데이터', '강습 기록', '결제 내역']
  },
  {
    id: 'instructor',
    name: '강사',
    type: 'instructor',
    permissions: ['강습 진행', '수강생 평가', '진도 관리'],
    dataAccess: ['담당 수강생 데이터', '강습 계획', '평가 결과']
  },
  {
    id: 'student',
    name: '수강생',
    type: 'student',
    permissions: ['강습 수강', '진도 확인', '비디오 업로드'],
    dataAccess: ['개인 진도', '강습 일정', '평가 결과']
  }
];

function UserRoleIntegrationPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const getRoleColor = (type: string) => {
    switch (type) {
      case 'superAdmin': return 'bg-red-100 text-red-800';
      case 'centerAdmin': return 'bg-blue-100 text-blue-800';
      case 'instructor': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">사용자 역할 통합</h1>
        <p className="text-gray-600 mt-2">사용자 역할과 권한을 관리하고 통합합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 역할 목록 */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">사용자 역할</h2>
          <div className="space-y-4">
            {roles.map((role) => (
              <Card 
                key={role.id} 
                className={`cursor-pointer hover:shadow-lg transition-shadow ${selectedRole?.id === role.id ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedRole(role)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{role.name}</span>
                    <Badge className={getRoleColor(role.type)}>
                      {role.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">주요 권한:</h4>
                      <p className="text-sm text-gray-600">{role.permissions.slice(0, 2).join(', ')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-700">데이터 접근:</h4>
                      <p className="text-sm text-gray-600">{role.dataAccess.slice(0, 2).join(', ')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* 선택된 역할 상세 정보 */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">역할 상세 정보</h2>
          {selectedRole ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{selectedRole.name}</span>
                  <Badge className={getRoleColor(selectedRole.type)}>
                    {selectedRole.type}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3">권한 목록</h4>
                  <div className="space-y-2">
                    {selectedRole.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        <span className="text-sm">{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">데이터 접근 권한</h4>
                  <div className="space-y-2">
                    {selectedRole.dataAccess.map((access, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        <span className="text-sm">{access}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={() => alert(`${selectedRole.name} 역할이 선택되었습니다.`)}>
                    역할 적용
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                역할을 선택하면 상세 정보가 표시됩니다.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>역할 통합 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">사용자 역할 간 통합 및 권한 상속을 설정할 수 있습니다.</p>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  권한 상속 활성화
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  교차 역할 접근 허용
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  역할 변경 로그 기록
                </label>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => alert('통합 설정이 저장되었습니다.')}>
                설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(UserRoleIntegrationPage);
