"use client";

import { useEffect, useState } from 'react';
import apiClient from '../../../utils/api';

import withAuth from '../../../components/withAuth';

function AdminNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<{
    title: string;
    content: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    isPublished: boolean;
  }>({ title: '', content: '', category: 'general', priority: 'medium', isPublished: false });

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      return '-';
    }
  };

  const loadNotices = async () => {
    setLoading(true);
    const res = await apiClient.getAdminNotices();
    if (res.data?.notices) setNotices(res.data.notices);
    setLoading(false);
  };

  useEffect(() => {
    loadNotices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">공지사항 관리</h1>
          <p className="text-gray-600">JJ Swim Lab의 모든 공지사항을 관리하세요</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">공지사항 목록</h2>
              <button 
                onClick={() => { setEditing(null); setForm({ title: '', content: '', category: 'general', priority: 'medium', isPublished: false }); setShowModal(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                새 공지사항 작성
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {notices.map((notice) => (
                <div key={notice._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 text-single-line mb-2">{notice.title}</h3>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          notice.category === 'system' ? 'bg-blue-100 text-blue-800' :
                          notice.category === 'event' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {notice.category}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          notice.priority === 'high' ? 'bg-red-100 text-red-800' :
                          notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {notice.priority}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          notice.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {notice.isPublished ? '발행됨' : '임시저장'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="mr-4">작성자: {notice.author?.name || '-'}</span>
                        <span>작성일: {formatDate(notice.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setEditing(notice); setForm({ title: notice.title, content: notice.content, category: notice.category, priority: notice.priority, isPublished: notice.isPublished }); setShowModal(true); }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        ✏️ 수정
                      </button>
                      <button 
                        onClick={async () => {
                          if (!confirm('정말로 이 공지사항을 삭제하시겠습니까?')) return;
                          const res = await apiClient.deleteNotice(notice._id);
                          if (!res.error) { await loadNotices(); }
                          else alert(res.error);
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        🗑️ 삭제
                      </button>
                      <button 
                        onClick={async () => {
                          const res = await apiClient.toggleNoticePublish(notice._id, !notice.isPublished);
                          if (!res.error) { await loadNotices(); }
                          else alert(res.error);
                        }}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        {notice.isPublished ? '📝 비발행' : '📢 발행'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {notices.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📢</div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">공지사항이 없습니다</h3>
                  <p className="text-gray-500 mb-6">아직 공지사항이 작성되지 않았습니다</p>
                  <div className="text-sm text-gray-400">
                    새 공지사항을 작성해보세요
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">{editing ? '공지 수정' : '새 공지 작성'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                <input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} className="w-full px-3 py-2 border rounded"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                <textarea rows={6} value={form.content} onChange={(e)=>setForm({...form, content:e.target.value})} className="w-full px-3 py-2 border rounded"/>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select value={form.category} onChange={(e)=>setForm({...form, category:e.target.value})} className="border rounded px-3 py-2">
                  <option value="general">일반</option>
                  <option value="system">시스템</option>
                  <option value="event">이벤트</option>
                  <option value="instructor">강사</option>
                </select>
                <select value={form.priority} onChange={(e)=>setForm({...form, priority:e.target.value as 'low' | 'medium' | 'high'})} className="border rounded px-3 py-2">
                  <option value="low">낮음</option>
                  <option value="medium">보통</option>
                  <option value="high">높음</option>
                </select>
                <label className="inline-flex items-center text-sm"><input type="checkbox" checked={form.isPublished} onChange={(e)=>setForm({...form, isPublished:e.target.checked})} className="mr-2"/>발행</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={()=>setShowModal(false)} className="px-4 py-2 text-gray-600 border rounded">취소</button>
              <button onClick={async ()=>{
                if (!form.title || !form.content) { alert('제목/내용은 필수입니다.'); return; }
                        const res = editing
          ? await apiClient.updateNotice(editing._id, form)
          : await apiClient.createNotice(form);
                if (!res.error) { setShowModal(false); await loadNotices(); } else { alert(res.error); }
              }} className="px-4 py-2 bg-blue-600 text-white rounded">{editing ? '수정' : '추가'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(AdminNoticesPage, { requireTypes: ['centerAdmin','superAdmin'], requirePermission: null });
