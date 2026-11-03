# Xarmoured launch steps (in order)

1. Back up the database (Supabase > Database > Backups).
2. In the Supabase SQL editor, make sure `xarmoured_initial_seed_v3_growth.sql` has been run.
3. Run `xarmoured_v4_launch_patch.sql` (adds 8 guides to Resourcesand 3 Industries pages).
4. Deploy this project (menu now links Industries, Pricing, FAQ, How we work, Deliverables).
5. Optional: upload `docs/xarmoured_sample_report.pdf` in Admin > Media, then use the commented block at the bottom of the v4 SQL to publish it.
6. Set environment variables on the host (see `.env.example`): Supabase keys, Turnstile keys, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`.
7. Send yourself a real enquiry from /assessment and confirm the email arrives.
8. Add the site to Google Search Console and submit /sitemap.xml.
9. Review the Privacy and Terms pages with your real company details.

Still needed from you: pricing ranges, founder bio details, booking link, real case studies (only with client permission).
