'use client';

import { Badge } from '@/components/ui';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Evidence } from '@/content/swim-joint-guide/types';

interface EvidenceFootnotesProps {
  evidenceRegistry: Evidence[];
}

export default function EvidenceFootnotes({ evidenceRegistry }: EvidenceFootnotesProps) {
  const hasLink = (evidence: Evidence) => {
    return evidence.link && evidence.link.trim() !== '';
  };

  const getLinkCount = () => {
    return evidenceRegistry.filter(hasLink).length;
  };

  const getMissingLinkCount = () => {
    return evidenceRegistry.filter(e => !hasLink(e)).length;
  };

  return (
    <div className="space-y-4">
      {/* 요약 정보 */}
      <div className="flex flex-wrap gap-4 text-sm">
        <Badge variant="outline">
          총 {evidenceRegistry.length}개 근거
        </Badge>
        <Badge variant="outline" className="bg-green-100 text-green-800">
          링크 완료: {getLinkCount()}개
        </Badge>
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
          링크 보강 예정: {getMissingLinkCount()}개
        </Badge>
      </div>

      {/* 근거 목록 */}
      <div className="grid gap-4 md:grid-cols-2">
        {evidenceRegistry.map((evidence, index) => (
          <Card key={evidence.key} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span className="text-gray-600">[{index + 1}]</span>
                <span>{evidence.label}</span>
                {!hasLink(evidence) && (
                  <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-900">
                    (링크 보강 예정)
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {evidence.note && (
                  <p className="text-sm text-gray-600">{evidence.note}</p>
                )}
                
                {hasLink(evidence) ? (
                  <div className="flex items-center space-x-2">
                    <a
                      href={evidence.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>원문 보기</span>
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">링크 추가 예정</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 사용법 안내 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">근거 사용법</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 각 질환 카드의 근거 뱃지를 클릭하면 상세 정보를 확인할 수 있습니다</li>
                <li>• 링크가 있는 근거는 원문을 직접 확인할 수 있습니다</li>
                <li>• "(링크 보강 예정)" 표시는 향후 실제 링크가 추가될 예정임을 의미합니다</li>
                <li>• 모든 근거는 의학적 검증을 거친 신뢰할 수 있는 자료입니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
