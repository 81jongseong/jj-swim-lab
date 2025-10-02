'use client';

import React, { useState } from 'react';

export default function AIEvaluationCriteriaPage() {
  const [criteria, setCriteria] = useState({
    technique: 50,
    endurance: 30,
    speed: 20
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI 평가 기준</h1>
        <p className="text-gray-600">
          AI 기반 수영 기술 평가 기준을 설정합니다.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">평가 기준 설정</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">기술 (Technique)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={criteria.technique}
              onChange={(e) => setCriteria(prev => ({ ...prev, technique: parseInt(e.target.value) }))}
              className="w-full mt-1"
            />
            <div className="text-xs text-gray-500 mt-1">{criteria.technique}%</div>
          </div>
          <div>
            <label className="text-sm font-medium">지구력 (Endurance)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={criteria.endurance}
              onChange={(e) => setCriteria(prev => ({ ...prev, endurance: parseInt(e.target.value) }))}
              className="w-full mt-1"
            />
            <div className="text-xs text-gray-500 mt-1">{criteria.endurance}%</div>
          </div>
          <div>
            <label className="text-sm font-medium">속도 (Speed)</label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={criteria.speed}
              onChange={(e) => setCriteria(prev => ({ ...prev, speed: parseInt(e.target.value) }))}
              className="w-full mt-1"
            />
            <div className="text-xs text-gray-500 mt-1">{criteria.speed}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}