/**
 * @file 누락된 페이지 자동 생성 스크립트
 * @description 구현되지 않은 페이지를 감지하고 자동으로 생성합니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

const fs = require('fs');
const path = require('path');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// 필요한 페이지 목록
const requiredPages = [
  // center-admin 페이지들
  { path: 'center-admin/bookings', name: '예약 관리', type: 'center-admin' },
  { path: 'center-admin/courses', name: '강의 관리', type: 'center-admin' },
  
  // admin 페이지들 (기본 구조만 있는 것들)
  { path: 'admin/centers', name: '센터 관리', type: 'admin' },
  { path: 'admin/users', name: '사용자 관리', type: 'admin' },
  { path: 'admin/courses', name: '강의 관리', type: 'admin' },
  { path: 'admin/instructors', name: '강사 관리', type: 'admin' },
  { path: 'admin/payments', name: '결제 관리', type: 'admin' },
  { path: 'admin/reports', name: '리포트', type: 'admin' },
  { path: 'admin/notices', name: '공지사항 관리', type: 'admin' },
  
  // instructor 페이지들
  { path: 'instructor/bookings', name: '예약 관리', type: 'instructor' },
  { path: 'instructor/schedule', name: '일정 관리', type: 'instructor' },
  { path: 'instructor/templates', name: '템플릿 관리', type: 'instructor' },
  
  // student 페이지들
  { path: 'student/bookings', name: '예약 관리', type: 'student' },
  { path: 'student/courses', name: '강의 관리', type: 'student' },
  { path: 'student/progress', name: '진도 관리', type: 'student' },
];

// 페이지 템플릿 생성 함수
function generatePageTemplate(pageInfo) {
  const { path: pagePath, name, type } = pageInfo;
  
  let template = '';
  
  switch (type) {
    case 'center-admin':
      template = generateCenterAdminTemplate(name, pagePath);
      break;
    case 'admin':
      template = generateAdminTemplate(name, pagePath);
      break;
    case 'instructor':
      template = generateInstructorTemplate(name, pagePath);
      break;
    case 'student':
      template = generateStudentTemplate(name, pagePath);
      break;
    default:
      template = generateDefaultTemplate(name, pagePath);
  }
  
  return template;
}

function generateCenterAdminTemplate(name, pagePath) {
  const apiEndpoint = pagePath.split('/')[1]; // center-admin/reviews -> reviews
  return `/**
 * @file 센터 관리자 ${name} 페이지
 * @description 센터 관리자가 ${name}을 관리할 수 있는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const CenterAdmin${name.replace(/\s+/g, '')}Page: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출 (데이터베이스에서 가져오기)
      const token = localStorage.getItem('token');
      const response = await fetch(\`http://localhost:5000/api/centers/${apiEndpoint}\`, {
        method: 'GET',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('데이터를 가져올 수 없습니다.');
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.message || '데이터 조회에 실패했습니다.');
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setData([]); // API 연결 실패 시 빈 배열
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ${name}
        </h1>
        <p className="text-gray-600">
          ${name}을 관리하세요.
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 목록 */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">데이터가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          data.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">항목 {index + 1}</h3>
                    <p className="text-gray-600">설명...</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p className="font-semibold">개발 필요:</p>
        <p>이 페이지는 자동 생성되었습니다. 실제 기능을 구현해주세요.</p>
        <p>관련 API 엔드포인트 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default CenterAdmin${name.replace(/\s+/g, '')}Page;
`;
}

function generateAdminTemplate(name, pagePath) {
  return `/**
 * @file 관리자 ${name} 페이지
 * @description 관리자가 ${name}을 관리할 수 있는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const Admin${name.replace(/\s+/g, '')}Page: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출 구현
      console.log('${name} 데이터 로딩 중...');
      
      // 임시 데이터
      setTimeout(() => {
        setData([]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ${name}
        </h1>
        <p className="text-gray-600">
          ${name}을 관리하세요.
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 목록 */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">데이터가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          data.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">항목 {index + 1}</h3>
                    <p className="text-gray-600">설명...</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p className="font-semibold">개발 필요:</p>
        <p>이 페이지는 자동 생성되었습니다. 실제 기능을 구현해주세요.</p>
        <p>관련 API 엔드포인트 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default Admin${name.replace(/\s+/g, '')}Page;
`;
}

function generateInstructorTemplate(name, pagePath) {
  return `/**
 * @file 강사 ${name} 페이지
 * @description 강사가 ${name}을 관리할 수 있는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const Instructor${name.replace(/\s+/g, '')}Page: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출 구현
      console.log('${name} 데이터 로딩 중...');
      
      // 임시 데이터
      setTimeout(() => {
        setData([]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ${name}
        </h1>
        <p className="text-gray-600">
          ${name}을 관리하세요.
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 목록 */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">데이터가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          data.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">항목 {index + 1}</h3>
                    <p className="text-gray-600">설명...</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p className="font-semibold">개발 필요:</p>
        <p>이 페이지는 자동 생성되었습니다. 실제 기능을 구현해주세요.</p>
        <p>관련 API 엔드포인트 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default Instructor${name.replace(/\s+/g, '')}Page;
