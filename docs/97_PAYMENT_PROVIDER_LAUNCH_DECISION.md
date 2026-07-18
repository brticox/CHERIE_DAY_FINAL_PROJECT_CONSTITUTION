# Launch payment provider decision

**Decision:** PayTR is the only online payment provider exposed by the current CHERIE DAY checkout.

The implemented launch path includes PayTR initialization, signed callback handling, idempotent payment application, reconciliation, guarded refunds, simulator coverage, and operational evidence. `iyzico` remains only as a historical and forward-compatible database enum value; it is not offered in checkout and no environment keys are requested because no production adapter exists.

Adding another provider is a separate launch change. It requires initialization, return/callback verification, idempotency, refund behavior, reconciliation evidence, environment readiness checks, and end-to-end sandbox proof before it may appear in the customer interface.
