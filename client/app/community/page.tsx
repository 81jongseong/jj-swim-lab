'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui';
// Tabs 컴포넌트 대신 커스텀 탭 버튼 사용

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
 * 5. 📑 탭 기반 카테고리 구분 (신규 추가)
 * 6. 🎨 향상된 UI/UX (신규 추가)
 * 
 * 📅 **수정 히스토리**
 * - 2025-01-13: 커뮤니티 페이지 생성
 * - 2025-09-18: 탭 기반 카테고리 구분 및 UI 개선
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
  // 번개모임 전용 필드 추가
  meetupDetails?: {
    location: string;
    date: string;
    time: string;
    strokeType: string; // 영법
    distance: string; // 거리
    pace: string; // 페이스
    maxParticipants: number; // 최대 인원
    currentParticipants: number; // 현재 참가자
    cost: number; // 비용
    level: string; // 레벨
  };
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
    category: 'general',
    meetupDetails: {
      location: '',
      date: '',
      time: '',
      strokeType: '',
      distance: '',
      pace: '',
      maxParticipants: 6,
      cost: 0,
      level: ''
    }
  });

  // 탭 기반 카테고리 구조로 개선 (번개모임 추가)
  const categories = [
    { value: 'all', label: '전체', icon: '🏠', description: '모든 게시글' },
    { value: 'tip', label: '팁', icon: '💡', description: '수영 꿀팁 공유' },
    { value: 'question', label: 'Q&A', icon: '❓', description: '궁금한 것들' },
    { value: 'review', label: '후기', icon: '⭐', description: '수강 후기' },
    { value: 'meetup', label: '번개모임', icon: '⚡', description: '즉석 수영 모임' },
    { value: 'event', label: '이벤트', icon: '🎉', description: '대회 & 행사' },
    { value: 'general', label: '자유', icon: '💬', description: '자유로운 이야기' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // 실제 API 호출 대신 풍부한 샘플 데이터 사용
      const mockPosts: Post[] = [
        {
          _id: '1',
          title: '💡 자유형 호흡법 완전 정복 가이드',
          content: '자유형 호흡법을 마스터하는 단계별 가이드입니다. 초보자도 쉽게 따라할 수 있어요!\n\n1️⃣ 기본 자세: 머리는 물속에, 시선은 바닥\n2️⃣ 호흡 타이밍: 팔이 물에서 나올 때 고개 돌리기\n3️⃣ 연습 방법: 킥보드로 호흡 연습',
          author: { name: '김강사', userId: 'instructor_01' },
          category: 'tip',
          likes: 89,
          comments: 24,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          title: '⭐ JJ Swim Lab 3개월 수강 완전 후기',
          content: 'JJ Swim Lab에서 3개월 동안 수업을 듣고 정말 많이 늘었어요! AI 자세 분석이 특히 도움이 됐습니다.\n\n✅ 실력 향상: 자유형 25m → 1000m 연속 가능\n✅ 자세 점수: 60점 → 85점\n✅ 호흡법 완전 마스터\n\n강력 추천합니다! 🏊‍♀️',
          author: { name: '이학생', userId: 'student_01' },
          category: 'review',
          likes: 42,
          comments: 18,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          title: '❓ 접영 킥 동작이 어려워요',
          content: '접영 킥을 연습하고 있는데 물살이 잘 안 생겨요. 어떤 점을 주의해야 할까요?\n\n현재 주 3회 연습하고 있고, 다른 영법은 어느 정도 할 수 있습니다.',
          author: { name: '정초보', userId: 'beginner_02' },
          category: 'question',
          likes: 12,
          comments: 28,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '4',
          title: '🏆 2025 JJ Swim Lab 챔피언십 참가자 모집',
          content: '연례 수영 대회를 개최합니다!\n\n📅 일시: 2025년 10월 15일 오전 9시\n📍 장소: JJ Swim Lab 메인 센터\n🏊‍♂️ 종목: 자유형, 배영, 평영, 접영\n💰 참가비: 무료\n🎁 시상: 종목별 메달 및 상품\n\n많은 참여 부탁드립니다!',
          author: { name: '박관리자', userId: 'admin_01' },
          category: 'event',
          likes: 67,
          comments: 35,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '5',
          title: '⚡ 오늘 저녁 번개 수영 모임 (잠실)',
          content: '오늘 저녁 7시에 잠실 수영장에서 자유형 연습하실 분 모집합니다!\n\n📍 장소: 잠실 수영장 3층\n⏰ 시간: 오늘 19:00-20:30\n🏊‍♂️ 레벨: 초급-중급 환영\n💰 비용: 1인당 8,000원 (레인비 분할)\n\n참가 희망자는 댓글로!',
          author: { name: '김수영', userId: 'swim_01' },
          category: 'meetup',
          likes: 25,
          comments: 15,
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          meetupDetails: {
            location: '잠실 수영장 3층',
            date: new Date().toISOString().split('T')[0],
            time: '19:00-20:30',
            strokeType: '자유형',
            distance: '1000m',
            pace: '자유 페이스',
            maxParticipants: 6,
            currentParticipants: 3,
            cost: 8000,
            level: '초급-중급'
          }
        },
        {
          _id: '6',
          title: '⚡ 주말 새벽 수영 번개 (강남)',
          content: '이번 주 토요일 새벽 6시 강남 수영장에서 번개 모임 합니다!\n\n📍 장소: 강남 스포츠센터 수영장\n⏰ 시간: 토요일 06:00-07:30\n🏊‍♂️ 레벨: 중급 이상\n💪 목표: 지구력 향상 훈련\n💰 비용: 1인당 10,000원\n\n새벽 운동으로 하루를 상쾌하게 시작해요!',
          author: { name: '박새벽', userId: 'early_bird' },
          category: 'meetup',
          likes: 18,
          comments: 12,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          meetupDetails: {
            location: '강남 스포츠센터 수영장',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 이번 주 토요일
            time: '06:00-07:30',
            strokeType: '자유형',
            distance: '1500m',
            pace: '중급 페이스 (1:45/100m)',
            maxParticipants: 8,
            currentParticipants: 5,
            cost: 10000,
            level: '중급 이상'
          }
        },
        {
          _id: '7',
          title: '⚡ 평영 마스터 번개 클래스 (송파)',
          content: '평영 기술 향상을 위한 번개 클래스를 진행합니다!\n\n📍 장소: 송파 구민 수영장\n⏰ 시간: 내일 20:00-21:30\n🏊‍♂️ 레벨: 평영 기초 가능자\n👨‍🏫 강사: 김코치 (평영 전문)\n💰 비용: 1인당 15,000원\n\n평영 킥과 팔 동작을 완벽하게 마스터해보세요!',
          author: { name: '김코치', userId: 'coach_kim' },
          category: 'meetup',
          likes: 31,
          comments: 8,
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          meetupDetails: {
            location: '송파 구민 수영장',
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 내일
            time: '20:00-21:30',
            strokeType: '평영',
            distance: '800m',
            pace: '기술 중심 (페이스 무관)',
            maxParticipants: 4,
            currentParticipants: 2,
            cost: 15000,
            level: '평영 기초 가능자'
          }
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
        updatedAt: new Date().toISOString(),
        // 번개모임인 경우 상세 정보 추가
        meetupDetails: newPost.category === 'meetup' ? {
          ...newPost.meetupDetails,
          currentParticipants: 1 // 생성자가 첫 참가자
        } : undefined
      };

      setPosts(prev => [newPostData, ...prev]);
      setNewPost({ 
        title: '', 
        content: '', 
        category: 'general',
        meetupDetails: {
          location: '',
          date: '',
          time: '',
          strokeType: '',
          distance: '',
          pace: '',
          maxParticipants: 6,
          cost: 0,
          level: ''
        }
      });
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

        {/* 검색 및 글쓰기 */}
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
            <Button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
            >
              ✍️ 글쓰기
            </Button>
          </div>
        </div>

        {/* 탭 기반 카테고리 구분 - 개선된 UI */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
            {categories.map(category => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex flex-col items-center gap-2 px-3 py-4 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium text-center">
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 선택된 카테고리의 설명 */}
        <div className="mb-6">
          {categories.map(category => (
            selectedCategory === category.value && (
              <div key={category.value} className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="font-semibold text-blue-900">{category.label}</h3>
                    <p className="text-sm text-blue-700">{category.description}</p>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
        {/* 선택된 카테고리의 게시글 목록 */}
        <div className="space-y-4">
          {filteredPosts
            .filter(post => selectedCategory === 'all' || post.category === selectedCategory)
            .map((post) => (
              <Card key={post._id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-3">{post.content}</p>
                      
                      {/* 번개모임 상세 정보 표시 */}
                      {post.category === 'meetup' && post.meetupDetails && (
                        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center text-gray-700">
                              <span className="text-orange-500 mr-1">📍</span>
                              <span className="font-medium">장소:</span>
                              <span className="ml-1 truncate">{post.meetupDetails.location}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-orange-500 mr-1">⏰</span>
                              <span className="font-medium">시간:</span>
                              <span className="ml-1">{post.meetupDetails.time}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-orange-500 mr-1">🏊‍♂️</span>
                              <span className="font-medium">영법:</span>
                              <span className="ml-1">{post.meetupDetails.strokeType}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-orange-500 mr-1">📏</span>
                              <span className="font-medium">거리:</span>
                              <span className="ml-1">{post.meetupDetails.distance}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-orange-500 mr-1">⚡</span>
                              <span className="font-medium">페이스:</span>
                              <span className="ml-1 truncate">{post.meetupDetails.pace}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-orange-500 mr-1">👥</span>
                              <span className="font-medium">인원:</span>
                              <span className="ml-1">{post.meetupDetails.currentParticipants}/{post.meetupDetails.maxParticipants}</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-orange-500 mr-1">💰</span>
                              <span className="font-medium">비용:</span>
                              <span className="ml-1">{post.meetupDetails.cost.toLocaleString()}원</span>
                            </div>
                            <div className="flex items-center text-gray-700">
                              <span className="text-orange-500 mr-1">🎯</span>
                              <span className="font-medium">레벨:</span>
                              <span className="ml-1 truncate">{post.meetupDetails.level}</span>
                            </div>
                          </div>
                          
                          {/* 참가 신청 버튼 */}
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="mr-2">참가 가능:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                post.meetupDetails.currentParticipants >= post.meetupDetails.maxParticipants
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {post.meetupDetails.currentParticipants >= post.meetupDetails.maxParticipants ? '마감' : '모집중'}
                              </span>
                            </div>
                            {user && post.meetupDetails.currentParticipants < post.meetupDetails.maxParticipants && (
                              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                                참가 신청
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ml-4 flex-shrink-0 ${
                      post.category === 'question' ? 'bg-blue-100 text-blue-800' :
                      post.category === 'tip' ? 'bg-green-100 text-green-800' :
                      post.category === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      post.category === 'event' ? 'bg-purple-100 text-purple-800' :
                      post.category === 'meetup' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {categories.find(c => c.value === post.category)?.icon} {categories.find(c => c.value === post.category)?.label}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center gap-1">👤 {post.author.name}</span>
                      <span className="flex items-center gap-1">📅 {formatDate(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center gap-1">👍 {post.likes}</span>
                      <span className="flex items-center gap-1">💬 {post.comments}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>

        {/* 빈 상태 표시 */}
        {filteredPosts.filter(post => selectedCategory === 'all' || post.category === selectedCategory).length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <span className="text-6xl mb-4 block">
                {categories.find(c => c.value === selectedCategory)?.icon || '📝'}
              </span>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedCategory === 'all' ? '아직 게시글이 없어요' : `${categories.find(c => c.value === selectedCategory)?.label} 게시글이 없어요`}
              </h3>
              <p className="text-gray-600 mb-4">
                {categories.find(c => c.value === selectedCategory)?.description}에 관한 첫 번째 글을 작성해보세요!
              </p>
              {user && (
                <Button 
                  onClick={() => {
                    setNewPost(prev => ({ ...prev, category: selectedCategory === 'all' ? 'general' : selectedCategory }));
                    setIsFormOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  첫 글 작성하기
                </Button>
              )}
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

                  {/* 번개모임 상세 정보 입력 */}
                  {newPost.category === 'meetup' && (
                    <div className="border-t pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <span className="text-orange-500 mr-2">⚡</span>
                        번개모임 상세 정보
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            장소 *
                          </label>
                          <Input
                            value={newPost.meetupDetails.location}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, location: e.target.value }
                            }))}
                            placeholder="예: 잠실 수영장 3층"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            날짜 *
                          </label>
                          <Input
                            type="date"
                            value={newPost.meetupDetails.date}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, date: e.target.value }
                            }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            시간 *
                          </label>
                          <Input
                            value={newPost.meetupDetails.time}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, time: e.target.value }
                            }))}
                            placeholder="예: 19:00-20:30"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            영법 *
                          </label>
                          <select
                            value={newPost.meetupDetails.strokeType}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, strokeType: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">선택하세요</option>
                            <option value="자유형">자유형</option>
                            <option value="배영">배영</option>
                            <option value="평영">평영</option>
                            <option value="접영">접영</option>
                            <option value="자유형+배영">자유형+배영</option>
                            <option value="평영+접영">평영+접영</option>
                            <option value="혼영">혼영</option>
                            <option value="자유 선택">자유 선택</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            거리 *
                          </label>
                          <Input
                            value={newPost.meetupDetails.distance}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, distance: e.target.value }
                            }))}
                            placeholder="예: 1000m"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            페이스 *
                          </label>
                          <select
                            value={newPost.meetupDetails.pace}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, pace: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">선택하세요</option>
                            <option value="여유롭게 (2:30/100m)">여유롭게 (2:30/100m)</option>
                            <option value="보통 페이스 (2:00/100m)">보통 페이스 (2:00/100m)</option>
                            <option value="빠르게 (1:45/100m)">빠르게 (1:45/100m)</option>
                            <option value="경기 페이스 (1:30/100m)">경기 페이스 (1:30/100m)</option>
                            <option value="테크닉 중심">테크닉 중심</option>
                            <option value="지구력 훈련">지구력 훈련</option>
                            <option value="자유 페이스">자유 페이스</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            최대 인원 *
                          </label>
                          <Input
                            type="number"
                            min="2"
                            max="20"
                            value={String(newPost.meetupDetails.maxParticipants)}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, maxParticipants: parseInt(e.target.value) }
                            }))}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            비용 (원)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={String(newPost.meetupDetails.cost)}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, cost: parseInt(e.target.value) || 0 }
                            }))}
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            레벨 *
                          </label>
                          <select
                            value={newPost.meetupDetails.level}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, level: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">선택하세요</option>
                            <option value="초급">초급 (수영 기초 가능)</option>
                            <option value="초급-중급">초급-중급 (25m 연속 가능)</option>
                            <option value="중급">중급 (100m 연속 가능)</option>
                            <option value="중급-고급">중급-고급 (500m 연속 가능)</option>
                            <option value="고급">고급 (1000m+ 연속 가능)</option>
                            <option value="전문가">전문가 (경기 경험)</option>
                            <option value="누구나">누구나 환영</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

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