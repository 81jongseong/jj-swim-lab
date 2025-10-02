'use client';

import { useState } from 'react';
import { Printer, AlertTriangle, Download } from 'lucide-react';

export default function SwimJointGuidePage() {
  const [warningSigns, setWarningSigns] = useState({
    swelling: false,
    fever: false,
    nightPain: false,
    neurological: false,
    wound: false
  });

  const handlePrint = () => {
    window.print();
  };

  const handleWarningSignChange = (sign: keyof typeof warningSigns) => {
    setWarningSigns(prev => ({
      ...prev,
      [sign]: !prev[sign]
    }));
  };

  const hasWarningSigns = Object.values(warningSigns).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                관절질환별 수영 영법 가이드
              </h1>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded">
                  마지막 업데이트: {new Date().toLocaleDateString('ko-KR')}
                </span>
                <span className="px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  28개 질환 · 6개 영법
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button 
                onClick={handlePrint}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                A4 인쇄
              </button>
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                PDF 저장
              </button>
            </div>
          </div>

          {/* 주의 신호 체크박스 */}
          <div className={`mb-6 p-4 rounded-lg ${hasWarningSigns ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">
                  {hasWarningSigns ? '⚠️ 운동 중단 신호가 감지되었습니다!' : '주의 신호 체크'}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  아래 증상이 있다면 수영을 중단하고 의료진과 상담하세요:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                  {[
                    { key: 'swelling', label: '붓기' },
                    { key: 'fever', label: '발열' },
                    { key: 'nightPain', label: '야간통' },
                    { key: 'neurological', label: '신경학적 증상' },
                    { key: 'wound', label: '상처 문제' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={key}
                        checked={warningSigns[key as keyof typeof warningSigns]}
                        onChange={() => handleWarningSignChange(key as keyof typeof warningSigns)}
                        className="rounded border-gray-300"
                      />
                      <label 
                        htmlFor={key} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                {hasWarningSigns && (
                  <p className="text-red-700 font-semibold text-sm mt-2">
                    ⚠️ 위 증상이 있다면 즉시 수영을 중단하고 의료진과 상담하세요!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 메인 탭 컨텐츠 */}
        <div className="w-full">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
                요약 매트릭스
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                질환별 가이드
              </button>
              <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
                참고문헌
              </button>
            </nav>
          </div>

          {/* 요약 매트릭스 탭 */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">영법별 질환 매트릭스</h2>
              <p className="text-gray-600 mb-6">
                각 관절질환에 대한 수영 영법의 안전도를 점수로 표시합니다. 
                3점(추천)부터 0점(회피)까지 4단계로 구분됩니다.
              </p>
            </div>
            
            {/* 매트릭스 테이블 */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">질환</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">자유형</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배영</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평영</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접영</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">어깨 충돌증후군</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">0점</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">3점</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">2점</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">0점</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">무릎 골관절염</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">3점</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">3점</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">0점</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">0점</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 개발용 체크리스트 (빌드 시 제거) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 p-6 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">개발용 체크리스트</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">기능 테스트</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>□ 매트릭스 필터링 및 정렬 작동</li>
                  <li>□ 질환별 아코디언 펼침/접힘</li>
                  <li>□ 근거 뱃지 툴팁 표시</li>
                  <li>□ 인쇄 버튼 작동</li>
                  <li>□ 주의 신호 체크박스</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">반응형 테스트</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>□ 모바일 (≤390px) 레이아웃</li>
                  <li>□ 태블릿 (768px) 레이아웃</li>
                  <li>□ 데스크톱 (≥1280px) 레이아웃</li>
                  <li>□ 인쇄 미리보기 (A4)</li>
                  <li>□ 다크모드 대응</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}