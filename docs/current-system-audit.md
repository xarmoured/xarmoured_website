# Current system audit

Audit date: 2026-10-07. Working tree initially clean. Audit precedes implementation.

## System map
Next.js App Router 16, React 19, TypeScript, Tailwind 4 and a substantial handcrafted CSS system. Inter Variable / IBM Plex Mono are locally packaged. Framer Motion handles reveals and reorder; Lucide handles icons. Public shell and catch-all route render structured records. Admin is a separate authenticated route group.

Public routes: /, /services, /services/[slug], /methodology, /research, /research/[slug], /about, /careers, /careers/[slug], /careers/general (setting gated), /assessment, /sample-report, /privacy, /terms, /labs (setting gated), arbitrary published Pages, /robots.txt, /sitemap.xml. Preview query requires module read permission. Auth callback exchanges a code and always redirects to the fixed account route.

Admin: overview, leads CRM, applications ATS, jobs, research, services, pages, FAQs, team, media, reports, navigation, announcements, redirects, SEO, analytics, settings, notifications, activity, account, login. Shared module registry drives forms, list/detail views, publication states and permissions. Editor supports preview review, Markdown, autosave for selected drafts, conflict detection, notes and timelines. Search palette, filters, mobile lists and accessible ordering already exist.

## Data / authorization
Six ordered SQL migrations define records (JSONB module data), profiles, internal_notes, record_activity, audit_logs, media_files, analytics_events, communication_logs and rate_limits. Domain views use security_invoker. save_record atomically checks roles, writes activity/audit, preserves private application identifiers, and rejects stale writes. receive_submission is service-role-only and validates job state transactionally. Research cannot publish until disclosure=public in API and DB. Public reads use publication status and RLS. Public settings RPC projects an explicit allowlist; email templates stay private.

Roles: owner, admin, editor, recruiter, viewer. Server verifies Supabase identity and enabled profile. UI permission logic mirrors SQL. Viewer has aggregates, not contact data. Recruiter has jobs/applicants, not leads. Auth cookies HttpOnly, Secure in production, SameSite=Lax. Demo is development-only and clearly labelled; production ignores demo flag.

## Integrations
Supabase Auth/Postgres/Storage; Resend receipts and explicit admin template emails; Cloudflare Turnstile with server hostname verification. Cal.com is an optional configured link. First-party event analytics store event counts without visitor identifiers; hashed IP rate-limit keys. Public intake uses origin checks, honeypot, Zod, durable throttling, server persistence and notifications. Missing Turnstile fails closed. Resume PDF checks size/MIME/signature; private storage, authorized 60-second signed URLs. Public images/PDF and private internal assets are separated. CSV exports neutralize spreadsheet formulas.

## Existing controls / SEO
Proxy sets CSP, frame denial, nosniff, referrer/permissions policy and private admin caching. Redirect loop/safe URL checks exist. Markdown uses react-markdown with safe links and no raw HTML/MDX. Dynamic metadata, Organization JSON-LD, robots and sitemap exist, but canonical/detail schemas and feature-aware sitemap need work. Security disclosure and security.txt are absent. CSP permits inline framework scripts/styles; evaluate exact installed framework before altering.

## Design and debt
Charcoal/copper, locally hosted fonts, Reveal, ButtonLink, Brand, ServiceIcon, Status, attack diagram, editorial rows, report preview, FAQ details and admin workspace are reusable. Public home has repeated service cards, limited diagram states, no theme switch or services mega-menu. Research lacks filters and richer advisory fields. Default services are shown without configured CMS; remove production fallback to avoid implying enabled capabilities. Catch-all accepts excess path segments and needs strict matching. CSS has multiple accumulated responsive/polish layers; scope new public design separately to protect admin. No case-study/resources/industries/service-category modules yet. Lists cap at 1,000 records; server pagination is future scale work.

## Preserve
Keep authentication, SQL/RLS, role registry, transactional intake, private storage, email delivery, analytics, admin editor/list/workflow, ordering and demo isolation. Extend additive JSON fields/modules and SQL allowlists. Do not replace with a new CMS or client-only authorization.

## Baseline checks
Initial npm ci could not start: npm and Node absent from PATH. Downloaded official Node 22.20.0 into /tmp/xarmoured-runtime (no OS installation, no project dependency). Baseline results are appended after installation and before code edits. No environment secrets or real company data were supplied.

Baseline results: npm ci passed with official temporary Node 22.20.0. npm run typecheck passed. npm run test: 2 files, 19 tests passed. Default npm run build (Turbopack) remained compiling for roughly six minutes and was terminated for a bounded fallback. npm run build -- --webpack passed (compilation, TypeScript, page generation and traces). Baseline owner-workflow E2E could not start within its original 240-second webServer timeout; no browser assertion was reached. Chromium download timed out; system /usr/bin/chromium is available. These are environment execution limitations, not observed application regressions.
