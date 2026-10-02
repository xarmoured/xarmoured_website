import Link from 'next/link';
export default function NotFound() {
  return (
    <main id="main" className="empty-state full-page">
      <span className="eyebrow">404 / UNMAPPED TERRITORY</span>
      <h1>This page isn’t here.</h1>
      <p>It may have moved, been archived, or isn’t published yet.</p>
      <Link className="button" href="/">
        Back to Xarmoured →
      </Link>
    </main>
  );
}
