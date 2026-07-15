#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 2
fi

case "$DATABASE_URL" in
  *localhost*|*127.0.0.1*) ;;
  *) echo "Refusing to replay migrations outside a local disposable database" >&2; exit 2 ;;
esac

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/local_postgres_bootstrap.sql
find supabase/migrations -maxdepth 1 -type f -name '*.sql' | sort | while read -r migration; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -f "$migration"
done
