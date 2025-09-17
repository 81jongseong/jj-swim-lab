/**
 * @file 센터 관리자 공지사항 관리 페이지
 * @description 센터 관리자가 공지사항을 작성, 수정, 삭제할 수 있는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Eye, Calendar, User, AlertCircle } from 'lucide-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  isImportant: boolean;
  status: 'draft' | 'published' | 'archived';
}

const CenterAdminNoticesPage: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isImportant: false,
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/centers/notices', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('공지사항 데이터를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setNotices(result.data);
      } else {
        throw new Error(result.message || '공지사항 데이터 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('공지사항 데이터 로딩 실패:', error);
      
      // 임시 데이터 (개발용)
      const mockNotices: Notice[] = [
        {
          id: '1',
          title: '수영장 이용 안내',
          content: '수영장 이용 시 안전수칙을 준수해 주시기 바랍니다.',
          author: '센터 관리자',
          createdAt: '2025-09-14',
          updatedAt: '2025-09-14',
          isImportant: true,
          status: 'published',
        },
        {
          id: '2',
          title: '강의 일정 변경 안내',
          content: '다음 주 강의 일정이 변경되었습니다. 확인해 주세요.',
          author: '센터 관리자',
          createdAt: '2025-09-13',
          updatedAt: '2025-09-13',
          isImportant: false,
          status: 'published',
        },
        {
          id: '3',
          title: '새로운 강사 합류',
          content: '새로운 강사가 합류했습니다. 환영해 주세요.',
          author: '센터 관리자',
          createdAt: '2025-09-12',
          updatedAt: '2025-09-12',
          isImportant: false,
          status: 'draft',
        },
      ];
      
      setNotices(mockNotices);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingNotice 
        ? `http://localhost:5000/api/centers/notices/${editingNotice.id}`
        : 'http://localhost:5000/api/centers/notices';
      
      const method = editingNotice ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          author: user?.name || '센터 관리자',
        }),
      });

      if (!response.ok) {
        throw new Error('공지사항 저장에 실패했습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setShowForm(false);
        setEditingNotice(null);
        setFormData({ title: '', content: '', isImportant: false });
        fetchNotices();
      } else {
        throw new Error(result.message || '공지사항 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      alert('공지사항 저장에 실패했습니다.');
    }
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      content: notice.content,
      isImportant: notice.isImportant,
    });
    setShowForm(true);
  };

  const handleDelete = async (noticeId: string) => {
    if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/centers/notices/${noticeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('공지사항 삭제에 실패했습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        fetchNotices();
      } else {
        throw new Error(result.message || '공지사항 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      alert('공지사항 삭제에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">발행됨</Badge>;
      case 'draft':
        return <Badge variant="secondary">임시저장</Badge>;
      case 'archived':
        return <Badge variant="outline">보관됨</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
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
          공지사항 관리
        </h1>
        <p className="text-gray-600">
          센터 공지사항을 작성하고 관리하세요.
        </p>
      </div>

      {/* 공지사항 작성/수정 폼 */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingNotice ? '공지사항 수정' : '새 공지사항 작성'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  제목
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내용
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isImportant" className="ml-2 text-sm text-gray-700">
                  중요 공지사항
                </label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit">
                  {editingNotice ? '수정' : '작성'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingNotice(null);
                    setFormData({ title: '', content: '', isImportant: false });
                  }}
                >
                  취소
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 공지사항 목록 */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">공지사항 목록</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 공지사항
        </Button>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">공지사항이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{notice.title}</h3>
                      {notice.isImportant && (
                        <Badge variant="destructive">중요</Badge>
                      )}
                      {getStatusBadge(notice.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {notice.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {notice.createdAt}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{notice.content}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(notice)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(notice.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
        <p className="font-semibold">개발 참고:</p>
        <p>이 페이지의 데이터는 하드코딩이 아닌 데이터베이스에서 관리되어야 합니다.</p>
        <p>관련 API 엔드포인트 (`/api/centers/notices` 등) 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default CenterAdminNoticesPage;
