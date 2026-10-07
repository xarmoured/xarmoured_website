'use client';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Shield, Globe, Code2, Cloud, Smartphone, Network } from 'lucide-react';
import Link from 'next/link';
export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? { y: 0 } : { y: [10, 0] }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reduced ? 0 : 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
export function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link href="/" className={`brand ${small ? 'small' : ''}`} aria-label="Xarmoured home">
      <span className="brand-symbol">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path
            d="M5 4h8l14 24h-8L5 4Zm14 0h8l-6 10-4-7 2-3ZM5 28l6-10 4 7-2 3H5Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span>
        XARMOURED<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
export function ButtonLink({
  href,
  children,
  secondary = false,
  event,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  event?: 'booking_click';
}) {
  return (
    <Link
      className={`button ${secondary ? 'secondary' : ''}`}
      href={href}
      onClick={() => {
        if (event)
          fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event, path: window.location.pathname }),
            keepalive: true,
          }).catch(() => {});
      }}
    >
      {children}
      <ArrowUpRight size={16} aria-hidden="true" />
    </Link>
  );
}
export function Status({ value }: { value: string }) {
  return (
    <motion.span
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.16 }}
      className={`status ${['published', 'open', 'won', 'hired', 'public'].includes(value) ? 'good' : ['draft', 'new', 'reviewing', 'scoping', 'paused'].includes(value) ? 'warm' : value === 'lost' || value === 'rejected' ? 'bad' : ''}`}
    >
      <i />
      {value.replaceAll('_', ' ')}
    </motion.span>
  );
}
export function ServiceIcon({ name, size = 23 }: { name?: string; size?: number }) {
  const Icon =
    (
      {
        globe: Globe,
        code: Code2,
        cloud: Cloud,
        smartphone: Smartphone,
        network: Network,
        shield: Shield,
      } as Record<string, typeof Shield>
    )[name || 'shield'] || Shield;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" />;
}
