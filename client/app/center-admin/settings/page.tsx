/**
 * ⚙️ JJ Swim Lab - 센터 설정 페이지 (센터 관리자용)
 *
 * 📋 **페이지 목적**
 * - 센터 관리자가 센터의 운영 설정을 관리하는 페이지
 * - 센터별 운영 정책, 예약 설정, 결제 설정 등
 * - 센터 운영에 필요한 각종 설정값 관리
 * 
 * 🔄 **주요 기능**
 * - 예약 설정 (예약 가능 시간, 최대 인원 등)
 * - 결제 설정 (결제 방법, 환불 정책 등)
 * - 알림 설정 (예약 알림, 결제 알림 등)
 * - 센터 운영 정책 설정
 * - 시스템 연동 설정
 * 
 * 🗄️ **데이터 연동**
 * - Center 모델과 연동
 * - 센터 설정 API
 * - 알림 시스템 API
 * 
 * 🛠️ **필요한 설치 파일**
 * - React (useState, useEffect)
 * - useAuth hook
 * - UI 컴포넌트
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 센터 관리자 권한 확인
 * 2. 설정 변경 시 영향도 분석
 * 3. 데이터 검증 및 오류 처리
 * 4. 기존 설정 백업
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 센터 설정 페이지 구현
 * - 2025-01-13: 예약 및 결제 설정 기능 추가
 * - 2025-01-13: 알림 설정 시스템 구현
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import withAuth from '../../../components/withAuth';

// UI 컴포넌트 임포트
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// 아이콘 임포트
import { 
  Settings, 
  Calendar, 
  CreditCard, 
  Bell, 
  Shield, 
  Save,
  Edit,
  Clock,
  Users,
  DollarSign,
  Mail,
  Smartphone
} from 'lucide-react';

// 인터페이스 정의
interface CenterSettings {
  _id?: string;
  centerId: string;
  bookingSettings: {
    advanceBookingDays: number;
    maxBookingPerUser: number;
    cancellationHours: number;
    autoApproval: boolean;
    bookingTimeSlots: string[];
  };
  paymentSettings: {
    acceptedMethods: string[];
    refundPolicy: string;
    latePaymentFee: number;
    autoPayment: boolean;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    bookingReminders: boolean;
    paymentReminders: boolean;
    systemAlerts: boolean;
  };
  operatingPolicy: {
    membershipRequired: boolean;
    ageRestrictions: string;
    dressCode: string;
    safetyRules: string[];
  };
  systemSettings: {
    maintenanceMode: boolean;
    allowGuestBooking: boolean;
    requireApproval: boolean;
    displayCapacity: boolean;
  };
  updatedAt: Date;
}

function CenterSettingsPage() {
  const { user } = useAuth();
  
  // 상태 관리
  const [settings, setSettings] = useState<CenterSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSettings, setEditingSettings] = useState<Partial<CenterSettings>>({});

  // 권한 확인
  useEffect(() => {
    if (user && !['centerAdmin', 'superAdmin'].includes(user.userType)) {
      alert('센터 관리자만 접근할 수 있습니다.');
      window.location.href = '/dashboard';
    }
  }, [user]);

  // 센터 설정 로드
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('인증 토큰이 없습니다.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/center-info/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSettings(data.data);
          setEditingSettings(data.data);
          console.log('✅ 센터 설정 로드 완료:', data.data);
        } else {
          console.error('센터 설정 로드 실패:', data.message);
          loadTempData();
        }
      } else {
        console.error('센터 설정 로드 실패:', response.status);
        loadTempData();
      }
    } catch (error) {
      console.error('센터 설정 로드 오류:', error);
      loadTempData();
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 데이터 로드
  const loadTempData = () => {
    const tempSettings: CenterSettings = {
      centerId: 'jjswim-main',
      bookingSettings: {
        advanceBookingDays: 7,
        maxBookingPerUser: 3,
        cancellationHours: 24,
        autoApproval: true,
        bookingTimeSlots: [
          '09:00-10:00',
          '10:00-11:00',
          '11:00-12:00',
          '14:00-15:00',
          '15:00-16:00',
          '16:00-17:00',
          '18:00-19:00',
          '19:00-20:00',
          '20:00-21:00'
        ]
      },
      paymentSettings: {
        acceptedMethods: ['카드', '계좌이체', '현금'],
        refundPolicy: '이용 24시간 전까지 100% 환불, 이후 50% 환불',
        latePaymentFee: 10000,
        autoPayment: false
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        bookingReminders: true,
        paymentReminders: true,
        systemAlerts: true
      },
      operatingPolicy: {
        membershipRequired: false,
        ageRestrictions: '만 12세 이상',
        dressCode: '수영복 착용 필수, 샤워 후 입장',
        safetyRules: [
          '수영 전 반드시 샤워',
          '수영장 내에서 뛰지 않기',
          '음식물 반입 금지',
          '구급상자 및 구명장비 위치 확인'
        ]
      },
      systemSettings: {
        maintenanceMode: false,
        allowGuestBooking: true,
        requireApproval: false,
        displayCapacity: true
      },
      updatedAt: new Date()
    };

    setSettings(tempSettings);
    setEditingSettings(tempSettings);
  };

  // 초기 로드
  useEffect(() => {
    if (user && ['centerAdmin', 'superAdmin'].includes(user.userType)) {
      loadSettings();
    }
  }, [user]);

  // 설정 저장
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/center-info/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingSettings)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('✅ 센터 설정 저장 완료');
          setIsEditing(false);
          loadSettings();
          alert('센터 설정이 성공적으로 저장되었습니다.');
        } else {
          console.error('센터 설정 저장 실패:', data.message);
          alert('저장 중 오류가 발생했습니다.');
        }
      } else {
        console.error('센터 설정 저장 실패:', response.status);
        alert('저장 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('센터 설정 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">센터 설정을 불러오는 중...</span>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <div className="p-6 text-center">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              센터 설정을 찾을 수 없습니다
            </h3>
            <p className="text-gray-500 mb-4">
              새로운 센터 설정을 생성하시겠습니까?
            </p>
            <Button onClick={loadSettings} className="bg-blue-600 hover:bg-blue-700">
              다시 시도
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ⚙️ 센터 설정
            </h1>
            <p className="text-gray-600">
              센터 운영에 필요한 각종 설정을 관리하세요
            </p>
          </div>
          <div className="flex space-x-3">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                편집하기
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingSettings(settings);
                  }}
                  variant="outline"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      저장
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 설정 카드들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 예약 설정 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                예약 설정
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  예약 가능 일수 (일전)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={editingSettings.bookingSettings?.advanceBookingDays || 7}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      bookingSettings: {
                        ...editingSettings.bookingSettings,
                        advanceBookingDays: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {settings.bookingSettings.advanceBookingDays}일 전
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자당 최대 예약 수
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingSettings.bookingSettings?.maxBookingPerUser || 3}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      bookingSettings: {
                        ...editingSettings.bookingSettings,
                        maxBookingPerUser: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {settings.bookingSettings.maxBookingPerUser}개
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  취소 가능 시간 (시간전)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={editingSettings.bookingSettings?.cancellationHours || 24}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      bookingSettings: {
                        ...editingSettings.bookingSettings,
                        cancellationHours: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {settings.bookingSettings.cancellationHours}시간 전
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editingSettings.bookingSettings?.autoApproval || false}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        bookingSettings: {
                          ...editingSettings.bookingSettings,
                          autoApproval: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={settings.bookingSettings.autoApproval}
                      disabled
                      className="rounded border-gray-300 text-blue-600"
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-700">자동 승인</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* 결제 설정 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                결제 설정
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  허용 결제 방법
                </label>
                {isEditing ? (
                  <div className="space-y-2">
                    {['카드', '계좌이체', '현금', '모바일페이'].map((method) => (
                      <label key={method} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingSettings.paymentSettings?.acceptedMethods?.includes(method) || false}
                          onChange={(e) => {
                            const methods = editingSettings.paymentSettings?.acceptedMethods || [];
                            const newMethods = e.target.checked
                              ? [...methods, method]
                              : methods.filter(m => m !== method);
                            setEditingSettings({
                              ...editingSettings,
                              paymentSettings: {
                                ...editingSettings.paymentSettings,
                                acceptedMethods: newMethods
                              }
                            });
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.paymentSettings.acceptedMethods.map((method) => (
                      <span
                        key={method}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  환불 정책
                </label>
                {isEditing ? (
                  <textarea
                    value={editingSettings.paymentSettings?.refundPolicy || ''}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      paymentSettings: {
                        ...editingSettings.paymentSettings,
                        refundPolicy: e.target.value
                      }
                    })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md text-sm">
                    {settings.paymentSettings.refundPolicy}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연체 수수료 (원)
                </label>
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    value={editingSettings.paymentSettings?.latePaymentFee || 0}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      paymentSettings: {
                        ...editingSettings.paymentSettings,
                        latePaymentFee: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {settings.paymentSettings.latePaymentFee.toLocaleString()}원
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 알림 설정 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 mr-2 text-yellow-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                알림 설정
              </h2>
            </div>
            
            <div className="space-y-3">
              {[
                { key: 'emailNotifications', label: '이메일 알림', icon: Mail },
                { key: 'smsNotifications', label: 'SMS 알림', icon: Smartphone },
                { key: 'bookingReminders', label: '예약 알림', icon: Calendar },
                { key: 'paymentReminders', label: '결제 알림', icon: DollarSign },
                { key: 'systemAlerts', label: '시스템 알림', icon: Shield }
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <label className="flex items-center">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editingSettings.notificationSettings?.[key as keyof typeof editingSettings.notificationSettings] as boolean || false}
                        onChange={(e) => setEditingSettings({
                          ...editingSettings,
                          notificationSettings: {
                            ...editingSettings.notificationSettings,
                            [key]: e.target.checked
                          }
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={settings.notificationSettings[key as keyof typeof settings.notificationSettings] as boolean}
                        disabled
                        className="rounded border-gray-300 text-blue-600"
                      />
                    )}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 시스템 설정 */}
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 mr-2 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                시스템 설정
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editingSettings.systemSettings?.maintenanceMode || false}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        systemSettings: {
                          ...editingSettings.systemSettings,
                          maintenanceMode: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={settings.systemSettings.maintenanceMode}
                      disabled
                      className="rounded border-gray-300 text-blue-600"
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-700">점검 모드</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editingSettings.systemSettings?.allowGuestBooking || false}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        systemSettings: {
                          ...editingSettings.systemSettings,
                          allowGuestBooking: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={settings.systemSettings.allowGuestBooking}
                      disabled
                      className="rounded border-gray-300 text-blue-600"
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-700">비회원 예약 허용</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editingSettings.systemSettings?.requireApproval || false}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        systemSettings: {
                          ...editingSettings.systemSettings,
                          requireApproval: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={settings.systemSettings.requireApproval}
                      disabled
                      className="rounded border-gray-300 text-blue-600"
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-700">예약 승인 필요</span>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editingSettings.systemSettings?.displayCapacity || false}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        systemSettings: {
                          ...editingSettings.systemSettings,
                          displayCapacity: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={settings.systemSettings.displayCapacity}
                      disabled
                      className="rounded border-gray-300 text-blue-600"
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-700">수용 인원 표시</span>
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 운영 정책 */}
      <div className="mt-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 mr-2 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                운영 정책
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회원권 필요 여부
                </label>
                {isEditing ? (
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingSettings.operatingPolicy?.membershipRequired || false}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        operatingPolicy: {
                          ...editingSettings.operatingPolicy,
                          membershipRequired: e.target.checked
                        }
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">회원권 필요</span>
                  </label>
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {settings.operatingPolicy.membershipRequired ? '필요' : '불필요'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연령 제한
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editingSettings.operatingPolicy?.ageRestrictions || ''}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      operatingPolicy: {
                        ...editingSettings.operatingPolicy,
                        ageRestrictions: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="만 12세 이상"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {settings.operatingPolicy.ageRestrictions}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  복장 규정
                </label>
                {isEditing ? (
                  <textarea
                    value={editingSettings.operatingPolicy?.dressCode || ''}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      operatingPolicy: {
                        ...editingSettings.operatingPolicy,
                        dressCode: e.target.value
                      }
                    })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                    {settings.operatingPolicy.dressCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default withAuth(CenterSettingsPage, { requireTypes: ['centerAdmin', 'superAdmin'] });
