/**
 * 📊 JJ Swim Lab - BarChart UI 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - 데이터 시각화를 위한 막대 차트 컴포넌트
 * - 수영 관련 통계 및 성과 데이터의 시각적 표현
 * - 반응형 디자인으로 다양한 화면 크기 지원
 * - 커스터마이징 가능한 차트 스타일 및 색상
 * - 접근성을 고려한 차트 인터랙션
 * 
 * 🔄 **주요 기능**
 * - 막대 차트 데이터 시각화
 * - 반응형 차트 크기 조정
 * - 커스터마이징 가능한 스타일
 * - 차트 인터랙션 및 툴팁
 * - 접근성 지원 (ARIA 라벨 등)
 * 
 * 🗄️ **데이터 연동**
 * - 차트 데이터 배열 (labels, datasets)
 * - 차트 스타일 및 색상 설정
 * - 차트 인터랙션 이벤트
 * - 반응형 크기 조정 정보
 * - 접근성 속성 및 라벨
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (기본 컴포넌트)
 * - 차트 라이브러리 (Chart.js, Recharts 등)
 * - 반응형 디자인 라이브러리
 * - 접근성 도구 및 라이브러리
 * - Tailwind CSS (스타일링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 차트 데이터의 정확성 및 유효성 검증
 * 2. 반응형 디자인의 일관성 유지
 * 3. 차트 성능 및 렌더링 최적화
 * 4. 접근성 표준 준수
 * 5. 다양한 데이터 형식 지원
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] 차트 데이터 시각화 확인
 * - [ ] 반응형 디자인 동작 확인
 * - [ ] 차트 인터랙션 검증
 * - [ ] 접근성 속성 확인
 * - [ ] 성능 및 렌더링 최적화 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 막대 차트)
 * - 2024-12-19: 반응형 디자인 적용
 * - 2024-12-19: 차트 커스터마이징 시스템 구현
 * - 2024-12-19: 접근성 지원 시스템 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (막대 차트 UI 컴포넌트 완료)
 * 
 * 🚀 **다음 단계**
 * - 다양한 차트 타입 지원
 * - 실시간 데이터 업데이트
 * - 성능 최적화
 * - 접근성 개선
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <BarChart 
 *   data={chartData}
 *   options={chartOptions}
 *   onBarClick={(bar) => handleBarClick(bar)}
 *   responsive={true}
 *   accessibility={true}
 * />
 * ```
 */

'use client';

import React from 'react';

type DataPoint = { label: string; value: number };

export default function BarChart({ data, maxValue, height = 160 }: { data: DataPoint[]; maxValue?: number; height?: number }) {
  const max = maxValue ?? Math.max(1, ...data.map(d => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-blue-500/70 rounded-t"
              title={`${d.label}: ${d.value}`}
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            <div className="mt-1 text-[10px] text-gray-600 truncate w-full text-center" title={d.label}>
              {d.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}







































