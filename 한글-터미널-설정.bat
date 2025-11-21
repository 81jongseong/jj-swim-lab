@echo off
REM 한글 출력을 위한 Windows 터미널 설정 스크립트
REM JJ Swim Lab 프로젝트용

chcp 65001 >nul
title JJ Swim Lab - 한글 인코딩 설정
color 0B

echo ========================================
echo   JJ Swim Lab - 한글 인코딩 설정
echo ========================================
echo.

REM 현재 디렉토리로 이동
cd /d "%~dp0"

echo [1/3] 코드페이지를 UTF-8로 설정...
chcp 65001 >nul
echo [OK] 코드페이지: UTF-8
echo.

echo [2/3] Git 인코딩 설정...
git config --global core.quotepath false
git config --global gui.encoding utf-8
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
echo [OK] Git 인코딩 설정 완료
echo.

echo [3/3] PowerShell 인코딩 설정...
powershell -Command "& {$OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; $env:LESSCHARSET = 'utf-8'}"
echo [OK] PowerShell 인코딩 설정 완료
echo.

echo ========================================
echo   ✅ 한글 인코딩 설정 완료!
echo ========================================
echo.
echo 설정 내용:
echo   - Git: UTF-8 인코딩 활성화
echo   - 터미널: UTF-8 코드페이지
echo   - PowerShell: UTF-8 출력 인코딩
echo.
echo 테스트: git log --oneline -5
echo.
echo ⚠️  참고: 이미 저장된 커밋 메시지는 수정할 수 없습니다.
echo    앞으로의 커밋 메시지만 정상적으로 표시됩니다.
echo.
pause











