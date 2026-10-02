import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: {
    default: 'Xarmoured — Penetration Testing & Security Engineering',
    template: '%s — Xarmoured',
  },
  description:
    'Manual penetration testing, actionable research, and security engineering. Built by practitioners.',
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
