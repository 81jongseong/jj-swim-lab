import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

// 건강 측정 데이터 타입
interface HealthMeasurement {
  id: string;
  userId: string;
  type: 'heart_rate' | 'blood_pressure' | 'weight' | 'body_fat' | 'muscle_mass' | 'bmi';
  value: number;
  unit: string;
  measuredAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 건강 목표 타입
interface HealthGoal {
  id: string;
  userId: string;
  type: 'heart_rate' | 'blood_pressure' | 'weight' | 'body_fat' | 'muscle_mass' | 'bmi';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: Date;
  status: 'active' | 'completed' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

// 통계 데이터 타입
interface HealthStatistics {
  type: string;
  period: string;
  totalMeasurements: number;
  average: number;
  min: number;
  max: number;
  standardDeviation: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendRate: number;
  lastMeasurement: HealthMeasurement | null;
  recommendations: string[];
}

// 건강 알림 타입
interface HealthAlert {
  id: string;
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
  isRead: boolean;
}

// 측정 타입 정의
const measurementTypes = {
  heart_rate: { label: '심박수', unit: 'bpm', normalRange: [60, 100] },
  blood_pressure: { label: '혈압', unit: 'mmHg', normalRange: [90, 140] },
  weight: { label: '체중', unit: 'kg', normalRange: [50, 100] },
  body_fat: { label: '체지방률', unit: '%', normalRange: [10, 25] },
  muscle_mass: { label: '근육량', unit: 'kg', normalRange: [30, 60] },
  bmi: { label: 'BMI', unit: '', normalRange: [18.5, 25] }
};

// 통계 계산 함수
function calculateStatistics(measurements: HealthMeasurement[], type: string): Partial<HealthStatistics> {
  if (measurements.length === 0) {
    return {
      totalMeasurements: 0,
      average: 0,
      min: 0,
      max: 0,
      standardDeviation: 0,
      trend: 'stable',
      trendRate: 0
    };
  }
  
  const values = measurements.map(m => m.value);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  // 표준편차 계산
  const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
  const standardDeviation = Math.sqrt(variance);
  
  // 추세 계산 (최근 5개 측정값 기준)
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  let trendRate = 0;
  
  if (measurements.length >= 2) {
    const recent = measurements.slice(-5);
    const firstValue = recent[0].value;
    const lastValue = recent[recent.length - 1].value;
    const change = lastValue - firstValue;
    const changeRate = (change / firstValue) * 100;
    
    if (Math.abs(changeRate) > 5) { // 5% 이상 변화시 추세로 판단
      trend = changeRate > 0 ? 'increasing' : 'decreasing';
      trendRate = Math.abs(changeRate);
    }
  }
  
  return {
    totalMeasurements: measurements.length,
    average: Number(average.toFixed(2)),
    min,
    max,
    standardDeviation: Number(standardDeviation.toFixed(2)),
    trend,
    trendRate: Number(trendRate.toFixed(2))
  };
}

// 건강 상태 평가 및 추천사항 생성
function generateRecommendations(statistics: HealthStatistics, type: string): string[] {
  const recommendations: string[] = [];
  const config = measurementTypes[type as keyof typeof measurementTypes];
  
  if (!config) return recommendations;
  
  const { average, trend, lastMeasurement } = statistics;
  const [minNormal, maxNormal] = config.normalRange;
  
  // 정상 범위 체크
  if (average < minNormal) {
    recommendations.push(`${config.label}이 정상 범위보다 낮습니다. 의사와 상담하세요.`);
  } else if (average > maxNormal) {
    recommendations.push(`${config.label}이 정상 범위보다 높습니다. 운동 강도를 조절하세요.`);
  }
  
  // 추세 체크
  if (trend === 'increasing' && type === 'weight') {
    recommendations.push('체중이 증가 추세입니다. 식단 조절과 운동을 늘려보세요.');
  } else if (trend === 'decreasing' && type === 'weight') {
    recommendations.push('체중이 감소 추세입니다. 적절한 영양 섭취를 유지하세요.');
  }
  
  // 최근 측정값 체크
  if (lastMeasurement) {
    const value = lastMeasurement.value;
    if (value < minNormal || value > maxNormal) {
      recommendations.push(`최근 ${config.label} 측정값이 정상 범위를 벗어났습니다.`);
    }
  }
  
  // 일반적인 건강 추천사항
  if (type === 'heart_rate') {
    recommendations.push('규칙적인 유산소 운동으로 심혈관 건강을 개선하세요.');
  } else if (type === 'weight') {
    recommendations.push('균형 잡힌 식단과 규칙적인 운동을 유지하세요.');
  } else if (type === 'body_fat') {
    recommendations.push('근력 운동과 유산소 운동을 병행하여 체지방을 감소시키세요.');
  }
  
  return recommendations;
}

// 건강 알림 생성
function generateHealthAlerts(statistics: HealthStatistics, type: string): HealthAlert[] {
  const alerts: HealthAlert[] = [];
  const config = measurementTypes[type as keyof typeof measurementTypes];
  
  if (!config) return alerts;
  
  const { average, trend, lastMeasurement } = statistics;
  const [minNormal, maxNormal] = config.normalRange;
  
  // 정상 범위 벗어남 알림
  if (average < minNormal) {
    alerts.push({
      id: `alert-${type}-low-${Date.now()}`,
      type: 'warning',
      title: `${config.label} 낮음`,
      message: `${config.label}이 정상 범위보다 낮습니다. 의사와 상담하세요.`,
      severity: 'medium',
      createdAt: new Date(),
      isRead: false
    });
  } else if (average > maxNormal) {
    alerts.push({
      id: `alert-${type}-high-${Date.now()}`,
      type: 'warning',
      title: `${config.label} 높음`,
      message: `${config.label}이 정상 범위보다 높습니다. 운동 강도를 조절하세요.`,
      severity: 'high',
      createdAt: new Date(),
      isRead: false
    });
  }
  
  // 급격한 변화 알림
  if (trend === 'increasing' && statistics.trendRate > 10) {
    alerts.push({
      id: `alert-${type}-increase-${Date.now()}`,
      type: 'info',
      title: `${config.label} 급증`,
      message: `${config.label}이 ${statistics.trendRate.toFixed(1)}% 증가했습니다.`,
      severity: 'medium',
      createdAt: new Date(),
      isRead: false
    });
  } else if (trend === 'decreasing' && statistics.trendRate > 10) {
    alerts.push({
      id: `alert-${type}-decrease-${Date.now()}`,
      type: 'info',
      title: `${config.label} 급감`,
      message: `${config.label}이 ${statistics.trendRate.toFixed(1)}% 감소했습니다.`,
      severity: 'medium',
      createdAt: new Date(),
      isRead: false
    });
  }
  
  return alerts;
}

// GET: 건강 분석 및 통계
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const period = searchParams.get('period') || '30d';
    const includeAlerts = searchParams.get('includeAlerts') === 'true';
    
