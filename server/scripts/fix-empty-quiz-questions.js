/**
 * 빈 문제를 가진 퀴즈 수정 스크립트
 * 
 * 문제: DB에 저장된 퀴즈 중 questions.question이 빈 문자열인 경우 수정 불가
 * 해결: 빈 문제를 제거하거나 유효성 검사
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');

async function fixEmptyQuestions() {
  try {
    console.log('🔗 MongoDB 연결 중...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB 연결 완료\n');

    const Quiz = mongoose.model('Quiz');

    console.log('🔍 문제가 있는 퀴즈 검색 중...\n');

    const allQuizzes = await Quiz.find({});
    console.log(`📊 총 ${allQuizzes.length}개 퀴즈 발견\n`);

    let fixedCount = 0;

    for (const quiz of allQuizzes) {
      let needsFix = false;
      
      // 빈 문제 찾기
      const validQuestions = quiz.questions.filter(q => {
        if (!q.question || !q.question.trim()) {
          console.log(`❌ [${quiz.title}] 빈 문제 발견: ${JSON.stringify(q)}`);
          needsFix = true;
          return false; // 제거
        }
        return true; // 유지
      });

      if (needsFix) {
        console.log(`🔧 [${quiz.title}] 수정 중... (${quiz.questions.length}개 → ${validQuestions.length}개)`);
        quiz.questions = validQuestions;
        await quiz.save();
        fixedCount++;
        console.log(`✅ [${quiz.title}] 수정 완료\n`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ 작업 완료!`);
    console.log(`   - 검사한 퀴즈: ${allQuizzes.length}개`);
    console.log(`   - 수정한 퀴즈: ${fixedCount}개`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    console.log('🔌 MongoDB 연결 종료');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

fixEmptyQuestions();

