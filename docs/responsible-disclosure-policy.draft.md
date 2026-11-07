# Responsible disclosure policy: DRAFT FOR HUMAN AND LEGAL REVIEW

> **Not legal advice and not reviewed.** This is a drafting aid. A qualified person must review
> the wording (especially the sections marked ⚖) before it is published. Nothing here has been
> published or saved to the CMS.
>
> Before publishing, confirm each item marked **CONFIRM**. Do not publish with any
> placeholder text remaining.

How to publish (three independent switches, all required):

1. **Settings → Security:** set the security email, the `security.txt` canonical URL
   (`https://<your domain>/.well-known/security.txt`), an expiry date (at most 366 days ahead) and
   tick **Publish reviewed disclosure policy**.
2. **Pages → `security`:** paste the policy content below, use *Public preview*, mark the preview
   reviewed, then publish. The dashboard checklist names whichever step is still missing.
3. Verify `/security` and `/.well-known/security.txt` in a browser. `security.txt` returns HTTP 503
   by design until the configuration is complete and unexpired.

The page already states, in code that the CMS cannot remove, that Xarmoured does not currently
operate a paid bug bounty program and that the page does not authorize testing.

---

## Content to paste into the `security` page

### Scope

This policy covers vulnerabilities in systems that Xarmoured owns and operates:

- the xarmoured.tech website, and
- the administration application that supports it. **CONFIRM** the exact in-scope hostnames.

Systems belonging to customers, to people who hired Xarmoured, or to third parties are not covered
by this policy. That includes the hosting, database, email and bot-protection services we use.
Report problems with those to their operators. **CONFIRM** that this wording matches your
vendors' own policies.

### How to report

Email **[SECURITY EMAIL: use the address configured in Settings → Security]**.

Please do not use the assessment form for vulnerability reports and do not include secrets in a
first message. If you would like to encrypt your report, ask for a channel first. **CONFIRM**
whether you will publish a PGP key; do not claim one if you will not.

### What to include

- the affected URL or component and the date and time you observed it;
- what you observed and why you believe it is a vulnerability;
- minimal steps to reproduce, and any proof of concept kept to the minimum necessary;
- your name or handle and how you would like to be credited, if at all;
- whether you intend to disclose publicly, and your proposed timeline.

Please redact personal data and credentials.

### What happens next

We will make reasonable efforts to acknowledge reports, validate them and fix confirmed issues.
Xarmoured is a small, founder-led company: **we do not guarantee response times or remediation
deadlines.** We may ask you for more information, and we will tell you if we decide a report is
out of scope or not a vulnerability.

### Researcher guidelines

Please:

- test only against your own accounts and data;
- stop and report as soon as you confirm an issue; do not pursue further access;
- avoid accessing, changing, deleting or retaining other people's data;
- avoid anything that degrades availability, including volumetric or denial-of-service testing;
- not use social engineering, phishing or physical attacks;
- keep details confidential until we have had a reasonable opportunity to fix the issue.

### Out of scope

- denial-of-service and volumetric testing;
- social engineering, phishing and physical security;
- automated scanning that generates high volumes of traffic;
- findings that depend on outdated browsers, or need access to a victim's device;
- missing best-practice headers or settings with no demonstrated security impact;
- any system not listed under Scope.

### Coordinated disclosure

We prefer coordinated disclosure: report privately first, give us a reasonable chance to fix the
issue, and agree on timing before publishing. We will consider any timeline you propose.
**CONFIRM** whether you want to state a default disclosure window. If you state one, you are
committing to it.

### Recognition

We may publicly acknowledge researchers who report valid issues, with their consent. **Xarmoured
does not currently operate a paid bug bounty program, and this policy offers no monetary
reward.**

### Safe harbor ⚖

**Decision for legal review.** This policy is not a contract and does not authorize testing of
any system. Xarmoured can state that it will not initiate legal action against research that is
carried out in good faith and within this policy, but it cannot speak for third parties or
prevent action by others, and it cannot waive laws. Decide with counsel whether to include a
good-faith statement at all, and use only wording they approve. Do not copy a safe-harbor
statement from another organization.

### Policy updates

This policy may change. **Last updated: [DATE: set on publication].**
