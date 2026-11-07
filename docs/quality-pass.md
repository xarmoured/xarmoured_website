# Quality pass: findings, verification and readiness

Scope: homepage simplification, hero animation, Solutions route, responsible disclosure
workflow, Protocol wording, real 404s, form and upload hardening, test repair.
Nothing was deployed. No SQL was executed. No research record, attribution or publication
status was modified.

## Root causes

| Area | Cause | Fix |
|---|---|---|
| Hero animation | Click-only state switcher; path swapped instantly; four stages with Remediate and Verify identical; no Trace stage; headline wrapped into four uneven lines | Five-stage CSS/SVG sequence (`attack-diagram.tsx`, `public.css`) that plays once when first visible, never loops or restarts on scroll, stops on manual interaction, and renders the complete final state under `prefers-reduced-motion` |
| Solutions page | Right collection (`industries`) rendered by the research-archive `PublicationList`, which labels any record without a CVE or category `RESEARCH`; `notFound()` when no industry rows existed; `/solutions` never existed | Code-rendered `SolutionsPage` that works with zero CMS rows; optional contexts list; `/solutions` redirects (308) to canonical `/industries` |
| Soft 404s | `(public)/loading.tsx` creates a Suspense boundary, so the response starts streaming as HTTP 200 before `notFound()` runs. Verified by isolating a bare `notFound()` (404) against the same call inside `(public)` (200), then removing `loading.tsx` (404) | Removed `loading.tsx`; proxy returns a real 404 for paths that cannot resolve (`route-index.ts`, `/api/route-index`, `not-found-html.ts`). Lookups fail open |
| "Loading the next view…" | That fallback's text is embedded as router data. With JavaScript off, `/` and `/protocol` showed it instead of the page. Invisible to JavaScript users | Removed with `loading.tsx`. Trade-off: no loading indicator on slow client navigation |
| Disclosure policy invisible | Needs the page published AND the "Publish reviewed disclosure policy" setting; nothing told the owner which was closed; "Public preview" ignored the saved draft | Preview shows the draft (and says when the setting hides it from visitors); admin checklist names the first missing step; page always states there is no paid bug bounty |
| Upload size limit | Enforced from the `content-length` header only; a chunked body is fully buffered | `readLimitedBody` counts received bytes and aborts at the limit (public submit and admin media upload) |
| Admin notification link | Printed `undefined/admin/...` if the site URL setting was missing | Falls back to the request origin |

## Security review: confirmed good
RLS on every table; `security definer` functions pin `search_path`; records are written only
through the `save_record` RPC with optimistic concurrency, and success is reported only after
the database confirms; publishing requires a preview; anonymous settings are an explicit
allowlist; research is public only when `disclosure = 'public'`; private resume bucket is
PDF-only and 5 MB limited; resume access is role-checked with 60-second signed URLs; Markdown
renders without raw HTML; JSON-LD escapes `<`; no SVG in the public bucket; origin checks,
honeypot and server-side Turnstile verification bound to the site hostname.

## Unresolved (not fixed)
- No malware scanning of uploaded PDFs (type, size and magic-byte checks only). Needs a
  scanning service and a staff handling policy.
- Rate limiting keys on forwarded-IP headers. Spoofable unless the host overwrites them.
- Dev E2E harness exhausts its default 1280 MB heap on this 4 GB host. Use
  `NODE_OPTIONS=--max-old-space-size=2600`.

## Operational readiness: what code cannot establish
None of these were tested and no result is claimed.

| Item | Needs |
|---|---|
| Supabase backups and an actual restore test | Owner: confirm plan and PITR, perform and record a restore |
| Storage backup and restore (public assets, private resumes) | Owner |
| Resend sender-domain authentication (SPF, DKIM, DMARC) and real delivery | Owner: send a real submission from the production hostname |
| Turnstile on the real hostname | Owner: widget hostname list must match; note `www` vs apex |
| Disclosure mailbox monitoring and ownership | Owner: who reads it, and how fast |
| Form submission and email-failure monitoring | Owner: submissions are stored first; a failed email only marks `emailSent: false` |
| Hosting limits, request-body limits, forwarded-header handling | Owner: enforce at the host |
| HSTS | Owner: set at the host once HTTPS-only is certain |
| Data retention, deletion, privacy policy accuracy | Owner and counsel |
| Incident response ownership | Owner |
| `security.txt` | Settings: email, canonical URL, expiry. It returns 503 until valid, by design |
| Responsible disclosure policy wording and safe harbor | Counsel: see `responsible-disclosure-policy.draft.md` |

## Verification summary
See the final report for command output and counts.
