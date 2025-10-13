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
    // 🗑️ 구버전 캐시 자동 삭제 (엔진 업데이트 시)
    localStorage.removeItem('guest-daily-program'); // v30 이하 제거
    localStorage.removeItem('guest-daily-program-v31'); // v31 제거 (시간 계산 버그)
    
    // 임시: 로컬 스토리지에서 프로그램 가져오기 (엔진 v34 - 반복 횟수 파싱 수정)
    // TODO: 실제 API 호출
    const savedProgram = localStorage.getItem('guest-daily-program-v34');
    
    // 🧹 구버전 캐시 자동 정리
    ['guest-daily-program-v31', 'guest-daily-program-v32', 'guest-daily-program-v33'].forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
    if (savedProgram) {
      const parsed = JSON.parse(savedProgram);
      console.log('📦 로드된 프로그램:', parsed);
      console.log('🔍 엔진 출력 존재?:', !!parsed.engineOutput);
      console.log('🔍 엔진 출력 구조:', parsed.engineOutput);
      setProgram(parsed);
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
          {/* 디버깅 정보 */}
          {!program.engineOutput && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 font-semibold">⚠️ 엔진 출력이 없습니다</p>
              <p className="text-xs text-red-600 mt-1">프로그램 데이터: {JSON.stringify(Object.keys(program))}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">날짜</p>
                <p className="font-semibold text-gray-900">{program.engineOutput?.date || program.date || '오늘'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">운동 시간</p>
                <p className="font-semibold text-gray-900">
                  {program.engineOutput ? program.engineOutput.totalDuration : program.duration || '60'}분
                </p>
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
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                📋 오늘의 운동 계획
                {program.engineOutput && (
                  <span className="ml-3 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                    🤖 AI 엔진 생성
                  </span>
                )}
              </h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800 font-medium">
                  💡 체험 프로그램이므로 하루 분량만 제공됩니다.<br/>
                  정회원 가입 시 주간/월간 프로그램과 대회 준비 프로그램을 이용하실 수 있습니다!
                </p>
              </div>

              {/* 프로그램 요약 */}
              {program.engineOutput && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-5 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">총 거리</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {program.engineOutput.totalMeters}m
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">예상 시간</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {program.engineOutput.totalDuration}분
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">운동 강도</p>
                      <p className="text-2xl font-bold text-green-600">
                        {program.intensity}%
                      </p>
                    </div>
                  </div>
                  {program.engineOutput.themeDesc && (
                    <p className="text-sm text-gray-700 mt-4 text-center">
                      🎯 <strong>오늘의 테마:</strong> {program.engineOutput.themeDesc}
                    </p>
                  )}
                </div>
              )}
              
              {/* 실제 엔진 생성 세트들 */}
              {program.engineOutput?.sets ? (
                <div className="space-y-4">
                  {program.engineOutput.sets.map((set: any, idx: number) => (
                    <div 
                      key={idx}
                      className={`border-l-4 rounded-lg p-5 ${
                        set.zone === 'Z1' ? 'border-green-500 bg-green-50' :
                        set.zone === 'Z2' ? 'border-blue-500 bg-blue-50' :
                        set.zone === 'Z3' ? 'border-yellow-500 bg-yellow-50' :
                        set.zone === 'Z4' ? 'border-orange-500 bg-orange-50' :
                        'border-red-500 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className={`font-bold text-lg ${
                          set.zone === 'Z1' ? 'text-green-800' :
                          set.zone === 'Z2' ? 'text-blue-800' :
                          set.zone === 'Z3' ? 'text-yellow-800' :
                          set.zone === 'Z4' ? 'text-orange-800' :
                          'text-red-800'
                        }`}>
                          {idx + 1}. {set.desc}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          set.zone === 'Z1' ? 'bg-green-200 text-green-800' :
                          set.zone === 'Z2' ? 'bg-blue-200 text-blue-800' :
                          set.zone === 'Z3' ? 'bg-yellow-200 text-yellow-800' :
                          set.zone === 'Z4' ? 'bg-orange-200 text-orange-800' :
                          'bg-red-200 text-red-800'
                        }`}>
                          {set.zone}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-600">영법</p>
                          <p className="font-semibold">{
                            set.stroke === 'freestyle' ? '자유형' :
                            set.stroke === 'backstroke' ? '배영' :
                            set.stroke === 'breaststroke' ? '평영' :
                            set.stroke === 'butterfly' ? '접영' : set.stroke
                          }</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">거리</p>
                          <p className="font-semibold">{set.meters}m</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">휴식</p>
                          <p className="font-semibold">{set.restSec}초</p>
                        </div>
                        {set.rpe && (
                          <div>
                            <p className="text-xs text-gray-600">체감 강도</p>
                            <p className="font-semibold">RPE {set.rpe}/10</p>
                          </div>
                        )}
                      </div>

                      {/* 과학적 근거 */}
                      <div className="bg-white/70 rounded-lg p-3 text-xs space-y-1">
                        <p><strong>📊 페이스 근거:</strong> {set.whyPace}</p>
                        <p><strong>⏱️ 휴식 근거:</strong> {set.whyRest}</p>
                        <p><strong>🎯 세트 목적:</strong> {set.whySet}</p>
                        {set.equipment && set.equipment.length > 0 && (
                          <p><strong>🛠️ 장비:</strong> {set.equipment.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // 엔진 출력이 없는 경우 기본 프로그램
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                    <h4 className="font-bold text-green-800 mb-2">1️⃣ 준비운동 (10분)</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• 관절 스트레칭 5분</li>
                      <li>• 가벼운 수영 200m</li>
                      <li>• 킥 연습 100m</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-blue-800 mb-2">2️⃣ 메인 세트 (35분)</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Zone 2 강도로 400m × 4세트</li>
                      <li>• 세트 간 휴식 1분</li>
                      <li>• 총 거리: 1600m</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 bg-purple-50 rounded-lg p-4">
                    <h4 className="font-bold text-purple-800 mb-2">3️⃣ 마무리 운동 (15분)</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• 가벼운 수영 200m</li>
                      <li>• 스트레칭 10분</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* 엔진 생성 노트 */}
              {program.engineOutput?.notes && program.engineOutput.notes.length > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
                  <p className="text-sm font-bold text-purple-800 mb-2">📝 코치 노트</p>
                  <ul className="text-sm text-purple-700 space-y-1">
                    {program.engineOutput.notes.map((note: string, idx: number) => (
                      <li key={idx}>• {note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 주의사항 */}
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="text-sm font-bold text-yellow-800 mb-2">⚠️ 주의사항</p>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 운동 중 불편함이나 통증이 있으면 즉시 중단하세요</li>
                <li>• 충분한 수분 섭취를 하세요</li>
                <li>• 준비운동과 마무리 운동을 생략하지 마세요</li>
                {program.healthData?.orthopedics?.length > 0 && (
                  <li className="font-bold text-red-700">
                    • 건강 질환({program.healthData.orthopedics.length}개)이 있으므로 무리하지 마세요
                  </li>
                )}
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

