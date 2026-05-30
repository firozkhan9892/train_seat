import { useState } from "react";
import "./App.css";
import StationSearch from "./components/StationSearch";
import TrainTracker from "./components/TrainTracker";
import PNRStatus from "./components/PNRStatus";
import LiveTrains from "./components/LiveTrains";
import AllBookings from "./components/AllBookings";
import Admin from "./components/Admin";

const PAGES = {
  SEARCH: "Search & Book",
  TRACK: "Live Train Tracking",
  PNR: "PNR Status",
  BOOKINGS: "All Bookings",
  LIVE: "All Running Trains",
  ADMIN: "Admin",
};

function App() {
  const [page, setPage] = useState("SEARCH");

  return (
    <div className="app">
      <header className="header">
        <h1>🚂 RailSeek <span>Indian Railways Tracker</span></h1>
        <nav className="nav">
          {Object.entries(PAGES).map(([key, label]) => (
            <button key={key} className={page === key ? "active" : ""} onClick={() => setPage(key)}>
              {label}
            </button>
          ))}
        </nav>
      </header>
      <div className="content">
        {page === "SEARCH" && <StationSearch />}
        {page === "TRACK" && <TrainTracker />}
        {page === "PNR" && <PNRStatus />}
        {page === "BOOKINGS" && <AllBookings />}
        {page === "LIVE" && <LiveTrains />}
        {page === "ADMIN" && <Admin />}
      </div>
    </div>
  );
}

export default App;
