import { useState, useEffect } from 'react';
import apiClient from '../../utils/api';

export default function AdminNotices() {
  const [notices, setNotices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('전체');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    priority: 'medium',
    isPublished: false
  });

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        
        const response = await apiClient.getAdminNotices();
        
        if (response.data && response.data.notices && Array.isArray(response.data.notices)) {
          setNotices(response.data.notices);
        } else if (response.data && Array.isArray(response.data)) {
          setNotices(response.data);
        } else if (response.data && !Array.isArray(response.data)) {
          setNotices([]);
        } else if (response.error) {
          setError(response.error);
          setNotices([]);
        } else {
          setNotices([]);
        }
      } catch (err) {
        setError('공지사항 목록을 불러오는데 실패했습니다.');
        setNotices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
  };

  const handleAddNotice = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      isPublished: false
    });
    setShowAddModal(true);
  };

  const handleEditNotice = (notice: any) => {
    if (!notice) {
      return;
    }
    
    setSelectedNotice(notice);
    setFormData({
      title: notice.title || '',
      content: notice.content || '',
      category: notice.category || 'general',
      priority: notice.priority || 'medium',
      isPublished: notice.isPublished || false
    });
    setShowEditModal(true);
  };

  const formatNoticeInfo = (notice: any) => {
    const info: any[] = [];
    
    if (notice.createdAt) {
      const date = new Date(notice.createdAt);
      info.push({
        label: '작성일',
        value: `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`,
        icon: '📅'
      });
    }
    
    if (notice.author && notice.author.name) {
      info.push({
        label: '작성자',
        value: notice.author.name,
        icon: '👤'
      });
    }
    
    if (notice.viewCount !== undefined) {
      info.push({
        label: '조회수',
        value: notice.viewCount.toString(),
        icon: '👁️'
      });
    }
    
    if (notice.isPublished) {
      info.push({
        label: '상태',
        value: '발행됨',
        icon: '✅',
        color: 'text-green-600'
      });
    } else {
      info.push({
        label: '상태',
        value: '임시저장',
        icon: '⏳',
        color: 'text-gray-600'
      });
    }
    
    return info;
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (window.confirm('정말로 이 공지사항을 삭제하시겠습니까?')) {
      try {
        const response = await apiClient.deleteNotice(noticeId);
        if (response.data) {
          setNotices(notices.filter(notice => notice._id !== noticeId));
          alert('공지사항이 삭제되었습니다.');
        } else {
          alert('삭제에 실패했습니다.');
        }
      } catch (err) {
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (showAddModal) {
        const response = await apiClient.createNotice(formData);
        if (response.data) {
          setNotices([...notices, response.data]);
          setShowAddModal(false);
          alert('공지사항이 추가되었습니다.');
        }
      } else if (selectedNotice) {
        const response = await apiClient.updateNotice(selectedNotice._id, formData);
        if (response.data) {
          setNotices(notices.map(notice => 
            notice._id === selectedNotice._id ? { ...notice, ...formData } : notice
          ));
          setShowEditModal(false);
          alert('공지사항이 수정되었습니다.');
        }
      }
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const filteredNotices = notices.filter(notice => {
    if (filter === '전체') return true;
    if (filter === '중요') return notice.priority === 'high' || notice.priority === 'urgent';
    if (filter === '일반') return notice.category === 'general';
    if (filter === '이벤트') return notice.category === 'course';
    return true;
  });

  const getTypeColor = (category: string, priority: string) => {
    if (priority === 'urgent' || priority === 'high') return 'border-red-500 bg-red-50';
    switch (category) {
      case 'general': return 'border-blue-500 bg-blue-50';
      case 'course': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getTypeText = (category: string) => {
    switch (category) {
      case 'general': return '일반';
      case 'course': return '강습';
      case 'facility': return '시설';
      case 'maintenance': return '정비';
      case 'emergency': return '긴급';
      default: return '기타';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">공지사항 관리</h1>
          <p className="text-gray-600">공지사항을 작성하고 관리하세요</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">로딩 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">공지사항 목록</h3>
                <button 
                  onClick={handleAddNotice}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  + 새 공지사항 작성
                </button>
              </div>
              
              <div className="flex space-x-4 mb-6">
                <button 
                  onClick={() => handleFilter('전체')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '전체' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  전체
                </button>
                <button 
                  onClick={() => handleFilter('중요')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '중요' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  중요
                </button>
                <button 
                  onClick={() => handleFilter('일반')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '일반' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  일반
                </button>
                <button 
                  onClick={() => handleFilter('이벤트')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === '이벤트' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  이벤트
                </button>
              </div>

              <div className="space-y-4">
                {filteredNotices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {filter === '전체' ? '등록된 공지사항이 없습니다.' : `${filter} 공지사항이 없습니다.`}
                  </div>
                ) : (
                                     filteredNotices.map((notice) => {
                     return (
                      <div key={notice._id} className={`border-l-4 ${getTypeColor(notice.category, notice.priority)} rounded-lg p-6 hover:bg-opacity-75 transition-colors`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                              {notice.title || '제목 없음'}
                            </h4>
                            <p className="text-gray-600 mb-2">
                              {notice.content || '내용 없음'}
                            </p>
                            {notice.description && (
                              <p className="text-gray-500 text-sm">{notice.description}</p>
                            )}
                                                         <div className="flex items-center gap-2 mt-3">
                               <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                 notice.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                 notice.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                 notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-gray-100 text-gray-800'
                               }`}>
                                 {notice.priority === 'urgent' ? '긴급' :
                                  notice.priority === 'high' ? '높음' :
                                  notice.priority === 'medium' ? '보통' : '낮음'}
                               </span>
                               {!notice.isPublished && (
                                 <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                   임시저장
                                 </span>
                               )}
                             </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <span className={`px-3 py-1 text-xs rounded-full ${
                              notice.priority === 'urgent' || notice.priority === 'high' ? 'bg-red-100 text-red-800' :
                              notice.category === 'course' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {notice.priority === 'urgent' || notice.priority === 'high' ? '중요' : getTypeText(notice.category)}
                            </span>
                            <button 
                              onClick={() => handleEditNotice(notice)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              수정
                            </button>
                            <button 
                              onClick={() => handleDeleteNotice(notice._id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                                                 <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                           <div className="flex items-center gap-4 text-xs text-gray-500">
                             {notice.createdAt && (
                               <span className="flex items-center">
                                 <span className="mr-1">📅</span>
                                 {new Date(notice.createdAt).toLocaleDateString()}
                               </span>
                             )}
                             {notice.author && notice.author.name && (
                               <span className="flex items-center">
                                 <span className="mr-1">👤</span>
                                 {notice.author.name}
                               </span>
                             )}
                             {notice.viewCount !== undefined && (
                               <span className="flex items-center">
                                 <span className="mr-1">👁️</span>
                                 {notice.viewCount}
                               </span>
                             )}
                           </div>
                           <div className="flex items-center gap-2">
                             {notice.isPublished ? (
                               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                 <span className="mr-1">✅</span>
                                 발행됨
                               </span>
                             ) : (
                               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                 <span className="mr-1">⏳</span>
                                 임시저장
                               </span>
                             )}
                           </div>
                         </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">새 공지사항 작성</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="공지사항 제목을 입력하세요"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={8}
                    placeholder="공지사항 내용을 입력하세요"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">일반</option>
                      <option value="course">강습</option>
                      <option value="facility">시설</option>
                      <option value="maintenance">정비</option>
                      <option value="emergency">긴급</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                      <option value="urgent">긴급</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                    즉시 발행
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  작성
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notice Modal */}
      {showEditModal && selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">공지사항 수정</h3>
            
                         {/* 미리보기 정보 */}
             <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
               <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                 <span className="mr-2">📋</span>
                 공지사항 정보
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {selectedNotice && formatNoticeInfo(selectedNotice).map((info, index) => (
                   <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded-lg shadow-sm">
                     <span className="text-lg">{info.icon}</span>
                     <div className="flex-1">
                       <div className="text-xs text-gray-500">{info.label}</div>
                       <div className={`text-sm font-medium ${info.color || 'text-gray-900'}`}>
                         {info.value}
                       </div>
                     </div>
                   </div>
                 ))}
                 {!selectedNotice && (
                   <div className="col-span-2 text-center text-gray-500 py-4">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                     정보를 불러오는 중...
                   </div>
                 )}
               </div>
             </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">일반</option>
                      <option value="course">강습</option>
                      <option value="facility">시설</option>
                      <option value="maintenance">정비</option>
                      <option value="emergency">긴급</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                      <option value="urgent">긴급</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="editIsPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="editIsPublished" className="ml-2 block text-sm text-gray-900">
                    즉시 발행
                  </label>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 