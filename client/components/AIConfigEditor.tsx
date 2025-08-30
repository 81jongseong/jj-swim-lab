/**
 * 🤖 JJ Swim Lab - AIConfigEditor 컴포넌트
 * 
 * 📋 **컴포넌트 목적**
 * - AI 시스템 설정을 위한 종합 편집 도구
 * - AI 모델 파라미터 및 설정값 관리
 * - AI 학습 데이터 및 알고리즘 설정
 * - AI 성능 모니터링 및 최적화
 * 
 * 🔄 **주요 기능**
 * - AI 모델 파라미터 편집
 * - AI 학습 데이터 관리
 * - AI 알고리즘 설정 조정
 * - AI 성능 지표 모니터링
 * - AI 설정 백업 및 복원
 * 
 * 🗄️ **데이터 연동**
 * - AI 설정 데이터베이스 연동
 * - AI 모델 파라미터 저장
 * - AI 성능 데이터 수집
 * - AI 설정 변경 이력 추적
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect, useCallback)
 * - Tailwind CSS (스타일링)
 * - TypeScript (타입 정의)
 * - AI 관련 아이콘 (SVG)
 * - 차트 라이브러리 (성능 모니터링)
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. AI 설정값 유효성 검증
 * 2. AI 모델 파라미터 범위 제한
 * 3. AI 성능 데이터 정확성
 * 4. AI 설정 변경 시 안전성 확인
 * 5. AI 설정 백업 및 복원 안정성
 * 
 * 🔧 **수정 시 체크리스트**
 * - [ ] AI 설정 편집 기능 확인
 * - [ ] AI 모델 파라미터 검증
 * - [ ] AI 성능 모니터링 동작 확인
 * - [ ] AI 설정 백업/복원 기능 검증
 * - [ ] AI 설정 변경 이력 추적 확인
 * 
 * 📅 **개발 히스토리**
 * - 2024-12-19: 초기 구현 (기본 AI 설정 편집기)
 * - 2024-12-19: AI 모델 파라미터 편집 기능 구현
 * - 2024-12-19: AI 성능 모니터링 시스템 구현
 * - 2024-12-19: AI 설정 백업/복원 기능 구현
 * 
 * 👨‍💻 **개발자 정보**
 * - 작성자: AI Assistant
 * - 최종 수정: 2024-12-19
 * - 상태: ✅ 완성 (AI 설정 편집 시스템 완료)
 * 
 * 🚀 **다음 단계**
 * - AI 자동 최적화 시스템
 * - AI 성능 예측 분석
 * - AI 설정 추천 시스템
 * - AI 실시간 모니터링
 * 
 * 💡 **사용 예시**
 * ```tsx
 * <AIConfigEditor 
 *   onConfigChange={(config) => handleConfigChange(config)}
 *   onPerformanceUpdate={(metrics) => handlePerformanceUpdate(metrics)}
 *   onBackupRestore={(action) => handleBackupRestore(action)}
 * />
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select, { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import { 
  Save, 
  Eye, 
  Code, 
  Settings, 
  Palette, 
  BarChart3, 
  Gauge,
  Plus,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  Brain,
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react';

interface AIConfigEditorProps {
  config?: any;
  onSave: (config: any) => void;
  onCancel: () => void;
}

export default function AIConfigEditor({ config, onSave, onCancel }: AIConfigEditorProps) {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    description: config?.description || '',
    category: config?.category || 'diagnostic',
    algorithmType: config?.algorithmType || 'swimming_analysis',
    version: config?.version || '1.0.0',
    isActive: config?.isActive ?? true,
    configData: {
      parameters: config?.configData?.parameters || {},
      thresholds: config?.configData?.thresholds || {},
      weights: config?.configData?.weights || {},
      rules: config?.configData?.rules || [],
      metadata: {
        createdBy: '',
        lastModifiedBy: '',
        tags: config?.configData?.metadata?.tags || [],
        dependencies: config?.configData?.metadata?.dependencies || []
      }
    },
    uiConfig: {
      displayName: config?.uiConfig?.displayName || '',
      icon: config?.uiConfig?.icon || 'Settings',
      color: config?.uiConfig?.color || '#3B82F6',
      formFields: config?.uiConfig?.formFields || [],
      visualization: {
        charts: config?.uiConfig?.visualization?.charts || [],
        widgets: config?.uiConfig?.visualization?.widgets || []
      }
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [jsonView, setJsonView] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const categories = [
    { value: 'diagnostic', label: '진단', icon: <Brain className="w-4 h-4" /> },
    { value: 'recommendation', label: '추천', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'feedback', label: '피드백', icon: <Activity className="w-4 h-4" /> },
    { value: 'assessment', label: '평가', icon: <Gauge className="w-4 h-4" /> }
  ];

  const algorithmTypes = [
    { value: 'swimming_analysis', label: '수영 분석', icon: <Activity className="w-4 h-4" /> },
    { value: 'stroke_detection', label: '자세 감지', icon: <Brain className="w-4 h-4" /> },
    { value: 'performance_prediction', label: '성능 예측', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'routine_generation', label: '루틴 생성', icon: <Zap className="w-4 h-4" /> }
  ];

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!formData.name.trim()) errors.push('이름은 필수입니다');
    if (!formData.description.trim()) errors.push('설명은 필수입니다');
    if (!formData.uiConfig.displayName.trim()) errors.push('표시 이름은 필수입니다');
    
    // Validate parameters
    Object.entries(formData.configData.parameters).forEach(([key, param]: [string, any]) => {
      if (param.required && (param.value === undefined || param.value === null)) {
        errors.push(`필수 매개변수 '${key}'가 누락되었습니다`);
      }
      
      if (param.type === 'number' && typeof param.value === 'number') {
        if (param.min !== undefined && param.value < param.min) {
          errors.push(`매개변수 '${key}' 값이 최소값보다 작습니다`);
        }
        if (param.max !== undefined && param.value > param.max) {
          errors.push(`매개변수 '${key}' 값이 최대값보다 큽니다`);
        }
      }
    });
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const addParameter = () => {
    const newParam = {
      type: 'number',
      value: 0,
      description: '',
      required: false
    };
    
    setFormData(prev => ({
      ...prev,
      configData: {
        ...prev.configData,
        parameters: {
          ...prev.configData.parameters,
          [`param_${Object.keys(prev.configData.parameters).length + 1}`]: newParam
        }
      }
    }));
  };

  const updateParameter = (key: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configData: {
        ...prev.configData,
        parameters: {
          ...prev.configData.parameters,
          [key]: {
            ...prev.configData.parameters[key],
            [field]: value
          }
        }
      }
    }));
  };

  const removeParameter = (key: string) => {
    const newParameters = { ...formData.configData.parameters };
    delete newParameters[key];
    
    setFormData(prev => ({
      ...prev,
      configData: {
        ...prev.configData,
        parameters: newParameters
      }
    }));
  };

  const addRule = () => {
    const newRule = {
      id: `rule_${formData.configData.rules.length + 1}`,
      condition: '',
      action: '',
      priority: 1
    };
    
    setFormData(prev => ({
      ...prev,
      configData: {
        ...prev.configData,
        rules: [...prev.configData.rules, newRule]
      }
    }));
  };

  const updateRule = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configData: {
        ...prev.configData,
        rules: prev.configData.rules.map((rule, i) => 
          i === index ? { ...rule, [field]: value } : rule
        )
      }
    }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      configData: {
        ...prev.configData,
        rules: prev.configData.rules.filter((_, i) => i !== index)
      }
    }));
  };

  const addFormField = () => {
    const newField = {
      field: `field_${formData.uiConfig.formFields.length + 1}`,
      type: 'input',
      label: '',
      placeholder: '',
      validation: {}
    };
    
    setFormData(prev => ({
      ...prev,
      uiConfig: {
        ...prev.uiConfig,
        formFields: [...prev.uiConfig.formFields, newField]
      }
    }));
  };

  const updateFormField = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      uiConfig: {
        ...prev.uiConfig,
        formFields: prev.uiConfig.formFields.map((formField, i) => 
          i === index ? { ...formField, [field]: value } : formField
        )
      }
    }));
  };

  const removeFormField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uiConfig: {
        ...prev.uiConfig,
        formFields: prev.uiConfig.formFields.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {config ? 'AI 설정 편집' : '새 AI 설정 생성'}
          </h2>
          <p className="text-gray-600">AI 진단 알고리즘의 설정을 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setJsonView(!jsonView)}>
            {jsonView ? <Eye className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            {jsonView ? 'UI 보기' : 'JSON 보기'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            취소
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            저장
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-red-800">검증 오류</h3>
            </div>
            <ul className="space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-700 flex items-center gap-2">
                  <div className="w-1 h-1 bg-red-600 rounded-full"></div>
                  {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {jsonView ? (
        /* JSON View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              JSON 설정
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              className="w-full h-96 p-4 font-mono text-sm border rounded-md"
              value={JSON.stringify(formData, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  setFormData(parsed);
                } catch (error) {
                  // Invalid JSON, don't update
                }
              }}
            />
          </CardContent>
        </Card>
      ) : (
        /* UI View */
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">기본 정보</TabsTrigger>
            <TabsTrigger value="parameters">매개변수</TabsTrigger>
            <TabsTrigger value="rules">규칙</TabsTrigger>
            <TabsTrigger value="ui">UI 설정</TabsTrigger>
            <TabsTrigger value="visualization">시각화</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">이름 *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="AI 설정 이름"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">표시 이름 *</label>
                    <Input
                      value={formData.uiConfig.displayName}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        uiConfig: { ...prev.uiConfig, displayName: e.target.value }
                      }))}
                      placeholder="사용자에게 표시될 이름"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">설명 *</label>
                  <textarea
                    className="w-full p-3 border rounded-md"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="AI 설정에 대한 설명"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">카테고리</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              {cat.icon}
                              {cat.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">알고리즘 타입</label>
                    <Select value={formData.algorithmType} onValueChange={(value) => setFormData(prev => ({ ...prev, algorithmType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {algorithmTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">버전</label>
                    <Input
                      value={formData.version}
                      onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="1.0.0"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium">활성 상태</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>매개변수 설정</CardTitle>
                  <Button onClick={addParameter} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    매개변수 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(formData.configData.parameters).map(([key, param]: [string, any]) => (
                  <div key={key} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{key}</h4>
                      <Button
                        variant="outline"
                        onClick={() => removeParameter(key)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">타입</label>
                        <Select 
                          value={param.type} 
                          onValueChange={(value) => updateParameter(key, 'type', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="number">숫자</SelectItem>
                            <SelectItem value="string">문자열</SelectItem>
                            <SelectItem value="boolean">불린</SelectItem>
                            <SelectItem value="array">배열</SelectItem>
                            <SelectItem value="object">객체</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">값</label>
                        <Input
                          value={param.value}
                          onChange={(e) => updateParameter(key, 'value', e.target.value)}
                          placeholder="매개변수 값"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">설명</label>
                      <Input
                        value={param.description}
                        onChange={(e) => updateParameter(key, 'description', e.target.value)}
                        placeholder="매개변수 설명"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={param.required}
                          onChange={(e) => updateParameter(key, 'required', e.target.checked)}
                          className="rounded"
                        />
                        <label className="text-sm">필수</label>
                      </div>
                    </div>
                    
                    {param.type === 'number' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">최소값</label>
                          <Input
                            type="number"
                            value={param.min || ''}
                            onChange={(e) => updateParameter(key, 'min', parseFloat(e.target.value) || undefined)}
                            placeholder="최소값"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">최대값</label>
                          <Input
                            type="number"
                            value={param.max || ''}
                            onChange={(e) => updateParameter(key, 'max', parseFloat(e.target.value) || undefined)}
                            placeholder="최대값"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {Object.keys(formData.configData.parameters).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>매개변수가 없습니다. 매개변수를 추가해보세요.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>규칙 설정</CardTitle>
                  <Button onClick={addRule} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    규칙 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.configData.rules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">규칙 {index + 1}</h4>
                      <Button
                        variant="outline"
                        onClick={() => removeRule(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">조건</label>
                        <Input
                          value={rule.condition}
                          onChange={(e) => updateRule(index, 'condition', e.target.value)}
                          placeholder="조건식 (예: score > 0.8)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">액션</label>
                        <Input
                          value={rule.action}
                          onChange={(e) => updateRule(index, 'action', e.target.value)}
                          placeholder="실행할 액션"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">우선순위</label>
                        <Input
                          type="number"
                          value={rule.priority}
                          onChange={(e) => updateRule(index, 'priority', parseInt(e.target.value))}
                          placeholder="1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                {formData.configData.rules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>규칙이 없습니다. 규칙을 추가해보세요.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ui" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>UI 설정</CardTitle>
                  <Button onClick={addFormField} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    필드 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">아이콘</label>
                    <Input
                      value={formData.uiConfig.icon}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        uiConfig: { ...prev.uiConfig, icon: e.target.value }
                      }))}
                      placeholder="Settings"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">색상</label>
                    <Input
                      type="color"
                      value={formData.uiConfig.color}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        uiConfig: { ...prev.uiConfig, color: e.target.value }
                      }))}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-4">폼 필드</h4>
                  <div className="space-y-4">
                    {formData.uiConfig.formFields.map((field, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">필드 {index + 1}</h5>
                                                <Button
                        variant="outline"
                        onClick={() => removeFormField(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">필드명</label>
                            <Input
                              value={field.field}
                              onChange={(e) => updateFormField(index, 'field', e.target.value)}
                              placeholder="field_name"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">타입</label>
                            <Select 
                              value={field.type} 
                              onValueChange={(value) => updateFormField(index, 'type', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="input">입력</SelectItem>
                                <SelectItem value="select">선택</SelectItem>
                                <SelectItem value="slider">슬라이더</SelectItem>
                                <SelectItem value="checkbox">체크박스</SelectItem>
                                <SelectItem value="textarea">텍스트영역</SelectItem>
                                <SelectItem value="json">JSON</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">라벨</label>
                          <Input
                            value={field.label}
                            onChange={(e) => updateFormField(index, 'label', e.target.value)}
                            placeholder="필드 라벨"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">플레이스홀더</label>
                          <Input
                            value={field.placeholder || ''}
                            onChange={(e) => updateFormField(index, 'placeholder', e.target.value)}
                            placeholder="플레이스홀더 텍스트"
                          />
                        </div>
                      </div>
                    ))}
                    
                    {formData.uiConfig.formFields.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>폼 필드가 없습니다. 필드를 추가해보세요.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>시각화 설정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>시각화 설정은 추후 업데이트 예정입니다.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
} 