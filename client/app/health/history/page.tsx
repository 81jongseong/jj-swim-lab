/**
 * 운동 프로그램 이력 관리 페이지
 * 
 * 연동되는 데이터:
 * - 생성된 운동 프로그램 목록
 * - 프로그램별 실행 기록
 * - 성과 분석 및 개선사항
 * - 프로그램 수정 및 재생성
 * 
 * 연동되는 파일:
 * - /swim-training-engine/ (수영 트레이닝 규칙 엔진)
 * - /data/joint-conditions.ts (관절질환 가이드라인)
 * - /data/special-conditions.ts (특수상황 가이드라인)
 */

'use client';
import { logger } from '@/lib/logger';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle   } from '../../../components/ui';
import { Button } from '../../../components/ui';
import { Badge } from '@/components/ui';
import { ConfirmModal, LoadingState, PageHeader } from '@/components/common';
import { Alert, AlertDescription   } from '../../../components/ui/alert';
// Tabs는 index.ts에서 export되지 않으므로 직접 import
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import { 
  Calendar, 
  Clock, 
  Target, 
  Heart, 
  Activity,
  Download,
  Share,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { PlanOutput } from '@/swim-training-engine/src/types';

interface ProgramHistory {
  id: string;
  title: string;
  createdAt: string;
  conditionType: 'joint' | 'special' | 'general';
  conditionName: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  weeklyTarget: {
    time: number;
    distance: number;
  };
  sessionsCompleted: number;
  totalSessions: number;
  adherence: number;
  lastUsed: string;
  program: PlanOutput;
}

export default function ProgramHistoryPage() {
  const [programs, setPrograms] = useState<ProgramHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // ConfirmModal 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });

  // 샘플 데이터
  useEffect(() => {
    const samplePrograms: ProgramHistory[] = [
      {
        id: '1',
        title: '요추 추간판 탈출증 맞춤 프로그램',
        createdAt: '2024-01-15',
        conditionType: 'joint',
        conditionName: '요추 추간판 탈출증',
        status: 'active',
        weeklyTarget: { time: 150, distance: 2000 },
        sessionsCompleted: 8,
        totalSessions: 12,
        adherence: 67,
        lastUsed: '2024-01-20',
        program: {} as PlanOutput
      },
      {
        id: '2',
        title: '임신부 수영 프로그램',
        createdAt: '2024-01-10',
        conditionType: 'special',
        conditionName: '임신 2기',
        status: 'completed',
        weeklyTarget: { time: 120, distance: 1500 },
        sessionsCompleted: 10,
        totalSessions: 10,
        adherence: 100,
        lastUsed: '2024-01-18',
        program: {} as PlanOutput
      },
      {
        id: '3',
        title: '일반인 체력 향상 프로그램',
        createdAt: '2024-01-05',
        conditionType: 'general',
        conditionName: '일반인',
        status: 'paused',
        weeklyTarget: { time: 180, distance: 2500 },
        sessionsCompleted: 5,
        totalSessions: 15,
        adherence: 33,
        lastUsed: '2024-01-12',
        program: {} as PlanOutput
      }
    ];
    
    setPrograms(samplePrograms);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'completed': return 'secondary';
      case 'paused': return 'outline';
      case 'archived': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행중';
      case 'completed': return '완료';
      case 'paused': return '일시정지';
      case 'archived': return '보관됨';
      default: return '알 수 없음';
    }
  };

  const getConditionTypeText = (type: string) => {
    switch (type) {
      case 'joint': return '관절질환';
      case 'special': return '특수상황';
      case 'general': return '일반인';
      default: return '알 수 없음';
    }
  };

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return 'text-green-600';
    if (adherence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPrograms = programs.filter(program => {
    if (activeTab === 'all') return true;
    return program.status === activeTab;
  });

  const handleCreateNew = () => {
    window.location.href = '/swimlab/trial';
  };

  const handleViewProgram = (program: ProgramHistory) => {
    // 운동프로그램 페이지가 삭제되어 프로그램 이력 페이지에서 상세 정보 표시
    // 필요시 모달이나 다른 방식으로 상세 정보 표시 가능
    if (process.env.NODE_ENV === 'development') {
      logger.info('프로그램 상세:', program);
    }
  };

  const handleEditProgram = (program: ProgramHistory) => {
    window.location.href = `/swimlab/trial?programId=${program.id}`;
  };

  const handleDuplicateProgram = (program: ProgramHistory) => {
    // 프로그램 복제 로직
    if (process.env.NODE_ENV === 'development') {
      logger.info('프로그램 복제:', program.id);
    }
  };

  const handleDeleteProgram = (program: ProgramHistory) => {
    setConfirmModal({
      isOpen: true,
      message: '정말로 이 프로그램을 삭제하시겠습니까?',
      variant: 'danger',
      onConfirm: () => {
        setPrograms(prev => prev.filter(p => p.id !== program.id));
        setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} });
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingState message="프로그램 이력을 불러오는 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <PageHeader
        title="운동 프로그램 이력"
        description="생성된 운동 프로그램들을 관리하고 성과를 분석합니다"
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              새 프로그램 생성
            </Button>
          </div>
        }
      />

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 프로그램</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
            <p className="text-xs text-muted-foreground">생성된 프로그램</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">진행중</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">활성 프로그램</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">완료</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.filter(p => p.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">완료된 프로그램</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 순응도</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(programs.reduce((sum, p) => sum + p.adherence, 0) / programs.length)}%
            </div>
            <p className="text-xs text-muted-foreground">전체 평균</p>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="active">진행중</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="paused">일시정지</TabsTrigger>
          <TabsTrigger value="archived">보관됨</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredPrograms.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'all' ? '생성된 프로그램이 없습니다' : `${getStatusText(activeTab)} 프로그램이 없습니다`}
                </h3>
                <p className="text-gray-600 mb-4">
                  새로운 운동 프로그램을 생성해보세요.
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  새 프로그램 생성
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{program.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {getConditionTypeText(program.conditionType)} • {program.conditionName}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(program.status)}>
                          {getStatusText(program.status)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewProgram(program)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProgram(program)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateProgram(program)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProgram(program)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold">{program.weeklyTarget.time}분</div>
                        <div className="text-xs text-gray-500">주간 목표 시간</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{program.weeklyTarget.distance}m</div>
                        <div className="text-xs text-gray-500">주간 목표 거리</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {program.sessionsCompleted}/{program.totalSessions}
                        </div>
                        <div className="text-xs text-gray-500">완료 세션</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${getAdherenceColor(program.adherence)}`}>
                          {program.adherence}%
                        </div>
                        <div className="text-xs text-gray-500">순응도</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <span>생성일: {program.createdAt}</span>
                        <span>마지막 사용: {program.lastUsed}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          다운로드
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share className="h-4 w-4 mr-1" />
                          공유
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ConfirmModal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, message: '', onConfirm: () => {} })}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        variant={confirmModal.variant || 'info'}
        title="확인"
        confirmText="확인"
        cancelText="취소"
      />
    </div>
  );
}

