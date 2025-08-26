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





































