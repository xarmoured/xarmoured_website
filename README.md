# Xarmoured Platform

Next.js App Router company website and protected operating workspace. The application is in `src/`. The public experience uses Xarmoured’s boundary/evidence design language; the existing protected operating workspace remains intact.

## Run locally

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without Supabase, the public starter site works and sign-in explains setup requirements. To explore the admin locally, set `XARMOURED_DEMO=true` in `.env.local`. The development-only demo persists fictional, labeled records in ignored `.demo-data/records.json`; no real email or file upload occurs. **Demo authentication is never enabled in production**, even with the flag set. Do not store real personal or business data in the demo.

## Public website

Homepage, services and service detail, methodology, research and advisories, about/team, careers and job detail, general applications, assessment requests, sample report, privacy, terms, robots and sitemap. Controlled homepage copy/CTAs and section visibility live in Pages. Company/social/contact links come from Settings. Published jobs, services, research, FAQs, team and reports update without redeployment.

Shared UI includes responsive navigation, charcoal/copper design tokens, editorial sections, service interactions, report structure, FAQs, conversion CTAs, reduced-motion-aware Framer Motion reveals, and an interactive custom authorization/retest diagram. No fictional staff, clients, CVEs or company scale claims are added.

## Admin

The protected route group provides overview, leads, applications, jobs, research, services, pages, FAQs, team, media, sample reports, navigation, announcements, redirects, SEO, analytics, settings, notifications, activity, and account routes. List/detail/new screens share a module registry for coherent content editing. Pages accept ID or slug.

Features: structured editors, Markdown without executable HTML/MDX, draft-only optional autosave, previews and explicit review before publication, publish/unpublish/archive statuses, job closure confirmation, search/filters/sort/pagination, column toggle, mobile record layouts, CRM/ATS pipeline view, private notes, timelines, CSV export, `Ctrl/Cmd+K` grouped record/action search, `Esc` dialogs, skeletons, helpful empty states, and feedback messages.

## Supabase setup

1. Create a project. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`. Never prefix the privileged key with `NEXT_PUBLIC_`.
2. Apply, in order, using the Supabase SQL editor or linked `supabase db push`:
   - `supabase/migrations/001_platform.sql`
   - `supabase/migrations/002_workflows.sql`
   - `supabase/migrations/003_validation.sql`
   - `supabase/migrations/004_public_settings.sql`
   - `supabase/migrations/005_role_scope.sql`
   - `supabase/migrations/006_ordering.sql`
   - `supabase/migrations/007_content_architecture.sql`
3. **Disable public signups in Supabase Auth**. Set the production Site URL and allow `https://your-domain/auth/callback` (plus localhost for development). Configure session lifetime/inactivity controls, password protections, and optional MFA to your operational policy. The app supports passwords and recovery; magic-link/MFA enrollment interfaces are future work.
4. Initialize only necessary configuration:

   ```bash
   node --env-file=.env.local scripts/initialize.mjs
   ```

5. Provision an approved owner from a trusted terminal:

   ```bash
   node --env-file=.env.local scripts/provision-owner.mjs owner@your-domain 'Owner Name'
   ```

   Supply `OWNER_INITIAL_PASSWORD` through your secure shell/secret manager (16+ characters). Do not pass it as a CLI argument or commit it. Clear it afterward and change it after sign-in.
6. Additional users must be created through Supabase's trusted Auth admin console with a matching `profiles` row: `owner`, `admin`, `editor`, `recruiter`, or `viewer`. Public users cannot assign their role. Browser administrator creation is deliberately absent. Viewers receive aggregate dashboard/analytics access; private contact records and resumes remain restricted. Audit history is filtered to each role’s readable domains.
7. Sign in at `/admin/login` and configure real content.

### Database architecture

`records` is the canonical module-based CMS/business table with JSONB fields, created/updated actor metadata, publication timestamps, unique module slugs, and archive/delete metadata. Domain views use `security_invoker=true`: `jobs`, `job_applications`, `leads`, `research`, `services`, `pages`, `faqs`, `team_members`, `site_settings`, `navigation_items`, `announcements`, `notifications`, `redirects`. This compact V1 intentionally uses versionable JSON content rather than every suggested normalized child table.

