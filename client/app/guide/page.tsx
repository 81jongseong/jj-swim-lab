'use client';

import { useState } from 'react';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('student');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-16">
      {/* 히어로 섹션 */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mb-6">
              <span className="text-3xl">🏊‍♂️</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              JJ Swim Lab 이용 안내
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              AI 기반 스마트 수영 교육 플랫폼으로<br />
              <span className="font-semibold text-blue-600">개인 맞춤형 수영 프로그램</span>을 시작하세요
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <span className="text-2xl mr-2">🤖</span>
                <span className="text-sm font-medium text-gray-700">AI 맞춤 프로그램</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <span className="text-2xl mr-2">📊</span>
                <span className="text-sm font-medium text-gray-700">실시간 진도 추적</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                <span className="text-2xl mr-2">🏥</span>
                <span className="text-sm font-medium text-gray-700">건강 상태 고려</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="space-y-12">
          {/* 플랫폼 이용 절차 - 인터랙티브 스텝 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                🚀 시작하기
              </h2>
              <p className="text-gray-600 text-lg">5단계로 간단하게 시작하는 JJ Swim Lab</p>
            </div>
            
            <div className="grid md:grid-cols-5 gap-6">
              {[
                {
                  step: 1,
                  icon: "👤",
                  title: "회원가입",
                  description: "학생/강사/센터 관리자 중 선택",
                  detail: "원하는 계정 유형을 선택하여 간단하게 가입하세요"
                },
                {
                  step: 2,
                  icon: "🏥",
                  title: "건강 프로필",
                  description: "개인 건강 정보 입력",
                  detail: "AI가 맞춤 프로그램을 위해 건강 상태를 분석합니다"
                },
                {
                  step: 3,
                  icon: "🗺️",
                  title: "센터/강사 찾기",
                  description: "지도에서 원하는 지역 선택",
                  detail: "가까운 수영센터와 전문 강사를 찾아 등록하세요"
                },
                {
                  step: 4,
                  icon: "🤖",
                  title: "AI 프로그램 생성",
                  description: "개인 맞춤 프로그램 자동 생성",
                  detail: "건강 상태와 목표에 맞는 최적의 훈련 프로그램"
                },
                {
                  step: 5,
                  icon: "📊",
                  title: "실시간 진도 관리",
                  description: "강사 피드백과 실력 추적",
                  detail: "지속적인 모니터링으로 효과적인 수영 학습"
                }
              ].map((step, index) => (
                <div key={step.step} className="relative group">
                  {/* 연결선 */}
                  {index < 4 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent z-0"></div>
                  )}
                  
                  <div className="relative bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 border border-blue-100">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg">
                        {step.icon}
                      </div>
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-3">
                        {step.step}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                      <p className="text-sm text-blue-600 font-medium mb-2">{step.description}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 플랫폼 주요 기능 - 모던 카드 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                ✨ 핵심 기능
              </h2>
              <p className="text-gray-600 text-lg">JJ Swim Lab만의 혁신적인 수영 교육 솔루션</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "🤖",
                  title: "AI 맞춤 프로그램",
                  description: "건강 상태, 체력, 목표 분석",
                  features: ["개인별 최적화", "실시간 조정", "과학적 근거"],
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: "📊",
                  title: "건강 데이터 관리",
                  description: "체계적인 건강 정보 추적",
                  features: ["질환 관리", "컨디션 기록", "체력 변화 분석"],
                  color: "from-green-500 to-emerald-500"
                },
                {
                  icon: "💬",
                  title: "실시간 소통",
                  description: "강사-학생 즉시 피드백",
                  features: ["실시간 알림", "진도 공유", "상태 업데이트"],
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: "📈",
                  title: "진도 추적 분석",
                  description: "시각적 학습 진도 관리",
                  features: ["성과 차트", "목표 달성률", "개선 포인트"],
                  color: "from-orange-500 to-red-500"
                }
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border border-gray-100 h-full">
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{feature.description}</p>
                      <div className="space-y-1">
                        {feature.features.map((item, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-500">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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

          {/* 계정별 이용 안내 - 탭 형태 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                👥 계정별 이용 안내
              </h2>
              <p className="text-gray-600 text-lg">역할별 맞춤 기능과 서비스를 확인하세요</p>
            </div>
            
            {/* 탭 네비게이션 */}
            <div className="flex flex-wrap justify-center mb-8">
              {[
                { id: 'student', label: '🏊 학생', color: 'blue' },
                { id: 'instructor', label: '👨‍🏫 강사', color: 'green' },
                { id: 'center', label: '🏢 센터 관리자', color: 'purple' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 mr-4 mb-2 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${
                          tab.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                          tab.color === 'green' ? 'from-green-500 to-emerald-500' :
                          'from-purple-500 to-pink-500'
                        } text-white shadow-lg transform scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            
            {/* 탭 콘텐츠 */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8">
              {activeTab === 'student' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                      🏊
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">학생 (회원) 서비스</h3>
                    <p className="text-gray-600">개인 맞춤형 수영 학습의 모든 것</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { icon: '🏥', title: '건강 프로필 작성', desc: '개인 건강 상태와 목표를 상세히 입력하여 AI가 맞춤 프로그램을 생성합니다' },
                      { icon: '🗺️', title: '센터/강사 검색', desc: '지도에서 가까운 수영센터와 전문 강사를 찾아 등록할 수 있습니다' },
                      { icon: '📊', title: '실시간 진도 확인', desc: '학습 진도와 실력 향상을 실시간 알림으로 확인하고 상태 업데이트를 받습니다' },
                      { icon: '🧠', title: '학습 보조 도구', desc: '퀴즈와 3D 뷰어를 통해 수영 기술을 효과적으로 학습합니다' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'instructor' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                      👨‍🏫
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">강사 서비스</h3>
                    <p className="text-gray-600">전문적인 수영 지도를 위한 통합 관리 도구</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { icon: '👥', title: '학생 프로필 관리', desc: '각 학생의 건강 상태와 학습 목표를 확인하여 맞춤 지도를 제공합니다' },
                      { icon: '📅', title: '수업 일정 관리', desc: '수업 일정을 체계적으로 관리하고 출결을 간편하게 체크합니다' },
                      { icon: '💬', title: '실시간 피드백', desc: '수업 중 즉시 알림을 전송하고 진도 평가를 기록합니다' },
                      { icon: '📋', title: '개별 공지 관리', desc: '학생별 준비물과 주의사항을 개별적으로 안내합니다' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {activeTab === 'center' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                      🏢
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">센터 관리자 서비스</h3>
                    <p className="text-gray-600">수영센터 운영을 위한 종합 관리 시스템</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { icon: '👥', title: '통합 회원 관리', desc: '강사와 회원을 한 곳에서 체계적으로 관리하고 현황을 파악합니다' },
                      { icon: '🏊‍♂️', title: '센터 정보 관리', desc: '센터 소개, 시설 정보, 운영 시간 등을 상세히 등록하고 관리합니다' },
                      { icon: '💰', title: '매출 현황 분석', desc: '실시간 매출과 운영 현황을 확인하여 비즈니스 인사이트를 얻습니다' },
                      { icon: '📚', title: '수업 과정 관리', desc: '다양한 수업 과정과 일정을 효율적으로 관리하고 최적화합니다' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

          {/* FAQ 섹션 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
                ❓ 자주 묻는 질문
              </h2>
              <p className="text-gray-600 text-lg">JJ Swim Lab 이용 시 궁금한 점들을 확인하세요</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  q: "JJ Swim Lab는 어떻게 작동하나요?",
                  a: "AI가 개인의 건강 상태, 체력, 목표를 분석하여 맞춤형 수영 프로그램을 자동 생성합니다. 강사는 실시간 알림을 통해 진도를 확인하고 개별 지도를 제공합니다."
                },
                {
                  q: "건강 정보는 안전하게 보호되나요?",
                  a: "네, 모든 개인정보와 건강 데이터는 암호화되어 안전하게 보관되며, 개인정보보호법에 따라 엄격히 관리됩니다."
                },
                {
                  q: "수영 초보자도 이용할 수 있나요?",
                  a: "물론입니다! 초보자부터 전문 수영선수까지 모든 레벨에 맞는 프로그램을 제공합니다. AI가 개인의 실력에 맞춰 점진적으로 난이도를 조정합니다."
                },
                {
                  q: "센터 등록은 어떻게 하나요?",
                  a: "지도에서 원하는 지역의 수영센터를 찾아 클릭하면 센터 정보와 강사 목록을 확인할 수 있습니다. 온라인으로 간편하게 등록하실 수 있습니다."
                },
                {
                  q: "환불 정책은 어떻게 되나요?",
                  a: "환불 정책은 각 센터마다 다를 수 있습니다. 등록 전 해당 센터의 환불 정책을 반드시 확인해주세요. 일반적으로 수업 시작 전에는 전액 환불이 가능합니다."
                },
                {
                  q: "모바일에서도 이용 가능한가요?",
                  a: "네, JJ Swim Lab은 반응형 웹으로 제작되어 스마트폰, 태블릿, PC 모든 기기에서 최적화된 환경을 제공합니다."
                },
                {
                  q: "강사와 실시간 채팅이 가능한가요?",
                  a: "현재는 실시간 알림 시스템을 통해 진도 공유와 피드백을 받을 수 있습니다. 실시간 채팅 기능은 추후 업데이트 예정입니다."
                },
                {
                  q: "학습 도구는 어떤 것들이 있나요?",
                  a: "3D 뷰어를 통한 수영 기술 시각화와 퀴즈를 통한 지식 학습이 가능합니다. 강사가 제공하는 맞춤형 피드백과 실시간 알림을 통해 효과적으로 학습할 수 있습니다."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-start">
                    <span className="text-blue-600 mr-2 mt-1">Q.</span>
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed flex items-start">
                    <span className="text-green-600 mr-2 mt-1 font-bold">A.</span>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 고객 지원 - 업그레이드 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                📞 고객 지원
              </h2>
              <p className="text-gray-600 text-lg">언제든지 도움이 필요하시면 연락주세요</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  📧
                </div>
                <h3 className="font-bold text-gray-900 mb-2">이메일 지원</h3>
                <p className="text-sm text-gray-600 mb-3">24시간 내 답변</p>
                <a href="mailto:support@jjswimlab.com" className="text-blue-600 font-semibold hover:underline">
                  support@jjswimlab.com
                </a>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  📱
                </div>
                <h3 className="font-bold text-gray-900 mb-2">전화 지원</h3>
                <p className="text-sm text-gray-600 mb-3">평일 9:00-18:00</p>
                <a href="tel:02-1234-5678" className="text-green-600 font-semibold hover:underline">
                  02-1234-5678
                </a>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-center shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                  💬
                </div>
                <h3 className="font-bold text-gray-900 mb-2">카카오톡</h3>
                <p className="text-sm text-gray-600 mb-3">실시간 채팅 지원</p>
                <a href="#" className="text-purple-600 font-semibold hover:underline">
                  @jjswimlab
                </a>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border-l-4 border-yellow-400">
              <div className="flex items-start">
                <span className="text-2xl mr-3">💡</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">센터/강습 관련 문의</h3>
                  <p className="text-gray-700 text-sm">
                    각 센터 및 강사의 연락처는 센터 정보 페이지에서 확인하실 수 있습니다. 
                    센터별 특별 이벤트나 프로그램에 대해서는 해당 센터에 직접 문의해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 