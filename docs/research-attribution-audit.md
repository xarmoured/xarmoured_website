# Research attribution audit — 2026-11-06

Purpose: attribution ("Research by Ashutosh Jena, published through Xarmoured") may appear
only where the public advisory supports it. No research record was published, unpublished,
edited or deleted by this change. Attribution is gated in code by `attribution_verified`
(see `researchAttribution()` in `src/lib/capabilities.ts`) and defaults to OFF.

Method: each CVE was checked against public CVE/NVD-derived records and aggregators.
Limit: the in-CMS record fields (advisory URL, researcher, versions) are not in this
repository and the live detail pages could not be fetched, so those fields were NOT compared.
Re-check each record's own advisory link in the admin before relying on this table.

| Record | CVE | Public record | Fixed version | Credit in CVE record | Decision |
|---|---|---|---|---|---|
| UnoPim file upload RCE | CVE-2026-82524 | Published 2026-09-02 (VulnCheck) | 2.1.5 (matches site) | References a "Researcher Blog" on ashutosh-jena.in | Attribution ON (SQL applied) |
| Invoice Ninja vendor portal IDOR | CVE-2026-83743 | Published 2026-09-01 (VulDB) | 5.13.27 | Reporter: VulDB user "MAVERICK-VF142"; references ashutosh-jena.in write-up | Attribution OFF pending founder confirmation of handle |
| Invoice Ninja PDF SSRF | CVE-2026-83744 | Published 2026-09-01 (VulDB) | Not reported; vendor did not respond | Reporter: "MAVERICK-VF142"; references ashutosh-jena.in write-up | Attribution OFF pending confirmation. Keep "no fixed version" as is |
| BookStack attachment access control | CVE-2026-86285 | Published 2026-09-07 (VulDB) | 26.05.3 (per Mend) | Reporter: "MAVERICK-VF142"; references ashutosh-jena.in write-up | Attribution OFF pending confirmation |
| Cachet stored XSS | CVE-2026-113712 | Found on one aggregator only; no primary record, advisory link or credit found | Unclear | None found | Attribution OFF. Recommend draft until an advisory link is confirmed (SQL provided, commented out) |

Structured data: research JSON-LD previously fell back to Xarmoured as author when no
researcher was set. It now names an author only when attribution is verified, so the
company is never asserted as the discoverer by default.
