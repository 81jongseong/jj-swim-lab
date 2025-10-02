/**
 * 🏊‍♂️ JJ Swim Lab - 관절질환별 수영 가이드라인 페이지
 * 
 * 📋 **기능:**
 * - 28개 관절질환별 수영 가이드라인 표시
 * - 카테고리별 분류 (무릎, 어깨, 척추, 발목, 팔꿈치, 고관절, 손목)
 * - 6가지 영법별 상세 분석 (자유형, 배영, 평영, 접영, 기본배영, 횡영)
 * - 의학적 근거 및 출처 표시
 * - 상세 가이드라인 및 주의사항
 * 
 * 🔗 **연동 파일:**
 * - data/joint-conditions.ts (28개 관절질환 데이터)
 * - swim-training-engine/src/types.ts
 */

'use client';

import { useState } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { allJointConditions, EVIDENCE_BASED_SOURCES } from '../../../../data/joint-conditions';
import { 
  Heart, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BookOpen,
  ExternalLink,
  Search,
  Filter,
  ArrowLeft,
  Info,
  Activity,
  Clock,
  Users
} from 'lucide-react';

type Category = 'spine' | 'shoulder' | 'knee' | 'ankle' | 'wrist' | 'elbow' | 'hip';
type Stroke = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'elementary_backstroke' | 'sidestroke';
type SafetyLevel = 'safe' | 'caution' | 'avoid';

