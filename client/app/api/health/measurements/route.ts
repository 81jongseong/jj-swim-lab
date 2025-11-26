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

// 측정 타입 정의
const measurementTypes = {
  heart_rate: { label: '심박수', unit: 'bpm', min: 30, max: 220 },
  blood_pressure: { label: '혈압', unit: 'mmHg', min: 60, max: 250 },
  weight: { label: '체중', unit: 'kg', min: 20, max: 300 },
  body_fat: { label: '체지방률', unit: '%', min: 0, max: 50 },
  muscle_mass: { label: '근육량', unit: 'kg', min: 10, max: 200 },
  bmi: { label: 'BMI', unit: '', min: 10, max: 60 }
};

// 측정 데이터 유효성 검증
function validateMeasurement(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.type || !measurementTypes[data.type as keyof typeof measurementTypes]) {
    errors.push('유효하지 않은 측정 타입입니다');
  }
  
  if (typeof data.value !== 'number' || isNaN(data.value)) {
    errors.push('측정값은 숫자여야 합니다');
  } else {
    const typeConfig = measurementTypes[data.type as keyof typeof measurementTypes];
    if (data.value < typeConfig.min || data.value > typeConfig.max) {
      errors.push(`${typeConfig.label} 측정값은 ${typeConfig.min}~${typeConfig.max} 범위여야 합니다`);
    }
  }
  
  if (!data.measuredAt || isNaN(new Date(data.measuredAt).getTime())) {
    errors.push('유효한 측정 일시를 입력해주세요');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// GET: 측정 데이터 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '50');
    
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
        type: 'weight',
        value: 70,
        unit: 'kg',
        measuredAt: new Date('2024-12-18T09:00:00Z'),
        notes: '아침 측정',
        createdAt: new Date('2024-12-18T09:00:00Z'),
        updatedAt: new Date('2024-12-18T09:00:00Z')
      }
    ];
    
    let filteredMeasurements = mockMeasurements;
    
    // 타입 필터링
    if (type && measurementTypes[type as keyof typeof measurementTypes]) {
      filteredMeasurements = filteredMeasurements.filter(m => m.type === type);
    }
    
    // 날짜 범위 필터링
    if (startDate) {
      const start = new Date(startDate);
      filteredMeasurements = filteredMeasurements.filter(m => m.measuredAt >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      filteredMeasurements = filteredMeasurements.filter(m => m.measuredAt <= end);
    }
    
    // 최신순 정렬 및 제한
    filteredMeasurements = filteredMeasurements
      .sort((a, b) => b.measuredAt.getTime() - a.measuredAt.getTime())
      .slice(0, limit);
    
    return NextResponse.json({
      success: true,
      data: filteredMeasurements,
      total: filteredMeasurements.length
    });
    
  } catch (error) {
    logger.error('측정 데이터 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '측정 데이터 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// POST: 새로운 측정 데이터 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 유효성 검증
    const validation = validateMeasurement(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }
    
    // TODO: 실제 데이터베이스에 저장
    // 현재는 임시 응답
    const newMeasurement: HealthMeasurement = {
      id: Date.now().toString(),
      userId: 'user1', // TODO: 실제 사용자 ID
      type: body.type,
      value: body.value,
      unit: measurementTypes[body.type as keyof typeof measurementTypes].unit,
      measuredAt: new Date(body.measuredAt),
      notes: body.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return NextResponse.json({
      success: true,
      data: newMeasurement,
      message: '측정 데이터가 성공적으로 추가되었습니다'
    });
    
  } catch (error) {
    logger.error('측정 데이터 추가 오류:', error);
    return NextResponse.json(
      { success: false, error: '측정 데이터 추가 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// PUT: 측정 데이터 수정
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '측정 데이터 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // 유효성 검증
    const validation = validateMeasurement(updateData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors },
        { status: 400 }
      );
    }
    
    // TODO: 실제 데이터베이스에서 업데이트
    // 현재는 임시 응답
    const updatedMeasurement: HealthMeasurement = {
      id,
      userId: 'user1', // TODO: 실제 사용자 ID
      type: updateData.type,
      value: updateData.value,
      unit: measurementTypes[updateData.type as keyof typeof measurementTypes].unit,
      measuredAt: new Date(updateData.measuredAt),
      notes: updateData.notes,
      createdAt: new Date(), // TODO: 실제 생성일시
      updatedAt: new Date()
    };
    
    return NextResponse.json({
      success: true,
      data: updatedMeasurement,
      message: '측정 데이터가 성공적으로 수정되었습니다'
    });
    
  } catch (error) {
    logger.error('측정 데이터 수정 오류:', error);
    return NextResponse.json(
      { success: false, error: '측정 데이터 수정 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

// DELETE: 측정 데이터 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '측정 데이터 ID가 필요합니다' },
        { status: 400 }
      );
    }
    
    // TODO: 실제 데이터베이스에서 삭제
    // 현재는 임시 응답
    
    return NextResponse.json({
      success: true,
      message: '측정 데이터가 성공적으로 삭제되었습니다'
    });
    
  } catch (error) {
    logger.error('측정 데이터 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '측정 데이터 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}








