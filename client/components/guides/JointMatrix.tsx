'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui';
import { ChevronDown, Filter, SortAsc } from 'lucide-react';
import { Condition, MatrixRow, StrokeKey, SwimJointGuideData, MatrixScore } from '@/content/swim-joint-guide/types';

interface JointMatrixProps {
  data: SwimJointGuideData;
}

const getScoreInfo = (score: number): MatrixScore => {
  if (score >= 3) return { score, level: 'recommended', color: 'bg-green-100 text-green-800', icon: '✅' };
  if (score >= 2) return { score, level: 'possible', color: 'bg-blue-100 text-blue-800', icon: '🟢' };
  if (score >= 1) return { score, level: 'caution', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
  return { score, level: 'avoid', color: 'bg-red-100 text-red-800', icon: '❌' };
};

const getLevelLabel = (level: string): string => {
  switch (level) {
    case 'recommended': return '추천';
    case 'possible': return '가능';
    case 'caution': return '주의';
    case 'avoid': return '회피';
    default: return '미정';
  }
};

export default function JointMatrix({ data }: JointMatrixProps) {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedStrokes, setSelectedStrokes] = useState<string[]>(data.strokes);
  const [sortBy, setSortBy] = useState<StrokeKey>('자유형');

  const filteredMatrix = data.matrix.filter(row => 
    selectedConditions.length === 0 || selectedConditions.includes(row.conditionId)
  );

  const sortedMatrix = [...filteredMatrix].sort((a, b) => b[sortBy] - a[sortBy]);

  const handleConditionToggle = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId) 
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleStrokeToggle = (stroke: string) => {
    setSelectedStrokes(prev => 
      prev.includes(stroke) 
        ? prev.filter(s => s !== stroke)
        : [...prev, stroke]
    );
  };

  const getConditionName = (conditionId: string) => {
    return data.conditions.find(c => c.id === conditionId)?.name || conditionId;
  };

  const visibleStrokes = data.strokes.filter(stroke => selectedStrokes.includes(stroke));

  return (
    <div className="space-y-4">
      {/* 필터 및 정렬 컨트롤 */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* 질환 필터 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              질환 필터
              {selectedConditions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedConditions.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            {data.conditions.map(condition => (
              <DropdownMenuItem
                key={condition.id}
                onClick={() => handleConditionToggle(condition.id)}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  checked={selectedConditions.includes(condition.id)}
                  onChange={() => {}}
                  className="rounded"
                />
                <span className="text-sm">{condition.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 영법 토글 */}
        <ToggleGroup
          type="multiple"
          value={selectedStrokes}
          onValueChange={setSelectedStrokes}
          className="flex-wrap"
        >
          {data.strokes.map(stroke => (
            <ToggleGroupItem key={stroke} value={stroke} size="sm">
              {stroke}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        {/* 정렬 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SortAsc className="h-4 w-4 mr-2" />
              정렬: {sortBy}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {data.strokes.map(stroke => (
              <DropdownMenuItem
                key={stroke}
                onClick={() => setSortBy(stroke as StrokeKey)}
              >
                {stroke}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 매트릭스 테이블 */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">질환</TableHead>
              {visibleStrokes.map(stroke => (
                <TableHead key={stroke} className="text-center min-w-20">
                  {stroke}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedMatrix.map(row => {
              const condition = data.conditions.find(c => c.id === row.conditionId);
              if (!condition) return null;

              return (
                <TableRow key={row.conditionId}>
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <div className="font-semibold">{condition.name}</div>
                      <div className="text-xs text-gray-500">
                        {condition.recommended.length}개 추천 영법
                      </div>
                    </div>
                  </TableCell>
                  {visibleStrokes.map(stroke => {
                    const score = row[stroke as StrokeKey];
                    const scoreInfo = getScoreInfo(score);
                    
                    return (
                      <TableCell key={stroke} className="text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <Badge 
                            variant="secondary" 
                            className={`${scoreInfo.color} text-xs`}
                          >
                            {scoreInfo.icon} {score}
                          </Badge>
                          <div className="text-xs text-gray-600">
                            {getLevelLabel(scoreInfo.level)}
                          </div>
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">✅ 3</Badge>
          <span>추천</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800">🟢 2</Badge>
          <span>가능</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-yellow-100 text-yellow-800">⚠️ 1</Badge>
          <span>주의</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-red-100 text-red-800">❌ 0</Badge>
          <span>회피</span>
        </div>
      </div>
    </div>
  );
}
