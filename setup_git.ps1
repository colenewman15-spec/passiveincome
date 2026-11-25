# One-time git setup for the PassiveIncome project (run once)
$root = $PSScriptRoot
Set-Location $root

if (-not (Test-Path ".git")) {
  git init
  git config user.name "Atlas Studio"
  git config user.email "atlas-studio@users.noreply.github.com"
  Write-Host "Git initialized with anonymous identity."
} else {
  Write-Host "Git repo already exists."
}

# Create .gitignore
@"
node_modules/
dist/*.zip
logs/
.env
*.log
"@ | Set-Content -Path ".gitignore" -Encoding UTF8

git add -A
git commit -m "Initial passive income factory" 2>$null
Write-Host "Initial commit created. Next: add a remote and push."
Write-Host "Example: git remote add origin https://github.com/<your-anon-account>/passive-income.git"
Write-Host "Then run deploy.ps1"