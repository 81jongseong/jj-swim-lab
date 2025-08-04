import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            JJ Swim Lab 소개
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            수영 교육의 새로운 기준을 제시하는 JJ Swim Lab은 
            체계적인 학습 시스템과 전문 강사진을 통해 
            모든 연령대의 수영 실력 향상을 도와드립니다.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">미션</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                JJ Swim Lab은 모든 사람이 안전하고 즐겁게 수영을 배울 수 있도록 
                체계적인 교육 시스템을 제공합니다. 개인별 맞춤형 레슨과 
                AI 기반 학습 시스템을 통해 누구나 자신의 페이스에 맞춰 
                수영 실력을 향상시킬 수 있습니다.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">비전</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                수영 교육의 디지털 혁신을 선도하여, 전국민이 
                건강하고 안전한 수영 문화를 누릴 수 있는 
                플랫폼으로 성장하겠습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">핵심 특징</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-4">체계적인 진도 관리</h3>
              <p className="text-gray-600">
                수영 레벨별 세부 평가와 진도표를 통한 체계적인 학습 관리 시스템
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold mb-4">AI 기반 학습</h3>
              <p className="text-gray-600">
                개인별 학습 데이터를 분석하여 맞춤형 훈련 프로그램 추천
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold mb-4">전문 강사 매칭</h3>
              <p className="text-gray-600">
                자격증을 보유한 전문 강사와의 1:1 맞춤 레슨
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">팀 소개</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">👨‍💼</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">CEO</h3>
              <p className="text-gray-600">수영 교육 전문가</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">👩‍💻</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">CTO</h3>
              <p className="text-gray-600">기술 개발 전문가</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-32 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">교육 총괄</h3>
              <p className="text-gray-600">수영 지도 전문가</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">지금 시작하세요!</h2>
          <p className="text-xl mb-8">
            JJ Swim Lab과 함께 수영의 새로운 세계를 경험해보세요.
          </p>
          <div className="space-x-4">
            <Link href="/auth/signup" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              회원가입
            </Link>
            <Link href="/guide" className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              이용안내
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 