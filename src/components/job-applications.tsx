'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Users } from 'lucide-react';
import type { RecordData } from '@/lib/modules';
import { Status } from './ui';
export function JobApplications({ records }: { records: RecordData[] }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="job-applicant-summary">
      <button onClick={() => setOpen(!open)} aria-expanded={open}>
        <Users size={17} />
        <span>
          <strong>{records.length} applications</strong>
          <small>
            {records.filter((r) => r.status === 'new').length} new ·{' '}
            {records.filter((r) => r.status === 'interview').length} interviewing ·{' '}
            {records.filter((r) => r.status === 'hired').length} hired
          </small>
        </span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div>
          {records.length ? (
            records.map((r) => (
              <Link href={`/admin/applications/${r.id}`} key={r.id}>
                <strong>{r.title}</strong>
                <Status value={r.status} />
                <ArrowUpRight size={15} />
              </Link>
            ))
          ) : (
            <p>No applications yet. Candidates will appear here once they apply.</p>
          )}
        </div>
      )}
    </section>
  );
}
