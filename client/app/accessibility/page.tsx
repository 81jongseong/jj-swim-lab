'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { Button } from '../../components/ui';
import { Input } from '../../components/ui';
// Switch, Select, Slider, Label, Textarea, Tabs는 index.ts에서 export되지 않으므로 직접 import
import Switch from '../../components/ui/Switch';
import { Select } from '../../components/ui/Select';
import Slider from '../../components/ui/Slider';
import { Label } from '../../components/ui/Label';
import Textarea from '../../components/ui/Textarea';
import { Badge } from '@/components/ui';
import withAuth from '../../components/withAuth';
import Link from 'next/link';

interface AccessibilitySettings {
  // 시각적 설정
  fontSize: number;
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  reduceMotion: boolean;
  darkMode: boolean;

  // 청각적 설정
  soundNotifications: boolean;
  visualNotifications: boolean;
  subtitleSize: number;

  // 운동성 설정
  largeClickTargets: boolean;
  keyboardNavigation: boolean;
  voiceControl: boolean;

  // 인지적 설정
  simplifiedLayout: boolean;
  stepByStepGuide: boolean;
  autoSave: boolean;

  // 언어 및 지역화
  language: string;
  timezone: string;
  dateFormat: string;

  // 개인화 설정
  theme: 'default' | 'highContrast' | 'largeText' | 'dyslexia' | 'custom';
  customColors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 16,
  highContrast: false,
  colorBlindMode: 'none',
  reduceMotion: false,
  darkMode: false,
  soundNotifications: true,
  visualNotifications: true,
  subtitleSize: 14,
  largeClickTargets: false,
  keyboardNavigation: false,
  voiceControl: false,
  simplifiedLayout: false,
  stepByStepGuide: false,
  autoSave: true,
  language: 'ko',
  timezone: 'Asia/Seoul',
  dateFormat: 'YYYY-MM-DD',
  theme: 'default',
  customColors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    background: '#FFFFFF',
    text: '#000000'
  }
};

const languageOptions = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
  { value: 'es', label: 'Español' }
];

const themeOptions = [
  { value: 'default', label: '기본 테마' },
  { value: 'highContrast', label: '고대비 테마' },
  { value: 'largeText', label: '큰 글자 테마' },
  { value: 'dyslexia', label: '난독증 친화적' },
  { value: 'custom', label: '사용자 정의' }
];

