/**
 * 건강정보 입력 API 엔드포인트
 * 
 * 연동되는 데이터:
 * - 회원 건강정보 저장
 * - 운동 프로그램 생성 요청
 * - 데이터베이스 저장 및 검증
 * 
 * 연동되는 파일:
 * - /swim-training-engine/ (수영 트레이닝 규칙 엔진)
 * - MongoDB 데이터베이스
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildPlan, type HealthInput, type PlanOutput } from '../../../../swim-training-engine/src/engine/swim-plan';

// 임시 데이터 저장소 (실제로는 MongoDB 사용)
const healthDataStore = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const healthData: HealthInput = await request.json();
    
    // 데이터 검증
    if (!healthData.demographics?.age || !healthData.demographics?.sex) {
      return NextResponse.json(
        { error: '기본 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!healthData.anthropometrics?.height_cm || !healthData.anthropometrics?.weight_kg) {
      return NextResponse.json(
        { error: '신체 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    // 운동 프로그램 생성
    const trainingPlan: PlanOutput = buildPlan(healthData);
    
    // 건강정보와 운동 프로그램 저장
    const userId = `user_${Date.now()}`;
    const savedData = {
      userId,
      healthData,
      trainingPlan,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    healthDataStore.set(userId, savedData);
    
    return NextResponse.json({
      success: true,
      userId,
      trainingPlan,
      message: '건강정보가 저장되고 운동 프로그램이 생성되었습니다.'
    });

  } catch (error) {
    console.error('건강정보 저장 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const userData = healthDataStore.get(userId);
    
    if (!userData) {
      return NextResponse.json(
        { error: '사용자 데이터를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: userData
    });

  } catch (error) {
    console.error('건강정보 조회 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}





