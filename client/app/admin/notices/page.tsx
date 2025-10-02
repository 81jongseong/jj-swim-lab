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
  targetUserTypes: ('student' | 'instructor' | 'centerAdmin' | 'superAdmin')[];
  targetRegions: string[];
  targetCenters: string[]; // 특정 센터 선택
  authorId: string;
  authorName: string;
  createdAt: Date;
  publishedAt?: Date;
  views: number;
  attachments?: string[];
}

interface Center {
  _id: string;
  name: string;
  region: string;
}

function SuperAdminNoticesManagement() {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    targetCenters: [] as string[],
    sendToAllCenters: false,
    sendToAllRegions: false,
    sendToAllUserTypes: false
  });

  useEffect(() => {
    if (user) {
      loadNotices();
      loadCenters();
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
          targetUserTypes: ['student', 'instructor'],
          targetRegions: ['서울', '경기'],
          targetCenters: [],
          authorId: 'superadmin001',
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
          targetUserTypes: ['instructor'],
          targetRegions: [],
          targetCenters: [],
          authorId: 'superadmin001',
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
          targetUserTypes: ['student'],
          targetRegions: ['서울'],
          targetCenters: ['center001'],
          authorId: 'superadmin001',
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

  const loadCenters = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/swimming-centers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCenters(data.centers || data || []);
      } else {
        // 임시 데이터
        setCenters([
          { _id: 'center001', name: '강남 수영장', region: '서울' },
          { _id: 'center002', name: '판교 수영장', region: '경기' },
          { _id: 'center003', name: '해운대 수영장', region: '부산' }
        ]);
      }
    } catch (error) {
      console.error('센터 로드 실패:', error);
      setCenters([
        { _id: 'center001', name: '강남 수영장', region: '서울' },
        { _id: 'center002', name: '판교 수영장', region: '경기' },
        { _id: 'center003', name: '해운대 수영장', region: '부산' }
      ]);
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
      targetCenters: [],
      sendToAllCenters: false,
      sendToAllRegions: false,
      sendToAllUserTypes: false
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
      targetCenters: notice.targetCenters,
      sendToAllCenters: notice.targetCenters.length === 0,
      sendToAllRegions: notice.targetRegions.length === 0,
      sendToAllUserTypes: notice.targetUserTypes.length === 4
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        targetUserTypes: formData.sendToAllUserTypes 
          ? ['student', 'instructor', 'centerAdmin', 'superAdmin']
          : formData.targetUserTypes,
        targetRegions: formData.sendToAllRegions ? [] : formData.targetRegions,
        targetCenters: formData.sendToAllCenters ? [] : formData.targetCenters,
        authorId: user?._id || user?.id,
        authorName: user?.name || '최고 관리자'
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
      console.error('저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;

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
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
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
      console.error('발행 오류:', error);
      alert('발행 중 오류가 발생했습니다.');
    }
  };

  const toggleUserType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      targetUserTypes: prev.targetUserTypes.includes(type)
        ? prev.targetUserTypes.filter(t => t !== type)
        : [...prev.targetUserTypes, type],
      sendToAllUserTypes: false
    }));
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      targetRegions: prev.targetRegions.includes(region)
        ? prev.targetRegions.filter(r => r !== region)
        : [...prev.targetRegions, region],
      sendToAllRegions: false
    }));
  };

  const toggleCenter = (centerId: string) => {
    setFormData(prev => ({
      ...prev,
      targetCenters: prev.targetCenters.includes(centerId)
        ? prev.targetCenters.filter(c => c !== centerId)
        : [...prev.targetCenters, centerId],
      sendToAllCenters: false
    }));
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
          최고 관리자 공지사항 관리
        </h1>
        <p className="text-gray-600">전체 시스템의 공지사항을 센터별, 지역별, 계정별로 발송하세요</p>
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
            onClick={handleCreate}
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
                      {notice.status === 'draft' && (
                        <button 
                          onClick={() => handlePublish(notice)}
                          className="text-purple-600 hover:text-purple-900"
                          title="발행"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(notice)}
                        className="text-green-600 hover:text-green-900"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(notice._id)}
                        className="text-red-600 hover:text-red-900"
                        title="삭제"
                      >
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

              {/* 발송 대상 설정 */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📤 발송 대상 설정</h3>

                {/* 센터별 발송 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      🏢 센터별 발송
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sendToAllCenters}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          sendToAllCenters: e.target.checked,
                          targetCenters: e.target.checked ? [] : formData.targetCenters
                        })}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-blue-600">전체 센터</span>
                    </label>
                  </div>
                  {!formData.sendToAllCenters && (
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                      {centers.map((center) => (
                        <label key={center._id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.targetCenters.includes(center._id)}
                            onChange={() => toggleCenter(center._id)}
                            className="mr-2 w-4 h-4"
                          />
                          <div>
                            <span className="text-sm font-medium">{center.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({center.region})</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    특정 센터의 회원, 강사, 센터관리자에게 발송
                  </p>
                </div>

                {/* 지역별 발송 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      🌍 지역별 발송
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.sendToAllRegions}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          sendToAllRegions: e.target.checked,
                          targetRegions: e.target.checked ? [] : formData.targetRegions
                        })}
                        className="mr-2 w-4 h-4"
                      />
                      <span className="text-sm font-medium text-blue-600">전체 지역</span>
                    </label>
                  </div>
                  {!formData.sendToAllRegions && (
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
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    센터 선택과 함께 사용 시 AND 조건 (센터 O + 지역 O)
                  </p>
                </div>

              {/* 대상 계정 유형 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    👥 계정별 발송 *
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sendToAllUserTypes}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        sendToAllUserTypes: e.target.checked,
                        targetUserTypes: e.target.checked ? ['student', 'instructor', 'centerAdmin', 'superAdmin'] : []
                      })}
                      className="mr-2 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-blue-600">전체 계정</span>
                  </label>
                </div>
                {!formData.sendToAllUserTypes && (
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
                </div>
                )}
                {!formData.sendToAllUserTypes && formData.targetUserTypes.length === 0 && (
                  <p className="mt-2 text-sm text-red-600">최소 1개 이상의 계정 유형을 선택해주세요</p>
                )}
              </div>
            </div>

              {/* 발송 대상 요약 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">📋 발송 대상 요약</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>
                    <strong>센터:</strong> {
                      formData.sendToAllCenters 
                        ? '전체 센터' 
                        : formData.targetCenters.length === 0
                          ? '선택 안됨'
                          : formData.targetCenters.map(cId => {
                              const center = centers.find(c => c._id === cId);
                              return center?.name;
                            }).join(', ')
                    }
                  </p>
                  <p>
                    <strong>지역:</strong> {
                      formData.sendToAllRegions
                        ? '전체 지역'
                        : formData.targetRegions.length === 0 
                          ? '전체 지역' 
                          : formData.targetRegions.join(', ')
                    }
                  </p>
                  <p>
                    <strong>계정 유형:</strong> {
                      formData.sendToAllUserTypes
                        ? '전체 계정'
                        : formData.targetUserTypes.length === 0 
                          ? '선택 안됨' 
                          : formData.targetUserTypes.map(t => {
                            const labels: { [key: string]: string } = {
                              'student': '회원',
                              'instructor': '강사',
                              'centerAdmin': '센터관리자',
                              'superAdmin': '최고관리자'
                            };
                            return labels[t];
                          }).join(', ')
                    }
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    💡 <strong>발송 로직:</strong> (선택 센터 OR 전체 센터) AND (선택 지역 OR 전체 지역) AND 선택 계정 유형
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
                disabled={
                  !formData.title || 
                  !formData.content || 
                  (!formData.sendToAllUserTypes && formData.targetUserTypes.length === 0)
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {editingNotice ? '수정하기' : '작성하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(SuperAdminNoticesManagement, { 
  requireTypes: ['superAdmin'] 
});