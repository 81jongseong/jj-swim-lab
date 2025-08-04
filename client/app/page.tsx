import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-500 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            🏊‍♂️ JJ Swim Lab
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            수영 교육의 새로운 기준
          </p>
          <p className="text-lg mb-12 max-w-3xl mx-auto">
            체계적인 수영 교육 시스템으로 당신의 수영 실력을 한 단계 끌어올리세요.
            전문 강사진과 함께하는 맞춤형 레슨, AI 기반 학습 시스템을 경험해보세요.
          </p>
          
          {/* User Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link href="/auth/signup?type=member" 
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              👤 회원 가입
            </Link>
            <Link href="/auth/signup?type=instructor" 
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              👨‍🏫 강사 등록
            </Link>
            <Link href="/auth/signup?type=admin" 
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              🏢 센터 등록
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-4">체계적인 진도 관리</h3>
              <p className="text-gray-600">
                수영 레벨별 세부 평가와 진도표를 통한 체계적인 학습 관리
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-semibold mb-4">AI 기반 학습</h3>
              <p className="text-gray-600">
                모의고사와 퀴즈를 통한 이론 학습, AI가 추천하는 맞춤형 훈련
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold mb-4">전문 강사 매칭</h3>
              <p className="text-gray-600">
                자격증을 보유한 전문 강사와의 1:1 맞춤 레슨
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">📢 공지사항</h2>
            <Link href="/news" className="text-blue-600 hover:text-blue-700 font-semibold">
              전체보기 →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-500 mb-2">2025.01.15</div>
              <h3 className="font-semibold mb-2">시스템 업데이트 안내</h3>
              <p className="text-gray-600 text-sm">
                새로운 AI 기반 학습 시스템이 업데이트되었습니다.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-500 mb-2">2025.01.10</div>
              <h3 className="font-semibold mb-2">수영 대회 일정</h3>
              <p className="text-gray-600 text-sm">
                2025년 상반기 수영 대회 일정이 공개되었습니다.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm text-gray-500 mb-2">2025.01.05</div>
              <h3 className="font-semibold mb-2">새로운 강사 등록</h3>
              <p className="text-gray-600 text-sm">
                경력 10년 이상의 전문 강사가 새롭게 등록되었습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">멤버십 안내</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">기본</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">무료</div>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>• 기본 진도 관리</li>
                <li>• 공지사항 확인</li>
                <li>• 기본 퀴즈</li>
              </ul>
              <Link href="/auth/signup" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                가입하기
              </Link>
            </div>
            <div className="border border-blue-500 rounded-lg p-6 text-center bg-blue-50">
              <h3 className="text-xl font-semibold mb-4">플러스</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">월 29,900원</div>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>• AI 기반 훈련 추천</li>
                <li>• 상세한 진도 분석</li>
                <li>• 전문 강사 상담</li>
              </ul>
              <Link href="/auth/signup" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                가입하기
              </Link>
            </div>
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold mb-4">프리미엄</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">월 59,900원</div>
              <ul className="text-gray-600 space-y-2 mb-6">
                <li>• 1:1 전문 강사 레슨</li>
                <li>• 영상 분석 서비스</li>
                <li>• 우선 예약권</li>
              </ul>
              <Link href="/auth/signup" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                가입하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">지금 시작하세요!</h2>
          <p className="text-xl mb-8">
            JJ Swim Lab과 함께 수영의 새로운 세계를 경험해보세요.
          </p>
          <div className="space-x-4">
            <Link href="/guide" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              이용안내 보기
            </Link>
            <Link href="/auth/signup" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              회원가입
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
