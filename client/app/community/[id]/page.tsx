'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

interface Post { 
  _id: string; 
  title: string; 
  content: string; 
  author?: any; 
  tags?: string[]; 
  category?: string;
  createdAt?: string;
  likes?: number;
  views?: number;
}

interface Comment { 
  _id: string; 
  content: string; 
  author?: any; 
  createdAt?: string;
  likes?: number;
}

function CommunityPostDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const postId = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        apiClient.get(`/community/posts/${postId}`),
        apiClient.get(`/community/posts/${postId}/comments`),
      ]);
      
      if (p.error) {
        setError(p.error);
      } else {
        setPost((p.data as any)?.post || p.data || null);
      }
      
      if (!c.error) {
        setComments((c.data as any)?.comments || []);
      }
    } catch (err) {
      console.error('게시글 로드 실패:', err);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (postId) load(); 
  }, [postId]);

  const submitComment = async () => {
    if (!commentText.trim()) return;
    
    setSubmittingComment(true);
    try {
      const res = await apiClient.post(`/community/posts/${postId}/comments`, { 
        content: commentText.trim() 
      });
      
      if (res.error) {
        alert(res.error);
        return;
      }
      
      setCommentText('');
      await load(); // 댓글 목록 새로고침
    } catch (error) {
      console.error('댓글 등록 실패:', error);
      alert('댓글 등록에 실패했습니다.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    
    try {
      const res = await apiClient.delete(`/community/posts/${postId}`);
      if (res.error) {
        alert(res.error);
        return;
      }
      
      alert('게시글이 삭제되었습니다.');
      router.push('/community');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)}일 전`;
    return date.toLocaleDateString();
  };

  const getCategoryInfo = (category: string) => {
    const categories: {[key: string]: {label: string, color: string, icon: string}} = {
      '자유형': { label: '자유형', color: 'bg-blue-100 text-blue-800', icon: '🏊‍♂️' },
      '평영': { label: '평영', color: 'bg-green-100 text-green-800', icon: '🐸' },
      '배영': { label: '배영', color: 'bg-purple-100 text-purple-800', icon: '🦋' },
      '접영': { label: '접영', color: 'bg-orange-100 text-orange-800', icon: '🦅' },
      '호흡법': { label: '호흡법', color: 'bg-red-100 text-red-800', icon: '🫁' },
      '기타': { label: '기타', color: 'bg-gray-100 text-gray-800', icon: '💬' }
    };
    return categories[category] || categories['기타'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">게시글을 불러오는 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <div className="text-2xl font-bold text-red-700 mb-4">
              {error || '게시글을 불러오지 못했습니다.'}
            </div>
            <Link 
              href="/community"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
            >
              ← 커뮤니티로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = getCategoryInfo(post.category || '기타');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-4xl mx-auto p-6">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link 
            href="/community"
            className="inline-flex items-center px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium shadow-sm"
          >
            <img src="/swim-icon.png" alt="뒤로가기" className="w-4 h-4 mr-2" />
            커뮤니티 목록
          </Link>
        </div>

        {/* 게시글 내용 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {/* 게시글 헤더 */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}>
                  {categoryInfo.icon} {categoryInfo.label}
                </span>
                <span className="text-sm text-gray-500">
                  {post.createdAt ? getTimeAgo(post.createdAt) : ''}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {post.title}
              </h1>
              {post.author && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {post.author.name?.[0] || post.author.userId?.[0] || '?'}
                    </span>
                  </div>
                  <span className="font-medium">
                    {post.author.name || post.author.userId || '익명'}
                  </span>
                </div>
              )}
            </div>
            
            {/* 게시글 액션 버튼 */}
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                👍 {post.likes || 0}
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                👁️ {post.views || 0}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-red-400 hover:text-red-600 transition-colors"
                title="게시글 삭제"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* 게시글 본문 */}
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
              {post.content}
            </div>
          </div>

          {/* 태그 */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            💬 댓글 ({comments.length})
          </h2>

          {/* 댓글 목록 */}
          <div className="space-y-6 mb-8">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="border-b border-gray-100 last:border-b-0 pb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-semibold text-sm">
                        {comment.author?.name?.[0] || comment.author?.userId?.[0] || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.author?.name || comment.author?.userId || '익명'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {comment.createdAt ? getTimeAgo(comment.createdAt) : ''}
                        </span>
                      </div>
                      <div className="text-gray-700 leading-relaxed">
                        {comment.content}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                          👍 {comment.likes || 0}
                        </button>
                        <button className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                          💬 답글
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-gray-500 text-lg mb-2">아직 댓글이 없습니다.</div>
                <div className="text-gray-400">첫 번째 댓글을 남겨보세요!</div>
              </div>
            )}
          </div>

          {/* 댓글 작성 폼 */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">댓글 작성</h3>
            <div className="flex gap-3">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="댓글을 입력하세요..."
                rows={3}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                disabled={submittingComment}
              />
              <button 
                onClick={submitComment}
                disabled={!commentText.trim() || submittingComment}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                {submittingComment ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    등록 중...
                  </span>
                ) : (
                  '댓글 등록'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-red-600 mb-4">⚠️ 게시글 삭제</h3>
              <p className="text-gray-700 mb-6">
                <strong>"{post.title}"</strong> 게시글을 정말로 삭제하시겠습니까?<br />
                이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeletePost}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                >
                  삭제
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors font-semibold"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CommunityPostDetailPage);






































