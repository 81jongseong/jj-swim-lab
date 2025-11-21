/**
 * 👨‍🏫 JJ Swim Lab - 강사용 학생 건강정보 개요 페이지
 * 
 * 📋 **페이지 목적**
 * - 강사가 담당하는 학생들의 공개된 건강정보를 한눈에 볼 수 있는 개요 페이지
 * - 학생별 건강 상태, BMI, 운동 준수율, AI 추천사항 등을 데이터베이스에서 실시간으로 조회
 * 
 * 🔄 **주요 기능**
 * - 담당 학생들의 공개 건강정보 조회 (실시간 데이터베이스 연동)
 * - 학생별 건강 상태 및 BMI 표시
 * - 운동 준수율 및 마지막 건강 체크 일자
 * - AI 기반 운동 추천사항 확인
 * - 건강 통계 대시보드 (전체/우수/양호/주의 학생 수)
 * - 평균 BMI 및 운동 준수율 통계
 * - 주요 건강 이슈 리스트
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook (강사 권한 확인)
 * - 건강정보 API 연동
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * - 강사 권한 확인 필수
 * - 학생이 공개 설정한 건강정보만 조회
 * - 개인정보 보호 준수
 * - 실시간 데이터 동기화
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (강사용 학생 건강정보 개요 페이지)
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { Users, TrendingUp, AlertTriangle, CheckCircle, Clock, Activity, HeartPulse, Thermometer } from 'lucide-react';
import apiClient from '@/utils/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  Dialog,
  HealthDialogContent,
  HealthDialogHeader,
  HealthDialogBody,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface StudentHealthSummary {
  _id: string;
  name: string;
  email: string;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  bmi: number;
  lastHealthCheck: string;
  exerciseCompliance: number;
  hasHealthData: boolean;
  height?: number;
  weight?: number;
  bloodPressure?: {
    systolic?: number;
    diastolic?: number;
    measuredAt?: string;
  };
  bloodSugar?: {
    fasting?: number;
    hba1c?: number;
    measuredAt?: string;
  };
  cholesterol?: {
    total?: number;
    ldl?: number;
    hdl?: number;
    measuredAt?: string;
  };
  chronicConditions: string[];
  allergies: string[];
  medications: string[];
  fitnessMetrics?: {
    restingHeartRate?: number;
    maxHeartRate?: number;
    bodyFatPercentage?: number;
    lungCapacity?: number;
    measuredAt?: string;
  };
  healthHistory: Array<{
    date: string;
    weight?: number;
    bmi?: number;
    bloodPressure?: {
      systolic?: number;
      diastolic?: number;
    };
    notes?: string;
  }>;
  complianceByPeriod: {
    daily?: number | null;
    weekly?: number | null;
    monthly?: number | null;
    overall: number;
  };
  complianceHistory?: Array<{
    date: string;
    period: 'daily' | 'weekly' | 'monthly';
    value: number | null;
  }>;
}

interface HealthStatistics {
  totalStudents: number;
  excellentCount: number;
  goodCount: number;
  fairCount: number;
  poorCount: number;
  averageBMI: number;
  averageCompliance: number;
}

const chartWidth = 360;
const chartHeight = 140;
const chartPadding = 16;

const LineChart: React.FC<{
  labels: string[];
  series: Array<{ name: string; data: Array<number | null>; color: string }>;
  height?: number;
}> = ({ labels, series, height = chartHeight }) => {
  const validValues = series
    .flatMap((s) => s.data)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

  if (validValues.length < 2 || labels.length < 2) {
    return <p className="text-xs text-gray-500">추이를 표시할 데이터가 충분하지 않습니다.</p>;
  }

  const minValue = Math.min(...validValues);
  const maxValue = Math.max(...validValues);
  const adjustedMin = minValue === maxValue ? minValue - 1 : minValue;
  const adjustedMax = minValue === maxValue ? maxValue + 1 : maxValue;
  const chartAreaHeight = height - chartPadding * 2;
  const chartAreaWidth = chartWidth - chartPadding * 2;

  const buildPath = (data: Array<number | null>) => {
    const points = data
      .map((value, index) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) return null;
        const x = chartPadding + (chartAreaWidth * index) / (labels.length - 1);
        const y = chartPadding +
          (chartAreaHeight * (adjustedMax - value)) /
            (adjustedMax - adjustedMin || 1);
        return { x: Number.isFinite(x) ? x : chartPadding, y };
      })
      .filter((point): point is { x: number; y: number } => point !== null);

    if (points.length < 2) return '';

    return points
      .map((point, idx) => `${idx === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');
  };

  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, idx) =>
    adjustedMin + ((adjustedMax - adjustedMin) * idx) / yTicks
  );

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${chartWidth} ${height}`} className="w-full">
        <line
          x1={chartPadding}
          y1={height - chartPadding}
          x2={chartWidth - chartPadding / 2}
          y2={height - chartPadding}
          stroke="#d1d5db"
          strokeWidth={1}
        />
        <line
          x1={chartPadding}
          y1={chartPadding / 2}
          x2={chartPadding}
          y2={height - chartPadding}
          stroke="#d1d5db"
          strokeWidth={1}
        />

        {yTickValues.map((value, idx) => {
          const y = chartPadding +
            (chartAreaHeight * (adjustedMax - value)) /
              (adjustedMax - adjustedMin || 1);
          return (
            <g key={`grid-${idx}`}>
              <line
                x1={chartPadding}
                y1={y}
                x2={chartWidth - chartPadding / 2}
                y2={y}
                stroke="#f3f4f6"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text x={chartPadding - 8} y={y + 4} fontSize={10} textAnchor="end" fill="#6b7280">
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        {series.map((line) => {
          const path = buildPath(line.data);
          if (!path) return null;
          return (
            <path
              key={line.name}
              d={path}
              fill="none"
              stroke={line.color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      <div className="flex items-center justify-between text-[10px] text-gray-500">
        {labels.map((label, index) => (
          <span key={label + index}>{label}</span>
        ))}
      </div>
    </div>
  );
};

export default function InstructorHealthOverview() {
  const { user, hasUserType } = useAuth();
  const [students, setStudents] = useState<StudentHealthSummary[]>([]);
  const [statistics, setStatistics] = useState<HealthStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isInstructor = hasUserType('instructor');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [compliancePeriod, setCompliancePeriod] = useState<'overall' | 'daily' | 'weekly' | 'monthly'>('overall');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // 데이터 로드
  useEffect(() => {
    if (isInstructor && user?.userType === 'instructor') {
      loadStudentHealthData();
    }
  }, [isInstructor, user?.userType]);

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((student) => student._id === selectedStudentId) || null;
  }, [selectedStudentId, students]);

  const overallTrend = useMemo(() => {
    const bmiMap = new Map<string, { sum: number; count: number }>();
    const complianceMap = new Map<string, { sum: number; count: number }>();

    students.forEach((student) => {
      student.healthHistory.forEach((entry) => {
        const monthKey = new Date(entry.date).toISOString().slice(0, 7);
        if (!monthKey || !entry.bmi) return;
        const bucket = bmiMap.get(monthKey) ?? { sum: 0, count: 0 };
        bucket.sum += entry.bmi;
        bucket.count += 1;
        bmiMap.set(monthKey, bucket);
      });

      student.complianceHistory?.forEach((entry) => {
        if (entry.period !== 'monthly') return;
        const monthKey = new Date(entry.date).toISOString().slice(0, 7);
        if (!monthKey || typeof entry.value !== 'number') return;
        const bucket = complianceMap.get(monthKey) ?? { sum: 0, count: 0 };
        bucket.sum += entry.value;
        bucket.count += 1;
        complianceMap.set(monthKey, bucket);
      });
    });

    const months = Array.from(new Set([...bmiMap.keys(), ...complianceMap.keys()])).sort();
    return months.map((month) => ({
      month,
      averageBmi: bmiMap.get(month) ? bmiMap.get(month)!.sum / bmiMap.get(month)!.count : null,
      averageCompliance: complianceMap.get(month)
        ? complianceMap.get(month)!.sum / complianceMap.get(month)!.count
        : null
    }));
  }, [students]);

  const bmiHistoryForChart = useMemo(() => {
    if (!selectedStudent) return [] as StudentHealthSummary['healthHistory'];
    return [...selectedStudent.healthHistory]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8);
  }, [selectedStudent]);

  const complianceHistoryForChart = useMemo(() => {
    if (!selectedStudent) return [] as NonNullable<StudentHealthSummary['complianceHistory']>;
    const targetPeriod = compliancePeriod === 'overall' ? 'monthly' : compliancePeriod;
    return (selectedStudent.complianceHistory || [])
      .filter((entry) => entry.period === targetPeriod)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8);
  }, [selectedStudent, compliancePeriod]);

  useEffect(() => {
    if (isDetailDialogOpen && (!selectedStudentId || !students.find((student) => student._id === selectedStudentId))) {
      setIsDetailDialogOpen(false);
    }
  }, [students, selectedStudentId, isDetailDialogOpen]);

  useEffect(() => {
    if (selectedStudentId) {
      setCompliancePeriod('overall');
    }
  }, [selectedStudentId]);

  // 강사 권한 확인
  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
            <p className="text-gray-600">이 페이지는 강사만 접근할 수 있습니다.</p>
          </div>
        </div>
      </div>
    );
  }

  const loadStudentHealthData = async () => {
    if (!isInstructor) return;
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<any>('/api/learning-progress/instructor/students');

      const rawStudents: any[] = Array.isArray(response?.students) ? response.students : [];

      const studentsWithHealth: StudentHealthSummary[] = rawStudents.map((student) => {
        const healthProfile = student.studentInfo?.healthProfile || {};
        const complianceData = healthProfile.exerciseCompliance || {};
        const complianceHistoryRaw = healthProfile.exerciseComplianceHistory || [];
        const complianceHistory: StudentHealthSummary['complianceHistory'] = Array.isArray(complianceHistoryRaw)
          ? complianceHistoryRaw
              .map((entry: any) => ({
                date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
                period: entry.period || 'monthly',
                value: typeof entry.value === 'number' ? entry.value : null
              }))
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          : [];
        const complianceHistoryForFallback = complianceHistory || [];
        const complianceOverall = Number(
          healthProfile.exerciseCompliancePercentage ??
          complianceData.overall ??
          complianceData.monthly ??
          complianceData.weekly ??
          complianceData.daily ??
          0
        );

        const complianceByPeriod = {
          daily: complianceData.daily ?? null,
          weekly: complianceData.weekly ?? null,
          monthly: complianceData.monthly ?? null,
          overall: Math.max(0, Math.min(100, Math.round(complianceOverall)))
        };

        if (!complianceByPeriod.daily && complianceHistoryForFallback.length > 0) {
          const latestDaily = [...complianceHistoryForFallback]
            .reverse()
            .find((entry) => entry.period === 'daily' && entry.value !== null);
          if (latestDaily?.value) complianceByPeriod.daily = latestDaily.value;
        }
        if (!complianceByPeriod.weekly && complianceHistoryForFallback.length > 0) {
          const latestWeekly = [...complianceHistoryForFallback]
            .reverse()
            .find((entry) => entry.period === 'weekly' && entry.value !== null);
          if (latestWeekly?.value) complianceByPeriod.weekly = latestWeekly.value;
        }
        if (!complianceByPeriod.monthly && complianceHistoryForFallback.length > 0) {
          const latestMonthly = [...complianceHistoryForFallback]
            .reverse()
            .find((entry) => entry.period === 'monthly' && entry.value !== null);
          if (latestMonthly?.value) complianceByPeriod.monthly = latestMonthly.value;
        }

        const history: StudentHealthSummary['healthHistory'] = Array.isArray(healthProfile.healthHistory)
          ? (healthProfile.healthHistory as any[]).map((entry) => ({
              date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
              weight: entry.weight ?? undefined,
              bmi: entry.bmi ?? undefined,
              bloodPressure: entry.bloodPressure ?? undefined,
              notes: entry.notes ?? undefined
            }))
          : [];

        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const bmi = Number(healthProfile.bmi ?? history[0]?.bmi ?? 0);
        const height = Number(healthProfile.height ?? 0);
        const weight = Number(healthProfile.weight ?? history[0]?.weight ?? 0);
        const lastCheck = healthProfile.lastHealthCheck
          ? new Date(healthProfile.lastHealthCheck).toISOString()
          : history[0]?.date || student.updatedAt || new Date().toISOString();

        const chronicConditions = Array.isArray(healthProfile.chronicConditions)
          ? healthProfile.chronicConditions
          : [];
        const allergies = Array.isArray(healthProfile.allergies) ? healthProfile.allergies : [];
        const medications = Array.isArray(healthProfile.medications) ? healthProfile.medications : [];

        let healthStatus: StudentHealthSummary['healthStatus'] = 'good';
        if (chronicConditions.length === 0 && bmi >= 18.5 && bmi <= 24.9) {
          healthStatus = 'excellent';
        } else if (chronicConditions.length > 2 || bmi >= 30) {
          healthStatus = 'poor';
        } else if (chronicConditions.length === 1 || bmi < 18.5 || bmi > 28) {
          healthStatus = 'fair';
        }

        return {
          _id: student._id,
          name: student.name || '이름 없음',
          email: student.email || '이메일 없음',
          healthStatus,
          bmi,
          lastHealthCheck: lastCheck,
          exerciseCompliance: complianceByPeriod.overall,
          hasHealthData: !!healthProfile && Object.keys(healthProfile).length > 0,
          height,
          weight,
          bloodPressure: healthProfile.bloodPressure
            ? {
                systolic: healthProfile.bloodPressure.systolic,
                diastolic: healthProfile.bloodPressure.diastolic,
                measuredAt: healthProfile.bloodPressure.measuredAt
                  ? new Date(healthProfile.bloodPressure.measuredAt).toISOString()
                  : undefined
              }
            : undefined,
          bloodSugar: healthProfile.bloodSugar
            ? {
                fasting: healthProfile.bloodSugar.fasting,
                hba1c: healthProfile.bloodSugar.hba1c,
                measuredAt: healthProfile.bloodSugar.measuredAt
                  ? new Date(healthProfile.bloodSugar.measuredAt).toISOString()
                  : undefined
              }
            : undefined,
          cholesterol: healthProfile.cholesterol
            ? {
                total: healthProfile.cholesterol.total,
                ldl: healthProfile.cholesterol.ldl,
                hdl: healthProfile.cholesterol.hdl,
                measuredAt: healthProfile.cholesterol.measuredAt
                  ? new Date(healthProfile.cholesterol.measuredAt).toISOString()
                  : undefined
              }
            : undefined,
          chronicConditions,
          allergies,
          medications,
          fitnessMetrics: healthProfile.fitnessMetrics
            ? {
                restingHeartRate: healthProfile.fitnessMetrics.restingHeartRate,
                maxHeartRate: healthProfile.fitnessMetrics.maxHeartRate,
                bodyFatPercentage: healthProfile.fitnessMetrics.bodyFatPercentage,
                lungCapacity: healthProfile.fitnessMetrics.lungCapacity,
                measuredAt: healthProfile.fitnessMetrics.measuredAt
                  ? new Date(healthProfile.fitnessMetrics.measuredAt).toISOString()
                  : undefined
              }
            : undefined,
          healthHistory: history,
          complianceByPeriod,
          complianceHistory: complianceHistory
        };
      });

      setStudents(studentsWithHealth);
      const stats = calculateHealthStatistics(studentsWithHealth);
      setStatistics(stats);
      if (studentsWithHealth.length > 0) {
        setSelectedStudentId((prev) => prev ?? studentsWithHealth[0]._id);
      }
    } catch (error) {
      console.error('학생 건강정보 로딩 실패:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthStatistics = (students: StudentHealthSummary[]): HealthStatistics => {
    const totalStudents = students.length;
    const excellentCount = students.filter(s => s.healthStatus === 'excellent').length;
    const goodCount = students.filter(s => s.healthStatus === 'good').length;
    const fairCount = students.filter(s => s.healthStatus === 'fair').length;
    const poorCount = students.filter(s => s.healthStatus === 'poor').length;
    
    const studentsWithBMI = students.filter(s => s.bmi > 0);
    const averageBMI = studentsWithBMI.length > 0 
      ? studentsWithBMI.reduce((sum, s) => sum + s.bmi, 0) / studentsWithBMI.length 
      : 0;
    
    const studentsWithCompliance = students.filter(s => s.exerciseCompliance > 0);
    const averageCompliance = studentsWithCompliance.length > 0
      ? studentsWithCompliance.reduce((sum, s) => sum + s.exerciseCompliance, 0) / studentsWithCompliance.length
      : 0;

    return {
      totalStudents,
      excellentCount,
      goodCount,
      fairCount,
      poorCount,
      averageBMI: Math.round(averageBMI * 100) / 100,
      averageCompliance: Math.round(averageCompliance * 100) / 100
    };
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'excellent': return '우수';
      case 'good': return '양호';
      case 'fair': return '보통';
      case 'poor': return '주의';
      default: return '미정';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">학생 건강정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">오류가 발생했습니다</h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={loadStudentHealthData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 헤더 */}
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏥 학생 건강정보 개요</h1>
          <p className="text-gray-600">담당 학생들의 건강 상태를 카드로 확인하고, 상세 정보를 팝업에서 확인하세요.</p>
        </div>

        {/* 통계 카드 */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="rounded-full bg-blue-50 p-3">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">전체 학생</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalStudents}명</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="rounded-full bg-green-50 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">우수 · 양호</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.excellentCount + statistics.goodCount}명</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="rounded-full bg-yellow-50 p-3">
                  <AlertTriangle className="h-8 w-8 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">주의 필요</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.fairCount + statistics.poorCount}명</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="flex items-center gap-4 py-6">
                <div className="rounded-full bg-purple-50 p-3">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">평균 준수율</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.averageCompliance}%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 전체 추이 */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-lg text-gray-900">전체 건강 지표 추이</CardTitle>
            <p className="text-sm text-gray-500">월별 평균 BMI와 운동 준수율 추이를 확인하세요. 데이터가 쌓이면 자동으로 갱신됩니다.</p>
          </CardHeader>
          <CardContent>
            {overallTrend.length >= 2 ? (
              <div className="space-y-4">
                <LineChart
                  labels={overallTrend.map((entry) => entry.month)}
                  series={[
                    { name: '평균 BMI', data: overallTrend.map((entry) => entry.averageBmi ?? null), color: '#2563eb' },
                    { name: '평균 준수율', data: overallTrend.map((entry) => entry.averageCompliance ?? null), color: '#10b981' }
                  ]}
                />
                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-2"><span className="h-2 w-8 rounded bg-primary-600"></span> 평균 BMI</span>
                  <span className="flex items-center gap-2"><span className="h-2 w-8 rounded bg-success-500"></span> 평균 준수율</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">아직 추이를 그릴 수 있는 데이터가 부족합니다. 건강체크 정보가 누적되면 자동으로 표시됩니다.</p>
            )}
          </CardContent>
        </Card>

        {/* 학생 카드 목록 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">학생별 건강 현황</h2>
            <p className="text-sm text-gray-500">카드를 눌러 상세 지표와 추이를 확인하세요.</p>
          </div>

          {students.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-500">
              아직 담당 학생의 건강 정보가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {students.map((student) => (
                <Card
                  key={student._id}
                  className="border border-gray-200 transition-all hover:border-blue-400 hover:shadow-lg cursor-pointer"
                  onClick={() => {
                    setSelectedStudentId(student._id);
                    setCompliancePeriod('overall');
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base text-gray-900">{student.name}</CardTitle>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                      <Badge className={getHealthStatusColor(student.healthStatus)}>
                        {getHealthStatusText(student.healthStatus)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>마지막 체크: {new Date(student.lastHealthCheck).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                      <div>
                        <p className="text-xs text-gray-500">BMI</p>
                        <p className="font-semibold text-gray-900">{student.bmi ? student.bmi.toFixed(1) : '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">준수율</p>
                        <p className="font-semibold text-gray-900">{student.exerciseCompliance}%</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${student.exerciseCompliance}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">전체</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={(event) => {
                      event.stopPropagation();
                      setSelectedStudentId(student._id);
                      setCompliancePeriod('overall');
                      setIsDetailDialogOpen(true);
                    }}>
                      상세 보기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 상세 팝업 */}
        <Dialog open={isDetailDialogOpen && !!selectedStudent} onOpenChange={(open) => {
          setIsDetailDialogOpen(open);
          if (!open) {
            setSelectedStudentId(null);
          }
        }}>
          <HealthDialogContent>
            {selectedStudent && (
              <div className="flex h-full flex-col">
                <HealthDialogHeader>
                  <div>
                    <DialogTitle className="text-lg font-semibold text-gray-900">{selectedStudent.name} 회원 건강 상세</DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                      회원이 공개한 건강 데이터를 기반으로 최신 지표와 추이를 제공합니다.
                    </DialogDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsDetailDialogOpen(false);
                      setSelectedStudentId(null);
                    }}
                  >
                    닫기
                  </Button>
                </HealthDialogHeader>

                <HealthDialogBody>
                  <div className="flex flex-col gap-6">
                    <Card className="border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-900">BMI 추이</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <LineChart
                          labels={bmiHistoryForChart.map((entry) => new Date(entry.date).toLocaleDateString('ko-KR'))}
                          series={[
                            {
                              name: 'BMI',
                              data: bmiHistoryForChart.map((entry) => entry.bmi ?? null),
                              color: '#2563eb'
                            }
                          ]}
                        />
                      </CardContent>
                    </Card>

                    <Card className="border border-gray-200 shadow-sm">
                      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-sm text-gray-900">운동 준수율 추이</CardTitle>
                        <div className="flex flex-wrap gap-1">
                          {(['overall', 'daily', 'weekly', 'monthly'] as const).map((period) => (
                            <Button
                              key={period}
                              size="xs"
                              variant={compliancePeriod === period ? 'default' : 'outline'}
                              onClick={() => setCompliancePeriod(period)}
                            >
                              {period === 'overall' ? '전체' : period === 'daily' ? '일간' : period === 'weekly' ? '주간' : '월간'}
                            </Button>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-3 rounded-full bg-gray-200">
                            <div
                              className="h-3 rounded-full bg-emerald-500"
                              style={{ width: `${Math.max(0, Math.min(100, selectedStudent.complianceByPeriod[compliancePeriod] ?? 0))}%` }}
                            ></div>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">
                            {Math.round(selectedStudent.complianceByPeriod[compliancePeriod] ?? 0)}%
                          </span>
                        </div>

                        <LineChart
                          labels={complianceHistoryForChart.map((entry) => new Date(entry.date).toLocaleDateString('ko-KR'))}
                          series={[{
                            name: '준수율',
                            data: complianceHistoryForChart.map((entry) => entry.value ?? null),
                            color: '#0ea5e9'
                          }]}
                        />
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <Card className="border border-gray-200 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm text-gray-900 flex items-center gap-2">
                            <HeartPulse className="h-4 w-4 text-red-500" /> 주요 건강 지표
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-xs text-gray-500">혈압</p>
                            <p className="font-semibold text-gray-900">
                              {selectedStudent.bloodPressure?.systolic && selectedStudent.bloodPressure?.diastolic
                                ? `${selectedStudent.bloodPressure.systolic}/${selectedStudent.bloodPressure.diastolic}`
                                : '-'}

                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">혈당 / HbA1c</p>
                            <p className="font-semibold text-gray-900">
                              {selectedStudent.bloodSugar?.fasting ? `공복 ${selectedStudent.bloodSugar.fasting} mg/dL` : '-'}
                            </p>
                            {selectedStudent.bloodSugar?.hba1c && (
                              <p className="text-xs text-gray-600">HbA1c {selectedStudent.bloodSugar.hba1c}%</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">콜레스테롤</p>
                            <p className="font-semibold text-gray-900">
                              {selectedStudent.cholesterol?.total ? `${selectedStudent.cholesterol.total} mg/dL` : '-'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-gray-200 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-sm text-gray-900 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-500" /> 체력 지표
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {selectedStudent.fitnessMetrics ? (
                            <ul className="space-y-1">
                              {selectedStudent.fitnessMetrics.restingHeartRate && (
                                <li>• 안정시 심박수: {selectedStudent.fitnessMetrics.restingHeartRate} bpm</li>
                              )}
                              {selectedStudent.fitnessMetrics.maxHeartRate && (
                                <li>• 최대 심박수: {selectedStudent.fitnessMetrics.maxHeartRate} bpm</li>
                              )}
                              {selectedStudent.fitnessMetrics.bodyFatPercentage && (
                                <li>• 체지방률: {selectedStudent.fitnessMetrics.bodyFatPercentage}%</li>
                              )}
                              {selectedStudent.fitnessMetrics.lungCapacity && (
                                <li>• 폐활량: {selectedStudent.fitnessMetrics.lungCapacity} L</li>
                              )}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-500">체력 지표 데이터가 없습니다.</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="border border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-sm text-gray-900 flex items-center gap-2">
                          <Thermometer className="h-4 w-4 text-blue-500" /> 알레르기 · 질환 · 약물
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500">만성 질환</p>
                          {selectedStudent.chronicConditions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedStudent.chronicConditions.map((condition) => (
                                <Badge key={condition} variant="secondary" className="bg-red-100 text-red-700">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">등록된 질환이 없습니다.</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">알레르기</p>
                          {selectedStudent.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedStudent.allergies.map((allergy) => (
                                <Badge key={allergy} variant="outline">{allergy}</Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">알레르기 정보가 없습니다.</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">복용 약물</p>
                          {selectedStudent.medications.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedStudent.medications.map((medication) => (
                                <Badge key={medication} variant="outline">💊 {medication}</Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">복용 약물 정보가 없습니다.</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </HealthDialogBody>
              </div>
            )}
          </HealthDialogContent>
        </Dialog>
      </div>
    </div>
  );
}
