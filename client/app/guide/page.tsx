'use client';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JJ Swim Lab 이용 안내</h1>
          <p className="text-gray-600">스마트한 수영 교육 플랫폼 사용 가이드</p>
        </div>

        <div className="space-y-6">
          {/* 플랫폼 이용 절차 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 플랫폼 이용 절차</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">1</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">회원가입</h3>
                  <p className="text-gray-700">학생, 강사, 센터 관리자 중 원하는 계정 유형을 선택하여 가입합니다.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">2</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">건강 프로필 작성</h3>
                  <p className="text-gray-700">개인 맞춤 프로그램을 위해 건강 상태, 컨디션, 질환 정보를 입력합니다.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">3</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">센터/강사 찾기</h3>
                  <p className="text-gray-700">지도에서 원하는 지역의 수영장 센터와 강사를 찾아 등록합니다.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">4</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">맞춤 프로그램 생성</h3>
                  <p className="text-gray-700">AI가 건강 프로필을 분석하여 최적의 수영 훈련 프로그램을 자동 생성합니다.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1 flex-shrink-0">5</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">실시간 진도 관리</h3>
                  <p className="text-gray-700">강사의 피드백을 받고 실력 향상을 실시간으로 추적합니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 플랫폼 주요 기능 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">✨ 주요 기능</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">🏊‍♂️ AI 기반 프로그램 생성</h3>
                <p className="text-sm text-gray-600">건강 상태, 체력, 목표에 맞는 맞춤형 수영 프로그램을 자동으로 생성합니다.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">📊 건강 데이터 관리</h3>
                <p className="text-sm text-gray-600">질환, 컨디션, 체력 변화를 체계적으로 기록하고 관리합니다.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">💬 실시간 소통</h3>
                <p className="text-sm text-gray-600">강사와 학생 간 즉각적인 피드백과 질의응답이 가능합니다.</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">📈 진도 추적</h3>
                <p className="text-sm text-gray-600">학습 진도와 실력 향상을 시각적으로 확인하고 분석합니다.</p>
              </div>
            </div>
          </div>

          {/* 수영 준비사항 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎒 수영 준비사항</h2>
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 플랫폼 장점:</strong> 강사가 회원의 건강 프로필과 훈련 프로그램을 미리 확인하여, 
                필요한 준비물과 주의사항을 개별 공지합니다!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">기본 준비물</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• 수영복</li>
                  <li>• 수영모자</li>
                  <li>• 고글</li>
                  <li>• 수건</li>
                  <li>• 샤워용품</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">강사 지정 준비물</h3>
                <p className="text-sm text-gray-600 mb-2">
                  훈련 프로그램과 개인 상태에 따라 강사가 추가 준비물을 플랫폼을 통해 안내합니다:
                </p>
                <ul className="text-gray-700 space-y-1 text-sm">
                  <li>• 수영 오리발 (킥 강화 훈련 시)</li>
                  <li>• 수영 보드 (팔 동작 집중 시)</li>
                  <li>• 귀마개/코클립 (필요 시)</li>
                  <li>• 기타 개인별 필요 도구</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 계정별 이용 안내 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">👥 계정별 이용 안내</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="font-medium text-gray-900 mb-2">🏊 학생 (회원)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 건강 프로필 작성 및 맞춤 프로그램 생성</li>
                  <li>• 센터/강사 검색 및 등록</li>
                  <li>• 실시간 진도 확인 및 피드백 받기</li>
                  <li>• 퀴즈와 3D 뷰어로 학습 보조</li>
                </ul>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="font-medium text-gray-900 mb-2">👨‍🏫 강사</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 학생 건강 프로필 확인 및 맞춤 지도</li>
                  <li>• 수업 일정 관리 및 출결 체크</li>
                  <li>• 실시간 피드백 전송 및 진도 평가</li>
                  <li>• 학생별 준비물 및 주의사항 개별 공지</li>
                </ul>
              </div>
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="font-medium text-gray-900 mb-2">🏢 센터 관리자</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 강사 및 회원 통합 관리</li>
                  <li>• 센터 소개 및 시설 정보 등록</li>
                  <li>• 매출 및 운영 현황 확인</li>
                  <li>• 수업 과정 및 일정 관리</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 환불 및 결제 정책 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 환불 및 결제 정책</h2>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ 중요:</strong> 환불 정책은 각 센터마다 다를 수 있습니다. 
                등록 전 해당 센터의 환불 정책을 반드시 확인해주세요.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700">
                <strong>일반적인 환불 기준</strong> (센터별 차이 있음)
              </p>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">수업 시작 전</span>
                  <p className="text-gray-600">센터 정책에 따름 (대부분 100%)</p>
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <span className="font-medium text-gray-900">수업 진행 중</span>
                  <p className="text-gray-600">센터별 규정 확인 필요</p>
                </div>
              </div>
            </div>
          </div>

          {/* 고객 지원 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📞 고객 지원</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">플랫폼 이용 문의</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• 이메일: support@jjswimlab.com</p>
                  <p>• 전화: 02-1234-5678</p>
                  <p>• 카카오톡: @jjswimlab</p>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">센터/강습 문의</h3>
                <p className="text-sm text-gray-700">
                  각 센터 및 강사의 연락처는 센터 정보 페이지에서 확인하실 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 