/**
 * Route-level Suspense fallback for the public site.
 * It is a real fallback (shown while a page's data streams in), not a debug
 * artifact. It stays invisible for fast loads (see .xa-route-loading in
 * public.css), reserves space to avoid a layout jump, and announces a short
 * status to assistive technology.
 */
export default function Loading() {
  return (
    <div className="wrap section xa-route-loading" role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <span className="xa-route-loading-bar" aria-hidden="true" />
    </div>
  );
}
