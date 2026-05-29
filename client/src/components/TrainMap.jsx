export default function TrainMap({ position }) {
  if (!position) return null;

  const stations = [
    ...(position.reachedStations || []).map((s) => ({ name: s, reached: true })),
    ...(position.upcomingStations || []).map((s) => ({ name: s, reached: false })),
  ];

  const svgWidth = 800;
  const svgHeight = 300;
  const padding = 60;
  const usableWidth = svgWidth - padding * 2;

  return (
    <div className="map-container">
      <h3 style={{ marginBottom: 16, color: "#1a237e" }}>
        {position.trainName} ({position.trainNo})
      </h3>
      <div className="map-canvas">
        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ background: "#f0f4f8" }}>
          {/* Route line */}
          <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2}
            stroke="#b0bec5" strokeWidth="4" strokeDasharray="8,4" />

          {/* Train position indicator */}
          {position.progress !== undefined && (
            <>
              <circle cx={padding + (usableWidth * position.progress) / 100}
                cy={svgHeight / 2} r="16" fill="#1a237e" opacity="0.15" />
              <circle cx={padding + (usableWidth * position.progress) / 100}
                cy={svgHeight / 2} r="10" fill="#1a237e" />
              <text x={padding + (usableWidth * position.progress) / 100}
                y={svgHeight / 2} textAnchor="middle" dominantBaseline="central"
                fill="white" fontSize="16">🚂</text>
            </>
          )}

          {/* Stations */}
          {stations.map((s, i) => {
            const x = padding + (i / Math.max(stations.length - 1, 1)) * usableWidth;
            const isTop = i % 2 === 0;
            const labelY = isTop ? svgHeight / 2 - 30 : svgHeight / 2 + 30;
            return (
              <g key={i}>
                <circle cx={x} cy={svgHeight / 2} r="5"
                  fill={s.reached ? "#1a237e" : "#b0bec5"} stroke="white" strokeWidth="2" />
                {s.reached && <circle cx={x} cy={svgHeight / 2} r="3" fill="#4caf50" />}
                <line x1={x} y1={svgHeight / 2} x2={x} y2={labelY + (isTop ? 10 : -10)}
                  stroke="#ccc" strokeWidth="1" />
                <text x={x} y={labelY} textAnchor="middle"
                  fill={s.reached ? "#1a237e" : "#999"} fontSize="11" fontWeight={s.reached ? "600" : "400"}>
                  {s.name}
                </text>
                <text x={x} y={labelY + (isTop ? 14 : -14)} textAnchor="middle"
                  fill={s.reached ? "#4caf50" : "#bbb"} fontSize="9">
                  {s.reached ? "✓" : "○"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="map-info">
        <div className="map-info-item">
          <label>Status</label>
          <div className="value" style={{ color: position.status === "Running" ? "#4caf50" : position.status === "Arriving" ? "#ff9800" : "#2196f3" }}>
            <span className={`live-dot ${position.status?.toLowerCase()}`}></span>
            {position.status}
          </div>
        </div>
        <div className="map-info-item">
          <label>Current Location</label>
          <div className="value">{position.currentStation}</div>
        </div>
        <div className="map-info-item">
          <label>Next Station</label>
          <div className="value">{position.nextStation}</div>
        </div>
        <div className="map-info-item">
          <label>Delay</label>
          <div className="value"><span className="delay-badge">+{position.delay} min</span></div>
        </div>
        <div className="map-info-item">
          <label>Progress</label>
          <div className="value">{position.progress}%</div>
        </div>
        <div className="map-info-item">
          <label>Coordinates</label>
          <div className="value" style={{ fontSize: 12 }}>{position.lat?.toFixed(4)}, {position.lng?.toFixed(4)}</div>
        </div>
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: "#666", display: "flex", gap: 24, flexWrap: "wrap" }}>
        <span><strong>Dep:</strong> {position.depTime} {position.from}</span>
        <span><strong>Arr:</strong> {position.arrTime} {position.to}</span>
        <span><strong>Duration:</strong> {position.duration}</span>
      </div>
    </div>
  );
}
