/**
 * 인쇄/공유용 텍스트·CSV·PDF 생성기
 * 
 * 연동되는 데이터:
 * - 생성된 수영 계획 (Plan)
 * - 세션별 상세 정보 (Session, Set)
 * - 안전 주의사항 및 코칭 큐
 * 
 * 연동되는 파일:
 * - lib/planner.ts (Plan 데이터)
 * - components/PlannerForm.tsx (결과 출력)
 * 
 * 출력 형식:
 * - 텍스트: 인쇄용 포맷
 * - CSV: 스프레드시트 호환
 * - PDF: 고품질 문서 (옵션)
 */

import type { Plan, Session, Set } from '@/lib/planner';

export interface ExportOptions {
  includeSafetyNotes: boolean;
  includeCoachingCues: boolean;
  includeEquipment: boolean;
  format: 'text' | 'csv' | 'pdf';
  language: 'ko' | 'en';
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
}

/**
 * 텍스트 형식으로 계획 내보내기
 * @param plan 수영 계획
 * @param options 내보내기 옵션
 * @returns 텍스트 형식 결과
 */
export function exportAsText(plan: Plan, options: ExportOptions): ExportResult {
  const { includeSafetyNotes, includeCoachingCues, includeEquipment } = options;
  
  let content = '';
  
  // 헤더
  content += '='.repeat(60) + '\n';
  content += `JJ Swim Lab: 수영 프로그램 생성기\n`;
  content += `계획명: ${plan.name}\n`;
  content += `목적: ${getGoalText(plan.goal)}\n`;
  content += `생성일: ${new Date().toLocaleDateString('ko-KR')}\n`;
  content += '='.repeat(60) + '\n\n';
  
  // 주간 요약
  content += '📊 주간 요약\n';
  content += '-'.repeat(30) + '\n';
  content += `총 운동 시간: ${plan.weeklyMinutes}분\n`;
  content += `총 운동 거리: ${plan.weeklyDistance}m\n`;
  content += `세션 수: ${plan.sessions.length}회\n`;
  content += `목적: ${getGoalText(plan.goal)}\n\n`;
  
  // 세션별 상세 계획
  content += '🏊‍♂️ 세션별 상세 계획\n';
  content += '='.repeat(60) + '\n\n';
  
  plan.sessions.forEach((session, index) => {
    content += `세션 ${index + 1}: ${session.name}\n`;
    content += `요일: ${session.day}\n`;
    content += `시간: ${session.duration}분\n`;
    content += `총 거리: ${session.totalDistance}m\n`;
    content += `세트 수: ${session.sets.length}개\n`;
    content += '-'.repeat(40) + '\n';
    
    // 세트별 상세 정보
    session.sets.forEach((set, setIndex) => {
      content += `${setIndex + 1}. ${set.name}\n`;
      content += `   설명: ${set.description}\n`;
      content += `   랩: ${set.laps}×25m (${set.distance}m)\n`;
      content += `   페이스: ${set.pace}\n`;
      content += `   훈련존: ${set.zone}\n`;
      content += `   휴식: ${set.rest}초\n`;
      
      if (includeCoachingCues && set.cues.length > 0) {
        content += `   코칭 큐: ${set.cues.join(', ')}\n`;
      }
      
      if (includeEquipment && set.equipment && set.equipment.length > 0) {
        content += `   장비: ${set.equipment.join(', ')}\n`;
      }
      
      content += '\n';
    });
    
    // 안전 주의사항
    if (includeSafetyNotes && session.safetyNotes.length > 0) {
      content += '⚠️ 안전 주의사항\n';
      session.safetyNotes.forEach(note => {
        content += `- ${note}\n`;
      });
      content += '\n';
    }
    
    content += '\n';
  });
  
  // 진행률 정보
  content += '📈 진행률 기반 자동 증감 로직\n';
  content += '-'.repeat(40) + '\n';
  content += `볼륨 증가: ${plan.progression.volumeIncrease}%\n`;
  content += `휴식 감소: ${plan.progression.restDecrease}초\n`;
  content += `강도 증가: ${plan.progression.intensityIncrease}%\n\n`;
  
  // 안전 제한사항
  if (includeSafetyNotes && plan.safetyCaps) {
    content += '🛡️ 안전 제한사항\n';
    content += '-'.repeat(30) + '\n';
    content += `Z4 최대 비율: ${plan.safetyCaps.zones.Z4maxPct}%\n`;
    content += `Z5 최대 비율: ${plan.safetyCaps.zones.Z5maxPct}%\n`;
    content += `하이폭식 허용: ${plan.safetyCaps.hypoxic.enabled ? '예' : '아니오'}\n`;
    content += `최대 하이폭식 거리: ${plan.safetyCaps.hypoxic.maxMeters}m\n`;
    content += `킥 볼륨 최대 비율: ${plan.safetyCaps.kickVolume.maxPct}%\n`;
    content += `세션 최대 시간: ${plan.safetyCaps.session.maxDuration}분\n`;
    content += `세트 간 최소 휴식: ${plan.safetyCaps.session.minRestBetweenSets}초\n`;
    
    if (plan.safetyCaps.restrictions.forbiddenDrills.length > 0) {
      content += `금지된 드릴: ${plan.safetyCaps.restrictions.forbiddenDrills.join(', ')}\n`;
    }
    
    if (plan.safetyCaps.restrictions.forbiddenStrokes.length > 0) {
      content += `금지된 영법: ${plan.safetyCaps.restrictions.forbiddenStrokes.join(', ')}\n`;
    }
    
    if (plan.safetyCaps.restrictions.specialCues.length > 0) {
      content += `특별 주의사항: ${plan.safetyCaps.restrictions.specialCues.join(', ')}\n`;
    }
    
    content += '\n';
  }
  
  // 푸터
  content += '='.repeat(60) + '\n';
  content += 'JJ Swim Lab - 기록·건강·기술 체크 기반 수영 프로그램 생성기\n';
  content += '생성일: ' + new Date().toLocaleString('ko-KR') + '\n';
  content += '='.repeat(60) + '\n';
  
  return {
    content,
    filename: `swim_plan_${plan.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`,
    mimeType: 'text/plain;charset=utf-8'
  };
}