    // 기간 계산
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // TODO: 실제 데이터베이스에서 조회
    // 현재는 임시 데이터 반환
    const mockMeasurements: HealthMeasurement[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'heart_rate',
        value: 75,
        unit: 'bpm',
        measuredAt: new Date('2024-12-19T10:00:00Z'),
        notes: '운동 후 측정',
        createdAt: new Date('2024-12-19T10:00:00Z'),
        updatedAt: new Date('2024-12-19T10:00:00Z')
      },
      {
        id: '2',
        userId: 'user1',
        type: 'heart_rate',
        value: 72,
        unit: 'bpm',
        measuredAt: new Date('2024-12-18T10:00:00Z'),
        notes: '운동 후 측정',
        createdAt: new Date('2024-12-18T10:00:00Z'),
        updatedAt: new Date('2024-12-18T10:00:00Z')
      },
      {
        id: '3',
        userId: 'user1',
        type: 'heart_rate',
        value: 78,
        unit: 'bpm',
        measuredAt: new Date('2024-12-17T10:00:00Z'),
        notes: '운동 후 측정',
        createdAt: new Date('2024-12-17T10:00:00Z'),
        updatedAt: new Date('2024-12-17T10:00:00Z')
      }
    ];
    
    // 타입별 필터링
    let filteredMeasurements = mockMeasurements;
    if (type && measurementTypes[type as keyof typeof measurementTypes]) {
      filteredMeasurements = filteredMeasurements.filter(m => m.type === type);
    }
    
    // 기간별 필터링
    filteredMeasurements = filteredMeasurements.filter(m => m.measuredAt >= startDate);
    
    // 통계 계산
    const statistics: HealthStatistics = {
      type: type || 'all',
      period,
      totalMeasurements: filteredMeasurements.length,
      average: 0,
      min: 0,
      max: 0,
      standardDeviation: 0,
      trend: 'stable',
      trendRate: 0,
      lastMeasurement: filteredMeasurements.length > 0 ? filteredMeasurements[filteredMeasurements.length - 1] : null,
      recommendations: []
    };
    
    // 통계 계산
    const calculatedStats = calculateStatistics(filteredMeasurements, type || 'all');
    Object.assign(statistics, calculatedStats);
    
    // 추천사항 생성
    statistics.recommendations = generateRecommendations(statistics, type || 'all');
    
    // 알림 생성
    let alerts: HealthAlert[] = [];
    if (includeAlerts) {
      alerts = generateHealthAlerts(statistics, type || 'all');
    }
    
    return NextResponse.json({
      success: true,
      data: {
        statistics,
        alerts,
        period,
        type: type || 'all'
      }
    });
    
  } catch (error) {
    logger.error('건강 분석 오류:', error);
    return NextResponse.json(
      { success: false, error: '건강 분석 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}








