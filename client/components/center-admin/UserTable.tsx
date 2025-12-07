/**
 * 센터 회원 관리 - 사용자 테이블 컴포넌트
 * 
 * 연동 파일:
 * - client/app/center-admin/users/page.tsx
 */

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import type { User } from '@/types/user';

interface UserTableProps {
  users: User[];
  onToggleStatus: (userId: string) => void;
}

// 유틸리티 함수들
const getStatusLabel = (status: string): string => {
  const statuses: { [key: string]: string } = {
    'active': '활성',
    'inactive': '비활성',
    'pending': '대기중'
  };
  return statuses[status] || status;
};

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'active': 'bg-green-100 text-green-800',
    'inactive': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getUserTypeLabel = (type: string): string => {
  const types: { [key: string]: string } = {
    'student': '학생',
    'instructor': '강사',
    'centerAdmin': '센터관리자'
  };
  return types[type] || type;
};

const getUserTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    'student': 'bg-blue-100 text-blue-800',
    'instructor': 'bg-purple-100 text-purple-800',
    'centerAdmin': 'bg-orange-100 text-orange-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
};

export default function UserTable({ users, onToggleStatus }: UserTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">회원 목록</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                회원 정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                타입
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                멤버십
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                활동 정보
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가입일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                액션
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                {/* 회원 정보 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                  </div>
                </td>
                
                {/* 타입 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUserTypeColor(user.userType)}`}>
                    {getUserTypeLabel(user.userType)}
                  </span>
                </td>
                
                {/* 상태 */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                    {getStatusLabel(user.status)}
                  </span>
                </td>
                
                {/* 멤버십 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.membershipType ? (
                    <div>
                      <div>{user.membershipType}</div>
                      {user.membershipExpiry && (
                        <div className="text-xs text-gray-500">
                          만료: {user.membershipExpiry.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ) : '-'}
                </td>
                
                {/* 활동 정보 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.userType === 'student' ? (
                    <div>
                      <div>수업: {user.totalClasses || 0}회</div>
                      <div>결제: {user.totalPayments ? user.totalPayments.toLocaleString() : 0}원</div>
                    </div>
                  ) : user.userType === 'instructor' ? (
                    <div>
                      <div>수업: {user.totalClasses || 0}회</div>
                      <div>담당 학생: -</div>
                    </div>
                  ) : '-'}
                </td>
                
                {/* 가입일 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.joinedAt.toLocaleDateString()}
                </td>
                
                {/* 액션 */}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onToggleStatus(user._id)}
                      className={`${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                    >
                      {user.status === 'active' ? '비활성화' : '활성화'}
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}







