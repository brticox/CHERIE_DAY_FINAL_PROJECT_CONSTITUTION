# CHERIE DAY — Email Responsibility Matrix

Authoritative domain: **UNVERIFIED**. `<PRIMARY_DOMAIN>` is a blocking placeholder, not a configured value.

## Human inbox ownership (Google Workspace)

| Address | Responsibility | Primary owner | Backup / restriction |
|---|---|---|---|
| `hello@<PRIMARY_DOMAIN>` | General brand and commercial intake | Brand/commercial | Named backup required |
| `support@<PRIMARY_DOMAIN>` | Account, order help and escalations | Customer support | Delegated support only |
| `orders@<PRIMARY_DOMAIN>` | Order operations and correspondence | Order operations | Operations backup |
| `payments@<PRIMARY_DOMAIN>` | Payment, reconciliation and refund review | Finance | Finance-restricted |
| `legal@<PRIMARY_DOMAIN>` | KVKK, privacy and contractual notices | Legal/privacy owner | Strictly restricted |

Workspace Admin must record whether each is a mailbox, alias or Group; external receipt; send-as; retention; delegation; backup owner; and enforced 2FA. Gmail access in this session was not Workspace Admin access, so none is claimed configured.

## Application sender/reply routing (Resend)

| Event family | From | Reply-To | Internal destination | Owner |
|---|---|---|---|---|
| Account/security | `CHERIE DAY <hello@<PRIMARY_DOMAIN>>` | `support@<PRIMARY_DOMAIN>` | Support | Identity/support |
| Order/proof/production/shipment | same verified sender | `orders@<PRIMARY_DOMAIN>` | Orders | Order operations |
| Payment/refund | same verified sender | `payments@<PRIMARY_DOMAIN>` | Payments | Finance |
| Contact/lead acknowledgement | same verified sender | `hello@<PRIMARY_DOMAIN>` | Hello | Brand/commercial |
| Legal/privacy | approved legal sender | `legal@<PRIMARY_DOMAIN>` | Legal | Legal/privacy |
| Internal operational alert | verified transactional sender | responsible inbox above | Role-scoped staff list | Operations |

Google Workspace owns conversations; Resend owns automated transactional delivery. Google SMTP is not the application transport. The production recipient override is forbidden and arbitrary admin recipients are not supported.
