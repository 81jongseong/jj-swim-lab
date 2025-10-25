/**
 * 강사 정보 수정 API 테스트 (수정된 버전)
 */

const fetch = require('node-fetch');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';
const API_BASE_URL = 'http://localhost:5000/api';

async function testInstructorEdit() {
  try {
    console.log('🧪 강사 정보 수정 API 테스트 시작...');
    
    // 1. 로그인 시도
    console.log('🔐 로그인 시도...');
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'center@swim.com',
        password: 'password123'
      })
    });

    console.log('📡 로그인 응답 상태:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const loginError = await loginResponse.json();
      console.log('📡 로그인 응답:', loginError);
      console.log('❌ 로그인 실패!');
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ 로그인 성공!');
    
    const token = loginData.token;
    console.log('🔑 토큰 획득:', token.substring(0, 50) + '...');

    // 2. 강사 목록 조회
    console.log('📋 강사 목록 조회...');
    const instructorsResponse = await fetch(`${API_BASE_URL}/center-admin/instructors`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!instructorsResponse.ok) {
      console.log('❌ 강사 목록 조회 실패!');
      return;
    }

    const instructorsData = await instructorsResponse.json();
    console.log('✅ 강사 목록 조회 성공:', instructorsData.data.instructors.length, '명');

    if (instructorsData.data.instructors.length === 0) {
      console.log('❌ 수정할 강사가 없습니다.');
      return;
    }

    // 3. 첫 번째 강사 정보 수정
    const instructor = instructorsData.data.instructors[0];
    console.log('👨‍🏫 수정할 강사:', instructor.name, instructor._id);

    const updateData = {
      phone: '010-9999-8888',
      instructorInfo: {
        instructorLevel: 'master',
        maxStudents: 20,
        memo: 'API 테스트로 수정된 메모'
      }
    };

    console.log('📤 강사 정보 수정 요청...');
    const updateResponse = await fetch(`${API_BASE_URL}/center-admin/instructors/${instructor._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    console.log('📡 수정 응답 상태:', updateResponse.status);
    const updateResult = await updateResponse.json();
    console.log('📡 수정 응답:', updateResult);

    if (updateResponse.ok) {
      console.log('✅ 강사 정보 수정 성공!');
    } else {
      console.log('❌ 강사 정보 수정 실패!');
    }

  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  }
}

testInstructorEdit();


