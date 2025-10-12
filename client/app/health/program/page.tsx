/**
 * 수영 트레이닝 프로그램 결과 페이지
 * 
 * 연동되는 데이터:
 * - 회원 건강정보
 * - 수영 트레이닝 규칙 엔진 결과
 * - 주간 운동 계획
 * - 영법별 가이드라인
 * 
 * 연동되는 파일:
 * - /swim-training-engine/ (수영 트레이닝 규칙 엔진)
 * - /data/joint-conditions.ts (관절질환 가이드라인)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/StatCard';
import Button from '@/components/Button';

export default function TrainingProgramPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로그램을 로드하는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 pt-20">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🏊‍♂️ 맞춤형 수영 프로그램
          </h1>
          <p className="text-lg text-gray-600">
            당신의 건강 상태에 맞춘 개인화된 운동 계획
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="주간 목표"
            value="150분"
            description="권장 운동 시간"
            color="blue"
          />
          <StatCard
            title="목표 거리"
            value="2,000m"
            description="주간 수영 거리"
            color="green"
          />
          <StatCard
            title="난이도"
            value="초급"
            description="현재 레벨"
            color="purple"
          />
        </div>

        {/* 안내 메시지 */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              프로그램 페이지 준비 중
            </h2>
            <p className="text-gray-600 mb-6">
              맞춤형 수영 트레이닝 프로그램 기능을 준비하고 있습니다.
              <br />
              곧 더 나은 모습으로 찾아뵙겠습니다!
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">💡 곧 제공될 기능</h3>
              <ul className="text-left text-sm text-blue-800 space-y-1">
                <li>✅ 건강 상태 기반 맞춤형 프로그램</li>
                <li>✅ 주간 운동 계획 및 스케줄</li>
                <li>✅ 영법별 세부 가이드라인</li>
                <li>✅ 운동 강도 및 페이스 조절</li>
                <li>✅ 진도 추적 및 조정 안내</li>
              </ul>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => router.push('/health')}
                variant="primary"
                size="lg"
              >
                건강 체크하기
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                size="lg"
              >
                대시보드로 돌아가기
              </Button>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 프로그램 특징</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• AI 기반 개인 맞춤형 설계</li>
              <li>• 실시간 진도 추적</li>
              <li>• 자동 난이도 조절</li>
              <li>• 부상 예방 가이드</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 포함 내용</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 주간 운동 스케줄</li>
              <li>• 영법별 세부 계획</li>
              <li>• 운동 강도 가이드</li>
              <li>• 안전 수칙 및 주의사항</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
