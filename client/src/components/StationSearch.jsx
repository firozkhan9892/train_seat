import { useState, useEffect } from "react";
import { getStations, searchTrains, getAllAvailability, bookTickets } from "../api";

export default function StationSearch() {
  const [stations, setStations] = useState([]);
  const [from, setFrom] = useState("NDLS");
  const [to, setTo] = useState("HWH");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [availData, setAvailData] = useState(null);
  const [booking, setBooking] = useState(null);
  const [bookingStep, setBookingStep] = useState(null);

  useEffect(() => {
    getStations().then(setStations).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (!from || !to) { setError("Select both stations"); return; }
    if (from === to) { setError("Stations must be different"); return; }
    setLoading(true);
    setError("");
    setSelectedTrain(null);
    setBookingStep(null);
    try {
      const data = await searchTrains(from, to, date);
      if (!data.length) setError("No trains found for this route");
      setTrains(data);
    } catch (e) { setError("Failed to search trains"); }
    setLoading(false);
  };

  const handleShowAvailability = async (train, cls) => {
    setSelectedTrain(train);
    setBookingStep(null);
    try {
      const data = await getAllAvailability(train.number, date);
      const selectedClass = data.classes[cls];
      setAvailData({ ...data, selectedClass, selectedClassName: cls });
      setBooking({ trainNo: train.number, className: cls, date, from, to, trainName: train.name });
      setBookingStep("avail");
    } catch (e) { setError("Failed to get availability"); }
  };

  const handleBooking = async (bookingData) => {
    try {
      const result = await bookTickets(bookingData);
      setBookingStep("confirm");
      setBooking(result);
    } catch (e) { setError("Booking failed"); }
  };

  const stationOptions = stations
    .filter((s, i, a) => a.findIndex((x) => x.code === s.code) === i)
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div>
      <div className="search-card">
        <div className="search-row">
          <div className="search-field">
            <label>From Station</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="">Select station</option>
              {stationOptions.map((s) => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div className="search-field">
            <label>To Station</label>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="">Select station</option>
              {stationOptions.map((s) => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
          </div>
          <div className="search-field">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label>&nbsp;</label>
            <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
              {loading ? "Searching" : "Search Trains"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {trains.map((train) => (
        <div key={train.number} className="train-card">
          <div className="train-header">
            <div>
              <div className="train-name">{train.name}</div>
              <div>
                <span className="train-number">{train.number}</span>
                <span className="train-type" style={{ marginLeft: 8 }}>{train.type}</span>
              </div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => handleShowAvailability(train, Object.keys(train.classes)[0])}>
              Check Seats
            </button>
          </div>
          <div className="train-times">
            <div className="time-block">
              <div className="time">{train.depTime}</div>
              <div className="station">{train.from}</div>
            </div>
            <div className="train-line"></div>
            <div className="time-block">
              <div className="time">{train.arrTime}</div>
              <div className="station">{train.to}</div>
            </div>
            <div className="duration">{train.duration}</div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Object.entries(train.classes).map(([cls, info]) => (
              <div key={cls} className={`class-tag ${selectedTrain?.number === train.number && availData?.selectedClassName === cls ? "selected" : ""}`}
                onClick={() => handleShowAvailability(train, cls)}>
                <div className="cls-name">{info.name}</div>
                <div className="cls-price">₹{info.fare}</div>
                <div className={`cls-status status-${info.status}`}>{info.status}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {loading && <div className="loading">Searching trains</div>}

      {!loading && !trains.length && !error && (
        <div style={{ textAlign: "center", padding: 48, color: "#999" }}>
          Search trains between stations to see results
        </div>
      )}

      {bookingStep === "avail" && availData && (
        <SeatAvailabilityPanel
          availData={availData}
          booking={booking}
          onBook={handleBooking}
          onBack={() => setBookingStep(null)}
        />
      )}

      {bookingStep === "confirm" && booking && (
        <BookingConfirmation booking={booking} onClose={() => { setBookingStep(null); setSelectedTrain(null); }} />
      )}
    </div>
  );
}

function SeatAvailabilityPanel({ availData, booking, onBook, onBack }) {
  const [passengers, setPassengers] = useState([{ name: "", age: "", gender: "Male" }]);

  const cls = availData?.selectedClass;
  const totalFare = (cls?.fare || 0) * passengers.length;

  const addPassenger = () => setPassengers([...passengers, { name: "", age: "", gender: "Male" }]);
  const removePassenger = (i) => setPassengers(passengers.filter((_, idx) => idx !== i));
  const updatePassenger = (i, field, value) => {
    const updated = [...passengers];
    updated[i][field] = value;
    setPassengers(updated);
  };

  const canBook = passengers.every((p) => p.name && p.age);
  const handleBook = () => {
    if (!canBook) return;
    onBook({ ...booking, passengers });
  };

  return (
    <div className="form-card">
      <h3>Seat Availability — {availData.trainNo}</h3>
      <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
        <div><strong>Class:</strong> {availData.selectedClassName} — {cls?.classNameFull || cls?.name}</div>
        <div><strong>Available:</strong> {cls?.available || 0}</div>
        <div><strong>RAC:</strong> {cls?.rac || 0}</div>
        <div><strong>Waiting List:</strong> {cls?.waitingList || 0}</div>
        <div><strong>Fare:</strong> ₹{cls?.fare || 0}/seat</div>
      </div>

      <div className="seats-grid">
        {cls?.berths?.slice(0, 40).map((b, i) => (
          <div key={i} className={`seat ${b === "Available" ? "available" : b === "RAC" ? "rac" : b.startsWith("WL") ? "wl" : "booked"}`}>
            {b === "Available" ? "✓" : b === "RAC" ? "R" : b.startsWith("WL") ? b.slice(2) : "✗"}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12, marginBottom: 16 }}>
        <span><span className="seat available" style={{ display: "inline-flex", width: 20, height: 20 }}>✓</span> Available</span>
        <span><span className="seat rac" style={{ display: "inline-flex", width: 20, height: 20 }}>R</span> RAC</span>
        <span><span className="seat wl" style={{ display: "inline-flex", width: 20, height: 20 }}>1</span> Waiting</span>
      </div>

      <h4 style={{ marginBottom: 12 }}>Book Tickets</h4>
      {passengers.map((p, i) => (
        <div key={i} className="passenger-card">
          <h4>Passenger {i + 1} <button className="btn btn-danger btn-sm" style={{ float: "right" }} onClick={() => removePassenger(i)} disabled={passengers.length === 1}>Remove</button></h4>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input value={p.name} onChange={(e) => updatePassenger(i, "name", e.target.value)} placeholder="Full name" />
            </div>
            <div className="form-group" style={{ minWidth: 80 }}>
              <label>Age</label>
              <input type="number" value={p.age} onChange={(e) => updatePassenger(i, "age", e.target.value)} placeholder="Age" min="1" />
            </div>
            <div className="form-group" style={{ minWidth: 100 }}>
              <label>Gender</label>
              <select value={p.gender} onChange={(e) => updatePassenger(i, "gender", e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
      ))}
      <button className="btn btn-outline btn-sm" onClick={addPassenger}>+ Add Passenger</button>

      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#2e7d32" }}>Total: ₹{totalFare}</div>
        <button className="btn btn-success" onClick={handleBook} disabled={!canBook}>Confirm Booking</button>
        <button className="btn btn-outline btn-sm" onClick={onBack}>Back</button>
      </div>
    </div>
  );
}

function BookingConfirmation({ booking, onClose }) {
  return (
    <div className="pnr-card">
      <div className="pnr-header">
        <div>
          <h3>Booking Confirmed</h3>
          <div className="pnr-no">{booking.pnr}</div>
        </div>
        <div className={`status-badge ${booking.status}`}>{booking.status}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 14 }}>
        <div><strong>Train:</strong> {booking.trainName} ({booking.trainNo})</div>
        <div><strong>Class:</strong> {booking.classNameFull}</div>
        <div><strong>From:</strong> {booking.from}</div>
        <div><strong>To:</strong> {booking.to}</div>
        <div><strong>Date:</strong> {booking.date}</div>
        <div><strong>Passengers:</strong> {booking.passengers?.length}</div>
        <div><strong>Total Fare:</strong> ₹{booking.fare}</div>
      </div>
      <div style={{ marginTop: 16 }}>
        <h4>Passengers</h4>
        {booking.passengers?.map((p, i) => (
          <div key={i} style={{ padding: "4px 0", fontSize: 14 }}>{p.name}, {p.age}yr, {p.gender}</div>
        ))}
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn btn-primary" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
