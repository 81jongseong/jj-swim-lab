/**
 * @file 강습법 API 라우트 (Next.js API Routes)
 * @description 강습법 데이터를 백엔드 서버에서 가져와서 프론트엔드에 제공
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 강습법 API 라우트 호출됨');
    
    // Authorization 헤더 가져오기
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    // 백엔드 서버로 요청 전달
    const backendResponse = await fetch(`${BACKEND_URL}/api/teaching-methods`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 백엔드 응답 상태:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      console.error('❌ 백엔드 오류:', errorData);
      return NextResponse.json(
        { error: '백엔드 서버 오류' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    console.log('✅ 강습법 데이터 전달 성공:', data.data?.length || 0, '개');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 강습법 API 라우트 오류:', error);
    return NextResponse.json(
      { error: '서버 내부 오류' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 강습법 생성 API 라우트 호출됨');
    
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/teaching-methods`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      console.error('❌ 백엔드 오류:', errorData);
      return NextResponse.json(
        { error: '백엔드 서버 오류' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 강습법 생성 API 라우트 오류:', error);
    return NextResponse.json(
      { error: '서버 내부 오류' },
      { status: 500 }
    );
  }
}

