'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, Button, LoadingSpinner } from '@/components/ui';
import { Save, Edit, Eye, Building, Info, FileText, Plus, Trash2 } from 'lucide-react';
import withAuth from '../../../components/withAuth';

interface CenterInfo {
  centerId: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: any;
  facilities: {
    mainPool: {
      lanes: number;
      poolLength: number;
      poolDepth: number;
      temperature: number;
    };
    kidsPool: {
      hasKidsPool: boolean;
      kidsPoolLanes: number;
      kidsPoolLength: number;
      kidsPoolDepth: number;
      kidsPoolTemperature: number;
    };
    endlessPool: {
      hasEndlessPool: boolean;
      endlessPoolCount: number;
      endlessPoolLength: number;
      endlessPoolWidth: number;
    };
    amenities: {
      hasSauna: boolean;
      hasShower: boolean;
      hasLocker: boolean;
      hasJacuzzi: boolean;
      hasSteamRoom: boolean;
      hasFitnessRoom: boolean;
      hasCafeteria: boolean;
      hasParking: boolean;
      parkingSpaces: number;
      additionalFacilities: string;
    };
  };
  introduction: string;
  guide: string;
  updatedAt: Date;
}

function CenterInfoManagement() {
  const { user } = useAuth();
  const [centerInfo, setCenterInfo] = useState<CenterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingInfo, setEditingInfo] = useState<Partial<CenterInfo>>({});


  useEffect(() => {
    if (user) {
    loadCenterInfo();
    }
  }, [user]);

  const loadCenterInfo = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/centers/info', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCenterInfo(data.data);
          setEditingInfo(data.data);
        } else {
          console.error('센터 정보 로드 실패:', data.message);
          // 임시 데이터로 폴백
          loadTempData();
        }
      } else {
        console.error('센터 정보 로드 실패:', response.status);
        // 임시 데이터로 폴백
        loadTempData();
      }
    } catch (error) {
      console.error('센터 정보 로드 실패:', error);
      // 임시 데이터로 폴백
      loadTempData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadTempData = () => {
    const tempInfo: CenterInfo = {
      centerId: 'center001',
      name: 'JJ Swim Lab',
      description: '전문적인 수영 교육을 제공하는 프리미엄 수영장',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'info@jjswimlab.com',
      operatingHours: '평일 06:00-22:00, 주말 08:00-20:00',
      facilities: {
        mainPool: {
          lanes: 8,
          poolLength: 25,
          poolDepth: 1.5,
          temperature: 28
        },
        kidsPool: {
          hasKidsPool: true,
          kidsPoolLanes: 2,
          kidsPoolLength: 10,
          kidsPoolDepth: 0.8,
          kidsPoolTemperature: 32
        },
        endlessPool: {
          hasEndlessPool: true,
          endlessPoolCount: 1,
          endlessPoolLength: 8,
          endlessPoolWidth: 3
        },
        amenities: {
          hasSauna: true,
          hasShower: true,
          hasLocker: true,
          hasJacuzzi: true,
          hasSteamRoom: false,
          hasFitnessRoom: true,
          hasCafeteria: true,
          hasParking: true,
          parkingSpaces: 50,
          additionalFacilities: '카페테리아, 휴게실, 매점, 탈의실, 구명장비, 수질관리시설, CCTV, 출입통제시스템'
        }
      },
      introduction: 'JJ Swim Lab은 체계적이고 과학적인 수영 교육을 통해 모든 연령대의 수영 실력을 향상시키는 것을 목표로 합니다. 경험丰富的한 강사진과 최신 시설을 갖춘 프리미엄 수영 교육 센터입니다.',
      guide: '1. 수강 신청: 온라인 또는 방문 접수\n2. 레벨 테스트: 첫 수업 시 무료 레벨 테스트 진행\n3. 수업 진행: 개인별 맞춤형 커리큘럼으로 진행\n4. 진도 관리: 정기적인 진도 체크 및 피드백 제공\n5. 안전 관리: 모든 수업에서 안전을 최우선으로 합니다.',
      updatedAt: new Date()
    };
    
    setCenterInfo(tempInfo);
    setEditingInfo(tempInfo);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/centers/info', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingInfo)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCenterInfo(prev => prev ? { ...prev, ...editingInfo, updatedAt: new Date() } : null);
          setIsEditing(false);
          alert('센터 정보가 성공적으로 저장되었습니다!');
        } else {
          alert(data.message || '센터 정보 저장에 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || '센터 정보 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('센터 정보 저장 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingInfo(centerInfo || {});
    setIsEditing(false);
  };



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="센터 정보를 불러오는 중..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          🏢 센터 정보 관리
        </h1>
        <p className="text-sm text-gray-600">
          센터 소개글과 이용안내를 작성하고 관리하세요
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 센터 기본 정보 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                센터 기본 정보
              </CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  편집
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel}>
                    취소
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? '저장 중...' : '저장'}
                  </Button>
            </div>
          )}
            </div>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">센터명 *</label>
                  <input
                    type="text"
                    value={editingInfo.name || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">간단 설명</label>
                  <input
                    type="text"
                    value={editingInfo.description || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                  <input
                    type="text"
                    value={editingInfo.address || ''}
                    onChange={(e) => setEditingInfo({...editingInfo, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
        </div>

                <div className="grid grid-cols-2 gap-4">
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
                <input
                  type="text"
                      value={editingInfo.phone || ''}
                      onChange={(e) => setEditingInfo({...editingInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                <input
                      type="email"
                      value={editingInfo.email || ''}
                      onChange={(e) => setEditingInfo({...editingInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">운영시간</label>
              <input
                type="text"
                    value={typeof editingInfo.operatingHours === 'string' ? editingInfo.operatingHours : ''}
                    onChange={(e) => setEditingInfo({...editingInfo, operatingHours: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="예: 평일 06:00-22:00, 주말 08:00-20:00"
              />
            </div>

            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">시설 정보</label>
                  
                  {/* 메인 수영장 */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium text-blue-900 mb-3">🏊‍♂️ 메인 수영장</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">레인 수</label>
                        <input
                          type="number"
                          value={editingInfo.facilities?.mainPool?.lanes || ''}
                          onChange={(e) => setEditingInfo({
                            ...editingInfo,
                            facilities: {
                              ...editingInfo.facilities,
                              mainPool: {
                                ...editingInfo.facilities?.mainPool,
                                lanes: parseInt(e.target.value) || 0
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="8"
              />
            </div>
              <div>
                        <label className="block text-xs text-gray-600 mb-1">수영장 길이 (m)</label>
                <input
                          type="number"
                          value={editingInfo.facilities?.mainPool?.poolLength || ''}
                          onChange={(e) => setEditingInfo({
                            ...editingInfo,
                            facilities: {
                              ...editingInfo.facilities,
                              mainPool: {
                                ...editingInfo.facilities?.mainPool,
                                poolLength: parseInt(e.target.value) || 0
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="25"
                />
              </div>
              <div>
                        <label className="block text-xs text-gray-600 mb-1">수영장 깊이 (m)</label>
                <input
                          type="number"
                          step="0.1"
                          value={editingInfo.facilities?.mainPool?.poolDepth || ''}
                          onChange={(e) => setEditingInfo({
                            ...editingInfo,
                            facilities: {
                              ...editingInfo.facilities,
                              mainPool: {
                                ...editingInfo.facilities?.mainPool,
                                poolDepth: parseFloat(e.target.value) || 0
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="1.5"
                />
              </div>
              <div>
                        <label className="block text-xs text-gray-600 mb-1">수온 (°C)</label>
                <input
                          type="number"
                          value={editingInfo.facilities?.mainPool?.temperature || ''}
                          onChange={(e) => setEditingInfo({
                            ...editingInfo,
                            facilities: {
                              ...editingInfo.facilities,
                              mainPool: {
                                ...editingInfo.facilities?.mainPool,
                                temperature: parseInt(e.target.value) || 0
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="28"
                        />
                      </div>
              </div>
            </div>

                  {/* 유아풀 */}
                  <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-3">
                      <h4 className="font-medium text-green-900 mr-3">👶 유아풀</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingInfo.facilities?.kidsPool?.hasKidsPool || false}
                          onChange={(e) => setEditingInfo({
                            ...editingInfo,
                            facilities: {
                              ...editingInfo.facilities,
                              kidsPool: {
                                ...editingInfo.facilities?.kidsPool,
                                hasKidsPool: e.target.checked
                              }
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm">유아풀 보유</span>
                      </label>
                    </div>
                    {editingInfo.facilities?.kidsPool?.hasKidsPool && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">레인 수</label>
                          <input
                            type="number"
                            value={editingInfo.facilities?.kidsPool?.kidsPoolLanes || ''}
                            onChange={(e) => setEditingInfo({
                              ...editingInfo,
                              facilities: {
                                ...editingInfo.facilities,
                                kidsPool: {
                                  ...editingInfo.facilities?.kidsPool,
                                  kidsPoolLanes: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="2"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">수영장 길이 (m)</label>
                          <input
                            type="number"
                            value={editingInfo.facilities?.kidsPool?.kidsPoolLength || ''}
                            onChange={(e) => setEditingInfo({
                              ...editingInfo,
                              facilities: {
                                ...editingInfo.facilities,
                                kidsPool: {
                                  ...editingInfo.facilities?.kidsPool,
                                  kidsPoolLength: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="10"
                          />
                        </div>
              <div>
                          <label className="block text-xs text-gray-600 mb-1">수영장 깊이 (m)</label>
                <input
                            type="number"
                            step="0.1"
                            value={editingInfo.facilities?.kidsPool?.kidsPoolDepth || ''}
                            onChange={(e) => setEditingInfo({
                              ...editingInfo,
                              facilities: {
                                ...editingInfo.facilities,
                                kidsPool: {
                                  ...editingInfo.facilities?.kidsPool,
                                  kidsPoolDepth: parseFloat(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0.8"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">수온 (°C)</label>
                          <input
                            type="number"
                            value={editingInfo.facilities?.kidsPool?.kidsPoolTemperature || ''}
                            onChange={(e) => setEditingInfo({
                              ...editingInfo,
                              facilities: {
                                ...editingInfo.facilities,
                                kidsPool: {
                                  ...editingInfo.facilities?.kidsPool,
                                  kidsPoolTemperature: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="32"
                          />
                        </div>
                      </div>
                )}
              </div>

                  {/* 엔드리스 풀 */}
                  <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center mb-3">
                      <h4 className="font-medium text-purple-900 mr-3">🌊 엔드리스 풀</h4>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingInfo.facilities?.endlessPool?.hasEndlessPool || false}
                          onChange={(e) => setEditingInfo({
                            ...editingInfo,
                            facilities: {
                              ...editingInfo.facilities,
                              endlessPool: {
                                ...editingInfo.facilities?.endlessPool,
                                hasEndlessPool: e.target.checked
                              }
                            }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm">엔드리스 풀 보유</span>
                      </label>
                    </div>
                    {editingInfo.facilities?.endlessPool?.hasEndlessPool && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">개수</label>
                          <input
                            type="number"
                            value={editingInfo.facilities?.endlessPool?.endlessPoolCount || ''}
                            onChange={(e) => setEditingInfo({
                              ...editingInfo,
                              facilities: {
                                ...editingInfo.facilities,
                                endlessPool: {
                                  ...editingInfo.facilities?.endlessPool,
                                  endlessPoolCount: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="1"
                          />
                        </div>
              <div>
                          <label className="block text-xs text-gray-600 mb-1">길이 (m)</label>
                <input
                            type="number"
                            value={editingInfo.facilities?.endlessPool?.endlessPoolLength || ''}
                            onChange={(e) => setEditingInfo({
                              ...editingInfo,
                              facilities: {
                                ...editingInfo.facilities,
                                endlessPool: {
                                  ...editingInfo.facilities?.endlessPool,
                                  endlessPoolLength: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="8"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">폭 (m)</label>
                          <input
                            type="number"
                            value={editingInfo.facilities?.endlessPool?.endlessPoolWidth || ''}
                            onChange={(e) => setEditingInfo({
                              ...editingInfo,
                              facilities: {
                                ...editingInfo.facilities,
                                endlessPool: {
                                  ...editingInfo.facilities?.endlessPool,
                                  endlessPoolWidth: parseInt(e.target.value) || 0
                                }
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="3"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 부대시설 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">🏢 부대시설</h4>
                    
                    {/* 기본 시설 체크박스 */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">기본 시설</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingInfo.facilities?.amenities?.hasSauna || false}
                              onChange={(e) => setEditingInfo({
                                ...editingInfo,
                                facilities: {
                                  ...editingInfo.facilities,
                                  amenities: {
                                    ...editingInfo.facilities?.amenities,
                                    hasSauna: e.target.checked
                                  }
                                }
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">사우나</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingInfo.facilities?.amenities?.hasShower || false}
                              onChange={(e) => setEditingInfo({
                                ...editingInfo,
                                facilities: {
                                  ...editingInfo.facilities,
                                  amenities: {
                                    ...editingInfo.facilities?.amenities,
                                    hasShower: e.target.checked
                                  }
                                }
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">샤워실</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingInfo.facilities?.amenities?.hasLocker || false}
                              onChange={(e) => setEditingInfo({
                                ...editingInfo,
                                facilities: {
                                  ...editingInfo.facilities,
                                  amenities: {
                                    ...editingInfo.facilities?.amenities,
                                    hasLocker: e.target.checked
                                  }
                                }
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">락커룸</span>
                          </label>
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingInfo.facilities?.amenities?.hasJacuzzi || false}
                              onChange={(e) => setEditingInfo({
                                ...editingInfo,
                                facilities: {
                                  ...editingInfo.facilities,
                                  amenities: {
                                    ...editingInfo.facilities?.amenities,
                                    hasJacuzzi: e.target.checked
                                  }
                                }
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">자쿠지</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingInfo.facilities?.amenities?.hasSteamRoom || false}
                              onChange={(e) => setEditingInfo({
                                ...editingInfo,
                                facilities: {
                                  ...editingInfo.facilities,
                                  amenities: {
                                    ...editingInfo.facilities?.amenities,
                                    hasSteamRoom: e.target.checked
                                  }
                                }
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">스팀룸</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingInfo.facilities?.amenities?.hasFitnessRoom || false}
                              onChange={(e) => setEditingInfo({
                                ...editingInfo,
                                facilities: {
                                  ...editingInfo.facilities,
                                  amenities: {
                                    ...editingInfo.facilities?.amenities,
                                    hasFitnessRoom: e.target.checked
                                  }
                                }
                              })}
                              className="mr-2"
                            />
                            <span className="text-sm">피트니스룸</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* 주차장 정보 */}
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">주차장</h5>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingInfo.facilities?.amenities?.hasParking || false}
                            onChange={(e) => setEditingInfo({
                              ...editingInfo,
                              facilities: {
                                ...editingInfo.facilities,
                                amenities: {
                                  ...editingInfo.facilities?.amenities,
                                  hasParking: e.target.checked
                                }
                              }
                            })}
                            className="mr-2"
                          />
                          <span className="text-sm">주차장 보유</span>
                        </label>
                        {editingInfo.facilities?.amenities?.hasParking && (
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={editingInfo.facilities?.amenities?.parkingSpaces || ''}
                              onChange={(e) => setEditingInfo({
                                ...editingInfo,
                                facilities: {
                                  ...editingInfo.facilities,
                                  amenities: {
                                    ...editingInfo.facilities?.amenities,
                                    parkingSpaces: parseInt(e.target.value) || 0
                                  }
                                }
                              })}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="대수"
                            />
                            <span className="text-sm text-gray-600">대</span>
                  </div>
                )}
              </div>
            </div>

                    {/* 기타 시설 (수기 입력) */}
              <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-2">기타 시설 (자유 입력)</h5>
                <textarea
                        value={editingInfo.facilities?.amenities?.additionalFacilities || ''}
                        onChange={(e) => setEditingInfo({
                          ...editingInfo,
                          facilities: {
                            ...editingInfo.facilities,
                            amenities: {
                              ...editingInfo.facilities?.amenities,
                              additionalFacilities: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                        placeholder="예: 카페테리아, 휴게실, 매점, 탈의실, 구명장비, 수질관리시설, CCTV, 출입통제시스템 등 자유롭게 입력하세요"
                />
              </div>
              </div>
            </div>
          </div>
        ) : (
                <div className="space-y-3">
                  <div>
                  <span className="text-sm font-medium text-gray-500">센터명</span>
                  <p className="text-gray-900">{centerInfo?.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">설명</span>
                  <p className="text-gray-900">{centerInfo?.description}</p>
                  </div>
                  <div>
                  <span className="text-sm font-medium text-gray-500">주소</span>
                  <p className="text-gray-900">{centerInfo?.address}</p>
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">전화번호</span>
                    <p className="text-gray-900">{centerInfo?.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">이메일</span>
                    <p className="text-gray-900">{centerInfo?.email}</p>
                  </div>
                </div>
              <div>
                  <span className="text-sm font-medium text-gray-500">운영시간</span>
                  <div className="text-gray-900">
                    {typeof centerInfo?.operatingHours === 'object' && centerInfo.operatingHours ? (
                      <div className="space-y-1">
                        {Object.entries(centerInfo.operatingHours).map(([day, hours]: [string, any]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize">{day}:</span>
                            <span>{hours?.isOpen ? `${hours.open} - ${hours.close}` : '휴무'}</span>
                  </div>
                        ))}
                  </div>
                    ) : (
                      <p>{centerInfo?.operatingHours || '운영시간 정보 없음'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">시설 정보</span>
                  <div className="mt-2 space-y-3">
                    {centerInfo?.facilities && (
                      <div className="space-y-3">
                        {/* 메인 수영장 */}
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">🏊‍♂️ 메인 수영장</h4>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>레인 수: {centerInfo.facilities.mainPool?.lanes || 0}개</div>
                            <div>수영장 길이: {centerInfo.facilities.mainPool?.poolLength || 0}m</div>
                            <div>수영장 깊이: {centerInfo.facilities.mainPool?.poolDepth || 0}m</div>
                            <div>수온: {centerInfo.facilities.mainPool?.temperature || 0}°C</div>
              </div>
            </div>

                        {/* 유아풀 */}
                        {centerInfo.facilities.kidsPool?.hasKidsPool && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">👶 유아풀</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>레인 수: {centerInfo.facilities.kidsPool.kidsPoolLanes}개</div>
                              <div>수영장 길이: {centerInfo.facilities.kidsPool.kidsPoolLength}m</div>
                              <div>수영장 깊이: {centerInfo.facilities.kidsPool.kidsPoolDepth}m</div>
                              <div>수온: {centerInfo.facilities.kidsPool.kidsPoolTemperature}°C</div>
                            </div>
                    </div>
                  )}

                        {/* 엔드리스 풀 */}
                        {centerInfo.facilities.endlessPool?.hasEndlessPool && (
                          <div className="bg-purple-50 p-3 rounded-lg">
                            <h4 className="font-medium text-purple-900 mb-2">🌊 엔드리스 풀</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>개수: {centerInfo.facilities.endlessPool.endlessPoolCount}개</div>
                              <div>길이: {centerInfo.facilities.endlessPool.endlessPoolLength}m</div>
                              <div>폭: {centerInfo.facilities.endlessPool.endlessPoolWidth}m</div>
                      </div>
                    </div>
                  )}

                        {/* 부대시설 */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">🏢 부대시설</h4>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>사우나: {centerInfo.facilities.amenities?.hasSauna ? '있음' : '없음'}</div>
                              <div>샤워실: {centerInfo.facilities.amenities?.hasShower ? '있음' : '없음'}</div>
                              <div>락커룸: {centerInfo.facilities.amenities?.hasLocker ? '있음' : '없음'}</div>
                              <div>자쿠지: {centerInfo.facilities.amenities?.hasJacuzzi ? '있음' : '없음'}</div>
                              <div>스팀룸: {centerInfo.facilities.amenities?.hasSteamRoom ? '있음' : '없음'}</div>
                              <div>피트니스룸: {centerInfo.facilities.amenities?.hasFitnessRoom ? '있음' : '없음'}</div>
                              <div>주차장: {centerInfo.facilities.amenities?.hasParking ? `${centerInfo.facilities.amenities.parkingSpaces}대` : '없음'}</div>
                            </div>
                            {centerInfo.facilities.amenities?.additionalFacilities && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <h5 className="text-sm font-medium text-gray-700 mb-1">기타 시설</h5>
                                <p className="text-sm text-gray-600 whitespace-pre-line">
                                  {centerInfo.facilities.amenities.additionalFacilities}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 센터 소개글 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              센터 소개글
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소개글</label>
                <textarea
                  value={editingInfo.introduction || ''}
                  onChange={(e) => setEditingInfo({...editingInfo, introduction: e.target.value})}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="센터에 대한 자세한 소개글을 작성해주세요..."
                />
                  </div>
            ) : (
              <div>
                <p className="text-gray-900 whitespace-pre-line">{centerInfo?.introduction}</p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* 이용안내 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              이용안내
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {isEditing ? (
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">이용안내</label>
                <textarea
                  value={editingInfo.guide || ''}
                  onChange={(e) => setEditingInfo({...editingInfo, guide: e.target.value})}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="수강생들이 알아야 할 이용안내를 작성해주세요..."
                />
                  </div>
            ) : (
              <div>
                <p className="text-gray-900 whitespace-pre-line">{centerInfo?.guide}</p>
                </div>
              )}
          </CardContent>
        </Card>
            </div>

      {/* 저장 상태 표시 */}
      {centerInfo && (
        <div className="mt-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-700">
              ✅ 센터 정보가 저장되어 있습니다
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            마지막 업데이트: {centerInfo.updatedAt.toLocaleString()}
          </p>
          </div>
        )}
    </div>
  );
}

export default withAuth(CenterInfoManagement, { 
  requireTypes: ['centerAdmin', 'superAdmin'] 
});











