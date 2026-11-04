SEO UPGRADE: what is in this zip and where it goes (project root = the folder with package.json)

NEW files (no existing file is touched; just add them):
  public/og-image.jpg   social share image (1200x630)
  public/logo.png       logo used in company data for search engines
  public/llms.txt       summary file for AI assistants (served at /llms.txt)

REPLACEMENT files (open each, select all, delete, paste the whole new file):
  src/app/robots.ts                welcomes search + AI crawlers, keeps /admin and /api private
  src/app/(public)/layout.tsx      richer company data (sameAs, logo, WebSite) for search + AI

Also run seo_settings.sql in the Supabase SQL editor (fixes the www / non-www mismatch,
sets the share image, and the company description).
Tip: deploy to a Vercel PREVIEW first (push a branch) and open it before promoting.
