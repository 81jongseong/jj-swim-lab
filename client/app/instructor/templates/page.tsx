'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner } from '@/components/ui';
import { Plus, Search, Edit, Trash2, Copy, Eye, Tag, User, Building } from 'lucide-react';
import withAuth from '../../../components/withAuth';

interface ChecklistTemplate {
  _id: string;
  name: string;
  description: string;
  creatorType: 'center' | 'instructor';
  isPublic: boolean;
  isActive: boolean;
  tags: string[];
  levels: string[];
  items: ChecklistTemplateItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChecklistTemplateItem {
  stepName: string;
  stepOrder: number;
  category: string;
  difficulty: string;
  tips: string;
  isRequired: boolean;
}

function ChecklistTemplateManagement() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/checklist/templates', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTemplates(data.data || []);
        } else {
          console.error('템플릿 목록 로드 실패:', data.message);
        }
      } else {
        console.error('템플릿 목록 로드 실패:', response.status);
        // 임시 데이터로 폴백
        loadTempData();
      }
    } catch (error) {
      console.error('템플릿 목록 로드 실패:', error);
      // 임시 데이터로 폴백
      loadTempData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadTempData = () => {
    const tempTemplates: ChecklistTemplate[] = [
      {
        _id: '1',
        name: '초급 수영 기초 과정',
        description: '수영을 처음 시작하는 초보자를 위한 기본 과정',
        creatorType: 'center',
        isPublic: true,
        isActive: true,
        tags: ['초급자', '기초', '안전'],
        levels: ['초급'],
        items: [
          {
            stepName: '물에 익숙해지기',
            stepOrder: 1,
            category: '기초',
            difficulty: '초급',
            tips: '물에 대한 두려움을 없애는 것이 중요합니다',
            isRequired: true
          },
          {
            stepName: '기본 호흡법',
            stepOrder: 2,
            category: '기초',
            difficulty: '초급',
            tips: '코로 들이마시고 입으로 내쉬는 연습',
            isRequired: true
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-08-31')
      },
      {
        _id: '2',
        name: '자유형 중급 과정',
        description: '자유형을 더욱 정교하게 배우는 중급 과정',
        creatorType: 'instructor',
        isPublic: false,
        isActive: true,
        tags: ['자유형', '중급', '기술'],
        levels: ['중급'],
        items: [
          {
            stepName: '스트로크 개선',
            stepOrder: 1,
            category: '기술',
            difficulty: '중급',
            tips: '팔의 각도와 물잡이를 정확히 연습',
            isRequired: true
          }
        ],
        createdAt: new Date('2024-02-20'),
        updatedAt: new Date('2024-08-31')
      }
    ];
    
    setTemplates(tempTemplates);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = filterLevel === 'all' || template.levels.includes(filterLevel);
    
    return matchesSearch && matchesLevel;
  });

  const handleCreateTemplate = async (templateData: any) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/checklist/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('템플릿이 성공적으로 생성되었습니다.');
          setShowCreateModal(false);
          await loadTemplates();
        } else {
          setMessage(data.message || '템플릿 생성에 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || '템플릿 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('템플릿 생성 실패:', error);
      setMessage('네트워크 오류가 발생했습니다.');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`http://localhost:5000/api/checklist/templates/${templateId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setMessage('템플릿이 삭제되었습니다.');
          await loadTemplates();
        } else {
          const errorData = await response.json();
          setMessage(errorData.message || '템플릿 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error('템플릿 삭제 실패:', error);
        setMessage('네트워크 오류가 발생했습니다.');
      }
    }
  };

  const handleCopyTemplate = async (template: ChecklistTemplate) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const copyData = {
        name: `${template.name} (복사본)`,
        description: template.description,
        levels: template.levels,
        items: template.items,
        tags: template.tags,
        isPublic: false
      };

      const response = await fetch('http://localhost:5000/api/checklist/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(copyData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessage('템플릿이 성공적으로 복사되었습니다.');
          await loadTemplates();
        } else {
          setMessage(data.message || '템플릿 복사에 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || '템플릿 복사에 실패했습니다.');
      }
    } catch (error) {
      console.error('템플릿 복사 실패:', error);
      setMessage('네트워크 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="템플릿 목록을 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          📋 체크리스트 템플릿 관리
        </h1>
        <p className="text-sm text-gray-600">
          체크리스트 템플릿을 생성하고 관리하여 효율적인 수업을 진행하세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="템플릿명, 설명, 태그로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 레벨</option>
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
                <option value="마스터">마스터</option>
              </select>
              
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                템플릿 생성
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 템플릿 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template._id} className={`${!template.isActive ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    {template.isPublic ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        공개
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                        비공개
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {template.creatorType === 'center' ? (
                      <Building className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span>{template.creatorType === 'center' ? '센터' : '강사'} 템플릿</span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTemplate(template)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    title="편집"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyTemplate(template)}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                    title="복사"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template._id)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">레벨</p>
                <div className="flex flex-wrap gap-1">
                  {template.levels.map((level, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {level}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">태그</p>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{template.items.length}개 항목</span>
                <span>{template.updatedAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 템플릿이 없을 때 */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || filterLevel !== 'all' ? '검색 결과가 없습니다' : '등록된 템플릿이 없습니다'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterLevel !== 'all' 
                ? '검색어나 필터를 변경해보세요' 
                : '첫 번째 템플릿을 생성해보세요'
              }
            </p>
            {!searchTerm && filterLevel === 'all' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                템플릿 생성하기
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* 메시지 표시 */}
      {message && (
        <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50">
          {message}
          <button 
            onClick={() => setMessage('')}
            className="ml-2 text-blue-500 hover:text-blue-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* 템플릿 생성 모달 */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTemplate}
        />
      )}

      {/* 템플릿 편집 모달 */}
      {editingTemplate && (
        <EditTemplateModal
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onUpdate={loadTemplates}
        />
      )}
    </div>
  );
}

// 템플릿 생성 모달 컴포넌트
function CreateTemplateModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    levels: [] as string[],
    tags: [] as string[],
    isPublic: false,
    items: [] as ChecklistTemplateItem[]
  });
  const [newItem, setNewItem] = useState({
    stepName: '',
    category: '',
    difficulty: '초급',
    tips: '',
    isRequired: true
  });
  const [newTag, setNewTag] = useState('');
  const [newLevel, setNewLevel] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.description && formData.items.length > 0) {
      onCreate(formData);
    } else {
      alert('필수 필드를 모두 입력해주세요.');
    }
  };

  const addItem = () => {
    if (newItem.stepName && newItem.category) {
      const item: ChecklistTemplateItem = {
        ...newItem,
        stepOrder: formData.items.length + 1
      };
      setFormData({
        ...formData,
        items: [...formData.items, item]
      });
      setNewItem({
        stepName: '',
        category: '',
        difficulty: '초급',
        tips: '',
        isRequired: true
      });
    }
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const addLevel = () => {
    if (newLevel && !formData.levels.includes(newLevel)) {
      setFormData({
        ...formData,
        levels: [...formData.levels, newLevel]
      });
      setNewLevel('');
    }
  };

  const removeLevel = (level: string) => {
    setFormData({
      ...formData,
      levels: formData.levels.filter(l => l !== level)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">새 템플릿 생성</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">템플릿명 *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">공개 여부</label>
              <select
                value={formData.isPublic ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, isPublic: e.target.value === 'true'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="false">비공개</option>
                <option value="true">공개</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">설명 *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 레벨 관리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">적용 레벨</label>
            <div className="flex gap-2 mb-2">
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">레벨 선택</option>
                <option value="초급">초급</option>
                <option value="중급">중급</option>
                <option value="고급">고급</option>
                <option value="마스터">마스터</option>
              </select>
              <Button type="button" onClick={addLevel} size="sm">
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.levels.map((level, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full flex items-center gap-1"
                >
                  {level}
                  <button
                    type="button"
                    onClick={() => removeLevel(level)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 태그 관리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="태그 입력 후 엔터"
              />
              <Button type="button" onClick={addTag} size="sm">
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 체크리스트 항목 관리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">체크리스트 항목 *</label>
            
            {/* 새 항목 추가 */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3">새 항목 추가</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">항목명 *</label>
                  <input
                    type="text"
                    value={newItem.stepName}
                    onChange={(e) => setNewItem({...newItem, stepName: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">카테고리 *</label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">난이도</label>
                  <select
                    value={newItem.difficulty}
                    onChange={(e) => setNewItem({...newItem, difficulty: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="초급">초급</option>
                    <option value="중급">중급</option>
                    <option value="고급">고급</option>
                    <option value="마스터">마스터</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">필수 여부</label>
                  <select
                    value={newItem.isRequired ? 'true' : 'false'}
                    onChange={(e) => setNewItem({...newItem, isRequired: e.target.value === 'true'})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="true">필수</option>
                    <option value="false">선택</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">팁</label>
                  <input
                    type="text"
                    value={newItem.tips}
                    onChange={(e) => setNewItem({...newItem, tips: e.target.value})}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="학습 팁이나 주의사항"
                  />
                </div>
              </div>
              <Button type="button" onClick={addItem} size="sm" className="mt-3">
                항목 추가
              </Button>
            </div>

            {/* 추가된 항목 목록 */}
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.stepName}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {item.difficulty}
                      </span>
                      {item.isRequired && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                          필수
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {item.category} {item.tips && `• ${item.tips}`}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 템플릿 편집 모달 컴포넌트 (간단 버전)
function EditTemplateModal({ template, onClose, onUpdate }: { 
  template: ChecklistTemplate; 
  onClose: () => void; 
  onUpdate: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <h3 className="text-lg font-semibold mb-4">템플릿 상세보기</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">{template.name}</h4>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">체크리스트 항목 ({template.items.length}개)</h5>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {template.items.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.stepName}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {item.difficulty}
                    </span>
                    {item.isRequired && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        필수
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.category} {item.tips && `• ${item.tips}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ChecklistTemplateManagement, { 
  requireTypes: ['instructor', 'centerAdmin', 'superAdmin'] 
});