`;
}

function generateStudentTemplate(name, pagePath) {
  return `/**
 * @file 학생 ${name} 페이지
 * @description 학생이 ${name}을 확인할 수 있는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Search, Filter } from 'lucide-react';

const Student${name.replace(/\s+/g, '')}Page: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출 구현
      console.log('${name} 데이터 로딩 중...');
      
      // 임시 데이터
      setTimeout(() => {
        setData([]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ${name}
        </h1>
        <p className="text-gray-600">
          ${name}을 확인하세요.
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 목록 */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">데이터가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          data.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">항목 {index + 1}</h3>
                    <p className="text-gray-600">설명...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p className="font-semibold">개발 필요:</p>
        <p>이 페이지는 자동 생성되었습니다. 실제 기능을 구현해주세요.</p>
        <p>관련 API 엔드포인트 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default Student${name.replace(/\s+/g, '')}Page;
`;
}

function generateDefaultTemplate(name, pagePath) {
  return `/**
 * @file ${name} 페이지
 * @description ${name}을 관리하는 페이지입니다.
 * @date 2025-09-14
 * @author JJ Swim Lab
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

const ${name.replace(/\s+/g, '')}Page: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // TODO: 실제 API 호출 구현
      console.log('${name} 데이터 로딩 중...');
      
      // 임시 데이터
      setTimeout(() => {
        setData([]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ${name}
        </h1>
        <p className="text-gray-600">
          ${name}을 관리하세요.
        </p>
      </div>

      {/* 필터 및 검색 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>필터 및 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="검색..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 목록 */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">데이터가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          data.map((item, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">항목 {index + 1}</h3>
                    <p className="text-gray-600">설명...</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      수정
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4 mr-1" />
                      삭제
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
        <p className="font-semibold">개발 필요:</p>
        <p>이 페이지는 자동 생성되었습니다. 실제 기능을 구현해주세요.</p>
        <p>관련 API 엔드포인트 개발이 필요합니다.</p>
      </div>
    </div>
  );
};

export default ${name.replace(/\s+/g, '')}Page;
`;
}

// 페이지 존재 여부 확인
function checkPageExists(pagePath) {
  const fullPath = path.join(__dirname, '..', 'client', 'app', pagePath, 'page.tsx');
  return fs.existsSync(fullPath);
}

// 디렉토리 생성
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

// 메인 실행 함수
async function autoFixMissingPages() {
  log('🔍 누락된 페이지 자동 생성 시작', colors.cyan);
  log('');
  
  let createdPages = 0;
  let existingPages = 0;
  
  for (const pageInfo of requiredPages) {
    const { path: pagePath, name } = pageInfo;
    
    if (checkPageExists(pagePath)) {
      log(`✅ ${pagePath} - 이미 존재`, colors.green);
      existingPages++;
      continue;
    }
    
    try {
      // 디렉토리 생성
      const dirPath = path.join(__dirname, '..', 'client', 'app', pagePath);
      const createdDir = ensureDirectoryExists(dirPath);
      
      // 페이지 파일 생성
      const filePath = path.join(dirPath, 'page.tsx');
      const template = generatePageTemplate(pageInfo);
      
      fs.writeFileSync(filePath, template, 'utf8');
      
      log(`🆕 ${pagePath} - 새로 생성됨`, colors.blue);
      createdPages++;
      
    } catch (error) {
      log(`❌ ${pagePath} - 생성 실패: ${error.message}`, colors.red);
    }
  }
  
  log('');
  log('📊 페이지 생성 결과', colors.magenta);
  log(`기존 페이지: ${existingPages}개`, colors.green);
  log(`새로 생성된 페이지: ${createdPages}개`, colors.blue);
  
  if (createdPages > 0) {
    log('🎉 누락된 페이지가 자동으로 생성되었습니다!', colors.green);
    log('💡 생성된 페이지들은 기본 구조만 있으므로 실제 기능을 구현해주세요.', colors.yellow);
  } else {
    log('✅ 모든 필요한 페이지가 이미 존재합니다.', colors.green);
  }
  
  return createdPages > 0;
}

// 스크립트 실행
if (require.main === module) {
  autoFixMissingPages().then(hasChanges => {
    process.exit(hasChanges ? 0 : 0); // 항상 성공으로 종료
  }).catch(error => {
    log(`❌ 스크립트 실행 중 오류 발생: ${error.message}`, colors.red);
    process.exit(1);
  });
}

module.exports = { autoFixMissingPages, checkPageExists, generatePageTemplate };
