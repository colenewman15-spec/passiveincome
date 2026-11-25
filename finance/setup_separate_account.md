# Separate Account Setup (one-time, requires your identity)

I cannot open a financial account, move money, or conceal finances from you. Banks and payment platforms require KYC (identity verification) and report to tax authorities. What I can do is automate the bookkeeping and reinvestment split once the account exists.

## Options (US, free)

| Provider | Type | Monthly fee | Notes |
|---|---|---|---|
| Mercury | Business checking | $0 | Popular with startups; requires EIN or SSN |
| Novo | Business checking | $0 | Requires business entity/EIN or sole prop |
| Bluevine | Business checking | $0 | Requires business details |
| Your bank | Second checking/savings | $0-5 | Simplest; ask for a sub-account |

## Recommended path

1. If you are a sole proprietor, you can often open a business checking account with your SSN and a DBA ("Atlas Studio").
2. Or open a second personal checking/savings account dedicated to this project. Keep it separate from daily spending.
3. Route Gumroad/affiliate payouts to that account.
4. Keep the debit card out of your wallet; use it only for reinvestment.

## Tax note

Income is taxable. Keep receipts and a simple ledger. This is not legal or tax advice; consult a professional if needed.

## Automation once the account exists

- `finance/revenue_tracker.mjs` pulls Gumroad sales and writes `finance/ledger.csv`.
- It computes the reinvestment amount per `reinvestment_policy.md`.
- You (or a scheduled task) transfer that amount to the reinvestment account.

## What I need from you to wire it up

- Gumroad access token (Settings -> Advanced -> Applications -> create token), stored as an environment variable `GUMROAD_ACCESS_TOKEN` (never commit it).
- The account is used only for payouts/reinvestment; no need to share credentials with me.