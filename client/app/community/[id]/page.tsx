'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

interface Post { _id: string; title: string; content: string; author?: any; tags?: string[]; createdAt?: string }
interface Comment { _id: string; content: string; author?: any; createdAt?: string }

function CommunityPostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');

  const load = async () => {
    setLoading(true);
    const [p, c] = await Promise.all([
      apiClient.get(`/community/posts/${postId}`),
      apiClient.get(`/community/posts/${postId}/comments`),
    ]);
    if (p.error) setError(p.error); else setPost((p.data as any)?.post || null);
    if (!c.error) setComments((c.data as any)?.comments || []);
    setLoading(false);
  };

  useEffect(() => { if (postId) load(); }, [postId]);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    const res = await apiClient.post(`/community/posts/${postId}/comments`, { content: commentText.trim() });
    if (res.error) return alert(res.error);
    setCommentText('');
    await load();
  };

  if (loading) return <div className="min-h-screen bg-gray-50 pt-16"><div className="max-w-3xl mx-auto p-6">로딩 중...</div></div>;
  if (error || !post) return <div className="min-h-screen bg-gray-50 pt-16"><div className="max-w-3xl mx-auto p-6 text-red-700">{error || '게시글을 불러오지 못했습니다.'}</div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <span className="text-xs text-gray-500">{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</span>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {(post.tags||[]).map((t,i)=>(<span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded">#{t}</span>))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-3">댓글</h2>
          <div className="space-y-3">
            {comments.map(cm => (
              <div key={cm._id} className="border-b last:border-b-0 pb-3">
                <div className="text-sm text-gray-900">{cm.author?.name || cm.author?.userId || '익명'}</div>
                <div className="text-sm text-gray-700">{cm.content}</div>
                <div className="text-xs text-gray-500">{cm.createdAt ? new Date(cm.createdAt).toLocaleString() : ''}</div>
              </div>
            ))}
            {comments.length === 0 && <div className="text-sm text-gray-500">첫 댓글을 남겨보세요.</div>}
          </div>
          <div className="mt-4 flex gap-2">
            <input value={commentText} onChange={(e)=>setCommentText(e.target.value)} placeholder="댓글을 입력하세요" className="flex-1 px-3 py-2 border rounded" />
            <button onClick={submitComment} className="px-4 py-2 bg-blue-600 text-white rounded">등록</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CommunityPostDetailPage, { requireTypes: ['student','instructor','centerAdmin','superAdmin'], requirePermission: null });



































































