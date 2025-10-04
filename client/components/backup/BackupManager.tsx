/**
 * 백업 관리 대시보드 컴포넌트
 * 데이터베이스 백업, 복구, 버전 관리를 담당합니다.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Calendar,
  HardDrive
} from 'lucide-react';

interface BackupInfo {
  id: string;
  timestamp: string;
  type: 'full' | 'incremental' | 'schema';
  size: number;
  status: 'success' | 'failed' | 'in_progress';
  description?: string;
  filePath: string;
}

interface RestoreInfo {
  id: string;
  timestamp: string;
  backupId: string;
  status: 'success' | 'failed' | 'in_progress';
  description?: string;
}

interface BackupSummary {
  totalBackups: number;
  successfulBackups: number;
  failedBackups: number;
  successRate: number;
  totalSize: string;
  lastBackup: {
    id: string;
    timestamp: string;
    type: string;
    size: string;
  } | null;
}

const BackupManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [restores, setRestores] = useState<RestoreInfo[]>([]);
  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupDescription, setBackupDescription] = useState('');

  // 데이터 새로고침 함수
  const refreshData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // 병렬로 모든 데이터 요청
      const [summaryRes, backupsRes, restoresRes] = await Promise.all([
        fetch('/api/backup/summary', { headers }),
        fetch('/api/backup/list', { headers }),
        fetch('/api/backup/restores', { headers })
      ]);

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        setSummary(summaryData.data);
      }

      if (backupsRes.ok) {
        const backupsData = await backupsRes.json();
        setBackups(backupsData.data.backups);
      }

      if (restoresRes.ok) {
        const restoresData = await restoresRes.json();
        setRestores(restoresData.data.restores);
      }
    } catch (error) {
      console.error('백업 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    refreshData();
  }, []);

  // 전체 백업 생성
  const createFullBackup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/backup/create-full', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: backupDescription || '사용자 요청 백업'
        })
      });

      if (response.ok) {
        alert('전체 백업이 시작되었습니다.');
        setBackupDescription('');
        refreshData();
      } else {
        alert('백업 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('백업 생성 실패:', error);
      alert('백업 생성 중 오류가 발생했습니다.');
    }
  };

  // 스키마 백업 생성
  const createSchemaBackup = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/backup/create-schema', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: backupDescription || '스키마 백업'
        })
      });

      if (response.ok) {
        alert('스키마 백업이 시작되었습니다.');
        setBackupDescription('');
        refreshData();
      } else {
        alert('스키마 백업 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('스키마 백업 생성 실패:', error);
      alert('스키마 백업 생성 중 오류가 발생했습니다.');
    }
  };

  // 백업에서 복구
  const restoreFromBackup = async (backupId: string) => {
    if (!confirm('정말로 이 백업에서 복구하시겠습니까? 현재 데이터가 삭제될 수 있습니다.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          backupId,
          description: '사용자 요청 복구'
        })
      });

      if (response.ok) {
        alert('데이터베이스 복구가 시작되었습니다.');
        refreshData();
      } else {
        alert('복구에 실패했습니다.');
      }
    } catch (error) {
      console.error('복구 실패:', error);
      alert('복구 중 오류가 발생했습니다.');
    }
  };

  // 백업 삭제
  const deleteBackup = async (backupId: string) => {
    if (!confirm('정말로 이 백업을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/backup/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('백업이 삭제되었습니다.');
        refreshData();
      } else {
        alert('백업 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('백업 삭제 실패:', error);
      alert('백업 삭제 중 오류가 발생했습니다.');
    }
  };

  // 상태에 따른 아이콘 반환
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  // 백업 타입에 따른 색상 반환
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-blue-100 text-blue-800';
      case 'schema':
        return 'bg-green-100 text-green-800';
      case 'incremental':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">백업 관리</h1>
          <p className="text-gray-600 mt-1">데이터베이스 백업 및 복구 관리</p>
        </div>
        <Button onClick={refreshData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 백업 요약 */}
      {summary && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">백업 요약</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.totalBackups}</div>
              <div className="text-sm text-gray-600">총 백업 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.successfulBackups}</div>
              <div className="text-sm text-gray-600">성공한 백업</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.failedBackups}</div>
              <div className="text-sm text-gray-600">실패한 백업</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{summary.totalSize}</div>
              <div className="text-sm text-gray-600">총 백업 크기</div>
            </div>
          </div>

          {summary.lastBackup && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">마지막 백업:</span>
                <span className="text-sm text-gray-600">
                  {new Date(summary.lastBackup.timestamp).toLocaleString()}
                </span>
                <Badge className={getTypeColor(summary.lastBackup.type)}>
                  {summary.lastBackup.type}
                </Badge>
                <span className="text-sm text-gray-500">
                  ({summary.lastBackup.size})
                </span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 백업 생성 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-6 h-6 text-green-600" />
          <h2 className="text-xl font-semibold">백업 생성</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              백업 설명 (선택사항)
            </label>
            <input
              type="text"
              value={backupDescription}
              onChange={(e) => setBackupDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="백업에 대한 설명을 입력하세요"
            />
          </div>
          
          <div className="flex gap-3">
            <Button onClick={createFullBackup} className="bg-blue-600 hover:bg-blue-700">
              <Database className="w-4 h-4 mr-2" />
              전체 백업 생성
            </Button>
            <Button onClick={createSchemaBackup} className="bg-green-600 hover:bg-green-700">
              <HardDrive className="w-4 h-4 mr-2" />
              스키마 백업 생성
            </Button>
          </div>
        </div>
      </Card>

      {/* 백업 목록 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-semibold">백업 목록</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">시간</th>
                <th className="text-left p-2">타입</th>
                <th className="text-left p-2">상태</th>
                <th className="text-left p-2">크기</th>
                <th className="text-left p-2">설명</th>
                <th className="text-left p-2">작업</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup) => (
                <tr key={backup.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 text-xs text-gray-600">
                    {new Date(backup.timestamp).toLocaleString()}
                  </td>
                  <td className="p-2">
                    <Badge className={getTypeColor(backup.type)}>
                      {backup.type}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(backup.status)}
                      <span className="text-xs">{backup.status}</span>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-gray-600">
                    {(backup.size / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="p-2 text-xs text-gray-600">
                    {backup.description || '-'}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      {backup.status === 'success' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restoreFromBackup(backup.id)}
                          className="text-xs"
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          복구
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBackup(backup.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 복구 히스토리 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-6 h-6 text-orange-600" />
          <h2 className="text-xl font-semibold">복구 히스토리</h2>
        </div>
        
        <div className="space-y-3">
          {restores.map((restore) => (
            <div key={restore.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(restore.status)}
                <div>
                  <div className="font-medium text-sm">복구 ID: {restore.id}</div>
                  <div className="text-xs text-gray-600">백업: {restore.backupId}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {new Date(restore.timestamp).toLocaleString()}
                </div>
                {restore.description && (
                  <div className="text-xs text-gray-400">{restore.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default BackupManager;
