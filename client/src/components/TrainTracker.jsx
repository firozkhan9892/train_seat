import { useState } from "react";
import { getTrainLocation } from "../api";
import TrainMap from "./TrainMap";

const POPULAR_TRAINS = [
  { number: "12301", name: "Howrah Rajdhani" },
  { number: "12951", name: "Mumbai Rajdhani" },
  { number: "12627", name: "Karnataka Express" },
  { number: "12001", name: "Shatabdi Express" },
  { number: "12259", name: "Sealdah Duronto" },
  { number: "12309", name: "Patna Rajdhani" },
  { number: "12103", name: "LTT Lucknow Exp" },
  { number: "12533", name: "Pushpak Exp" },
  { number: "12336", name: "LTT Bhagalpur Exp" },
];

export default function TrainTracker() {
  const [trainNo, setTrainNo] = useState("12301");
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLocation = async (number) => {
    setLoading(true);
    setError("");
    try {
      const data = await getTrainLocation(number || trainNo);
      setPosition(data);
    } catch (e) {
      setError("Train not found or API error");
      setPosition(null);
    }
    setLoading(false);
  };

  const handleTrack = () => {
    if (!trainNo) { setError("Enter train number"); return; }
    fetchLocation(trainNo);
    if (autoRefresh) {
      setInterval(() => fetchLocation(trainNo), 30000);
    }
  };

  return (
    <div>
      <div className="search-card">
        <div className="search-row">
          <div className="search-field">
            <label>Train Number</label>
            <input value={trainNo} onChange={(e) => setTrainNo(e.target.value)} placeholder="e.g. 12301" />
          </div>
          <div>
            <label>&nbsp;</label>
            <button className="btn btn-primary" onClick={handleTrack} disabled={loading}>
              {loading ? "Tracking" : "Track Now"}
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              Auto-refresh (30s)
            </label>
          </div>
        </div>
        <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {POPULAR_TRAINS.map((t) => (
            <button key={t.number} className="btn btn-outline btn-sm"
              onClick={() => { setTrainNo(t.number); fetchLocation(t.number); }}>
              {t.number} - {t.name}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {loading && <div className="loading">Fetching live train position</div>}

      {position && <TrainMap position={position} />}
    </div>
  );
}
