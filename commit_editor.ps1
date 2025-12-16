# Git commit 메시지 에디터 스크립트
param($file)

# 현재 커밋 해시 확인
$currentCommit = git rev-parse HEAD

# 커밋 해시와 메시지 파일 매핑
$commitMessages = @{
    "0d0ebbd851fba48358b79a11be40916e722e9c54" = "commit_msg_0d0ebbd.txt"
    "5f77dee7ad6a781d1ae56aaa7960eaa7c1128e58" = "commit_msg_5f77dee.txt"
    "38039d0b69fa55f87bd68b3c2f07f3da6733eadf" = "commit_msg_38039d0.txt"
    "01497fb1a6b03576657349758e4b588d345657e8" = "commit_msg_01497fb.txt"
    "891873bc8bed3ba76279888a223294023a1e7277" = "commit_msg_891873b.txt"
    "e270f00066e39443fa005a6806e4165784653c5b" = "commit_msg_e270f00.txt"
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

if ($commitMessages.ContainsKey($currentCommit)) {
    $msgFile = $commitMessages[$currentCommit]
    if (Test-Path $msgFile) {
        $newMessage = [System.IO.File]::ReadAllText($msgFile, $utf8NoBom)
        [System.IO.File]::WriteAllText($file, $newMessage, $utf8NoBom)
        Write-Host "커밋 메시지 수정: $currentCommit" -ForegroundColor Green
    } else {
        Write-Host "메시지 파일을 찾을 수 없습니다: $msgFile" -ForegroundColor Yellow
    }
} else {
    # 기존 메시지 유지
    Write-Host "커밋 메시지 유지: $currentCommit" -ForegroundColor Gray
}

