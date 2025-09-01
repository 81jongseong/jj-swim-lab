'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Lightbulb,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AIDashboardProps {
  studentId: string;
  instructorId: string;
}

interface AnalysisResult {
  id: string;
  type: 'posture' | 'progress' | 'recommendation' | 'performance';
  createdAt: string;
  summary: string;
}

interface DashboardData {
  recentAnalyses: AnalysisResult[];
  progressTrend: {
    trend: number;
    direction: 'up' | 'down' | 'stable';
  };
  recommendations: string[];
  performanceMetrics: {
    avgScore: number;
    completionRate: number;
    consistency: number;
  };
}

export default function AIDashboard({ studentId, instructorId }: AIDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [studentId, instructorId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai/dashboard/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('AI 대시보드 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (analysisType: string) => {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          studentId,
          analysisType
        })
      });

      if (response.ok) {
        await loadDashboardData(); // 데이터 새로고침
      }
    } catch (error) {
      console.error('AI 분석 실행 오류:', error);
    }
  };

  const getAnalysisIcon = (type: string) => {
    switch (type) {
      case 'posture': return <Target className="w-4 h-4" />;
      case 'progress': return <TrendingUp className="w-4 h-4" />;
      case 'recommendation': return <Lightbulb className="w-4 h-4" />;
      case 'performance': return <BarChart3 className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getAnalysisColor = (type: string) => {
    switch (type) {
      case 'posture': return 'bg-blue-100 text-blue-800';
      case 'progress': return 'bg-green-100 text-green-800';
      case 'recommendation': return 'bg-yellow-100 text-yellow-800';
      case 'performance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">AI 분석 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">AI 분석 대시보드</h2>
        <div className="flex space-x-2">
          <Button 
            onClick={() => runAnalysis('progress')}
            variant="outline"
            size="sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            진도 분석
          </Button>
          <Button 
            onClick={() => runAnalysis('recommendation')}
            variant="outline"
            size="sm"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            추천 생성
          </Button>
          <Button 
            onClick={() => runAnalysis('performance')}
            size="sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            성과 분석
          </Button>
        </div>
      </div>

      {/* 성과 메트릭 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 점수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.performanceMetrics.avgScore}점
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">완료율</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.performanceMetrics.completionRate}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">일관성</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.performanceMetrics.consistency}%
                </p>
              </div>
              <div className="flex items-center">
                {getTrendIcon(dashboardData.progressTrend.direction)}
                <span className="ml-2 text-sm text-gray-600">
                  {dashboardData.progressTrend.trend > 0 ? '+' : ''}{dashboardData.progressTrend.trend}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 분석 결과 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              최근 분석 결과
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAnalysis === analysis.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedAnalysis(
                    selectedAnalysis === analysis.id ? null : analysis.id
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getAnalysisColor(analysis.type)}>
                        {getAnalysisIcon(analysis.type)}
                        <span className="ml-1 capitalize">{analysis.type}</span>
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-700 mt-2">{analysis.summary}</p>
                </div>
              ))}
              
              {dashboardData.recentAnalyses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>아직 분석 결과가 없습니다.</p>
                  <p className="text-sm">위의 버튼을 클릭하여 분석을 시작하세요.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI 추천사항 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              AI 추천사항
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-yellow-800">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700">{recommendation}</p>
                </div>
              ))}
              
              {dashboardData.recommendations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>아직 추천사항이 없습니다.</p>
                  <p className="text-sm">AI 분석을 실행하면 맞춤형 추천을 받을 수 있습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 진도 트렌드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            진도 트렌드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getTrendIcon(dashboardData.progressTrend.direction)}
                <span className="text-lg font-medium">
                  {dashboardData.progressTrend.direction === 'up' ? '상승' : 
                   dashboardData.progressTrend.direction === 'down' ? '하락' : '안정'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {dashboardData.progressTrend.trend > 0 ? '+' : ''}{dashboardData.progressTrend.trend}점 변화
              </div>
            </div>
            <Button 
              onClick={() => runAnalysis('progress')}
              variant="outline"
              size="sm"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              진도 재분석
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}