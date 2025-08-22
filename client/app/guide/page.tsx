'use client';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용 안내</h1>

        <div className="space-y-6">
          {/* 이용 시간 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🕐 이용 시간</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">평일</h3>
                <p className="text-gray-700">09:00 - 22:00</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">주말 및 공휴일</h3>
                <p className="text-gray-700">09:00 - 20:00</p>
              </div>
            </div>
          </div>

          {/* 이용 절차 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 이용 절차</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">1</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">회원가입</h3>
                  <p className="text-gray-700">홈페이지에서 회원가입을 진행합니다.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">2</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">강습 신청</h3>
                  <p className="text-gray-700">원하는 강습 과정을 선택하고 신청합니다.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">3</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">결제</h3>
                  <p className="text-gray-700">수강료를 결제합니다.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4 mt-1">4</div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">수업 참여</h3>
                  <p className="text-gray-700">정해진 시간에 수업에 참여합니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 준비물 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎒 준비물</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">필수 준비물</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• 수영복</li>
                  <li>• 수영모자</li>
                  <li>• 고글</li>
                  <li>• 수건</li>
                  <li>• 샤워용품</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">선택 준비물</h3>
                <ul className="text-gray-700 space-y-1">
                  <li>• 수영 오리발</li>
                  <li>• 수영 보드</li>
                  <li>• 귀마개</li>
                  <li>• 코클립</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚠️ 주의사항</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <p className="text-gray-700">수업 시작 10분 전에 도착해주세요.</p>
              </div>
              <div className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <p className="text-gray-700">수업 전후 반드시 샤워를 해주세요.</p>
              </div>
              <div className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <p className="text-gray-700">건강상 문제가 있으시면 사전에 알려주세요.</p>
              </div>
              <div className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <p className="text-gray-700">수업 중 안전을 위해 강사의 지시를 따라주세요.</p>
              </div>
              <div className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <p className="text-gray-700">개인 물품은 락커에 보관하고 키를 반납해주세요.</p>
              </div>
            </div>
          </div>

          {/* 환불 정책 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💰 환불 정책</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">수업 시작 전</span>
                <span className="font-medium text-green-600">100% 환불</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">수업 1/3 이전</span>
                <span className="font-medium text-blue-600">2/3 환불</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">수업 1/2 이전</span>
                <span className="font-medium text-yellow-600">1/2 환불</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">수업 1/2 이후</span>
                <span className="font-medium text-red-600">환불 불가</span>
              </div>
            </div>
          </div>

          {/* 문의 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📞 문의</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">전화 문의</h3>
                <p className="text-gray-700">02-1234-5678</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">이메일 문의</h3>
                <p className="text-gray-700">info@jjswimlab.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 