'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Save, Upload, MapPin, Phone, Mail, Clock, Users } from 'lucide-react';
import withAuth from '@/components/withAuth';

interface CenterSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: {
    weekdays: string;
    weekends: string;
  };
  facilities: string[];
  maxCapacity: number;
  poolSize: string;
  waterTemperature: number;
  membershipTypes: Array<{
    name: string;
    price: number;
    duration: string;
    features: string[];
  }>;
}

function CenterSettingsManagement() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CenterSettings>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    operatingHours: {
      weekdays: '06:00 - 22:00',
      weekends: '08:00 - 20:00'
    },
    facilities: [],
    maxCapacity: 0,
    poolSize: '',
    waterTemperature: 28,
    membershipTypes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // 임시 데이터
      const tempSettings: CenterSettings = {
        name: 'JJ Swim Lab',
        description: '전문 수영 교육 센터',
        address: '서울시 강남구 테헤란로 123',
        phone: '02-1234-5678',
        email: 'info@jjswimlab.com',
        operatingHours: {
          weekdays: '06:00 - 22:00',
          weekends: '08:00 - 20:00'
        },
        facilities: ['25m 풀', '50m 풀', '사우나', '헬스장', '주차장'],
        maxCapacity: 200,
        poolSize: '25m x 12.5m',
        waterTemperature: 28,
        membershipTypes: [
          {
            name: '기본 멤버십',
            price: 80000,
            duration: '1개월',
            features: ['무제한 수영', '기본 시설 이용']
          },
          {
            name: '프리미엄 멤버십',
            price: 120000,
            duration: '1개월',
            features: ['무제한 수영', '모든 시설 이용', '개인 레슨 1회']
          }
        ]
      };
      setSettings(tempSettings);
    } catch (error) {
      console.error('센터 설정 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // 실제로는 API 호출
      console.log('설정 저장:', settings);
      alert('설정이 저장되었습니다.');
    } catch (error) {
      console.error('설정 저장 실패:', error);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const addFacility = () => {
    const facility = prompt('새 시설을 입력하세요:');
    if (facility) {
      setSettings(prev => ({
        ...prev,
        facilities: [...prev.facilities, facility]
      }));
    }
  };

  const removeFacility = (index: number) => {
    setSettings(prev => ({
      ...prev,
      facilities: prev.facilities.filter((_, i) => i !== index)
    }));
  };

  const addMembershipType = () => {
    setSettings(prev => ({
      ...prev,
      membershipTypes: [...prev.membershipTypes, {
        name: '',
        price: 0,
        duration: '',
        features: []
      }]
    }));
  };

  const removeMembershipType = (index: number) => {
    setSettings(prev => ({
      ...prev,
      membershipTypes: prev.membershipTypes.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">센터 설정을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          센터 설정
        </h1>
        <p className="text-gray-600">센터의 기본 정보와 운영 설정을 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 기본 정보 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            기본 정보
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">센터명</label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
              <div className="flex">
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200">
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 운영 정보 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            운영 정보
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">평일 운영시간</label>
              <input
                type="text"
                value={settings.operatingHours.weekdays}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  operatingHours: { ...prev.operatingHours, weekdays: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">주말 운영시간</label>
              <input
                type="text"
                value={settings.operatingHours.weekends}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  operatingHours: { ...prev.operatingHours, weekends: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">최대 수용 인원</label>
              <input
                type="number"
                value={settings.maxCapacity}
                onChange={(e) => setSettings(prev => ({ ...prev, maxCapacity: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수영장 규격</label>
              <input
                type="text"
                value={settings.poolSize}
                onChange={(e) => setSettings(prev => ({ ...prev, poolSize: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수온 (℃)</label>
              <input
                type="number"
                value={settings.waterTemperature}
                onChange={(e) => setSettings(prev => ({ ...prev, waterTemperature: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 시설 및 멤버십 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* 시설 목록 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">시설 목록</h3>
            <button
              onClick={addFacility}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              시설 추가
            </button>
          </div>
          
          <div className="space-y-2">
            {settings.facilities.map((facility, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-900">{facility}</span>
                <button
                  onClick={() => removeFacility(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 멤버십 타입 */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">멤버십 타입</h3>
            <button
              onClick={addMembershipType}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              멤버십 추가
            </button>
          </div>
          
          <div className="space-y-4">
            {settings.membershipTypes.map((membership, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="멤버십명"
                    value={membership.name}
                    onChange={(e) => {
                      const newTypes = [...settings.membershipTypes];
                      newTypes[index].name = e.target.value;
                      setSettings(prev => ({ ...prev, membershipTypes: newTypes }));
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="number"
                    placeholder="가격"
                    value={membership.price}
                    onChange={(e) => {
                      const newTypes = [...settings.membershipTypes];
                      newTypes[index].price = parseInt(e.target.value);
                      setSettings(prev => ({ ...prev, membershipTypes: newTypes }));
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    placeholder="기간"
                    value={membership.duration}
                    onChange={(e) => {
                      const newTypes = [...settings.membershipTypes];
                      newTypes[index].duration = e.target.value;
                      setSettings(prev => ({ ...prev, membershipTypes: newTypes }));
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded flex-1 mr-2"
                  />
                  <button
                    onClick={() => removeMembershipType(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? '저장 중...' : '설정 저장'}
        </button>
      </div>
    </div>
  );
}

export default withAuth(CenterSettingsManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});