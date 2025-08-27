'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/utils/api';

interface Post { 
  _id: string; 
  title: string; 
  content: string; 
  author?: any; 
  tags?: string[]; 
  createdAt?: string;
  likes?: number;
  comments?: number;
  views?: number;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { id: '자유형', label: '🏊‍♂️ 자유형', color: 'bg-blue-100 text-blue-800' },
    { id: '평영', label: '🐸 평영', color: 'bg-green-100 text-green-800' },
    { id: '배영', label: '🦋 배영', color: 'bg-purple-100 text-purple-800' },
    { id: '접영', label: '🦅 접영', color: 'bg-orange-100 text-orange-800' },
    { id: '호흡법', label: '🫁 호흡법', color: 'bg-red-100 text-red-800' },
    { id: '기타', label: '💬 기타', color: 'bg-gray-100 text-gray-800' }
  ];

  const load = async () => {
    setLoading(true);
    const params: any = {};
    if (q) params.q = q; 
    if (tag) params.tag = tag;
    if (selectedCategory) params.category = selectedCategory;
    
    try {
      const res = await apiClient.getCommunityPosts(params);
      console.log('🔍 API 응답:', res);
      if (res.error) {
        setError(res.error);
      } else {
        setPosts((res.data as any)?.posts || res.data || []);
      }
    } catch (err) {
      console.error('커뮤니티 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    load();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setTimeout(() => load(), 100);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-7xl mx-auto p-6">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            <img src="/swim-icon.png" alt="수영" className="inline-block w-12 h-12 mr-3" />
            JJ Swim Lab 커뮤니티
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            수영에 대한 궁금한 점을 물어보고, 경험을 공유하며, 함께 성장해나가는 공간입니다.
          </p>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input 
                value={q} 
                onChange={(e) => setQ(e.target.value)} 
                placeholder="🔍 제목, 내용, 작성자로 검색..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div className="flex-1 relative">
              <input 
                value={tag} 
                onChange={(e) => setTag(e.target.value)} 
                placeholder="🏷️ 태그로 검색..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <button 
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
            >
              검색
            </button>
          </form>

          {/* 카테고리 필터 */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'ring-2 ring-blue-500 shadow-md scale-105'
                    : 'hover:scale-105 hover:shadow-md'
                } ${category.color}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 새 게시글 작성 버튼 */}
        <div className="flex justify-end mb-6">
          <Link 
            href="/community/new"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <img src="/swim-icon.png" alt="작성" className="w-5 h-5 mr-2" />
            새 게시글 작성
          </Link>
        </div>

        {/* 로딩 및 에러 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-lg text-gray-600">커뮤니티를 불러오는 중...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-700 text-lg">⚠️ {error}</div>
            <button 
              onClick={load}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 게시글 목록 */}
        {!loading && !error && (
          <div className="space-y-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link 
                  key={post._id} 
                  href={`/community/${post._id}`}
                  className="block group"
                >
                  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                            {post.content}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-sm text-gray-500 mb-1">
                            {post.createdAt ? getTimeAgo(post.createdAt) : ''}
                          </div>
                          {post.author && (
                            <div className="text-sm font-medium text-gray-700">
                              <img src="/swim-icon.png" alt="사용자" className="inline-block w-4 h-4 mr-1" />
                              {post.author.name || post.author.userId || '익명'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 태그 */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <span 
                              key={index} 
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* 게시글 통계 */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <img src="/swim-icon.png" alt="좋아요" className="w-4 h-4 mr-1" />
                            {post.likes || 0}
                          </span>
                          <span className="flex items-center">
                            <img src="/swim-icon.png" alt="댓글" className="w-4 h-4 mr-1" />
                            {post.comments || 0}
                          </span>
                          <span className="flex items-center">
                            <img src="/swim-icon.png" alt="조회수" className="w-4 h-4 mr-1" />
                            {post.views || 0}
                          </span>
                        </div>
                        <div className="text-sm text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                          자세히 보기 →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="mb-4">
                  <img src="/swim-icon.png" alt="수영" className="inline-block w-24 h-24" />
                </div>
                <div className="text-2xl font-bold text-gray-700 mb-2">
                  {q || tag || selectedCategory ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
                </div>
                <div className="text-gray-500 mb-6">
                  {q || tag || selectedCategory 
                    ? '다른 검색어를 시도해보세요.' 
                    : '첫 번째 게시글을 작성해보세요!'
                  }
                </div>
                {!q && !tag && !selectedCategory && (
                  <Link 
                    href="/community/new"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
                  >
                    <img src="/swim-icon.png" alt="작성" className="w-5 h-5 mr-2" />
                    첫 게시글 작성하기
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* 초기화 버튼 */}
        {(q || tag || selectedCategory) && (
          <div className="text-center mt-8">
            <button 
              onClick={() => {
                setQ('');
                setTag('');
                setSelectedCategory('');
                setTimeout(() => load(), 100);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              <img src="/swim-icon.png" alt="초기화" className="inline-block w-4 h-4 mr-2" />
              모든 필터 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


