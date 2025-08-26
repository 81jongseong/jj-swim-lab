@echo off
chcp 65001 >nul
title JJ Swim Lab - UI 컴포넌트 import 자동 수정

echo 🔧 UI 컴포넌트 import 자동 수정 시작...
echo ================================================
echo.

:: 프로젝트 루트 디렉토리로 이동 (사용자명 독립적)
cd /d "%~dp0"
echo 📁 작업 디렉토리: %CD%
echo.

:: 수정할 파일들
set "files=client\app\localization\page.tsx client\app\membership\page.tsx client\app\notifications\page.tsx client\app\personalized-dashboard\page.tsx client\app\user-role-integration\page.tsx client\components\PerformanceOptimizer.tsx"

:: 수정할 import 패턴들 (배치 파일용으로 단순화)
echo 📝 import 문법 수정 중...
echo.

set totalFiles=0
set modifiedFiles=0

:: 각 파일 처리
for %%f in (%files%) do (
    if exist "%%f" (
        set /a totalFiles+=1
        echo 📝 처리 중: %%f
        
        :: 임시 파일 생성
        set "tempFile=%%f.tmp"
        
        :: 파일 내용을 임시로 복사하고 수정
        copy "%%f" "!tempFile!" >nul
        
        :: import 문법 수정 (간단한 패턴)
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Button \} from ''@/components/ui/Button'';', 'import Button from ''@/components/ui/Button'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Card, CardContent, CardHeader, CardTitle \} from ''@/components/ui/Card'';', 'import Card, { CardContent, CardHeader, CardTitle } from ''@/components/ui/Card'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Badge \} from ''@/components/ui/Badge'';', 'import Badge from ''@/components/ui/Badge'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Input \} from ''@/components/ui/Input'';', 'import Input from ''@/components/ui/Input'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Label \} from ''@/components/ui/Label'';', 'import Label from ''@/components/ui/Label'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Select \} from ''@/components/ui/Select'';', 'import Select from ''@/components/ui/Select'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Tabs, TabsContent, TabsList, TabsTrigger \} from ''@/components/ui/Tabs'';', 'import Tabs, { TabsContent, TabsList, TabsTrigger } from ''@/components/ui/Tabs'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Switch \} from ''@/components/ui/Switch'';', 'import Switch from ''@/components/ui/Switch'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Slider \} from ''@/components/ui/Slider'';', 'import Slider from ''@/components/ui/Slider'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Textarea \} from ''@/components/ui/Textarea'';', 'import Textarea from ''@/components/ui/Textarea'';' | Set-Content '!tempFile!' -Encoding UTF8"
        powershell -Command "(Get-Content '!tempFile!') -replace 'import \{ Progress \} from ''@/components/ui/Progress'';', 'import Progress from ''@/components/ui/Progress'';' | Set-Content '!tempFile!' -Encoding UTF8"
        
        :: 원본 파일과 비교하여 변경사항 확인
        fc "%%f" "!tempFile!" >nul 2>&1
        if errorlevel 1 (
            :: 변경사항이 있으면 원본 파일 교체
            move "!tempFile!" "%%f" >nul
            set /a modifiedFiles+=1
            echo ✅ 수정 완료: %%f
        ) else (
            :: 변경사항이 없으면 임시 파일 삭제
            del "!tempFile!" >nul
            echo ℹ️ 변경사항 없음: %%f
        )
        echo.
    ) else (
        echo ⚠️ 파일을 찾을 수 없음: %%f
        echo.
    )
)

:: 완료 메시지
echo 🎉 작업 완료!
echo ================================================
echo 📊 총 파일: %totalFiles%
echo 📝 수정된 파일: %modifiedFiles%
echo.
echo 💡 이제 'pnpm run build'를 실행해보세요!
echo.
pause
