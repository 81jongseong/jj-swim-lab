'use client';

import { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Select, { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'course' | 'booking' | 'payment' | 'system';
  category: 'general' | 'course' | 'booking' | 'payment' | 'membership' | 'ai_analysis' | 'system';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: {
    general: boolean;
    course: boolean;
    booking: boolean;
    payment: boolean;
    membership: boolean;
    ai_analysis: boolean;
    system: boolean;
  };
}

function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    categories: {
      general: true,
      course: true,
      booking: true,
      payment: true,
      membership: true,
      ai_analysis: true,
      system: true
    }
  });
  
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    category: 'general' as const,
    priority: 'medium' as const,
    targetUsers: [] as string[]
  });

  const currentUser = apiClient.getCurrentUser();
  const isAdmin = currentUser?.userType === 'superAdmin' || currentUser?.userType === 'centerAdmin';

  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<{
        success: boolean;
        data?: { notifications?: any[]; unreadCount?: number };
        error?: string;
      }>('/notifications');
      if ((res as any).data?.notifications) {
        setNotifications((res as any).data.notifications);
        setUnreadCount((res as any).data.unreadCount || 0);
      }
    } catch (error) {
      console.error('알림 로드 실패:', error);
    }
    setLoading(false);
  };

  const loadSettings = async () => {
    try {
      const res = await apiClient.get<{
        success: boolean;
        data?: { settings?: any };
        error?: string;
      }>('/notifications/settings');
      if ((res as any).data?.settings) {
        setSettings((res as any).data.settings);
      }
    } catch (error) {
      console.error('설정 로드 실패:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      await loadNotifications();
    } catch (error) {
      console.error('읽음 처리 실패:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      await loadNotifications();
    } catch (error) {
      console.error('전체 읽음 처리 실패:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!confirm('이 알림을 삭제하시겠습니까?')) return;
    
    try {
      await apiClient.delete(`/notifications/${id}`);
      await loadNotifications();
    } catch (error) {
      console.error('알림 삭제 실패:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      await apiClient.put('/notifications/settings', updatedSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('설정 업데이트 실패:', error);
    }
  };

  const sendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/notifications/broadcast', broadcastForm);
      setShowBroadcast(false);
      setBroadcastForm({
        title: '', message: '', type: 'info', category: 'general', priority: 'medium', targetUsers: []
      });
      alert('브로드캐스트 알림이 발송되었습니다.');
    } catch (error) {
      alert('브로드캐스트 발송에 실패했습니다.');
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'success': return '성공';
      case 'warning': return '경고';
      case 'error': return '오류';
      case 'info': return '정보';
      case 'course': return '강습';
      case 'booking': return '예약';
      case 'payment': return '결제';
      case 'system': return '시스템';
      default: return type;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'general': return '일반';
      case 'course': return '강습';
      case 'booking': return '예약';
      case 'payment': return '결제';
      case 'membership': return '멤버십';
      case 'ai_analysis': return 'AI 분석';
      case 'system': return '시스템';
      default: return category;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.category === activeTab;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">알림 관리</h1>
        <p className="text-gray-600 mt-2">알림을 확인하고 설정을 관리합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 알림 목록 */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold">알림 목록</h2>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount}개 읽지 않음
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  모두 읽음 처리
                </Button>
              )}
              {isAdmin && (
                <Button onClick={() => setShowBroadcast(true)}>
                  브로드캐스트
                </Button>
              )}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="unread">읽지 않음</TabsTrigger>
              <TabsTrigger value="course">강습</TabsTrigger>
              <TabsTrigger value="system">시스템</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center text-gray-500">
                    알림이 없습니다.
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card key={notification._id} className={`${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-blue-600' : ''}`}>
                              {notification.title}
                            </h3>
                            <Badge className={getTypeColor(notification.type)}>
                              {getTypeText(notification.type)}
                            </Badge>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{getCategoryText(notification.category)}</span>
                            <span>{new Date(notification.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {!notification.isRead && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => markAsRead(notification._id)}
                            >
                              읽음
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => deleteNotification(notification._id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 알림 설정 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>알림 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">알림 방법</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.email}
                      onChange={(e) => updateSettings({ email: e.target.checked })}
                      className="mr-2"
                    />
                    이메일
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.push}
                      onChange={(e) => updateSettings({ push: e.target.checked })}
                      className="mr-2"
                    />
                    푸시 알림
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.sms}
                      onChange={(e) => updateSettings({ sms: e.target.checked })}
                      className="mr-2"
                    />
                    SMS
                  </label>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">알림 카테고리</h4>
                <div className="space-y-2">
                  {Object.entries(settings.categories).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updateSettings({
                          categories: {
                            ...settings.categories,
                            [key]: e.target.checked
                          }
                        })}
                        className="mr-2"
                      />
                      {getCategoryText(key)}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 브로드캐스트 모달 */}
      {showBroadcast && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">브로드캐스트 알림 발송</h3>
            <form onSubmit={sendBroadcast} className="space-y-4">
              <Input
                placeholder="제목"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({...broadcastForm, title: e.target.value})}
                required
              />
              <Input
                placeholder="메시지"
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({...broadcastForm, message: e.target.value})}
                required
              />
              <Select value={broadcastForm.type} onValueChange={(value) => setBroadcastForm({...broadcastForm, type: value as any})}>
                <SelectTrigger>
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">정보</SelectItem>
                  <SelectItem value="success">성공</SelectItem>
                  <SelectItem value="warning">경고</SelectItem>
                  <SelectItem value="error">오류</SelectItem>
                </SelectContent>
              </Select>
              <Select value={broadcastForm.category} onValueChange={(value) => setBroadcastForm({...broadcastForm, category: value as any})}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">일반</SelectItem>
                  <SelectItem value="course">강습</SelectItem>
                  <SelectItem value="system">시스템</SelectItem>
                </SelectContent>
              </Select>
              <Select value={broadcastForm.priority} onValueChange={(value) => setBroadcastForm({...broadcastForm, priority: value as any})}>
                <SelectTrigger>
                  <SelectValue placeholder="우선순위 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">낮음</SelectItem>
                  <SelectItem value="medium">보통</SelectItem>
                  <SelectItem value="high">높음</SelectItem>
                  <SelectItem value="urgent">긴급</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">발송</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowBroadcast(false)}
                >
                  취소
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(NotificationsPage);

