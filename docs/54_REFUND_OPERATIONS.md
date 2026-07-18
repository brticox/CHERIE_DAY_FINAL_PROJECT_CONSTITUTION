# Refund Operations

Cancellation intent, order cancellation and money refund are separate. No legal eligibility
rule is inferred here: the operator must confirm the approved policy for personalized goods,
services/deposits and cancellation windows before requesting money movement.

Only captured `paid` or `partially_refunded` payments are refundable. Request requires an
active admin, positive integer kuruş, reason, exact order-number confirmation and a unique
idempotency key. Row locks reserve requested/approved/processing/completed amounts, so
concurrent and cumulative refunds cannot exceed captured money. A non-superadmin cannot
approve their own request; the current UI is restricted to admins and preserves this SQL rule.

After approval the server-only adapter submits the exact remaining amount to PayTR. The real
adapter is disabled unless explicit non-production sandbox flags are present; local simulator
covers success, retryable failure and terminal failure. A provider success atomically updates
refund/payment/order. Partial success never marks the whole order refunded. Failure creates a
reconciliation case and leaves an explicit retry state. Never retry without first checking the
provider because a timeout can hide a successful refund.

Customer notifications are queued after requested, approved, submitted and confirmed result
transactions. Staff receives provider-failure context without credentials. Provider references
are immutable, and all lifecycle actions are audited.

Before real use: validate PayTR refund credentials in sandbox; verify two-person approval for
the chosen roles; approve cancellation/legal rules; assign failure escalation; and reconcile
the first refunds against PayTR reports.
