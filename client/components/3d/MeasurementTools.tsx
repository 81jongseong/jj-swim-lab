'use client';

import { useState } from 'react';

interface MeasurementToolsProps {
  swimmingStyle: 'freestyle' | 'breaststroke' | 'backstroke' | 'butterfly';
}

interface Measurement {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
}

export default function MeasurementTools({ swimmingStyle }: MeasurementToolsProps) {
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isMeasuring, setIsMeasuring] = useState(false);

  // 수영법별 측정 항목
  const measurementItems = {
    freestyle: [
      { id: 'elbow_angle', name: '팔꿈치 각도', target: 90, unit: '도' },
      { id: 'arm_extension', name: '팔 뻗기 길이', target: 85, unit: 'cm' },
      { id: 'breathing_timing', name: '호흡 타이밍', target: 0.5, unit: '초' },
      { id: 'leg_rhythm', name: '다리 동작 리듬', target: 80, unit: 'BPM' }
    ],
    breaststroke: [
      { id: 'arm_sequence', name: '팔 동작 순서', target: 90, unit: '점수' },
      { id: 'leg_timing', name: '다리 동작 타이밍', target: 85, unit: '점수' },
      { id: 'breathing_coordination', name: '호흡 조화', target: 80, unit: '점수' },
      { id: 'body_stability', name: '몸의 안정성', target: 85, unit: '점수' }
    ],
    backstroke: [
      { id: 'elbow_bend', name: '팔꿈치 구부리기', target: 90, unit: '도' },
      { id: 'leg_consistency', name: '다리 동작 일정성', target: 85, unit: '점수' },
      { id: 'body_balance', name: '몸의 균형', target: 90, unit: '점수' },
      { id: 'breathing_rhythm', name: '호흡 리듬', target: 80, unit: '점수' }
    ],
    butterfly: [
      { id: 'upper_body_wave', name: '상체 웨이브', target: 85, unit: '점수' },
      { id: 'arm_leg_sync', name: '팔과 다리 동기화', target: 90, unit: '점수' },
      { id: 'breathing_timing', name: '호흡 타이밍', target: 80, unit: '점수' },
      { id: 'body_flexibility', name: '몸의 유연성', target: 85, unit: '점수' }
    ]
  };

  // 측정 시작
  const startMeasurement = () => {
    setIsMeasuring(true);
    
    // 시뮬레이션된 측정 (실제로는 3D 모델에서 데이터 추출)
    setTimeout(() => {
      const currentItems = measurementItems[swimmingStyle];
      const newMeasurements = currentItems.map(item => {
        // 목표값 주변에서 랜덤한 현재값 생성
        const variation = (Math.random() - 0.5) * 0.4; // ±20% 변동
        const currentValue = item.target * (1 + variation);
        
        // 상태 판정
        let status: Measurement['status'];
        const accuracy = Math.abs(currentValue - item.target) / item.target;
        
        if (accuracy <= 0.1) {
          status = 'good';
        } else if (accuracy <= 0.2) {
          status = 'warning';
        } else {
          status = 'poor';
        }
        
        return {
          id: item.id,
          name: item.name,
          currentValue: Math.round(currentValue * 100) / 100,
          targetValue: item.target,
          unit: item.unit,
          status
        };
      });
      
      setMeasurements(newMeasurements);
      setIsMeasuring(false);
    }, 1500);
  };

  // 상태별 색상
  const getStatusColor = (status: Measurement['status']) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 상태별 아이콘
  const getStatusIcon = (status: Measurement['status']) => {
    switch (status) {
      case 'good': return '✅';
      case 'warning': return '⚠️';
      case 'poor': return '❌';
      default: return '❓';
    }
  };

  // 측정 정확도 계산
  const getAccuracy = (current: number, target: number) => {
    const accuracy = Math.max(0, (1 - Math.abs(current - target) / target) * 100);
    return Math.round(accuracy);
  };

  return (
    <div className="space-y-4">
      {isMeasuring ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">측정 중입니다...</p>
        </div>
      ) : measurements.length > 0 ? (
        <>
          {/* 측정 결과 요약 */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-4 text-white text-center">
            <div className="text-2xl font-bold mb-1">
              {Math.round(measurements.reduce((sum, m) => sum + getAccuracy(m.currentValue, m.targetValue), 0) / measurements.length)}%
            </div>
            <div className="text-sm opacity-90">전체 정확도</div>
          </div>
          
          {/* 측정 결과 상세 */}
          <div className="space-y-3">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{measurement.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(measurement.status)}`}>
                    {getStatusIcon(measurement.status)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {measurement.currentValue}
                    </div>
                    <div className="text-xs text-gray-500">현재값 ({measurement.unit})</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {measurement.targetValue}
                    </div>
                    <div className="text-xs text-gray-500">목표값 ({measurement.unit})</div>
                  </div>
                </div>
                
                {/* 정확도 바 */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      measurement.status === 'good' ? 'bg-green-500' :
                      measurement.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${getAccuracy(measurement.currentValue, measurement.targetValue)}%` }}
                  ></div>
                </div>
                
                <div className="text-xs text-center text-gray-600">
                  정확도: {getAccuracy(measurement.currentValue, measurement.targetValue)}%
                </div>
              </div>
            ))}
          </div>
          
          {/* 재측정 버튼 */}
          <button
            onClick={startMeasurement}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            🔄 측정 재시작
          </button>
        </>
      ) : (
        <div className="text-center py-4">
          <button
            onClick={startMeasurement}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📏 측정 시작하기
          </button>
          <p className="text-xs text-gray-500 mt-2">
            3D 모델을 기반으로 정확한 측정을 진행합니다
          </p>
        </div>
      )}
      
      {/* 측정 도구 사용법 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <img src="/swim-icon.png" alt="도움말" className="w-4 h-4 mr-2" />
          측정 도구 사용법
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• 3D 모델을 회전하여 측정할 각도 확인</li>
          <li>• 마우스로 정확한 위치 지정</li>
          <li>• 측정 결과를 바탕으로 자세 개선</li>
        </ul>
      </div>
    </div>
  );
}
