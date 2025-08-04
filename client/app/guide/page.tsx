import Link from 'next/link';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">📖 이용안내</h1>
          <p className="text-xl text-gray-600">
            JJ Swim Lab을 처음 이용하시는 분들을 위한 안내서입니다.
          </p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">빠른 메뉴</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="#membership" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">💳</div>
              <h3 className="font-semibold">멤버십 안내</h3>
              <p className="text-sm text-gray-600">요금제별 혜택</p>
            </Link>
            <Link href="#usage" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">📱</div>
              <h3 className="font-semibold">사용 방법</h3>
              <p className="text-sm text-gray-600">시스템 이용법</p>
            </Link>
            <Link href="#faq" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">❓</div>
              <h3 className="font-semibold">자주 묻는 질문</h3>
              <p className="text-sm text-gray-600">FAQ</p>
            </Link>
          </div>
        </div>

        {/* Membership Section */}
        <section id="membership" className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-8">💳 멤버십 안내</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">기본</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">무료</div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  기본 진도 관리
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  공지사항 확인
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  기본 퀴즈 (월 5회)
                </li>
                <li className="flex items-center">
                  <span className="text-gray-400 mr-2">✗</span>
                  AI 훈련 추천
                </li>
                <li className="flex items-center">
                  <span className="text-gray-400 mr-2">✗</span>
                  전문 강사 상담
                </li>
              </ul>
            </div>

            <div className="border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">인기</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">플러스</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">월 29,900원</div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  모든 기본 기능
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  AI 기반 훈련 추천
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  상세한 진도 분석
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  전문 강사 상담 (월 1회)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  무제한 퀴즈
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">프리미엄</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">월 59,900원</div>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  모든 플러스 기능
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  1:1 전문 강사 레슨
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  영상 분석 서비스
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  우선 예약권
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  전문 강사 상담 (무제한)
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Usage Guide */}
        <section id="usage" className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold mb-8">📱 사용 방법</h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">회원가입</h3>
                <p className="text-gray-600">
                  이메일과 비밀번호로 간단히 가입하거나, Google, Kakao 계정으로 소셜 로그인을 이용하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">레벨 평가</h3>
                <p className="text-gray-600">
                  초기 레벨 평가를 통해 현재 수영 실력을 파악하고, 맞춤형 학습 계획을 수립합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">학습 진행</h3>
                <p className="text-gray-600">
                  진도표를 확인하고, AI가 추천하는 훈련 프로그램을 따라 학습을 진행합니다.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">진도 확인</h3>
                <p className="text-gray-600">
                  정기적으로 진도를 체크하고, 강사의 피드백을 받아 지속적으로 실력을 향상시킵니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-3xl font-bold mb-8">❓ 자주 묻는 질문</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-2">Q: 수영을 전혀 못하는데도 이용할 수 있나요?</h3>
              <p className="text-gray-600">
                A: 네, 물론입니다! JJ Swim Lab은 초보자부터 고급자까지 모든 레벨을 지원합니다. 
                체계적인 단계별 학습 시스템으로 안전하게 수영을 배울 수 있습니다.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-2">Q: 멤버십을 언제든지 변경할 수 있나요?</h3>
              <p className="text-gray-600">
                A: 네, 언제든지 멤버십을 변경할 수 있습니다. 상위 플랜으로 업그레이드하면 즉시 적용되며, 
                하위 플랜으로 변경 시 다음 결제일부터 적용됩니다.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-2">Q: 강사와의 1:1 레슨은 어떻게 예약하나요?</h3>
              <p className="text-gray-600">
                A: 플러스 이상 멤버십을 이용하시면 강사 상담 서비스를 이용할 수 있습니다. 
                프리미엄 멤버십에서는 1:1 전문 강사 레슨을 예약할 수 있습니다.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-2">Q: 모의고사는 어떤 내용인가요?</h3>
              <p className="text-gray-600">
                A: 수영 이론, 건강운동관리사 자격증 관련 문제, 수영 지도법 등 다양한 주제의 
                모의고사를 제공합니다. AI가 개인별 취약점을 분석하여 맞춤형 문제를 출제합니다.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold mb-2">Q: 환불 정책은 어떻게 되나요?</h3>
              <p className="text-gray-600">
                A: 서비스 이용 후 7일 이내에 환불 요청 시 전액 환불해드립니다. 
                단, 1:1 레슨 등 개별 서비스는 별도 정책이 적용됩니다.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Q: 고객센터 연락처는 어떻게 되나요?</h3>
              <p className="text-gray-600">
                A: 고객센터는 평일 오전 9시부터 오후 6시까지 운영됩니다. 
                이메일: support@jjswimlab.com, 전화: 1588-0000
              </p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="bg-blue-600 text-white rounded-lg p-8 mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">더 궁금한 점이 있으신가요?</h2>
            <p className="mb-6">
              고객센터에 문의하거나 1:1 상담을 통해 더 자세한 안내를 받으실 수 있습니다.
            </p>
            <div className="space-x-4">
              <Link href="/auth/signup" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                회원가입
              </Link>
              <Link href="/contact" className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                문의하기
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 