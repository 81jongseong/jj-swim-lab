/**
 * 📋 JJ Swim Lab - 강사 리뷰 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사가 업로드된 동영상(유튜브 링크)을 리뷰하는 페이지
 * - 유튜브 링크 기반으로 변경됨 (파일 업로드 방식 제거)
 * 
 * 🗄️ **데이터 연동**
 * - GET /api/uploads/admin/review-queue/list - 리뷰 대기 목록 조회
 * - PATCH /api/uploads/:id/review - 리뷰 완료 처리
 */

'use client';

import { useEffect, useState } from 'react';

export default function InstructorReviewsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [status, setStatus] = useState<'pending'|'reviewed'>('pending');
  const [visibility, setVisibility] = useState<'private'|'center'|'public'>('private');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/uploads/admin/review-queue/list?status=${status}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '리뷰 목록 조회 실패');
      }

      const result = await response.json();
      setItems(result.items || []);
    } catch (err: any) {
      console.error('리뷰 목록 조회 실패:', err);
      setError(err.message || '리뷰 목록을 불러올 수 없습니다.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    // 유튜브 URL을 임베드 URL로 변환
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const onReview = async (id: string) => {
    const feedback = prompt('피드백 입력') || '';
    if (!feedback.trim()) {
      alert('피드백을 입력해주세요.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/uploads/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'reviewed',
          feedback,
          visibility
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '리뷰 처리 실패');
      }

      alert('리뷰가 완료되었습니다.');
      load();
    } catch (err: any) {
      console.error('리뷰 처리 실패:', err);
      alert(err.message || '리뷰 처리에 실패했습니다.');
    }
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
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">로딩 중...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">리뷰 대기 중인 동영상이 없습니다.</p>
          </div>
        )}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((v) => (
              <div key={v._id} className="border rounded-lg p-4 bg-white shadow hover:shadow-md transition-shadow space-y-3">
                <div>
                  <div className="font-medium text-gray-900 mb-1">{v.title || '제목 없음'}</div>
                  {v.description && (
                    <div className="text-sm text-gray-600 line-clamp-2">{v.description}</div>
                  )}
                </div>
                {v.youtubeUrl && (
                  <div className="aspect-video bg-gray-900 rounded overflow-hidden">
                    <iframe
                      src={getYoutubeEmbedUrl(v.youtubeUrl)}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  업로드: {new Date(v.createdAt).toLocaleString()}
                </div>
                {v.owner && (
                  <div className="text-xs text-gray-500">
                    작성자: {typeof v.owner === 'object' ? v.owner.name : '알 수 없음'}
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t">
                  {v.youtubeUrl && (
                    <a
                      className="text-blue-600 hover:underline text-sm"
                      href={v.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      유튜브 보기
                    </a>
                  )}
                  <button 
                    onClick={() => onReview(v._id)} 
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    리뷰 완료
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


