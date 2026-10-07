# Content model

Retain records JSONB, existing metadata, slug uniqueness, audit/conflict RPC and status-based RLS. Additive migration 007 extends allowed modules, editor role scope and public settings projection; no existing rows are seeded, dropped or rewritten.

New structured modules: service_categories (summary/order), resources (category/summary/Markdown/download/date/tags), case_studies (customer or anonymized identity, industry, problem, scope, approach, findings, outcome, optional approved testimonial, related service slugs, date, featured), industries (summary/Markdown/services/order). Draft/published/archived; cases also have explicit public/private visibility with DB and application enforcement. No initial records.

Services: category, audience, problem, attack paths, methodology, example scope, process, retesting, related research/services, featured, plus existing testing areas/features/deliverables/FAQs/SEO/order. Publishing requires real summary, description and testing areas. Future engineering/assurance services stay draft until available.

Research: existing CVE/CWE/CVSS/vendor/product/researcher/disclosure plus category, affected/fixed versions, publication date, timeline, advisory URL, GitHub advisory, tags, featured and related service slugs. Only populated fields render. Raw HTML/MDX never executes. Public disclosure remains mandatory.

Pages: controlled homepage fields, section toggles and seven lifecycle descriptions. No unrestricted layout builder. Legal pages remain Pages. First-party analytics adds job_view, sample_report_view and cta_used to the database event allowlist; assessment_start occurs on first interaction rather than page load. Event totals remain event totals, never unique visitors.

Site settings add security.txt canonical, policy, languages, expiration and reviewed-policy switch; security email must be real. Fixed expiration forces periodic review; expired/missing configuration returns 503 rather than a fabricated reporting channel.

Assessment requests remain Leads; role, target type, authentication, environment and retest fields extend the same validated intake and appear in the existing editor. Every published content module supports SEO, featured, date and order where useful. created/updated actors and publication timestamps remain DB-owned.

Apply all migrations in numeric order on staging, validate permissions, then production. To roll back application code safely leave the additive schema in place; archive new content before removing module support. Never reset the database.
