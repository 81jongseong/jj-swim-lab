# Git rebase 에디터 스크립트
param($file)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$content = [System.IO.File]::ReadAllText($file, $utf8NoBom)
$content = $content -replace '^pick 0d0ebbd', 'reword 0d0ebbd'
$content = $content -replace '^pick 5f77dee', 'reword 5f77dee'
$content = $content -replace '^pick 38039d0', 'reword 38039d0'
$content = $content -replace '^pick 01497fb', 'reword 01497fb'
$content = $content -replace '^pick 891873b', 'reword 891873b'
$content = $content -replace '^pick e270f00', 'reword e270f00'
[System.IO.File]::WriteAllText($file, $content, $utf8NoBom)

