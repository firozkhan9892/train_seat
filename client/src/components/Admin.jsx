import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.PROD ? "/api" : "http://localhost:5000/api" });

const TABS = ["Dashboard", "Bookings", "Customers", "Reports"];

function StatCard({ label, value, color }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-value" style={{ color }}>{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("Dashboard");
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats").then((r) => setStats(r.data)),
      api.get("/bookings").then((r) => setBookings(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadCustomers = async () => {
    const r = await api.get("/admin/customers");
    setCustomers(r.data);
  };

  const loadReports = async (from, to) => {
    const r = await api.get("/admin/reports", { params: { from, to } });
    setReports(r.data);
  };

  useEffect(() => { if (tab === "Customers") loadCustomers(); }, [tab]);
  useEffect(() => { if (tab === "Reports") loadReports(); }, [tab]);

  if (loading) return <div className="loading">Loading admin panel</div>;

  return (
    <div>
      <div className="admin-header">
        <h3 style={{ color: "#1a237e" }}>Admin Panel</h3>
        <div className="nav" style={{ marginTop: 8 }}>
          {TABS.map((t) => (
            <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "Dashboard" && stats && (
        <div className="admin-stats-grid">
          <StatCard label="Total Bookings" value={stats.totalBookings} color="#1a237e" />
          <StatCard label="Today's Bookings" value={stats.todayBookings} color="#2e7d32" />
          <StatCard label="Total Income" value={`₹${(stats.totalIncome || 0).toLocaleString()}`} color="#e65100" />
          <StatCard label="Unique Customers" value={stats.uniqueCustomers} color="#6a1b9a" />
        </div>
      )}

      {tab === "Bookings" && (
        <div>
          {!bookings.length && <div className="empty-state">No bookings yet</div>}
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
      )}

      {tab === "Customers" && (
        <div>
          {!customers.length && <div className="empty-state">No customers yet</div>}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Bookings</th>
                  <th>Total Spent</th>
                  <th>Last Booking</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.phone || "—"}</td>
                    <td>{c.bookings}</td>
                    <td>₹{c.totalSpent.toLocaleString()}</td>
                    <td style={{ fontSize: 12, color: "#999" }}>{c.lastBooking ? new Date(c.lastBooking).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Reports" && (
        <div>
          <div className="search-row" style={{ marginBottom: 16 }}>
            <div className="search-field">
              <label>From</label>
              <input type="date" onChange={(e) => loadReports(e.target.value, document.getElementById("report-to").value)} />
            </div>
            <div className="search-field">
              <label>To</label>
              <input id="report-to" type="date" onChange={(e) => loadReports(document.querySelector("input[type=date]").value, e.target.value)} />
            </div>
          </div>
          {reports && (
            <>
              <div className="admin-stats-grid" style={{ marginBottom: 16 }}>
                <StatCard label="Filtered Bookings" value={reports.totalBookings} color="#1a237e" />
                <StatCard label="Filtered Income" value={`₹${(reports.totalIncome || 0).toLocaleString()}`} color="#e65100" />
              </div>
              {reports.byMonth?.length > 0 && (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Bookings</th>
                        <th>Income</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.byMonth.map((m) => (
                        <tr key={m.month}>
                          <td>{m.month}</td>
                          <td>{m.bookings}</td>
                          <td>₹{m.income.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
