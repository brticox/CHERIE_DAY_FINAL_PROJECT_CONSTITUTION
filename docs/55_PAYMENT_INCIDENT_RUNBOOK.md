# Payment Incident Runbook

For every incident: stop unsafe automation, preserve correlation IDs and immutable evidence,
avoid generic financial mutations, appoint an incident owner, record all actions, communicate
only confirmed facts, and conduct a post-incident review.

| Incident | Detect / contain | Investigate and recover | Communication / escalation |
|---|---|---|---|
| Charged, order unpaid | critical discrepancy; hold duplicate retry and fulfillment decision | verify PayTR evidence, callback logs and locks; use reviewed recovery only | tell customer payment is under verification; finance + engineering |
| Local paid, no provider evidence | reconciliation case; pause fulfillment | verify signed event and PayTR report; never fabricate evidence | finance/security critical escalation |
| Duplicate callback flood | rate/log counters; preserve retry compatibility | validate signature distribution and single-event constraint | provider/security if malicious or sustained |
| Amount mismatch | high discrepancy; do not acknowledge as paid | compare frozen trusted amount and provider total | finance/security; customer only after facts |
| Callback endpoint down | uptime/RPC failures; restore endpoint | replay provider callbacks/status evidence after DB health | PayTR support + engineering incident |
| Stuck pending | age alert; customer must not retry blindly | query provider, wait grace, open review | truthful pending message and support path |
| Refund failed | case + staff alert; stop blind retry | check provider for hidden success, then controlled retry if marked retryable | finance owner and customer status update |
| Provider unavailable | keep attempts pending; disable new initialization if sustained | monitor status and reconcile after recovery | status notice without declaring failure |
| Secret compromise | disable payment/refund initiation, rotate key/salt/worker secret | inspect invalid signatures/access and re-establish callback | security lead, PayTR, formal breach process |
| Wrong live/test environment | immediately disable provider surface | correct environment, rotate exposed credentials, re-run readiness | engineering/security leadership |
| Notification failure | payment remains authoritative; inspect outbox | retry deduplicated outbox after provider repair | support only if materially delayed |
| Reconciliation discrepancy | assign owner; no automatic correction | obtain provider evidence, document decision and reviewed remedy | finance for high, leadership for critical |

Customer wording for unresolved payment: “Ödemeniz henüz doğrulanmadı; kartınızdan çekim
yapılmış olabilir. Lütfen yeniden ödeme denemeyin. Ekibimiz işlemi kontrol ediyor.” Never
promise a refund or successful payment until provider-confirmed state is committed.
