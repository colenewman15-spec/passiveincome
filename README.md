# Passive Income Factory (Atlas Studio)

Hands-off, locally-run, anonymous-friendly income system. No paid APIs, no cloud AI, no purchases.

## What it does automatically
- Generates digital products (caption packs, guides, posting plans) using local Ollama
- Generates SEO articles for the affiliate site
- Packages products into ZIPs
- Prepares a static site (PDF tool + guides + products) for free hosting
- Runs on a schedule via the automation tool (see automation/)

## One-time setup (manual, ~30 min)
See SETUP.md.

## Run manually
```
.\run_factory.cmd
```
Or with args:
```
.\run_factory.ps1 -Niche "fitness coaching" -ArticleTopic "best standing desk for tall people"
```

## Deploy
```
.\setup_git.ps1   # once
# add remote
.\deploy.ps1
```

## Scheduled (hands-off)
An automation can be created to run `run_factory.ps1` weekly. See automation/README.md.