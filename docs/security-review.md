# Security review

## Preserved controls
Server-verified Supabase user plus enabled profile; role checks in API and SQL; anonymous published-content RLS; service-role-only transactional intake; private resumes and 60-second signed URLs; no privileged browser credentials; origin validation; durable hashed-IP throttling; Turnstile hostname check; Zod; upload size/MIME/signatures; safe Markdown without HTML/MDX; redirect validation; audit/conflict detection; private admin cache headers; admin noindex. No production demo bypass.

## Implemented hardening in this release
Per-request script nonce using installed Next.js 16.3.8 guidance at node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md. Root rendering reads headers (dynamic). Nonce is passed to theme bootstrap, JSON-LD and Turnstile. Keep style-src unsafe-inline because Framer Motion/Recharts use inline styles. No strict-dynamic required: explicit script origins plus nonce block arbitrary inline scripts while supporting Cloudflare. Validate production hydration and CSP violations before release.

Added explicit case-study visibility in RLS and app. Expanded application and SQL role lists together. New URL/date/enum fields are validated; published services require real content in the API and database. Drafts are excluded from public related links and navigation. Excess catch-all segments are rejected. Preview pages noindex. Security headers apply to redirects as well as normal responses. Do not add HSTS until HTTPS/domain/subdomain ownership is confirmed by the deployment operator.

## Disclosure
RFC 9116 reference: https://www.rfc-editor.org/rfc/rfc9116 . Use configured real email, HTTPS canonical/policy, language tags and explicit expiration within one year. Missing or expired configuration returns 503 plain text, no invented mailbox. /security explains contact and scope; publish a reviewed policy only after explicit operational preparation. No bounty, PGP, response SLA or legal safe-harbor promise is invented.

## Remaining tradeoffs and launch gates
No antivirus/CDR; basic file signatures are not full content validation. Hosting must enforce request-body limits (6MB intake/11MB media) and sanitize forwarded IP headers. Rate-limit entries need operational cleanup/monitoring. Supabase MFA enrollment/admin provisioning remain trusted-console operations. Review session policy, backups/restore, retention/deletion, storage policies, email failures and actual Turnstile on staging. RLS tests use embedded PostgreSQL; they do not replace Supabase integration testing. Lists cap at 1,000 records. CSP allows HTTPS images and inline styles; tighten image origins when real media hosts are known. Security.txt expiration requires owner maintenance. Secrets must stay in hosting secret storage, never NEXT_PUBLIC except public anon/site/widget configuration.
