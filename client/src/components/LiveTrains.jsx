import { useState, useEffect } from "react";
import { getTrainLocation } from "../api";
import TrainMap from "./TrainMap";

const TRACKED_TRAINS = ["12301", "12951", "12627", "12001", "12259", "12309", "22691", "12431", "12049"];

export default function LiveTrains() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const results = [];
    for (const num of TRACKED_TRAINS) {
      try {
        const data = await getTrainLocation(num);
        if (data) results.push(data);
      } catch (e) { /* skip */ }
    }
    setTrains(results.sort((a, b) => a.progress - b.progress));
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    if (trains.length) {
      const interval = setInterval(fetchAll, 30000);
      return () => clearInterval(interval);
    }
  }, [trains.length]);

  if (selected) {
    return (
      <div>
        <button className="btn btn-outline btn-sm" style={{ marginBottom: 16 }} onClick={() => setSelected(null)}>
          ← Back to all trains
        </button>
        <TrainMap position={selected} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ color: "#1a237e" }}>All Running Trains</h3>
        <button className="btn btn-outline btn-sm" onClick={fetchAll} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading live train data</div>}

      <div className="live-list">
        {trains.map((t) => (
          <div key={t.trainNo} className="live-card" style={{ cursor: "pointer" }}
            onClick={() => setSelected(t)}>
            <h4>{t.trainName} <span style={{ fontSize: 13, color: "#999" }}>({t.trainNo})</span></h4>
            <div className="live-row">
              <span className="live-label">Status</span>
              <span>
                <span className={`live-dot ${t.status?.toLowerCase()}`}></span>
                {t.status} | +{t.delay} min
              </span>
            </div>
            <div className="live-row">
              <span className="live-label">Location</span>
              <span>{t.currentStation}</span>
            </div>
            <div className="live-row">
              <span className="live-label">Next Stop</span>
              <span>{t.nextStation}</span>
            </div>
            <div className="live-row">
              <span className="live-label">Progress</span>
              <span>{t.progress}%</span>
            </div>
            <div className="live-row">
              <span className="live-label">Route</span>
              <span style={{ fontSize: 12 }}>{t.from} → {t.to}</span>
            </div>
            <div style={{ marginTop: 8, background: "#f5f5f5", borderRadius: 4, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${t.progress}%`, height: "100%", background: "#4caf50", borderRadius: 4 }}></div>
            </div>
          </div>
        ))}
      </div>

      {!loading && !trains.length && (
        <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
          No running train data available
        </div>
      )}
    </div>
  );
}
