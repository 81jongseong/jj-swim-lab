'use client';
import { logger } from '@/lib/logger';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Star, MessageSquare, User, Calendar, ThumbsUp, ThumbsDown, Filter, Search } from 'lucide-react';
import withAuth from '@/components/withAuth';
import { LoadingState, PageHeader } from '@/components/common';

interface Review {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  instructorId: string;
  instructorName: string;
  courseId: string;
  courseName: string;
  rating: number;
  title: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  helpful: number;
  notHelpful: number;
  response?: {
    content: string;
    respondedAt: Date;
    responderName: string;
  };
}

function ReviewsManagement() {
  const router = useRouter();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // 테넌트 경로로 리다이렉트 (Phase 3)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const slug = localStorage.getItem('centerSlug') || 'default';
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/center-admin/') && !currentPath.includes('/center/')) {
        const newPath = currentPath.replace('/center-admin', `/center/${slug}/admin`);
        router.replace(newPath);
        return;
      }
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempReviews: Review[] = [
        {
          _id: '1',
          userId: 'user001',
          userName: '김학생',
          userEmail: 'student1@example.com',
          instructorId: 'instructor001',
          instructorName: '김강사',
          courseId: 'course001',
          courseName: '초급 자유형 클래스',
          rating: 5,
          title: '정말 좋은 수업이었어요!',
          content: '김강사님이 정말 친절하고 자세하게 가르쳐주셔서 수영 실력이 많이 늘었습니다.',
          status: 'approved',
          createdAt: new Date('2024-01-20'),
          helpful: 12,
          notHelpful: 1,
          response: {
            content: '감사합니다! 더 열심히 가르치겠습니다.',
            respondedAt: new Date('2024-01-21'),
            responderName: '김강사'
          }
        },
        {
          _id: '2',
          userId: 'user002',
          userName: '이학생',
          userEmail: 'student2@example.com',
          instructorId: 'instructor002',
          instructorName: '이코치',
          courseId: 'course002',
          courseName: '중급 배영 클래스',
          rating: 4,
          title: '배영 기술이 많이 향상되었어요',
          content: '이코치님 덕분에 배영을 제대로 배울 수 있었습니다. 아직 완벽하지는 않지만 많이 늘었어요.',
          status: 'approved',
          createdAt: new Date('2024-01-19'),
          helpful: 8,
          notHelpful: 0
        },
        {
          _id: '3',
          userId: 'user003',
          userName: '박학생',
          userEmail: 'student3@example.com',
          instructorId: 'instructor001',
          instructorName: '김강사',
          courseId: 'course003',
          courseName: '고급 접영 클래스',
          rating: 3,
          title: '접영이 어려워요',
          content: '접영이 생각보다 어려워서 좀 더 기초부터 차근차근 배우고 싶습니다.',
          status: 'pending',
          createdAt: new Date('2024-01-18'),
          helpful: 3,
          notHelpful: 2
        },
        {
          _id: '4',
          userId: 'user004',
          userName: '최학생',
          userEmail: 'student4@example.com',
          instructorId: 'instructor002',
          instructorName: '이코치',
          courseId: 'course001',
          courseName: '초급 자유형 클래스',
          rating: 5,
          title: '완전 만족!',
          content: '처음 수영을 배우는데 이코치님이 정말 잘 가르쳐주셔서 금방 배웠어요!',
          status: 'approved',
          createdAt: new Date('2024-01-17'),
          helpful: 15,
          notHelpful: 0
        }
      ];
      setReviews(tempReviews);
    } catch (error) {
      logger.error('리뷰 목록 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'pending': '검토중',
      'approved': '승인',
      'rejected': '거부'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const approveReview = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, status: 'approved' as const }
        : review
    ));
  };

  const rejectReview = (reviewId: string) => {
    setReviews(prev => prev.map(review => 
      review._id === reviewId 
        ? { ...review, status: 'rejected' as const }
        : review
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingState message="로딩 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PageHeader
        title="리뷰 관리"
        description="학생들의 리뷰를 관리하고 답변하세요"
      />

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 리뷰</p>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}개</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Star className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 평점</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <ThumbsUp className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">승인된 리뷰</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => r.status === 'approved').length}개
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">검토 대기</p>
              <p className="text-2xl font-bold text-gray-900">
                {reviews.filter(r => r.status === 'pending').length}개
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="리뷰 내용, 강사명, 학생명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">모든 상태</option>
              <option value="pending">검토중</option>
              <option value="approved">승인</option>
              <option value="rejected">거부</option>
            </select>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div className="space-y-6">
        {filteredReviews.map((review) => (
          <div key={review._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <div className="flex mr-2">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-600">({review.rating}/5)</span>
                  <span className={`ml-4 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                    {getStatusLabel(review.status)}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{review.title}</h3>
                <p className="text-gray-700 mb-4">{review.content}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>{review.userName} ({review.userEmail})</span>
              </div>
              <div className="flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>{review.courseName} - {review.instructorName}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{review.createdAt.toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <ThumbsUp className="w-4 h-4 mr-1 text-green-600" />
                  <span>{review.helpful}</span>
                </div>
                <div className="flex items-center">
                  <ThumbsDown className="w-4 h-4 mr-1 text-red-600" />
                  <span>{review.notHelpful}</span>
                </div>
              </div>

              {review.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => approveReview(review._id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => rejectReview(review._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                  >
                    거부
                  </button>
                </div>
              )}

              {review.status === 'approved' && !review.response && (
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                  답변하기
                </button>
              )}
            </div>

            {review.response && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-900">{review.response.responderName}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {review.response.respondedAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.response.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}
    </div>
  );
}

export default withAuth(ReviewsManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});