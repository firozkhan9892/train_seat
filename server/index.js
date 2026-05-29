import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { stations, trains, getAvailability, getTrainPosition, classFullNames } from "./data.js";

const app = express();
app.use(cors());
app.use(express.json());

const bookings = [];

// Get all stations
app.get("/api/stations", (req, res) => {
  res.json(stations.filter((s, i, arr) => arr.findIndex((x) => x.code === s.code) === i));
});

// Search trains between stations
app.get("/api/trains/search", (req, res) => {
  const { from, to, date } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: "from and to are required" });
  }
  const results = trains.filter((t) => {
    const fromIdx = t.route.indexOf(from);
    const toIdx = t.route.indexOf(to);
    return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
  }).map((t) => {
    const fromIdx = t.route.indexOf(from);
    const toIdx = t.route.indexOf(to);
    const classes = {};
    for (const c of t.classes) {
      const avail = getAvailability(t.number, c, date || "2026-05-29");
      classes[c] = {
        name: classFullNames[c],
        available: avail.available,
        rac: avail.rac,
        waitingList: avail.waitingList,
        fare: avail.fare,
        status: avail.status,
      };
    }
    return { ...t, classes, searchFrom: from, searchTo: to };
  });
  res.json(results);
});

// Get train details
app.get("/api/trains/:number", (req, res) => {
  const train = trains.find((t) => t.number === req.params.number);
  if (!train) return res.status(404).json({ error: "Train not found" });
  res.json(train);
});

// Get real-time train position
app.get("/api/trains/:number/location", (req, res) => {
  const position = getTrainPosition(req.params.number);
  if (!position) return res.status(404).json({ error: "Train not found" });
  res.json(position);
});

// Get seat availability
app.get("/api/trains/:number/availability", (req, res) => {
  const { class: className, date } = req.query;
  if (!className) return res.status(400).json({ error: "class is required" });
  const result = getAvailability(req.params.number, className, date || "2026-05-29");
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

// Get all classes availability for a train
app.get("/api/trains/:number/availability/all", (req, res) => {
  const train = trains.find((t) => t.number === req.params.number);
  if (!train) return res.status(404).json({ error: "Train not found" });
  const { date } = req.query;
  const classes = {};
  for (const c of train.classes) {
    classes[c] = getAvailability(req.params.number, c, date || "2026-05-29");
  }
  res.json({ trainNo: req.params.number, date: date || "2026-05-29", classes });
});

// Book tickets
app.post("/api/bookings", (req, res) => {
  const { trainNo, className, passengers, date, from, to } = req.body;
  if (!trainNo || !className || !passengers || !passengers.length || !from || !to) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const train = trains.find((t) => t.number === trainNo);
  if (!train) return res.status(404).json({ error: "Train not found" });
  if (!train.classes.includes(className)) {
    return res.status(400).json({ error: "Class not available on this train" });
  }

  const avail = getAvailability(trainNo, className, date || "2026-05-29");
  let bookingStatus;
  if (avail.available >= passengers.length) {
    bookingStatus = "CONFIRMED";
  } else if (avail.rac >= passengers.length) {
    bookingStatus = "RAC";
  } else if (avail.waitingList >= passengers.length) {
    bookingStatus = "WAITING";
  } else {
    return res.status(400).json({ error: "No seats available" });
  }

  const pnr = "PNR" + Date.now().toString().slice(-8);
  const booking = {
    pnr,
    trainNo,
    trainName: train.name,
    className,
    classNameFull: classFullNames[className] || className,
    date: date || "2026-05-29",
    from,
    to,
    passengers: passengers.map((p) => ({ name: p.name, age: p.age, gender: p.gender || "Male" })),
    status: bookingStatus,
    fare: avail.fare * passengers.length,
    createdAt: new Date().toISOString(),
  };
  bookings.push(booking);
  res.status(201).json(booking);
});

// Check PNR status
app.get("/api/bookings/:pnr", (req, res) => {
  const booking = bookings.find((b) => b.pnr.toUpperCase() === req.params.pnr.toUpperCase());
  if (!booking) return res.status(404).json({ error: "PNR not found" });
  res.json(booking);
});

// Get all running trains
app.get("/api/trains/running/all", (req, res) => {
  const liveTrains = trains.map((t) => getTrainPosition(t.number)).filter(Boolean);
  res.json(liveTrains);
});

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Train API server running on http://localhost:${PORT}`);
  });
}
