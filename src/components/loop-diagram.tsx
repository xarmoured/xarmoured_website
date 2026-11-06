/* Hero figure: the tagline as a diagram. Attack half in signal orange, resilience half in verification teal. */
const nodes = [
  { x: 148, y: 128, end: true, t: 'Research', s: 'Attack techniques', c: 'a' },
  { x: 332, y: 128, end: false, t: 'Assessment', s: 'Real weaknesses', c: 'a' },
  { x: 332, y: 312, end: false, t: 'Engineering', s: 'Practical fixes', c: 'r' },
  { x: 148, y: 312, end: true, t: 'Software', s: 'Posture, in development', c: 'r' },
];
export function LoopDiagram() {
  return (
    <figure className="xe-loop">
      <svg viewBox="0 0 480 440" role="img" aria-labelledby="xe-loop-title">
        <title id="xe-loop-title">
          Four disciplines in one loop: research and assessment on the attack side, engineering and
          software on the resilience side.
        </title>
        <defs>
          <marker id="xe-arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M1 1l8 4-8 4z" fill="context-stroke" />
          </marker>
        </defs>
        <path className="xe-arc-a" d="M110 220A130 130 0 0 1 366 200" markerEnd="url(#xe-arrow)" />
        <path className="xe-arc-r" d="M370 240A130 130 0 0 1 114 240" markerEnd="url(#xe-arrow)" />
        <text className="xe-center xe-center-a" x="240" y="196" textAnchor="middle">
          Think like an attacker
        </text>
        <text className="xe-center xe-center-r" x="240" y="256" textAnchor="middle">
          Engineer for resilience
        </text>
        {nodes.map((n) => (
          <g key={n.t}>
            <circle className={`xe-node xe-node-${n.c}`} cx={n.x} cy={n.y} r="8" />
            <text
              className="xe-node-title"
              x={n.end ? n.x - 18 : n.x + 18}
              y={n.y - 2}
              textAnchor={n.end ? 'end' : 'start'}
            >
              {n.t}
            </text>
            <text
              className="xe-node-sub"
              x={n.end ? n.x - 18 : n.x + 18}
              y={n.y + 16}
              textAnchor={n.end ? 'end' : 'start'}
            >
              {n.s}
            </text>
          </g>
        ))}
      </svg>
    </figure>
  );
}
