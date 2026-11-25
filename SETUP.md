# One-Time Setup (hands-off thereafter)

## 1. Anonymous accounts (you do this once)
- Create a dedicated email alias (not your primary) for store + hosting.
- Create an anonymous GitHub account (or use existing) for hosting.
- Create a Gumroad/Payhip/Etsy seller account under the studio name "Atlas Studio" with the alias email.
- (Optional) Create a domain (Namecheap/Porkbun, ~$10/yr) pointing to GitHub Pages.

## 2. Local (already done)
- Ollama running with qwen3.5 model (verified).
- Node.js + Python available (verified).

## 3. Configure payouts
- Set payout method on the store platform to a separate account you control.
- This is the only place real identity is required by law; keep it separate from the public brand.

## 4. Git + deploy (run once)
```
.\setup_git.ps1
git remote add origin https://github.com/<anon-account>/<repo>.git
.\deploy.ps1
```
Then enable GitHub Pages in repo settings.

## 5. Schedule (optional, for full hands-off)
Create an automation (via the automation tool) that runs weekly:
- Action: shell, command: `powershell -ExecutionPolicy Bypass -File C:\Users\cole\PassiveIncome\run_factory.ps1`
- Trigger: cron `0 3 * * 1` (Monday 3 AM)

## 6. First launch
- Run `.\run_factory.cmd` once to generate the first product + article.
- Upload `dist\*.zip` to the store platform with the listing copy from `marketing/` (in the experiments folder) or generate new copy via factory.
- Replace affiliate placeholder links before publishing the guides.

## Identity hygiene
- Never use your real name, personal email, or personal social accounts on the public brand.
- Keep the alias email and store account separate from personal accounts.