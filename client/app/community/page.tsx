'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

/**
 * 🏘️ 커뮤니티 페이지
 * 
 * 📋 **기능**
 * - 수영 커뮤니티 게시글 조회 및 작성
 * - 사용자 간 소통 및 정보 공유
 * - 수영 관련 질문과 답변
 * 
 * 🔄 **주요 기능**
 * 1. 게시글 목록 조회
 * 2. 새 게시글 작성
 * 3. 댓글 시스템
 * 4. 카테고리별 필터링
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 커뮤니티 페이지 생성
 */

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    name: string;
    userId: string;
  };
  category: string;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
}

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general'
  });

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'general', label: '일반' },
    { value: 'question', label: '질문' },
    { value: 'tip', label: '팁' },
    { value: 'review', label: '후기' },
    { value: 'event', label: '이벤트' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // 실제 API 호출 대신 임시 데이터 사용
      const mockPosts: Post[] = [
        {
          _id: '1',
          title: '초보자를 위한 수영 기본기',
          content: '수영을 처음 시작하는 분들을 위한 기본기 가이드입니다...',
          author: { name: '김수영', userId: 'swim_01' },
          category: 'tip',
          likes: 15,
          comments: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: '자유형 호흡법 질문',
          content: '자유형에서 호흡을 어떻게 해야 할까요?',
          author: { name: '이초보', userId: 'beginner_01' },
          category: 'question',
          likes: 5,
          comments: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setPosts(mockPosts);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      // 실제 API 호출 대신 로컬 상태 업데이트
      const newPostData: Post = {
        _id: Date.now().toString(),
        title: newPost.title,
        content: newPost.content,
        author: { name: user.name, userId: user.userId },
        category: newPost.category,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setPosts(prev => [newPostData, ...prev]);
      setNewPost({ title: '', content: '', category: 'general' });
      setIsFormOpen(false);
      
      alert('게시글이 작성되었습니다.');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
      alert('게시글 작성에 실패했습니다.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">🏘️ 수영 커뮤니티</h1>
          <p className="mt-2 text-gray-600">
            수영에 대한 정보를 공유하고 다른 수영인들과 소통해보세요.
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="게시글 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              ✍️ 글쓰기
            </Button>
          </div>
        </div>

        {/* 게시글 목록 */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post._id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{post.content}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ml-4 ${
                    post.category === 'question' ? 'bg-blue-100 text-blue-800' :
                    post.category === 'tip' ? 'bg-green-100 text-green-800' :
                    post.category === 'review' ? 'bg-yellow-100 text-yellow-800' :
                    post.category === 'event' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {categories.find(c => c.value === post.category)?.label || post.category}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>👤 {post.author.name}</span>
                    <span>📅 {formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span>👍 {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              {posts.length === 0 ? '등록된 게시글이 없습니다.' : '검색 결과가 없습니다.'}
            </div>
          </div>
        )}

        {/* 게시글 작성 모달 */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">새 게시글 작성</h3>
                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmitPost} className="space-y-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리
                    </label>
                    <select
                      id="category"
                      value={newPost.category}
                      onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.filter(c => c.value !== 'all').map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      제목 *
                    </label>
                    <Input
                      id="title"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="게시글 제목을 입력하세요"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                      내용 *
                    </label>
                    <textarea
                      id="content"
                      value={newPost.content}
                      onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="게시글 내용을 입력하세요"
                      rows={6}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsFormOpen(false)}
                    >
                      취소
                    </Button>
                    <Button type="submit">
                      작성
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}