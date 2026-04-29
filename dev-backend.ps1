# 摸鱼博客后端启动脚本
# 使用方法: 在 PowerShell 中运行 .\dev-backend.ps1

$nodeDir = "$env:USERPROFILE\.trae\binaries\node\versions\24.14.1"
$env:Path = "$nodeDir;$env:Path"

Write-Host "===== 摸鱼博客后端服务 =====" -ForegroundColor Cyan

Set-Location "$PSScriptRoot\server"

Write-Host "正在启动后端开发服务器..." -ForegroundColor Cyan
Write-Host "访问 http://localhost:3001" -ForegroundColor Green
Write-Host ""

npm run dev
