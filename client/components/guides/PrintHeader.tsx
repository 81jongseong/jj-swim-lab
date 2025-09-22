'use client';

import { useEffect, useState } from 'react';

interface PrintHeaderProps {
  title: string;
  lastUpdated: string;
}

export default function PrintHeader({ title, lastUpdated }: PrintHeaderProps) {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9
    setCurrentDate(kstDate.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }));
  }, []);

  return (
    <>
      {/* 인쇄용 헤더 */}
      <div className="print-only print-header">
        <div className="print-header-content">
          <h1 className="print-title">{title}</h1>
          <div className="print-meta">
            <span>마지막 업데이트: {lastUpdated}</span>
            <span>인쇄일: {currentDate}</span>
            <span>출처: JJ Swim Lab (https://jjswim.com)</span>
          </div>
        </div>
      </div>

      {/* 인쇄용 푸터 */}
      <div className="print-only print-footer">
        <div className="print-footer-content">
          <div className="print-page-info">
            <span className="print-page-number"></span>
          </div>
          <div className="print-footer-text">
            <span>JJ Swim Lab - 관절질환별 수영 영법 가이드</span>
            <span>https://jjswim.com/guides/swim-joint-guide</span>
          </div>
        </div>
      </div>
    </>
  );
}
