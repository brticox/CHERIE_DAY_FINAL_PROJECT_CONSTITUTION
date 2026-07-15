# Phase 3.5 Cloudflare DNS Export Manifest

Date: 2026-07-15 (Europe/Istanbul)

The canonical BIND-format export remains outside the repository at:

`/Users/albarayousef/Desktop/CHERIE_DAY_EDA_BACKUP_20260715-075200/cherieday-eu-dns-export.zone`

The Phase 3.5 recovery copy is stored at:

`/Users/albarayousef/Desktop/CHERIE_DAY_PHASE_3_5_RECOVERY_20260715-083745/cherieday-eu-dns-export.zone`

Fresh Cloudflare API and public DNS reads verified that the zone remains active and contains the same 16-record layout. Public DKIM and verification payloads are intentionally omitted from repository documentation.

Preservation checks:

- Cloudflare authority: pass
- Google Workspace MX: pass, five records
- Google verification: pass
- Google DKIM: pass
- Resend DKIM: pass
- Resend return-path MX/SPF: pass
- duplicate SPF: not introduced
- existing DMARC: none exists to preserve
- `staging` record: absent; no Vercel target was guessed
- callback-breaking cache/WAF mutation: none made
