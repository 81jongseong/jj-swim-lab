/**
 * @file 강습법 개별 API 라우트 (Next.js API Routes)
 * @description 특정 강습법의 수정, 삭제를 처리하는 동적 라우트
 * @date 2025-01-13
 * @author JJ Swim Lab
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 강습법 수정 API 라우트 호출됨:', params.id);
    
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/teaching-methods/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.log('✅ 강습법 수정 성공');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 강습법 수정 API 라우트 오류:', error);
    return NextResponse.json(
      { error: '서버 내부 오류' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log('🔍 강습법 삭제 API 라우트 호출됨:', params.id);
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${BACKEND_URL}/api/teaching-methods/${params.id}`, {
      method: 'DELETE',
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
    console.log('✅ 강습법 삭제 성공');
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ 강습법 삭제 API 라우트 오류:', error);
    return NextResponse.json(
      { error: '서버 내부 오류' },
      { status: 500 }
    );
  }
}