Relational tables: `profiles`, `internal_notes`, `record_activity`, `audit_logs`, `media_files`, `analytics_events`, `communication_logs`, and durable `rate_limits`. Indexes cover active module/status queries, JSONB data, histories, and event dates. Business records are retained through archive; there is no casual permanent record deletion.

The centralized TypeScript `can` layer matches SQL permissions. Every API checks server identity, permissions, origin and input. `save_record` atomically writes content, activity and audit history, and detects concurrent editing. `receive_submission` is service-role-only and locks/checks the job before accepting an application. RLS exposes only visible/published content and public-disclosure research. Anonymous users cannot read leads, applicants, notes, audit logs, profiles or private files. Public company settings are exposed through an explicit field projection; internal email templates remain private. Profile roles are changed only through trusted administration.

Auth cookies use HttpOnly, SameSite=Lax and Secure in production. Identity is verified server-side. Security headers include CSP, anti-framing, MIME sniffing protection, and referrer policy. Request-specific nonces protect scripts; inline styles remain permitted for motion/charts. See `docs/security-review.md`. Admin responses are private/no-store. Durable rate limits protect login, recovery, intake and events. Use Vercel or a reverse proxy that sanitizes forwarded IP headers.

### Storage and sample reports

| Bucket | Visibility | Purpose |
| --- | --- | --- |
| `public-assets` | Public | Website images/PDFs, up to 10 MB |
| `private-applications` | Private | PDF resumes, up to 5 MB |
| `private-internal` | Private | Internal images/PDFs, up to 10 MB |

Media supports upload, preview, URL copying, metadata editing, archive and confirmed physical deletion. Private previews and resumes receive signed 60-second URLs only after authorization. Server checks size, MIME type and basic file signatures; antivirus scanning is not implemented. Arbitrary SVG/HTML uploads are excluded.

Upload a redacted sample PDF in Media, copy its public URL, create a Sample report with title/description/version/file URL, then publish. `/sample-report` uses the most recently published report. Resumes never enter the public asset bucket.

## Resend

Verify your sender domain. Set `RESEND_API_KEY`, verified `EMAIL_FROM`, and optional `ADMIN_NOTIFICATION_EMAIL`. Configure plain-text receipt/interview/rejection templates in Settings. Receipts are sent after successful persistence. Failed delivery keeps the submission and creates a notification. Authorized admins can explicitly send a configured template from a lead/application; successful sending is logged. No automated applicant rejection is performed. Missing credentials disables email without losing records.

## Turnstile

