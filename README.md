# Passive Income Factory (Atlas Studio / StackCompare)

Hands-off, locally-run, anonymous-friendly income system. No paid APIs, no cloud AI, no purchases required to start.

## What it does automatically
- Generates digital products (caption packs, guides, posting plans) using local Ollama
- Generates SEO articles and renders them to HTML
- Generates high-intent B2B software comparison pages (StackCompare)
- Packages products into ZIPs
- Rebuilds the static site and (optionally) deploys to GitHub Pages
- Runs weekly via the automation tool

## Sites
- Atlas Studio: `site/index.html`
- StackCompare (B2B software comparisons): `site/compare/index.html`
- PDF Pro tool: `site/tools/pdf_pro_app.html`
- Guides: `site/guides/`
- Products: `site/products/`

## Run manually
```
.\run_factory.cmd
```
Or with args:
```
.\run_factory.ps1 -Niche "B2B software buying" -ArticleTopic "how to choose CRM software"
```

## Build + deploy only
```
.\deploy.ps1
```

## Scheduled (hands-off)
Weekly automation (`run_and_deploy.ps1`) runs Monday 03:00: factory -> build -> push.

## Finance
- `finance/reinvestment_policy.md` - 100% reinvest until $500/mo
- `finance/revenue_tracker.mjs` - Gumroad ledger + allocation (needs `GUMROAD_ACCESS_TOKEN`)
- `finance/setup_separate_account.md` - dedicated account setup

## Plan
See `LAUNCH_30_DAYS.md` and `site/compare/AFFILIATE_PROGRAMS.md`.