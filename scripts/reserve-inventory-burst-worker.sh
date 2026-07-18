#!/bin/sh
set -eu

id=$(printf '%012d' "$1")
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "
  insert into public.order_items(order_id,product_id,variant_id,quantity,unit_price,total_price)
  values(
    '76000000-0000-4000-8000-$id',
    '72000000-0000-4000-8000-000000000099',
    '73000000-0000-4000-8000-000000000099',
    1,100,100
  );" >/dev/null
