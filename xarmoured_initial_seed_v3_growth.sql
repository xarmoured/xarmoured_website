-- Xarmoured initial production content seed
-- Generated for the existing public.records CMS schema.
-- Safe scope: only inserts/updates the specific module+slug records below.
-- It does NOT delete existing records, users, leads, applications, or media.

begin;

-- -----------------------------------------------------------------------------
-- PERSONAL RESEARCH ATTRIBUTION SAFETY
-- Do not delete personal records. Keep them unpublished on the company site.
-- -----------------------------------------------------------------------------
update public.records set status = 'draft', published_at = null, updated_at = now()
where module = 'research' and slug in (
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
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
  data = COALESCE(public.records.data, '{}'::jsonb) || excluded.data,
  updated_at = now(),
  published_at = null;

-- -----------------------------------------------------------------------------
-- COMPANY RESEARCH
-- Intentionally empty at launch.
-- Add records here only for research/disclosures performed and published under
-- Xarmoured itself. Personal founder research should stay on the founder's
-- personal portfolio unless explicitly and accurately reclassified later.
-- -----------------------------------------------------------------------------


-- ======================== LAUNCH V3 EXPANSION ============================
-- Complete web/SEO conversion content. New fields are optional for CMS readers.
-- Existing app must route paths and render metadata; SQL alone is not SEO.

UPDATE public.records SET data=COALESCE(data,'{}'::jsonb)||'{"site_url":"https://xarmoured.tech","sales_cta":"Request a penetration test","contact_cta":"Talk to a security tester","operating_model":"India-based, remote-first","assessment_enabled":true,"research_enabled":false,"careers_enabled":false,"labs_enabled":false,"sample_report_enabled":false,"announcements_enabled":false,"primary_navigation":[{"label":"Services","href":"/services/"},{"label":"Industries","href":"/industries/"},{"label":"Process","href":"/methodology/"},{"label":"Resources","href":"/resources/"},{"label":"About","href":"/about/"},{"label":"Request assessment","href":"/assessment/"}],"footer_navigation":[{"label":"about","href":"/about/"},{"label":"contact","href":"/contact/"},{"label":"privacy","href":"/privacy/"},{"label":"terms","href":"/terms/"},{"label":"faq","href":"/faq/"}],"website_launch_version":3}'::jsonb,updated_at=now() WHERE module='settings' AND slug='site';

UPDATE public.records SET data=COALESCE(data,'{}'::jsonb)||'{"site_url":"https://xarmoured.tech","default_title":"Xarmoured | Web, API & Android Penetration Testing","title_template":"%s | Xarmoured","description":"Manual-first web application, API and Android penetration testing in India. Evidence-led findings, practical fixes and remediation validation.","robots":"index,follow","language":"en-IN","og_type":"website","twitter_card":"summary_large_image","organization_name":"Xarmoured"}'::jsonb,updated_at=now() WHERE module='seo' AND slug='global';

UPDATE public.records SET data=COALESCE(data,'{}'::jsonb)||'{"eyebrow":"AUTHORIZED OFFENSIVE SECURITY • INDIA • REMOTE-FIRST","headline":"Find the security gaps your users and workflows expose.","summary":"Manual-first penetration testing for web applications, APIs and Android. We validate what can actually be abused, document the evidence, and help your engineers verify the fix.","primary_label":"Request a penetration test","primary_url":"/assessment/","secondary_label":"Explore services","secondary_url":"/services/","services_heading":"Focused testing for real application risk","methodology_cta":"Understand our process","final_cta":"Know what breaks. Fix what matters. Verify the change.","why_choose_heading":"Clear scope. Validated findings. Useful fixes.","value_propositions":["Manual validation of authorization and business logic","Reproducible technical evidence, not scanner dumps","Practical mitigation guidance for developers","Retesting that checks whether the attack path is closed"],"sectors":["SaaS & multi-tenant applications","E-commerce & transactional apps","Startups & product teams"],"process_steps":["Agree scope and written authorization","Map roles, objects and high-risk workflows","Validate real attack paths safely","Report impact with reproducible evidence","Verify fixes through agreed retesting"],"proof_policy":"No invented clients, certifications, testimonials or results. Experience is represented accurately.","seo_title":"Penetration Testing Services | Web, API & Android | Xarmoured","seo_description":"Xarmoured provides manual-first web application, API and Android penetration testing, actionable reporting and security retesting. Request a scoped assessment.","canonical_path":"/"}'::jsonb,updated_at=now() WHERE module='pages' AND slug='home';

UPDATE public.records SET data=COALESCE(data,'{}'::jsonb)||'{"seo_title":"Web Application Penetration Testing Services in India | Xarmoured","seo_description":"Find broken access controls, business logic abuse, injection and unsafe workflows before they become incidents.","canonical_path":"/services/web-application-penetration-testing/","who_its_for":"SaaS products, customer portals, internal business apps and web platforms","key_testing_areas":["Authentication, session handling and account recovery","Horizontal and vertical access control including IDOR","Business logic, workflows, race conditions and role transitions","SQL/NoSQL injection, XSS, SSRF and unsafe file handling","Security configuration, secrets and data exposure"],"expected_outcome":"A prioritized, reproducible report showing the vulnerable workflow, impact, evidence and engineering guidance.","primary_cta_label":"Request a scoped assessment","primary_cta_url":"/assessment/","order":1}'::jsonb,updated_at=now() WHERE module='services' AND slug='web-application-penetration-testing';

UPDATE public.records SET data=COALESCE(data,'{}'::jsonb)||'{"seo_title":"API Security Testing & API Penetration Testing | Xarmoured","seo_description":"Manual testing of API authorization, identity boundaries, object access and backend trust.","canonical_path":"/services/api-security-testing/","who_its_for":"REST APIs, backend services, mobile backends and SaaS integrations","key_testing_areas":["BOLA/IDOR and broken function-level authorization","Authentication, JWT and session flows","Property-level access control and mass assignment","Rate limits, resource consumption and business-flow abuse","SSRF, unsafe input, data exposure and undocumented endpoints"],"expected_outcome":"Endpoint-level, role-aware proof of issues plus concrete mitigation guidance.","primary_cta_label":"Request a scoped assessment","primary_cta_url":"/assessment/","order":2}'::jsonb,updated_at=now() WHERE module='services' AND slug='api-security-testing';

UPDATE public.records SET data=COALESCE(data,'{}'::jsonb)||'{"seo_title":"Android Mobile Application Security Testing | Xarmoured","seo_description":"Examine APKs, application behavior, local storage, network trust and backend interactions.","canonical_path":"/services/mobile-application-security-testing/","who_its_for":"Android applications and their supporting APIs","key_testing_areas":["APK static analysis and embedded secrets","Exported components, deep links and WebViews","Local storage and sensitive data protection","Traffic handling and runtime behavior","Backend API authorization and mobile-to-server trust boundaries"],"expected_outcome":"Correlated mobile/client/backend findings with realistic exploit conditions.","primary_cta_label":"Request a scoped assessment","primary_cta_url":"/assessment/","order":3}'::jsonb,updated_at=now() WHERE module='services' AND slug='mobile-application-security-testing';

UPDATE public.records SET data=COALESCE(data,'{}'::jsonb)||'{"seo_title":"Penetration Test Retesting & Remediation Validation | Xarmoured","seo_description":"Prove a fix blocks the original attack path—not just that a ticket was closed.","canonical_path":"/services/retesting-remediation-validation/","who_its_for":"Product teams after a penetration test or critical vulnerability fix","key_testing_areas":["Reproduce original findings in the agreed environment","Validate changes to authorization and security boundaries","Check likely bypasses within the agreed scope","Record evidence and residual risk","Document resolved, partially resolved and unresolved states"],"expected_outcome":"Evidence-backed retest status your engineering and security teams can act on.","primary_cta_label":"Request a scoped assessment","primary_cta_url":"/assessment/","order":4}'::jsonb,updated_at=now() WHERE module='services' AND slug='retesting-remediation-validation';

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Our Penetration Testing Methodology','methodology','published','{"headline":"Our Penetration Testing Methodology","summary":"A practical, scoped process that makes findings actionable rather than theatrical.","content":"## 01 — Scope and authorization\n\nWe begin with the assets, applications, environments, access levels, testing dates and business goals. Rules of engagement explicitly identify what is permitted, prohibited, and who to contact if an issue emerges. No testing begins before written authorization.\n\n## 02 — Map the application\n\nWe identify reachable functionality, roles, objects, sensitive workflows and trust boundaries. For APIs this includes object ownership, function authorization and unusual state transitions. For Android, we include the client, its transport behavior and the backend.\n\n## 03 — Manual-first security testing\n\nGuided by relevant OWASP Web Security Testing Guide, API Security Top 10 and Mobile Application Security Testing Guide concepts, we test the assumptions behind access decisions, user input and critical flows. Automation supplements coverage; it never replaces human validation.\n\n## 04 — Validate findings safely\n\nPotential issues are confirmed within agreed guardrails. We capture reproducible evidence and realistic impact while minimizing unnecessary exposure of customer information. We do not chase destructive proof for its own sake.\n\n## 05 — Report and prioritize\n\nYou receive an executive summary, finding descriptions, preconditions, reproduction guidance, risk reasoning and remediation steps. We make it clear where a risk was validated versus where testing was constrained.\n\n## 06 — Remediate and retest\n\nAfter engineering changes, a separate retest checks whether the same failure path has been closed. Retesting scope, window and commercial terms are agreed in advance.\n\n## Boundaries that matter\n\nA penetration test is a time-bounded evaluation, not a guarantee of security or a compliance certificate. Scope, environment realism, access levels and the test window affect what can be concluded.","seo_title":"Penetration Testing Methodology | Xarmoured","seo_description":"Understand the Xarmoured assessment workflow: authorization, threat-focused manual testing, validated evidence, reporting and retesting.","canonical_path":"/methodology/","primary_label":"Request an assessment","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Request a Penetration Test','assessment','published','{"headline":"Request a Penetration Test","summary":"Tell us what needs testing. We will use your requirements to discuss a realistic scope and proposal.","content":"## What helps us estimate a project\n\n- **Assessment type:** Web application, API, Android app or focused retest.\n- **Assets:** Domains, application areas, endpoint count or build information. Do not send credentials or secrets in this form.\n- **Complexity:** User roles, tenants, authentication flows and integrations.\n- **Environment:** Staging versus production and any testing windows.\n- **Timing:** Target dates and any release dependency.\n- **Goals:** Security assurance, customer due diligence, recent changes or specific concerns.\n\n## What happens next\n\nWe review scope, clarify assumptions and decide whether the engagement is a fit. A quote and proposed rules of engagement follow only once requirements are understood. Form submission alone is not authorization to scan, test or exploit a system.\n\n## What not to send\n\nNever include passwords, API tokens, production customer records or sensitive evidence in an initial enquiry. Use an agreed secure channel later in the process.","seo_title":"Request a Penetration Test Quote | Xarmoured","seo_description":"Request a scoped web, API or Android penetration test. Share the asset type, environment, users, timelines and required deliverables.","canonical_path":"/assessment/","primary_label":"Request a proposal","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Contact Xarmoured','contact','published','{"headline":"Contact Xarmoured","summary":"Have a scope in mind or need to understand what should be tested? Start the conversation here.","content":"## What we can discuss\n\nWeb application testing, API access control and business logic, Android application security, retesting, reporting and realistic engagement scope.\n\n## Before you send an enquiry\n\nShare a business email and a short description of your objective. Do not paste credentials, internal logs, personal data or production secrets into contact forms.\n\n## Working model\n\nXarmoured operates as a remote-first offensive security practice based in India. Specific availability, delivery dates and commercial terms are established during scoping.\n\nFor assessments, the [assessment request](/assessment/) gives us the most useful starting information.","seo_title":"Contact Xarmoured | Talk to a Penetration Tester","seo_description":"Contact Xarmoured about authorized web application, API and Android penetration testing, or remediation validation.","canonical_path":"/contact/","primary_label":"Send an enquiry","primary_url":"/contact/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','How an Xarmoured Engagement Works','how-we-work','published','{"headline":"How an Xarmoured Engagement Works","summary":"Straightforward milestones, explicit permissions and deliverables your engineering team can use.","content":"## 1. Discovery call\n\nWe establish why you are testing, what matters, technical ownership and likely scope. No obligation to buy a broad security package you do not need.\n\n## 2. Written scope and rules of engagement\n\nTargets, source IPs where relevant, test accounts, allowed methods, excluded actions, reporting contacts, dates and emergency stop conditions are agreed.\n\n## 3. Assessment\n\nWe map attack surfaces and evaluate high-risk controls using targeted tooling and manual validation. Material blockers and critical issues are escalated according to the agreed process.\n\n## 4. Findings and walkthrough\n\nA report explains impact and reproduction. We can discuss prioritization and what a correct fix should enforce at the trust boundary.\n\n## 5. Retest\n\nIf part of the agreement, remediated findings are tested again with evidence. Any residual risk or inability to verify is recorded instead of silently marked resolved.\n\n## What determines effort?\n\nNumber of roles and tenants, sensitive workflows, API surface, build stability, test account access, integrations and operational restrictions usually matter more than the number of visible pages.","seo_title":"Penetration Testing Engagement Process | Xarmoured","seo_description":"From discovery and authorized scope to reproducible findings, remediation discussions and retest verification.","canonical_path":"/how-we-work/","primary_label":"Discuss your scope","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','What You Receive After a Penetration Test','deliverables','published','{"headline":"What You Receive After a Penetration Test","summary":"A report should shorten the distance between discovery, engineering changes and verified resolution.","content":"## Executive overview\n\nAssessment objectives, scoped assets, testing limitations, major risks and a prioritized remediation picture for decision-makers.\n\n## Technical findings\n\nEach validated issue includes its affected component, preconditions, reproduction steps, severity rationale, technical evidence and potential impact. Where relevant, we map the finding to a CWE and technical testing standard.\n\n## Engineering-oriented fixes\n\nWe describe the control that needs to change—authorization checks, trust boundaries, data validation or infrastructure behavior—rather than simply recommending a generic patch.\n\n## Coverage and constraints\n\nYou see what was in scope, which roles or environments were exercised, what access was unavailable and where conclusions must be treated cautiously.\n\n## Retest addendum\n\nWhen contracted, a follow-up document records evidence of closure, incomplete fixes and remaining weaknesses.\n\n**Note:** We do not issue an invented certification or promise that any application is vulnerability-free.","seo_title":"Penetration Testing Report Deliverables | Xarmoured","seo_description":"See the evidence, reproduction steps, impact analysis, prioritized remediation and retest records included in an actionable pentest report.","canonical_path":"/deliverables/","primary_label":"Request report details","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Penetration Testing Pricing & Scoping','pricing','published','{"headline":"Penetration Testing Pricing & Scoping","summary":"Pricing follows the attack surface and complexity—not a misleading flat fee copied from a rate card.","content":"## What changes the quote?\n\n- The type and number of applications or APIs.\n- Different user roles, tenants, authentication methods and privileged workflows.\n- Environment readiness, stable test accounts and documentation quality.\n- The depth of validation required and business-critical functionality.\n- Tight deadlines, retest requirements and additional reporting needs.\n\n## Why we do not list a fake starting price\n\nA five-endpoint internal API is a different engagement from a multi-tenant SaaS platform with dozens of roles. A low headline price that ignores scope encourages shallow testing or surprise charges.\n\n## How to get a quote\n\nProvide a concise description through the [assessment form](/assessment/). We can propose a bounded assessment, exclusions and expected deliverables once the application is understood. No guarantee of a quote or fixed turnaround is implied.","seo_title":"Penetration Testing Pricing and Scope | Xarmoured","seo_description":"Understand what affects the price of a web, API or Android penetration test and what details help get an accurate quote.","canonical_path":"/pricing/","primary_label":"Get a scope-based quote","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Security Testing for Digital Products','industries','published','{"headline":"Security Testing for Digital Products","summary":"Different products have different failure modes. We tailor testing to the workflows that carry the risk.","content":"## SaaS and multi-tenant applications\n\nTenants, user roles, invitations, workspaces, exports and internal APIs introduce authorization edges where a small failure can affect another customer. [Explore SaaS testing](/industries/saas/).\n\n## E-commerce and transactional applications\n\nCheckouts, discounts, carts, order access, admin panels and integrations need more than a list of generic injection checks. [Explore e-commerce testing](/industries/ecommerce/).\n\n## Startups and product teams\n\nA focused assessment around a launch or customer security review can prioritize the workflows that matter most. [Explore startup testing](/industries/startups/).\n\nWe do not claim specialist regulatory accreditation or provide legal compliance certification. We assess the technical security within an authorized scope.","seo_title":"Cybersecurity Testing for SaaS, E-commerce & Startups","seo_description":"Focused penetration testing for SaaS applications, ecommerce platforms and early-stage digital products.","canonical_path":"/industries/","primary_label":"Discuss your product","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','SaaS & Multi-Tenant Security Testing','saas-security-testing','published','{"headline":"SaaS & Multi-Tenant Security Testing","summary":"Protect the boundaries between users, workspaces and organizations.","content":"## Where SaaS applications fail\n\nMulti-tenant software depends on every data access enforcing organization context. A UI that hides another customer’s records is not a security control if the API accepts an arbitrary object ID.\n\n## Assessment priorities\n\n- Tenant isolation across read, edit, export and file-download workflows.\n- Organization invitation, onboarding and membership transitions.\n- Role-based functions, admin actions and privilege boundaries.\n- API object and property authorization.\n- Background jobs, webhooks and integration secrets.\n- Billing and subscription state changes where relevant.\n\n## Result\n\nWe provide evidence of validated boundary failures, exploit conditions and remediation guidance suitable for product engineers. Scope, environment, available roles and integrations are agreed before testing.","seo_title":"SaaS Penetration Testing | Tenant Isolation & API Security","seo_description":"Manual SaaS penetration testing focused on tenant isolation, access controls, invitations, roles, exports and backend APIs.","canonical_path":"/industries/saas/","primary_label":"Scope a SaaS assessment","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','E-commerce Application Security Testing','ecommerce-security-testing','published','{"headline":"E-commerce Application Security Testing","summary":"Test the trust placed in customers, orders, discounts and backend administrative workflows.","content":"## More than a checkout scan\n\nA store can have clean automated scan results while exposing order details, allowing discount abuse, or permitting an unprivileged user to access administrative workflows.\n\n## What we focus on\n\n- Customer account and order authorization.\n- Cart, coupon, refund and purchase workflow logic.\n- Product and inventory management privileges.\n- File upload and image-processing workflows.\n- Payment provider callback trust, without claiming to audit the provider.\n- Integrations and exposed API data.\n\n## Engagement scope\n\nWe establish boundaries around live orders, payments and customer information. Potentially destructive tests are excluded unless explicitly approved with safeguards.","seo_title":"E-commerce Penetration Testing & Checkout Security","seo_description":"Assess ecommerce access controls, order workflows, coupon logic, administrative functionality and payment integration boundaries.","canonical_path":"/industries/ecommerce/","primary_label":"Scope e-commerce testing","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Penetration Testing for Startups','startup-security-testing','published','{"headline":"Penetration Testing for Startups","summary":"Prioritize exploitable risk in critical workflows without buying an oversized security program.","content":"## Security reviews with finite budgets\n\nA startup rarely needs every service in the market. It needs clarity on which assets matter, what an attacker could do and how to fix the most meaningful weaknesses.\n\n## Common assessment triggers\n\n- First production release or major architecture change.\n- Enterprise prospect security questionnaires.\n- New authentication, role or invitation models.\n- Partner and payment integrations.\n- Sensitive data storage and export functionality.\n\n## Recommended approach\n\nIdentify the most consequential roles and workflows, scope a realistic test window and get reproducible, prioritized findings. Broader testing can be planned as the product evolves. We do not promise that an assessment alone meets any customer’s compliance requirement.","seo_title":"Startup Penetration Testing for Web Apps & APIs","seo_description":"A focused and clearly scoped security assessment for startups preparing for launch, customer due diligence or major product changes.","canonical_path":"/industries/startups/","primary_label":"Plan a focused assessment","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Application Security Guides','resources','published','{"headline":"Application Security Guides","summary":"Useful security guidance for the engineers and leaders responsible for real applications.","content":"## Start with the problem you are trying to solve\n\nThese guides explain common testing decisions and failure modes without promising shortcuts or automated guarantees.\n\n- [How API authorization breaks](/resources/api-authorization-security/): object ownership, function access and server-side trust.\n- [Preparing for an application penetration test](/resources/prepare-for-penetration-test/): permissions, roles, environments and test accounts.\n- [Reading a penetration test report](/resources/pentest-report-guide/): severity, evidence, fix quality and limitations.\n- [Retesting security vulnerabilities](/resources/security-retesting-guide/): how to tell whether a fix actually holds.\n- [Android application security basics](/resources/android-security-testing-guide/): client and backend attack surfaces.\n\nResources are educational, not an authorization to test third-party systems.","seo_title":"Penetration Testing Guides & Security Resources | Xarmoured","seo_description":"Practical guides to API authorization, pentest preparation, application security reporting and remediation validation.","canonical_path":"/resources/","primary_label":"Request an assessment","primary_url":"/assessment/","content_type":"guide","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','API Authorization Testing: BOLA, Roles and Tenant Boundaries','api-authorization-security','published','{"headline":"API Authorization Testing: BOLA, Roles and Tenant Boundaries","summary":"An authenticated API request is not necessarily an authorized one.","content":"## Authentication answers who. Authorization answers whether.\n\nMany API vulnerabilities appear after a legitimate user signs in. The backend validates the token but fails to check whether that user may act on the specific object, organization or function.\n\n## Three common failure patterns\n\n**Object-level authorization:** A request using a different document or invoice identifier returns another account''s data.\n\n**Function-level authorization:** A regular user can reach an admin endpoint even though the UI hides it.\n\n**Property-level authorization:** A client can modify fields that should be server-managed, such as tenant ownership or elevated roles.\n\n## What a good check looks like\n\nFor every sensitive backend action, identify the actor, requested action, target object, tenant and policy. Resolve object ownership on the server, enforce least privilege, and deny unexpected states by default.\n\n## What to verify in a retest\n\nTest both read and write operations, different user roles, cross-tenant requests, exports and indirect access through integrations. A frontend control or an identifier format change is not sufficient remediation.\n\nSee our [API security testing service](/services/api-security-testing/) if you need a scoped independent review.","seo_title":"API Authorization Testing Guide: BOLA, IDOR & Tenant Isolation","seo_description":"Learn how API object authorization and function access fail, what server-side checks are essential and how to validate fixes.","canonical_path":"/resources/api-authorization-security/","primary_label":"Test API authorization","primary_url":"/assessment/","content_type":"guide","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','How to Prepare Your Web App or API for a Penetration Test','prepare-for-penetration-test','published','{"headline":"How to Prepare Your Web App or API for a Penetration Test","summary":"Better preparation means less time lost on access problems and more time testing meaningful risk.","content":"## Define why the assessment is happening\n\nIs the goal a product release, customer due diligence, risk reduction or verification of specific functionality? This determines priorities and depth.\n\n## Supply representative access\n\nPrepare dedicated test identities for normal users, organization admins, privileged functions and separate tenants if the application is multi-tenant. Avoid sharing personal employee accounts.\n\n## Stabilize the environment\n\nChoose a staging environment that mirrors production security decisions or agree on production-safe constraints. Note external integrations and features that cannot be safely exercised.\n\n## Document the attack surface\n\nProvide base URLs, API specifications or collections, login flows, role descriptions, relevant mobile builds and expected business behavior. Unmaintained documentation should be identified as such.\n\n## Agree on escalation and exclusions\n\nSet authorized targets, testing dates, emergency contacts, prohibited activity and data-handling expectations. Initial enquiry is not authorization to test.\n\n## Plan for remediation\n\nReserve engineering time after delivery. A report without ownership of fixes has limited value. Include an agreed retest window where possible.","seo_title":"How to Prepare for a Penetration Test | Practical Checklist","seo_description":"Prepare endpoints, credentials, user roles, test environments, scope boundaries and incident contacts for a useful penetration test.","canonical_path":"/resources/prepare-for-penetration-test/","primary_label":"Prepare your scope","primary_url":"/assessment/","content_type":"guide","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','How to Evaluate a Penetration Testing Report','pentest-report-guide','published','{"headline":"How to Evaluate a Penetration Testing Report","summary":"A useful report should be convincing to both engineering and management.","content":"## A good finding is reproducible\n\nLook for affected URLs or components, permissions needed, clear steps, relevant requests or screenshots, impact and recommended changes. A scanner flag without validation is not the same as an exploitability assessment.\n\n## Severity needs context\n\nScores and labels help prioritize, but business exposure, sensitivity, preconditions and attack chaining matter. Prioritization should not rely on a CVSS number alone.\n\n## Understand the limitations\n\nNo test covers everything. The report should identify access constraints, excluded assets, test accounts, time boundaries and areas that could not be verified.\n\n## Recommendations should target the control\n\n“Validate input” or “apply authentication” is rarely enough. For authorization issues, for example, remediation should enforce object and tenant access on the server.\n\n## Closure needs evidence\n\nA developer comment saying “fixed” is not the same as retesting. Ask for verification results and any residual risk.","seo_title":"How to Read a Penetration Test Report | Xarmoured","seo_description":"Understand executive summaries, technical reproduction, severity rationale, limitations and remediation quality in a penetration test report.","canonical_path":"/resources/pentest-report-guide/","primary_label":"See our deliverables","primary_url":"/assessment/","content_type":"guide","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Security Retesting: How to Confirm a Vulnerability Is Fixed','security-retesting-guide','published','{"headline":"Security Retesting: How to Confirm a Vulnerability Is Fixed","summary":"The relevant question is whether the original attack path is actually closed.","content":"## Fixing code is not the finish line\n\nA patch can change one endpoint while leaving a second path vulnerable. An access-control fix can work for reads but fail for exports or background jobs.\n\n## Recreate the original conditions\n\nIdentify the original actor, permissions, object, request and expected impact. Recheck the same trust boundary after the fix in a representative environment.\n\n## Probe nearby variants\n\nWithin the agreed scope, consider alternate verbs, object identifiers, roles, endpoints and state transitions that exercise the same control.\n\n## Record what changed\n\nDistinguish verified resolution, partial remediation, still reproducible and cannot verify due to environment constraints. Preserve evidence without unnecessary sensitive data.\n\n## Prevent regressions\n\nTurn the root cause into automated authorization and security regression tests where appropriate. Independent retesting complements, rather than replaces, engineering tests.","seo_title":"Security Retesting Guide | Validate Vulnerability Fixes","seo_description":"Learn what penetration test retesting checks, why ticket closure is not evidence, and how to avoid incomplete security fixes.","canonical_path":"/resources/security-retesting-guide/","primary_label":"Request a retest","primary_url":"/assessment/","content_type":"guide","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Android Application Security Testing: What Should Be Covered?','android-security-testing-guide','published','{"headline":"Android Application Security Testing: What Should Be Covered?","summary":"The APK, the device and the backend form one connected attack surface.","content":"## The client is not a trusted boundary\n\nAn Android app runs in an environment controlled by its user. Security-sensitive authorization decisions must be enforced by the backend regardless of what the app UI permits.\n\n## Application package review\n\nCheck embedded secrets, debuggable builds, unsafe permissions, exported components and configuration. Finding a hard-coded key is important only after understanding what access it grants.\n\n## Local state and inter-app exposure\n\nEvaluate sensitive storage, exported activities and providers, deep links and WebViews. Consider what another application or a user with device access could observe or trigger.\n\n## Traffic and backend behavior\n\nStudy transport settings, session management and API authorization. Server-side checks matter even when the app uses certificate pinning or obfuscation.\n\n## Deliverable quality\n\nFindings should distinguish exploitable exposure from routine reverse-engineering observations and explain affected user data and remediation options.","seo_title":"Android Application Security Testing Checklist | Xarmoured","seo_description":"Review Android APK exposure, local data storage, exported components, deep links, network handling and backend API risks.","canonical_path":"/resources/android-security-testing-guide/","primary_label":"Scope Android testing","primary_url":"/assessment/","content_type":"guide","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Penetration Testing FAQs','faq','published','{"headline":"Penetration Testing FAQs","summary":"Clear answers to the questions clients ask before commissioning security testing.","content":"Browse the answers below. For a scope-specific question, [contact us](/contact/) or [request an assessment](/assessment/).","seo_title":"Penetration Testing FAQs | Xarmoured","seo_description":"Answers about scope, manual testing, API assessments, reports, production safeguards, pricing and retesting.","canonical_path":"/faq/","primary_label":"Get a scoped answer","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','About Xarmoured','about','published','{"headline":"About Xarmoured","summary":"A focused security practice that values reproducible evidence over inflated claims.","content":"## What we do\n\nXarmoured provides scoped web application, API and Android security testing plus retesting and remediation validation. Work begins with authorization and ends with a concrete explanation of validated risks.\n\n## Why this approach\n\nProduct teams need to understand which trust boundary failed, why an attacker could exploit it and how to close it. Automated tools are useful, but they cannot replace deliberate testing of roles, tenants, workflows and business logic.\n\n## What we do not claim\n\nXarmoured is an early-stage practice, not a 24/7 managed security provider, compliance certification body or massive consulting agency. We do not invent client testimonials, certifications or service statistics.\n\n## Location and working model\n\nBased in India, remote-first. Delivery logistics, commercial terms and security requirements are agreed during scoping.","seo_title":"About Xarmoured | Manual-First Offensive Security","seo_description":"Xarmoured is an India-based remote-first practice focused on manual web, API and Android penetration testing, clear evidence and remediation.","canonical_path":"/about/","primary_label":"Discuss your application","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Privacy Policy','privacy','published','{"headline":"Privacy Policy","summary":"This notice describes the intended handling of information submitted to the site.","content":"## Information we collect\n\nEnquiry forms may collect your name, work email, company, service of interest, project context, optional timeline and message. The hosting and abuse-prevention providers may process technical request metadata. Please do not submit secrets or regulated personal data.\n\n## Purpose\n\nWe use enquiry data to respond to requests, discuss scopes and maintain business correspondence. We do not sell enquiry information.\n\n## Service providers\n\nThis starter website can use Vercel for hosting, Cloudflare Turnstile for anti-abuse verification and Resend for transmitting enquiries by email. Update this notice if your production implementation or vendors differ.\n\n## Retention and requests\n\nRetention periods and the official privacy contact must be set according to actual business operations and applicable requirements. You may contact Xarmoured to request correction or deletion subject to legitimate obligations.\n\n## Important launch note\n\nThis policy must be reviewed and completed with real provider and contact details before the website is publicly used to collect personal information.","seo_title":"Privacy Policy | Xarmoured","seo_description":"How Xarmoured processes assessment enquiries and contact information.","canonical_path":"/privacy/","primary_label":"Contact us","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('pages','Website Terms','terms','published','{"headline":"Website Terms","summary":"Information here is not a test authorization or a substitute for a signed engagement agreement.","content":"## Informational material\n\nWebsite material describes services and general security concepts; it does not create a consulting contract or guarantee any security outcome.\n\n## No authorization to test\n\nYou must have explicit written authorization and a defined scope before performing any testing of Xarmoured systems or third-party systems. A message, public page or security article does not grant permission.\n\n## Engagement conditions\n\nTesting, pricing, confidentiality, data handling, liability and retesting must be defined in a separate written agreement and rules of engagement.\n\n## External links and changes\n\nXarmoured is not responsible for external sites. These terms may be updated as operations evolve. Review before publishing as final legal terms.","seo_title":"Website Terms | Xarmoured","seo_description":"Terms covering Xarmoured website information, external links and authorization requirements for security testing.","canonical_path":"/terms/","primary_label":"Request an assessment","primary_url":"/assessment/","content_type":"landing","show_research":false,"show_careers":false}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','What is the difference between a vulnerability scan and a penetration test?','what-is-the-difference-between-a-vulnerability-scan-and-a-penetration-test','published','{"answer":"A scan flags potential issues using automated checks. A penetration test combines targeted automation with manual work to validate exploitability, access control and business logic in an authorized scope.","category":"Engagements","order":20}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Do you need access to our source code?','do-you-need-access-to-our-source-code','published','{"answer":"Not necessarily. Most web and API engagements can be scoped as black-box or authenticated testing. Source-assisted review is a separate scope decision.","category":"Engagements","order":21}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Can you test production?','can-you-test-production','published','{"answer":"Possibly, if operational risks, exclusions, test windows and emergency contacts are explicitly agreed. Representative staging is often preferable when destructive side effects are a concern.","category":"Engagements","order":22}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Can you test an application with multiple organizations or tenants?','can-you-test-an-application-with-multiple-organizations-or-tenants','published','{"answer":"Yes, tenant separation, object ownership and role boundaries are important test areas. Provide safe test accounts in separate organizations so cross-tenant paths can be evaluated.","category":"Engagements","order":23}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','How long does a penetration test take?','how-long-does-a-penetration-test-take','published','{"answer":"Duration depends on attack surface, roles, complexity, access and required depth. We discuss a realistic window after reviewing your scope instead of promising a universal turnaround.","category":"Engagements","order":24}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Do you provide a compliance certificate?','do-you-provide-a-compliance-certificate','published','{"answer":"No. Xarmoured currently provides technical security assessments, not accreditation, legal certification or an assurance that a system has no vulnerabilities.","category":"Engagements","order":25}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Will you share proof of vulnerabilities?','will-you-share-proof-of-vulnerabilities','published','{"answer":"Validated findings include reproduction guidance and relevant evidence within confidentiality and data-minimization constraints.","category":"Engagements","order":26}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Do you provide remediation guidance?','do-you-provide-remediation-guidance','published','{"answer":"Yes. Findings explain the failed security boundary and practical remediation direction so engineers can act on the issue.","category":"Engagements","order":27}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Is retesting included in every assessment?','is-retesting-included-in-every-assessment','published','{"answer":"Retesting is available, but the scope, timing and inclusion in the commercial agreement must be confirmed in the proposal.","category":"Engagements","order":28}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Can we get a quote before creating test accounts?','can-we-get-a-quote-before-creating-test-accounts','published','{"answer":"Yes. A preliminary scope discussion does not require credentials. Test access is arranged securely only after written terms and rules of engagement.","category":"Engagements","order":29}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Will you test Android and iOS?','will-you-test-android-and-ios','published','{"answer":"Current mobile capability is strongest for Android applications and their backend APIs. iOS should not be assumed included without a separately confirmed scope.","category":"Engagements","order":30}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Do you perform SOC, MDR or 24/7 incident response?','do-you-perform-soc-mdr-or-24-7-incident-response','published','{"answer":"No. These are not part of the services advertised by Xarmoured at launch.","category":"Engagements","order":31}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Do you work remotely with clients outside India?','do-you-work-remotely-with-clients-outside-india','published','{"answer":"Xarmoured is remote-first and based in India. Cross-border delivery, scheduling, contracting and any jurisdiction-specific requirements must be reviewed during scoping.","category":"Engagements","order":32}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','What should we send in an initial enquiry?','what-should-we-send-in-an-initial-enquiry','published','{"answer":"Share application type, environment, approximate scope, roles, target timeline and goals. Do not send credentials, sensitive data or access tokens through public forms.","category":"Engagements","order":33}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

INSERT INTO public.records (module,title,slug,status,data,published_at) VALUES ('faqs','Can you guarantee our application is secure after testing?','can-you-guarantee-our-application-is-secure-after-testing','published','{"answer":"No finite assessment can guarantee the absence of vulnerabilities. It provides evidence about agreed assets, methods and conditions during the test window.","category":"Engagements","order":34}'::jsonb,now()) ON CONFLICT (module,slug) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,data=COALESCE(public.records.data,'{}'::jsonb)||EXCLUDED.data,updated_at=now(),published_at=now();

-- Founder personal research stays attributed personally; no fabricated corporate CVE claims.
-- Draft services and private team record remain unpublished.

commit;

-- TECHNICAL SEO: Site routes, canonicals, robots and sitemap must be implemented in frontend.
-- LEAD FLOW: Configure a verified sender, destination and bot protection before publishing forms.
-- LEGAL: Review and complete privacy/terms against actual providers and operations.
