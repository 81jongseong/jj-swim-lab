/**
 * 📊 JJ Swim Lab - API를 통한 샘플 데이터 추가 스크립트
 * MongoDB 연결 문제를 우회하여 서버 API를 통해 데이터 추가
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:5000';
const LOGIN_CREDENTIALS = [
  { userId: 'student1', password: '101010', userType: 'student' },
  { userId: 'instructor1', password: '101010', userType: 'instructor' },
  { userId: 'admin', password: '101010', userType: 'admin' }
];

async function addSampleDataViaAPI() {
  try {
    console.log('🚀 API를 통한 샘플 데이터 추가 시작...');

    for (const cred of LOGIN_CREDENTIALS) {
      console.log(`\n👤 ${cred.userId} (${cred.userType}) 로그인 중...`);
      
      try {
        // 로그인
        const loginResponse = await axios.post(`${SERVER_URL}/api/auth/login`, {
          userId: cred.userId,
          password: cred.password
        });

        if (!loginResponse.data.success) {
          console.log(`❌ ${cred.userId} 로그인 실패:`, loginResponse.data.message);
          continue;
        }

        const token = loginResponse.data.data.token;
        console.log(`✅ ${cred.userId} 로그인 성공`);

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // 스마트워치 샘플 데이터 추가 (학생만)
        if (cred.userType === 'student') {
          console.log(`⌚ ${cred.userId} 스마트워치 데이터 추가 중...`);
          
          const devices = [
            { type: 'apple_watch', model: 'Apple Watch Series 9', version: '10.1' },
            { type: 'samsung_galaxy_watch', model: 'Galaxy Watch6', version: '5.0.0.2' },
            { type: 'garmin', model: 'Garmin Swim 2', version: '4.20' }
          ];

          for (let i = 0; i < 3; i++) {
            const device = devices[i];
            const sessionDate = new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000);
            
            const smartWatchData = {
              sessionId: `${device.type}_${cred.userId}_${Date.now()}_${i}`,
              deviceInfo: {
                deviceType: device.type,
                deviceModel: device.model,
                firmwareVersion: device.version
              },
              sessionInfo: {
                startTime: sessionDate.toISOString(),
                endTime: new Date(sessionDate.getTime() + (30 + Math.random() * 30) * 60 * 1000).toISOString(),
                duration: 30 + Math.floor(Math.random() * 30),
                technique: ['freestyle', 'backstroke', 'breaststroke', 'butterfly'][Math.floor(Math.random() * 4)],
                poolLength: 25,
                totalDistance: 600 + Math.floor(Math.random() * 600)
              },
              performanceMetrics: {
                averageSpeed: 0.8 + Math.random() * 0.6,
                maxSpeed: 1.0 + Math.random() * 0.8,
                averageHeartRate: 130 + Math.floor(Math.random() * 30),
                maxHeartRate: 150 + Math.floor(Math.random() * 30),
                minHeartRate: 110 + Math.floor(Math.random() * 20),
                strokeCount: 500 + Math.floor(Math.random() * 500),
                strokeRate: 15 + Math.floor(Math.random() * 8),
                caloriesBurned: 200 + Math.floor(Math.random() * 200),
                efficiency: 70 + Math.floor(Math.random() * 30)
              },
              detailedData: {
                heartRateData: Array.from({length: 5}, (_, idx) => ({
                  timestamp: new Date(sessionDate.getTime() + idx * 6 * 60 * 1000).toISOString(),
                  heartRate: 130 + Math.floor(Math.random() * 30)
                })),
                strokeData: Array.from({length: 3}, (_, idx) => ({
                  timestamp: new Date(sessionDate.getTime() + idx * 10 * 60 * 1000).toISOString(),
                  strokeType: ['freestyle', 'backstroke'][Math.floor(Math.random() * 2)],
                  strokeCount: 20 + Math.floor(Math.random() * 10),
                  strokeRate: 15 + Math.floor(Math.random() * 5)
                })),
                speedData: Array.from({length: 4}, (_, idx) => ({
                  timestamp: new Date(sessionDate.getTime() + idx * 8 * 60 * 1000).toISOString(),
                  speed: 0.8 + Math.random() * 0.6,
                  distance: 100 + Math.floor(Math.random() * 100)
                })),
                restPeriods: [{
                  startTime: new Date(sessionDate.getTime() + 15 * 60 * 1000).toISOString(),
                  endTime: new Date(sessionDate.getTime() + 17 * 60 * 1000).toISOString(),
                  duration: 2
                }]
              }
            };

            try {
              const syncResponse = await axios.post(`${SERVER_URL}/api/smartwatch/sync`, smartWatchData, { headers });
              if (syncResponse.data.success) {
                console.log(`  ✅ ${device.model} 데이터 추가 완료`);
              } else {
                console.log(`  ❌ ${device.model} 데이터 추가 실패:`, syncResponse.data.message);
              }
            } catch (syncError) {
              console.log(`  ❌ ${device.model} 데이터 추가 오류:`, syncError.response?.data?.message || syncError.message);
            }
          }
        }

        console.log(`✅ ${cred.userId} 샘플 데이터 추가 완료`);

      } catch (loginError) {
        console.log(`❌ ${cred.userId} 처리 오류:`, loginError.response?.data?.message || loginError.message);
      }
    }

    console.log('\n🎉 모든 사용자의 샘플 데이터 추가 완료!');
    console.log('\n🎯 테스트 방법:');
    console.log('1. student1 / 101010 로그인');
    console.log('2. 건강 페이지 (/health) 접속');
    console.log('3. 운동 기록 탭에서 스마트워치 데이터 확인');

  } catch (error) {
    console.error('❌ 샘플 데이터 추가 실패:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  addSampleDataViaAPI();
}

module.exports = { addSampleDataViaAPI };
