'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
// Select는 index.ts에서 export되지 않으므로 직접 import
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select';
import withAuth from '../../components/withAuth';

interface LocalizationSettings {
  language: string;
  region: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
}

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
];

const regions = [
  { code: 'KR', name: '대한민국', currency: 'KRW' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'JP', name: '일본', currency: 'JPY' },
  { code: 'CN', name: '중국', currency: 'CNY' }
];

const timezones = [
  'Asia/Seoul',
  'Asia/Tokyo', 
  'Asia/Shanghai',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London'
];

function LocalizationPage() {
  const [settings, setSettings] = useState<LocalizationSettings>({
    language: 'ko',
    region: 'KR',
    timezone: 'Asia/Seoul',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: '24h',
    currency: 'KRW'
  });

  const handleSettingChange = (key: keyof LocalizationSettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem('localizationSettings', JSON.stringify(settings));
    alert('설정이 저장되었습니다.');
  };

  const resetSettings = () => {
    const defaultSettings = {
      language: 'ko',
      region: 'KR',
      timezone: 'Asia/Seoul',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      currency: 'KRW'
    };
    setSettings(defaultSettings);
    alert('설정이 초기화되었습니다.');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">언어 및 지역화 설정</h1>
        <p className="text-gray-600 mt-2">언어, 지역, 시간대 등을 설정하여 개인화된 경험을 만들어보세요.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>언어 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">언어</label>
              <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="언어 선택" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">지역</label>
              <Select value={settings.region} onValueChange={(value) => handleSettingChange('region', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.code} value={region.code}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">시간대</label>
              <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="시간대 선택" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>형식 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">날짜 형식</label>
              <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange('dateFormat', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="날짜 형식 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="YYYY년MM월DD일">YYYY년MM월DD일</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">시간 형식</label>
              <Select value={settings.timeFormat} onValueChange={(value) => handleSettingChange('timeFormat', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="시간 형식 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24시간</SelectItem>
                  <SelectItem value="12h">12시간</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">통화</label>
              <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="통화 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">KRW (원)</SelectItem>
                  <SelectItem value="USD">USD (달러)</SelectItem>
                  <SelectItem value="JPY">JPY (엔)</SelectItem>
                  <SelectItem value="CNY">CNY (위안)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>미리보기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>언어:</strong> {languages.find(l => l.code === settings.language)?.name}</p>
              <p><strong>지역:</strong> {regions.find(r => r.code === settings.region)?.name}</p>
              <p><strong>시간대:</strong> {settings.timezone}</p>
              <p><strong>날짜:</strong> {new Date().toLocaleDateString()}</p>
              <p><strong>시간:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>통화:</strong> {settings.currency}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex space-x-4">
        <Button onClick={saveSettings}>설정 저장</Button>
        <Button variant="outline" onClick={resetSettings}>초기화</Button>
      </div>
    </div>
  );
}

export default withAuth(LocalizationPage);