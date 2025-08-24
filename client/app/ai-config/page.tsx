'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { Input } from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Settings, 
  Activity, 
  TrendingUp, 
  Brain,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AIConfig {
  _id: string;
  name: string;
  description: string;
  category: 'diagnostic' | 'recommendation' | 'feedback' | 'assessment';
  algorithmType: 'swimming_analysis' | 'stroke_detection' | 'performance_prediction' | 'routine_generation';
  version: string;
  isActive: boolean;
  configData: {
    parameters: Record<string, any>;
    thresholds: Record<string, number>;
    weights: Record<string, number>;
    rules: Array<{
      id: string;
      condition: string;
      action: string;
      priority: number;
    }>;
    metadata: {
      createdBy: string;
      lastModifiedBy: string;
      tags: string[];
      dependencies: string[];
    };
  };
  uiConfig: {
    displayName: string;
    icon: string;
    color: string;
    formFields: Array<{
      field: string;
      type: string;
      label: string;
      placeholder?: string;
      validation?: any;
      options?: Array<{
        label: string;
        value: any;
      }>;
    }>;
    visualization: {
      charts: Array<{
        type: string;
        title: string;
        dataSource: string;
        config: any;
      }>;
      widgets: Array<{
        type: string;
        title: string;
        dataSource: string;
        config: any;
      }>;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function AIConfigPage() {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAlgorithmType, setSelectedAlgorithmType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchAIConfigs();
  }, []);

  const fetchAIConfigs = async () => {
    try {
      const response = await fetch('/api/ai-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfigs(data.data || []);
      } else {
        console.error('Failed to fetch AI configurations');
      }
    } catch (error) {
      console.error('Error fetching AI configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (configId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/ai-config/${configId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Update local state
        setConfigs(prev => prev.map(config => 
          config._id === configId 
            ? { ...config, isActive: !currentStatus }
            : config
        ));
      }
    } catch (error) {
      console.error('Error toggling AI configuration:', error);
    }
  };

  const handleExport = async (configId: string) => {
    try {
      const response = await fetch(`/api/ai-config/${configId}/export`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-config-${configId}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting AI configuration:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'diagnostic': return 'bg-blue-100 text-blue-800';
      case 'recommendation': return 'bg-green-100 text-green-800';
      case 'feedback': return 'bg-yellow-100 text-yellow-800';
      case 'assessment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlgorithmTypeIcon = (type: string) => {
    switch (type) {
      case 'swimming_analysis': return <Activity className="w-4 h-4" />;
      case 'stroke_detection': return <Brain className="w-4 h-4" />;
      case 'performance_prediction': return <TrendingUp className="w-4 h-4" />;
      case 'routine_generation': return <Settings className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const filteredConfigs = configs.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || config.category === selectedCategory;
    const matchesAlgorithmType = selectedAlgorithmType === 'all' || config.algorithmType === selectedAlgorithmType;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'active' && config.isActive) ||
                      (activeTab === 'inactive' && !config.isActive);

    return matchesSearch && matchesCategory && matchesAlgorithmType && matchesTab;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI 진단 알고리즘 설정</h1>
        <p className="text-gray-600">수영 교육을 위한 AI 진단 알고리즘을 관리하고 설정합니다.</p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="AI 설정 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 카테고리</SelectItem>
              <SelectItem value="diagnostic">진단</SelectItem>
              <SelectItem value="recommendation">추천</SelectItem>
              <SelectItem value="feedback">피드백</SelectItem>
              <SelectItem value="assessment">평가</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedAlgorithmType} onValueChange={setSelectedAlgorithmType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="알고리즘 타입" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 타입</SelectItem>
              <SelectItem value="swimming_analysis">수영 분석</SelectItem>
              <SelectItem value="stroke_detection">자세 감지</SelectItem>
              <SelectItem value="performance_prediction">성능 예측</SelectItem>
              <SelectItem value="routine_generation">루틴 생성</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">전체 ({configs.length})</TabsTrigger>
          <TabsTrigger value="active">활성 ({configs.filter(c => c.isActive).length})</TabsTrigger>
          <TabsTrigger value="inactive">비활성 ({configs.filter(c => !c.isActive).length})</TabsTrigger>
          <TabsTrigger value="templates">템플릿</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          새 AI 설정 생성
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          설정 가져오기
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          전체 내보내기
        </Button>
      </div>

      {/* AI Configurations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConfigs.map((config) => (
          <Card key={config._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getAlgorithmTypeIcon(config.algorithmType)}
                  <div>
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    <p className="text-sm text-gray-600">{config.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={config.isActive ? "default" : "secondary"}>
                    {config.isActive ? "활성" : "비활성"}
                  </Badge>
                  <Badge variant="outline" className={getCategoryColor(config.category)}>
                    {config.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>버전: {config.version}</span>
                <span>알고리즘: {config.algorithmType}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">태그:</span>
                <div className="flex flex-wrap gap-1">
                  {config.configData.metadata.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {config.configData.metadata.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{config.configData.metadata.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={config.isActive ? "outline" : "default"}
                    onClick={() => handleToggleActive(config._id, config.isActive)}
                  >
                    {config.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {config.isActive ? "비활성화" : "활성화"}
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleExport(config._id)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConfigs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Settings className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI 설정이 없습니다</h3>
          <p className="text-gray-600 mb-4">새로운 AI 진단 알고리즘 설정을 생성해보세요.</p>
          <Button className="flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            첫 번째 AI 설정 생성
          </Button>
        </div>
      )}
    </div>
  );
} 