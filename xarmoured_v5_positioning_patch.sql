-- Xarmoured v5 positioning patch (CMS content only).
--
-- Run AFTER xarmoured_v4_launch_patch.sql and AFTER deploying the matching code.
-- BACK UP THE DATABASE FIRST. Every statement merges JSON into existing rows
-- (existing keys not named here are preserved) and is safe to re-run.
--
-- What this does:
--   1. Homepage record: new hero copy, CTAs (Request an Assessment / Explore Protocol),
--      section toggles for the new Who / Defensive / Protocol sections, research ON.
--   2. About page record: company narrative.
--   3. Creates the 'protocol' and 'partners' page records (SEO + optional extra content;
--      the pages themselves are rendered by code so maturity labels cannot drift).
--   4. Orders the Solutions list so E-commerce sits last (URL unchanged).
--   5. Adds 3 FAQs.
--   6. Verified research attribution for ONE record (UnoPim). See the research section.
--
-- What this deliberately does NOT do:
--   * It does not publish, unpublish, edit or delete any research record.
--   * It does not touch leads, jobs, settings flags, navigation or any status.
--   * It does not assert Protocol functionality: all copy says in development / planned.

begin;

-- 1. HOMEPAGE ---------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values ('pages', 'Homepage', 'home', 'published', $xj${
  "eyebrow": "OFFENSIVE SECURITY · DEFENSIVE ENGINEERING · RESEARCH",
  "headline": "Engineering security\nfrom both sides of the attack.",
  "summary": "Xarmoured is an independent, founder-led cybersecurity engineering company. We test web applications, APIs and Android apps today, and we are building defensive engineering and our own platform, Protocol, on the same evidence.",
  "primary_label": "Request an Assessment",
  "primary_url": "/assessment",
  "secondary_label": "Explore Protocol",
  "secondary_url": "/protocol",
  "show_who": true,
  "show_defensive": true,
  "show_protocol": true,
  "show_research": true,
  "seo_title": "Xarmoured | Cybersecurity Engineering, Offensive Security & Research",
  "seo_description": "Xarmoured is an independent, founder-led cybersecurity engineering company. Manual web, API and Android penetration testing today; defensive engineering and the Protocol platform in development.",
  "canonical_path": "/"
}$xj$::jsonb, now())
on conflict (module, slug) do update
  set data = coalesce(public.records.data, '{}'::jsonb) || excluded.data, updated_at = now();

-- 2. ABOUT ------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values ('pages', 'About Xarmoured', 'about', 'published', $xj${
  "headline": "Engineering security\nfrom both sides of the attack.",
  "summary": "Xarmoured is an independent, founder-led cybersecurity engineering company. We test how systems fail today, and we are building defensive engineering capability and our own platform, Protocol, on the same evidence.",
  "content": "## Why Xarmoured exists\n\nSecurity work often ends at a report. A finding is written down, a ticket is closed, and nobody can easily show what was tested, what changed or whether the fix held. Xarmoured exists to do that work properly and to build the technology that makes it durable.\n\n## Engineering first\n\nWe approach security as an engineering problem: understand the system, challenge its assumptions, produce reproducible evidence, and help engineers fix the cause. Automated tools help with coverage. Authorization, business logic and attack chaining need deliberate, manual analysis.\n\n## Both sides of the attack\n\nOffensive security is the foundation we deliver today. Every confirmed attack path raises a second question: would anyone have noticed? We are expanding into defensive security, through detection validation and threat hunting, to help answer it. That work is in development and is not yet offered as a service.\n\n## Research-driven\n\nPublished research and responsible disclosure keep our methods honest. Research entries name the researcher and link the public advisory.\n\n## Why we are building Protocol\n\nProtocol is our proprietary security engineering platform, under active development. It is built around evidence lineage, the findings lifecycle, remediation tracking and retest verification, with a longer-term ambition of connecting offensive testing to defensive validation. [Read more about Protocol](/protocol).\n\n## How we are built\n\nXarmoured is independent and founder-led. We are growing deliberately, through engineering, research and customer engagements, and we aim to be useful to organizations well beyond where we start.\n\n## What we do not claim\n\nWe are an early-stage company, not a 24/7 managed security provider, a SOC, a compliance certification body or a large consulting agency. We do not invent client testimonials, certifications, partnerships or service statistics. Xarmoured does not currently operate a formal partner program.\n\n## Location and working model\n\nBased in India, remote-first. Delivery logistics, commercial terms and security requirements are agreed during scoping.",
  "seo_title": "About Xarmoured | Independent Cybersecurity Engineering",
  "seo_description": "Xarmoured is an independent, founder-led cybersecurity engineering company: offensive security today, defensive engineering and the Protocol platform in development.",
  "canonical_path": "/about/",
  "primary_label": "Talk to an Engineer",
  "primary_url": "/assessment",
  "content_type": "landing",
  "show_research": false,
  "show_careers": false
}$xj$::jsonb, now())
on conflict (module, slug) do update
  set data = coalesce(public.records.data, '{}'::jsonb) || excluded.data, updated_at = now();

