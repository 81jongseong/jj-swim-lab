'use client';
import { logger } from '@/lib/logger';
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import withAuth from '@/components/withAuth';
import ThemedStatCard from '@/components/ThemedStatCard';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { LoadingState, PageHeader, ConfirmModal, ErrorState } from '@/components/common';

interface Notice {
  _id: string;
  title: string;
  content: string;
  type: 'general' | 'important' | 'maintenance' | 'event';
  status: 'draft' | 'published' | 'archived';
  priority: 'low' | 'medium' | 'high';
  targetAudience: string[];
  targetUserTypes: ('student' | 'instructor' | 'centerAdmin' | 'superAdmin' | 'guest')[];
  targetRegions: string[];
  authorId: string;
  authorName: string;
  createdAt: Date;
  publishedAt?: Date;
  views: number;
  isVisibleToGuest: boolean;
  attachments?: string[];
}

function NoticesManagement() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 권한 확인 - 페이지 렌더링 전에 체크
  // center@swim.com 계정도 센터 관리자로 인식
  const isCenterAdmin = user && (
    ['centerAdmin', 'center-admin', 'superAdmin'].includes(user.userType) ||
    user.email === 'center@swim.com'
  );
  
  if (!isCenterAdmin) {
    // 권한이 없는 사용자는 게스트 버전의 화면으로 리다이렉트
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general' as Notice['type'],
    priority: 'medium' as Notice['priority'],
    status: 'draft' as Notice['status'],
    targetUserTypes: [] as string[],
    targetRegions: [] as string[],
    isVisibleToGuest: false
  });
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

  useEffect(() => {
    if (user) {
      loadNotices();
    }
  }, [user]);

  const loadNotices = async () => {
    try {
      setIsLoading(true);
      setError(null);
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
          targetUserTypes: ['student', 'instructor'],
          targetRegions: ['서울', '경기'],
          authorId: 'admin001',
          authorName: '관리자',
          createdAt: new Date('2024-01-20'),
          publishedAt: new Date('2024-01-20'),
          views: 156,
          isVisibleToGuest: false
        },
        {
          _id: '2',
          title: '신규 강사 모집',
          content: 'JJ Swim Lab에서 함께할 열정적인 강사를 모집합니다. 자세한 내용은 문의 바랍니다.',
          type: 'general',
          status: 'published',
          priority: 'medium',
          targetAudience: ['instructors'],
          targetUserTypes: ['instructor'],
          targetRegions: [],
          authorId: 'admin001',
          authorName: '관리자',
          createdAt: new Date('2024-01-18'),
          publishedAt: new Date('2024-01-18'),
          views: 89,
          isVisibleToGuest: false
        },
        {
          _id: '3',
          title: '수영 대회 개최 안내',
          content: '센터 내 수영 대회가 2월 15일에 개최됩니다. 참가 신청은 2월 1일까지입니다.',
          type: 'event',
          status: 'published',
          priority: 'medium',
          targetAudience: ['students'],
          targetUserTypes: ['student'],
          targetRegions: ['서울'],
          authorId: 'admin001',
          authorName: '관리자',
          createdAt: new Date('2024-01-15'),
          publishedAt: new Date('2024-01-15'),
          views: 234,
          isVisibleToGuest: true
        }
      ];
      setNotices(tempNotices);
    } catch (err: any) {
      logger.error('공지사항 로드 실패:', err);
      setError(err.message || '공지사항을 불러오는데 실패했습니다.');
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

  const handleCreate = () => {
    setEditingNotice(null);
    setFormData({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      status: 'draft',
      targetUserTypes: [],
      targetRegions: [],
      isVisibleToGuest: false
    });
    setShowModal(true);
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      type: notice.type,
      priority: notice.priority,
      status: notice.status,
      targetUserTypes: notice.targetUserTypes,
      targetRegions: notice.targetRegions,
      isVisibleToGuest: notice.isVisibleToGuest
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        authorId: user?._id || user?.id,
        authorName: user?.name || '관리자'
      };

      if (editingNotice) {
        // 수정
        const response = await fetch(`http://localhost:5000/api/notices/${editingNotice._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alert('공지사항이 수정되었습니다!');
          loadNotices();
          setShowModal(false);
        }
      } else {
        // 생성
        const response = await fetch('http://localhost:5000/api/notices', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          alert('공지사항이 생성되었습니다!');
          loadNotices();
          setShowModal(false);
        }
      }
    } catch (error) {
      logger.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: '이 공지사항을 삭제하시겠습니까?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/notices/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            alert('공지사항이 삭제되었습니다!');
            loadNotices();
          }
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        } catch (error) {
          logger.error('삭제 오류:', error);
          alert('삭제 중 오류가 발생했습니다.');
          setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
        }
      }
    });
  };

  const handlePublish = async (notice: Notice) => {
    try {
      const response = await fetch(`http://localhost:5000/api/notices/${notice._id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('공지사항이 발행되었습니다!');
        loadNotices();
      }
    } catch (error) {
      logger.error('발행 오류:', error);
      alert('발행 중 오류가 발생했습니다.');
    }
  };

  const toggleUserType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      targetUserTypes: prev.targetUserTypes.includes(type)
        ? prev.targetUserTypes.filter(t => t !== type)
        : [...prev.targetUserTypes, type]
    }));
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      targetRegions: prev.targetRegions.includes(region)
        ? prev.targetRegions.filter(r => r !== region)
        : [...prev.targetRegions, region]
    }));
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState 
          message={error}
          onRetry={() => {
            setError(null);
            loadNotices();
          }}
          retryText="다시 시도"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="로딩 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="공지사항 관리"
        description="센터의 공지사항을 작성하고 관리하세요"
      />

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <ThemedStatCard
          title="총 공지사항"
          value={`${notices.length}개`}
          icon={<Bell className="h-4 w-4" />}
          color="blue"
          className="border-2"
        />
        <ThemedStatCard
          title="발행된 공지"
          value={`${notices.filter(n=>n.status==='published').length}개`}
          icon={<Eye className="h-4 w-4" />}
          color="green"
          className="border-2"
        />
        <ThemedStatCard
          title="이번 달 공지"
          value={`${notices.filter(n=> n.createdAt.getMonth()===new Date().getMonth() && n.createdAt.getFullYear()===new Date().getFullYear()).length}개`}
          icon={<Calendar className="h-4 w-4" />}
          color="purple"
          className="border-2"
        />
        <ThemedStatCard
          title="총 조회수"
          value={notices.reduce((sum, n)=> sum + n.views, 0)}
          icon={<User className="h-4 w-4" />}
          color="orange"
          className="border-2"
        />
      </div>

      {/* 공지사항 목록 - 카드 그리드 */}
      <Card className="border-2">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">공지사항 목록</h3>
          <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" /> 새 공지사항 작성
          </Button>
        </div>
        <CardContent>
          {notices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">등록된 공지사항이 없습니다.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {notices.map((notice) => (
                <Card key={notice._id} className={`border-2 bg-white hover:shadow-lg transition-all`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold truncate">{notice.title}</CardTitle>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        notice.status==='published' ? 'bg-green-100 text-green-800' : notice.status==='draft' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getStatusLabel(notice.status)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> {notice.createdAt.toLocaleDateString('ko-KR')}
                      <span className="mx-1">•</span>
                      <User className="w-3 h-3" /> {notice.authorName}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-700 min-h-[48px] line-clamp-3 break-words">
                      {notice.content}
                    </div>
                    <div className="mt-3 flex items-center flex-wrap gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full border ${
                        notice.type==='important' ? 'bg-red-50 border-red-200 text-red-800' :
                        notice.type==='maintenance' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        notice.type==='event' ? 'bg-green-50 border-green-200 text-green-800' :
                        'bg-blue-50 border-blue-200 text-blue-800'
                      }`}>
                        {getTypeLabel(notice.type)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border ${
                        notice.priority==='high' ? 'bg-red-50 border-red-200 text-red-800' :
                        notice.priority==='medium' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                        'bg-green-50 border-green-200 text-green-800'
                      }`}>
                        {getPriorityLabel(notice.priority)}
                      </span>
                      <span className="ml-auto text-gray-500">조회 {notice.views.toLocaleString()}회</span>
                    </div>

                    <div className="mt-4 flex gap-2 pt-3 border-t">
                      {notice.status === 'draft' && (
                        <Button onClick={() => handlePublish(notice)} size="sm" className="bg-purple-600 hover:bg-purple-700">
                          <Bell className="w-3 h-3 mr-1" /> 발행
                        </Button>
                      )}
                      <Button onClick={() => handleEdit(notice)} variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-50">
                        <Edit className="w-3 h-3 mr-1" /> 수정
                      </Button>
                      <Button onClick={() => handleDelete(notice._id)} variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                        <Trash2 className="w-3 h-3 mr-1" /> 삭제
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 공지사항 작성/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* 제목 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="공지사항 제목을 입력하세요"
                />
              </div>

              {/* 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  내용 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={8}
                  placeholder="공지사항 내용을 입력하세요"
                />
              </div>

              {/* 유형, 우선순위, 상태 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    유형
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Notice['type'] })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">일반</option>
                    <option value="important">중요</option>
                    <option value="maintenance">점검</option>
                    <option value="event">이벤트</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    우선순위
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Notice['priority'] })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">보통</option>
                    <option value="high">높음</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Notice['status'] })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">임시저장</option>
                    <option value="published">발행</option>
                    <option value="archived">보관</option>
                  </select>
                </div>
              </div>

              {/* 대상 계정 유형 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  📢 받는 사람 (계정별) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.targetUserTypes.includes('student')}
                      onChange={() => toggleUserType('student')}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-medium">👨‍🎓 학생 (회원)</span>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.targetUserTypes.includes('instructor')}
                      onChange={() => toggleUserType('instructor')}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-medium">👨‍🏫 강사</span>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.targetUserTypes.includes('centerAdmin')}
                      onChange={() => toggleUserType('centerAdmin')}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-medium">🏢 센터 관리자</span>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.targetUserTypes.includes('superAdmin')}
                      onChange={() => toggleUserType('superAdmin')}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-medium">⭐ 최고 관리자</span>
                  </label>

                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 bg-yellow-50">
                    <input
                      type="checkbox"
                      checked={formData.targetUserTypes.includes('guest')}
                      onChange={() => toggleUserType('guest')}
                      className="mr-3 w-4 h-4"
                    />
                    <span className="font-medium">👤 게스트 (비회원)</span>
                  </label>
                </div>
                {formData.targetUserTypes.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">최소 1개 이상의 계정 유형을 선택해주세요</p>
                )}
              </div>

              {/* 게스트 공개 옵션 */}
              {formData.targetUserTypes.includes('guest') && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isVisibleToGuest}
                      onChange={(e) => setFormData({ ...formData, isVisibleToGuest: e.target.checked })}
                      className="mr-2 w-4 h-4"
                    />
                    <span className="font-medium text-yellow-800">✅ 게스트(비회원)에게 공개</span>
                  </label>
                  <p className="text-xs text-yellow-700 mt-2">
                    체크하면 로그인하지 않은 사용자도 우리 센터 공지사항을 볼 수 있습니다.
                  </p>
                </div>
              )}

              {/* 대상 지역 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🌍 받는 사람 (지역별) - 선택사항
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'].map((region) => (
                    <label key={region} className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.targetRegions.includes(region)}
                        onChange={() => toggleRegion(region)}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm">{region}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  지역을 선택하지 않으면 모든 지역에 발송됩니다
                </p>
              </div>

              {/* 발송 대상 요약 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📋 발송 대상 요약</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <strong>계정 유형:</strong> {
                      formData.targetUserTypes.length === 0 
                        ? '선택 안됨' 
                        : formData.targetUserTypes.map(t => {
                          const labels: { [key: string]: string } = {
                            'student': '학생',
                            'instructor': '강사',
                            'centerAdmin': '센터관리자',
                            'superAdmin': '최고관리자'
                          };
                          return labels[t];
                        }).join(', ')
                    }
                  </p>
                  <p>
                    <strong>지역:</strong> {
                      formData.targetRegions.length === 0 
                        ? '전체 지역' 
                        : formData.targetRegions.join(', ')
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title || !formData.content || formData.targetUserTypes.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingNotice ? '수정하기' : '작성하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        variant={confirmModal.variant || 'info'}
        title="확인"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
}

export default withAuth(NoticesManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});