# Deploy to GitHub Pages (requires remote configured + auth)
# One-time: create a GitHub repo (anonymous account) and: git remote add origin <url>
param([string]$Branch = "main")

$root = $PSScriptRoot
Set-Location $root

$remote = git remote get-url origin 2>$null
if (-not $remote) {
  Write-Host "No git remote configured. Run setup_git.ps1 then add a remote:"
  Write-Host "  git remote add origin https://github.com/<anon-account>/<repo>.git"
  exit 1
}

# Ensure products/dist are built
if (Test-Path "dist") {
  Copy-Item "dist\*.zip" "site\products\" -Force -ErrorAction SilentlyContinue
}

git add -A
$changes = git status --porcelain
if ($changes) {
  git commit -m "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
git push origin $Branch
Write-Host "Deployed. Enable GitHub Pages in repo settings -> Pages -> Source: $Branch / (root or /site)."