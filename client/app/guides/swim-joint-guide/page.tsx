'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, AlertTriangle, Download } from 'lucide-react';
import JointMatrix from '@/components/guides/JointMatrix';
import ConditionCard from '@/components/guides/ConditionCard';
import EvidenceFootnotes from '@/components/guides/EvidenceFootnotes';
import PrintHeader from '@/components/guides/PrintHeader';
import { SwimJointGuideData } from '@/content/swim-joint-guide/types';
import swimJointData from '@/content/swim-joint-guide/data.joint-swim.json';
import '@/styles/print.swim-joint.css';

export default function SwimJointGuidePage() {
  const data = swimJointData as SwimJointGuideData;
  const [warningSigns, setWarningSigns] = useState({
    swelling: false,
    fever: false,
    nightPain: false,
    neurological: false,
    wound: false
  });

  const handlePrint = () => {
    window.print();
  };

  const handleWarningSignChange = (sign: keyof typeof warningSigns) => {
    setWarningSigns(prev => ({
      ...prev,
      [sign]: !prev[sign]
    }));
  };

  const hasWarningSigns = Object.values(warningSigns).some(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 인쇄용 헤더/푸터 */}
      <PrintHeader 
        title="관절질환별 수영 영법 가이드" 
        lastUpdated={data.lastUpdatedKST} 
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                관절질환별 수영 영법 가이드
              </h1>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="outline" className="text-sm">
                  마지막 업데이트: {new Date(data.lastUpdatedKST).toLocaleDateString('ko-KR')}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {data.conditions.length}개 질환 · {data.strokes.length}개 영법
                </Badge>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button 
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="print-hide"
              >
                <Printer className="h-4 w-4 mr-2" />
                A4 인쇄
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="print-hide"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF 저장
              </Button>
            </div>
          </div>

          {/* 주의 신호 체크박스 */}
          <Alert className={`mb-6 ${hasWarningSigns ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-semibold">
                  {hasWarningSigns ? '⚠️ 운동 중단 신호가 감지되었습니다!' : '주의 신호 체크'}
                </p>
                <p className="text-sm">
                  아래 증상이 있다면 수영을 중단하고 의료진과 상담하세요:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { key: 'swelling', label: '붓기' },
                    { key: 'fever', label: '발열' },
                    { key: 'nightPain', label: '야간통' },
                    { key: 'neurological', label: '신경학적 증상' },
                    { key: 'wound', label: '상처 문제' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={warningSigns[key as keyof typeof warningSigns]}
                        onCheckedChange={() => handleWarningSignChange(key as keyof typeof warningSigns)}
                        className="print-hide"
                      />
                      <label 
                        htmlFor={key} 
                        className="text-sm font-medium cursor-pointer print-show"
                      >
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
                {hasWarningSigns && (
                  <p className="text-red-700 font-semibold text-sm mt-2">
                    ⚠️ 위 증상이 있다면 즉시 수영을 중단하고 의료진과 상담하세요!
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </div>

        {/* 메인 탭 컨텐츠 */}
        <Tabs defaultValue="matrix" className="w-full">
          <TabsList className="grid w-full grid-cols-3 print-hide">
            <TabsTrigger value="matrix">요약 매트릭스</TabsTrigger>
            <TabsTrigger value="conditions">질환별 가이드</TabsTrigger>
            <TabsTrigger value="evidence">참고문헌</TabsTrigger>
          </TabsList>

          {/* 요약 매트릭스 탭 */}
          <TabsContent value="matrix" className="mt-6">
            <div className="space-y-6">
              <div className="print-show">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">영법별 질환 매트릭스</h2>
                <p className="text-gray-600 mb-6">
                  각 관절질환에 대한 수영 영법의 안전도를 점수로 표시합니다. 
                  3점(추천)부터 0점(회피)까지 4단계로 구분됩니다.
                </p>
              </div>
              <JointMatrix data={data} />
            </div>
          </TabsContent>

          {/* 질환별 가이드 탭 */}
          <TabsContent value="conditions" className="mt-6">
            <div className="space-y-6">
              <div className="print-show">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">질환별 상세 가이드</h2>
                <p className="text-gray-600 mb-6">
                  각 관절질환에 대한 구체적인 수영 가이드라인, 권장 영법, 주의사항, 
                  수정 팁, 추천 도구, 세션 예시를 제공합니다.
                </p>
              </div>
              <Accordion type="single" collapsible className="w-full">
                {data.conditions.map((condition) => (
                  <AccordionItem key={condition.id} value={condition.id} className="page-break-avoid">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold">{condition.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {condition.recommended.length}개 추천 영법
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ConditionCard 
                        condition={condition} 
                        evidenceRegistry={data.evidenceRegistry} 
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>

          {/* 참고문헌 탭 */}
          <TabsContent value="evidence" className="mt-6">
            <div className="space-y-6">
              <div className="print-show">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">의학적 근거 및 참고문헌</h2>
                <p className="text-gray-600 mb-6">
                  본 가이드라인의 모든 권장사항은 의학적으로 검증된 근거에 기반합니다. 
                  각 근거의 상세 정보와 원문 링크를 확인할 수 있습니다.
                </p>
              </div>
              <EvidenceFootnotes evidenceRegistry={data.evidenceRegistry} />
            </div>
          </TabsContent>
        </Tabs>

        {/* 개발용 체크리스트 (빌드 시 제거) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 p-6 bg-gray-100 rounded-lg print-hide">
            <h3 className="text-lg font-semibold mb-4">개발용 체크리스트</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">기능 테스트</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>□ 매트릭스 필터링 및 정렬 작동</li>
                  <li>□ 질환별 아코디언 펼침/접힘</li>
                  <li>□ 근거 뱃지 툴팁 표시</li>
                  <li>□ 인쇄 버튼 작동</li>
                  <li>□ 주의 신호 체크박스</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">반응형 테스트</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>□ 모바일 (≤390px) 레이아웃</li>
                  <li>□ 태블릿 (768px) 레이아웃</li>
                  <li>□ 데스크톱 (≥1280px) 레이아웃</li>
                  <li>□ 인쇄 미리보기 (A4)</li>
                  <li>□ 다크모드 대응</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">접근성 테스트</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>□ 키보드 네비게이션</li>
                  <li>□ 스크린 리더 호환성</li>
                  <li>□ 색상 대비 (WCAG AA)</li>
                  <li>□ 포커스 표시</li>
                  <li>□ aria-label 적절성</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">데이터 검증</h4>
                <ul className="space-y-1 text-gray-600">
                  <li>□ 모든 질환 데이터 완성</li>
                  <li>□ 매트릭스 점수 일관성</li>
                  <li>□ 근거 키 매칭</li>
                  <li>□ 링크 유효성</li>
                  <li>□ 한국어 용어 통일</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
