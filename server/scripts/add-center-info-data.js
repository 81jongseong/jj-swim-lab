/**
 * 🏢 JJ Swim Lab - 센터 정보 데이터 추가 스크립트
 *
 * 📋 **스크립트 목적**
 * - JJ Swim Lab 센터의 상세 정보를 데이터베이스에 추가
 * - 센터 소개, 시설 정보, 운영 정책 등 포함
 * - 센터 관리자가 관리할 수 있는 실제 데이터 제공
 * 
 * 🔄 **주요 기능**
 * - 센터 기본 정보 추가
 * - 센터 소개 내용 추가
 * - 시설 및 편의시설 정보 추가
 * - 운영 시간 및 정책 추가
 * - 연락처 및 위치 정보 추가
 * 
 * 🗄️ **데이터 연동**
 * - Center 모델과 연동
 * - 기존 센터 데이터 업데이트
 * - 센터 관리자 계정 연결
 * 
 * 🛠️ **필요한 설치 파일**
 * - Node.js
 * - MongoDB Driver
 * - Mongoose
 * - Dotenv
 * 
 * ⚠️ **개발 시 주의사항**
 * 1. 기존 센터 데이터 확인
 * 2. 데이터 중복 방지
 * 3. 이미지 URL 유효성 확인
 * 4. 연락처 정보 정확성 확인
 * 
 * 📅 **개발 히스토리**
 * - 2025-01-13: 초기 센터 정보 데이터 추가 스크립트 구현
 * - 2025-01-13: JJ Swim Lab 센터 상세 정보 추가
 * - 2025-01-13: 센터 소개 및 시설 정보 완성
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

// 모델 import
const Center = require('../dist/models/Center').default;
const User = require('../dist/models/User').default;

async function addCenterInfoData() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 성공');

    // 기존 센터 조회
    let center = await Center.findOne({});
    
    if (!center) {
      console.log('❌ 센터 정보가 없습니다. 먼저 센터를 생성해주세요.');
      return;
    }

    console.log(`📋 기존 센터 발견: ${center.name}`);

    // JJ Swim Lab 센터 상세 정보
    const centerInfoData = {
      // 기본 정보
      name: 'JJ Swim Lab',
      address: '서울시 강남구 테헤란로 123, JJ빌딩 3층',
      phone: '02-1234-5678',
      email: 'info@jjswim.com',
      website: 'https://jjswim.com',
      
      // 운영 시간
      operatingHours: {
        weekdays: {
          open: '06:00',
          close: '22:00'
        },
        weekends: {
          open: '08:00',
          close: '20:00'
        },
        holidays: {
          open: '09:00',
          close: '18:00'
        }
      },

      // 시설 정보 (문자열 배열로 변경)
      facilities: [
        '메인 수영장 (올림픽 규격 50m)',
        '레슨 수영장 (교육용 25m)',
        '어린이 수영장 (어린이 전용)',
        '샤워실 (남녀 분리)',
        '사우나 (남녀 분리)',
        '락커룸 (개인 락커)',
        '휴게실',
        '카페테리아',
        '프로샵',
        '주차장 (지하 2층)',
        '엘리베이터',
        '에스컬레이터',
        '휠체어 접근 가능',
        '최신 정수 시스템',
        '수온 자동 조절 시스템',
        '수질 모니터링 시스템',
        '안전 장비 (구명봉, 구명조끼)',
        '응급처치 키트',
        '수영 보조 도구',
        '타이머 및 계시기',
        '음향 시스템'
      ],

      // 편의시설
      amenities: [
        '무료 WiFi',
        '주차장 (2시간 무료)',
        '샤워 용품 대여',
        '타월 대여',
        '헤어드라이어',
        '체중계',
        '의자 및 테이블',
        '자판기',
        '음료 판매',
        '수영 용품 판매'
      ],

      // 이미지 URL (임시)
      images: [
        '/images/center/main-pool.jpg',
        '/images/center/lesson-pool.jpg',
        '/images/center/kids-pool.jpg',
        '/images/center/lobby.jpg',
        '/images/center/shower-room.jpg',
        '/images/center/sauna.jpg',
        '/images/center/locker-room.jpg',
        '/images/center/cafeteria.jpg'
      ],

      // 상세 설명
      description: 'JJ Swim Lab은 최첨단 AI 기술과 전문 수영 교육을 결합한 프리미엄 수영 교육 센터입니다. 개인 맞춤형 교육과 체계적인 진도 관리로 모든 연령대의 수영 실력 향상을 도와드립니다.',

      // 연락처 정보
      contactInfo: {
        phone: '02-1234-5678',
        email: 'info@jjswim.com',
        website: 'https://jjswim.com',
        address: '서울시 강남구 테헤란로 123, JJ빌딩 3층',
        postalCode: '06292',
        fax: '02-1234-5679',
        emergencyContact: '010-1234-5678',
        socialMedia: {
          facebook: 'https://facebook.com/jjswimlab',
          instagram: 'https://instagram.com/jjswimlab',
          youtube: 'https://youtube.com/jjswimlab',
          kakao: 'https://pf.kakao.com/_jjswimlab'
        }
      },

      // 위치 정보
      location: {
        latitude: 37.5665,
        longitude: 126.9780,
        address: '서울시 강남구 테헤란로 123, JJ빌딩 3층',
        directions: {
          subway: '2호선 강남역 3번 출구에서 도보 5분',
          bus: '강남역 정류장에서 하차 후 도보 5분',
          parking: '지하 2층 주차장 이용 (2시간 무료)',
          accessibility: '휠체어 접근 가능, 엘리베이터 이용'
        }
      },

      // 수용 인원 (숫자로 변경)
      capacity: 200,

      // 운영 정책
      policies: {
        membership: {
          required: false,
          benefits: [
            '수강료 10% 할인',
            '주차 2시간 무료',
            '샤워 용품 무료 제공',
            '사우나 이용 가능',
            '우선 예약권'
          ]
        },
        ageRestrictions: {
          children: '만 4세 이상',
          adults: '제한 없음',
          seniors: '65세 이상 특별 요금'
        },
        dressCode: [
          '수영복 착용 필수',
          '수영모 착용 권장',
          '샤워 후 입장',
          '화장실 사용 후 샤워'
        ],
        safetyRules: [
          '수영 전 반드시 샤워',
          '수영장 내에서 뛰지 않기',
          '음식물 반입 금지',
          '구급상자 및 구명장비 위치 확인',
          '응급상황 시 즉시 직원 호출',
          '개인 소지품은 락커에 보관'
        ],
        cancellation: {
          policy: '이용 24시간 전까지 100% 환불, 이후 50% 환불',
          notice: '취소 시 사전 연락 필수'
        }
      },

      // 센터 소개 (상세)
      introduction: {
        shortDescription: 'AI 기반 개인 맞춤형 수영 교육 센터',
        fullDescription: 'JJ Swim Lab은 최첨단 AI 기술을 활용한 개인 맞춤형 수영 교육을 제공하는 프리미엄 수영 센터입니다. 전문 강사진과 첨단 시설을 통해 모든 연령대의 수영 실력 향상을 도와드립니다.',
        
        features: [
          'AI 기반 개인 맞춤형 강습법',
          '실시간 자세 분석 및 피드백',
          '체계적인 진도 관리 시스템',
          '전문 인증 강사진',
          '최신 수영 시설 및 장비',
          '안전한 수영 환경',
          '다양한 연령대별 프로그램',
          '편리한 예약 및 결제 시스템'
        ],

        certifications: [
          '국제 수영 연맹(FINA) 인증',
          '대한수영연맹(KSA) 인증',
          '생활체육지도자 자격증',
          '수상안전지도사 자격증',
          '응급처치 자격증'
        ],

        achievements: [
          '2024년 서울시 우수 수영 교육기관 선정',
          '2023년 대한수영연맹 우수 센터 인증',
          '2022년 고객만족도 1위 수상',
          '2021년 안전교육 우수기관 표창'
        ],

        specialPrograms: [
          '어린이 수영 기초반',
          '청소년 수영 심화반',
          '성인 수영 초급반',
          '수영 경기 선수반',
          '수상 안전 교육',
          '수영 강사 자격증 과정',
          '특별 요가 수영',
          '수영 재활 프로그램'
        ],

        targetAudience: [
          '4세 이상 어린이',
          '청소년 및 학생',
          '성인 초보자',
          '수영 경기 선수',
          '수영 강사 지망생',
          '수영 재활 환자'
        ],

        philosophy: 'JJ Swim Lab은 "모든 사람이 안전하고 즐겁게 수영할 수 있는 환경"을 만들기 위해 최선을 다합니다. AI 기술과 전문 지식을 결합하여 개인별 맞춤형 교육을 제공하며, 수영을 통해 건강한 삶을 영위할 수 있도록 돕습니다.',

        history: 'JJ Swim Lab은 2020년 설립되어 4년간 1,000명 이상의 수강생을 배출한 검증된 수영 교육 센터입니다. 지속적인 시설 개선과 강사 교육을 통해 고품질의 수영 교육 서비스를 제공하고 있습니다.',

        staff: [
          {
            name: '김수영',
            position: '센터장',
            experience: '15년',
            certifications: ['국가대표 수영 선수', '수영 지도자 1급'],
            photo: '/images/staff/center-director.jpg'
          },
          {
            name: '이영수',
            position: '수석 강사',
            experience: '12년',
            certifications: ['생활체육지도자 1급', '수상안전지도사'],
            photo: '/images/staff/head-instructor.jpg'
          },
          {
            name: '박물수',
            position: '어린이 전문 강사',
            experience: '8년',
            certifications: ['유아체육지도자', '수영 지도자 2급'],
            photo: '/images/staff/kids-instructor.jpg'
          }
        ],

        contactInfo: {
          website: 'https://jjswim.com',
          socialMedia: {
            facebook: 'https://facebook.com/jjswimlab',
            instagram: 'https://instagram.com/jjswimlab',
            youtube: 'https://youtube.com/jjswimlab',
            kakao: 'https://pf.kakao.com/_jjswimlab'
          },
          parkingInfo: '지하 2층 주차장 이용 (2시간 무료, 이후 시간당 1,000원)',
          publicTransport: '2호선 강남역 3번 출구에서 도보 5분'
        },

        pricing: {
          membershipFees: [
            {
              type: '일반 회원권',
              price: 150000,
              duration: '1개월',
              description: '기본 수영장 이용 가능'
            },
            {
              type: '프리미엄 회원권',
              price: 250000,
              duration: '1개월',
              description: '수영장 + 사우나 이용 가능'
            },
            {
              type: '가족 회원권',
              price: 400000,
              duration: '1개월',
              description: '가족 4명까지 이용 가능'
            }
          ],
          lessonFees: [
            {
              type: '개인 레슨',
              price: 80000,
              duration: '1시간',
              description: '1:1 개인 맞춤 레슨'
            },
            {
              type: '그룹 레슨',
              price: 30000,
              duration: '1시간',
              description: '최대 8명 그룹 레슨'
            },
            {
              type: '어린이 레슨',
              price: 25000,
              duration: '45분',
              description: '4-12세 어린이 전용'
            }
          ]
        },

        visibility: {
          isPublic: true,
          showToMembers: true,
          showToInstructors: true,
          lastUpdated: new Date(),
          updatedBy: null // 센터 관리자 ID로 업데이트 예정
        }
      },

      // 업데이트 정보
      updatedAt: new Date(),
      updatedBy: null // 센터 관리자 ID로 업데이트 예정
    };

    // 센터 정보 업데이트
    console.log('📝 센터 정보 업데이트 중...');
    const updatedCenter = await Center.findByIdAndUpdate(
      center._id,
      centerInfoData,
      { new: true, runValidators: true }
    );

    if (updatedCenter) {
      console.log('✅ 센터 정보 업데이트 완료!');
      console.log(`📋 센터명: ${updatedCenter.name}`);
      console.log(`📍 주소: ${updatedCenter.address}`);
      console.log(`📞 전화: ${updatedCenter.phone}`);
      console.log(`🌐 웹사이트: ${updatedCenter.website}`);
      console.log(`🏊‍♂️ 시설 수: ${updatedCenter.facilities?.length || 0}개`);
      console.log(`🎯 편의시설: ${updatedCenter.amenities?.length || 0}개`);
      console.log(`👨‍🏫 강사진: ${updatedCenter.introduction?.staff?.length || 0}명`);
    }

    // 센터 관리자 계정 확인 및 연결
    const centerAdmin = await User.findOne({ userType: 'centerAdmin' });
    if (centerAdmin) {
      centerAdmin.centerId = updatedCenter._id;
      await centerAdmin.save();
      console.log(`👤 센터 관리자 연결 완료: ${centerAdmin.name}`);
    }

    console.log('🎉 센터 정보 데이터 추가 완료!');

  } catch (error) {
    console.error('❌ 센터 정보 데이터 추가 오류:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB 연결 종료');
  }
}

// 스크립트 실행
addCenterInfoData();
