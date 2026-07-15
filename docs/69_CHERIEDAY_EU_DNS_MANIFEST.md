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

## Current authoritative state — 2026-07-15

Public DNS now delegates to Cloudflare and the zone is active:

- zone ID: `74e8535e39b23167e5efef60e4c3797a`
- nameservers: `armfazh.ns.cloudflare.com`, `christina.ns.cloudflare.com`
- plan: Free Website (`$0`)

The imported Squarespace apex and `www` records remain in place, so the public site has not been moved to Vercel. Cloudflare currently proxies those web records. Google Workspace MX, Google verification, Google DKIM, Resend DKIM, Resend return-path MX, and Resend return-path SPF are present and preserved. No `_dmarc` record was observed. `staging.cherieday.eu` does not exist because no Staging Vercel deployment target exists.

## Resend pending records

| Name | Type | Value | TTL | Purpose | Conflict risk |
| --- | --- | --- | --- | --- | --- |
| `resend._domainkey` | TXT | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxTJFzwIVb9a3FiyJWpsjA/MFZKJzOQWfbBqM1Suo/TAFxGqjL3LNog3jqUJ4cr8BPl9lPijPxImk5Zu0xC3WBYtFqS2iuLgxxur+QjBGK9tce68OIsVKG+gWQQtO6tR8YELc0A7Ha8ViC1njnyyTQVH72gP1nBKFJ0jzmbCy5YwIDAQAB` | Auto | Resend DKIM | Must not overwrite an existing `resend` selector |
| `send` | MX 10 | `feedback-smtp.eu-west-1.amazonses.com` | Auto | Resend return-path | Does not replace Google MX at apex |
| `send` | TXT | `v=spf1 include:amazonses.com ~all` | Auto | Resend return-path SPF | Subdomain-only; do not add a second apex SPF |

These records are now present in Cloudflare and Resend reports the domain verified and send-enabled. A single future apex SPF record must merge all authorized apex senders if one is required; do not publish two SPF TXT records at the same hostname.

## Future Vercel records

Obtain the exact Vercel-assigned records after the project and domains are created. Only then add `staging`. Do not replace the apex Squarespace A records or `www` during this Staging-only mission. Keep auth, API, payment callback, worker, and Resend webhook paths unproxied/correctly uncached.
