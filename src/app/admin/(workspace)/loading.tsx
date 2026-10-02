export default function Loading() {
  return (
    <div className="skeleton-page" aria-label="Loading workspace" role="status">
      <div className="skeleton title" />
      <div className="skeleton subtitle" />
      <div className="metric-grid">
        {[1, 2, 3, 4].map((x) => (
          <div className="skeleton metric" key={x} />
        ))}
      </div>
      <div className="skeleton table" />
      {[1, 2, 3, 4].map((x) => (
        <div className="skeleton row" key={x} />
      ))}
    </div>
  );
}
