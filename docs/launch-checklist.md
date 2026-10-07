# Launch checklist

## Local verification

Use Node 22+ and npm. Stop the development server before typecheck/build to avoid racing generated route types. This session used an official temporary runtime at /tmp/xarmoured-runtime/node-v22.20.0-linux-x64/bin; it is not a project dependency or durable installation.

```bash
npm ci
cp -n .env.example .env.local
npm run typecheck
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
# If a system Chromium is already installed:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:production
npm run dev
```

E2E uses isolated labelled demo records and resets only .demo-data/e2e-records.json. It must never target production or store actual client data. A development demo is enabled only with XARMOURED_DEMO=true and never in production. Axe runs both public themes; responsive checks cover 360/390/430/768/1024/1280/1440/1920. Browser download is optional when a compatible system executable is specified. The extended startup/setup allowance accommodates this slow host; it does not change production behavior.

## Production deployment sequence

1. Review diff and this security review. Confirm Node 22+, lockfile, clean secret scan, successful typecheck/test/build/E2E/production smoke. Do not deploy with unresolved failures.
2. Create staging with a separate Supabase project. Apply migrations 001–007 in numeric order using Supabase SQL editor or `supabase db push` after linking the correct staging project. Never reset a production database. 007 is additive and preserves existing records; legacy published service checks are NOT VALID until those records are reviewed.
3. Disable public Supabase signups. Configure exact Site URL/auth callback allowlist. Review password/session/MFA policy and provision approved profiles via trusted tools. Verify viewer/editor/recruiter/owner boundaries with actual Auth tokens.
4. Set hosting secrets: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SITE_URL (canonical HTTPS origin), NEXT_PUBLIC_TURNSTILE_SITE_KEY, TURNSTILE_SECRET_KEY, RESEND_API_KEY, EMAIL_FROM, optional ADMIN_NOTIFICATION_EMAIL. XARMOURED_DEMO=false. No service-role key may have a NEXT_PUBLIC prefix.
5. Run `node --env-file=.env.local scripts/initialize.mjs` from a trusted staging terminal. It only inserts missing configuration; it does not overwrite existing records or publish service/demo claims. Provision the approved owner with `node --env-file=.env.local scripts/provision-owner.mjs owner@real-domain 'Approved Name'`, supplying OWNER_INITIAL_PASSWORD through a secret manager, then clear/change it.
6. In admin configure real legal entity/contact/country/socials, canonical SEO URL, reviewed privacy and terms, approved service scopes, sample report PDF and real jobs/research if available. Keep planned capabilities draft. Publish a service only when summary, description and testing areas reflect actual delivery. Add categories only for real published offerings. Do not publish example jobs or fictional research.
7. Set a monitored security email, HTTPS security.txt canonical, language tags and expiration within one year. Review /security. Enable policy only when approved and operationally supported. Confirm `curl -i https://real-domain/.well-known/security.txt` returns 200 with Contact/Expires/Canonical. Missing/expired config intentionally returns 503; this is a launch blocker, not a valid published security.txt.
8. Verify Resend sender domain/DNS, recipient notifications and receipt delivery. Configure Turnstile for the actual host. Submit assessment and application on staging, inspect persisted records/audit/notifications, test invalid origin and closed-job rejection, verify resumes are private and signed URLs expire. Review retention/deletion and export handling.
9. Configure hosting/reverse-proxy body limits (6MB intake, 11MB media), forwarded-header sanitization, HTTPS, access logs without secrets, alerting and backup/restore. Review Supabase bucket policies. HSTS is an operator decision once domain and subdomain HTTPS are confirmed. Uploaded content currently has signature checks, not antivirus scanning.
10. Preview/publish/edit/archive every new CMS module on staging. Confirm drafts/private case studies never appear through public pages, REST, menus or sitemap. Test role limits, preview noindex/private caching, slug redirects and concurrent-edit protection.
11. Build the production artifact (`npm run build`). Deploy through the chosen hosting provider's standard Next.js workflow; this task does not publish externally. Point staging domain first. Confirm nonce CSP permits hydration, theme control and the real Turnstile widget without browser violations.
12. Run desktop/mobile keyboard, both themes, reduced motion, zoom, real report download, admin editing, 404 and redirect tests against staging. Inspect JSON-LD with Google's Rich Results Test, canonical/OG/Twitter metadata and XML sitemap. JobPosting requires actual location/eligibility and date; no guarantee of rich-result eligibility. Measure production Core Web Vitals/Lighthouse before making performance claims.
13. Back up production database/storage and record rollback version. Apply 007 to the correct production project, set production credentials, deploy reviewed artifact, attach canonical HTTPS domain and repeat real intake/private-file smoke tests. Leave additive schema in place for application rollback; archive new modules if rolling back to earlier app code. No destructive rollback migration is required.
14. Inspect robots/sitemap, search engine indexing and canonical redirects. Submit sitemap to Search Console. Monitor errors, failed emails, request throttles, disclosure mailbox and expiry. Assign an owner to the recurring content/security review.

## Information that only Xarmoured can supply

Actual service availability and complete scope; approved company/legal/contact data; working sales/careers/security inboxes; legal/privacy/retention decisions; real social image; redacted report; genuine responsibly disclosed research and attribution; real roles/team/case studies; explicit permission for customer quotations; disclosure response operations; production integration credentials and domain ownership. Absence is handled deliberately, never filled with invented proof.

## Validation record

Baseline and final results are recorded in current-system-audit.md and verification.md. Automated local checks do not certify operational readiness or replace staging checks against real Supabase/Resend/Turnstile.

Build tooling: `npm run build` explicitly selects Next.js’s supported Webpack bundler. The default Turbopack build stalled on this constrained host during baseline verification; Webpack completed. No runtime dependency was added.
