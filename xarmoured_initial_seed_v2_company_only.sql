-- Xarmoured initial production content seed
-- Generated for the existing public.records CMS schema.
-- Safe scope: only inserts/updates the specific module+slug records below.
-- It does NOT delete existing records, users, leads, applications, or media.

begin;

-- -----------------------------------------------------------------------------
-- CLEANUP OF PERSONAL RESEARCH
-- These disclosures belong to Ashutosh Jena personally and are intentionally
-- NOT presented as Xarmoured company research or company-delivered work.
-- Safe to run even if these records do not exist.
-- -----------------------------------------------------------------------------
delete from public.records
where module = 'research'
  and slug in (
    'unopim-unrestricted-file-upload-rce-cve-2026-82524',
    'invoice-ninja-vendor-portal-idor-cve-2026-83743',
    'invoice-ninja-ssrf-cve-2026-83744',
    'bookstack-attachment-access-control-cve-2026-86285',
    'cachet-stored-xss-research'
  );

-- -----------------------------------------------------------------------------
-- SITE SETTINGS
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values (
  'settings',
  'Website settings',
  'site',
  'published',
  jsonb_build_object(
    'company', 'Xarmoured',
    'description', 'Offensive security and security engineering focused on web applications, APIs, mobile applications, and remediation validation.',
    'country', 'India',
    'founder_website', 'https://ashutosh-jena.in',
    'assessment_enabled', true,
    'careers_enabled', false,
    'general_applications', false,
    'research_enabled', false,
    'labs_enabled', false,
    'sample_report_enabled', false,
    'announcements_enabled', false,
    'remote', 'Remote',
    'sales_cta', 'Request an assessment',
    'lead_source', 'Website'
  ),
  now()
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = now();

-- -----------------------------------------------------------------------------
-- GLOBAL SEO
-- Replace site_url / og_image later in Admin once your final production domain
-- and social image are ready.
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values (
  'seo',
  'Global SEO',
  'global',
  'published',
  jsonb_build_object(
    'default_title', 'Xarmoured — Offensive Security & Security Engineering',
    'title_template', '%s — Xarmoured',
    'description', 'Manual-first penetration testing for web applications, APIs and mobile applications, with evidence-driven reporting, remediation guidance and retesting.',
    'organization', 'Xarmoured is an offensive security practice focused on penetration testing, evidence-driven reporting, remediation guidance and retesting.'
  ),
  now()
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = now();

-- -----------------------------------------------------------------------------
-- HOMEPAGE
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values (
  'pages',
  'Homepage',
  'home',
  'published',
  jsonb_build_object(
    'eyebrow', 'OFFENSIVE SECURITY. EVIDENCE OVER ASSUMPTIONS.',
    'headline', E'Security that survives\ncontact with an attacker.',
    'summary', 'Manual-first penetration testing for web applications, APIs and mobile applications. We validate real attack paths, explain the impact, and help you close the loop with remediation and retesting.',
    'primary_label', 'Request an assessment',
    'primary_url', '/assessment',
    'secondary_label', 'See how we test',
    'secondary_url', '/methodology',
    'services_heading', E'Test the paths\nthat actually matter.',
    'research_heading', 'Technical research and publications.',
    'methodology_cta', 'See our methodology',
    'final_cta', E'Find the weakness.\nFix the cause. Verify the boundary.',
    'show_research', false,
    'show_report', false,
    'show_careers', false,
    'show_labs', false,
    'seo_title', 'Xarmoured — Offensive Security & Security Engineering',
    'seo_description', 'Manual-first web, API and mobile penetration testing with clear evidence, remediation guidance and retesting.'
  ),
  now()
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = now();

-- -----------------------------------------------------------------------------
-- ABOUT PAGE
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values (
  'pages',
  'About Xarmoured',
  'about',
  'published',
  jsonb_build_object(
    'headline', E'Offensive security,\nwithout the theatre.',
    'summary', 'Xarmoured is an early-stage offensive security practice built around manual testing, clear evidence, practical remediation and retesting.',
    'content', $md$
## What we believe

Security work is useful only when it changes an engineering decision.

That means going beyond scanner output: understanding how an application is supposed to behave, challenging authorization and trust boundaries, validating exploitability, and documenting the result so the team responsible for the system can reproduce and fix it.

## What we focus on

Xarmoured currently focuses on:

- Web application penetration testing
- API security testing
- Mobile application security testing
- Remediation validation and retesting

We are deliberately not presenting ourselves as a SOC, MDR provider, compliance auditor, or large consulting firm. The practice will expand only when the capability exists to deliver the work properly.

## How we work

Every engagement starts with explicit authorization and a defined scope. Testing is manual-first, supported by tooling where it improves coverage. Findings are validated before reporting, tied to realistic impact, and written for both security teams and engineers.

The goal is not a longer vulnerability list. The goal is a clearer picture of what can actually go wrong and what needs to change.
$md$,
    'seo_title', 'About Xarmoured',
    'seo_description', 'Learn how Xarmoured approaches offensive security, penetration testing, remediation-focused reporting and retesting.'
  ),
  now()
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = now();

-- -----------------------------------------------------------------------------
-- PRIVACY PAGE
-- This is intentionally conservative. Review it against your actual vendors,
-- retention periods and legal obligations before treating it as final legal text.
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values (
  'pages',
  'Privacy',
  'privacy',
  'published',
  jsonb_build_object(
    'summary', 'How information submitted through the Xarmoured website is handled.',
    'content', $md$
## Information you submit

Xarmoured may collect information you choose to provide through assessment request forms, contact workflows, and other website forms. This may include your name, work email, company information, project scope, technical environment, and messages you submit.

If careers functionality is enabled in the future, job applications may also include profile links, work history, and a resume.

## Why we use it

Submitted information is used to review your request, communicate with you, scope potential work, operate the website, maintain security, and keep an internal record of relevant business communications.

## Access and storage

Administrative records are restricted to authorized Xarmoured administrators. Private application documents and internal files are not intended for public access.

Xarmoured may rely on infrastructure providers for hosting, database, storage, email delivery, and abuse prevention. Those providers may process information as necessary to provide their services.

## Your requests

You may ask Xarmoured to correct or delete information you have submitted, subject to legitimate security, contractual, legal, or record-keeping requirements.

## Security research and testing

Submitting information through this website does not authorize testing of Xarmoured systems or any third-party system. Security testing requires explicit authorization and an agreed scope.

## Updates

This notice may be updated as the company, website, and service providers change.
$md$,
    'seo_title', 'Privacy',
    'seo_description', 'Privacy information for data submitted through the Xarmoured website.'
  ),
  now()
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = now();

-- -----------------------------------------------------------------------------
-- TERMS PAGE
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values (
  'pages',
  'Terms',
  'terms',
  'published',
  jsonb_build_object(
    'summary', 'Basic terms for use of the Xarmoured website.',
    'content', $md$
## Website information

The material on this website is provided for general information about Xarmoured, its security services, and published research. It is not a substitute for a written statement of work, rules of engagement, contract, or professional advice tailored to a specific environment.

## No authorization to test

Nothing published on this website authorizes security testing, scanning, exploitation, access, or interference with Xarmoured systems or third-party systems.

Any penetration test or security assessment performed by Xarmoured requires explicit authorization, an agreed scope, rules of engagement, and applicable commercial and confidentiality terms before testing begins.

## Research

Security research is published for defensive, educational, and responsible-disclosure purposes. References to third-party products do not imply affiliation or endorsement.

## External links

The website may link to third-party resources. Xarmoured is not responsible for third-party content, availability, or privacy practices.

## Changes

These terms may change as the website and business evolve.
$md$,
    'seo_title', 'Terms',
    'seo_description', 'Terms governing use of the Xarmoured website and clarification that website content does not authorize security testing.'
  ),
  now()
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = now();

-- -----------------------------------------------------------------------------
-- RESPONSIBLE DISCLOSURE PAGE
-- Kept as DRAFT until you add a real security contact address in Settings.
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data)
values (
  'pages',
  'Responsible Disclosure',
  'security',
  'draft',
  jsonb_build_object(
    'headline', 'Report a security issue responsibly.',
    'summary', 'Guidance for reporting security issues affecting systems owned and operated by Xarmoured.',
    'content', $md$
## Before reporting

Only test systems that Xarmoured explicitly identifies as in scope for security research. Do not access, modify, destroy, or retain data belonging to other users. Avoid denial-of-service activity, social engineering, physical attacks, spam, and disruption of production services.

## What to include

A useful report should include:

- The affected Xarmoured-owned asset
- A clear description of the issue
- Reproduction steps
- Relevant requests and responses with secrets removed
- The security impact
- Any suggested remediation

## Contact

**Before publishing this page, add a dedicated security email address in Admin → Settings and replace this section with that address.**

## Disclosure

Please give Xarmoured reasonable time to investigate and remediate a valid issue before public disclosure. Xarmoured will not ask researchers to hide unresolved risk indefinitely, but timelines should be coordinated in good faith.
$md$,
    'seo_title', 'Responsible Disclosure',
    'seo_description', 'Guidance for responsibly reporting security issues affecting Xarmoured-owned systems.'
  )
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = null;

-- -----------------------------------------------------------------------------
-- SERVICES: publish only capabilities that are defensible today.
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values
(
  'services',
  'Web Application Penetration Testing',
  'web-application-penetration-testing',
  'published',
  jsonb_build_object(
    'summary', 'Manual-first testing of authentication, authorization, business logic, input handling and the attack paths scanners routinely miss.',
    'description', $md$
## Test the application the way an attacker sees it

A useful web application assessment is not a vulnerability scan with a nicer PDF. We map the application's trust boundaries, roles, workflows, and exposed functionality, then test where those assumptions can fail.

The focus is on exploitable behavior: broken access control, authentication weaknesses, business-logic abuse, injection, unsafe file handling, server-side request behavior, client-side security issues, and combinations of weaknesses that create a larger attack path.
$md$,
    'icon', 'globe',
    'testing_areas', E'Authentication and session management\nAuthorization, IDOR and privilege boundaries\nBusiness logic and workflow abuse\nInjection vulnerabilities\nServer-side request forgery and unsafe outbound requests\nFile upload and file-processing security\nCross-site scripting and browser-side security\nSensitive data exposure\nSecurity misconfiguration\nAttack chaining and practical impact validation',
    'deliverables', $md$
## What you receive

- Validated findings with clear severity and impact
- Reproduction steps and supporting evidence
- Affected functionality and attack preconditions
- Remediation guidance written for engineers
- Executive-level context for decision makers
- Retesting of agreed remediated findings when included in scope
$md$,
    'timeline', 'Defined during scoping based on application size, roles, access level and testing environment.',
    'order', 1,
    'seo_title', 'Web Application Penetration Testing',
    'seo_description', 'Manual-first web application penetration testing focused on authorization, authentication, business logic, server-side flaws and validated attack paths.'
  ),
  now()
),
(
  'services',
  'API Security Testing',
  'api-security-testing',
  'published',
  jsonb_build_object(
    'summary', 'Test object authorization, authentication, data exposure, workflow abuse and trust between API consumers and backend services.',
    'description', $md$
## APIs expose the decisions your application trusts

API testing focuses on more than endpoint discovery. We examine how identities, objects, roles, tokens, workflows, and backend services interact—and what happens when a client stops behaving the way the application expects.

Testing is aligned with real API attack patterns while remaining specific to your implementation and business rules.
$md$,
    'icon', 'code',
    'testing_areas', E'Broken object-level authorization (BOLA / IDOR)\nBroken function-level authorization\nAuthentication and token handling\nJWT and session security\nMass assignment and property-level authorization\nExcessive data exposure\nRate limiting and resource abuse\nBusiness-flow abuse\nInjection and unsafe input handling\nSSRF and backend trust relationships\nREST endpoint security\nAPI inventory and undocumented attack surface',
    'deliverables', $md$
## What you receive

A technical report containing validated vulnerabilities, affected requests and roles, reproduction guidance, impact analysis, remediation recommendations, and a prioritized path to verification.
$md$,
    'timeline', 'Defined during scoping based on endpoint count, authentication model, roles, documentation and environment.',
    'order', 2,
    'seo_title', 'API Security Testing',
    'seo_description', 'API penetration testing focused on authorization, authentication, business logic, data exposure, backend trust and exploitable API attack paths.'
  ),
  now()
),
(
  'services',
  'Mobile Application Security Testing',
  'mobile-application-security-testing',
  'published',
  jsonb_build_object(
    'summary', 'Assess Android application behavior across the client, local storage, transport layer and backend APIs.',
    'description', $md$
## The mobile client is only one part of the attack surface

Mobile testing looks at what the application stores, trusts, exposes, transmits and delegates to backend services. Static and dynamic analysis are combined with API testing so client-side weaknesses are not reviewed in isolation.

Current Xarmoured mobile testing is strongest on Android applications.
$md$,
    'icon', 'smartphone',
    'testing_areas', E'APK static analysis\nApplication permissions and exported components\nLocal data storage\nSecrets and sensitive data in the application package\nNetwork security and TLS behavior\nWebView and deep-link handling\nAuthentication and session behavior\nBackend API authorization\nRuntime behavior and dynamic analysis\nClient-side trust and tampering resistance',
    'deliverables', $md$
## What you receive

Validated mobile and backend findings, evidence, affected components, realistic impact, remediation guidance, and retest results for agreed fixes.
$md$,
    'timeline', 'Defined during scoping based on application size, build availability, authentication flow and backend/API coverage.',
    'order', 3,
    'seo_title', 'Mobile Application Security Testing',
    'seo_description', 'Android application security testing across APK behavior, local storage, transport, client-side trust and backend API authorization.'
  ),
  now()
),
(
  'services',
  'Retesting & Remediation Validation',
  'retesting-remediation-validation',
  'published',
  jsonb_build_object(
    'summary', 'Verify that remediation closes the original attack path without relying on screenshots, tickets or assumptions.',
    'description', $md$
## A finding is not closed because a ticket moved to Done

Retesting returns to the original weakness, replays the relevant attack path, checks the implemented fix, and records whether the security boundary now holds.

Where a fix changes surrounding behavior, we also look for obvious bypasses or incomplete remediation within the agreed retest scope.
$md$,
    'icon', 'shield',
    'testing_areas', E'Original finding reproduction\nRemediation verification\nAuthorization and access-control regression\nBypass checks around the implemented fix\nEvidence capture\nRetest status and residual risk',
    'deliverables', $md$
## What you receive

A concise retest record for each agreed finding showing the original issue, the remediation state, verification evidence, and whether the finding is resolved, partially resolved, or still reproducible.
$md$,
    'timeline', 'Scheduled after remediation is ready and the affected environment is available for verification.',
    'order', 4,
    'seo_title', 'Security Retesting & Remediation Validation',
    'seo_description', 'Security retesting that verifies whether remediation actually closes the original vulnerability and attack path.'
  ),
  now()
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = now();

-- Future capabilities kept as DRAFT. Do not publish until you are genuinely ready
-- to scope and deliver them to a client without hand-waving.
insert into public.records (module, title, slug, status, data)
values
(
  'services',
  'Network & Infrastructure Penetration Testing',
  'network-infrastructure-penetration-testing',
  'draft',
  jsonb_build_object(
    'summary', 'Draft capability. Publish only after the engagement methodology, lab depth, reporting standard and delivery scope are ready.',
    'icon', 'network',
    'order', 20
  )
),
(
  'services',
  'Security Architecture Review',
  'security-architecture-review',
  'draft',
  jsonb_build_object(
    'summary', 'Draft future security-engineering capability. Do not publish until there is a defined review method and deliverable standard.',
    'icon', 'shield',
    'order', 21
  )
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = null;

-- -----------------------------------------------------------------------------
-- FAQS
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data, published_at)
values
(
  'faqs',
  'What happens during a penetration test?',
  'what-happens-during-a-penetration-test',
  'published',
  jsonb_build_object(
    'answer', 'We agree on scope, authorization and testing constraints first. The assessment then combines manual exploration with focused tooling, validates findings before reporting, documents reproducible evidence, and ends with remediation guidance and an optional retest.',
    'category', 'General',
    'order', 1
  ),
  now()
),
(
  'faqs',
  'Do you only run automated scanners?',
  'do-you-only-run-automated-scanners',
  'published',
  jsonb_build_object(
    'answer', 'No. Tools help with coverage and repetitive checks, but the engagement is manual-first. Authorization, business logic, attack chaining and context require human analysis.',
    'category', 'General',
    'order', 2
  ),
  now()
),
(
  'faqs',
  'Can you test a production application?',
  'can-you-test-production',
  'published',
  jsonb_build_object(
    'answer', 'Potentially, but only after the environment, testing windows, prohibited actions and operational safeguards are agreed. Where production risk is unnecessary, staging or a representative test environment is preferable.',
    'category', 'Web Pentesting',
    'order', 3
  ),
  now()
),
(
  'faqs',
  'What do we receive after the assessment?',
  'what-do-we-receive-after-the-assessment',
  'published',
  jsonb_build_object(
    'answer', 'You receive validated findings with affected functionality, severity, impact, reproduction guidance, evidence and remediation recommendations. The reporting goal is to give engineers enough detail to act without losing the business context.',
    'category', 'General',
    'order', 4
  ),
  now()
),
(
  'faqs',
  'Do you retest fixes?',
  'do-you-retest-fixes',
  'published',
  jsonb_build_object(
    'answer', 'Yes. A retest checks the original attack path against the remediated system and records whether the issue is resolved, partially resolved or still reproducible.',
    'category', 'General',
    'order', 5
  ),
  now()
),
(
  'faqs',
  'What do you need to scope an API assessment?',
  'what-do-you-need-for-api-scope',
  'published',
  jsonb_build_object(
    'answer', 'Useful inputs include API documentation or collections, base URLs, authentication flows, available roles, test accounts, environment details, approximate endpoint count, rate-limit constraints and any high-risk business workflows you want prioritized.',
    'category', 'API Security',
    'order', 6
  ),
  now()
),
(
  'faqs',
  'What mobile platforms do you currently focus on?',
  'what-mobile-platforms-do-you-focus-on',
  'published',
  jsonb_build_object(
    'answer', 'Current Xarmoured mobile testing is strongest on Android applications, including APK analysis, runtime behavior, local storage, transport security and backend API interactions.',
    'category', 'Mobile',
    'order', 7
  ),
  now()
),
(
  'faqs',
  'Does contacting Xarmoured authorize security testing?',
  'does-contacting-xarmoured-authorize-testing',
  'published',
  jsonb_build_object(
    'answer', 'No. Testing begins only after explicit authorization, scope and rules of engagement are agreed. A website enquiry, email, or public page is not authorization to test any system.',
    'category', 'General',
    'order', 8
  ),
  now()
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = now();

-- -----------------------------------------------------------------------------
-- TEAM
-- Founder profile intentionally remains DRAFT until you decide to make it public.
-- Personal CVEs/research are not attributed to Xarmoured.
-- -----------------------------------------------------------------------------
insert into public.records (module, title, slug, status, data)
values (
  'team',
  'Ashutosh Jena',
  'ashutosh-jena',
  'draft',
  jsonb_build_object(
    'role', 'Founder',
    'bio', $md$
Founder of Xarmoured. The company is being built around practical offensive security: clear scope, manual validation, reproducible evidence, remediation guidance, and retesting.

This profile is intentionally unpublished until the founder chooses to make it public. Personal security research, CVEs, advisories, and prior individual work are not presented as Xarmoured company work.
$md$,
    'website', 'https://ashutosh-jena.in',
    'specialisms', E'Web Application Security\nAPI Security\nAndroid Application Security\nSecurity Retesting',
    'order', 1
  )
)
on conflict (module, slug) do update set
  title = excluded.title,
  status = excluded.status,
  data = excluded.data,
  updated_at = now(),
  published_at = null;

-- -----------------------------------------------------------------------------
-- COMPANY RESEARCH
-- Intentionally empty at launch.
-- Add records here only for research/disclosures performed and published under
-- Xarmoured itself. Personal founder research should stay on the founder's
-- personal portfolio unless explicitly and accurately reclassified later.
-- -----------------------------------------------------------------------------

commit;

-- -----------------------------------------------------------------------------
-- AFTER RUNNING THIS SEED
-- -----------------------------------------------------------------------------
-- 1. Admin -> Settings:
--    Add a REAL sales_email and security_email that you control.
-- 2. Admin -> SEO:
--    Add the final site_url and OG image.
-- 3. Admin -> Team:
--    Founder profile remains DRAFT. Publish it only if/when you want it public.
-- 4. Company Research remains OFF until Xarmoured itself has attributable work.
-- 5. Keep Careers OFF until you are actually hiring.
-- 6. Keep Sample Report OFF until a sanitized, high-quality sample report exists.
-- 7. Keep Labs OFF until there is a real public tool/resource.
-- 8. Review Privacy/Terms for your real hosting/email/data-retention setup.
-- 9. Once security_email exists, edit /security and publish it.
