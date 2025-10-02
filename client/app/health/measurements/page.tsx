'use client';

import { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Target, 
  Plus,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState({
    heartRate: [
      { date: '2024-01-15', value: 75, type: 'resting', status: 'normal' },
      { date: '2024-01-14', value: 78, type: 'resting', status: 'normal' },
      { date: '2024-01-13', value: 72, type: 'resting', status: 'normal' }
    ],
    weight: [
      { date: '2024-01-15', value: 70.0, status: 'stable' },
      { date: '2024-01-14', value: 70.2, status: 'stable' },
      { date: '2024-01-13', value: 70.1, status: 'stable' }
    ],
    bloodPressure: [
      { date: '2024-01-15', systolic: 120, diastolic: 80, status: 'normal' },
      { date: '2024-01-14', systolic: 125, diastolic: 82, status: 'normal' },
      { date: '2024-01-13', systolic: 118, diastolic: 78, status: 'normal' }
    ]
  });

  const [newMeasurement, setNewMeasurement] = useState({
    type: 'heart_rate',
    value: '',
    date: new Date().toISOString().split('T')[0]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'stable': return 'bg-green-100 text-green-800';
      case 'increasing': return 'bg-red-100 text-red-800';
      case 'decreasing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'increasing': return <TrendingUp className="h-3 w-3" />;
      case 'decreasing': return <TrendingDown className="h-3 w-3" />;
      case 'stable': return <Minus className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleAddMeasurement = () => {
    if (!newMeasurement.value) return;

    const measurement = {
      date: newMeasurement.date,
      value: parseFloat(newMeasurement.value),
      type: newMeasurement.type,
      status: 'normal'
    };

    // 실제로는 API 호출
    console.log('새 측정값 추가:', measurement);
    
    // 폼 초기화
    setNewMeasurement({
      type: 'heart_rate',
      value: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">건강 측정 데이터</h1>
        <p className="text-gray-600">건강 지표를 측정하고 기록하여 운동 효과를 추적하세요.</p>
      </div>

      {/* 측정 데이터 입력 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            새로운 측정 데이터 입력
          </h3>
          <p className="text-sm text-gray-600">건강 지표를 측정하고 기록하세요</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="measurement-type" className="text-sm font-medium">측정 항목</label>
            <select 
              id="measurement-type"
              value={newMeasurement.type} 
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, type: e.target.value }))}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="heart_rate">심박수 (bpm)</option>
              <option value="weight">체중 (kg)</option>
              <option value="blood_pressure_systolic">수축기 혈압 (mmHg)</option>
              <option value="blood_pressure_diastolic">이완기 혈압 (mmHg)</option>
            </select>
          </div>
          <div>
            <label htmlFor="measurement-value" className="text-sm font-medium">측정값</label>
            <input
              id="measurement-value"
              type="number"
              value={newMeasurement.value}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, value: e.target.value }))}
              placeholder="측정값 입력"
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="measurement-date" className="text-sm font-medium">측정 일시</label>
            <input
              id="measurement-date"
              type="date"
              value={newMeasurement.date}
              onChange={(e) => setNewMeasurement(prev => ({ ...prev, date: e.target.value }))}
              className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleAddMeasurement} 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              추가
            </button>
          </div>
        </div>
      </div>

      {/* 측정 데이터 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">현재 심박수</h3>
            <Heart className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold">{measurements.heartRate[0]?.value} bpm</div>
          <p className="text-xs text-gray-500">안정시 심박수</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">현재 체중</h3>
            <Activity className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">{measurements.weight[0]?.value} kg</div>
          <p className="text-xs text-gray-500">현재 체중</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium">현재 혈압</h3>
            <Target className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">
            {measurements.bloodPressure[0]?.systolic}/{measurements.bloodPressure[0]?.diastolic}
          </div>
          <p className="text-xs text-gray-500">mmHg</p>
        </div>
      </div>

      {/* 측정 데이터 상세 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 심박수 기록 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              심박수 측정 기록
            </h3>
            <p className="text-sm text-gray-600">안정시 심박수 기록</p>
          </div>
          <div className="space-y-3">
            {measurements.heartRate.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{record.value} bpm</div>
                  <div className="text-sm text-gray-600">{record.date}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${getStatusColor(record.status)}`}>
                  {getStatusIcon(record.status)}
                  정상
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 체중 기록 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              체중 측정 기록
            </h3>
            <p className="text-sm text-gray-600">체중 변화 추적</p>
          </div>
          <div className="space-y-3">
            {measurements.weight.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{record.value} kg</div>
                  <div className="text-sm text-gray-600">{record.date}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${getStatusColor(record.status)}`}>
                  {getStatusIcon(record.status)}
                  안정
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 혈압 기록 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              혈압 측정 기록
            </h3>
            <p className="text-sm text-gray-600">혈압 변화 추적</p>
          </div>
          <div className="space-y-3">
            {measurements.bloodPressure.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{record.systolic}/{record.diastolic}</div>
                  <div className="text-sm text-gray-600">{record.date}</div>
                </div>
                <span className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${getStatusColor(record.status)}`}>
                  {getStatusIcon(record.status)}
                  정상
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 건강 팁 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <div className="flex items-start gap-3">
          <Heart className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>측정 팁:</strong> 심박수는 아침에 일어나자마자 측정하고, 혈압은 안정된 상태에서 측정하세요. 
              체중은 매일 같은 시간에 측정하는 것이 좋습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}