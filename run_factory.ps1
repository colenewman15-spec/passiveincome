param(
  [string]$Niche = "",
  [string]$ArticleTopic = ""
)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

# Rotate niche/topic from config if not provided
$config = Get-Content (Join-Path $root "config.json") | ConvertFrom-Json
if (-not $Niche) {
  $week = [math]::Floor((Get-Date).DayOfYear / 7)
  $Niche = $config.niches[$week % $config.niches.Count]
}
if (-not $ArticleTopic) {
  $week = [math]::Floor((Get-Date).DayOfYear / 7)
  $ArticleTopic = $config.article_topics[$week % $config.article_topics.Count]
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$log = Join-Path $root "logs\run_$timestamp.log"
Start-Transcript -Path $log | Out-Null

try {
  Write-Host "=== Passive Income Factory Run $timestamp ==="

  # 1. Check Ollama
  try {
    $tags = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 5
    Write-Host "Ollama OK. Models: $($tags.models.name -join ', ')"
  } catch {
    Write-Host "Ollama not reachable. Start Ollama first: 'ollama serve'"
    throw
  }

  # 2. Generate product
  Write-Host "`n--- Generating product ---"
  node (Join-Path $root "factory\generate_product.mjs") $Niche
  if ($LASTEXITCODE -ne 0) { throw "Product generation failed" }

  # 3. Generate article
  Write-Host "`n--- Generating article ---"
  node (Join-Path $root "factory\generate_article.mjs") $ArticleTopic
  if ($LASTEXITCODE -ne 0) { Write-Host "Article generation failed (non-fatal)" }

  # 4. Package
  Write-Host "`n--- Packaging products ---"
  python (Join-Path $root "factory\package.py")
  if ($LASTEXITCODE -ne 0) { throw "Packaging failed" }

  Write-Host "`n=== Run complete. Outputs in products/ and dist/ ==="
} finally {
  Stop-Transcript | Out-Null
}