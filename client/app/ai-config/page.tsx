'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui';
import { Badge } from '../../components/ui';
import { 
  Brain, 
  Settings, 
  Target,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Save,
  RefreshCw,
  Info
} from 'lucide-react';

interface AIConfig {
  postureAnalysis: {
    enabled: boolean;
    techniques: string[];
    weights: { [key: string]: number };
  };
  progressPrediction: {
    enabled: boolean;
    confidenceThreshold: number;
    dataPointsRequired: number;
  };
  personalizedRecommendation: {
    enabled: boolean;
    focusAreas: string[];
    exerciseDatabase: string[];
  };
  performanceAnalysis: {
    enabled: boolean;
    metrics: string[];
    thresholds: { [key: string]: number };
  };
}

export default function AIConfigPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<AIConfig>({
    postureAnalysis: {
      enabled: true,
      techniques: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
      weights: {
        '자세': 0.3,
        '호흡': 0.25,
        '팔동작': 0.25,
        '다리동작': 0.15,
        '타이밍': 0.05
      }
    },
    progressPrediction: {
      enabled: true,
      confidenceThreshold: 0.7,
      dataPointsRequired: 5
    },
    personalizedRecommendation: {
      enabled: true,
      focusAreas: ['자세', '호흡', '팔동작', '다리동작', '타이밍'],
      exerciseDatabase: [
        '플랭크', '코어 스트레칭', '자세 교정 운동',
        '호흡 연습', '수중 호흡', '호흡 타이밍 연습',
        '팔 스트로크 연습', '풀링 연습', '리커버리 연습',
        '킥 연습', '다리 근력 운동', '플렉서빌리티',
        '리듬 연습', '타이밍 연습', '조화 운동'
      ]
    },
    performanceAnalysis: {
      enabled: true,
      metrics: ['overallScore', 'improvementRate', 'consistencyScore'],
      thresholds: {
        'excellent': 90,
        'good': 70,
        'average': 50,
        'poor': 30
      }
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setConfig(data.data);
        }
      }
    } catch (error) {
      console.error('AI 설정 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ai/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('AI 설정 저장 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetToDefault = () => {
    setConfig({
      postureAnalysis: {
        enabled: true,
        techniques: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'],
        weights: {
          '자세': 0.3,
          '호흡': 0.25,
          '팔동작': 0.25,
          '다리동작': 0.15,
          '타이밍': 0.05
        }
      },
      progressPrediction: {
        enabled: true,
        confidenceThreshold: 0.7,
        dataPointsRequired: 5
      },
      personalizedRecommendation: {
        enabled: true,
        focusAreas: ['자세', '호흡', '팔동작', '다리동작', '타이밍'],
        exerciseDatabase: [
          '플랭크', '코어 스트레칭', '자세 교정 운동',
          '호흡 연습', '수중 호흡', '호흡 타이밍 연습',
          '팔 스트로크 연습', '풀링 연습', '리커버리 연습',
          '킥 연습', '다리 근력 운동', '플렉서빌리티',
          '리듬 연습', '타이밍 연습', '조화 운동'
        ]
      },
      performanceAnalysis: {
        enabled: true,
        metrics: ['overallScore', 'improvementRate', 'consistencyScore'],
        thresholds: {
          'excellent': 90,
          'good': 70,
          'average': 50,
          'poor': 30
        }
      }
    });
  };

  if (!user || (user.userType !== 'instructor' && user.userType !== 'centerAdmin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 권한이 없습니다</h2>
          <p className="text-gray-600">AI 설정은 강사 또는 센터 관리자만 사용할 수 있습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Settings className="w-8 h-8 mr-3 text-blue-600" />
                AI 설정
              </h1>
              <p className="mt-2 text-gray-600">
                AI 분석 시스템의 동작 방식을 설정하고 최적화합니다
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={resetToDefault}
                variant="outline"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                기본값 복원
              </Button>
              <Button 
                onClick={saveConfig}
                disabled={loading}
                className={saved ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {saved ? (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    저장됨
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 자세 분석 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                자세 분석 설정
                <Badge className="ml-2" variant={config.postureAnalysis.enabled ? "default" : "secondary"}>
                  {config.postureAnalysis.enabled ? '활성화' : '비활성화'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="posture-enabled"
                  checked={config.postureAnalysis.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    postureAnalysis: {
                      ...config.postureAnalysis,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="posture-enabled" className="text-sm font-medium">
                  자세 분석 기능 활성화
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  지원 기술
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['freestyle', 'backstroke', 'breaststroke', 'butterfly'].map((technique) => (
                    <div key={technique} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`technique-${technique}`}
                        checked={config.postureAnalysis.techniques.includes(technique)}
                        onChange={(e) => {
                          const techniques = e.target.checked
                            ? [...config.postureAnalysis.techniques, technique]
                            : config.postureAnalysis.techniques.filter(t => t !== technique);
                          setConfig({
                            ...config,
                            postureAnalysis: {
                              ...config.postureAnalysis,
                              techniques
                            }
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`technique-${technique}`} className="text-sm">
                        {technique === 'freestyle' ? '자유형' :
                         technique === 'backstroke' ? '배영' :
                         technique === 'breaststroke' ? '평영' : '접영'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  분석 가중치
                </label>
                <div className="space-y-2">
                  {Object.entries(config.postureAnalysis.weights).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-4">
                      <span className="w-20 text-sm">{key}</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={value}
                        onChange={(e) => setConfig({
                          ...config,
                          postureAnalysis: {
                            ...config.postureAnalysis,
                            weights: {
                              ...config.postureAnalysis.weights,
                              [key]: parseFloat(e.target.value)
                            }
                          }
                        })}
                        className="flex-1"
                      />
                      <span className="w-12 text-sm text-right">{Math.round(value * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 진도 예측 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                진도 예측 설정
                <Badge className="ml-2" variant={config.progressPrediction.enabled ? "default" : "secondary"}>
                  {config.progressPrediction.enabled ? '활성화' : '비활성화'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="progress-enabled"
                  checked={config.progressPrediction.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    progressPrediction: {
                      ...config.progressPrediction,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="progress-enabled" className="text-sm font-medium">
                  진도 예측 기능 활성화
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    신뢰도 임계값
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={config.progressPrediction.confidenceThreshold}
                    onChange={(e) => setConfig({
                      ...config,
                      progressPrediction: {
                        ...config.progressPrediction,
                        confidenceThreshold: parseFloat(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    {Math.round(config.progressPrediction.confidenceThreshold * 100)}%
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    최소 데이터 포인트
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.progressPrediction.dataPointsRequired}
                    onChange={(e) => setConfig({
                      ...config,
                      progressPrediction: {
                        ...config.progressPrediction,
                        dataPointsRequired: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 개인화 추천 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2" />
                개인화 추천 설정
                <Badge className="ml-2" variant={config.personalizedRecommendation.enabled ? "default" : "secondary"}>
                  {config.personalizedRecommendation.enabled ? '활성화' : '비활성화'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recommendation-enabled"
                  checked={config.personalizedRecommendation.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    personalizedRecommendation: {
                      ...config.personalizedRecommendation,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="recommendation-enabled" className="text-sm font-medium">
                  개인화 추천 기능 활성화
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  집중 영역
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['자세', '호흡', '팔동작', '다리동작', '타이밍', '균형', '리듬'].map((area) => (
                    <div key={area} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`area-${area}`}
                        checked={config.personalizedRecommendation.focusAreas.includes(area)}
                        onChange={(e) => {
                          const focusAreas = e.target.checked
                            ? [...config.personalizedRecommendation.focusAreas, area]
                            : config.personalizedRecommendation.focusAreas.filter(a => a !== area);
                          setConfig({
                            ...config,
                            personalizedRecommendation: {
                              ...config.personalizedRecommendation,
                              focusAreas
                            }
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`area-${area}`} className="text-sm">
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 성과 분석 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                성과 분석 설정
                <Badge className="ml-2" variant={config.performanceAnalysis.enabled ? "default" : "secondary"}>
                  {config.performanceAnalysis.enabled ? '활성화' : '비활성화'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="performance-enabled"
                  checked={config.performanceAnalysis.enabled}
                  onChange={(e) => setConfig({
                    ...config,
                    performanceAnalysis: {
                      ...config.performanceAnalysis,
                      enabled: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="performance-enabled" className="text-sm font-medium">
                  성과 분석 기능 활성화
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  성과 등급 임계값
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(config.performanceAnalysis.thresholds).map(([grade, threshold]) => (
                    <div key={grade} className="flex items-center space-x-4">
                      <span className="w-20 text-sm capitalize">{grade}</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={threshold}
                        onChange={(e) => setConfig({
                          ...config,
                          performanceAnalysis: {
                            ...config.performanceAnalysis,
                            thresholds: {
                              ...config.performanceAnalysis.thresholds,
                              [grade]: parseInt(e.target.value)
                            }
                          }
                        })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">점 이상</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 시스템 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="w-5 h-5 mr-2" />
                시스템 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">AI 엔진:</span>
                  <span className="ml-2 text-gray-600">내장 규칙 기반 시스템</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">분석 방식:</span>
                  <span className="ml-2 text-gray-600">패턴 분석 + 통계 기반</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">데이터 소스:</span>
                  <span className="ml-2 text-gray-600">체크리스트 + 학습 기록</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">업데이트:</span>
                  <span className="ml-2 text-gray-600">실시간</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}