/**
 * CSV 형식으로 계획 내보내기
 * @param plan 수영 계획
 * @param options 내보내기 옵션
 * @returns CSV 형식 결과
 */
export function exportAsCSV(plan: Plan, options: ExportOptions): ExportResult {
  const { includeSafetyNotes, includeCoachingCues, includeEquipment } = options;
  
  let content = '';
  
  // 헤더
  content += 'JJ Swim Lab: 수영 프로그램 생성기\n';
  content += `계획명,${plan.name}\n`;
  content += `목적,${getGoalText(plan.goal)}\n`;
  content += `생성일,${new Date().toLocaleDateString('ko-KR')}\n`;
  content += `총 운동 시간,${plan.weeklyMinutes}분\n`;
  content += `총 운동 거리,${plan.weeklyDistance}m\n`;
  content += `세션 수,${plan.sessions.length}회\n\n`;
  
  // 세션별 데이터
  content += '세션,요일,시간(분),총거리(m),세트수,세트명,설명,랩,거리(m),페이스,훈련존,휴식(초)';
  
  if (includeCoachingCues) {
    content += ',코칭큐';
  }
  
  if (includeEquipment) {
    content += ',장비';
  }
  
  if (includeSafetyNotes) {
    content += ',안전주의사항';
  }
  
  content += '\n';
  
  // 데이터 행
  plan.sessions.forEach((session, sessionIndex) => {
    session.sets.forEach((set, setIndex) => {
      content += `세션${sessionIndex + 1},${session.day},${session.duration},${session.totalDistance},${session.sets.length},${set.name},${set.description},${set.laps},${set.distance},${set.pace},${set.zone},${set.rest}`;
      
      if (includeCoachingCues) {
        content += `,"${set.cues.join(', ')}"`;
      }
      
      if (includeEquipment) {
        content += `,"${set.equipment?.join(', ') || ''}"`;
      }
      
      if (includeSafetyNotes) {
        content += `,"${session.safetyNotes.join(', ')}"`;
      }
      
      content += '\n';
    });
  });
  
  // 진행률 정보
  content += '\n';
  content += '진행률 정보\n';
  content += '볼륨증가(%),휴식감소(초),강도증가(%)\n';
  content += `${plan.progression.volumeIncrease},${plan.progression.restDecrease},${plan.progression.intensityIncrease}\n`;
  
  return {
    content,
    filename: `swim_plan_${plan.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`,
    mimeType: 'text/csv;charset=utf-8'
  };
}

/**
 * PDF 형식으로 계획 내보내기 (기본 구현)
 * @param plan 수영 계획
 * @param options 내보내기 옵션
 * @returns PDF 형식 결과
 */
