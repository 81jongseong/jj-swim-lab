/**
 * 게스트 회원 프로그램 페이지
 * 
 * 연동되는 데이터:
 * - 하루짜리 체험 프로그램
 * 
 * 연동되는 파일:
 * - /health/input (건강정보 입력 후 생성)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Target } from 'lucide-react';

export default function GuestProgramsPage() {
  const router = useRouter();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 임시: 로컬 스토리지에서 프로그램 가져오기
    // TODO: 실제 API 호출
    const savedProgram = localStorage.getItem('guest-daily-program');
    if (savedProgram) {
      setProgram(JSON.parse(savedProgram));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">프로그램 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">🏊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">프로그램이 없습니다</h2>
          <p className="text-gray-600 mb-6">
            아직 생성된 프로그램이 없습니다.<br/>
            건강정보를 입력하고 프로그램을 생성해보세요!
          </p>
          <button
            onClick={() => router.push('/health/input')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            건강정보 입력하러 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            뒤로 가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">오늘의 맞춤 프로그램</h1>
          <p className="text-gray-600">나의 건강 상태에 맞춘 하루 운동 프로그램입니다</p>
        </div>

        {/* 프로그램 정보 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">날짜</p>
                <p className="font-semibold text-gray-900">{program.date || '오늘'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">운동 시간</p>
                <p className="font-semibold text-gray-900">{program.duration || '60'}분</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">목표</p>
                <p className="font-semibold text-gray-900">{program.goal || '체력 향상'}</p>
              </div>
            </div>
          </div>

          {/* 프로그램 내용 */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">📋 오늘의 운동 계획</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium">
                  💡 체험 프로그램이므로 하루 분량만 제공됩니다.<br/>
                  정회원 가입 시 주간/월간 프로그램을 이용하실 수 있습니다!
                </p>
              </div>
              
              <div className="space-y-4">
                {/* 준비운동 */}
                <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-2">1️⃣ 준비운동 (10분)</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 관절 스트레칭 5분</li>
                    <li>• 가벼운 수영 200m (자유형)</li>
                    <li>• 킥 연습 100m</li>
                  </ul>
                </div>

                {/* 메인 세트 */}
                <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-2">2️⃣ 메인 세트 (35분)</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Zone 2 강도로 400m × 4세트</li>
                    <li>• 세트 간 휴식 1분</li>
                    <li>• 총 거리: 1600m</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2 font-semibold">
                    💪 목표: {program.goal || '체력 향상'}
                  </p>
                </div>

                {/* 마무리 운동 */}
                <div className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-4">
                  <h4 className="font-bold text-purple-800 mb-2">3️⃣ 마무리 운동 (15분)</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• 가벼운 수영 200m (편안한 페이스)</li>
                    <li>• 스트레칭 10분</li>
                    <li>• 호흡 정리 및 휴식</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 주의사항 */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="text-sm font-bold text-yellow-800 mb-2">⚠️ 주의사항</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 운동 중 불편함이나 통증이 있으면 즉시 중단하세요</li>
                <li>• 충분한 수분 섭취를 하세요</li>
                <li>• 준비운동과 마무리 운동을 생략하지 마세요</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/health/input')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            새 프로그램 생성하기
          </button>
          <button
            onClick={() => router.push('/landing')}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            홈으로
          </button>
        </div>
      </div>
    </div>
  );
}

