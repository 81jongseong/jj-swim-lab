/**
 * 📖 JJ Swim Lab - 센터 관리자용 이용안내 페이지
 * 
 * 📋 **페이지 목적**
 * - 센터 관리자에게 JJ Swim Lab 플랫폼 이용 방법 안내
 * - 연락처 및 지원 정보 제공
 * - 주요 기능 및 서비스 소개
 * 
 * 📅 **개발 히스토리**
 * - 2025-11-01: 센터 관리자용 이용안내 페이지 생성
 */

'use client';

import { useAuth } from '../../../../../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  HelpCircle, 
  Users, 
  Settings, 
  FileText,
  Shield,
  Zap,
  Heart
} from 'lucide-react';

export default function CenterAdminGuidePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            센터 관리자 이용안내
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            JJ Swim Lab 플랫폼을 효율적으로 이용하실 수 있도록 도와드립니다
          </p>
        </div>

        <div className="space-y-8">
          {/* 주요 기능 소개 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Zap className="w-6 h-6 mr-2 text-blue-600" />
                주요 기능 안내
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-semibold text-lg">회원 관리</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    센터 회원 정보 관리, 강습 배정, 건강 정보 확인 등 회원 전반을 관리할 수 있습니다.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Settings className="w-5 h-5 text-green-600 mr-2" />
                    <h3 className="font-semibold text-lg">센터 정보 관리</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    센터 정보, 운영시간, 시설 정보, 강습 과정 등을 설정하고 관리할 수 있습니다.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileText className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="font-semibold text-lg">예약·결제 관리</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    개인레슨, 레인대여 예약 및 결제를 통합 관리하고 승인 처리할 수 있습니다.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-orange-600 mr-2" />
                    <h3 className="font-semibold text-lg">통계 및 보고서</h3>
                  </div>
                  <p className="text-gray-600 text-sm">
                    센터 운영 통계, 회원 현황, 매출 등 다양한 통계 데이터를 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Phone className="w-6 h-6 mr-2 text-blue-600" />
                JJ Swim Lab 연락처
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">전화 문의</h3>
                      <p className="text-gray-600">
                        <a href="tel:02-1234-5678" className="text-blue-600 hover:underline">
                          02-1234-5678
                        </a>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        평일 09:00 - 18:00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">이메일 문의</h3>
                      <p className="text-gray-600">
                        <a href="mailto:support@jjswimlab.com" className="text-blue-600 hover:underline">
                          support@jjswimlab.com
                        </a>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        24시간 접수 가능 (평일 기준 1-2일 내 답변)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">주소</h3>
                      <p className="text-gray-600">
                        서울특별시 강남구 테헤란로 123<br />
                        JJ Swim Lab 빌딩 5층
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">운영시간</h3>
                      <p className="text-gray-600">
                        평일: 09:00 - 18:00<br />
                        주말 및 공휴일: 휴무
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 이용 절차 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
                플랫폼 이용 절차
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">센터 정보 등록</h3>
                    <p className="text-gray-600">
                      "센터 정보 관리" 메뉴에서 센터 기본 정보, 운영시간, 시설 정보를 등록해주세요.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">강사 등록</h3>
                    <p className="text-gray-600">
                      "센터 강사 관리" 메뉴에서 강사를 등록하고 강습 과정에 배정해주세요.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">강습 과정 설정</h3>
                    <p className="text-gray-600">
                      "센터 강의 관리" 메뉴에서 강습 과정을 등록하고, 수강료 및 일정을 설정해주세요.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">회원 관리</h3>
                    <p className="text-gray-600">
                      "센터 회원 관리" 메뉴에서 회원을 등록하고 강습 과정에 배정하며, 건강 정보를 확인할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">예약 및 결제 관리</h3>
                    <p className="text-gray-600">
                      "예약·결제 관리" 메뉴에서 개인레슨, 레인대여 예약을 확인하고 결제를 승인해주세요.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 중요 안내사항 */}
          <Card className="shadow-lg border-l-4 border-l-blue-600">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Heart className="w-6 h-6 mr-2 text-red-500" />
                중요 안내사항
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">⚠️ 보안 관련</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>로그인 비밀번호는 정기적으로 변경해주시기 바랍니다.</li>
                    <li>센터 정보 및 회원 정보는 안전하게 관리해주시기 바랍니다.</li>
                    <li>의심스러운 활동이 발견되면 즉시 고객지원팀에 연락해주세요.</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">ℹ️ 기능 업데이트</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>플랫폼 기능은 정기적으로 업데이트됩니다.</li>
                    <li>주요 업데이트 사항은 공지사항을 통해 안내드립니다.</li>
                    <li>문의사항이 있으시면 언제든지 고객지원팀에 연락해주세요.</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">✅ 최적 이용 팁</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm">
                    <li>센터 통계 대시보드를 활용하여 운영 현황을 모니터링하세요.</li>
                    <li>회원 건강 정보를 활용하여 맞춤형 강습을 제공하세요.</li>
                    <li>예약·결제 관리를 통해 센터 운영 효율을 높이세요.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 도움말 */}
          <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">추가 도움이 필요하신가요?</h3>
                <p className="text-gray-600 mb-4">
                  문의사항이나 기술 지원이 필요하시면 언제든지 연락해주세요.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a 
                    href="tel:02-1234-5678"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    전화 문의
                  </a>
                  <a 
                    href="mailto:support@jjswimlab.com"
                    className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    이메일 문의
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

