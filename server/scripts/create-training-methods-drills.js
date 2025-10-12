/**
 * 🏊 SwimLab - 훈련법/드릴 샘플 데이터 생성
 * 
 * 📋 목적: 수영 훈련법과 드릴 초기 데이터 생성
 * 
 * 실행: node server/scripts/create-training-methods-drills.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// 모델 스키마 정의
const trainingMethodSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
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
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const SwimTrainingMethod = mongoose.model('SwimTrainingMethod', trainingMethodSchema);
const SwimDrill = mongoose.model('SwimDrill', drillSchema);

// 훈련법 데이터
const trainingMethods = [
  // 템포/강도
  { id: 'descending', name: 'Descending', description: '페이스 점진적 빨라짐', category: '템포', pace: 'CSS+0→-10', zone: 'Z3-Z4', order: 1 },
  { id: 'ascending', name: 'Ascending', description: '페이스 점진적 느려짐', category: '템포', pace: 'CSS-10→+0', zone: 'Z4-Z3', order: 2 },
  { id: 'build', name: 'Build', description: '구간별 속도 올리기', category: '템포', pace: 'CSS+5', zone: 'Z3', order: 3 },
  { id: 'negative_split', name: 'Negative Split', description: '후반 빠르게', category: '템포', pace: 'CSS+5→-5', zone: 'Z3-Z4', order: 4 },
  { id: 'even_pace', name: 'Even Pace', description: '일정한 페이스', category: '템포', pace: 'CSS+0', zone: 'Z3', order: 5 },
  { id: 'sprint', name: 'Sprint', description: '고강도 스프린트', category: '강도', pace: 'CSS-15', zone: 'Z5', order: 6 },
  { id: 'tempo', name: 'Tempo', description: '템포 훈련', category: '템포', pace: 'CSS-5', zone: 'Z4', order: 7 },
  { id: 'endurance', name: 'Endurance', description: '지구력', category: '지구력', pace: 'CSS+10', zone: 'Z2', order: 8 },
  { id: 'threshold', name: 'Threshold', description: '역치 훈련', category: '강도', pace: 'CSS-3', zone: 'Z4', order: 9 },
  { id: 'usrpt', name: 'USRPT', description: '초단거리 레이스 페이스', category: '강도', pace: 'CSS-12', zone: 'Z5', order: 10 },
  { id: 'broken_swim', name: 'Broken Swim', description: '중간 휴식', category: '구조', pace: 'CSS-5', zone: 'Z4', order: 11 },
  { id: 'pace_change', name: 'Pace Change', description: '페이스 변화', category: '템포', pace: 'CSS+5/-5', zone: 'Z3-Z4', order: 12 },
  
  // 거리/구조
  { id: 'pyramid', name: 'Pyramid', description: '거리 변화', category: '구조', pace: 'CSS+5', zone: 'Z3', order: 13 },
  { id: 'im_order', name: 'IM Order', description: '혼영 순서', category: '구조', pace: 'CSS+8', zone: 'Z3', order: 14 },
  { id: 'ladder', name: 'Ladder', description: '사다리', category: '구조', pace: 'CSS+5', zone: 'Z3', order: 15 },
  { id: 'reverse_ladder', name: 'Reverse Ladder', description: '역사다리', category: '구조', pace: 'CSS+5', zone: 'Z3', order: 16 },
  { id: 'christmas_tree', name: 'Christmas Tree', description: '크리스마스 트리', category: '구조', pace: 'CSS+7', zone: 'Z2-Z3', order: 17 },
  { id: 'tabata', name: 'Tabata', description: '타바타 인터벌', category: '강도', pace: '최대속도', zone: 'Z5', order: 18 },
  { id: 'fartlek', name: 'Fartlek', description: '속도 자유 변화', category: '템포', pace: '자유', zone: 'Z2-Z4', order: 19 },
  
  // 휴식/회복
  { id: 'active_recovery', name: 'Active Recovery', description: '적극적 회복', category: '회복', pace: 'CSS+30', zone: 'Z1', order: 20 },
  { id: 'sendoff', name: 'Sendoff', description: '출발 간격 훈련', category: '구조', pace: 'CSS+0', zone: 'Z3', order: 21 },
  { id: 'descending_rest', name: 'Descending Rest', description: '휴식 점진적 감소', category: '강도', pace: 'CSS+0', zone: 'Z3', order: 22 },
  { id: 'no_breath', name: 'No-Breath', description: '무호흡 훈련', category: '강도', pace: 'CSS-5', zone: 'Z4', order: 23 },
  { id: 'hypoxic', name: 'Hypoxic', description: '저산소 훈련', category: '강도', pace: 'CSS+5', zone: 'Z3', order: 24 },
  { id: 'broken_100', name: 'Broken 100', description: '100m를 50m×2로 중간 휴식', category: '구조', pace: 'CSS-3', zone: 'Z4', order: 25 }
];

// 드릴 데이터
const drills = [
  // 기본 드릴
  { id: 'catch_up', name: 'Catch-Up', description: '캐치업 드릴', category: '기술', targetStroke: ['freestyle'], difficulty: 'easy', order: 1 },
  { id: 'single_arm', name: 'Single Arm', description: '한 팔 드릴', category: '기술', targetStroke: ['freestyle', 'backstroke'], difficulty: 'medium', order: 2 },
  { id: 'sculling', name: 'Sculling', description: '스컬링 드릴', category: '기술', targetStroke: ['all'], difficulty: 'easy', order: 3 },
  { id: 'fingertip_drag', name: 'Fingertip Drag', description: '핑거팁 드릴', category: '기술', targetStroke: ['freestyle'], difficulty: 'easy', order: 4 },
  { id: 'fist', name: 'Fist', description: '주먹 쥐고 드릴', category: '기술', targetStroke: ['freestyle'], difficulty: 'medium', order: 5 },
  { id: 'zipper', name: 'Zipper', description: '지퍼 드릴', category: '기술', targetStroke: ['freestyle'], difficulty: 'easy', order: 6 },
  { id: 'shark_fin', name: 'Shark Fin', description: '상어 지느러미', category: '기술', targetStroke: ['freestyle'], difficulty: 'medium', order: 7 },
  { id: 'tarzan', name: 'Tarzan', description: '타잔 드릴', category: '기술', targetStroke: ['freestyle'], difficulty: 'hard', order: 8 },
  
  // 킥/풀
  { id: 'kick_only', name: 'Kick Only', description: '킥만', category: '킥', targetStroke: ['all'], difficulty: 'easy', order: 9 },
  { id: 'pull_only', name: 'Pull Only', description: '풀만', category: '풀', targetStroke: ['all'], difficulty: 'easy', order: 10 },
  { id: 'six_kick_switch', name: '6-Kick Switch', description: '6킥 스위치', category: '기술', targetStroke: ['freestyle'], difficulty: 'medium', order: 11 },
  { id: 'streamline_kick', name: 'Streamline Kick', description: '스트림라인 킥', category: '킥', targetStroke: ['all'], difficulty: 'easy', order: 12 },
  { id: 'vertical_kick', name: 'Vertical Kick', description: '버티컬 킥', category: '킥', targetStroke: ['all'], difficulty: 'hard', order: 13 },
  { id: 'flutter_kick', name: 'Flutter Kick', description: '플러터 킥', category: '킥', targetStroke: ['freestyle', 'backstroke'], difficulty: 'easy', order: 14 },
  { id: 'dolphin_kick', name: 'Dolphin Kick', description: '돌핀 킥', category: '킥', targetStroke: ['butterfly'], difficulty: 'medium', order: 15 },
  { id: 'pull_buoy', name: 'Pull with Buoy', description: '풀부이 풀', category: '풀', targetStroke: ['all'], difficulty: 'easy', order: 16 },
  { id: 'paddle_pull', name: 'Paddle Pull', description: '패들 풀', category: '풀', targetStroke: ['all'], difficulty: 'medium', order: 17 },
  
  // 자유형
  { id: 'high_elbow', name: 'High Elbow', description: '높은 팔꿈치', category: '자유형', targetStroke: ['freestyle'], difficulty: 'medium', order: 18 },
  { id: 'evf', name: 'EVF', description: '조기 수직 팔뚝', category: '자유형', targetStroke: ['freestyle'], difficulty: 'hard', order: 19 },
  { id: 'front_quadrant', name: 'Front Quadrant', description: '전방 사분면', category: '자유형', targetStroke: ['freestyle'], difficulty: 'medium', order: 20 },
  { id: 'hip_driven', name: 'Hip-Driven', description: '엉덩이 주도', category: '자유형', targetStroke: ['freestyle'], difficulty: 'medium', order: 21 },
  
  // 배영
  { id: 'backstroke_rotation', name: 'Rotation Drill', description: '회전 드릴', category: '배영', targetStroke: ['backstroke'], difficulty: 'medium', order: 22 },
  { id: 'backstroke_single_arm', name: 'Single Arm Backstroke', description: '한 팔 배영', category: '배영', targetStroke: ['backstroke'], difficulty: 'medium', order: 23 },
  { id: 'twelve_kick_switch', name: '12-Kick Switch', description: '12킥 스위치', category: '배영', targetStroke: ['backstroke'], difficulty: 'easy', order: 24 },
  
  // 평영
  { id: 'breaststroke_glide', name: 'Glide Drill', description: '글라이드 드릴', category: '평영', targetStroke: ['breaststroke'], difficulty: 'easy', order: 25 },
  { id: 'two_kick_one_pull', name: '2 Kicks 1 Pull', description: '2킥 1풀', category: '평영', targetStroke: ['breaststroke'], difficulty: 'medium', order: 26 },
  { id: 'whip_kick', name: 'Whip Kick', description: '위빙 킥', category: '평영', targetStroke: ['breaststroke'], difficulty: 'medium', order: 27 },
  
  // 접영
  { id: 'one_arm_fly', name: 'One-Arm Fly', description: '한 팔 접영', category: '접영', targetStroke: ['butterfly'], difficulty: 'hard', order: 28 },
  { id: 'three_three_three', name: '3-3-3 Drill', description: '3-3-3 드릴', category: '접영', targetStroke: ['butterfly'], difficulty: 'medium', order: 29 },
  { id: 'body_dolphin', name: 'Body Dolphin', description: '바디 돌핀', category: '접영', targetStroke: ['butterfly', 'breaststroke'], difficulty: 'medium', order: 30 },
  
  // 테크닉
  { id: 'body_position', name: 'Body Position', description: '바디 포지션', category: '테크닉', targetStroke: ['all'], difficulty: 'easy', order: 31 },
  { id: 'head_position', name: 'Head Position', description: '머리 위치', category: '테크닉', targetStroke: ['all'], difficulty: 'easy', order: 32 },
  { id: 'breathing_control', name: 'Breathing Control', description: '호흡 조절', category: '테크닉', targetStroke: ['freestyle', 'butterfly'], difficulty: 'medium', order: 33 },
  { id: 'flip_turn', name: 'Flip Turn Practice', description: '플립턴 연습', category: '테크닉', targetStroke: ['freestyle', 'backstroke'], difficulty: 'medium', order: 34 },
  { id: 'streamline_pushoff', name: 'Streamline Push-off', description: '스트림라인 출발', category: '테크닉', targetStroke: ['all'], difficulty: 'easy', order: 35 },
  { id: 'underwater_streamline', name: 'Underwater Streamline', description: '수중 스트림라인', category: '테크닉', targetStroke: ['all'], difficulty: 'medium', order: 36 },
  { id: 'hip_rotation', name: 'Hip Rotation', description: '엉덩이 회전', category: '테크닉', targetStroke: ['freestyle'], difficulty: 'medium', order: 37 },
  { id: 'long_axis_rotation', name: 'Long Axis Rotation', description: '장축 회전', category: '자유형', targetStroke: ['freestyle'], difficulty: 'medium', order: 38 },
  { id: 'double_arm_backstroke', name: 'Double Arm Backstroke', description: '양팔 배영', category: '배영', targetStroke: ['backstroke'], difficulty: 'hard', order: 39 },
  { id: 'pull_with_band', name: 'Pull with Band', description: '밴드 풀', category: '풀', targetStroke: ['all'], difficulty: 'medium', order: 40 }
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
    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

main();

