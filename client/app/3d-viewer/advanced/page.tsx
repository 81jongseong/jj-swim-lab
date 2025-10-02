'use client';

import React, { useState } from 'react';

export default function ThreeDViewerAdvancedPage() {
  const [settings, setSettings] = useState({
    quality: 'high',
    shadows: true,
    antialiasing: true
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">고급 3D 뷰어</h1>
        <p className="text-gray-600">
          고급 설정이 포함된 3D 뷰어입니다.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">고급 설정</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">품질</label>
            <select 
              value={settings.quality}
              onChange={(e) => setSettings(prev => ({ ...prev, quality: e.target.value }))}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
            </select>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.shadows}
                onChange={(e) => setSettings(prev => ({ ...prev, shadows: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">그림자</span>
            </label>
          </div>
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.antialiasing}
                onChange={(e) => setSettings(prev => ({ ...prev, antialiasing: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">안티앨리어싱</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}