-- 3. PROTOCOL AND PARTNERS PAGE RECORDS (SEO + optional appended content) ----
insert into public.records (module, title, slug, status, data, published_at)
values ('pages', 'Protocol', 'protocol', 'published', $xj${
  "headline": "From finding vulnerabilities to proving security improvements.",
  "summary": "Protocol is the security engineering platform being developed by Xarmoured. In development; not generally available.",
  "content": "",
  "seo_title": "Protocol (In Development) | Evidence-led Security Engineering | Xarmoured",
  "seo_description": "Protocol is the security engineering platform being developed by Xarmoured to connect offensive assessments, defensive validation and security intelligence. In development; not generally available.",
  "canonical_path": "/protocol/",
  "content_type": "landing"
}$xj$::jsonb, now())
on conflict (module, slug) do update
  set data = coalesce(public.records.data, '{}'::jsonb) || excluded.data, updated_at = now();

insert into public.records (module, title, slug, status, data, published_at)
values ('pages', 'Partners and collaboration', 'partners', 'published', $xj${
  "headline": "Work with Xarmoured.",
  "summary": "Case-by-case collaboration with consultancies, MSSPs, vendors and researchers. Xarmoured does not operate a formal partner program.",
  "content": "",
  "seo_title": "Partners and Collaboration | Xarmoured",
  "seo_description": "Xarmoured is open to collaboration with security consultancies, MSSPs, vendors and independent researchers. There is no formal partner program; collaboration is discussed case by case.",
  "canonical_path": "/partners/",
  "content_type": "landing"
}$xj$::jsonb, now())
on conflict (module, slug) do update
  set data = coalesce(public.records.data, '{}'::jsonb) || excluded.data, updated_at = now();

-- 4. SOLUTIONS ORDER (E-commerce stays published and reachable, listed last) -
update public.records set data = coalesce(data, '{}'::jsonb) || '{"order": 10}'::jsonb, updated_at = now()
  where module = 'industries' and slug = 'saas';
update public.records set data = coalesce(data, '{}'::jsonb) || '{"order": 20}'::jsonb, updated_at = now()
  where module = 'industries' and slug = 'startups';
update public.records set data = coalesce(data, '{}'::jsonb) || '{"order": 90}'::jsonb, updated_at = now()
  where module = 'industries' and slug = 'ecommerce';

-- 5. FAQS -------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at) values
('faqs', 'Is Protocol available?', 'is-protocol-available', 'published',
 $xj${"answer": "No. Protocol is the security engineering platform Xarmoured is developing. It is under active development with no public release, pricing or launch date, and we are not offering early access. You are welcome to [discuss it with us](/assessment?topic=protocol).", "category": "General", "order": 40}$xj$::jsonb, now()),
('faqs', 'Do you offer defensive security services?', 'do-you-offer-defensive-security-services', 'published',
 $xj${"answer": "Not yet. Defensive engineering, including detection validation and threat hunting, is in development. Our available services are web application, API and Android penetration testing and retesting. We do not offer SOC, MDR or 24/7 monitoring.", "category": "General", "order": 41}$xj$::jsonb, now()),
('faqs', 'Whose research is published on this site?', 'whose-research-is-published-on-this-site', 'published',
 $xj${"answer": "Research entries name the researcher and link the public advisory. Where the advisory supports it, an entry reads \"Research by <researcher>, published through Xarmoured\". Xarmoured does not claim ownership of discoveries that belong to an individual researcher.", "category": "General", "order": 42}$xj$::jsonb, now())
on conflict (module, slug) do update
  set title = excluded.title,
      data = coalesce(public.records.data, '{}'::jsonb) || excluded.data,
      updated_at = now();

-- 6. RESEARCH ATTRIBUTION ---------------------------------------------------
-- Verified against public CVE records on 2026-11-06. Nothing is published,
-- unpublished or deleted here; this only sets researcher attribution.
--
-- VERIFIED: UnoPim, CVE-2026-82524. The CVE record (assigner VulnCheck) lists a
-- "Researcher Blog" reference on ashutosh-jena.in and confirms the fix in 2.1.5.
update public.records
   set data = coalesce(data, '{}'::jsonb) || '{"researcher": "Ashutosh Jena", "attribution_verified": true}'::jsonb,
       updated_at = now()
 where module = 'research'
   and slug = 'unopim-unrestricted-file-upload-rce-cve-2026-82524';

-- PENDING FOUNDER CONFIRMATION (not applied): Invoice Ninja CVE-2026-83743,
-- Invoice Ninja CVE-2026-83744, BookStack CVE-2026-86285. The public CVE records
-- credit the reporter as the VulDB user "MAVERICK-VF142" (not by personal name) and
-- reference write-ups on ashutosh-jena.in. If Ashutosh Jena confirms that handle is
-- his, run the statement below to switch attribution on:
--
-- update public.records
--    set data = coalesce(data, '{}'::jsonb) || '{"researcher": "Ashutosh Jena", "attribution_verified": true}'::jsonb,
--        updated_at = now()
--  where module = 'research'
--    and slug in (
--      'invoice-ninja-vendor-portal-idor-cve-2026-83743',
--      'invoice-ninja-ssrf-cve-2026-83744',
--      'bookstack-attachment-access-control-cve-2026-86285');
--
-- NOT VERIFIED (not applied): Cachet, CVE-2026-113712. Only one third-party
-- aggregator listed this ID; no primary CVE record, vendor advisory link or
-- researcher credit was found. Its attribution stays off. Recommended (your
-- decision, not done here): revert to draft until a public advisory link is
-- confirmed:
--
-- update public.records set status = 'draft', published_at = null, updated_at = now()
--  where module = 'research' and slug = 'cachet-stored-xss-research';

commit;
