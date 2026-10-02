'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Upload, Copy, FileText, Image, LockKeyhole, ArrowUpRight } from 'lucide-react';
import { RecordData } from '@/lib/modules';
import { useRouter } from 'next/navigation';
import { RecordActions } from './record-actions';
export function MediaManager({ records, writable }: { records: RecordData[]; writable: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [bucket, setBucket] = useState('public-assets');
  const router = useRouter();
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">ASSET WORKSPACE</span>
          <h1>
            Media library<span className="heading-count">{records.length}</span>
          </h1>
          <p>A home for your visuals, reports, and company assets.</p>
        </div>
      </div>
      {writable && (
        <div className="media-upload">
          <div>
            <Upload size={23} />
            <h3>Upload an asset.</h3>
            <p>Images and PDFs, up to 10 MB. Resume files live separately in private storage.</p>
          </div>
          <label>
            Storage visibility
            <select value={bucket} onChange={(e) => setBucket(e.target.value)}>
              <option value="public-assets">Public assets</option>
              <option value="private-internal">Private internal</option>
            </select>
          </label>
          <label className="button secondary compact">
            {busy ? 'Uploading…' : 'Choose file'}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,application/pdf"
              disabled={busy}
              onChange={async (e) => {
                if (!e.target.files?.[0]) return;
                setBusy(true);
                const fd = new FormData();
                fd.set('file', e.target.files[0]);
                fd.set('bucket', bucket);
                try {
                  const res = await fetch('/api/admin/media-upload', { method: 'POST', body: fd });
                  const b = await res.json();
                  setMessage(b.error || 'Asset uploaded successfully.');
                  if (res.ok) router.refresh();
                } catch {
                  setMessage('Upload failed. Please try again.');
                }
                setBusy(false);
              }}
            />
          </label>
        </div>
      )}
      {message && (
        <div className="toast-message" role="status">
          {message}
        </div>
      )}
      <div className="media-grid">
        {records.map((r) => (
          <div className="media-asset" key={r.id}>
            <div className="media-preview">
              {r.data.bucket === 'private-internal' ? (
                <LockKeyhole size={40} />
              ) : r.data.url && !r.data.url.endsWith('.pdf') ? (
                <img src={r.data.url} alt={r.data.alt || r.title} loading="lazy" />
              ) : (
                <FileText size={40} />
              )}
            </div>
            <div>
              <h3>{r.title}</h3>
              <p>
                {r.data.bucket === 'private-internal' ? 'Private internal asset' : 'Public asset'}
              </p>
              <div className="button-row">
                {r.data.url && (
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(r.data.url);
                      setMessage('Asset URL copied.');
                    }}
                  >
                    <Copy size={14} />
                    Copy URL
                  </button>
                )}
                <Link href={`/admin/media/${r.id}`}>
                  Edit metadata <ArrowUpRight size={14} />
                </Link>
              </div>
              {writable && <RecordActions module="media" id={r.id} media />}
              {r.data.path && (
                <a href={`/api/admin/asset/${r.id}`} target="_blank" className="text-link">
                  Preview asset ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      {!records.length && (
        <div className="empty-state">
          <Image size={30} />
          <h2>Your library starts here.</h2>
          <p>Upload a team photo, research illustration, or a sample report.</p>
        </div>
      )}
    </>
  );
}
