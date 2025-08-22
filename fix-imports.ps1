# UI 컴포넌트 import 자동 수정 스크립트
# 모든 페이지에서 @/components/ui/ import를 직접 import로 변경

Write-Host "🔧 UI 컴포넌트 import 자동 수정 시작..." -ForegroundColor Green

# 수정할 파일들
$files = @(
    "client/app/localization/page.tsx",
    "client/app/membership/page.tsx", 
    "client/app/notifications/page.tsx",
    "client/app/personalized-dashboard/page.tsx",
    "client/app/user-role-integration/page.tsx",
    "client/components/PerformanceOptimizer.tsx"
)

# 수정할 import 패턴들
$replacements = @{
    "import { Button } from '@/components/ui/Button';" = "import Button from '@/components/ui/Button';"
    "import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';" = "import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';"
    "import { Badge } from '@/components/ui/Badge';" = "import Badge from '@/components/ui/Badge';"
    "import { Input } from '@/components/ui/Input';" = "import Input from '@/components/ui/Input';"
    "import { Label } from '@/components/ui/Label';" = "import Label from '@/components/ui/Label';"
    "import { Select } from '@/components/ui/Select';" = "import Select from '@/components/ui/Select';"
    "import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';" = "import Tabs, { TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';"
    "import { Switch } from '@/components/ui/Switch';" = "import Switch from '@/components/ui/Switch';"
    "import { Slider } from '@/components/ui/Slider';" = "import Slider from '@/components/ui/Slider';"
    "import { Textarea } from '@/components/ui/Textarea';" = "import Textarea from '@/components/ui/Textarea';"
    "import { Progress } from '@/components/ui/Progress';" = "import Progress from '@/components/ui/Progress';"
}

$totalFiles = 0
$modifiedFiles = 0

foreach ($file in $files) {
    if (Test-Path $file) {
        $totalFiles++
        Write-Host "📝 처리 중: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        $originalContent = $content
        
        foreach ($pattern in $replacements.Keys) {
            $replacement = $replacements[$pattern]
            $content = $content -replace [regex]::Escape($pattern), $replacement
        }
        
        if ($content -ne $originalContent) {
            Set-Content $file $content -Encoding UTF8
            $modifiedFiles++
            Write-Host "✅ 수정 완료: $file" -ForegroundColor Green
        } else {
            Write-Host "ℹ️ 변경사항 없음: $file" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ 파일을 찾을 수 없음: $file" -ForegroundColor Red
    }
}

Write-Host "🎉 작업 완료!" -ForegroundColor Green
Write-Host "📊 총 파일: $totalFiles, 수정된 파일: $modifiedFiles" -ForegroundColor Cyan
Write-Host "💡 이제 'npm run build'를 실행해보세요!" -ForegroundColor Yellow

