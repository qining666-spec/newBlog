# 摸鱼博客开发启动脚本
# 使用方法: 在 PowerShell 中运行 .\dev.ps1

$nodeDir = "$env:USERPROFILE\.trae\binaries\node\versions\24.14.1"
$env:Path = "$nodeDir;$env:Path"

Write-Host "===== 摸鱼博客开发环境 =====" -ForegroundColor Cyan
Write-Host "Node.js: $(node --version)" -ForegroundColor Green
Write-Host "npm: $(npm --version)" -ForegroundColor Green
Write-Host ""

# 初始化SQLite数据库
Write-Host "初始化数据库..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\server"
npx prisma db push 2>$null
Set-Location $PSScriptRoot
Write-Host "数据库就绪!" -ForegroundColor Green
Write-Host ""

# 启动后端服务（后台）
Write-Host "正在启动后端服务..." -ForegroundColor Cyan
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "$PSScriptRoot\server" -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "后端服务: http://localhost:3001" -ForegroundColor Green
Write-Host ""

# 启动前端开发服务器
Write-Host "正在启动前端开发服务器..." -ForegroundColor Cyan
Write-Host "前端地址: http://localhost:5173" -ForegroundColor Green
Write-Host "快捷键 Ctrl+Shift+D 切换伪装模式" -ForegroundColor Green
Write-Host "按 Ctrl+C 停止前端" -ForegroundColor Yellow
Write-Host ""

npm run dev
