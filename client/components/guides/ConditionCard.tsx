'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Wrench, Dumbbell, Clock } from 'lucide-react';
import { Condition, Evidence } from '@/content/swim-joint-guide/types';

interface ConditionCardProps {
  condition: Condition;
  evidenceRegistry: Evidence[];
}

export default function ConditionCard({ condition, evidenceRegistry }: ConditionCardProps) {
  const getEvidenceInfo = (key: string) => {
    return evidenceRegistry.find(e => e.key === key);
  };

  const hasLink = (evidence: Evidence | undefined) => {
    return evidence?.link && evidence.link.trim() !== '';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>{condition.name}</span>
          <Badge variant="outline" className="text-xs">
            {condition.recommended.length}개 추천 영법
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 권장 영법 */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-800">권장 영법</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {condition.recommended.map((stroke, index) => (
              <Badge key={index} className="bg-green-100 text-green-800">
                {stroke}
              </Badge>
            ))}
          </div>
        </div>

        {/* 피함/주의 영법 */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <XCircle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-800">피함/주의 영법</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {condition.avoidOrCaution.map((stroke, index) => (
              <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                {stroke}
              </Badge>
            ))}
          </div>
        </div>

        {/* 수정 팁 */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Wrench className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">수정 팁</h3>
          </div>
          <ul className="space-y-2">
            {condition.modifications.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 도구 */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Dumbbell className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-800">추천 도구</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {condition.tools.map((tool, index) => (
              <Badge key={index} variant="outline" className="bg-purple-50 text-purple-800">
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        {/* 세션 예시 */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-orange-800">세션 예시</h3>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-sm text-orange-800">{condition.sessionExample}</p>
          </div>
        </div>

        {/* 근거 뱃지 */}
        {condition.evidenceKeys.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">의학적 근거</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {condition.evidenceKeys.map((key, index) => {
                const evidence = getEvidenceInfo(key);
                const hasValidLink = hasLink(evidence);
                
                return (
                  <div key={index} className="flex items-center space-x-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        hasValidLink 
                          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                      title={evidence?.label || '근거 정보 없음'}
                    >
                      {evidence?.label || key}
                    </Badge>
                    {!hasValidLink && (
                      <Badge variant="secondary" className="text-xs bg-yellow-200 text-yellow-900">
                        (링크 보강 예정)
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Separator />
      </CardContent>
    </Card>
  );
}
