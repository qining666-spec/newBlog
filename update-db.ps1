$nodeDir = "$env:USERPROFILE\.trae\binaries\node\versions\24.14.1"
$env:Path = "$nodeDir;$env:Path"

Set-Location "$PSScriptRoot\server"
npx prisma db push
