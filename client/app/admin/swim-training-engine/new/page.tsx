/**
 * 🏊‍♂️ JJ Swim Lab - 새로운 수영 프로그램 생성기 페이지
 * 
 * 📋 **기능:**
 * - 새로운 엔진 기반 수영 프로그램 생성
 * - PlannerForm 컴포넌트 사용
 * - 기존 엔진과의 통합
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import PlannerForm from '../../../../components/PlannerForm';
import { 
  getEngineStatus, 
  initializeEngine,
  TRAINING_METHODS,
  DRILLS,
  getMedicalEvidence
} from '../../../../swim-training-engine/src';
import { 
  Zap, 
  Activity, 
  Target, 
  Settings, 
  BookOpen,
  Shield,
  Heart,
  Clock,
  BarChart3,
  Play,
  Download,
  Code,
  Database,
  Cpu,
  Info,
  AlertTriangle,
  CheckCircle,
  Users,
  TrendingUp,
  FileText,
  Calendar,
  Star,
  Award,
  User,
  Plus,
  ExternalLink
} from 'lucide-react';

export default function NewSwimEnginePage() {
  const { user } = useAuth();
  const [engineStatus, setEngineStatus] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [activeTab, setActiveTab] = useState('planner');
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  useEffect(() => {
    initializeEngineStatus();
  }, []);

  const initializeEngineStatus = async () => {
    setIsInitializing(true);
    try {
      const status = getEngineStatus();
      setEngineStatus(status);
      
      // 엔진 초기화
      const initialized = await initializeEngine();
      if (initialized) {
        console.log('✅ JJ Swim Lab 엔진 초기화 완료');
      }
    } catch (error) {
      console.error('❌ 엔진 초기화 오류:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handlePlanGenerated = (plan: any) => {
    setGeneratedPlan(plan);
    console.log('✅ 수영 프로그램 생성 완료:', plan);
  };

  const tabs = [
    { id: 'planner', label: '프로그램 생성기', icon: Zap },
    { id: 'training-methods', label: '훈련법 가이드', icon: BookOpen },
    { id: 'drills', label: '드릴 가이드', icon: Target },
    { id: 'medical-evidence', label: '의학적 근거', icon: Shield },
    { id: 'engine-status', label: '엔진 상태', icon: Cpu }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🏊‍♂️ JJ Swim Lab - 새로운 수영 프로그램 생성기
              </h1>
              <p className="mt-2 text-gray-600">
                건강·질환·기술 기반 개인별 수영 프로그램을 생성합니다.
              </p>
            </div>
            
            {engineStatus && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${engineStatus.status === 'ready' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>엔진 v{engineStatus.version}</span>
              </div>
            )}
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'planner' && (
            <div className="p-6">
              <PlannerForm onPlanGenerated={handlePlanGenerated} />
            </div>
          )}

          {activeTab === 'training-methods' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  훈련법 가이드
                </h2>
                <p className="text-gray-600">
                  {TRAINING_METHODS.length}가지 훈련법의 상세 정보를 확인하세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TRAINING_METHODS.map((method) => (
                  <div key={method.id} className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {method.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      {method.definition}
                    </p>

                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-gray-700">목표</h4>
                        <ul className="text-sm text-gray-600">
                          {method.goals.map((goal, index) => (
                            <li key={index}>• {goal}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700">장점</h4>
                        <ul className="text-sm text-gray-600">
                          {method.pros.map((pro, index) => (
                            <li key={index}>• {pro}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700">주의사항</h4>
                        <ul className="text-sm text-gray-600">
                          {method.cautions.map((caution, index) => (
                            <li key={index}>• {caution}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'drills' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  드릴 가이드
                </h2>
                <p className="text-gray-600">
                  {DRILLS.length}가지 드릴의 상세 정보를 확인하세요.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DRILLS.map((drill) => (
                  <div key={drill.id} className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {drill.name}
                    </h3>
                    
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-medium text-gray-700">효과</h4>
                        <ul className="text-sm text-gray-600">
                          {drill.helps.map((help, index) => (
                            <li key={index}>• {help}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700">코칭 포인트</h4>
                        <ul className="text-sm text-gray-600">
                          {drill.cues.map((cue, index) => (
                            <li key={index}>• {cue}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700">주의사항</h4>
                        <ul className="text-sm text-gray-600">
                          {drill.cautions.map((caution, index) => (
                            <li key={index}>• {caution}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'medical-evidence' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  의학적 근거
                </h2>
                <p className="text-gray-600">
                  수영 운동의 의학적 효과와 근거를 확인하세요.
                </p>
              </div>

              <div className="space-y-6">
                {getMedicalEvidence().map((evidence, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {evidence.citation}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        evidence.level === 'SR/MA' ? 'bg-blue-100 text-blue-800' :
                        evidence.level === 'RCT' ? 'bg-green-100 text-green-800' :
                        evidence.level === 'CPG' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {evidence.level}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {evidence.keyFindings}
                    </p>
                    
                    {evidence.link && (
                      <a 
                        href={evidence.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        원문 보기
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'engine-status' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  엔진 상태
                </h2>
                <p className="text-gray-600">
                  JJ Swim Lab 엔진의 현재 상태를 확인하세요.
                </p>
              </div>

              {engineStatus ? (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      기본 정보
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">상태</span>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${engineStatus.status === 'ready' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-gray-900">{engineStatus.status}</span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">버전</span>
                        <div className="text-gray-900">{engineStatus.version}</div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-500">마지막 업데이트</span>
                        <div className="text-gray-900">
                          {new Date(engineStatus.lastUpdated).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      로드된 모듈
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {engineStatus.modules.map((module: string) => (
                        <div key={module} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{module}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      통계
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {TRAINING_METHODS.length}
                        </div>
                        <div className="text-sm text-gray-600">훈련법</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {DRILLS.length}
                        </div>
                        <div className="text-sm text-gray-600">드릴</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {getMedicalEvidence().length}
                        </div>
                        <div className="text-sm text-gray-600">의학적 근거</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {engineStatus.modules.length}
                        </div>
                        <div className="text-sm text-gray-600">모듈</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500">
                    {isInitializing ? '엔진 초기화 중...' : '엔진 상태를 불러올 수 없습니다.'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}










