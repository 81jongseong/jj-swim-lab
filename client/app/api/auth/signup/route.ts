import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 서버 API로 요청 전달
    const serverUrl = 'http://localhost:5000';
    logger.info('Attempting to connect to server at:', serverUrl);
    logger.info('Request body:', body);
    
    const response = await fetch(`${serverUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    logger.info('Server response status:', response.status);
    
    const data = await response.json();
    logger.info('Server response data:', data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || '회원가입에 실패했습니다.' },
        { status: response.status }
      );
    }

    // 서버 응답 스키마를 클라이언트 스키마와 일치시키기
    const normalizedData = {
      ...data,
      user: {
        ...data.user,
        _id: data.user.id, // id를 _id로 변환
        id: undefined // 기존 id 필드 제거
      }
    };

    // 성공 시 쿠키와 localStorage 모두에 토큰 저장
    const responseWithCookie = NextResponse.json(normalizedData);
    responseWithCookie.cookies.set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24시간
    });

    return responseWithCookie;
  } catch (error) {
    logger.error('Signup API error:', error);
    return NextResponse.json(
      { error: `서버 연결 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}` },
      { status: 500 }
    );
  }
}
