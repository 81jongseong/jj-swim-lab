'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Upload, 
  Plus, 
  Minus, 
  Camera,
  ShoppingCart,
  Calendar,
  MapPin,
  DollarSign,
  Award,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface EquipmentReviewFormProps {
  onSubmit?: (reviewData: any) => void;
  onCancel?: () => void;
}

export const EquipmentReviewForm: React.FC<EquipmentReviewFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    productName: '',
    brand: '',
    model: '',
    category: '',
    rating: 0,
    usagePeriod: '',
    purchasePrice: '',
    purchaseDate: '',
    purchaseLocation: '',
    detailedRating: {
      durability: 0,
      comfort: 0,
      performance: 0,
      valueForMoney: 0,
      design: 0
    },
    pros: [''],
    cons: [''],
    recommendedFor: [],
    wouldBuyAgain: false,
    recommendToOthers: false,
    comparedProducts: []
  });

  const [images, setImages] = useState<File[]>([]);
  const [currentStep, setCurrentStep] = useState(1);

  const categories = [
    { value: 'swimsuit', label: '수영복', icon: '👙' },
    { value: 'goggles', label: '수경', icon: '🥽' },
    { value: 'cap', label: '수영모', icon: '🧢' },
    { value: 'fins', label: '오리발', icon: '🦆' },
    { value: 'kickboard', label: '킥보드', icon: '🏄‍♂️' },
    { value: 'accessories', label: '액세서리', icon: '⌚' },
    { value: 'other', label: '기타', icon: '📦' }
  ];

  const skillLevels = [
    { value: 'beginner', label: '초급자' },
    { value: 'intermediate', label: '중급자' },
    { value: 'advanced', label: '고급자' },
    { value: 'competitive', label: '선수급' }
  ];

  // 별점 컴포넌트
  const StarRating = ({ 
    rating, 
    onRatingChange, 
    label 
  }: { 
    rating: number; 
    onRatingChange: (rating: number) => void; 
    label: string;
  }) => (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium w-20">{label}:</span>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`p-1 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
      <span className="text-sm text-gray-500">({rating}/5)</span>
    </div>
  );

  // 장단점 입력 컴포넌트
  const ProsConsInput = ({ 
    items, 
    onChange, 
    label, 
    placeholder,
    icon 
  }: { 
    items: string[]; 
    onChange: (items: string[]) => void; 
    label: string;
    placeholder: string;
    icon: React.ReactNode;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
        {icon}
        <span className="ml-2">{label}</span>
      </label>
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const newItems = [...items];
              newItems[index] = e.target.value;
              onChange(newItems);
            }}
            placeholder={placeholder}
            className="flex-1 p-2 border border-gray-300 rounded-lg"
          />
          <button
            type="button"
            onClick={() => {
              const newItems = items.filter((_, i) => i !== index);
              onChange(newItems);
            }}
            className="p-2 text-red-500 hover:text-red-700"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
      >
        <Plus className="h-4 w-4 mr-1" />
        {label} 추가
      </button>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 빈 장단점 제거
    const cleanedData = {
      ...formData,
      pros: formData.pros.filter(p => p.trim()),
      cons: formData.cons.filter(c => c.trim())
    };
    
    onSubmit?.({
      ...cleanedData,
      images
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">제품명 *</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                  placeholder="예: 스피도 엔듀런스+ 수영복"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">브랜드 *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="예: 스피도, 아레나, 티어"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">모델명</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="예: Endurance+ Medalist"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">카테고리 선택</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">후기 제목 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="예: 스피도 엔듀런스+ 6개월 사용 후기"
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">구매 및 사용 정보</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  사용 기간 *
                </label>
                <input
                  type="text"
                  value={formData.usagePeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, usagePeriod: e.target.value }))}
                  placeholder="예: 6개월, 1년, 2년"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  구매 가격
                </label>
                <input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchasePrice: e.target.value }))}
                  placeholder="원"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  구매일
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  구매처
                </label>
                <input
                  type="text"
                  value={formData.purchaseLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseLocation: e.target.value }))}
                  placeholder="예: 온라인몰, 수영용품점"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">상세 평가</h3>
            
            <div className="space-y-4">
              <StarRating
                rating={formData.rating}
                onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                label="종합 평점"
              />
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium">세부 평가</h4>
                {Object.entries({
                  durability: '내구성',
                  comfort: '편안함',
                  performance: '성능',
                  valueForMoney: '가성비',
                  design: '디자인'
                }).map(([key, label]) => (
                  <StarRating
                    key={key}
                    rating={formData.detailedRating[key as keyof typeof formData.detailedRating]}
                    onRatingChange={(rating) => setFormData(prev => ({
                      ...prev,
                      detailedRating: { ...prev.detailedRating, [key]: rating }
                    }))}
                    label={label}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">장단점 및 추천</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <ProsConsInput
                items={formData.pros}
                onChange={(pros) => setFormData(prev => ({ ...prev, pros }))}
                label="장점"
                placeholder="이 제품의 장점을 입력하세요"
                icon={<ThumbsUp className="h-4 w-4 text-green-500" />}
              />
              
              <ProsConsInput
                items={formData.cons}
                onChange={(cons) => setFormData(prev => ({ ...prev, cons }))}
                label="단점"
                placeholder="이 제품의 단점을 입력하세요"
                icon={<ThumbsDown className="h-4 w-4 text-red-500" />}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">추천 대상</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {skillLevels.map(level => (
                  <label key={level.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.recommendedFor.includes(level.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            recommendedFor: [...prev.recommendedFor, level.value]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            recommendedFor: prev.recommendedFor.filter(r => r !== level.value)
                          }));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.wouldBuyAgain}
                  onChange={(e) => setFormData(prev => ({ ...prev, wouldBuyAgain: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">다시 구매하겠습니다</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.recommendToOthers}
                  onChange={(e) => setFormData(prev => ({ ...prev, recommendToOthers: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">다른 사람에게 추천합니다</span>
              </label>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">상세 후기 작성</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">상세 후기 *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="제품을 실제로 사용해본 경험을 자세히 작성해주세요. 다른 수영인들에게 도움이 되는 정보를 포함해주세요."
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">사진 첨부</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  사용 사진을 업로드하세요
                </p>
                <p className="text-sm text-gray-500">
                  제품 사진, 착용 사진, 사용 전후 비교 사진 등
                </p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setImages(prev => [...prev, ...files]);
                  }}
                  className="hidden"
                />
              </div>
              
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`첨부 이미지 ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* 진행 단계 표시 */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">📝 용품 후기 작성</h2>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            단계 {currentStep}/5: {
              currentStep === 1 ? '기본 정보' :
              currentStep === 2 ? '구매 정보' :
              currentStep === 3 ? '평가' :
              currentStep === 4 ? '장단점' : '후기 작성'
            }
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>

          {/* 버튼들 */}
          <div className="flex justify-between mt-8">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  이전 단계
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  다음 단계
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  후기 등록
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentReviewForm;
