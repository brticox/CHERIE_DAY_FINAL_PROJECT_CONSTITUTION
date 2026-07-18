#!/bin/sh
set -eu

eval "$(npx supabase status -o env)"
export NEXT_PUBLIC_SUPABASE_URL="$API_URL"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="$ANON_KEY"
export SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"
export NEXT_PUBLIC_SITE_URL="http://127.0.0.1:3100"
export APP_ENV="staging"
export E2E_BASE_URL="http://127.0.0.1:3100"
export E2E_DATABASE_URL="$DB_URL"

npx playwright test e2e/product-cart-checkout.spec.ts
