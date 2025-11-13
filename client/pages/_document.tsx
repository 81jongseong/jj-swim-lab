/**
 * @file Next.js custom Document (App Router 환경 보완용)
 * @description App Router 기반이지만 일부 라이브러리가 pages 라우터의 `_document`를 요구하므로,
 *              최소한의 Document 구현을 제공해 빌드 오류를 방지합니다.
 * @relatedData HTML 메타 데이터, 글로벌 스타일
 * @relatedFiles `app/layout.tsx`, `pages/_error.tsx`
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ko">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}


