# Verification record

Date: 2026-10-07. Installed Next.js 16.3.8; Node 22.20.0; Python 3 available. This host initially lacked Node/npm, so an official temporary Node binary was used without installing OS software. No production credentials or company records were supplied.

## Baseline

- `npm ci`: passed.
- `npm run typecheck`: passed.
- `npm run test`: 19 tests passed.
- Default Turbopack build: compilation did not finish during a bounded six-minute attempt. Supported Webpack production build passed.
- Original E2E: development server exceeded its original 240-second startup allowance. Browser download also timed out; system Chromium is available.

## Final checks

- `npm run typecheck`: passed with development stopped.
- `npm run test`: 3 files, 25 tests passed; latest run 32.68 seconds. Includes actual PostgreSQL RLS/publication/permission checks.
- `npm run build`: passed with Webpack, TypeScript, route generation and traces. Final fresh build passed after the last CSS refinements: compilation 73 seconds, TypeScript 38.6 seconds, all 12 generated routes and build traces completed; exit code 0.
- `npm ci --dry-run --ignore-scripts --audit=false --fund=false`: passed, confirming lockfile consistency.
- Final fresh-artifact production browser/HTTP smoke: exit code 0. Passed ten routes in both themes with axe’s available WCAG 2 A/AA, 2.1 A/AA and 2.2 AA tags; no reported violations. Checked 360/390/430/768/1024/1280/1440/1920 widths, single H1, no document overflow, reduced motion, 20 Tab presses inside mobile navigation, Escape/focus restoration, persistent theme and boundary state controls. No browser console/page errors were recorded.
- Production HTTP security: passed anonymous admin/mutation/private resume/export/registration checks. Production ignores the demo flag. Nonce CSP has no unsafe-inline script allowance; browser hydration works. Contact redirect, robots, sitemap and missing-security-contact fail-closed behavior passed.
- Screenshots reviewed: dark desktop hero, warm light mobile hero and mobile boundary diagram. Test artifacts remain ignored under test-results/.
- Development E2E: did not pass on this host. The owner workflow timed out waiting for the post-save redirect; the isolated draft was subsequently persisted. Next dev also reported a catch-all page generation ENOENT, then the server disconnected during the responsive test. Subsequent tests failed with connection refused; five dependent owner tests were skipped. These results do not establish that the complete CMS browser workflow works. Re-run the full suite on a sufficiently provisioned host and verify real integrations in staging before release. Production browser/HTTP checks above passed independently against the built artifact.
- Tracked/new credential-pattern scan and `git diff --check`: passed. This is a limited pattern check, not a claim of exhaustive secret detection.

The E2E harness compiles shared route bundles before launching Chromium to avoid simultaneous cold compilation and browser memory pressure on this 3.7GB host. Next.js 16.3.8 automatic heap-threshold restarts are disabled only in the isolated E2E namespace; the test child uses a bounded 1280MB Node heap. Normal development keeps its default restart protection. The documented low-risk Webpack memory optimization is enabled. It uses one worker and isolated, explicitly labelled development data. It never enables demo mode in production.

## Operational checks requiring staging

Real Supabase Auth/Storage tokens and MFA policy; actual recipient email delivery and verified sender domain; actual Turnstile host/widget; signed resume access with live storage; production record migration rehearsal; owner provisioning; backup restore; privacy/retention and legal approval; monitored disclosure mailbox and security.txt configuration; production domain/metadata image. These remain launch requirements, not claimed test successes.

No Lighthouse score, Core Web Vitals result, WCAG certification or security certification is claimed. Automated axe and keyboard/viewport checks complement manual review and real staging acceptance.
