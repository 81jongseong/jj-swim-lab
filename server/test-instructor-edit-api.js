const mongoose = require('mongoose');
const fetch = require('node-fetch');

// User 모델 정의
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const MONGODB_URI = 'mongodb+srv://jjswim:qkxm1010@jjswim-cluster.t5e3a9y.mongodb.net/jj-swim-lab?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('🧪 강사 정보 수정 API 테스트 시작...');
  
  // 강사 정보 조회
  const instructor = await User.findOne({ userType: 'instructor' });
  if (!instructor) {
    console.log('❌ 강사를 찾을 수 없습니다.');
    mongoose.disconnect();
    return;
  }
  
  console.log('👨‍🏫 테스트 대상 강사:', instructor.name);
  console.log('📧 이메일:', instructor.email);
  console.log('🆔 강사 ID:', instructor._id);
  
  // 센터 관리자 정보 조회
  const centerAdmin = await User.findOne({ userType: 'centerAdmin' });
  if (!centerAdmin) {
    console.log('❌ 센터 관리자를 찾을 수 없습니다.');
    mongoose.disconnect();
    return;
  }
  
  console.log('👨‍💼 센터 관리자:', centerAdmin.name);
  console.log('🆔 센터 관리자 ID:', centerAdmin._id);
  
  // 로그인 토큰 생성 (간단한 JWT 시뮬레이션)
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZWY1MjAxMWI0ZjhjYjA3OTVmZDFjNiIsInVzZXJUeXBlIjoiY2VudGVyQWRtaW4iLCJlbWFpbCI6ImNlbnRlckBzd2ltLmNvbSIsIm5hbWUiOiLslYTslYTslYTslYTslYTslYTslYTslYTslUIKitYyIsImNlbnRlcklkIjoiNjhmMTA5ODNjY2NhMjQ2NjkwNzhlMWI0IiwiaWF0IjoxNzM1MDA5MjAwLCJleHAiOjE3MzUwOTU2MDB9.test';
  
  // 강사 정보 수정 API 호출 테스트
  const updateData = {
    phone: '010-9999-8888',
    instructorInfo: {
      instructorLevel: 'master',
      maxStudents: 20,
      workSchedule: {
        daysOfWeek: [1, 2, 3, 4, 5],
        timeSlots: ['09:00-18:00']
      },
      salaryInfo: {
        type: 'monthly',
        amount: 4000000,
        currency: 'KRW',
        incentive: 15
      },
      memo: 'API 테스트 메모',
      hiredAt: new Date(),
      contractType: 'full-time',
      specialties: ['자유형', '배영', '접영'],
      certifications: ['수영지도사 1급', '생존수영지도사', '수상안전지도사']
    }
  };
  
  try {
    console.log('📤 API 호출 시작...');
    console.log('📋 업데이트 데이터:', JSON.stringify(updateData, null, 2));
    
    const response = await fetch(`http://localhost:5000/api/center-admin/instructors/${instructor._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('📡 응답 상태:', response.status);
    console.log('📡 응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.text();
    console.log('📡 응답 본문:', responseData);
    
    if (response.ok) {
      console.log('✅ API 호출 성공!');
    } else {
      console.log('❌ API 호출 실패!');
    }
    
  } catch (error) {
    console.error('❌ API 호출 오류:', error);
  }
  
  mongoose.disconnect();
}).catch(err => {
  console.error('❌ 연결 실패:', err);
  process.exit(1);
});


