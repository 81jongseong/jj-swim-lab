'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/utils/api';

interface CenterInfoEditorProps {
  centerInfo: any;
  onSave: (updatedInfo: any) => void;
  onCancel: () => void;
}

export default function CenterInfoEditor({ centerInfo, onSave, onCancel }: CenterInfoEditorProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    if (centerInfo) {
      setFormData(centerInfo);
    }
  }, [centerInfo]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const handleAddArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleObjectArrayChange = (field: string, index: number, subField: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => 
        i === index ? { ...item, [subField]: value } : item
      )
    }));
  };

  const handleAddObjectArrayItem = (field: string, template: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], template]
    }));
  };

  const handleRemoveObjectArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let updatedInfo = { ...formData };

      // 메인 이미지 업로드
      if (mainImageFile) {
        const formData = new FormData();
        formData.append('mainImage', mainImageFile);
        const response = await apiClient.uploadCenterMainImage(centerInfo.centerId, formData);
        if (response.success) {
          updatedInfo.images = {
            ...updatedInfo.images,
            mainImage: response.data.mainImage
          };
        }
      }

      // 갤러리 이미지 업로드
      if (galleryFiles.length > 0) {
        const formData = new FormData();
        galleryFiles.forEach(file => {
          formData.append('gallery', file);
        });
        const response = await apiClient.uploadCenterGalleryImages(centerInfo.centerId, formData);
        if (response.success) {
          updatedInfo.images = {
            ...updatedInfo.images,
            gallery: [...(updatedInfo.images.gallery || []), ...response.data.gallery]
          };
        }
      }

      // 센터 정보 업데이트
      const response = await apiClient.updateCenterInfo(centerInfo.centerId, updatedInfo);
      
      if (response.success) {
        alert('센터 정보가 성공적으로 업데이트되었습니다!');
        onSave(response.data);
      } else {
        alert(`센터 정보 업데이트에 실패했습니다: ${response.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('센터 정보 업데이트 실패:', error);
      alert(`센터 정보 업데이트 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!centerInfo) {
    return <div>센터 정보를 불러올 수 없습니다.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">센터 정보 편집</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              센터 ID
            </label>
            <input
              type="text"
              value={formData.centerId || ''}
              onChange={(e) => handleInputChange('centerId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              센터명
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            간단 설명
          </label>
          <input
            type="text"
            value={formData.shortDescription || ''}
            onChange={(e) => handleInputChange('shortDescription', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상세 설명
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 연락처 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* 운영시간 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">🕒 운영시간</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                월-금
              </label>
              <input
                type="text"
                value={formData.businessHours?.monday || ''}
                onChange={(e) => handleObjectArrayChange('businessHours', 0, 'monday', e.target.value)}
                placeholder="09:00-18:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                토요일
              </label>
              <input
                type="text"
                value={formData.businessHours?.saturday || ''}
                onChange={(e) => handleObjectArrayChange('businessHours', 1, 'saturday', e.target.value)}
                placeholder="09:00-17:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                일요일
              </label>
              <input
                type="text"
                value={formData.businessHours?.sunday || ''}
                onChange={(e) => handleObjectArrayChange('businessHours', 2, 'sunday', e.target.value)}
                placeholder="휴무"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 시설 정보 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">✨ 주요 시설</h3>
          <div className="space-y-3">
            {formData.facilities?.map((facility: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={facility}
                  onChange={(e) => handleArrayChange('facilities', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="시설명"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveArrayItem('facilities', index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddArrayItem('facilities')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              + 시설 추가
            </button>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">📸 이미지 관리</h3>
          
          {/* 메인 이미지 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메인 이미지
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMainImageFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 갤러리 이미지 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              갤러리 이미지
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setGalleryFiles(Array.from(e.target.files || []))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              여러 이미지를 선택할 수 있습니다
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '저장 중...' : '저장'}
          </button>
        </div>
      </form>
    </div>
  );
}


