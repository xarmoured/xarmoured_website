-- Xarmoured v4 launch patch: fills the Resources (8 guides) and Industries (3 pages) sections.
-- Run AFTER xarmoured_initial_seed_v3_growth.sql. Back up first (Supabase > Database > Backups).
-- Only inserts/updates the module+slug rows below. Nothing is deleted.
-- Requires migration 007 (resources / industries modules).

begin;

insert into public.records (module, title, slug, status, data, published_at)
values ('resources', 'API Authorization Testing: BOLA, Roles and Tenant Boundaries', 'api-authorization-security', 'published', jsonb_build_object(
  'summary', 'An authenticated API request is not necessarily an authorized one.',
  'content', $xmd$## Authentication answers who. Authorization answers whether.

Many API vulnerabilities appear after a legitimate user signs in. The backend validates the token but fails to check whether that user may act on the specific object, organization or function.

## Three common failure patterns

**Object-level authorization:** A request using a different document or invoice identifier returns another account's data.

**Function-level authorization:** A regular user can reach an admin endpoint even though the UI hides it.

**Property-level authorization:** A client can modify fields that should be server-managed, such as tenant ownership or elevated roles.

## What a good check looks like

For every sensitive backend action, identify the actor, requested action, target object, tenant and policy. Resolve object ownership on the server, enforce least privilege, and deny unexpected states by default.

## What to verify in a retest

Test both read and write operations, different user roles, cross-tenant requests, exports and indirect access through integrations. A frontend control or an identifier format change is not sufficient remediation.

See our [API security testing service](/services/api-security-testing/) if you need a scoped independent review.$xmd$,
  'related_services', 'api-security-testing
web-application-penetration-testing',
  'seo_title', 'API Authorization Testing Guide: BOLA, IDOR & Tenant Isolation',
  'seo_description', 'Learn how API object authorization and function access fail, what server-side checks are essential and how to validate fixes.',
  'featured', true,
  'order', 1,
  'category', 'Technical article',
  'tags', 'api,authorization,bola,idor',
  'publication_date', '2026-11-03'
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

insert into public.records (module, title, slug, status, data, published_at)
values ('resources', 'How to Prepare Your Web App or API for a Penetration Test', 'prepare-for-penetration-test', 'published', jsonb_build_object(
  'summary', 'Better preparation means less time lost on access problems and more time testing meaningful risk.',
  'content', $xmd$## Define why the assessment is happening

Is the goal a product release, customer due diligence, risk reduction or verification of specific functionality? This determines priorities and depth.

## Supply representative access

Prepare dedicated test identities for normal users, organization admins, privileged functions and separate tenants if the application is multi-tenant. Avoid sharing personal employee accounts.

## Stabilize the environment

Choose a staging environment that mirrors production security decisions or agree on production-safe constraints. Note external integrations and features that cannot be safely exercised.

## Document the attack surface

Provide base URLs, API specifications or collections, login flows, role descriptions, relevant mobile builds and expected business behavior. Unmaintained documentation should be identified as such.

## Agree on escalation and exclusions

Set authorized targets, testing dates, emergency contacts, prohibited activity and data-handling expectations. Initial enquiry is not authorization to test.

## Plan for remediation

Reserve engineering time after delivery. A report without ownership of fixes has limited value. Include an agreed retest window where possible.$xmd$,
  'related_services', 'web-application-penetration-testing
api-security-testing',
  'seo_title', 'How to Prepare for a Penetration Test | Practical Checklist',
  'seo_description', 'Prepare endpoints, credentials, user roles, test environments, scope boundaries and incident contacts for a useful penetration test.',
  'featured', false,
  'order', 2,
  'category', 'Checklist',
  'tags', 'preparation,scoping,checklist',
  'publication_date', '2026-11-03'
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

insert into public.records (module, title, slug, status, data, published_at)
values ('resources', 'How to Evaluate a Penetration Testing Report', 'pentest-report-guide', 'published', jsonb_build_object(
  'summary', 'A useful report should be convincing to both engineering and management.',
  'content', $xmd$## A good finding is reproducible

Look for affected URLs or components, permissions needed, clear steps, relevant requests or screenshots, impact and recommended changes. A scanner flag without validation is not the same as an exploitability assessment.

## Severity needs context

Scores and labels help prioritize, but business exposure, sensitivity, preconditions and attack chaining matter. Prioritization should not rely on a CVSS number alone.

## Understand the limitations

No test covers everything. The report should identify access constraints, excluded assets, test accounts, time boundaries and areas that could not be verified.

## Recommendations should target the control

“Validate input” or “apply authentication” is rarely enough. For authorization issues, for example, remediation should enforce object and tenant access on the server.

## Closure needs evidence

A developer comment saying “fixed” is not the same as retesting. Ask for verification results and any residual risk.$xmd$,
  'related_services', 'web-application-penetration-testing
retesting-remediation-validation',
  'seo_title', 'How to Read a Penetration Test Report | Xarmoured',
  'seo_description', 'Understand executive summaries, technical reproduction, severity rationale, limitations and remediation quality in a penetration test report.',
  'featured', false,
  'order', 3,
  'category', 'Security guide',
  'tags', 'reporting,deliverables',
  'publication_date', '2026-11-03'
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

insert into public.records (module, title, slug, status, data, published_at)
values ('resources', 'Security Retesting: How to Confirm a Vulnerability Is Fixed', 'security-retesting-guide', 'published', jsonb_build_object(
  'summary', 'The relevant question is whether the original attack path is actually closed.',
  'content', $xmd$## Fixing code is not the finish line

A patch can change one endpoint while leaving a second path vulnerable. An access-control fix can work for reads but fail for exports or background jobs.

## Recreate the original conditions

Identify the original actor, permissions, object, request and expected impact. Recheck the same trust boundary after the fix in a representative environment.

## Probe nearby variants

Within the agreed scope, consider alternate verbs, object identifiers, roles, endpoints and state transitions that exercise the same control.

## Record what changed

Distinguish verified resolution, partial remediation, still reproducible and cannot verify due to environment constraints. Preserve evidence without unnecessary sensitive data.

## Prevent regressions

Turn the root cause into automated authorization and security regression tests where appropriate. Independent retesting complements, rather than replaces, engineering tests.$xmd$,
  'related_services', 'retesting-remediation-validation',
  'seo_title', 'Security Retesting Guide | Validate Vulnerability Fixes',
  'seo_description', 'Learn what penetration test retesting checks, why ticket closure is not evidence, and how to avoid incomplete security fixes.',
  'featured', false,
  'order', 4,
  'category', 'Security guide',
  'tags', 'retesting,remediation',
  'publication_date', '2026-11-03'
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

insert into public.records (module, title, slug, status, data, published_at)
values ('resources', 'Android Application Security Testing: What Should Be Covered?', 'android-security-testing-guide', 'published', jsonb_build_object(
  'summary', 'The APK, the device and the backend form one connected attack surface.',
  'content', $xmd$## The client is not a trusted boundary

An Android app runs in an environment controlled by its user. Security-sensitive authorization decisions must be enforced by the backend regardless of what the app UI permits.

## Application package review

Check embedded secrets, debuggable builds, unsafe permissions, exported components and configuration. Finding a hard-coded key is important only after understanding what access it grants.

## Local state and inter-app exposure

Evaluate sensitive storage, exported activities and providers, deep links and WebViews. Consider what another application or a user with device access could observe or trigger.

## Traffic and backend behavior

Study transport settings, session management and API authorization. Server-side checks matter even when the app uses certificate pinning or obfuscation.

## Deliverable quality

Findings should distinguish exploitable exposure from routine reverse-engineering observations and explain affected user data and remediation options.$xmd$,
  'related_services', 'mobile-application-security-testing
api-security-testing',
  'seo_title', 'Android Application Security Testing Checklist | Xarmoured',
  'seo_description', 'Review Android APK exposure, local data storage, exported components, deep links, network handling and backend API risks.',
  'featured', false,
  'order', 5,
  'category', 'Security guide',
  'tags', 'android,mobile,apk',
  'publication_date', '2026-11-03'
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

insert into public.records (module, title, slug, status, data, published_at)
values ('industries', 'SaaS & Multi-Tenant Security Testing', 'saas', 'published', jsonb_build_object(
  'summary', 'Protect the boundaries between users, workspaces and organizations.',
  'content', $xmd$## Where SaaS applications fail

Multi-tenant software depends on every data access enforcing organization context. A UI that hides another customer’s records is not a security control if the API accepts an arbitrary object ID.

## Assessment priorities

- Tenant isolation across read, edit, export and file-download workflows.
- Organization invitation, onboarding and membership transitions.
- Role-based functions, admin actions and privilege boundaries.
- API object and property authorization.
- Background jobs, webhooks and integration secrets.
- Billing and subscription state changes where relevant.

## Result

We provide evidence of validated boundary failures, exploit conditions and remediation guidance suitable for product engineers. Scope, environment, available roles and integrations are agreed before testing.$xmd$,
  'related_services', 'web-application-penetration-testing
api-security-testing',
  'seo_title', 'SaaS Penetration Testing | Tenant Isolation & API Security',
  'seo_description', 'Manual SaaS penetration testing focused on tenant isolation, access controls, invitations, roles, exports and backend APIs.',
  'featured', true,
  'order', 1
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

insert into public.records (module, title, slug, status, data, published_at)
values ('industries', 'E-commerce Application Security Testing', 'ecommerce', 'published', jsonb_build_object(
  'summary', 'Test the trust placed in customers, orders, discounts and backend administrative workflows.',
  'content', $xmd$## More than a checkout scan

A store can have clean automated scan results while exposing order details, allowing discount abuse, or permitting an unprivileged user to access administrative workflows.

## What we focus on

- Customer account and order authorization.
- Cart, coupon, refund and purchase workflow logic.
- Product and inventory management privileges.
- File upload and image-processing workflows.
- Payment provider callback trust, without claiming to audit the provider.
- Integrations and exposed API data.

## Engagement scope

We establish boundaries around live orders, payments and customer information. Potentially destructive tests are excluded unless explicitly approved with safeguards.$xmd$,
  'related_services', 'web-application-penetration-testing
api-security-testing',
  'seo_title', 'E-commerce Penetration Testing & Checkout Security',
  'seo_description', 'Assess ecommerce access controls, order workflows, coupon logic, administrative functionality and payment integration boundaries.',
  'featured', false,
  'order', 2
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

insert into public.records (module, title, slug, status, data, published_at)
values ('industries', 'Penetration Testing for Startups', 'startups', 'published', jsonb_build_object(
  'summary', 'Prioritize exploitable risk in critical workflows without buying an oversized security program.',
  'content', $xmd$## Security reviews with finite budgets

A startup rarely needs every service in the market. It needs clarity on which assets matter, what an attacker could do and how to fix the most meaningful weaknesses.

## Common assessment triggers

- First production release or major architecture change.
- Enterprise prospect security questionnaires.
- New authentication, role or invitation models.
- Partner and payment integrations.
- Sensitive data storage and export functionality.

## Recommended approach

Identify the most consequential roles and workflows, scope a realistic test window and get reproducible, prioritized findings. Broader testing can be planned as the product evolves. We do not promise that an assessment alone meets any customer’s compliance requirement.$xmd$,
  'related_services', 'web-application-penetration-testing
api-security-testing
retesting-remediation-validation',
  'seo_title', 'Startup Penetration Testing for Web Apps & APIs',
  'seo_description', 'A focused and clearly scoped security assessment for startups preparing for launch, customer due diligence or major product changes.',
  'featured', false,
  'order', 3
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());


insert into public.records (module, title, slug, status, data, published_at)
values ('resources', 'Penetration Test vs Vulnerability Scan: What Is the Difference?', 'pentest-vs-vulnerability-scan', 'published', jsonb_build_object(
  'summary', 'A scan lists potential weaknesses. A penetration test shows which ones an attacker can actually use.',
  'content', $xmd$## Two different questions

A **vulnerability scan** asks: *which known weaknesses can a tool detect?* A **penetration test** asks: *what can an attacker actually do with this application?*

## What scans do well

Scanners are fast and repeatable. They are good at finding outdated components, missing security headers, common misconfigurations and some well-known injection patterns. Running them regularly is sensible hygiene.

## What scans usually miss

Tools do not understand your business. They rarely detect that one customer can read another customer's data, that a discount can be applied twice, or that a hidden admin function accepts a normal user's request. These flaws depend on roles, tenants and workflows, so they need a person to reason about them.

## What a penetration test adds

A manual assessment maps the application, tests trust boundaries and chains weaknesses together. Each finding is validated, so the report states what was reproduced, the conditions required and the real impact, instead of a long list of unconfirmed signals.

## Which do you need?

- **Scan** when you want regular coverage of known issues across many assets.
- **Penetration test** before a major release, after significant changes to authentication or authorization, or when customers ask for independent assurance.
- **Both** for most products that handle customer data: scans for breadth, manual testing for depth.

A passing scan is not proof that an application is secure, and a penetration test is a time-boxed assessment, not a guarantee. Use each for what it is good at.$xmd$,
  'category', 'Security guide',
  'tags', 'scanning,pentest,basics',
  'publication_date', '2026-11-03',
  'related_services', 'web-application-penetration-testing
api-security-testing',
  'seo_title', 'Penetration Test vs Vulnerability Scan | Xarmoured',
  'seo_description', 'Understand how automated vulnerability scans differ from manual penetration testing, what each is good for, and when your product needs both.',
  'featured', false,
  'order', 6
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

insert into public.records (module, title, slug, status, data, published_at)
values ('resources', 'Web Application Security Checklist for Product Teams', 'web-application-security-checklist', 'published', jsonb_build_object(
  'summary', 'A practical list of areas to review before you ask for an external assessment.',
  'content', $xmd$## How to use this checklist

This is a starting point for internal review. It does not replace an independent assessment, but it helps you find obvious gaps first and makes any later test more productive.

## Authentication and sessions

- Passwords are stored with a modern, slow hashing algorithm.
- Login, password reset and signup are rate limited and do not reveal whether an account exists.
- Sessions expire, are invalidated on logout and password change, and cookies use `Secure`, `HttpOnly` and a suitable `SameSite` value.
- Multi-factor authentication is available for sensitive roles.

## Authorization

- Every request is checked on the server against the user's role, organization and the specific object requested.
- Hidden buttons are never the only protection for an admin function.
- Tenants cannot read or change each other's data by changing an identifier.

## Input and output handling

- Database queries are parameterized.
- Output is encoded for the context where it is displayed.
- File uploads are restricted by type and size and are not served from an executable location.

## Business logic

- Prices, discounts, quantities and approvals are validated on the server.
- Multi-step flows cannot be skipped or replayed.
- Limits exist for expensive or abusable actions.

## Operations

- Secrets are not stored in source code or client bundles.
- Dependencies are tracked and updated.
- Security-relevant events are logged and someone reviews them.
- Error messages do not expose stack traces or internal details.

When most of these are in place, an assessment can spend its time on deeper logic and authorization problems instead of basic gaps.$xmd$,
  'category', 'Checklist',
  'tags', 'web,checklist,authentication,authorization',
  'publication_date', '2026-11-03',
  'related_services', 'web-application-penetration-testing
retesting-remediation-validation',
  'seo_title', 'Web Application Security Checklist | Xarmoured',
  'seo_description', 'A practical web application security checklist covering authentication, sessions, authorization, input handling, business logic and logging.',
  'featured', false,
  'order', 7
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

insert into public.records (module, title, slug, status, data, published_at)
values ('resources', 'IDOR vs BOLA: Object-Level Authorization Explained', 'idor-vs-bola-explained', 'published', jsonb_build_object(
  'summary', 'Two names for the same core mistake: trusting an identifier without checking who owns the object.',
  'content', $xmd$## The same flaw, two names

**IDOR** (Insecure Direct Object Reference) is the traditional web term. **BOLA** (Broken Object Level Authorization) is the term used for APIs in the OWASP API Security list. In practice both describe the same failure: the application accepts an object identifier from the client and returns or changes that object without checking that the caller is allowed to access it.

## A simple example

A signed-in user opens their invoice at `/api/invoices/1042`. If changing the number to `1043` returns someone else's invoice, the server verified *who you are* but not *whether this invoice is yours*.

## Why it is easy to miss

The application works normally for honest users. Scanners rarely detect it because they do not know which objects belong to which account. It usually takes two test accounts and a person who understands the data model.

## Common variations

- The identifier is in the URL, a query string, a request body or a header.
- Read access is protected but update or delete access is not.
- Identifiers are guessable, such as sequential numbers.
- A related object (for example an attachment) is not protected even when the parent record is.

## How to prevent it

1. Check ownership or permission on the server for every object access, using the authenticated user, not a client-supplied user or tenant value.
2. Centralize the policy check so it cannot be forgotten on a new endpoint.
3. Return the same response for missing and forbidden objects.
4. Use unpredictable identifiers as defense in depth. They do not replace the access check.
5. Add automated tests that call each endpoint as a different user.

## How testing helps

An assessment tests each object type with accounts in different roles and tenants, then reports exactly which requests cross the boundary. A retest confirms the fix covers every route to the same data.$xmd$,
  'category', 'Technical article',
  'tags', 'idor,bola,api,authorization',
  'publication_date', '2026-11-03',
  'related_services', 'api-security-testing
web-application-penetration-testing',
  'seo_title', 'IDOR vs BOLA Explained | Xarmoured',
  'seo_description', 'Learn what IDOR and BOLA mean, how object-level authorization fails in web apps and APIs, and how engineers can prevent it.',
  'featured', false,
  'order', 8
), now())
on conflict (module, slug) do update set title=excluded.title, status='published',
  data=coalesce(public.records.data,'{}'::jsonb)||excluded.data, updated_at=now(), published_at=coalesce(public.records.published_at,now());

-- Public company details (only fields on the public allow-list are exposed)
update public.records set data=coalesce(data,'{}'::jsonb)||'{"company":"Xarmoured","country":"India","sales_email":"hello@xarmoured.tech","security_email":"hello@xarmoured.tech","linkedin":"https://www.linkedin.com/company/xarmoured","assessment_enabled":true,"remote":true}'::jsonb, updated_at=now() where module='settings' and slug='site';

commit;

-- ---------------------------------------------------------------------------
-- OPTIONAL: publish the sample report. First upload xarmoured_sample_report.pdf
-- (Admin > Media, public bucket) and paste its URL below, remove the leading
-- dashes, then run. Without a real URL, leave this commented out.
-- ---------------------------------------------------------------------------
-- begin;
-- insert into public.records (module,title,slug,status,data,published_at)
-- values ('reports','Sample penetration test report','sample-report-1','published',
--   jsonb_build_object('description','An illustrative report on a fictional target showing structure, evidence, remediation and retest results. Not a real client.','version','Sample 1.0','file','PASTE_PDF_URL_HERE'), now())
-- on conflict (module,slug) do update set status='published', data=public.records.data||excluded.data, updated_at=now();
-- update public.records set data=coalesce(data,'{}'::jsonb)||'{"sample_report_enabled":true}'::jsonb, updated_at=now() where module='settings' and slug='site';
-- commit;
