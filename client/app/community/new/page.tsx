'use client';

import { useState } from 'react';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

function CommunityNewPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!title || !content) { alert('제목과 내용을 입력해주세요'); return; }
    setLoading(true);
    const res = await apiClient.post('/community/posts', { title, content, tags: tags.split(',').map(t=>t.trim()).filter(Boolean) });
    setLoading(false);
    if (res.error) return alert(res.error);
    alert('게시글이 등록되었습니다.');
    window.location.href = '/community';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">새 게시글</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">제목</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">내용</label>
            <textarea value={content} onChange={(e)=>setContent(e.target.value)} rows={10} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">태그(쉼표로 구분)</label>
            <input value={tags} onChange={(e)=>setTags(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={()=>window.history.back()} className="px-4 py-2 border rounded">취소</button>
            <button disabled={loading} onClick={submit} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">등록</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CommunityNewPage, { requireTypes: ['student','instructor','centerAdmin','superAdmin'], requirePermission: null });









































