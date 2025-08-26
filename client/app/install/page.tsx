'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InstallPage() {
  const [selectedDevice, setSelectedDevice] = useState<'android' | 'ios' | 'desktop'>('android');

  const installGuides = {
    android: {
      title: 'Android 기기 설치 방법',
      steps: [
        'Chrome 브라우저에서 JJ Swim Lab 사이트에 접속',
        '주소창 옆의 메뉴 버튼(⋮) 클릭',
        '"홈 화면에 추가" 또는 "앱 설치" 선택',
        '"추가" 버튼 클릭하여 설치 완료',
        '홈 화면에서 JJ Swim Lab 앱 아이콘 확인'
      ],
      icon: '📱',
      color: 'from-green-500 to-emerald-600'
    },
    ios: {
      title: 'iOS 기기 설치 방법',
      steps: [
        'Safari 브라우저에서 JJ Swim Lab 사이트에 접속',
        '하단 공유 버튼(□↑) 클릭',
        '"홈 화면에 추가" 선택',
        '"추가" 버튼 클릭하여 설치 완료',
        '홈 화면에서 JJ Swim Lab 앱 아이콘 확인'
      ],
      icon: '🍎',
      color: 'from-blue-500 to-indigo-600'
    },
    desktop: {
      title: '데스크톱 설치 방법',
      steps: [
        'Chrome/Edge 브라우저에서 JJ Swim Lab 사이트에 접속',
        '주소창 옆의 설치 아이콘(⬇️) 클릭',
        '"JJ Swim Lab 설치" 버튼 클릭',
        '설치 완료 후 시작 메뉴에서 앱 실행',
        '바탕화면에 바로가기 생성 가능'
      ],
      icon: '💻',
      color: 'from-purple-500 to-pink-600'
    }
  };

  const benefits = [
    {
      icon: '🚀',
      title: '빠른 실행',
      description: '브라우저 실행 없이 바로 앱 실행'
    },
    {
      icon: '📱',
      title: '네이티브 앱 경험',
      description: '모바일 앱과 동일한 사용자 경험'
    },
    {
      icon: '🔒',
      title: '오프라인 지원',
      description: '인터넷 없어도 핵심 기능 사용 가능'
    },
    {
      icon: '💾',
      title: '자동 업데이트',
      description: '새로운 기능 자동으로 적용'
    },
    {
      icon: '🏠',
      title: '홈 화면 접근',
      description: '홈 화면에서 바로 실행 가능'
    },
    {
      icon: '⚡',
      title: '빠른 로딩',
      description: '캐시된 데이터로 빠른 페이지 로딩'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-4xl">J</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            JJ Swim Lab 앱 설치
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            홈 화면에 추가하여 더 빠르고 편리하게 사용하세요.
            오프라인에서도 모든 핵심 기능을 사용할 수 있습니다.
          </p>
        </div>

        {/* 설치 방법 선택 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📱 기기별 설치 방법
          </h2>
          
          {/* 기기 선택 탭 */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 rounded-lg p-1">
              {(['android', 'ios', 'desktop'] as const).map((device) => (
                <button
                  key={device}
                  onClick={() => setSelectedDevice(device)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-200 ${
                    selectedDevice === device
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {installGuides[device].icon} {
                    device === 'android' ? 'Android' : 
                    device === 'ios' ? 'iOS' : '데스크톱'
                  }
                </button>
              ))}
            </div>
          </div>

          {/* 선택된 기기의 설치 방법 */}
          <div className="text-center">
            <div className={`w-20 h-20 bg-gradient-to-br ${installGuides[selectedDevice].color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
              <span className="text-white text-3xl">{installGuides[selectedDevice].icon}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              {installGuides[selectedDevice].title}
            </h3>
            
            <div className="max-w-md mx-auto">
              <ol className="space-y-4 text-left">
                {installGuides[selectedDevice].steps.map((step, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* PWA 혜택 */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            ✨ PWA 설치의 장점
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 오프라인 기능 설명 */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">
            🔴 오프라인에서도 사용 가능한 기능
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">📚 강습법 관리</h3>
              <ul className="space-y-2 text-blue-100">
                <li>• 저장된 강습법 조회</li>
                <li>• 레벨별 강습법 필터링</li>
                <li>• 강습법 수정 (동기화 대기)</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">👨‍🎓 학생 관리</h3>
              <ul className="space-y-2 text-blue-100">
                <li>• 학생 정보 조회</li>
                <li>• 학생 레벨 변경 (동기화 대기)</li>
                <li>• 체크리스트 작성</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-blue-100 mb-4">
              온라인 복구 시 자동으로 모든 오프라인 작업이 서버와 동기화됩니다!
            </p>
            <div className="inline-flex items-center space-x-2 bg-white/20 rounded-lg px-4 py-2">
              <span>🔄</span>
              <span className="text-sm">자동 동기화 지원</span>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <span>🏠</span>
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


