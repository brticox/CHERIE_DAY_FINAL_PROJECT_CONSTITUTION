# CHERIE DAY — cherieday.eu DNS Manifest

## Before snapshot

At 2026-07-14, authoritative nameservers were:

- `nsc1.squarespacedns.com`
- `nsc2.squarespacedns.com`
- `nsc3.squarespacedns.com`
- `nsc4.squarespacedns.com`

Observed records:

| Name | Type | Value | Preserve |
| --- | --- | --- | --- |
| `@` | MX | Google Workspace `aspmx.l.google.com` and `alt1`–`alt4` | Yes |
| `@` | TXT | Google site verification | Yes |
| `@` | A | Squarespace addresses | Replace only after Vercel domain validation |
| `www` | CNAME | `ext-sq.squarespace.com` | Replace only after apex and Vercel are proven |
| `_dmarc` | TXT | Not observed | Add after SPF/DKIM review |
| `google._domainkey` | CNAME | Not observed publicly | Verify in Workspace Admin before any change |

No Cloudflare zone was created: the connected account is missing `com.cloudflare.api.account.zone.create`. Registrar nameserver delegation therefore remains unchanged.

## Resend pending records

| Name | Type | Value | TTL | Purpose | Conflict risk |
| --- | --- | --- | --- | --- | --- |
| `resend._domainkey` | TXT | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxTJFzwIVb9a3FiyJWpsjA/MFZKJzOQWfbBqM1Suo/TAFxGqjL3LNog3jqUJ4cr8BPl9lPijPxImk5Zu0xC3WBYtFqS2iuLgxxur+QjBGK9tce68OIsVKG+gWQQtO6tR8YELc0A7Ha8ViC1njnyyTQVH72gP1nBKFJ0jzmbCy5YwIDAQAB` | Auto | Resend DKIM | Must not overwrite an existing `resend` selector |
| `send` | MX 10 | `feedback-smtp.eu-west-1.amazonses.com` | Auto | Resend return-path | Does not replace Google MX at apex |
| `send` | TXT | `v=spf1 include:amazonses.com ~all` | Auto | Resend return-path SPF | Subdomain-only; do not add a second apex SPF |

These records are **not yet added**. Add them at Squarespace DNS (or the eventual Cloudflare zone), then trigger Resend verification. A single future apex SPF record must merge Google and Resend only if Resend explicitly requires apex SPF; do not publish two SPF TXT records.

## Future Vercel records

Obtain the exact Vercel-assigned records after the project and domains are created. Only then replace the apex Squarespace A records, add `staging`, and convert `www` to a redirect. Keep auth, API, payment callback, worker, and Resend webhook paths unproxied/correctly uncached.
