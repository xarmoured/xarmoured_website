import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { ButtonLink } from '@/components/ui';
import { pageMetadata } from '@/lib/seo';
export async function generateMetadata() {
  return pageMetadata(
    '/solutions',
    'Security solutions for SaaS, APIs and AI-powered products | Xarmoured',
    'Application security testing and security engineering for SaaS, web platforms, API-driven applications, AI-powered products and digital businesses.'
  );
}
const items = [
  ['SaaS and Technology', 'Tenant isolation, roles and authorization boundaries are where multi-user products fail. We test them as a user with the wrong role would.', '/industries/saas'],
  ['Web Platforms', 'Authentication, sessions and business logic across the web application, tested manually beyond what scanners reach.', '/services/web-application-penetration-testing'],
  ['API-Driven Applications', 'Object and function-level authorization, token handling and data exposure between clients and backend services.', '/services/api-security-testing'],
  ['AI-Powered Products', 'Prompt injection, retrieval and agent behavior are an emerging, research-stage area for us. We scope these engagements carefully and say what is established.', '/assessment'],
  ['Digital Businesses', 'Checkout, accounts and administrative workflows where abuse has a direct business cost.', '/industries/ecommerce'],
];
export default function Solutions() {
  return (
    <section className="wrap xa-section xe-disciplines xe-solutions">
      <h1>Solutions built around the problem, not the product.</h1>
      <p className="xe-honest">We describe how we approach each area. We do not list customers or sector experience we cannot document.</p>
      {items.map(([t, b, h]) => (
        <Link className="xe-row" href={h} key={t}>
          <h3>{t}</h3>
          <div><p>{b}</p></div>
        </Link>
      ))}
      <div className="button-row"><ButtonLink href="/assessment">Talk to an Engineer</ButtonLink><Link className="text-link" href="/services">Explore capabilities <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
    </section>
  );
}
