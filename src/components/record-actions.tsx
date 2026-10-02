'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Trash2 } from 'lucide-react';
export function RecordActions({
  module,
  id,
  unread = false,
  media = false,
}: {
  module: string;
  id: string;
  unread?: boolean;
  media?: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  async function action(a: string) {
    setPending(true);
    const res = await fetch('/api/admin/record-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, id, action: a }),
    });
    const b = await res.json();
    setMessage(b.error || 'Action completed.');
    setPending(false);
    if (res.ok) {
      dialog.current?.close();
      if (a === 'duplicate') router.push(`/admin/${module}/${b.id}`);
      else router.refresh();
    }
  }
  return (
    <div className="record-actions">
      {['jobs', 'research', 'services'].includes(module) && (
        <button className="aside-action" disabled={pending} onClick={() => action('duplicate')}>
          <Copy size={15} />
          Duplicate as draft
        </button>
      )}
      {unread && (
        <button className="aside-action" disabled={pending} onClick={() => action('read')}>
          <Check size={15} />
          Mark as read
        </button>
      )}
      {media && (
        <>
          <button className="aside-action" onClick={() => dialog.current?.showModal()}>
            <Trash2 size={15} />
            Delete file
          </button>
          <dialog className="confirm-dialog" ref={dialog}>
            <h2>Delete this file?</h2>
            <p>
              Existing public links to this file will stop working. Metadata is retained in the
              activity history. Type DELETE to confirm.
            </p>
            <label>
              Confirmation
              <input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
            </label>
            <div className="dialog-actions">
              <button className="button secondary compact" onClick={() => dialog.current?.close()}>
                Cancel
              </button>
              <button
                className="button compact"
                disabled={pending || confirmation !== 'DELETE'}
                onClick={() => action('delete_asset')}
              >
                Delete file
              </button>
            </div>
          </dialog>
        </>
      )}
      {message && (
        <p className="error-text" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
