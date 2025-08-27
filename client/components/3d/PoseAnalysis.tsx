'use client';

import { useState, useEffect } from 'react';

interface PoseAnalysisProps {
  swimmingStyle: 'freestyle' | 'breaststroke' | 'backstroke' | 'butterfly';
}

interface AnalysisResult {
  category: string;
  score: number;
  status: 'excellent' | 'good' | 'needs_improvement' | 'poor';
  feedback: string;
  recommendation: string;
}

export default function PoseAnalysis({ swimmingStyle }: PoseAnalysisProps) {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 수영법별 분석 기준
  const analysisCriteria = {
    freestyle: [
      { category: '팔꿈치 각도', target: 90, tolerance: 10 },
      { category: '호흡 타이밍', target: 0.5, tolerance: 0.2 },
      { category: '다리 동작', target: 80, tolerance: 15 },
      { category: '몸의 균형', target: 85, tolerance: 10 }
    ],
    breaststroke: [
      { category: '팔 동작 순서', target: 90, tolerance: 10 },
      { category: '다리 동작 타이밍', target: 85, tolerance: 15 },
      { category: '호흡과 동작 조화', target: 80, tolerance: 15 },
      { category: '몸의 안정성', target: 85, tolerance: 10 }
    ],
    backstroke: [
      { category: '팔꿈치 구부리기', target: 90, tolerance: 10 },
      { category: '다리 동작 일정성', target: 85, tolerance: 10 },
      { category: '몸의 균형 유지', target: 90, tolerance: 8 },
      { category: '호흡 리듬', target: 80, tolerance: 15 }
    ],
    butterfly: [
      { category: '상체 웨이브', target: 85, tolerance: 12 },
      { category: '팔과 다리 동기화', target: 90, tolerance: 8 },
      { category: '호흡 타이밍', target: 80, tolerance: 15 },
      { category: '몸의 유연성', target: 85, tolerance: 10 }
    ]
  };

  // 분석 시작
  const startAnalysis = () => {
    setIsAnalyzing(true);
    
    // 시뮬레이션된 분석 (실제로는 AI 모델과 연동)
    setTimeout(() => {
      const results = analysisCriteria[swimmingStyle].map(criteria => {
        const actualValue = criteria.target + (Math.random() - 0.5) * criteria.tolerance * 2;
        const score = Math.max(0, Math.min(100, 
          (1 - Math.abs(actualValue - criteria.target) / criteria.tolerance) * 100
        ));
        
        let status: AnalysisResult['status'];
        let feedback: string;
        let recommendation: string;
        
        if (score >= 90) {
          status = 'excellent';
          feedback = '완벽한 자세입니다!';
          recommendation = '현재 자세를 유지하세요.';
        } else if (score >= 75) {
          status = 'good';
          feedback = '좋은 자세입니다.';
          recommendation = '약간의 개선으로 더욱 완벽해질 수 있습니다.';
        } else if (score >= 60) {
          status = 'needs_improvement';
          feedback = '개선이 필요한 자세입니다.';
          recommendation = '기본 동작을 다시 연습해보세요.';
        } else {
          status = 'poor';
          feedback = '자세를 크게 개선해야 합니다.';
          recommendation = '전문가의 지도를 받아보세요.';
        }
        
        return {
          category: criteria.category,
          score: Math.round(score),
          status,
          feedback,
          recommendation
        };
      });
      
      setAnalysisResults(results);
      setIsAnalyzing(false);
    }, 2000);
  };

  // 상태별 색상
  const getStatusColor = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'needs_improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // 상태별 아이콘
  const getStatusIcon = (status: AnalysisResult['status']) => {
    switch (status) {
      case 'excellent': return '🏆';
      case 'good': return '👍';
      case 'needs_improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  useEffect(() => {
    // 컴포넌트 마운트 시 자동 분석 시작
    startAnalysis();
  }, [swimmingStyle]);

  return (
    <div className="space-y-4">
      {isAnalyzing ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">자세를 분석하고 있습니다...</p>
        </div>
      ) : (
        <>
          {/* 전체 점수 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-1">
              {Math.round(analysisResults.reduce((sum, result) => sum + result.score, 0) / analysisResults.length)}
            </div>
            <div className="text-sm opacity-90">전체 자세 점수</div>
          </div>
          
          {/* 분석 결과 */}
          <div className="space-y-3">
            {analysisResults.map((result, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{result.category}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm px-2 py-1 rounded-full ${getStatusColor(result.status)}`}>
                      {getStatusIcon(result.status)} {result.status === 'excellent' ? '완벽' : 
                        result.status === 'good' ? '좋음' : 
                        result.status === 'needs_improvement' ? '개선 필요' : '개선 필수'}
                    </span>
                    <span className="text-lg font-bold text-gray-900">{result.score}점</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">{result.feedback}</div>
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  💡 {result.recommendation}
                </div>
              </div>
            ))}
          </div>
          
          {/* 재분석 버튼 */}
          <button
            onClick={startAnalysis}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            🔄 자세 재분석
          </button>
        </>
      )}
    </div>
  );
}
