'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Target, 
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle
} from 'lucide-react';
// OCR 관련 함수는 동적 import로 로드 (서버 사이드 렌더링 방지)

export default function MeasurementsPage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    date: new Date().toISOString().split('T')[0],
    isPublic: true // 기본값: 공개
  });

  // 공개 설정 상태 (각 항목별)
  const [privacySettings, setPrivacySettings] = useState<Record<string, boolean>>({
    height: true,
    weight: true,
    bmi: true,
    waist_circumference: false,
    heart_rate: false,
    max_heart_rate: false,
    blood_pressure_systolic: false,
    blood_pressure_diastolic: false,
    beta_blocker: false,
    muscle_mass: true,
    body_fat: false,
    lung_capacity: false,
    bone_density: false,
    cholesterol_total: false,
    cholesterol_ldl: false,
    cholesterol_hdl: false,
    cholesterol_triglycerides: false,
    blood_sugar_fasting: false,
    blood_sugar_postprandial: false,
    blood_sugar_hba1c: false,
    egfr: false,
    swim_level: true,
    css_freestyle: true,
    css_backstroke: true,
    css_breaststroke: true,
    css_butterfly: true,
    vo2max: false,
    sessions_per_week: true,
    session_duration: true,
    pool_length: true,
    exercise_goals: true,
    adherence_rate: true
  });

  // OCR 관련 상태
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleAddMeasurement = async () => {
    if (!newMeasurement.value) return;

    try {
      const response = await fetch('/api/health/measurements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newMeasurement.type,
          value: parseFloat(newMeasurement.value),
          date: newMeasurement.date,
          isPublic: newMeasurement.isPublic
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('측정 데이터가 추가되었습니다.');
        
        // 폼 초기화
        setNewMeasurement({
          type: 'heart_rate',
          value: '',
          date: new Date().toISOString().split('T')[0],
          isPublic: privacySettings['heart_rate'] || true
        });
        
        // 데이터 새로고침 (TODO: 실제로는 상태 업데이트)
      } else {
        alert('측정 데이터 추가에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('측정 데이터 추가 실패:', error);
      alert('측정 데이터 추가 중 오류가 발생했습니다.');
    }
  };

  const handleSavePrivacySettings = async () => {
    try {
      const response = await fetch('/api/health/measurements/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ privacySettings }),
      });

      const data = await response.json();
      if (data.success) {
        alert('공개 설정이 저장되었습니다.');
      } else {
        alert('공개 설정 저장에 실패했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('공개 설정 저장 실패:', error);
      alert('공개 설정 저장 중 오류가 발생했습니다.');
    }
  };

  // 파일 업로드 처리
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 형식 확인
    const isPdf = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');
    
    if (!isPdf && !isImage) {
      setOcrError('PDF 또는 이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploadedFile(file);
    setOcrError(null);
    setExtractedData(null);
    setIsProcessing(true);

    try {
      // OCR 처리 (동적 import로 클라이언트 사이드에서만 실행)
      const [{ extractTextFromFile }, { extractHealthDataFromText }] = await Promise.all([
        import('@/lib/ocr/ocrProcessor'),
        import('@/lib/ocr/healthDataExtractor')
      ]);
      
      const text = await extractTextFromFile(file);
      console.log('추출된 텍스트:', text);

      // 건강 정보 추출
      const healthData = extractHealthDataFromText(text);
      console.log('추출된 건강 정보:', healthData);
      
      setExtractedData(healthData);

      // 추출된 데이터를 폼에 자동 입력 (우선순위: 체중 > 심박수 > 혈압)
      const measurementDate = healthData.date || new Date().toISOString().split('T')[0];
      
      if (healthData.weight) {
        setNewMeasurement({
          type: 'weight',
          value: healthData.weight.toString(),
          date: measurementDate
        });
      } else if (healthData.heartRate) {
        setNewMeasurement({
          type: 'heart_rate',
          value: healthData.heartRate.toString(),
          date: measurementDate
        });
      } else if (healthData.bloodPressure?.systolic) {
        setNewMeasurement({
          type: 'blood_pressure_systolic',
          value: healthData.bloodPressure.systolic.toString(),
          date: measurementDate
        });
      }
    } catch (error: any) {
      console.error('OCR 처리 실패:', error);
      setOcrError(error.message || '파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setExtractedData(null);
    setOcrError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 추출된 모든 데이터를 자동으로 추가
  const handleAddAllExtractedData = async (data: any) => {
    const measurementDate = data.date || new Date().toISOString().split('T')[0];
    const measurementsToAdd: Array<{ type: string; value: number; date: string }> = [];

    // 혈압
    if (data.bloodPressure?.systolic) {
      measurementsToAdd.push({
        type: 'blood_pressure_systolic',
        value: data.bloodPressure.systolic,
        date: measurementDate
      });
    }
    if (data.bloodPressure?.diastolic) {
      measurementsToAdd.push({
        type: 'blood_pressure_diastolic',
        value: data.bloodPressure.diastolic,
        date: measurementDate
      });
    }

    // 체중
    if (data.weight) {
      measurementsToAdd.push({
        type: 'weight',
        value: data.weight,
        date: measurementDate
      });
    }

    // 심박수
    if (data.heartRate) {
      measurementsToAdd.push({
        type: 'heart_rate',
        value: data.heartRate,
        date: measurementDate
      });
    }

    // 근육량
    if (data.muscleMass) {
      measurementsToAdd.push({
        type: 'muscle_mass',
        value: data.muscleMass,
        date: measurementDate
      });
    }

    // 체지방률
    if (data.bodyFatPercentage) {
      measurementsToAdd.push({
        type: 'body_fat',
        value: data.bodyFatPercentage,
        date: measurementDate
      });
    }

    // 콜레스테롤
    if (data.cholesterol?.total) {
      measurementsToAdd.push({
        type: 'cholesterol_total',
        value: data.cholesterol.total,
        date: measurementDate
      });
    }
    if (data.cholesterol?.ldl) {
      measurementsToAdd.push({
        type: 'cholesterol_ldl',
        value: data.cholesterol.ldl,
        date: measurementDate
      });
    }
    if (data.cholesterol?.hdl) {
      measurementsToAdd.push({
        type: 'cholesterol_hdl',
        value: data.cholesterol.hdl,
        date: measurementDate
      });
    }
    if (data.cholesterol?.triglycerides) {
      measurementsToAdd.push({
        type: 'cholesterol_triglycerides',
        value: data.cholesterol.triglycerides,
        date: measurementDate
      });
    }

    // 혈당
    if (data.bloodSugar?.fasting) {
      measurementsToAdd.push({
        type: 'blood_sugar_fasting',
        value: data.bloodSugar.fasting,
        date: measurementDate
      });
    }
    if (data.bloodSugar?.postprandial) {
      measurementsToAdd.push({
        type: 'blood_sugar_postprandial',
        value: data.bloodSugar.postprandial,
        date: measurementDate
      });
    }
    if (data.bloodSugar?.hba1c) {
      measurementsToAdd.push({
        type: 'blood_sugar_hba1c',
        value: data.bloodSugar.hba1c,
        date: measurementDate
      });
    }

    // BMI
    if (data.bmi) {
      measurementsToAdd.push({
        type: 'bmi',
        value: data.bmi,
        date: measurementDate
      });
    }

    // 키
    if (data.height) {
      measurementsToAdd.push({
        type: 'height',
        value: data.height,
        date: measurementDate
      });
    }

    // 모든 측정값을 상태에 추가
    if (measurementsToAdd.length === 0) {
      alert('추가할 측정 데이터가 없습니다.');
      return;
    }

    try {
      // 상태 업데이트 (실제로는 API 호출)
      const updatedMeasurements = { ...measurements };
      
      measurementsToAdd.forEach(measurement => {
        const date = measurement.date;
        
        switch (measurement.type) {
          case 'heart_rate':
            updatedMeasurements.heartRate = [
              { date, value: measurement.value, type: 'resting', status: 'normal' },
              ...updatedMeasurements.heartRate
            ];
            break;
          case 'weight':
            updatedMeasurements.weight = [
              { date, value: measurement.value, status: 'stable' },
              ...updatedMeasurements.weight
            ];
            break;
          case 'blood_pressure_systolic':
            // 수축기와 이완기를 함께 처리
            const diastolic = measurementsToAdd.find(m => m.type === 'blood_pressure_diastolic')?.value || 80;
            updatedMeasurements.bloodPressure = [
              { date, systolic: measurement.value, diastolic, status: 'normal' },
              ...updatedMeasurements.bloodPressure
            ];
            break;
        }
      });
      
      setMeasurements(updatedMeasurements);
      
      alert(`${measurementsToAdd.length}개의 측정 데이터가 추가되었습니다!`);
      
      // 파일 초기화
      handleRemoveFile();
    } catch (error) {
      console.error('측정값 추가 실패:', error);
      alert('측정값 추가 중 오류가 발생했습니다.');
    }
  };

  // 서버 사이드 렌더링 방지
  if (!isMounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">건강 측정 데이터</h1>
        <p className="text-gray-600">건강 지표를 측정하고 기록하여 운동 효과를 추적하세요.</p>
      </div>

      {/* 파일 업로드로 자동 입력 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow p-6 mb-8 border-2 border-blue-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-900">
            <Upload className="h-5 w-5" />
            PDF/이미지로 자동 입력
          </h3>
          <p className="text-sm text-gray-600">건강검진 결과지나 측정기 사진을 업로드하면 자동으로 정보를 인식합니다</p>
        </div>
        
        <div className="space-y-4">
          {!uploadedFile ? (
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.gif"
                onChange={handleFileUpload}
                className="hidden"
                id="health-file-upload"
              />
              <label
                htmlFor="health-file-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">파일을 선택하거나 드래그하여 업로드</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG 파일 지원</p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  파일 선택
                </button>
              </label>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              
              {isProcessing && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">텍스트 추출 중...</span>
                </div>
              )}

              {ocrError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{ocrError}</p>
                </div>
              )}

              {extractedData && !isProcessing && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-green-600 mb-3">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">건강 정보가 인식되었습니다!</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {extractedData.bloodPressure && (
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-xs text-gray-600">혈압</p>
                        <p className="font-medium">{extractedData.bloodPressure.systolic}/{extractedData.bloodPressure.diastolic}</p>
                      </div>
                    )}
                    {extractedData.weight && (
                      <div className="p-2 bg-green-50 rounded">
                        <p className="text-xs text-gray-600">체중</p>
                        <p className="font-medium">{extractedData.weight}kg</p>
                      </div>
                    )}
                    {extractedData.heartRate && (
                      <div className="p-2 bg-red-50 rounded">
                        <p className="text-xs text-gray-600">심박수</p>
                        <p className="font-medium">{extractedData.heartRate}bpm</p>
                      </div>
                    )}
                    {extractedData.muscleMass && (
                      <div className="p-2 bg-purple-50 rounded">
                        <p className="text-xs text-gray-600">근육량</p>
                        <p className="font-medium">{extractedData.muscleMass}kg</p>
                      </div>
                    )}
                    {extractedData.bodyFatPercentage && (
                      <div className="p-2 bg-yellow-50 rounded">
                        <p className="text-xs text-gray-600">체지방률</p>
                        <p className="font-medium">{extractedData.bodyFatPercentage}%</p>
                      </div>
                    )}
                    {extractedData.cholesterol?.total && (
                      <div className="p-2 bg-orange-50 rounded">
                        <p className="text-xs text-gray-600">총 콜레스테롤</p>
                        <p className="font-medium">{extractedData.cholesterol.total}mg/dL</p>
                      </div>
                    )}
                    {extractedData.bloodSugar?.fasting && (
                      <div className="p-2 bg-pink-50 rounded">
                        <p className="text-xs text-gray-600">공복 혈당</p>
                        <p className="font-medium">{extractedData.bloodSugar.fasting}mg/dL</p>
                      </div>
                    )}
                    {extractedData.bmi && (
                      <div className="p-2 bg-indigo-50 rounded">
                        <p className="text-xs text-gray-600">BMI</p>
                        <p className="font-medium">{extractedData.bmi}</p>
                      </div>
                    )}
                  </div>
                  
                  {extractedData.date && (
                    <p className="text-xs text-gray-500 mt-2">측정일: {extractedData.date}</p>
                  )}
                  
                  <button
                    onClick={() => handleAddAllExtractedData(extractedData)}
                    className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    모든 데이터 자동 추가
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
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
              <optgroup label="기본 신체 정보">
                <option value="height">키 (cm)</option>
                <option value="weight">체중 (kg)</option>
                <option value="bmi">BMI</option>
                <option value="waist_circumference">허리둘레 (cm)</option>
              </optgroup>
              <optgroup label="생체 신호">
                <option value="heart_rate">심박수 (bpm)</option>
                <option value="max_heart_rate">최대 심박수 (bpm)</option>
                <option value="blood_pressure_systolic">수축기 혈압 (mmHg)</option>
                <option value="blood_pressure_diastolic">이완기 혈압 (mmHg)</option>
                <option value="beta_blocker">베타차단제 복용 여부</option>
              </optgroup>
              <optgroup label="체성분">
                <option value="muscle_mass">근육량 (kg)</option>
                <option value="body_fat">체지방률 (%)</option>
                <option value="lung_capacity">폐활량 (L)</option>
                <option value="bone_density">골밀도 (g/cm²)</option>
              </optgroup>
              <optgroup label="콜레스테롤">
                <option value="cholesterol_total">총 콜레스테롤 (mg/dL)</option>
                <option value="cholesterol_ldl">LDL 콜레스테롤 (mg/dL)</option>
                <option value="cholesterol_hdl">HDL 콜레스테롤 (mg/dL)</option>
                <option value="cholesterol_triglycerides">중성지방 (mg/dL)</option>
              </optgroup>
              <optgroup label="혈당">
                <option value="blood_sugar_fasting">공복 혈당 (mg/dL)</option>
                <option value="blood_sugar_postprandial">식후 혈당 (mg/dL)</option>
                <option value="blood_sugar_hba1c">당화혈색소 (%)</option>
              </optgroup>
              <optgroup label="신장 기능">
                <option value="egfr">신사구체여과율 (eGFR, mL/min/1.73m²)</option>
              </optgroup>
              <optgroup label="수영 프로필">
                <option value="swim_level">수영 레벨</option>
                <option value="css_freestyle">자유형 CSS (초/100m)</option>
                <option value="css_backstroke">배영 CSS (초/100m)</option>
                <option value="css_breaststroke">평영 CSS (초/100m)</option>
                <option value="css_butterfly">접영 CSS (초/100m)</option>
                <option value="vo2max">VO2max (mL/kg/min)</option>
                <option value="sessions_per_week">주당 세션 수</option>
                <option value="session_duration">세션 시간 (분)</option>
                <option value="pool_length">풀 길이 (m)</option>
              </optgroup>
              <optgroup label="운동 목표 및 순응도">
                <option value="exercise_goals">운동 목표</option>
                <option value="adherence_rate">운동 순응도 (%)</option>
              </optgroup>
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
        
        {/* 공개 설정 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">이 측정값 공개 설정</label>
              <p className="text-xs text-gray-500 mt-1">
                비공개로 설정해도 센터/최고관리자의 통계에는 포함되지만, 개별 정보는 볼 수 없습니다
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={newMeasurement.isPublic}
                onChange={(e) => setNewMeasurement(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {newMeasurement.isPublic ? '공개' : '비공개'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* 개인정보 공개 설정 관리 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            개인정보 공개 설정
          </h3>
          <p className="text-sm text-gray-600">
            각 건강 정보 항목의 공개 여부를 설정할 수 있습니다. 비공개로 설정해도 통계에는 포함되지만, 
            센터 관리자나 강사는 개별 정보를 볼 수 없습니다.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(privacySettings).map(([key, value]) => {
            const labels: Record<string, string> = {
              height: '키',
              weight: '체중',
              bmi: 'BMI',
              waist_circumference: '허리둘레',
              heart_rate: '심박수',
              max_heart_rate: '최대 심박수',
              blood_pressure_systolic: '수축기 혈압',
              blood_pressure_diastolic: '이완기 혈압',
              beta_blocker: '베타차단제 복용',
              muscle_mass: '근육량',
              body_fat: '체지방률',
              lung_capacity: '폐활량',
              bone_density: '골밀도',
              cholesterol_total: '총 콜레스테롤',
              cholesterol_ldl: 'LDL 콜레스테롤',
              cholesterol_hdl: 'HDL 콜레스테롤',
              cholesterol_triglycerides: '중성지방',
              blood_sugar_fasting: '공복 혈당',
              blood_sugar_postprandial: '식후 혈당',
              blood_sugar_hba1c: '당화혈색소',
              egfr: '신사구체여과율',
              swim_level: '수영 레벨',
              css_freestyle: '자유형 CSS',
              css_backstroke: '배영 CSS',
              css_breaststroke: '평영 CSS',
              css_butterfly: '접영 CSS',
              vo2max: 'VO2max',
              sessions_per_week: '주당 세션 수',
              session_duration: '세션 시간',
              pool_length: '풀 길이',
              exercise_goals: '운동 목표',
              adherence_rate: '운동 순응도'
            };
            
            return (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{labels[key] || key}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPrivacySettings(prev => ({ ...prev, [key]: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleSavePrivacySettings}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
          >
            공개 설정 저장
          </button>
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