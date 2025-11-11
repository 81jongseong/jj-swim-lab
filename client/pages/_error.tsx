/**
 * @file next.js legacy error page.
 * @description app router 기반이지만 일부 라이브러리가 pages 라우터 `_error`를 요구해 빌드가 실패하여, 기본 에러 페이지를 복구해 next 빌드가 통과하도록 합니다.
 * 연동 데이터: http status 코드, next.js error boundary 전달 에러 정보.
 * 연동 파일: `app/error.tsx`, `app/global-error.tsx`.
 */

import type { NextPageContext } from 'next';

interface LegacyErrorPageProps {
  statusCode?: number;
}

function LegacyErrorPage({ statusCode }: LegacyErrorPageProps) {
  const message = statusCode
    ? `${statusCode} 오류가 발생했습니다.`
    : '알 수 없는 오류가 발생했습니다.';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div style={{ maxWidth: 420, width: '100%', backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)', padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>문제가 발생했습니다</h1>
        <p style={{ color: '#475569', marginBottom: 20 }}>{message}</p>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 20px', borderRadius: 999, backgroundColor: '#2563eb', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
          홈으로 이동
        </a>
      </div>
    </div>
  );
}

LegacyErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res?.statusCode ?? err?.statusCode;
  return { statusCode };
};

export default LegacyErrorPage;
