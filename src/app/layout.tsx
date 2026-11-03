import type { Metadata } from 'next';
import './globals.css';
import './public.css';
import { headers } from 'next/headers';
export const metadata: Metadata = {
  title: {
    default: 'Xarmoured — Penetration Testing & Security Engineering',
    template: '%s — Xarmoured',
  },
  description:
    'Manual penetration testing, actionable research, and security engineering. Built by practitioners.',
  robots: { index: true, follow: true },
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('xa-theme');document.documentElement.dataset.theme=(t==='dark'||t==='light')?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){document.documentElement.dataset.theme='dark'}",
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
