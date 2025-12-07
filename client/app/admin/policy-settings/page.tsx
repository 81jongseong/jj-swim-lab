/**
 * ⚙️ JJ Swim Lab - 정책 설정 관리 페이지
 * 
 * 📋 **페이지 목적**
 * - 하락 판단 정책 설정 관리
 * - 추세 기울기 + MoM% 결합 정책 편집
 * - AND/OR 로직 설정
 * - 정책 변경 이력 추적
 * 
 * 🔄 **주요 기능**
 * - 정책 설정 편집 (토글/슬라이더/셀렉트)
 * - 실시간 정책 미리보기
 * - 테스트 시나리오 실행
 * - 정책 변경 이력 관리
 * 
 * 🗄️ **데이터 연동**
 * - 정책 설정 API
 * - 센터별 성과 지표
 * - 감사 로그 시스템
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 정책 변경 시 기존 데이터 재계산 필요
 * 2. 모든 변경사항은 감사 로그에 기록
 * 3. 테스트 시나리오로 검증 필수
 * 4. 권한 검증 (HQ만 접근 가능)
 */

'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { 
  type DeclinePolicy, 
  DEFAULT_DECLINE_POLICY,
  createTestScenarios,
  validatePolicy,
  updatePolicy
} from '@/lib/decline-policy';
import { LoadingState, PageHeader, ConfirmModal, ErrorState } from '@/components/common';

