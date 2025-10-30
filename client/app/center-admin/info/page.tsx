/**
 * 🏢 JJ Swim Lab - 센터 관리 페이지 (센터 관리자용)
 *
 * 📋 페이지 목적
 * - 센터 기본 정보, 시설 정보, 운영 시간, 설정 등을 관리하는 화면
 *
 * 🗄️ 연동되는 데이터/엔드포인트
 * - SwimmingCenter 모델
 * - GET/PUT /api/center-admin/center-info
 * - PUT /api/centers/my-center
 *
 * 🔗 연동되는 파일
 * - hooks/useAuth.ts
 * - components/ui (Card, Button 등)
 * - components/withAuth
 */

'use client';
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */

import React from 'react';
import withAuth from '../../../components/withAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui';

function CenterInfoManagementPage() {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
        <CardHeader>
          <CardTitle>센터 정보 관리</CardTitle>
          <CardDescription>이 페이지는 구조 정리 중입니다. (임시 표시)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            파싱 오류를 우선 해결했습니다. 이후 원래 기능(센터 기본/시설/운영시간/급수 설정) UI를 복원하겠습니다.
          </p>
        </CardContent>
      </Card>
            </div>
  );
}

export default withAuth(CenterInfoManagementPage);