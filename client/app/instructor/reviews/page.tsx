'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';

export default function InstructorReviewsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<'pending'|'reviewed'>('pending');
  const [visibility, setVisibility] = useState<'private'|'center'|'public'>('private');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await apiClient.getReviewQueue({ status, limit: 50 });
    if (res.error) setError(res.error);
    else setItems(res.data.items || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onReview = async (id: string) => {
    const feedback = prompt('피드백 입력') || '';
    const res = await apiClient.reviewUpload(id, { status: 'reviewed', feedback, visibility });
    if (res.error) alert(res.error);
    else load();
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">리뷰 대기 목록</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm">상태</label>
          <select className="border rounded px-2 py-1" value={status} onChange={e=>setStatus(e.target.value as any)}>
            <option value="pending">대기</option>
            <option value="reviewed">완료</option>
          </select>
          <label className="text-sm">공개범위</label>
          <select className="border rounded px-2 py-1" value={visibility} onChange={e=>setVisibility(e.target.value as any)}>
            <option value="private">비공개</option>
            <option value="center">센터</option>
            <option value="public">공개</option>
          </select>
          <button className="px-3 py-1 border rounded" onClick={load}>적용</button>
        </div>
        {loading && <p>로딩중...</p>}
        {error && <p className="text-red-600">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((v) => (
            <div key={v._id} className="border rounded p-4 space-y-1">
              <div className="font-medium">{v.originalName}</div>
              <div className="text-sm text-gray-600">{v.mimetype} · {(v.size/1024/1024).toFixed(1)}MB</div>
              <div className="text-xs text-gray-500">업로드: {new Date(v.createdAt).toLocaleString()}</div>
              <div className="flex gap-2 pt-2">
                <a
                  className="text-blue-600 hover:underline text-sm"
                  href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/uploads/${v._id}/download`}
                  target="_blank"
                >다운로드</a>
                <button onClick={() => onReview(v._id)} className="px-3 py-1 border rounded text-sm">리뷰 완료</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


