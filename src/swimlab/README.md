
# SwimLab PRO Kit (Q3)

- 즉시 사용 가능한 **수영 프로그램 생성기** + **건강/질환 규칙 엔진** + **드릴/훈련법 사전**
- **좌/우 프로필 비교**, **패턴 선택**, **툴팁(왜/근거/휴식 이유)**, **마스터즈 기준 CSV 업로드** 지원

## 사용 (Next.js / Vite / CRA)
```
/your-app/
  src/
    swimlab/
      ... (본 zip의 src 폴더 전체 복사)
```
- Next.js: `app/page.tsx`
```tsx
import dynamic from 'next/dynamic';
const SwimProgramGenerator = dynamic(() => import('./swimlab/components/SwimProgramGenerator'), { ssr:false });
export default function Page(){ return <SwimProgramGenerator/> }
```
- Vite/CRA: `App.tsx`
```tsx
import SwimProgramGenerator from './swimlab/components/SwimProgramGenerator';
export default function App(){ return <SwimProgramGenerator/> }
```

## 데이터 확장
- `src/swimlab/data/health/*.ts` : 건강/질환/특수상황 추가 (근거 id 연결)
- `src/swimlab/data/training/*.ts` : 훈련법/드릴 확장
- `src/swimlab/data/evidence.ts` : **근거(논문/가이드) 링크** 추가
- `src/swimlab/store/registry.ts` : 첫 로드 시 레지스트리 메모리화 → 우상단 ⚙ 저장

## 마스터즈 기준 업로드
- UI 우측 **Masters CSV 업로드** → 즉시 반영. 샘플: `public/samples/masters-anchor-template.csv`

## 파일 구성
- `src/swimlab/types.ts` — 타입/스키마
- `src/swimlab/utils/*` — CSS/Zone/CSV/툴팁/기여점 계산
- `src/swimlab/data/*` — 근거 + 건강/질환 + 훈련법 + 드릴
- `src/swimlab/logic/*` — 규칙→세트 생성
- `src/swimlab/components/SwimProgramGenerator.tsx` — UI(비교/툴팁/업로드)


업데이트: 2025-09-29
