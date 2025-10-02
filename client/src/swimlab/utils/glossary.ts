/**
 * SwimLab Data Pack v4 - 용어 설명 (초보자 눈높이)
 * 
 * SPL, CSS, Zone, TT 등 핵심 용어 정의
 * 
 * 관련 파일:
 * - client/src/swimlab/components/Planner.tsx
 * - client/src/swimlab/components/SwimProgramGenerator.tsx
 */

export const GLOSSARY = [
  { term: 'SPL', short: 'Strokes Per Length', easy: '25m(한 길) 동안 팔 젓는 횟수', tip: '너무 적으면 글라이드 과다, 너무 많으면 스트로크가 짧음' },
  { term: 'CSS', short: 'Critical Swim Speed', easy: '오래 유지 가능한 기준 페이스', tip: '200/400 기록으로 추정해 훈련 페이스 산출' },
  { term: 'Zone', short: 'Z1~Z5 강도 구간', easy: 'Z1 회복~Z5 스프린트', tip: '이 프로젝트는 Zone별 휴식 자동 계산' },
  { term: 'TT', short: 'Tempo Trainer', easy: '초/스트로크 리듬을 맞추는 메트로놈', tip: '세트마다 권장 대역(예: 0.95~1.10s) 표시' },
  { term: 'Rest (r)', short: '세트 사이 휴식', easy: '각 반복 사이 쉬는 시간', tip: '예: r20″ = 20초 휴식' },
  { term: 'Rep/Set', short: '반복/묶음', easy: '반복(rep)을 모아 놓은 묶음(set)', tip: '예: 8×50m = 50m를 8번' },
  { term: 'Drill', short: '교정 동작', easy: '폼/감각을 살리기 위한 동작', tip: '드릴→본수영 연결이 핵심' },
  { term: 'IM', short: 'Individual Medley', easy: '접-배-평-자 혼영', tip: '영법 전환 능력과 밸런스' },
];

