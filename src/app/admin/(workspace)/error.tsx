'use client';
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state">
      <h1>We couldn’t load this workspace.</h1>
      <p>Check your connection and database configuration. Your saved records remain intact.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
