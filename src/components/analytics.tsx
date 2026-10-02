'use client';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
export function Analytics({
  events,
  leads,
  applications,
}: {
  events: { event: string; path: string; created_at: string; source?: string }[];
  leads: number;
  applications: number;
}) {
  const count = (e: string) => events.filter((v) => v.event === e).length;
  const views =
    count('page_view') + count('service_view') + count('research_view') + count('careers_view');
  const chart = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 13 + i);
    const day = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      views: events.filter((e) => e.created_at.startsWith(day)).length,
    };
  });
  const pages = Object.entries(
    events.reduce(
      (a, e) => {
        a[e.path] = (a[e.path] || 0) + 1;
        return a;
      },
      {} as Record<string, number>
    )
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">SIGNALS THAT MATTER</span>
          <h1>Analytics</h1>
          <p>Privacy-conscious first-party activity. Event counts, not unique visitor estimates.</p>
        </div>
        <span className="tiny-tag">LAST 30 DAYS</span>
      </div>
      <div className="metric-grid">
        {[
          ['Page views', views],
          ['Assessment starts', count('assessment_start')],
          ['Submissions', count('assessment_submit')],
          ['Applications', count('application_submit')],
        ].map(([label, value]) => (
          <div className="metric-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>Recorded first-party events</p>
          </div>
        ))}
      </div>
      <div className="analytics-grid">
        <section className="dashboard-panel analytics-chart">
          <div className="panel-heading">
            <h2>Activity over time</h2>
            <span className="tiny-tag">14 DAYS</span>
          </div>
          <div
            className="chart-container"
            role="img"
            aria-label={`Activity over the last fourteen days: ${chart.reduce((s, x) => s + x.views, 0)} events`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e89763" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="#e89763" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#242931" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#879099"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#879099"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#171c22',
                    border: '1px solid #343a42',
                    borderRadius: 8,
                    color: '#edece8',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#e89763"
                  strokeWidth={2}
                  fill="url(#chartColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="dashboard-panel">
          <div className="panel-heading">
            <h2>Assessment funnel</h2>
          </div>
          <div className="funnel">
            {[
              ['Page views', views],
              ['Service views', count('service_view')],
              ['Assessment starts', count('assessment_start')],
              ['Assessment submissions', count('assessment_submit')],
              ['Booking clicks', count('booking_click')],
            ].map(([name, n], i) => (
              <div key={name}>
                <span>
                  <i>{i + 1}</i>
                  {name}
                </span>
                <strong>{n}</strong>
              </div>
            ))}
          </div>
          <p className="analytics-note">
            Submission / page-view ratio:{' '}
            {views ? ((count('assessment_submit') / views) * 100).toFixed(1) : '0'}%. Events are not
            linked to individual users.
          </p>
        </section>
        <section className="dashboard-panel">
          <div className="panel-heading">
            <h2>Top pages</h2>
          </div>
          <div className="analytics-rows">
            {pages.length ? (
              pages.map(([page, n]) => (
                <div key={page}>
                  <span>{page}</span>
                  <strong>{n}</strong>
                </div>
              ))
            ) : (
              <p>No tracked activity yet. Events appear as visitors use your public site.</p>
            )}
          </div>
        </section>
        <section className="dashboard-panel">
          <div className="panel-heading">
            <h2>Business records</h2>
          </div>
          <div className="analytics-rows">
            <div>
              <span>Assessment requests</span>
              <strong>{leads}</strong>
            </div>
            <div>
              <span>Job applications</span>
              <strong>{applications}</strong>
            </div>
          </div>
          <p className="analytics-note">
            For unique visitors and attribution, connect a dedicated analytics provider. This
            dashboard intentionally avoids fabricated traffic.
          </p>
        </section>
      </div>
    </>
  );
}
