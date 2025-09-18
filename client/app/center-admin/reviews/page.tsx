/**
 * @file 센터 관리자 리뷰 관리 페이지
 * @description 센터 관리자가 수강생 리뷰를 확인하고 관리할 수 있는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Star, Filter, Search, Eye, MessageSquare, Calendar, User } from 'lucide-react';

interface Review {
  id: string;
  studentName: string;
  instructorName: string;
  courseName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

const CenterAdminReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/centers/reviews', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('리뷰 데이터를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setReviews(result.data);
      } else {
        throw new Error(result.message || '리뷰 데이터 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 데이터 로딩 실패:', error);
      
      // API 연결 실패 시 빈 배열로 설정 (데이터베이스 연결 필요)
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/centers/reviews/${reviewId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('리뷰 상태 변경에 실패했습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setReviews(reviews.map(review => 
          review.id === reviewId ? { ...review, status: newStatus } : review
        ));
        alert(`리뷰가 ${newStatus === 'approved' ? '승인' : '거부'}되었습니다.`);
      } else {
        throw new Error(result.message || '리뷰 상태 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('리뷰 상태 변경 실패:', error);
      alert('리뷰 상태 변경에 실패했습니다. API 서버를 확인해주세요.');
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === 'all' || review.status === filter;
    const matchesSearch = review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">승인됨</Badge>;
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>;
      case 'rejected':
        return <Badge variant="destructive">거부됨</Badge>;
      default:
        return <Badge variant="secondary">알 수 없음</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          리뷰 관리
        </h1>
        <p className="text-gray-600">
          수강생들의 리뷰를 확인하고 관리하세요.
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>리뷰 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="학생명, 강사명, 강의명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                전체
              </Button>
              <Button
                variant={filter === 'approved' ? 'default' : 'outline'}
                onClick={() => setFilter('approved')}
              >
                승인됨
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
              >
                대기중
              </Button>
              <Button
                variant={filter === 'rejected' ? 'default' : 'outline'}
                onClick={() => setFilter('rejected')}
              >
                거부됨
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 리뷰 목록 */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">리뷰가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">{review.studentName}</h3>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      {getStatusBadge(review.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {review.instructorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {review.date}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{review.courseName}</p>
                    <p className="text-gray-800">{review.comment}</p>
                  </div>
                </div>
                
                {review.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(review.id, 'approved')}
                    >
                      승인
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleStatusChange(review.id, 'rejected')}
                    >
                      거부
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800">
        <p className="font-semibold">개발 참고:</p>
        <p>이 페이지의 데이터는 하드코딩이 아닌 데이터베이스에서 관리되어야 합니다.</p>
        <p>관련 API 엔드포인트 (`/api/centers/reviews` 등) 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default CenterAdminReviewsPage;