export default function PolicySettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // 정책 설정 상태
  const [policy, setPolicy] = useState<DeclinePolicy>(DEFAULT_DECLINE_POLICY);
  const [originalPolicy, setOriginalPolicy] = useState<DeclinePolicy>(DEFAULT_DECLINE_POLICY);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  // 테스트 시나리오
  const [testScenarios, setTestScenarios] = useState<any[]>([]);
  const [showTestResults, setShowTestResults] = useState(false);
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });
  
  // 인증 확인
  useEffect(() => {
    if (!loading && (!user || user.userType !== 'superAdmin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  // 정책 로딩
  useEffect(() => {
    loadPolicy();
  }, []);

  // 변경사항 감지
  useEffect(() => {
    setHasChanges(JSON.stringify(policy) !== JSON.stringify(originalPolicy));
  }, [policy, originalPolicy]);

  // 정책 로딩
  const loadPolicy = async () => {
    try {
      // TODO: 실제 API 호출
      // const response = await fetch(policyDeclineEndpoint);
      // const data = await response.json();
      // setPolicy(data.policy);
      // setOriginalPolicy(data.policy);
      
      // 목업 데이터 사용
      setPolicy(DEFAULT_DECLINE_POLICY);
      setOriginalPolicy(DEFAULT_DECLINE_POLICY);
      
      // 테스트 시나리오 생성
      setTestScenarios(createTestScenarios());
    } catch (error) {
      logger.error('정책 로딩 오류:', error);
    }
  };

  // 정책 저장
  const savePolicy = async () => {
    try {
      setSaving(true);
      setErrors([]);
      
      // 정책 검증
      const validationErrors = validatePolicy(policy);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      // TODO: 실제 API 호출
      // const response = await fetch(policyDeclineEndpoint, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ policy })
      // });
      
      // 목업 저장
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setOriginalPolicy(policy);
      setHasChanges(false);
      alert('정책이 성공적으로 저장되었습니다.');
    } catch (error) {
      logger.error('정책 저장 오류:', error);
      alert('정책 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // 정책 초기화
  const resetPolicy = () => {
    setConfirmModal({
      isOpen: true,
      message: '변경사항을 취소하시겠습니까?',
      variant: 'warning',
      onConfirm: () => {
        setPolicy(originalPolicy);
        setErrors([]);
        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
      }
    });
  };

  // 테스트 시나리오 실행
  const runTestScenarios = () => {
    setShowTestResults(true);
  };

  // 정책 업데이트
  const updatePolicyField = (field: keyof DeclinePolicy, value: any) => {
    setPolicy(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingState message="로딩 중..." size="lg" />
      </div>
    );
  }

  if (!user || user.userType !== 'superAdmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader
          title="정책 설정"
          description="하락 판단 정책 및 가시성 설정 관리"
          actions={
            <div className="flex items-center gap-3">
              {hasChanges && (
                <span className="text-sm text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  변경사항 있음
                </span>
              )}
              <button
                onClick={resetPolicy}
                disabled={!hasChanges}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
              <button
                onClick={savePolicy}
                disabled={!hasChanges || saving}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
            </div>
          }
        />

        {/* 오류 메시지 */}
        {errors.length > 0 && (
          <ErrorState 
            message={`정책 설정 오류:\n${errors.map((error, index) => `• ${error}`).join('\n')}`}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 기본 설정 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 설정</h2>
            
            <div className="space-y-4">
              {/* 하락 비공개 켜기/끄기 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">하락 비공개</label>
                  <p className="text-xs text-gray-500">하락 센터 자동 비공개 처리</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.hideDeclining}
                    onChange={(e) => updatePolicyField('hideDeclining', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* 추세 계산 개월 */}
              <div>
                <label className="text-sm font-medium text-gray-700">추세 계산 개월</label>
                <p className="text-xs text-gray-500 mb-2">최근 몇 개월 데이터로 추세 계산</p>
                <select
                  value={policy.trendMonths}
                  onChange={(e) => updatePolicyField('trendMonths', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={2}>2개월</option>
                  <option value={3}>3개월</option>
                  <option value={4}>4개월</option>
                  <option value={6}>6개월</option>
                </select>
              </div>

              {/* 추세 기울기 임계치 */}
              <div>
                <label className="text-sm font-medium text-gray-700">추세 기울기 임계치</label>
                <p className="text-xs text-gray-500 mb-2">이 값보다 작으면 하락으로 판단</p>
                <input
                  type="number"
                  value={policy.trendSlopeThreshold}
                  onChange={(e) => updatePolicyField('trendSlopeThreshold', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.1"
                />
              </div>

              {/* MoM% 임계치 */}
              <div>
                <label className="text-sm font-medium text-gray-700">전월 대비 임계치 (%)</label>
                <p className="text-xs text-gray-500 mb-2">이 값보다 작거나 같으면 하락으로 판단</p>
                <input
                  type="number"
                  value={policy.momThresholdPct}
                  onChange={(e) => updatePolicyField('momThresholdPct', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.1"
                />
              </div>

              {/* 판정 로직 */}
              <div>
                <label className="text-sm font-medium text-gray-700">판정 로직</label>
                <p className="text-xs text-gray-500 mb-2">두 기준을 어떻게 결합할지 선택</p>
                <select
                  value={policy.logic}
                  onChange={(e) => updatePolicyField('logic', e.target.value as 'OR' | 'AND')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="OR">OR (둘 중 하나라도 하락이면 비공개)</option>
                  <option value="AND">AND (둘 다 하락이어야 비공개)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 프라이버시 설정 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">프라이버시 설정</h2>
            
            <div className="space-y-4">
              {/* k-익명 임계치 */}
              <div>
                <label className="text-sm font-medium text-gray-700">k-익명 임계치</label>
                <p className="text-xs text-gray-500 mb-2">최소 몇 명 이상이어야 데이터 공개</p>
                <input
                  type="number"
                  value={policy.kMin}
                  onChange={(e) => updatePolicyField('kMin', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>

              {/* 노이즈 ε */}
              <div>
                <label className="text-sm font-medium text-gray-700">라플라스 노이즈 ε</label>
                <p className="text-xs text-gray-500 mb-2">값이 작을수록 노이즈가 강함</p>
                <input
                  type="number"
                  value={policy.noiseEpsilon}
                  onChange={(e) => updatePolicyField('noiseEpsilon', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.1"
                  min="0.1"
                />
              </div>

              {/* 반올림 단위 */}
              <div>
                <label className="text-sm font-medium text-gray-700">반올림 단위</label>
                <p className="text-xs text-gray-500 mb-2">몇 단위로 반올림할지 설정</p>
                <input
                  type="number"
                  value={policy.roundingUnit}
                  onChange={(e) => updatePolicyField('roundingUnit', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 테스트 시나리오 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">테스트 시나리오</h2>
            <button
              onClick={runTestScenarios}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              시나리오 실행
            </button>
          </div>
          
          {showTestResults && (
            <div className="space-y-4">
              {testScenarios.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      scenario.expected ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {scenario.expected ? '비공개 예상' : '공개 예상'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">추세 기울기:</span> {scenario.metrics.trendSlope}
                    </div>
                    <div>
                      <span className="font-medium">MoM%:</span> {scenario.metrics.momPct}%
                    </div>
                    <div>
                      <span className="font-medium">로직:</span> {scenario.policy.logic}
                    </div>
                    <div>
                      <span className="font-medium">임계치:</span> {scenario.policy.trendSlopeThreshold}, {scenario.policy.momThresholdPct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 정책 요약 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">현재 정책 요약</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">하락 비공개:</span> {policy.hideDeclining ? '활성화' : '비활성화'}
            </div>
            <div>
              <span className="font-medium text-blue-800">추세 계산:</span> 최근 {policy.trendMonths}개월
            </div>
            <div>
              <span className="font-medium text-blue-800">추세 임계치:</span> {policy.trendSlopeThreshold}
            </div>
            <div>
              <span className="font-medium text-blue-800">MoM 임계치:</span> {policy.momThresholdPct}%
            </div>
            <div>
              <span className="font-medium text-blue-800">판정 로직:</span> {policy.logic}
            </div>
            <div>
              <span className="font-medium text-blue-800">k-익명:</span> {policy.kMin}명
            </div>
          </div>
        </div>
      </div>

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        variant={confirmModal.variant || 'info'}
        title="확인"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
}



