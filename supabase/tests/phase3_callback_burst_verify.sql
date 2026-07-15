do $$
begin
  if (select count(*) from public.payment_events where provider_event_id='phase3-burst-event') <> 1 then
    raise exception 'callback burst created duplicate events';
  end if;
  if (select status from public.payments where id='44000000-0000-0000-0000-000000000001') <> 'paid' then
    raise exception 'callback burst did not leave payment paid';
  end if;
  if (select payment_status from public.orders where id='43000000-0000-0000-0000-000000000001') <> 'paid' then
    raise exception 'callback burst did not leave order paid';
  end if;
end;
$$;
select '100 concurrent duplicate callbacks: PASS' as result;
