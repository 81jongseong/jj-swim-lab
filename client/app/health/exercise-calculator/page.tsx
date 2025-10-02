'use client';

import React, { useState } from 'react';
import { Calculator, Activity, Target, Heart, AlertCircle, CheckCircle, Save } from 'lucide-react';

export default function HealthExerciseCalculatorPage() {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    activityLevel: '',
    fitnessGoals: '',
    healthConditions: ''
  });

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const calculateResults = () => {
    if (!formData.age || !formData.gender || !formData.height || !formData.weight) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    setLoading(true);

    // BMR 계산
    const age = parseInt(formData.age);
    const height = parseInt(formData.height);
    const weight = parseInt(formData.weight);
    
    let bmr;
    if (formData.gender === 'male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * 1.55; // 보통 활동 수준
    const targetCalories = formData.fitnessGoals === 'weight_loss' ? tdee - 500 : tdee;

    const calculatedResults = {
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      bmi: Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10,
      swimmingPlan: {
        sessions: 3,
        duration: 45,
        intensity: 'medium'
      },
      recommendations: [
        '규칙적인 운동 습관을 만드세요',
        '충분한 수분 섭취를 유지하세요',
        '운동 전후 스트레칭을 하세요'
      ],
      safetyNotes: [
        '운동 전 충분한 준비운동을 하세요',
        '통증이 있으면 즉시 중단하세요'
      ]
    };

    setTimeout(() => {
      setResults(calculatedResults);
      setLoading(false);
    }, 1000);
  };

  const saveResults = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏥 건강 맞춤 운동 계산기</h1>
          <p className="text-gray-600">
            개인 건강 상태를 고려한 안전하고 효과적인 수영 운동 계획을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              개인 정보 입력
            </h2>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">나이 *</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="나이"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">성별 *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">성별 선택</option>
                    <option value="male">남성</option>
                    <option value="female">여성</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">키 (cm) *</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="키"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">몸무게 (kg) *</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="몸무게"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">운동 목표</label>
                <select
                  value={formData.fitnessGoals}
                  onChange={(e) => setFormData({ ...formData, fitnessGoals: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">운동 목표 선택</option>
                  <option value="weight_loss">체중 감량</option>
                  <option value="muscle_gain">근육 증가</option>
                  <option value="endurance">지구력 향상</option>
                  <option value="general_fitness">전반적인 건강</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Heart className="w-4 h-4 inline mr-2" />
                  건강 상태
                </label>
                <textarea
                  value={formData.healthConditions}
                  onChange={(e) => setFormData({ ...formData, healthConditions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="건강 상태를 입력하세요 (예: 고혈압, 당뇨 등)"
                />
              </div>

              <button
                onClick={calculateResults}
                disabled={loading}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    계산 중...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    운동 계획 계산
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              계산 결과
            </h2>

            {results ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{results.bmr}</div>
                    <div className="text-sm text-gray-600">기초대사율 (kcal)</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{results.tdee}</div>
                    <div className="text-sm text-gray-600">일일 소모 칼로리 (kcal)</div>
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{results.targetCalories}</div>
                  <div className="text-sm text-gray-600">목표 일일 칼로리 (kcal)</div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    수영 운동 계획
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>주간 세션 수:</span>
                      <span className="font-medium">{results.swimmingPlan.sessions}회</span>
                    </div>
                    <div className="flex justify-between">
                      <span>세션당 시간:</span>
                      <span className="font-medium">{results.swimmingPlan.duration}분</span>
                    </div>
                    <div className="flex justify-between">
                      <span>운동 강도:</span>
                      <span className="font-medium text-yellow-600">보통</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    안전 주의사항
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {results.safetyNotes.map((note: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    권장사항
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {results.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={saveResults}
                  className={`w-full px-4 py-3 rounded-md flex items-center justify-center ${
                    saved 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      저장 완료
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      결과 저장
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  건강 맞춤 운동 계획을 계산해보세요
                </h3>
                <p className="text-gray-600">
                  왼쪽 폼에 정보를 입력하고 계산 버튼을 클릭하세요.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}