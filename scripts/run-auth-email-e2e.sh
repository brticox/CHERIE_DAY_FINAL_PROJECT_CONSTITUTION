#!/bin/sh
set -eu

eval "$(npx supabase status -o env)"
export NEXT_PUBLIC_SUPABASE_URL="$API_URL"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY"
export SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
export NEXT_PUBLIC_SITE_URL="http://localhost:3000"
export NEXT_PUBLIC_APP_ENV="development"
export APP_ENV="development"
export NOTIFICATION_SEND_ENABLED="false"
export CRON_SECRET="local-auth-email-e2e-secret"

npx playwright test --config=playwright.auth.config.ts e2e/auth-email-lifecycle.spec.ts
