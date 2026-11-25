# Deploy the static site to GitHub Pages (requires remote configured + auth)
param([string]$Branch = "main")

$root = $PSScriptRoot
Set-Location $root

$remote = git remote get-url origin 2>$null
if (-not $remote) {
  Write-Host "No git remote configured. Run setup_git.ps1 then add a remote:"
  Write-Host "  git remote add origin https://github.com/<anon-account>/<repo>.git"
  exit 1
}

# Rebuild the site (render guides to HTML) before deploying
Write-Host "Building site..."
node (Join-Path $root "factory\build_site.mjs")

# Ensure the root index and .nojekyll exist
if (-not (Test-Path "index.html")) { Write-Host "WARNING: root index.html missing" }
if (-not (Test-Path ".nojekyll")) { New-Item -ItemType File -Path ".nojekyll" | Out-Null }

git add -A
$changes = git status --porcelain
if ($changes) {
  git commit -m "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}
git push origin $Branch
Write-Host "Deployed. If using GitHub Pages: Settings -> Pages -> Source: $Branch / (root)."
Write-Host "For Netlify: publish directory is configured in netlify.toml (site)."