function AccessibilityPage() {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('visual');
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    // 로컬 스토리지에서 설정 불러오기
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // 설정 적용
    applySettings(settings);
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    // CSS 변수로 설정 적용
    document.documentElement.style.setProperty('--font-size', `${newSettings.fontSize}px`);
    document.documentElement.style.setProperty('--subtitle-size', `${newSettings.subtitleSize}px`);

    if (newSettings.highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    if (newSettings.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    if (newSettings.reduceMotion) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }

    if (newSettings.largeClickTargets) {
      document.body.classList.add('large-targets');
    } else {
      document.body.classList.remove('large-targets');
    }

    if (newSettings.simplifiedLayout) {
      document.body.classList.add('simplified-layout');
    } else {
      document.body.classList.remove('simplified-layout');
    }
  };

  const handleSettingChange = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  const handleCustomColorChange = (colorKey: keyof AccessibilitySettings['customColors'], value: string) => {
    const newCustomColors = { ...settings.customColors, [colorKey]: value };
    const newSettings = { ...settings, customColors: newCustomColors };
    setSettings(newSettings);
    localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));

    // 사용자 정의 색상 적용
    document.documentElement.style.setProperty(`--${colorKey}-color`, value);
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibilitySettings');
    applySettings(defaultSettings);
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'accessibility-settings.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          localStorage.setItem('accessibilitySettings', JSON.stringify(importedSettings));
          applySettings(importedSettings);
        } catch (error) {
          alert('설정 파일을 읽을 수 없습니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">접근성 및 사용자 편의성 설정</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          모든 사용자가 편리하게 이용할 수 있도록 다양한 접근성 옵션을 제공합니다.
          시각, 청각, 운동성, 인지적 요구에 맞춰 개인화된 경험을 만들어보세요.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="visual">시각</TabsTrigger>
          <TabsTrigger value="audio">청각</TabsTrigger>
          <TabsTrigger value="mobility">운동성</TabsTrigger>
          <TabsTrigger value="cognitive">인지</TabsTrigger>
          <TabsTrigger value="personal">개인화</TabsTrigger>
        </TabsList>

        {/* 시각적 설정 */}
        <TabsContent value="visual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👁️ 시각적 설정
                <Badge>시각 장애인 지원</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>글자 크기: {settings.fontSize}px</Label>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={(value) => handleSettingChange('fontSize', value[0])}
                  min={12}
                  max={24}
                  step={1}
                  className="w-full focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>고대비 모드</Label>
                <Switch
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <Label>색맹 지원 모드</Label>
                <Select
                  value={settings.colorBlindMode}
                  onValueChange={(value) => handleSettingChange('colorBlindMode', value)}
                  className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  <option value="none">없음</option>
                  <option value="protanopia">적색맹</option>
                  <option value="deuteranopia">녹색맹</option>
                  <option value="tritanopia">청색맹</option>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>모션 감소</Label>
                <Switch
                  checked={settings.reduceMotion}
                  onCheckedChange={(checked) => handleSettingChange('reduceMotion', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>다크 모드</Label>
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 청각적 설정 */}
        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔊 청각적 설정
                <Badge>청각 장애인 지원</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>소리 알림</Label>
                <Switch
                  checked={settings.soundNotifications}
                  onCheckedChange={(checked) => handleSettingChange('soundNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>시각적 알림</Label>
                <Switch
                  checked={settings.visualNotifications}
                  onCheckedChange={(checked) => handleSettingChange('visualNotifications', checked)}
                />
              </div>

              <div className="space-y-4">
                <Label>자막 크기: {settings.subtitleSize}px</Label>
                <Slider
                  value={[settings.subtitleSize]}
                  onValueChange={(value) => handleSettingChange('subtitleSize', value[0])}
                  min={10}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 운동성 설정 */}
        <TabsContent value="mobility" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🖱️ 운동성 설정
                <Badge>운동 장애인 지원</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>큰 클릭 영역</Label>
                <Switch
                  checked={settings.largeClickTargets}
                  onCheckedChange={(checked) => handleSettingChange('largeClickTargets', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>키보드 네비게이션</Label>
                <Switch
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) => handleSettingChange('keyboardNavigation', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>음성 제어</Label>
                <Switch
                  checked={settings.voiceControl}
                  onCheckedChange={(checked) => handleSettingChange('voiceControl', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 인지적 설정 */}
        <TabsContent value="cognitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧠 인지적 설정
                <Badge>인지 장애인 지원</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label>간소화된 레이아웃</Label>
                <Switch
                  checked={settings.simplifiedLayout}
                  onCheckedChange={(checked) => handleSettingChange('simplifiedLayout', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>단계별 가이드</Label>
                <Switch
                  checked={settings.stepByStepGuide}
                  onCheckedChange={(checked) => handleSettingChange('stepByStepGuide', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>자동 저장</Label>
                <Switch
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 개인화 설정 */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 개인화 설정
                <Badge>맞춤형 경험</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>언어</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => handleSettingChange('language', value)}
                >
                  {languageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <Label>테마</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value)}
                >
                  {themeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>

              {settings.theme === 'custom' && (
                <div className="space-y-4 p-4 border rounded-lg">
                  <h4 className="font-semibold">사용자 정의 색상</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>주요 색상</Label>
                      <Input
                        type="color"
                        value={settings.customColors.primary}
                        onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>보조 색상</Label>
                      <Input
                        type="color"
                        value={settings.customColors.secondary}
                        onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>배경 색상</Label>
                      <Input
                        type="color"
                        value={settings.customColors.background}
                        onChange={(e) => handleCustomColorChange('background', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>텍스트 색상</Label>
                      <Input
                        type="color"
                        value={settings.customColors.text}
                        onChange={(e) => handleCustomColorChange('text', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 설정 관리 */}
      <Card>
        <CardHeader>
          <CardTitle>설정 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={resetToDefaults} variant="outline">
              기본값으로 복원
            </Button>
            <Button onClick={exportSettings} variant="outline">
              설정 내보내기
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="import-settings"
              />
              <label htmlFor="import-settings">
                <Button variant="outline">
                  설정 가져오기
                </Button>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 접근성 가이드 */}
      <Card>
        <CardHeader>
          <CardTitle>접근성 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">키보드 단축키</h4>
              <ul className="space-y-2 text-sm">
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Tab</kbd> - 다음 요소로 이동</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Shift + Tab</kbd> - 이전 요소로 이동</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> - 선택/실행</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Space</kbd> - 체크박스 토글</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">접근성 기능</h4>
              <ul className="space-y-2 text-sm">
                <li>• 스크린 리더 지원</li>
                <li>• 고대비 모드</li>
                <li>• 글자 크기 조절</li>
                <li>• 색맹 지원</li>
                <li>• 키보드 네비게이션</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuth(AccessibilityPage);




