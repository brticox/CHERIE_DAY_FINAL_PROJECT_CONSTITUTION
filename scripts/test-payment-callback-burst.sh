#!/bin/sh
set -eu

case "${DATABASE_URL:-}" in
  *localhost*|*127.0.0.1*) ;;
  *)
    if [ "${ALLOW_DISPOSABLE_PAYMENT_DB:-}" != "true" ]; then
      echo "Refusing callback burst outside localhost/disposable database" >&2
      exit 1
    fi
    ;;
esac

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/phase3_callback_burst_setup.sql >/dev/null
export DATABASE_URL
seq 1 100 | xargs -P 20 -I '{}' sh -c \
  "psql \"\$DATABASE_URL\" -v ON_ERROR_STOP=1 -c \"set role service_role; select public.ingest_paytr_callback('PHASE3BURSTA1','phase3-burst-event','success',10000,10000,'TL','{\\\"status\\\":\\\"success\\\"}'::jsonb,'46000000-0000-0000-0000-000000000001');\" >/dev/null"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/phase3_callback_burst_verify.sql
