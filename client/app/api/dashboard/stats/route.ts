import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  try {
    // 서버 URL 가져오기 (서버 사이드에서는 환경 변수 사용 가능)
    // NEXT_PUBLIC_API_URL은 클라이언트용이므로 서버 사이드에서는 무시하고 Express 서버 URL만 사용
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
    
    // 무한 반복 방지: Next.js API 라우트 자체를 호출하지 않도록 확인
    if (serverUrl.includes('localhost:3000') || serverUrl.includes(':3000')) {
      console.error('[Next.js API] 잘못된 서버 URL 감지:', serverUrl);
      logger.error('대시보드 통계 프록시 오류: Next.js 서버를 호출하려고 시도했습니다.', { serverUrl });
      return NextResponse.json(
        {
          success: false,
          error: '서버 설정 오류',
          details: 'Express 서버 URL이 올바르게 설정되지 않았습니다.',
        },
        { status: 500 }
      );
    }
    
    // 클라이언트에서 전달된 Authorization 헤더 가져오기
    const authHeader = req.headers.get('authorization');
    
    const targetUrl = `${serverUrl}/api/dashboard/stats`;
    logger.api('대시보드 통계 프록시 요청 시작', { serverUrl: targetUrl, hasAuth: !!authHeader });
    
    console.log('[Next.js API] 대시보드 통계 프록시 요청:', { targetUrl, hasAuth: !!authHeader, actualServerUrl: serverUrl });
    
    // 서버로 요청 전달 (타임아웃 설정)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error('[Next.js API] 서버 요청 타임아웃 (30초)');
    }, 30000);
    
    let response: Response;
    try {
      console.log('[Next.js API] Express 서버로 요청 전송 중...');
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { 'Authorization': authHeader }),
        },
        cache: 'no-store', // 캐시 사용 안 함
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const elapsedTime = Date.now() - startTime;
      console.log(`[Next.js API] Express 서버 응답 수신 (${elapsedTime}ms):`, { status: response.status, ok: response.ok });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      const elapsedTime = Date.now() - startTime;
      console.error(`[Next.js API] Express 서버 요청 실패 (${elapsedTime}ms):`, fetchError);
      if (fetchError?.name === 'AbortError') {
        logger.error('대시보드 통계 서버 요청 타임아웃', { elapsedTime });
        return NextResponse.json(
          {
            success: false,
            error: '서버가 응답하지 않습니다. 타임아웃이 발생했습니다.',
            details: `요청 시간: ${elapsedTime}ms`,
          },
          { status: 504 }
        );
      }
      throw fetchError;
    }

    // 응답 상태 확인
    if (!response.ok) {
      let errorDetails: any = null;
      let errorMessage = `서버 오류: ${response.status}`;
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorDetails = await response.json();
          // 중첩된 오류 메시지 방지 - details가 문자열인 경우 파싱 시도
          if (errorDetails.details && typeof errorDetails.details === 'string') {
            try {
              const parsed = JSON.parse(errorDetails.details);
              errorMessage = parsed.error || parsed.details || errorMessage;
            } catch {
              errorMessage = errorDetails.error || errorDetails.details || errorMessage;
            }
          } else {
            errorMessage = errorDetails.error || errorDetails.details || errorMessage;
          }
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        console.error('[Next.js API] 오류 응답 파싱 실패:', parseError);
        errorMessage = `서버 오류: ${response.status}`;
      }
      
      logger.error('대시보드 통계 서버 오류:', { status: response.status, errorMessage, errorDetails });
      return NextResponse.json(
        {
          success: false,
          error: '대시보드 통계를 가져올 수 없습니다',
          details: errorMessage,
        },
        { status: response.status }
      );
    }

    // 응답 데이터 가져오기
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      logger.error('대시보드 통계 JSON 파싱 오류:', jsonError);
      return NextResponse.json(
        {
          success: false,
          error: '대시보드 통계 응답을 파싱할 수 없습니다',
          details: jsonError instanceof Error ? jsonError.message : '알 수 없는 오류',
        },
        { status: 500 }
      );
    }

    logger.api('대시보드 통계 프록시 성공', { dataKeys: Object.keys(data || {}) });

    // 서버 응답을 그대로 반환
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('대시보드 통계 프록시 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '대시보드 통계를 가져올 수 없습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

