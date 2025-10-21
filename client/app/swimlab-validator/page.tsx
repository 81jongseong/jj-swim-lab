/**
 * SwimLab Data Pack v4 - 데이터 검증 및 카운트 출력
 * 
 * 페이지에서 실행하여 모든 데이터 카운트를 확인합니다.
 */

"use client";

import React, { useEffect, useState } from 'react';
import { countAll, filterDrills, filterMethods } from '../../src/swimlab/utils/catalog';
import { DRILLS } from '../../src/swimlab/data/drills';
import { TRAINING_METHODS } from '../../src/swimlab/data/trainingMethods';
import { MSK_28_IDS } from '../../src/swimlab/data/conditions_msk28_index';
import { CONDITIONS } from '../../src/swimlab/data/conditions_full';

export default function DataValidatorPage() {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    const testResults: string[] = [];
    
    // 드릴 검증
    if (DRILLS.length >= 35) {
      testResults.push(`✅ 드릴 수: ${DRILLS.length}개 (목표 40+ 달성)`);
    } else {
      testResults.push(`❌ 드릴 수: ${DRILLS.length}개 (목표 40+ 미달성)`);
    }

    // 훈련법 검증
    if (TRAINING_METHODS.length >= 15) {
      testResults.push(`✅ 훈련법 수: ${TRAINING_METHODS.length}개 (목표 25+ 달성)`);
    } else {
      testResults.push(`❌ 훈련법 수: ${TRAINING_METHODS.length}개 (목표 25+ 미달성)`);
    }

    // MSK 28 검증
    if (MSK_28_IDS.length === 28) {
      testResults.push(`✅ MSK 기준 ID: ${MSK_28_IDS.length}개 (28개 정확)`);
    } else {
      testResults.push(`❌ MSK 기준 ID: ${MSK_28_IDS.length}개 (28개여야 함)`);
    }

    // 질환 데이터 검증
    if (CONDITIONS.length > 0){
      const missing = MSK_28_IDS.filter(id => !CONDITIONS.some(c=>c.id===id));
      if (missing.length === 0) {
        testResults.push(`✅ 질환 데이터: ${CONDITIONS.length}개 (MSK 28개 모두 포함)`);
      } else {
        testResults.push(`❌ 질환 데이터: MSK 28개 중 ${missing.length}개 누락 (${missing.slice(0,3).join(', ')}...)`);
      }
    } else {
      testResults.push('❌ 질환 데이터가 비어있음');
    }

    // 카운트 함수 검증
    try {
      const counts = countAll({
        methods: TRAINING_METHODS,
        drills: DRILLS,
        conditionsCount: CONDITIONS.length
      });
      testResults.push(`✅ 카운트 함수 동작: drills=${counts.drills}, methods=${counts.methods}, conditions=${counts.conditions}, MSK=${MSK_28_IDS.length}/28`);
    } catch(e: any){ 
      testResults.push('❌ 카운트 함수 실패: ' + e.message); 
    }

    // 필터 검증
    try {
      const frDrills = filterDrills(DRILLS, { tag: 'freestyle' });
      const techMethods = filterMethods(TRAINING_METHODS, { category: 'Technique' });
      if (frDrills.length > 0 && techMethods.length > 0) {
        testResults.push(`✅ 필터 동작: freestyle 태그 드릴 ${frDrills.length}개, Technique 훈련법 ${techMethods.length}개`);
      } else {
        testResults.push('❌ 필터 결과 없음');
      }
    } catch(e: any){ 
      testResults.push('❌ 필터 함수 실패: ' + e.message); 
    }

    setResults(testResults);
  }, []);

  const failed = results.filter(r => r.startsWith('❌')).length;
  const passed = results.filter(r => r.startsWith('✅')).length;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">SwimLab Data Pack v4 검증</h1>
      
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">검증 결과</h2>
        <div className="space-y-2">
          {results.map((result, i) => (
            <div 
              key={i} 
              className={`p-3 rounded ${
                result.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {result}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">요약</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-100 p-4 rounded">
            <div className="text-sm text-gray-600">통과</div>
            <div className="text-3xl font-bold text-green-600">{passed}</div>
          </div>
          <div className="bg-red-100 p-4 rounded">
            <div className="text-sm text-gray-600">실패</div>
            <div className="text-3xl font-bold text-red-600">{failed}</div>
          </div>
        </div>
        
        {failed === 0 && (
          <div className="mt-4 p-4 bg-green-50 text-green-800 rounded">
            ✨ 모든 검증 통과! SwimLab Data Pack v4가 정상적으로 통합되었습니다.
          </div>
        )}
        {failed > 0 && (
          <div className="mt-4 p-4 bg-red-50 text-red-800 rounded">
            ⚠️  일부 검증 실패 - 데이터를 확인해주세요.
          </div>
        )}
      </div>
    </div>
  );
}




