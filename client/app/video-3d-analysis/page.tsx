'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Card, { CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import ThreeJSViewer from '../../components/ThreeJSViewer';
import { 
  Video, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  BarChart3, 
  Target, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star,
  Download,
  Eye,
  Settings,
  Brain,
  Zap,
  Award
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  studentInfo: {
    swimmingLevel: string;
    age: number;
  };
}

interface Video3DAnalysisResult {
  analysisId: string;
  overallScore: number;
  categoryScores: {
    posture: number;
    breathing: number;
    movement: number;
    efficiency: number;
  };
  strengths: string[];
  weaknesses: string[];
  improvementAreas: string[];
  recommendations: {
    exercises: {
      name: string;
      priority: 'high' | 'medium' | 'low';
      reason: string;
      duration: number;
    }[];
    workoutPlan: {
      name: string;
      description: string;
      duration: number;
      frequency: number;
    };
    nextAnalysisDate: string;
  };
  feedback: {
    summary: string;
    detailedFeedback: string;
    encouragement: string;
    goals: string[];
  };
  filePaths: {
    originalFrames: string[];
    depthMaps: string[];
    reconstructed3D: string[];
  };
}

export default function Video3DAnalysisPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [technique, setTechnique] = useState('freestyle');
  const [level, setLevel] = useState('beginner');
  const [analysisResult, setAnalysisResult] = useState<Video3DAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [show3DViewer, setShow3DViewer] = useState(false);
  const [threejsData, setThreejsData] = useState<any>(null);
  const [customModel, setCustomModel] = useState<File | null>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      loadStudents();
    } else {
      // 테스트용 임시 학생 데이터 (로그인하지 않은 경우)
      console.log('🧪 테스트용 학생 데이터 로드');
      setStudents([
        {
          _id: 'test-student-1',
          name: '테스트 학생',
          email: 'test@example.com',
          studentInfo: {
            swimmingLevel: '초급',
            age: 25
          }
        }
      ]);
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      console.log('👥 학생 목록 로드 시작...');
      const token = localStorage.getItem('token');
      console.log('🔑 토큰:', token ? '존재함' : '없음');
      
      const response = await fetch('/api/users?userType=student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📡 응답 상태:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 받은 데이터:', data);
        setStudents(data.users || []);
        console.log('✅ 학생 목록 설정 완료:', data.users?.length || 0, '명');
      } else {
        console.error('❌ 학생 목록 로드 실패:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ 학생 목록 로드 오류:', error);
    }
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('📹 동영상 파일 선택:', file);
    if (file) {
      setSelectedVideo(file);
      setUploadProgress(0);
      console.log('✅ 동영상 파일 설정 완료:', file.name);
    }
  };

  const handleModelSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('🎯 3D 모델 파일 선택:', file);
    if (file) {
      // 지원되는 3D 모델 형식 확인
      const supportedFormats = ['.obj', '.fbx', '.glb', '.gltf', '.blend'];
      const fileExt = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (supportedFormats.includes(fileExt)) {
        setCustomModel(file);
        console.log('✅ 3D 모델 파일 설정 완료:', file.name);
        alert(`3D 모델이 선택되었습니다: ${file.name}`);
      } else {
        alert('지원되지 않는 파일 형식입니다. OBJ, FBX, GLB, GLTF, BLEND 파일을 선택해주세요.');
      }
    }
  };

  const handleAnalysis = async () => {
    if (!selectedStudent || !selectedVideo) {
      alert('학생과 동영상 파일을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', selectedVideo);
      formData.append('studentId', selectedStudent._id);
      formData.append('technique', technique);
      formData.append('level', level);
      
      // 3D 모델이 선택된 경우 추가
      if (customModel) {
        formData.append('customModel', customModel);
        console.log('🎯 사용자 3D 모델 포함:', customModel.name);
      }

      // 업로드 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5분 타임아웃
      
      const response = await fetch('http://localhost:5000/api/video-3d-analysis/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();

      if (data.success) {
        console.log('🔍 분석 결과 데이터:', JSON.stringify(data.data, null, 2));
        setAnalysisResult(data.data);
        setShowResult(true);
        
        // Three.js 데이터 로드
        if (data.data.threejsData) {
          loadThreeJSData(data.data.threejsData);
        }
        
        alert('3D 동영상 분석이 완료되었습니다!');
      } else {
        alert('3D 동영상 분석 중 오류가 발생했습니다: ' + data.message);
      }
    } catch (error) {
      console.error('3D 동영상 분석 오류:', error);
      alert('3D 동영상 분석 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const download3DVideo = async (analysisId: string) => {
    try {
      console.log('🔍 3D 영상 다운로드 시작:', analysisId);
      console.log('🔍 토큰:', localStorage.getItem('token') ? '존재함' : '없음');
      
      const response = await fetch(`http://localhost:5000/api/video-3d-analysis/download/${analysisId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 다운로드 응답 상태:', response.status);
      console.log('🔍 응답 헤더:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 다운로드 실패:', errorText);
        throw new Error(`다운로드 실패: ${response.status} ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('🔍 다운로드된 파일 크기:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `3d_analysis_${analysisId}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ 3D 영상 다운로드 완료');
    } catch (error) {
      console.error('❌ 3D 영상 다운로드 오류:', error);
      alert('3D 영상 다운로드 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const loadThreeJSData = async (threejsDataPath: string) => {
    try {
      console.log('🔍 Three.js 데이터 로드 시작:', threejsDataPath);
      
      const response = await fetch(`http://localhost:5000/api/video-3d-analysis/threejs-data/${threejsDataPath}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setThreejsData(data);
        setShow3DViewer(true);
        console.log('✅ Three.js 데이터 로드 완료');
      } else {
        console.error('❌ Three.js 데이터 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('❌ Three.js 데이터 로드 오류:', error);
    }
  };

  const download3DModel = async (analysisId: string) => {
    try {
      console.log('🔍 3D 모델 다운로드 시작:', analysisId);
      
      const response = await fetch(`http://localhost:5000/api/video-3d-analysis/download-3d-model/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('🔍 3D 모델 다운로드 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ 3D 모델 다운로드 실패:', errorText);
        throw new Error(`3D 모델 다운로드 실패: ${response.status} ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('🔍 다운로드된 3D 모델 파일 크기:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `3d_model_${analysisId}.obj`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ 3D 모델 다운로드 완료');
    } catch (error) {
      console.error('❌ 3D 모델 다운로드 오류:', error);
      alert('3D 모델 다운로드 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Video className="w-8 h-8 text-blue-600" />
          3D 동영상 분석 시스템
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 학생 선택 및 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                분석 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 학생 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  학생 선택
                </label>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="text-gray-500 text-center">등록된 학생이 없습니다.</p>
                  ) : (
                    students.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => {
                          console.log('👤 학생 선택:', student);
                          setSelectedStudent(student);
                        }}
                        className={`p-3 border rounded-lg cursor-pointer transition-all
                          ${selectedStudent?._id === student._id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{student.name}</h3>
                            <p className="text-sm text-gray-500">{student.email}</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {student.studentInfo.swimmingLevel}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 수영 기법 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수영 기법
                </label>
                <select
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="freestyle">자유형</option>
                  <option value="backstroke">배영</option>
                  <option value="breaststroke">평영</option>
                  <option value="butterfly">접영</option>
                </select>
              </div>

              {/* 레벨 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  레벨
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">초급</option>
                  <option value="intermediate">중급</option>
                  <option value="advanced">고급</option>
                  <option value="expert">전문가</option>
                </select>
              </div>

              {/* 동영상 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  동영상 파일
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {selectedVideo ? selectedVideo.name : '동영상 파일을 선택하세요'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4, AVI, MOV, WMV, MKV 형식 지원
                    </p>
                  </label>
                </div>
              </div>

              {/* 3D 모델 업로드 (선택사항) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 사용자 3D 모델 (선택사항)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                      <input
                      type="file"
                      accept=".obj,.fbx,.glb,.gltf,.blend"
                      onChange={handleModelSelect}
                      className="hidden"
                      id="model-upload"
                      ref={modelInputRef}
                    />
                  <label htmlFor="model-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {customModel ? customModel.name : '3D 모델 파일을 선택하세요 (선택사항)'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      OBJ, FBX, GLB, GLTF, BLEND 형식 지원
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      💡 사용자 모델을 제공하면 해당 모델에 수영 동작이 적용됩니다
                    </p>
                  </label>
                </div>
              </div>

              {/* 업로드 진행률 */}
              {loading && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>3D 변환 진행률</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  console.log('🔍 버튼 클릭 - 상태 확인:');
                  console.log('  - loading:', loading);
                  console.log('  - selectedStudent:', selectedStudent);
                  console.log('  - selectedVideo:', selectedVideo);
                  console.log('  - 버튼 활성화:', !loading && selectedStudent && selectedVideo);
                  handleAnalysis();
                }}
                disabled={loading || !selectedStudent || !selectedVideo}
                className="w-full py-3 text-lg"
              >
                {loading ? '3D 분석 중...' : '3D 동영상 분석 시작'}
              </Button>
            </CardContent>
          </Card>

          {/* 분석 결과 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  3D 분석 결과
                </CardTitle>
                {analysisResult && (
                  <>
                    {console.log('🔍 버튼 렌더링 조건 확인:', {
                      analysisResult: !!analysisResult,
                      analysisId: analysisResult?.analysisId,
                      filePaths: analysisResult?.filePaths
                    })}
                    <div className="space-y-2">
                      <button
                        onClick={() => setShow3DViewer(!show3DViewer)}
                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      >
                        🎮 {show3DViewer ? '3D 뷰어 숨기기' : '3D 뷰어 보기'}
                      </button>
                      <button
                        onClick={() => download3DVideo(analysisResult.analysisId)}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        📥 3D 영상 다운로드 (MP4)
                      </button>
                      <button
                        onClick={() => download3DModel(analysisResult.analysisId)}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        🎯 3D 모델 다운로드 (OBJ/BLEND)
                      </button>
                    </div>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!showResult || !analysisResult ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4" />
                  <p>3D 동영상 분석을 시작해보세요.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 전체 점수 */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className={`text-3xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                      {analysisResult.overallScore}점
                    </div>
                    <p className="text-sm text-gray-600">3D 분석 종합 점수</p>
                  </div>

                  {/* 카테고리별 점수 */}
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(analysisResult.categoryScores).map(([category, score]) => (
                      <div key={category} className="text-center p-3 bg-white rounded-lg border">
                        <div className={`text-lg font-semibold ${getScoreColor(score as number)}`}>
                          {score}점
                        </div>
                        <p className="text-xs text-gray-600">
                          {category === 'posture' ? '3D 자세' :
                           category === 'breathing' ? '3D 호흡' :
                           category === 'movement' ? '3D 동작' : '3D 효율성'}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* 강점 */}
                  {analysisResult.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> 3D 분석 강점
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {analysisResult.strengths.map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 약점 */}
                  {analysisResult.weaknesses.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> 3D 분석 약점
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {analysisResult.weaknesses.map((weakness, index) => (
                          <li key={index}>{weakness}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 운동 추천 */}
                  {analysisResult.recommendations.exercises.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
                        <Target className="w-4 h-4" /> 3D 분석 기반 운동 추천
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.recommendations.exercises.map((exercise, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <div>
                              <span className="font-medium">{exercise.name}</span>
                              <p className="text-xs text-gray-600">{exercise.reason}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getPriorityColor(exercise.priority)}>
                                {exercise.priority}
                              </Badge>
                              <span className="text-xs text-gray-500">{exercise.duration}분</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 피드백 */}
                  <div>
                    <h4 className="font-medium text-purple-700 mb-2 flex items-center gap-1">
                      <Star className="w-4 h-4" /> 3D 분석 피드백
                    </h4>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-700 mb-2">{analysisResult.feedback.detailedFeedback}</p>
                      <p className="text-sm text-gray-600">{analysisResult.feedback.encouragement}</p>
                    </div>
                  </div>

                  {/* 파일 다운로드 */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <Download className="w-4 h-4" /> 분석 파일
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        원본 프레임
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        Depth Map
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        3D 모델
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3D 뷰어 */}
          {show3DViewer && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  3D 수영자 모델 뷰어
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                  <ThreeJSViewer 
                    animationData={threejsData}
                    modelPaths={analysisResult?.filePaths?.reconstructed3D}
                    width={800}
                    height={384}
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p>• 마우스로 3D 모델을 회전시켜 다양한 각도에서 관찰할 수 있습니다</p>
                  <p>• 실제 포즈 데이터를 기반으로 생성된 3D 수영자 모델입니다</p>
                  <p>• 수영 동작의 3D 궤적과 자세를 분석할 수 있습니다</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 3D 분석 프로세스 설명 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              3D 동영상 분석 프로세스
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">1</span>
                </div>
                <h3 className="font-medium text-blue-900 mb-2">FFmpeg</h3>
                <p className="text-sm text-blue-700">동영상을 프레임 이미지로 분할</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">2</span>
                </div>
                <h3 className="font-medium text-green-900 mb-2">MiDaS</h3>
                <p className="text-sm text-green-700">각 이미지의 Depth Map 생성</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">3</span>
                </div>
                <h3 className="font-medium text-purple-900 mb-2">Blender</h3>
                <p className="text-sm text-purple-700">프레임 + Depth를 활용한 3D 재구성</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
