import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

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

// 측정 타입 정의
const measurementTypes = {
  heart_rate: { label: '심박수', unit: 'bpm', min: 30, max: 220 },
  blood_pressure: { label: '혈압', unit: 'mmHg', min: 60, max: 250 },
  weight: { label: '체중', unit: 'kg', min: 20, max: 300 },
  body_fat: { label: '체지방률', unit: '%', min: 0, max: 50 },
  muscle_mass: { label: '근육량', unit: 'kg', min: 10, max: 200 },
  bmi: { label: 'BMI', unit: '', min: 10, max: 60 }
};

// 목표 유효성 검증
function validateGoal(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.type || !measurementTypes[data.type as keyof typeof measurementTypes]) {
    errors.push('유효하지 않은 목표 타입입니다');
  }
  
  if (typeof data.targetValue !== 'number' || isNaN(data.targetValue)) {
    errors.push('목표값은 숫자여야 합니다');
  } else {
    const typeConfig = measurementTypes[data.type as keyof typeof measurementTypes];
    if (data.targetValue < typeConfig.min || data.targetValue > typeConfig.max) {
      errors.push(`${typeConfig.label} 목표값은 ${typeConfig.min}~${typeConfig.max} 범위여야 합니다`);
    }
  }
  
  if (typeof data.currentValue !== 'number' || isNaN(data.currentValue)) {
    errors.push('현재값은 숫자여야 합니다');
  }
  
  if (!data.deadline || isNaN(new Date(data.deadline).getTime())) {
    errors.push('유효한 목표 마감일을 입력해주세요');
  } else {
    const deadline = new Date(data.deadline);
    const now = new Date();
    if (deadline <= now) {
      errors.push('목표 마감일은 현재 시간보다 미래여야 합니다');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// 목표 상태 계산
function calculateGoalStatus(goal: HealthGoal): 'active' | 'completed' | 'overdue' {
  const now = new Date();
  const deadline = new Date(goal.deadline);
  
  if (now > deadline) {
    return 'overdue';
  }
  
  // 목표 달성 여부 판단 (타입별로 다름)
  const isCompleted = (() => {
    switch (goal.type) {
      case 'weight':
      case 'body_fat':
        return goal.currentValue <= goal.targetValue;
      case 'muscle_mass':
        return goal.currentValue >= goal.targetValue;
      case 'heart_rate':
      case 'blood_pressure':
        return Math.abs(goal.currentValue - goal.targetValue) <= 5; // 5 단위 이내
      case 'bmi':
        return Math.abs(goal.currentValue - goal.targetValue) <= 1; // 1 이내
      default:
        return false;
    }
  })();
  
  return isCompleted ? 'completed' : 'active';
}

// 목표 진행률 계산
function calculateProgress(goal: HealthGoal): number {
  const { currentValue, targetValue, type } = goal;
  
  switch (type) {
    case 'weight':
    case 'body_fat':
      // 감소 목표: 현재값이 목표값에 가까워질수록 진행률 증가
      return Math.max(0, Math.min(100, ((currentValue - targetValue) / currentValue) * 100));
    case 'muscle_mass':
      // 증가 목표: 현재값이 목표값에 가까워질수록 진행률 증가
      return Math.max(0, Math.min(100, (currentValue / targetValue) * 100));
    case 'heart_rate':
    case 'blood_pressure':
    case 'bmi':
      // 목표값에 가까워질수록 진행률 증가
      const diff = Math.abs(currentValue - targetValue);
      const maxDiff = Math.max(currentValue, targetValue) * 0.2; // 20% 허용 오차
      return Math.max(0, Math.min(100, ((maxDiff - diff) / maxDiff) * 100));
    default:
      return 0;
  }
}

// GET: 건강 목표 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    
    // TODO: 실제 데이터베이스에서 조회
    // 현재는 임시 데이터 반환
    const mockGoals: HealthGoal[] = [
      {
        id: '1',
        userId: 'user1',
        type: 'weight',
        targetValue: 65,
        currentValue: 70,
        unit: 'kg',
        deadline: new Date('2025-03-31T00:00:00Z'),
        status: 'active',
        createdAt: new Date('2024-12-01T00:00:00Z'),
        updatedAt: new Date('2024-12-19T00:00:00Z')
      },
      {
        id: '2',
        userId: 'user1',
        type: 'heart_rate',
        targetValue: 70,
        currentValue: 75,
        unit: 'bpm',
        deadline: new Date('2025-01-31T00:00:00Z'),
        status: 'active',
        createdAt: new Date('2024-11-01T00:00:00Z'),
        updatedAt: new Date('2024-12-19T00:00:00Z')
      }
    ];
    
    let filteredGoals = mockGoals;
    
    // 상태 필터링
    if (status && ['active', 'completed', 'overdue'].includes(status)) {
      filteredGoals = filteredGoals.filter(g => g.status === status);
    }
    
    // 타입 필터링
    if (type && measurementTypes[type as keyof typeof measurementTypes]) {
      filteredGoals = filteredGoals.filter(g => g.type === type);
    }
    
    // 목표별 진행률 계산
    const goalsWithProgress = filteredGoals.map(goal => ({
      ...goal,
      progress: calculateProgress(goal)
    }));
    
    return NextResponse.json({
      success: true,
      data: goalsWithProgress,
      total: goalsWithProgress.length
    });
    
  } catch (error) {
    logger.error('건강 목표 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '건강 목표 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST: 새로운 건강 목표 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 유효성 검증
    const validation = validateGoal(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }
    
    // TODO: 실제 데이터베이스에 저장
    // 현재는 임시 응답
    const newGoal: HealthGoal = {
      id: Date.now().toString(),
      userId: 'user1', // TODO: 실제 사용자 ID
      type: body.type,
      targetValue: body.targetValue,
      currentValue: body.currentValue || 0,
      unit: measurementTypes[body.type as keyof typeof measurementTypes].unit,
      deadline: new Date(body.deadline),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 상태 계산
    newGoal.status = calculateGoalStatus(newGoal);
    
    return NextResponse.json({
      success: true,
      data: newGoal,
      message: '건강 목표가 성공적으로 추가되었습니다'
    });
    
  } catch (error) {
    logger.error('건강 목표 추가 오류:', error);
    return NextResponse.json(
      { success: false, error: '건강 목표 추가 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT: 건강 목표 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '건강 목표 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 유효성 검증
    const validation = validateGoal(updateData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }
    
    // TODO: 실제 데이터베이스에서 업데이트
    // 현재는 임시 응답
    const updatedGoal: HealthGoal = {
      id,
      userId: 'user1', // TODO: 실제 사용자 ID
      type: updateData.type,
      targetValue: updateData.targetValue,
      currentValue: updateData.currentValue,
      unit: measurementTypes[updateData.type as keyof typeof measurementTypes].unit,
      deadline: new Date(updateData.deadline),
      status: 'active',
      createdAt: new Date(), // TODO: 실제 생성일시
      updatedAt: new Date()
    };
    
    // 상태 계산
    updatedGoal.status = calculateGoalStatus(updatedGoal);
    
    return NextResponse.json({
      success: true,
      data: updatedGoal,
      message: '건강 목표가 성공적으로 수정되었습니다'
    });
    
  } catch (error) {
    logger.error('건강 목표 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '건강 목표 수정 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 건강 목표 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '건강 목표 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // TODO: 실제 데이터베이스에서 삭제
    // 현재는 임시 응답
    
    return NextResponse.json({
      success: true,
      message: '건강 목표가 성공적으로 삭제되었습니다'
    });
    
  } catch (error) {
    logger.error('건강 목표 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '건강 목표 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}








