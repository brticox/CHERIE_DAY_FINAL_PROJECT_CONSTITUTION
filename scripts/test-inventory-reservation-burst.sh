#!/bin/sh
set -eu

case "${DATABASE_URL:-}" in
  *localhost*|*127.0.0.1*) ;;
  *)
    echo "Refusing inventory burst outside localhost/disposable database" >&2
    exit 1
    ;;
esac

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/inventory_reservation_burst_setup.sql >/dev/null
export DATABASE_URL
seq 1 100 | xargs -P 20 -I '{}' sh scripts/reserve-inventory-burst-worker.sh '{}' \
  >/dev/null 2>&1 || true
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/inventory_reservation_burst_verify.sql
