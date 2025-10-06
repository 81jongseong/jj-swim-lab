/**
 * 강사 등록 전용 페이지
 * 
 * 연동되는 데이터:
 * - 개인정보: 이름, 이메일, 비밀번호, 전화번호
 * - 소속 센터: 센터 선택
 * - 자격사항: 자격증 이름, 발급기관, 취득일
 * 
 * 연동되는 파일:
 * - useAuth: 인증 관리
 * - apiClient: API 통신
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../../utils/api';
import Link from 'next/link';

interface Certificate {
  name: string;
  issuer: string;
  acquiredDate: string;
}

export default function InstructorSignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 개인 정보
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    centerId: '',
    bio: '',
    specialties: [] as string[],
    experience: ''
  });

  // 자격증 정보
  const [certificates, setCertificates] = useState<Certificate[]>([
    { name: '', issuer: '', acquiredDate: '' }
  ]);

  // 센터 목록 (실제로는 API에서 가져옴)
  const [centers] = useState([
    { id: '1', name: '강남센터' },
    { id: '2', name: '서초센터' },
    { id: '3', name: '송파센터' },
    { id: '4', name: '수원센터' },
    { id: '5', name: '성남센터' }
  ]);

  // 전문 분야 옵션
  const specialtyOptions = [
    '자유형', '배영', '평영', '접영',
    '초보자 지도', '선수 육성', '성인 교육', '어린이 교육'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleCertificateChange = (index: number, field: keyof Certificate, value: string) => {
    const updated = [...certificates];
    updated[index] = { ...updated[index], [field]: value };
    setCertificates(updated);
  };

  const addCertificate = () => {
    setCertificates([...certificates, { name: '', issuer: '', acquiredDate: '' }]);
  };

  const removeCertificate = (index: number) => {
    if (certificates.length > 1) {
      setCertificates(certificates.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.name || !formData.email || !formData.password) {
      setError('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!formData.centerId) {
      setError('소속 센터를 선택해주세요.');
      return;
    }

    // 최소 하나의 자격증 정보 확인
    const validCertificates = certificates.filter(cert => cert.name && cert.issuer && cert.acquiredDate);
    if (validCertificates.length === 0) {
      setError('최소 하나의 자격증 정보를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/api/auth/signup', {
        ...formData,
        userType: 'instructor',
        certificates: validCertificates,
        status: 'pending' // 강사는 승인 대기 상태로 시작
      });

      if (response.success) {
        alert('강사 등록 신청이 완료되었습니다. 승인 후 로그인이 가능합니다.');
        router.push('/auth/login');
      } else {
        setError(response.message || '등록에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || '등록 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">👨‍🏫 강사 등록</h1>
          <p className="text-gray-600">JJ Swim Lab 강사로 등록하여 학생들을 지도하세요</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* 개인 정보 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">📋 개인 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="홍길동"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="instructor@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8자 이상"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비밀번호 확인 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="비밀번호 재입력"
                  />
                </div>
              </div>
            </div>

            {/* 소속 센터 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">🏢 소속 센터</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  센터 선택 <span className="text-red-500">*</span>
                </label>
                <select
                  name="centerId"
                  value={formData.centerId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">센터를 선택해주세요</option>
                  {centers.map(center => (
                    <option key={center.id} value={center.id}>
                      {center.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 자격 사항 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h2 className="text-xl font-semibold text-gray-900">📜 자격 사항</h2>
                <button
                  type="button"
                  onClick={addCertificate}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + 자격증 추가
                </button>
              </div>

              {certificates.map((cert, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-700">자격증 #{index + 1}</h3>
                    {certificates.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ✕ 제거
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        자격증 이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => handleCertificateChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="예: 생활체육지도자 수영 2급"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        발급 기관 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => handleCertificateChange(index, 'issuer', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="예: 대한수영연맹"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      취득일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={cert.acquiredDate}
                      onChange={(e) => handleCertificateChange(index, 'acquiredDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* 경력 및 전문 분야 */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">💼 경력 및 전문 분야</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  경력 기간
                </label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 5년"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전문 분야 (복수 선택 가능)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {specialtyOptions.map(specialty => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => handleSpecialtyToggle(specialty)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        formData.specialties.includes(specialty)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자기소개
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="강사로서의 경력, 교육 철학 등을 간단히 소개해주세요"
                />
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '등록 중...' : '강사 등록 신청'}
              </button>
              
              <Link
                href="/auth/login"
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
              >
                로그인으로 돌아가기
              </Link>
            </div>

            {/* 안내 사항 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">📌 안내 사항</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 강사 등록 신청 후 관리자 승인이 필요합니다.</li>
                <li>• 승인 완료 시 이메일로 안내를 드립니다.</li>
                <li>• 자격증은 최소 1개 이상 등록해주세요.</li>
                <li>• 허위 정보 등록 시 승인이 거부될 수 있습니다.</li>
              </ul>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

