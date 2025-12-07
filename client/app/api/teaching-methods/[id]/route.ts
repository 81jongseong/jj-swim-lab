import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    logger.info('🔍 강습법 수정 API 라우트 호출됨:', params.id);
    
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

    logger.info('📡 백엔드 응답 상태:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      logger.error('❌ 백엔드 오류:', errorData);
      return NextResponse.json(
        { error: '백엔드 서버 오류' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    logger.info('✅ 강습법 수정 성공');
    return NextResponse.json(data);
  } catch (error) {
    logger.error('❌ 강습법 수정 API 라우트 오류:', error);
    return NextResponse.json(
      { error: '서버 내부 오류' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    logger.info('🔍 강습법 삭제 API 라우트 호출됨:', params.id);
    
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

    logger.info('📡 백엔드 응답 상태:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorData = await backendResponse.text();
      logger.error('❌ 백엔드 오류:', errorData);
      return NextResponse.json(
        { error: '백엔드 서버 오류' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    logger.info('✅ 강습법 삭제 성공');
    return NextResponse.json(data);
  } catch (error) {
    logger.error('❌ 강습법 삭제 API 라우트 오류:', error);
    return NextResponse.json(
      { error: '서버 내부 오류' },
      { status: 500 }
    );
  }
}

