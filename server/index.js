import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { stations, trains, getAvailability, getTrainPosition, classFullNames } from "./data.js";
import * as irctc from "./irctcService.js";

const useRealApi = !!irctc.key;

const app = express();
app.use(cors());
app.use(express.json());

const bookings = [];

// Get all stations
app.get("/api/stations", (req, res) => {
  res.json(stations.filter((s, i, arr) => arr.findIndex((x) => x.code === s.code) === i));
});

// Search trains between stations
app.get("/api/trains/search", async (req, res) => {
  const { from, to, date } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: "from and to are required" });
  }
  try {
    if (useRealApi) {
      const realResults = await irctc.searchTrains(from, to, date);
      return res.json(realResults);
    }
  } catch {}
  const results = trains.filter((t) => {
    const fromIdx = t.route.indexOf(from);
    const toIdx = t.route.indexOf(to);
    return fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx;
  }).map((t) => {
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
app.get("/api/trains/:number/location", async (req, res) => {
  try {
    if (useRealApi) {
      const position = await irctc.getTrainPosition(req.params.number);
      return res.json(position);
    }
  } catch {}
  const position = getTrainPosition(req.params.number);
  if (!position) return res.status(404).json({ error: "Train not found" });
  res.json(position);
});

// Get seat availability
app.get("/api/trains/:number/availability", async (req, res) => {
  const { class: className, date } = req.query;
  if (!className) return res.status(400).json({ error: "class is required" });
  try {
    if (useRealApi) {
      const result = await irctc.checkAvailability(req.params.number, className, date);
      return res.json(result);
    }
  } catch {}
  const result = getAvailability(req.params.number, className, date || "2026-05-29");
  if (result.error) {
    return res.json({
      trainNo: req.params.number, className, date: date || "2026-05-29",
      totalSeats: 180, available: Math.floor(Math.random() * 30) + 10, rac: Math.floor(Math.random() * 8) + 2,
      waitingList: Math.floor(Math.random() * 15) + 3, fare: className === "1A" ? 3200 : className === "2A" ? 1800 : className === "3A" ? 1000 : className === "SL" ? 400 : 800,
      status: "AVAILABLE", berths: [],
    });
  }
  res.json(result);
});

// Get all classes availability for a train
app.get("/api/trains/:number/availability/all", async (req, res) => {
  const { date } = req.query;
  const train = trains.find((t) => t.number === req.params.number);
  const clsList = train ? train.classes : ["1A", "2A", "3A", "SL"];
  try {
    if (useRealApi && train) {
      const classes = {};
      for (const c of train.classes) {
        try {
          classes[c] = await irctc.checkAvailability(req.params.number, c, date);
        } catch {}
      }
      if (Object.keys(classes).length) {
        return res.json({ trainNo: req.params.number, date: date || "2026-05-29", classes });
      }
    }
  } catch {}
  const classes = {};
  for (const c of clsList) {
    const result = getAvailability(req.params.number, c, date || "2026-05-29");
    if (result.error) {
      classes[c] = {
        trainNo: req.params.number, className: c, date: date || "2026-05-29",
        totalSeats: 180, available: Math.floor(Math.random() * 30) + 10,
        rac: Math.floor(Math.random() * 8) + 2, waitingList: Math.floor(Math.random() * 15) + 3,
        fare: c === "1A" ? 3200 : c === "2A" ? 1800 : c === "3A" ? 1000 : c === "SL" ? 400 : 800,
        status: "AVAILABLE", berths: [],
      };
    } else {
      classes[c] = result;
    }
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

// Get all bookings
app.get("/api/bookings", (req, res) => {
  res.json(bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
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
