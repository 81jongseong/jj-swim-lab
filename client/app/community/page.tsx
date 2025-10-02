'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
// UI 컴포넌트를 HTML 요소로 교체하여 Element type is invalid 오류 방지
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
  isBlinded?: boolean; // 블라인드 처리 여부
  reportCount?: number; // 신고 횟수
  warnings?: number; // 경고 횟수
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

  // 디버깅용
  useEffect(() => {
    console.log('🔍 커뮤니티 페이지 - 사용자:', user);
    console.log('🔍 isFormOpen:', isFormOpen);
  }, [user, isFormOpen]);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [communityRules, setCommunityRules] = useState({
    title: '커뮤니티 운영 규칙',
    rules: [
      '존중과 배려: 모든 회원을 존중하고 예의를 지켜주세요',
      '욕설 및 비방 금지: 욕설, 비방, 차별적 표현은 엄격히 금지됩니다',
      '광고 및 홍보 금지: 무분별한 광고나 영리 목적의 게시물은 삭제됩니다',
      '개인정보 보호: 타인의 개인정보를 무단으로 공유하지 마세요',
      '적절한 카테고리 사용: 게시글은 적절한 카테고리에 작성해주세요'
    ],
    penalties: [
      '1차 위반: 경고 메시지 발송',
      '2차 위반: 게시글 블라인드 처리',
      '3차 위반: 7일 커뮤니티 이용 정지',
      '4차 이상: 영구 이용 정지'
    ]
  });
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
      
      // 실제 API 호출
      const response = await fetch('http://localhost:5000/api/community/posts');
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
        setLoading(false);
        return;
      }
      
      // API 실패 시 샘플 데이터 사용
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

  // 최고 관리자 기능
  const handleDeletePost = async (postId: string) => {
    if (!confirm('이 게시글을 완전히 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('✅ 게시글이 삭제되었습니다.');
        // 로컬에서도 즉시 제거
        setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
      } else {
        const data = await response.json();
        alert(`삭제 실패: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      // API가 없어도 로컬에서 제거 (임시)
      setPosts(prevPosts => prevPosts.filter(p => p._id !== postId));
      alert('⚠️ 게시글이 임시로 삭제되었습니다 (API 미연결)');
    }
  };

  const handleBlindPost = async (postId: string) => {
    if (!confirm('이 게시글을 블라인드 처리하시겠습니까?\n\n일반 사용자에게는 보이지 않게 됩니다.')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/blind`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('✅ 게시글이 블라인드 처리되었습니다.');
        // 로컬에서도 즉시 반영
        setPosts(prevPosts => prevPosts.map(p => 
          p._id === postId ? { ...p, isBlinded: true } : p
        ));
      } else {
        const data = await response.json();
        alert(`블라인드 실패: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('블라인드 오류:', error);
      // API가 없어도 로컬에서 처리 (임시)
      setPosts(prevPosts => prevPosts.map(p => 
        p._id === postId ? { ...p, isBlinded: true } : p
      ));
      alert('⚠️ 게시글이 임시로 블라인드 처리되었습니다 (API 미연결)');
    }
  };

  const handleWarnAuthor = async (postId: string, authorId: string) => {
    const reason = prompt('⚠️ 경고 사유를 입력하세요:\n\n예시: 욕설 사용, 부적절한 표현, 광고성 게시글');
    if (!reason || reason.trim() === '') {
      alert('경고 사유를 입력해야 합니다.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/warn`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ authorId, reason })
      });

      if (response.ok) {
        alert(`✅ 작성자에게 경고가 발송되었습니다.\n\n사유: ${reason}`);
        // 로컬에서도 즉시 반영
        setPosts(prevPosts => prevPosts.map(p => 
          p._id === postId ? { ...p, warnings: (p.warnings || 0) + 1 } : p
        ));
      } else {
        const data = await response.json();
        alert(`경고 발송 실패: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('경고 발송 오류:', error);
      // API가 없어도 로컬에서 처리 (임시)
      setPosts(prevPosts => prevPosts.map(p => 
        p._id === postId ? { ...p, warnings: (p.warnings || 0) + 1 } : p
      ));
      alert(`⚠️ 경고가 임시로 처리되었습니다 (API 미연결)\n\n사유: ${reason}`);
    }
  };

  const handleSaveRules = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/community/rules', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(communityRules)
      });

      if (response.ok) {
        alert('커뮤니티 규칙이 저장되었습니다.');
        setShowRulesModal(false);
      }
    } catch (error) {
      console.error('규칙 저장 오류:', error);
      alert('규칙 저장 중 오류가 발생했습니다.');
    }
  };

  const handleJoinMeetup = async (postId: string) => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    const post = posts.find(p => p._id === postId);
    if (!post?.meetupDetails) return;

    if (!confirm(`🏊‍♂️ 번개모임 참가 신청\n\n📍 장소: ${post.meetupDetails.location}\n⏰ 시간: ${post.meetupDetails.time}\n💰 비용: ${post.meetupDetails.cost.toLocaleString()}원\n\n참가하시겠습니까?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user._id || user.id,
          userName: user.name
        })
      });

      if (response.ok) {
        alert('✅ 번개모임 참가 신청이 완료되었습니다!\n\n주최자가 연락처를 공유할 예정입니다.');
        // 로컬에서도 즉시 반영
        setPosts(prevPosts => prevPosts.map(p => {
          if (p._id === postId && p.meetupDetails) {
            return {
              ...p,
              meetupDetails: {
                ...p.meetupDetails,
                currentParticipants: p.meetupDetails.currentParticipants + 1
              }
            };
          }
          return p;
        }));
      } else {
        const data = await response.json();
        alert(`참가 신청 실패: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('참가 신청 오류:', error);
      // API가 없어도 로컬에서 처리 (임시)
      setPosts(prevPosts => prevPosts.map(p => {
        if (p._id === postId && p.meetupDetails) {
          return {
            ...p,
            meetupDetails: {
              ...p.meetupDetails,
              currentParticipants: p.meetupDetails.currentParticipants + 1
            }
          };
        }
        return p;
      }));
      alert('⚠️ 참가 신청이 임시로 처리되었습니다 (API 미연결)\n\n실제 참가는 주최자에게 별도 연락하세요.');
    }
  };

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
              <input
                type="text"
                placeholder="게시글 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {user?.userType === 'superAdmin' && (
                <>
                  <button
                    onClick={() => setShowRulesModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    ⚙️ 운영 규칙
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm('샘플 게시글 10개를 생성하시겠습니까?')) return;
                      
                      const samples = [
                        { title: '💡 자유형 호흡법 완전 정복 가이드', content: '자유형 호흡법을 마스터하는 단계별 가이드입니다.\n\n1️⃣ 기본 자세\n2️⃣ 호흡 타이밍\n3️⃣ 연습 방법', category: 'tip' },
                        { title: '⭐ JJ Swim Lab 3개월 수강 후기', content: '3개월 수업 듣고 많이 늘었어요!\n\n✅ 실력 향상\n✅ 자세 개선', category: 'review' },
                        { title: '❓ 접영 킥 동작이 어려워요', content: '접영 킥 연습 중인데 물살이 안 생겨요. 조언 부탁드립니다!', category: 'question' },
                        { title: '🏆 2025 챔피언십 참가자 모집', content: '수영 대회 개최!\n\n📅 10월 15일\n📍 메인 센터', category: 'event' },
                        { title: '⚡ 오늘 저녁 번개 모임 (잠실)', content: '저녁 7시 잠실 수영장 자유형 연습!', category: 'meetup', meetupDetails: { location: '잠실 수영장', date: new Date().toISOString().split('T')[0], time: '19:00-20:30', strokeType: '자유형', distance: '1000m', pace: '2분30초/100m', maxParticipants: 6, currentParticipants: 3, cost: 8000, level: '초중급' } },
                        { title: '💬 수영 다이어트 후기', content: '2개월 수영으로 7kg 감량 성공!', category: 'general' },
                        { title: '💡 배영 턴 동작 가이드', content: '배영 턴 마스터 방법!\n\n1. 깃발 카운트\n2. 회전\n3. 턴\n4. 킥', category: 'tip' },
                        { title: '❓ 수영 장비 추천 부탁드려요', content: '수경, 수모, 킥보드 추천 부탁합니다. 예산 10만원', category: 'question' },
                        { title: '⚡ 주말 한강 오픈워터 (뚝섬)', content: '한강 오픈워터 수영!', category: 'meetup', meetupDetails: { location: '뚝섬 한강공원', date: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0], time: '10:00-12:00', strokeType: '자유형', distance: '2000m', pace: '자유', maxParticipants: 10, currentParticipants: 5, cost: 15000, level: '중급' } },
                        { title: '💡 평영 발차기 팁', content: '평영 발차기 교정!\n\n1. 무릎 너비\n2. 발목 꺾기\n3. 차기\n4. 밀기', category: 'tip' }
                      ];

                      let count = 0;
                      for (const post of samples) {
                        try {
                          const res = await fetch('http://localhost:5000/api/community/posts', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify(post)
                          });
                          if (res.ok) count++;
                        } catch (e) { console.error(e); }
                      }
                      alert(`✅ ${count}개 샘플 게시글 생성 완료!`);
                      fetchPosts();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    📦 샘플 데이터
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  console.log('글쓰기 버튼 클릭, user:', user);
                  setIsFormOpen(true);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                ✍️ 글쓰기
              </button>
            </div>
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
              <div key={post._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
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
                              <button 
                                onClick={() => handleJoinMeetup(post._id)}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                              >
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
                      {post.isBlinded && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          🚫 블라인드
                        </span>
                      )}
                      {post.warnings && post.warnings > 0 && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          ⚠️ 경고 {post.warnings}회
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center gap-1">👍 {post.likes}</span>
                      <span className="flex items-center gap-1">💬 {post.comments}</span>
                    </div>
                  </div>

                  {/* 최고 관리자 액션 버튼 */}
                  {user?.userType === 'superAdmin' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                      <button
                        onClick={() => handleBlindPost(post._id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
                      >
                        🚫 블라인드
                      </button>
                      <button
                        onClick={() => handleWarnAuthor(post._id, post.author.userId)}
                        className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
                      >
                        ⚠️ 경고
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                      >
                        🗑️ 삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
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
                <button 
                  onClick={() => {
                    setNewPost(prev => ({ ...prev, category: selectedCategory === 'all' ? 'general' : selectedCategory }));
                    setIsFormOpen(true);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  첫 글 작성하기
                </button>
              )}
            </div>
          </div>
        )}

        {/* 게시글 작성 모달 */}
        {isFormOpen && user && (
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
                    <input
                      id="title"
                      type="text"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="게시글 제목을 입력하세요"
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                          <input
                            type="text"
                            value={newPost.meetupDetails.location}
                            onChange={(e) => setNewPost(prev => ({
                              ...prev,
                              meetupDetails: { ...prev.meetupDetails, location: e.target.value }
                            }))}
                            placeholder="예: 잠실 수영장 3층"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            날짜 *
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                          <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                          <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                          <input
                            type="number"
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      취소
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      작성
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 커뮤니티 운영 규칙 모달 (최고 관리자 전용) */}
        {showRulesModal && user?.userType === 'superAdmin' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">⚙️ 커뮤니티 운영 규칙 설정</h2>
                <button 
                  onClick={() => setShowRulesModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* 규칙 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    규칙 제목
                  </label>
                  <input
                    type="text"
                    value={communityRules.title}
                    onChange={(e) => setCommunityRules({ ...communityRules, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 커뮤니티 규칙 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    커뮤니티 규칙 (각 줄이 하나의 규칙)
                  </label>
                  <textarea
                    value={communityRules.rules.join('\n')}
                    onChange={(e) => setCommunityRules({ 
                      ...communityRules, 
                      rules: e.target.value.split('\n').filter(r => r.trim())
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={8}
                    placeholder="각 줄에 하나의 규칙을 입력하세요"
                  />
                </div>

                {/* 위반 시 제재 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    위반 시 제재 (각 줄이 하나의 단계)
                  </label>
                  <textarea
                    value={communityRules.penalties.join('\n')}
                    onChange={(e) => setCommunityRules({ 
                      ...communityRules, 
                      penalties: e.target.value.split('\n').filter(p => p.trim())
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    placeholder="각 줄에 하나의 제재 단계를 입력하세요"
                  />
                </div>

                {/* 미리보기 */}
                <div className="bg-gray-50 border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">📋 미리보기</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">{communityRules.title}</h5>
                      <ul className="space-y-1">
                        {communityRules.rules.map((rule, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            {index + 1}. {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">위반 시 제재</h5>
                      <ul className="space-y-1">
                        {communityRules.penalties.map((penalty, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            • {penalty}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* 버튼 */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveRules}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  저장하기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}