export default function JointGuidelinesPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 카테고리별 이름 매핑
  const categoryNames: { [key: string]: string } = {
    all: '전체',
    knee: '무릎',
    shoulder: '어깨',
    spine: '척추',
    ankle: '발목',
    elbow: '팔꿈치',
    hip: '고관절',
    wrist: '손목'
  };


  // 영법별 이름 매핑
  const strokeNames: { [key: string]: string } = {
    freestyle: '자유형',
    backstroke: '배영',
    breaststroke: '평영',
    butterfly: '접영',
    elementary_backstroke: '기본배영',
    sidestroke: '횡영'
  };

  // 안전도별 색상 및 아이콘
  const getSafetyDisplay = (level: SafetyLevel) => {
    switch (level) {
      case 'safe':
        return { 
          color: 'text-green-600', 
          bgColor: 'bg-green-100', 
          icon: CheckCircle, 
          text: '안전' 
        };
      case 'caution':
        return { 
          color: 'text-yellow-600', 
          bgColor: 'bg-yellow-100', 
          icon: AlertTriangle, 
          text: '주의' 
        };
      case 'avoid':
        return { 
          color: 'text-red-600', 
          bgColor: 'bg-red-100', 
          icon: XCircle, 
          text: '금기' 
        };
    }
  };

  // 필터링된 질환 목록
  const getFilteredConditions = () => {
    return allJointConditions.filter(condition => {
      const matchesCategory = selectedCategory === 'all' || condition.category === selectedCategory;
      const matchesSearch = condition.conditionName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  // 선택된 질환 정보
  const selectedConditionData = selectedCondition 
    ? allJointConditions.find(c => c.conditionId === selectedCondition)
    : null;


  // 영법별 장점 반환 함수
  const getStrokeBenefits = (stroke: string): string[] => {
    const benefits: { [key: string]: string[] } = {
      freestyle: [
        '전신 근육을 균형있게 사용하여 전신 근력 향상',
        '심폐기능 향상에 가장 효과적',
        '기술이 상대적으로 단순하여 초보자도 쉽게 배울 수 있음',
        '칼로리 소모가 높아 체중 감량에 효과적',
        '스트레스 해소 및 정신 건강에 도움',
        '관절에 부담이 적어 재활 운동에 적합'
      ],
      backstroke: [
        '척추를 자연스럽게 신전시켜 자세 교정에 도움',
        '호흡이 자유로워 심폐기능 향상에 효과적',
        '어깨와 상체 근력 강화에 효과적',
        '목과 척추 통증 완화에 도움',
        '스트레스 해소 및 이완 효과',
        '자유형과 함께 균형잡힌 근육 발달'
      ],
      breaststroke: [
        '가장 안전하고 접근하기 쉬운 영법',
        '전신 근육을 부드럽게 사용하여 관절 부담 최소화',
        '호흡 패턴이 자연스러워 초보자에게 적합',
        '유연성 향상에 도움',
        '심폐기능 향상과 근력 강화의 균형',
        '재활 및 치료 목적의 수영에 가장 적합'
      ],
      butterfly: [
        '상체와 코어 근력 강화에 가장 효과적',
        '유연성과 근력의 조화로운 발달',
        '고강도 운동으로 칼로리 소모 극대화',
        '전신 조화와 리듬감 향상',
        '심폐기능 향상에 매우 효과적',
        '운동 성취감과 자신감 향상'
      ],
      elementary_backstroke: [
        '초보자에게 가장 안전한 영법',
        '관절 부담이 최소화되어 재활에 적합',
        '스트레스 해소 및 이완 효과',
        '기본적인 수영 기술 습득에 도움',
        '심폐기능 향상의 기초 단계',
        '물에 대한 두려움 극복에 효과적'
      ],
      sidestroke: [
        '한쪽 팔만 사용하여 부상자나 약한 쪽 보호 가능',
        '장시간 수영에 적합한 효율적인 영법',
        '구조 및 생존 수영에 활용',
        '전신 근육을 부드럽게 사용',
        '호흡이 자유로워 장거리 수영에 적합',
        '다른 영법과의 조화로운 훈련 가능'
      ]
    };
    return benefits[stroke] || [];
  };

  // 영법별 단점/주의점 반환 함수
  const getStrokeDrawbacks = (stroke: string): string[] => {
    const drawbacks: { [key: string]: string[] } = {
      freestyle: [
        '어깨 충돌 증후군 위험 (과도한 사용 시)',
        '목 통증 가능성 (잘못된 호흡 자세)',
        '하이엘보 자세 유지가 어려울 수 있음',
        '초보자는 균형 잡기가 어려울 수 있음',
        '과도한 훈련 시 어깨 부상 위험',
        '호흡 타이밍이 중요하여 숙련 필요'
      ],
      backstroke: [
        '뒤를 볼 수 없어 충돌 위험',
        '허리 과신전으로 인한 요통 가능성',
        '어깨 부상 위험 (과도한 회전)',
        '초보자는 균형 잡기가 어려움',
        '목 통증 가능성 (잘못된 자세)',
        '벽 턴 시 주의 필요'
      ],
      breaststroke: [
        '무릎 부상 위험 (잘못된 킥 동작)',
        '목과 척추 통증 가능성 (잘못된 호흡)',
        '어깨 충돌 증후군 위험',
        '과도한 사용 시 무릎 관절 손상',
        '기술이 복잡하여 올바른 자세 습득 어려움',
        '속도가 느려 체력 향상에 한계'
      ],
      butterfly: [
        '가장 부상 위험이 높은 영법',
        '어깨와 허리 부상 위험',
        '기술이 매우 복잡하여 습득 어려움',
        '고강도로 인한 과부하 위험',
        '초보자에게는 부적합',
        '관절 부담이 크므로 주의 필요'
      ],
      elementary_backstroke: [
        '속도가 매우 느림',
        '체력 향상 효과가 제한적',
        '기술적 발전의 한계',
        '장시간 수영 시 지루함',
        '다른 영법으로의 발전이 어려움',
        '운동 강도가 낮아 체중 감량 효과 제한'
      ],
      sidestroke: [
        '한쪽 근육만 발달할 수 있음',
        '기술이 복잡하여 습득 어려움',
        '속도가 느림',
        '균형 잡기가 어려움',
        '다른 영법과의 조화 필요',
        '장시간 수영 시 피로 누적'
      ]
    };
    return drawbacks[stroke] || [];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              관절질환별 수영 가이드라인
            </h1>
            <p className="text-gray-600">
              28개 관절질환별 수영 영법 안전도 및 의학적 근거를 제공합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="질환명 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          {Object.entries(categoryNames).map(([key, name]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key as Category | 'all')}
              className={`px-3 py-2 text-sm rounded-lg border ${
                selectedCategory === key
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 질환 목록 */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">질환 목록 ({getFilteredConditions().length}개)</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {getFilteredConditions().map((condition) => (
              <button
                key={condition.conditionId}
                onClick={() => setSelectedCondition(condition.conditionId)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedCondition === condition.conditionId
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{condition.conditionName}</h3>
                    <p className="text-sm text-gray-600">{categoryNames[condition.category]}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    condition.severity === 'mild' ? 'bg-green-100 text-green-800' :
                    condition.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {condition.severity === 'mild' ? '경증' : 
                     condition.severity === 'moderate' ? '중등도' : '중증'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="lg:col-span-2">
          {selectedConditionData ? (
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">{selectedConditionData.conditionName}</h2>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    selectedConditionData.severity === 'mild' ? 'bg-green-100 text-green-800' :
                    selectedConditionData.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {categoryNames[selectedConditionData.category]} • {
                      selectedConditionData.severity === 'mild' ? '경증' : 
                      selectedConditionData.severity === 'moderate' ? '중등도' : '중증'
                    }
                  </span>
                </div>
              </div>

              {/* 영법별 안전도 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">6가지 영법별 상세 분석</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(selectedConditionData.swimmingGuidance).map(([stroke, guidance]) => {
                    const safetyDisplay = getSafetyDisplay(guidance.level);
                    const Icon = safetyDisplay.icon;
                    
                    return (
                      <div key={stroke} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon className={`h-6 w-6 ${safetyDisplay.color}`} />
                          <h4 className="text-lg font-semibold">{strokeNames[stroke]}</h4>
                          <span className={`px-3 py-1 text-sm rounded-full ${safetyDisplay.bgColor} ${safetyDisplay.color}`}>
                            {safetyDisplay.text}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          {/* 기본 설명 */}
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">기본 설명</h5>
                            <p className="text-sm text-gray-700">{guidance.detailedExplanation}</p>
                          </div>
                          
                          {/* 장점 */}
                          <div>
                            <h5 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              장점
                            </h5>
                            <ul className="text-sm text-green-600 space-y-1">
                              {getStrokeBenefits(stroke).map((benefit, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* 단점/주의점 */}
                          <div>
                            <h5 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              단점/주의점
                            </h5>
                            <ul className="text-sm text-red-600 space-y-1">
                              {getStrokeDrawbacks(stroke).map((drawback, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                  {drawback}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* 수정사항 */}
                          {guidance.modifications && guidance.modifications.length > 0 && (
                            <div>
                              <h5 className="font-medium text-blue-700 mb-2">수정사항</h5>
                              <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                                {guidance.modifications.map((mod, index) => (
                                  <li key={index}>{mod}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* 금지 동작 */}
                          {guidance.prohibitedMovements && guidance.prohibitedMovements.length > 0 && (
                            <div>
                              <h5 className="font-medium text-red-600 mb-2">금지 동작</h5>
                              <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                                {guidance.prohibitedMovements.map((movement, index) => (
                                  <li key={index}>{movement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 운동 제한사항 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">운동 제한사항</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">강도 조절</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>강도 감소:</span>
                        <span className="font-medium">{selectedConditionData.exerciseRestrictions.intensityReduction}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>시간 제한:</span>
                        <span className="font-medium">{selectedConditionData.exerciseRestrictions.durationLimit}분</span>
                      </div>
                      <div className="flex justify-between">
                        <span>주간 횟수:</span>
                        <span className="font-medium">{selectedConditionData.exerciseRestrictions.frequencyLimit}회</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">권장/금지 운동</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="font-medium text-green-600">권장 운동:</p>
                        <ul className="list-disc list-inside text-green-600">
                          {selectedConditionData.exerciseRestrictions.recommendedExercises?.map((exercise, index) => (
                            <li key={index}>{strokeNames[exercise] || exercise}</li>
                          )) || <li>데이터 없음</li>}
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium text-red-600">금지 운동:</p>
                        <ul className="list-disc list-inside text-red-600">
                          {selectedConditionData.exerciseRestrictions.contraindicatedExercises?.map((exercise, index) => (
                            <li key={index}>{strokeNames[exercise] || exercise}</li>
                          )) || <li>데이터 없음</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 의학적 근거 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">의학적 근거 및 연구 결과</h3>
                
                {/* 근거 수준 설명 */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">근거 수준 설명</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">SR/MA</span>
                      <span className="text-blue-700">체계적 문헌고찰/메타분석</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">RCT</span>
                      <span className="text-blue-700">무작위 대조군 연구</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">CPG</span>
                      <span className="text-blue-700">임상진료지침</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">EXP</span>
                      <span className="text-blue-700">전문가 의견</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* 일반적인 수영의 의학적 효과 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">수영의 일반적인 의학적 효과</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border-l-4 border-green-500 pl-4">
                        <h5 className="font-medium text-green-700 mb-2">심혈관 건강</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 심박수 감소 및 심장 효율성 향상</li>
                          <li>• 혈압 감소 효과 (고혈압 환자에게 특히 유효)</li>
                          <li>• 콜레스테롤 수치 개선</li>
                          <li>• 심혈관 질환 위험 감소</li>
                        </ul>
                      </div>
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h5 className="font-medium text-blue-700 mb-2">근골격계 건강</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 관절 부담 최소화로 관절염 완화</li>
                          <li>• 근력 및 근지구력 향상</li>
                          <li>• 골밀도 유지 및 향상</li>
                          <li>• 유연성 및 균형감각 개선</li>
                        </ul>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h5 className="font-medium text-purple-700 mb-2">정신건강</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 스트레스 감소 및 우울감 완화</li>
                          <li>• 수면의 질 개선</li>
                          <li>• 인지기능 향상</li>
                          <li>• 자존감 및 자신감 증진</li>
                        </ul>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h5 className="font-medium text-orange-700 mb-2">대사 건강</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 체중 감량 및 체성분 개선</li>
                          <li>• 인슐린 감수성 향상</li>
                          <li>• 당뇨병 위험 감소</li>
                          <li>• 대사증후군 개선</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 질환별 특화 근거 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">{selectedConditionData.conditionName}에 대한 수영의 효과</h4>
                    <div className="space-y-4">
                      {selectedConditionData.swimmingGuidance.freestyle.medicalEvidence?.map((evidence, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`px-3 py-1 text-sm rounded-full ${
                              evidence.level === 'SR/MA' ? 'bg-purple-100 text-purple-800' :
                              evidence.level === 'RCT' ? 'bg-blue-100 text-blue-800' :
                              evidence.level === 'CPG' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {evidence.level}
                            </span>
                            <span className="text-sm text-gray-600">최고 수준 근거</span>
                            {evidence.link && (
                              <a
                                href={evidence.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                              >
                                <ExternalLink className="h-3 w-3" />
                                원문 보기
                              </a>
                            )}
                          </div>
                          <div className="space-y-2">
                            <h5 className="font-medium text-gray-900">{evidence.citation}</h5>
                            <p className="text-sm text-gray-700">{evidence.keyFindings}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 주의사항 및 금기사항 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">주의사항 및 금기사항</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <h5 className="font-medium text-yellow-800 mb-2">⚠️ 주의사항</h5>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• 수영 전 충분한 준비운동 필수</li>
                          <li>• 수분 섭취 및 전해질 균형 유지</li>
                          <li>• 과도한 운동량 피하기</li>
                          <li>• 통증 발생 시 즉시 중단</li>
                          <li>• 의사와 상담 후 운동 시작</li>
                        </ul>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h5 className="font-medium text-red-800 mb-2">🚫 금기사항</h5>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• 급성 감염성 질환</li>
                          <li>• 심한 심혈관 질환</li>
                          <li>• 조절되지 않는 고혈압</li>
                          <li>• 수영에 대한 극심한 공포증</li>
                          <li>• 의사가 금지한 경우</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">질환을 선택해주세요</h3>
              <p className="text-gray-600">
                왼쪽 목록에서 관심 있는 관절질환을 선택하면 상세한 수영 가이드라인을 확인할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}