# Spending Tracker

Personal Telegram Bot to track daily expenses.

## Feature

- Recording spending with simple prompt `{{amount}} {{description}}`, eg.
  `20000 lunch with friends`
- Daily report at EoD
- Monthly report at EoM and export report to Google Spreadsheet

## Stack

- Deno (JS runtime)
- Typescript
- PostgreSQL (RDBMS, hosted on [Supabase](https://supabase.com/))
- Deno Deploy (deployment platform, https://deno.com/deploy)
- Telegram Bot API (user interface)

## How to Run

- Clone repository
- Run Deno Cache Dependencies (via CLI or VSCode Deno Language Server Plugin)
- Set required env vars as listed on `.env.example`
- Run `deno task serve` to run
