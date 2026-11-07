/**
 * Self-contained 404 document returned by the proxy with a real HTTP 404 status.
 * No scripts. Colors follow the Xarmoured tokens and the visitor's system theme.
 */
export function notFoundHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Page not found — Xarmoured</title><style>
:root{color-scheme:light dark;--bg:#f5f3ee;--fg:#10151b;--muted:#4f5964;--accent:#ac3d18;--line:#d2cec5}
@media(prefers-color-scheme:dark){:root{--bg:#0b0e11;--fg:#f0efeb;--muted:#b2b8bd;--accent:#ee9b68;--line:#252c33}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:32px;background:var(--bg);color:var(--fg);font-family:'Inter Variable',Inter,Arial,Helvetica,sans-serif;line-height:1.6}
main{max-width:560px;width:100%}.eyebrow{font-family:'IBM Plex Mono','SFMono-Regular',Consolas,monospace;font-size:12px;letter-spacing:.06em;color:var(--accent)}
h1{font-size:clamp(34px,6vw,52px);letter-spacing:-.05em;line-height:1.1;margin:16px 0}p{color:var(--muted);margin:0 0 28px}
a{color:var(--accent);text-underline-offset:4px}nav{display:flex;flex-wrap:wrap;gap:8px 20px;border-top:1px solid var(--line);padding-top:20px;margin-top:8px;font-size:14px}
.home{display:inline-block;font-weight:600;font-size:16px}
</style></head><body><main><span class="eyebrow">404 / UNMAPPED TERRITORY</span><h1>This page isn’t here.</h1><p>It may have moved, been archived, or isn’t published yet.</p><a class="home" href="/">Back to Xarmoured →</a><nav aria-label="Main pages"><a href="/services">Services</a><a href="/industries">Solutions</a><a href="/protocol">Protocol</a><a href="/research">Research</a><a href="/assessment">Request an Assessment</a></nav></main></body></html>`;
}
