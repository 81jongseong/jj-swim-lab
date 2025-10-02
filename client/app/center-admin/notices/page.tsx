'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface Notice {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'important' | 'maintenance' | 'event';
  status: 'draft' | 'published' | 'archived';
  priority: 'low' | 'medium' | 'high';
  targetAudience: string[];
  authorId: string;
  authorName: string;
  createdAt: Date;
  publishedAt?: Date;
  views: number;
  attachments?: string[];
}

function NoticesManagement() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotices();
    }
  }, [user]);

  const loadNotices = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempNotices: Notice[] = [
        {
          _id: '1',
          title: '수영장 정기 점검 안내',
          content: '수영장 정기 점검으로 인해 1월 25일 오후 2시부터 6시까지 이용이 제한됩니다.',
          type: 'maintenance',
          status: 'published',
          priority: 'high',
          targetAudience: ['all'],
          authorId: 'admin001',
          authorName: '관리자',
          createdAt: new Date('2024-01-20'),
          publishedAt: new Date('2024-01-20'),
          views: 156
        },
        {
          _id: '2',
          title: '신규 강사 모집',
          content: 'JJ Swim Lab에서 함께할 열정적인 강사를 모집합니다. 자세한 내용은 문의 바랍니다.',
          type: 'general',
          status: 'published',
          priority: 'medium',
          targetAudience: ['instructors'],
          authorId: 'admin001',
          authorName: '관리자',
          createdAt: new Date('2024-01-18'),
          publishedAt: new Date('2024-01-18'),
          views: 89
        },
        {
          _id: '3',
          title: '수영 대회 개최 안내',
          content: '센터 내 수영 대회가 2월 15일에 개최됩니다. 참가 신청은 2월 1일까지입니다.',
          type: 'event',
          status: 'published',
          priority: 'medium',
          targetAudience: ['students'],
          authorId: 'admin001',
          authorName: '관리자',
          createdAt: new Date('2024-01-15'),
          publishedAt: new Date('2024-01-15'),
          views: 234
        }
      ];
      setNotices(tempNotices);
    } catch (error) {
      console.error('공지사항 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'general': '일반',
      'important': '중요',
      'maintenance': '점검',
      'event': '이벤트'
    };
    return types[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'general': 'bg-blue-100 text-blue-800',
      'important': 'bg-red-100 text-red-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'event': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'draft': '임시저장',
      'published': '발행',
      'archived': '보관'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'draft': 'bg-gray-100 text-gray-800',
      'published': 'bg-green-100 text-green-800',
      'archived': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority: string) => {
    const priorities: { [key: string]: string } = {
      'low': '낮음',
      'medium': '보통',
      'high': '높음'
    };
    return priorities[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          공지사항 관리
        </h1>
        <p className="text-gray-600">센터의 공지사항을 작성하고 관리하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 공지사항</p>
              <p className="text-2xl font-bold text-gray-900">{notices.length}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">발행된 공지</p>
              <p className="text-2xl font-bold text-gray-900">
                {notices.filter(notice => notice.status === 'published').length}개
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">이번 달 공지</p>
              <p className="text-2xl font-bold text-gray-900">
                {notices.filter(notice => 
                  notice.createdAt.getMonth() === new Date().getMonth() &&
                  notice.createdAt.getFullYear() === new Date().getFullYear()
                ).length}개
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <User className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 조회수</p>
              <p className="text-2xl font-bold text-gray-900">
                {notices.reduce((sum, notice) => sum + notice.views, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 공지사항 목록 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">공지사항 목록</h3>
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 공지사항 작성
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  유형
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  조회수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {notices.map((notice) => (
                <tr key={notice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{notice.title}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {notice.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notice.type)}`}>
                      {getTypeLabel(notice.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notice.status)}`}>
                      {getStatusLabel(notice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notice.priority)}`}>
                      {getPriorityLabel(notice.priority)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notice.authorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {notice.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {notice.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
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
    </div>
  );
}

export default withAuth(NoticesManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});