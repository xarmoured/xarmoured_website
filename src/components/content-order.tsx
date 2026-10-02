'use client';
import { Reorder, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import type { RecordData } from '@/lib/modules';
export function ContentOrder({
  module,
  records,
  onClose,
}: {
  module: string;
  records: RecordData[];
  onClose: () => void;
}) {
  const [rows, setRows] = useState(
    [...records].sort((a, b) => Number(a.data.order || 0) - Number(b.data.order || 0))
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const reduced = useReducedMotion();
  function move(index: number, delta: number) {
    const copy = [...rows];
    [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
    setRows(copy);
  }
  async function save() {
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/admin/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module,
          items: rows.map((r) => ({ id: r.id, updated_at: r.updated_at })),
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      router.refresh();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to save.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="content-order">
      <p>
        Drag to arrange the public display order, or use the arrow buttons. Changes are saved
        together.
      </p>
      <Reorder.Group axis="y" values={rows} onReorder={setRows}>
        {rows.map((r, i) => (
          <Reorder.Item
            key={r.id}
            value={r}
            dragListener={!busy}
            transition={{ duration: reduced ? 0 : 0.16 }}
          >
            <GripVertical size={16} />
            <strong>{r.title}</strong>
            <button
              aria-label={`Move ${r.title} up`}
              disabled={!i || busy}
              onClick={() => move(i, -1)}
            >
              <ArrowUp size={16} />
            </button>
            <button
              aria-label={`Move ${r.title} down`}
              disabled={i === rows.length - 1 || busy}
              onClick={() => move(i, 1)}
            >
              <ArrowDown size={16} />
            </button>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      {error && (
        <p role="alert" className="error-text">
          {error}
        </p>
      )}
      <div className="button-row">
        <button className="button secondary compact" disabled={busy} onClick={onClose}>
          Cancel
        </button>
        <button className="button compact" disabled={busy} onClick={save}>
          {busy ? 'Saving…' : 'Save order'}
        </button>
      </div>
    </div>
  );
}
