-- Fix parameter shadowing in the existing payment function without duplicating
-- its full body. Fail closed if the expected vulnerable definition is absent.
do $$
declare
  function_definition text;
  vulnerable_clause constant text := 'where p.idempotency_key = p_idempotency_key';
  fixed_clause constant text :=
    'where p.idempotency_key = create_payment_attempt.p_idempotency_key';
begin
  select pg_get_functiondef(
    'public.create_payment_attempt(uuid,uuid,public.payment_provider,text)'::regprocedure
  ) into function_definition;

  if position(vulnerable_clause in function_definition) = 0 then
    raise exception 'Expected payment idempotency clause was not found';
  end if;

  execute replace(function_definition, vulnerable_clause, fixed_clause);
end
$$;