export function exportAsPDF(plan: Plan, options: ExportOptions): ExportResult {
  // 실제 구현에서는 jsPDF나 Puppeteer 등을 사용
  // 여기서는 텍스트 형식을 기반으로 한 기본 구현
  
  const textResult = exportAsText(plan, options);
  
  return {
    content: textResult.content,
    filename: `swim_plan_${plan.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
    mimeType: 'application/pdf'
  };
}

/**
 * 목적 텍스트 변환
 * @param goal 목적
 * @returns 목적 텍스트
 */
function getGoalText(goal: string): string {
  switch (goal) {
    case 'fatloss':
      return '체중감량';
    case 'endurance':
      return '체력향상';
    case 'performance':
      return '기록향상';
    default:
      return goal;
  }
}

/**
 * 계획 내보내기 (통합 함수)
 * @param plan 수영 계획
 * @param options 내보내기 옵션
 * @returns 내보내기 결과
 */
export function exportPlan(plan: Plan, options: ExportOptions): ExportResult {
  switch (options.format) {
    case 'text':
      return exportAsText(plan, options);
    case 'csv':
      return exportAsCSV(plan, options);
    case 'pdf':
      return exportAsPDF(plan, options);
    default:
      return exportAsText(plan, options);
  }
}

/**
 * 파일 다운로드 헬퍼
 * @param result 내보내기 결과
 */
export function downloadFile(result: ExportResult): void {
  const blob = new Blob([result.content], { type: result.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = result.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 인쇄용 HTML 생성
 * @param plan 수영 계획
 * @param options 내보내기 옵션
 * @returns HTML 문자열
 */
export function generatePrintHTML(plan: Plan, options: ExportOptions): string {
  const { includeSafetyNotes, includeCoachingCues, includeEquipment } = options;
  
  let html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${plan.name} - JJ Swim Lab</title>
      <style>
        body { font-family: 'Malgun Gothic', sans-serif; margin: 20px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .session { margin-bottom: 40px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .session-header { background: #007bff; color: white; padding: 15px; }
        .session-content { padding: 20px; }
        .set { background: #f9f9f9; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
        .set-header { display: flex; justify-content: between; align-items: center; margin-bottom: 10px; }
        .set-name { font-weight: bold; font-size: 1.1em; }
        .set-zone { background: #007bff; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.9em; }
        .set-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-bottom: 10px; }
        .set-detail { font-size: 0.9em; }
        .set-detail strong { color: #333; }
        .cues { margin-top: 10px; }
        .cue-badge { background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-right: 5px; }
        .safety-notes { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 15px; }
        .safety-notes h4 { color: #856404; margin-bottom: 10px; }
        .safety-notes ul { margin: 0; padding-left: 20px; }
        .safety-notes li { color: #856404; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        @media print { body { margin: 0; } .session { break-inside: avoid; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>JJ Swim Lab: 수영 프로그램 생성기</h1>
        <h2>${plan.name}</h2>
        <p>목적: ${getGoalText(plan.goal)} | 생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
      </div>
      
      <div class="summary">
        <h3>📊 주간 요약</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          <div><strong>총 운동 시간:</strong> ${plan.weeklyMinutes}분</div>
          <div><strong>총 운동 거리:</strong> ${plan.weeklyDistance}m</div>
          <div><strong>세션 수:</strong> ${plan.sessions.length}회</div>
          <div><strong>목적:</strong> ${getGoalText(plan.goal)}</div>
        </div>
      </div>
      
      <h3>🏊‍♂️ 세션별 상세 계획</h3>
  `;
  
  plan.sessions.forEach((session, index) => {
    html += `
      <div class="session">
        <div class="session-header">
          <h3>세션 ${index + 1}: ${session.name}</h3>
          <p>요일: ${session.day} | 시간: ${session.duration}분 | 총 거리: ${session.totalDistance}m | 세트 수: ${session.sets.length}개</p>
        </div>
        <div class="session-content">
    `;
    
    session.sets.forEach((set, setIndex) => {
      html += `
        <div class="set">
          <div class="set-header">
            <span class="set-name">${setIndex + 1}. ${set.name}</span>
            <span class="set-zone">${set.zone}</span>
          </div>
          <p style="margin-bottom: 15px; color: #666;">${set.description}</p>
          <div class="set-details">
            <div class="set-detail"><strong>랩:</strong> ${set.laps}×25m</div>
            <div class="set-detail"><strong>거리:</strong> ${set.distance}m</div>
            <div class="set-detail"><strong>페이스:</strong> ${set.pace}</div>
            <div class="set-detail"><strong>휴식:</strong> ${set.rest}초</div>
          </div>
      `;
      
      if (includeCoachingCues && set.cues.length > 0) {
        html += `
          <div class="cues">
            <strong>코칭 큐:</strong>
            ${set.cues.map(cue => `<span class="cue-badge">${cue}</span>`).join('')}
          </div>
        `;
      }
      
      if (includeEquipment && set.equipment && set.equipment.length > 0) {
        html += `
          <div class="cues">
            <strong>장비:</strong>
            ${set.equipment.map(equipment => `<span class="cue-badge">${equipment}</span>`).join('')}
          </div>
        `;
      }
      
      html += `</div>`;
    });
    
    if (includeSafetyNotes && session.safetyNotes.length > 0) {
      html += `
        <div class="safety-notes">
          <h4>⚠️ 안전 주의사항</h4>
          <ul>
            ${session.safetyNotes.map(note => `<li>${note}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    html += `</div></div>`;
  });
  
  html += `
      <div class="footer">
        <p>JJ Swim Lab - 기록·건강·기술 체크 기반 수영 프로그램 생성기</p>
        <p>생성일: ${new Date().toLocaleString('ko-KR')}</p>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * 인쇄용 HTML 다운로드
 * @param plan 수영 계획
 * @param options 내보내기 옵션
 */
export function printPlan(plan: Plan, options: ExportOptions): void {
  const html = generatePrintHTML(plan, options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `swim_plan_${plan.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

