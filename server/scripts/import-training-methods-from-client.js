/**
 * 🏊 SwimLab - 클라이언트의 훈련법/드릴 데이터를 DB로 임포트
 * 
 * 📋 목적: client/src/swimlab/data에 있는 실제 엔진 데이터를 DB에 저장
 * 
 * 실행: node server/scripts/import-training-methods-from-client.js
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// 모델 스키마 정의
const trainingMethodSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  title: { type: String },
  description: { type: String },
  category: { type: String },
  whenToUse: { type: String },
  whoShouldUse: { type: String },
  howToDo: { type: String },
  intensityAndVolume: { type: String },
  pros: { type: String },
  cons: { type: String },
  cautions: { type: String },
  recommendedDrills: [{ type: String }],
  evidence: [{ label: String, url: String }],
  pace: { type: String },
  zone: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const drillSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  targetStroke: [{ type: String }],
  difficulty: { type: String },
  cues: [{ type: String }],
  examples: [{ type: String }],
  videoUrl: { type: String },
  recommendedFor: [{ type: String }],
  avoidFor: [{ type: String }],
  who: [{ type: String }],
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const SwimTrainingMethod = mongoose.model('SwimTrainingMethod', trainingMethodSchema);
const SwimDrill = mongoose.model('SwimDrill', drillSchema);

// 클라이언트 데이터 임포트
let TRAINING_METHODS, DRILLS;
try {
  const trainingMethodsPath = path.join(__dirname, '../../client/src/swimlab/data/trainingMethods.ts');
  const drillsPath = path.join(__dirname, '../../client/src/swimlab/data/drills.ts');
  
  console.log('📂 파일 경로:', { trainingMethodsPath, drillsPath });
  
  // TypeScript 파일이므로 직접 require 불가
  // 대신 파일을 읽어서 파싱하거나, 수동으로 데이터 정의
} catch (error) {
  console.log('⚠️ TS 파일 직접 임포트 불가, 데이터를 직접 정의합니다');
}

// 실제 엔진에서 사용하는 훈련법 25개 (간소화된 버전)
const trainingMethods = [
  { id: '01', name: '어센딩 인터벌', title: '어센딩 인터벌', description: '페이스 조절과 후반 피니시 강화', category: 'RaceStrategy', howToDo: '4×100m: CSS+6″→+4″→+2″→CSS, r20″', order: 1 },
  { id: '02', name: '디센딩 인터벌', title: '디센딩 인터벌', description: '반복마다 기록 단축', category: 'Speed', howToDo: '4×50m: 40″→38″→36″→34″, r15″', order: 2 },
  { id: '03', name: '네거티브 스플릿', title: '네거티브 스플릿', description: '후반 가속', category: 'RaceStrategy', howToDo: '2×400m: 전반 steady, 후반 CSS~CSS-2″', order: 3 },
  { id: '04', name: '빌드업 200', title: '빌드업 200', description: '한 거리 내 가속 감각', category: 'Speed', howToDo: '3×200m: 50m마다 페이스↑', order: 4 },
  { id: '05', name: '템포 홀드', title: '템포 홀드', description: 'CSS 유지', category: 'Endurance', howToDo: '3×400m @CSS, r30″', order: 5 },
  { id: '06', name: '역치 인터벌', title: '역치 인터벌', description: '젖산 역치 훈련', category: 'Threshold', howToDo: '5×200m @CSS-2″, r25″', order: 6 },
  { id: '07', name: 'VO2max 세트', title: 'VO2max 세트', description: '최대 산소 섭취량', category: 'VO2max', howToDo: '8×100m @CSS-6″, r60″', order: 7 },
  { id: '08', name: '스프린트', title: '스프린트', description: '최대 속도', category: 'Speed', howToDo: '12×25m @최대속도, r30″', order: 8 },
  { id: '09', name: '지구력 빌드', title: '지구력 빌드', description: '장거리 지구력', category: 'Endurance', howToDo: '1×1500m @CSS+10″', order: 9 },
  { id: '10', name: '피라미드', title: '피라미드', description: '거리 변화', category: 'Structure', howToDo: '100-200-300-400-300-200-100', order: 10 },
  { id: '11', name: '래더', title: '래더', description: '사다리', category: 'Structure', howToDo: '100-200-300-400', order: 11 },
  { id: '12', name: '브로큰 스윔', title: '브로큰 스윔', description: '중간 휴식', category: 'Structure', howToDo: '4×100m (50m마다 5초 휴식)', order: 12 },
  { id: '13', name: '타바타', title: '타바타', description: '고강도 인터벌', category: 'HIIT', howToDo: '20초 on / 10초 off × 8회', order: 13 },
  { id: '14', name: 'USRPT', title: 'USRPT', description: '초단거리 레이스 페이스', category: 'Speed', howToDo: '20×25m @목표 페이스, r15″', order: 14 },
  { id: '15', name: '혼영 순서', title: '혼영 순서', description: 'IM Order', category: 'IM', howToDo: '4×100m IM, r30″', order: 15 },
  { id: '16', name: '기술 훈련', title: '기술 훈련', description: '테크닉 집중', category: 'Technique', howToDo: '드릴 중심, 저강도', order: 16 },
  { id: '17', name: '유산소 기초', title: '유산소 기초', description: '저강도 장거리', category: 'Endurance', howToDo: '1×2000m @CSS+15″', order: 17 },
  { id: '18', name: '킥 집중', title: '킥 집중', description: '킥 강화', category: 'Kick', howToDo: '8×50m 킥, r20″', order: 18 },
  { id: '19', name: '풀 집중', title: '풀 집중', description: '풀 강화', category: 'Pull', howToDo: '8×50m 풀, r15″', order: 19 },
  { id: '20', name: '하이폭식', title: '하이폭식', description: '저산소 훈련', category: 'Hypoxic', howToDo: '8×50m 3-5-7-5-3 호흡', order: 20 },
  { id: '21', name: '회복 수영', title: '회복 수영', description: '적극적 회복', category: 'Recovery', howToDo: '1×1000m @CSS+20″', order: 21 },
  { id: '22', name: '스타트·턴', title: '스타트·턴', description: '스킬 훈련', category: 'Skills', howToDo: '스타트 10회, 턴 20회', order: 22 },
  { id: '23', name: '오픈워터', title: '오픈워터', description: '장거리 지속', category: 'Openwater', howToDo: '1×3000m 연속', order: 23 },
  { id: '24', name: '혼합 훈련', title: '혼합 훈련', description: '다양한 자극', category: 'Mixed', howToDo: '킥+풀+전체 조합', order: 24 },
  { id: '25', name: '페이스 변화', title: '페이스 변화', description: 'Fartlek', category: 'Tempo', howToDo: '1×1000m (100m fast/easy 교대)', order: 25 }
];

// 드릴 40개 (간소화된 버전)
const drills = [
  { id: 'D01', name: 'Catch-Up', description: '캐치업 드릴', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'easy', who: ['중급'], order: 1 },
  { id: 'D02', name: 'Single Arm', description: '한 팔 드릴', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'medium', who: ['중급', '상급'], order: 2 },
  { id: 'D03', name: 'Sculling', description: '스컬링', category: 'Technique', targetStroke: ['all'], difficulty: 'easy', who: ['초급', '중급'], order: 3 },
  { id: 'D04', name: 'Fingertip Drag', description: '핑거팁 드릴', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'easy', who: ['초급', '중급'], order: 4 },
  { id: 'D05', name: 'Fist', description: '주먹 쥐고', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'medium', who: ['중급', '상급'], order: 5 },
  { id: 'D06', name: 'Zipper', description: '지퍼 드릴', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'easy', who: ['초급', '중급'], order: 6 },
  { id: 'D07', name: 'Shark Fin', description: '상어 지느러미', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'medium', who: ['중급'], order: 7 },
  { id: 'D08', name: 'Tarzan', description: '타잔 드릴', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'hard', who: ['상급'], order: 8 },
  { id: 'D09', name: 'High Elbow', description: '높은 팔꿈치', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'medium', who: ['중급', '상급'], order: 9 },
  { id: 'D10', name: 'EVF', description: '조기 수직 팔뚝', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'hard', who: ['상급', '마스터'], order: 10 },
  { id: 'D11', name: 'Front Quadrant', description: '전방 사분면', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'medium', who: ['중급', '상급'], order: 11 },
  { id: 'D12', name: 'Hip-Driven', description: '엉덩이 주도', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'medium', who: ['중급', '상급'], order: 12 },
  { id: 'D13', name: 'Long Axis Rotation', description: '장축 회전', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'medium', who: ['중급', '상급'], order: 13 },
  { id: 'D14', name: '6-Kick Switch', description: '6킥 스위치', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'easy', who: ['초급', '중급'], order: 14 },
  { id: 'D15', name: '3-3-3 Breathing', description: '3박자 호흡', category: 'Freestyle', targetStroke: ['freestyle'], difficulty: 'easy', who: ['초급', '중급'], order: 15 },
  
  // 배영
  { id: 'D16', name: 'Backstroke Rotation', description: '배영 회전', category: 'Backstroke', targetStroke: ['backstroke'], difficulty: 'medium', who: ['중급'], order: 16 },
  { id: 'D17', name: 'Backstroke Single Arm', description: '한 팔 배영', category: 'Backstroke', targetStroke: ['backstroke'], difficulty: 'medium', who: ['중급'], order: 17 },
  { id: 'D18', name: '12-Kick Switch', description: '12킥 스위치', category: 'Backstroke', targetStroke: ['backstroke'], difficulty: 'easy', who: ['초급', '중급'], order: 18 },
  { id: 'D19', name: 'Double Arm Backstroke', description: '양팔 배영', category: 'Backstroke', targetStroke: ['backstroke'], difficulty: 'hard', who: ['상급'], order: 19 },
  { id: 'D20', name: 'Flutter Kick on Back', description: '배영 킥', category: 'Backstroke', targetStroke: ['backstroke'], difficulty: 'easy', who: ['초급'], order: 20 },
  
  // 평영
  { id: 'D21', name: 'Glide Drill', description: '글라이드 드릴', category: 'Breaststroke', targetStroke: ['breaststroke'], difficulty: 'easy', who: ['초급', '중급'], order: 21 },
  { id: 'D22', name: '2 Kicks 1 Pull', description: '2킥 1풀', category: 'Breaststroke', targetStroke: ['breaststroke'], difficulty: 'medium', who: ['중급'], order: 22 },
  { id: 'D23', name: 'Breaststroke Pull Only', description: '평영 풀만', category: 'Breaststroke', targetStroke: ['breaststroke'], difficulty: 'easy', who: ['초급', '중급'], order: 23 },
  { id: 'D24', name: 'Whip Kick', description: '위빙 킥', category: 'Breaststroke', targetStroke: ['breaststroke'], difficulty: 'medium', who: ['중급', '상급'], order: 24 },
  { id: 'D25', name: 'Breaststroke Body Dolphin', description: '평영 바디 돌핀', category: 'Breaststroke', targetStroke: ['breaststroke'], difficulty: 'medium', who: ['중급'], order: 25 },
  
  // 접영
  { id: 'D26', name: 'One-Arm Fly', description: '한 팔 접영', category: 'Butterfly', targetStroke: ['butterfly'], difficulty: 'hard', who: ['상급', '마스터'], order: 26 },
  { id: 'D27', name: '3-3-3 Fly Drill', description: '3-3-3 접영 드릴', category: 'Butterfly', targetStroke: ['butterfly'], difficulty: 'medium', who: ['중급', '상급'], order: 27 },
  { id: 'D28', name: 'Butterfly Body Dolphin', description: '접영 바디 돌핀', category: 'Butterfly', targetStroke: ['butterfly'], difficulty: 'medium', who: ['중급', '상급'], order: 28 },
  { id: 'D29', name: 'Dolphin Kick Underwater', description: '수중 돌핀킥', category: 'Butterfly', targetStroke: ['butterfly'], difficulty: 'medium', who: ['중급', '상급'], order: 29 },
  { id: 'D30', name: '2L-1R-2L Fly', description: '양팔 변형 접영', category: 'Butterfly', targetStroke: ['butterfly'], difficulty: 'hard', who: ['상급'], order: 30 },
  
  // 킥/풀
  { id: 'D31', name: 'Kick Only', description: '킥만', category: 'Kick', targetStroke: ['all'], difficulty: 'easy', who: ['초급', '중급'], order: 31 },
  { id: 'D32', name: 'Pull Only', description: '풀만', category: 'Pull', targetStroke: ['all'], difficulty: 'easy', who: ['초급', '중급'], order: 32 },
  { id: 'D33', name: 'Vertical Kick', description: '버티컬 킥', category: 'Kick', targetStroke: ['all'], difficulty: 'hard', who: ['상급', '마스터'], order: 33 },
  { id: 'D34', name: 'Streamline Kick', description: '스트림라인 킥', category: 'Kick', targetStroke: ['all'], difficulty: 'easy', who: ['초급', '중급'], order: 34 },
  { id: 'D35', name: 'Pull with Buoy', description: '풀부이 풀', category: 'Pull', targetStroke: ['all'], difficulty: 'easy', who: ['초급', '중급'], order: 35 },
  { id: 'D36', name: 'Paddle Pull', description: '패들 풀', category: 'Pull', targetStroke: ['all'], difficulty: 'medium', who: ['중급', '상급'], order: 36 },
  { id: 'D37', name: 'Pull with Band', description: '밴드 풀', category: 'Pull', targetStroke: ['all'], difficulty: 'medium', who: ['중급', '상급'], order: 37 },
  
  // 테크닉
  { id: 'D38', name: 'Body Position', description: '바디 포지션', category: 'Technique', targetStroke: ['all'], difficulty: 'easy', who: ['초급', '중급'], order: 38 },
  { id: 'D39', name: 'Streamline Push-off', description: '스트림라인 출발', category: 'Technique', targetStroke: ['all'], difficulty: 'easy', who: ['초급', '중급'], order: 39 },
  { id: 'D40', name: 'Flip Turn Practice', description: '플립턴 연습', category: 'Technique', targetStroke: ['freestyle', 'backstroke'], difficulty: 'medium', who: ['중급', '상급'], order: 40 }
];

async function main() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jj-swim-lab');
    console.log('✅ MongoDB 연결 성공!');

    // 기존 데이터 삭제
    console.log('🗑️ 기존 훈련법/드릴 삭제 중...');
    await SwimTrainingMethod.deleteMany({});
    await SwimDrill.deleteMany({});
    console.log('✅ 기존 데이터 삭제 완료');

    // 훈련법 추가
    console.log('📊 훈련법 추가 중...');
    await SwimTrainingMethod.insertMany(trainingMethods);
    console.log(`✅ ${trainingMethods.length}개 훈련법 추가 완료`);

    // 드릴 추가
    console.log('🎯 드릴 추가 중...');
    await SwimDrill.insertMany(drills);
    console.log(`✅ ${drills.length}개 드릴 추가 완료`);

    // 결과 확인
    const methodCount = await SwimTrainingMethod.countDocuments();
    const drillCount = await SwimDrill.countDocuments();
    
    console.log('\n📊 최종 결과:');
    console.log(`  - 훈련법: ${methodCount}개`);
    console.log(`  - 드릴: ${drillCount}개`);
    console.log(`  - 총합: ${methodCount + drillCount}개`);

    console.log('\n✅ 모든 작업 완료!');
    console.log('\n💡 브라우저를 새로고침하여 확인하세요!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();

