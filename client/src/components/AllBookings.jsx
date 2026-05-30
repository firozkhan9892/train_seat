import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.PROD ? "/api" : "http://localhost:5000/api" });

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/bookings").then((r) => { setBookings(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading bookings</div>;

  return (
    <div>
      <h3 style={{ color: "#1a237e", marginBottom: 16 }}>All Bookings ({bookings.length})</h3>
      {!bookings.length && <div style={{ textAlign: "center", padding: 48, color: "#999" }}>No bookings yet</div>}
      {bookings.map((b) => (
        <div key={b.pnr} className="train-card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <strong style={{ fontSize: 18, color: "#1a237e", letterSpacing: 1 }}>{b.pnr}</strong>
              <span className={`status-badge ${b.status}`} style={{ marginLeft: 12, fontSize: 12 }}>{b.status}</span>
            </div>
            <div style={{ fontSize: 13, color: "#999" }}>{new Date(b.createdAt).toLocaleString()}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8, fontSize: 14 }}>
            <div><strong>Train:</strong> {b.trainName} ({b.trainNo})</div>
            <div><strong>Class:</strong> {b.classNameFull}</div>
            <div><strong>Route:</strong> {b.from} → {b.to}</div>
            <div><strong>Date:</strong> {b.date}</div>
            <div><strong>Fare:</strong> ₹{b.fare}</div>
            <div><strong>Passengers:</strong> {b.passengers?.map((p) => p.name).join(", ")}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
