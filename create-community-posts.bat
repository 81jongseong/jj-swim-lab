@echo off
echo 커뮤니티 샘플 데이터 생성 중...
echo.
echo 최고 관리자로 로그인 후 토큰을 입력하세요.
echo 브라우저 콘솔(F12)에서: localStorage.getItem('token')
echo.
set /p TOKEN="토큰 입력: "

curl -X POST "http://localhost:5000/api/community/posts" ^
  -H "Authorization: Bearer %TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"💡 자유형 호흡법 완전 정복 가이드\",\"content\":\"자유형 호흡법을 마스터하는 단계별 가이드입니다.\\n\\n1️⃣ 기본 자세: 머리는 물속에, 시선은 바닥\\n2️⃣ 호흡 타이밍: 팔이 물에서 나올 때 고개 돌리기\\n3️⃣ 연습 방법: 킥보드로 호흡 연습\",\"category\":\"tip\"}"

echo.
echo ✅ 샘플 데이터 생성 완료!
pause

