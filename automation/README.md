# Automation

A weekly automation has been registered (id: aut_21036b5e7001beY1mgLotKMmT4) that runs
`run_factory.ps1` every Monday at 03:00 (America/Chicago).

To view/manage automations, use the automation tools.

## What the weekly run does
1. Checks Ollama is available
2. Generates a digital product for a niche (default: "desk setup tips")
3. Generates an SEO article
4. Packages products into dist/*.zip

## To change the niche/topic
Edit the automation's shell command to pass args:
`powershell -ExecutionPolicy Bypass -File C:\Users\cole\PassiveIncome\run_factory.ps1 -Niche "YOUR NICHE" -ArticleTopic "YOUR TOPIC"`

## Manual run
`.\run_factory.cmd`