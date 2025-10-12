@echo off
REM 한글 출력을 위한 Windows 터미널 설정 스크립트
REM JJ Swim Lab 프로젝트용

echo 한글 출력 설정을 적용합니다...

REM 코드페이지를 UTF-8로 설정
chcp 65001 >nul

REM PowerShell 인코딩 설정
powershell -Command "& {$OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8}"

echo.
echo ✅ 한글 출력 설정이 완료되었습니다!
echo 📝 이제 한글이 정상적으로 표시됩니다.
echo.
echo 테스트: 한글 출력 테스트 - 수영센터 관리 시스템
echo.

REM 사용자가 확인할 수 있도록 잠시 대기
pause











