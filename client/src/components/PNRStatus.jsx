import { useState } from "react";
import { getPNRStatus } from "../api";

export default function PNRStatus() {
  const [pnr, setPnr] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!pnr.trim()) { setError("Enter PNR number"); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await getPNRStatus(pnr.trim());
      setResult(data);
    } catch (e) {
      setError("PNR not found. Try booking a ticket first.");
    }
    setLoading(false);
  };

  return (
    <div className="pnr-card">
      <h3 style={{ marginBottom: 16, color: "#1a237e" }}>Check PNR Status</h3>
      <div className="search-row">
        <div className="search-field" style={{ maxWidth: 300 }}>
          <label>PNR Number</label>
          <input value={pnr} onChange={(e) => setPnr(e.target.value)}
            placeholder="e.g. PNR12345678" onKeyDown={(e) => e.key === "Enter" && handleCheck()} />
        </div>
        <div>
          <label>&nbsp;</label>
          <button className="btn btn-primary" onClick={handleCheck} disabled={loading}>
            {loading ? "Checking" : "Check Status"}
          </button>
        </div>
      </div>

      {error && <div className="error" style={{ marginTop: 16 }}>{error}</div>}

      {result && (
        <div className="pnr-result">
          <div className="pnr-header">
            <div className="pnr-no">{result.pnr}</div>
            <div className={`status-badge ${result.status}`}>{result.status}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
            <div><strong>Train:</strong> {result.trainName} ({result.trainNo})</div>
            <div><strong>Class:</strong> {result.classNameFull}</div>
            <div><strong>From:</strong> {result.from}</div>
            <div><strong>To:</strong> {result.to}</div>
            <div><strong>Date:</strong> {result.date}</div>
            <div><strong>Passengers:</strong> {result.passengers?.length}</div>
            <div><strong>Fare:</strong> ₹{result.fare}</div>
            <div><strong>Booked:</strong> {new Date(result.createdAt).toLocaleString()}</div>
          </div>
          <div style={{ marginTop: 16 }}>
            <h4>Passenger Details</h4>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: 8, textAlign: "left", borderBottom: "2px solid #ddd" }}>#</th>
                  <th style={{ padding: 8, textAlign: "left", borderBottom: "2px solid #ddd" }}>Name</th>
                  <th style={{ padding: 8, textAlign: "left", borderBottom: "2px solid #ddd" }}>Age</th>
                  <th style={{ padding: 8, textAlign: "left", borderBottom: "2px solid #ddd" }}>Gender</th>
                  <th style={{ padding: 8, textAlign: "left", borderBottom: "2px solid #ddd" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.passengers?.map((p, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{i + 1}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{p.name}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{p.age}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{p.gender}</td>
                    <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      <span className={`status-badge ${result.status}`} style={{ fontSize: 12, padding: "2px 8px" }}>
                        {result.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
