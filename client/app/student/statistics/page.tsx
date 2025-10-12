/**
 * 📊 SwimLab - 회원용 통계 페이지
 * 
 * 📋 **페이지 목적**
 * - 회원 본인의 훈련 통계 확인
 * - CSS 추이, 완료율, 훈련량 그래프
 * - 생리학적 지표 변화 추적
 * 
 * 🔄 **연동되는 데이터**
 * - SwimProgram (프로그램 이력)
 * - User.swimmingProfile (CSS, 생리학적 지표)
 * 
 * 💡 **사용 대상**
 * - 회원 본인만 접근 가능
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MemberStatistics from '@/components/swimlab/MemberStatistics';
import { useRouter } from 'next/navigation';

export default function StudentStatisticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showStatistics, setShowStatistics] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.userType !== 'student') {
        router.push('/dashboard');
      } else {
        setShowStatistics(true);
      }
    }
  }, [user, loading, router]);

  if (loading || !showStatistics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">통계 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">📊 내 훈련 통계</h1>
              <p className="text-gray-600 mt-2">
                CSS 추이, 완료율, 훈련량을 한눈에 확인하세요
              </p>
            </div>
            <button
              onClick={() => router.push('/student/dashboard')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-gray-700"
            >
              ← 대시보드
            </button>
          </div>
        </div>

        {/* 통계 컴포넌트 */}
        <div className="bg-white rounded-lg shadow-lg p-1">
          <MemberStatistics
            memberId={user._id}
            memberName={user.name}
            onClose={() => router.push('/student/dashboard')}
          />
        </div>
      </div>
    </div>
  );
}