Create a widget for your real domain. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`. The server verifies token success and hostname against `NEXT_PUBLIC_SITE_URL`. Missing protection fails production submissions closed. Test keys belong only in isolated development/staging. Demo mode is not a production protection substitute.

## Cal.com

Put your real HTTPS scoping-event URL in Settings → Sales. The booking action appears only when configured. This release links to Cal.com; booking webhooks and appointment synchronization are not implemented.

## Analytics

First-party page/service/research/careers views, assessment starts/submissions, and applications feed an executive dashboard: activity chart, assessment event funnel, top pages and business records. Counts are accurately labeled as events/page views, **not unique visitors**. Analytics stores no identifying IPs; rate-limit keys are hashed. Use a specialist provider for unique visitor and session attribution. Booking-webhook reporting and external analytics embedding are future integrations; no fake counts are shown.

## Previews and caching

The public website reads dynamic data and admin changes invalidate the root layout through `revalidatePath`. No content deployment is required. Saved drafts have protected public-rendering links; unsaved content has an editor preview. Research must have public disclosure status before publishing. Changing a published slug offers redirect creation. Redirects validate destinations and reject loops.

## Verify

```bash
npm run typecheck
npm run test
npx playwright install chromium
npm run test:e2e
npm run build
node tests/production-smoke.mjs
```

Tests exercise actual SQL in embedded PostgreSQL, anonymous/authenticated/server roles, RLS, resumes, role permissions, research safeguards, job publication/audit, transactional intake, closed-job rejection, private notes, and concurrent editing. Browser tests use an isolated development demo for owner workflows and viewport checks at 360/375/390/430/768/1024/1280/1440/1920px, both public themes, axe, keyboard navigation and reduced motion. This does not replace staging tests against real Supabase Auth/Storage, Resend and Turnstile. No Lighthouse score is claimed without measurement.

## Vercel deployment

Import as a Next.js project, use Node 22+ and the standard build command/lockfile. Set environment values, apply migrations, initialize configuration, provision the owner, verify Auth callbacks, and attach your real domain. Keep `XARMOURED_DEMO=false`. Validate forms, private files and permissions on staging before production traffic.

## Owner information required

- Real company details, legal entity if applicable, country, optional phone/address, verified sales/support/careers/security emails. Production initialization leaves these blank.
- Actual social links, team photos, services, FAQs, and publication-ready copy.
- Complete reviewed privacy/terms pages, retention rules and data-contact instructions. Starter legal notices are incomplete and state that review is required.
- Resend/Turnstile credentials and the real booking event.
- A real redacted sample report; actual jobs and responsibly disclosed research.
- A staging acceptance pass: sign in, post/close a job, review applications/resumes, preview/publish research, edit services/homepage/FAQs, review/track an assessment, upload a report, edit contact/social settings, inspect activity.

## Backups and exports

Use Supabase managed backups/PITR according to your plan, schedule encrypted offsite exports, and test restores on a separate project. A trusted workstation can run `pg_dump "$DATABASE_URL" --format=custom --file=xarmoured.backup`; keep the connection secret in a secret manager. Storage bytes require separate backup; they are not contained in a database dump.

Authorized CSV exports include explicit limited fields. Internal notes/resume paths are excluded, formula prefixes are neutralized, and downloads are private/no-store. Protect exports as personal/business data.

## V1 boundaries

One company and one coherent dark workspace. Pipeline updates use accessible status controls rather than drag-and-drop. Services, FAQs, team profiles, and navigation support drag ordering and accessible arrow controls. Notifications refresh on navigation. Lists/search currently cap at 1,000 records; add server pagination before that scale. User provisioning/all-device revocation remain in trusted Supabase utilities. No arbitrary page builder, multi-tenancy, payroll, chat, autonomous AI, client portal, or fake telemetry is included.

## Website evolution

New public architecture: `/resources`, `/resources/[slug]`, `/case-studies` and detail (only when actual public records exist), `/industries` and detail (only when populated), `/security`, `/.well-known/security.txt`, `/contact` → assessment. Research and service details expose richer structured fields. Homepage adds a four-state boundary diagram, grouped capabilities, seven-stage lifecycle, editorial research and an illustrative report explorer. Public themes follow system preference and persist an explicit selection; the operating workspace retains its dark theme. No production service fallback or fictional proof records are published.

Admin adds Resources, Case studies, Industries and Service categories, extends service/advisory metadata, homepage switches/lifecycle copy, job eligibility and disclosure settings. Existing CRM/ATS/media/auth/analytics/audit workflows are preserved. Apply migration 007 before deploying the new app. It expands module/RLS/role/settings allowlists and adds publication constraints without changing existing records.

The only added dependency is development-only `@axe-core/playwright` for automated accessibility checks. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` optionally selects an existing browser.

Read [the launch checklist](docs/launch-checklist.md) for exact test and deployment steps, [the audit](docs/current-system-audit.md), [benchmark](docs/competitive-benchmark.md), [brand system](docs/brand-system.md), [design system](docs/design-system.md), [information architecture](docs/information-architecture.md), [content model](docs/content-model.md), [security review](docs/security-review.md), and [SEO strategy](docs/seo-strategy.md). Missing security.txt configuration intentionally returns 503; configure a real monitored email, HTTPS canonical and expiry before launch.

Build tooling: `npm run build` explicitly selects Next.js’s supported Webpack bundler. The default Turbopack build stalled on this constrained host during baseline verification; Webpack completed. No runtime dependency was added.

Verification evidence and environment limits are recorded in [docs/verification.md](docs/verification.md). The complete development E2E workflow remains a release gate: this constrained host lost its Next dev server during the run. Production browser/security smoke checks are separate and passed. Run `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:production` after building to include browser, accessibility and responsive checks; without that variable the production smoke script runs HTTP checks only.
