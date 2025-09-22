'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/utils/api';
import withAuth from '@/components/withAuth';

interface ReportItem {
  _id: string;
  type: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  reportedBy: {
    name: string;
    email: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

function AdminReportsPage() {
  const [list, setList] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    const res = await apiClient.getReports({ limit: 50 });
    if (res.error) setError(res.error);
    else setList(res.data.reports || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-200 text-red-900 border-2 border-red-500';
      case 'in_progress': return 'bg-yellow-200 text-yellow-900 border-2 border-yellow-500';
      case 'resolved': return 'bg-green-200 text-green-900 border-2 border-green-500';
      case 'closed': return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return '🔴 열림';
      case 'in_progress': return '🟡 처리중';
      case 'resolved': return '🟢 해결됨';
      case 'closed': return '⚫ 닫힘';
      default: return '❓ 알 수 없음';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-200 text-green-900 border-2 border-green-500';
      case 'medium': return 'bg-yellow-200 text-yellow-900 border-2 border-yellow-500';
      case 'high': return 'bg-orange-200 text-orange-900 border-2 border-orange-500';
      case 'urgent': return 'bg-red-200 text-red-900 border-2 border-red-500';
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return '🟢 낮음';
      case 'medium': return '🟡 보통';
      case 'high': return '🟠 높음';
      case 'urgent': return '🔴 긴급';
      default: return '❓ 알 수 없음';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-200 text-red-900 border-2 border-red-500';
      case 'feature': return 'bg-blue-200 text-blue-900 border-2 border-blue-500';
      case 'complaint': return 'bg-orange-200 text-orange-900 border-2 border-orange-500';
      case 'suggestion': return 'bg-purple-200 text-purple-900 border-2 border-purple-500';
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-500';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'bug': return '🐛 버그';
      case 'feature': return '✨ 기능요청';
      case 'complaint': return '😤 불만사항';
      case 'suggestion': return '💡 제안사항';
      default: return '❓ 기타';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const filteredReports = list.filter(report => {
    if (filterStatus !== 'all' && report.status !== filterStatus) return false;
    if (filterType !== 'all' && report.type !== filterType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-600 mx-auto"></div>
              <p className="mt-6 text-xl text-gray-700 font-medium">로딩 중입니다...</p>
              <p className="mt-2 text-lg text-gray-500">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-single-line">🎧 고객지원 관리</h1>
          <p className="text-gray-600">고객의 버그 신고, 기능 요청, 불만사항, 제안사항을 체계적으로 관리하세요</p>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">📋 고객지원 요청 목록</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                >
                  <option value="all">📊 모든 상태</option>
                  <option value="open">🔴 열림</option>
                  <option value="in_progress">🟡 처리중</option>
                  <option value="resolved">🟢 해결됨</option>
                  <option value="closed">⚫ 닫힘</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                >
                  <option value="all">📋 모든 유형</option>
                  <option value="bug">🐛 버그</option>
                  <option value="feature">✨ 기능요청</option>
                  <option value="complaint">😤 불만사항</option>
                  <option value="suggestion">💡 제안사항</option>
                </select>
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                  총 {filteredReports.length}건
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="px-8 py-4 bg-red-100 border-l-4 border-red-500 text-red-700">
              <p className="font-medium">오류가 발생했습니다:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="p-8">
            <div className="space-y-6">
              {filteredReports.map((report) => (
                <div key={report._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 text-single-line">{report.title}</h3>
                        <span className={`px-3 py-1 text-sm font-bold rounded-lg ${getTypeColor(report.type)}`}>
                          {getTypeText(report.type)}
                        </span>
                        <span className={`px-3 py-1 text-sm font-bold rounded-lg ${getPriorityColor(report.priority)}`}>
                          {getPriorityText(report.priority)}
                        </span>
                      </div>
                      <div className="text-gray-700 line-clamp-2 text-single-line">{report.description}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className={`px-3 py-2 text-sm font-bold rounded-lg ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">📝 신고자</div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-gray-900">{report.reportedBy?.name || '알 수 없음'}</div>
                        <div className="text-sm text-gray-600">{report.reportedBy?.email || '-'}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-600">👤 담당자</div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        {report.assignedTo ? (
                          <>
                            <div className="font-medium text-gray-900">{report.assignedTo.name}</div>
                            <div className="text-sm text-gray-600">{report.assignedTo.email}</div>
                          </>
                        ) : (
                          <div className="text-gray-500 italic">담당자 미지정</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedReport(selectedReport?._id === report._id ? null : report)}
                        className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                      >
                        {selectedReport?._id === report._id ? '📝 상세정보 닫기' : '📝 상세정보 보기'}
                      </button>
                      
                      <button
                        onClick={async () => {
                          const newStatus = prompt(
                            `현재 상태: ${getStatusText(report.status)}\n\n새로운 상태를 선택하세요:\n1. draft (초안)\n2. submitted (제출됨)\n3. reviewed (검토됨)\n4. approved (승인됨)`
                          );
                          
                          let status: 'draft' | 'submitted' | 'reviewed' | 'approved' = report.status as 'draft' | 'submitted' | 'reviewed' | 'approved';
                          if (newStatus === '1' || newStatus?.toLowerCase().includes('draft')) status = 'draft';
                          else if (newStatus === '2' || newStatus?.toLowerCase().includes('submitted')) status = 'submitted';
                          else if (newStatus === '3' || newStatus?.toLowerCase().includes('reviewed')) status = 'reviewed';
                          else if (newStatus === '4' || newStatus?.toLowerCase().includes('approved')) status = 'approved';
                          
                          if (status !== report.status) {
                            const res = await apiClient.updateReport(report._id, { status });
                            if (res.error) alert(res.error);
                            else load();
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                      >
                        🔄 상태 변경
                      </button>
                      
                      <button
                        onClick={async () => {
                          const assignee = prompt('담당자 이메일을 입력하세요 (비워두면 담당자 해제):');
                          const res = await apiClient.updateReport(report._id, { 
                            assignedTo: assignee || null 
                          });
                          if (res.error) alert(res.error);
                          else load();
                        }}
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        👤 담당자 지정
                      </button>
                      
                      <button
                        onClick={async () => {
                          if (!confirm('정말로 이 리포트를 삭제하시겠습니까?')) return;
                          const res = await apiClient.deleteReport(report._id);
                          if (res.error) alert(res.error);
                          else load();
                        }}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        🗑️ 삭제
                      </button>
                    </div>

                    {selectedReport?._id === report._id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h5 className="font-semibold text-gray-900 text-base mb-3">🎧 고객지원 요청 상세정보</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium text-gray-700">리포트 ID:</div>
                            <div className="text-gray-900 font-mono text-single-line">{report._id}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">생성일:</div>
                            <div className="text-gray-900">{formatDate(report.createdAt)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">수정일:</div>
                            <div className="text-gray-900">{formatDate(report.updatedAt)}</div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-700">우선순위:</div>
                            <div className="text-gray-900">{getPriorityText(report.priority)}</div>
                          </div>
                          <div className="md:col-span-2">
                            <div className="font-medium text-gray-700">상세 설명:</div>
                            <div className="text-gray-900 bg-white p-3 rounded-lg mt-1">
                              {report.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎧</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">고객지원 요청이 없습니다</h3>
                <p className="text-gray-500 mb-6">
                  {filterStatus !== 'all' || filterType !== 'all' 
                    ? '선택한 필터에 맞는 고객지원 요청이 없습니다' 
                    : '아직 고객지원 요청이 제출되지 않았습니다'
                  }
                </p>
                {(filterStatus !== 'all' || filterType !== 'all') && (
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterType('all');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    🔄 필터 초기화
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminReportsPage, { requireTypes: ['centerAdmin','superAdmin'], requirePermission: null });




