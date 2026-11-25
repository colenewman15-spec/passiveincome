# Runs the factory, rebuilds the site, and pushes to GitHub Pages.
# Designed for unattended scheduled runs.
param(
  [string]$Niche = "",
  [string]$ArticleTopic = ""
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "=== Scheduled factory + deploy ==="

# 1. Factory (generates product + article + zips + builds site)
& (Join-Path $root "run_factory.ps1") -Niche $Niche -ArticleTopic $ArticleTopic
if ($LASTEXITCODE -ne 0) { throw "Factory run failed" }

# 2. Deploy to GitHub Pages
& (Join-Path $root "deploy.ps1")
if ($LASTEXITCODE -ne 0) { throw "Deploy failed" }

Write-Host "=== Scheduled run complete ==="