import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createAdminClient } from "@insforge/sdk";
import { stations, trains, getAvailability, getTrainPosition, classFullNames } from "./data.js";
import * as irctc from "./irctcService.js";

const useRealApi = !!irctc.key;

const app = express();
app.use(cors());
app.use(express.json());

// InsForge DB setup
let insforge = null;
const configPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", ".insforge", "project.json");
try {
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  insforge = createAdminClient({ baseUrl: config.oss_host, apiKey: config.api_key });
  console.log("InsForge DB connected:", config.oss_host);
} catch (e) {
  console.warn("InsForge config not found. Using in-memory storage.");
}

let bookings = [];

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
  if (insforge) {
    insforge.database.from("bookings").insert([{
      pnr: booking.pnr, train_no: booking.trainNo,
      train_name: booking.trainName, from_station: booking.from,
      to_station: booking.to, date: booking.date,
      class_name: booking.className, class_name_full: booking.classNameFull,
      fare: booking.fare, status: booking.status,
      passengers: JSON.stringify(booking.passengers),
      created_at: booking.createdAt,
    }]).then().catch((err) => console.error("InsForge insert error:", err));
  }
  res.status(201).json(booking);
});

// Get all bookings
app.get("/api/bookings", async (req, res) => {
  if (insforge) {
    const { data, error } = await insforge.database
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data.map(b => ({
      pnr: b.pnr, trainNo: b.train_no, trainName: b.train_name,
      className: b.class_name, classNameFull: b.class_name_full,
      date: b.date, from: b.from_station, to: b.to_station,
      fare: b.fare, status: b.status,
      passengers: typeof b.passengers === "string" ? JSON.parse(b.passengers) : b.passengers,
      createdAt: b.created_at,
    })));
  }
  res.json(bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Check PNR status
app.get("/api/bookings/:pnr", async (req, res) => {
  if (insforge) {
    const { data, error } = await insforge.database
      .from("bookings")
      .select("*")
      .ilike("pnr", req.params.pnr.toUpperCase())
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "PNR not found" });
    return res.json({
      pnr: data.pnr, trainNo: data.train_no, trainName: data.train_name,
      className: data.class_name, classNameFull: data.class_name_full,
      date: data.date, from: data.from_station, to: data.to_station,
      fare: data.fare, status: data.status,
      passengers: typeof data.passengers === "string" ? JSON.parse(data.passengers) : data.passengers,
      createdAt: data.created_at,
    });
  }
  const booking = bookings.find((b) => b.pnr.toUpperCase() === req.params.pnr.toUpperCase());
  if (!booking) return res.status(404).json({ error: "PNR not found" });
  res.json(booking);
});

// Get all running trains
app.get("/api/trains/running/all", (req, res) => {
  const liveTrains = trains.map((t) => getTrainPosition(t.number)).filter(Boolean);
  res.json(liveTrains);
});

// Admin Dashboard Stats
app.get("/api/admin/stats", async (req, res) => {
  if (insforge) {
    const { data, error } = await insforge.database.from("bookings").select("*");
    if (error) return res.status(500).json({ error: error.message });
    const total = data.length;
    const totalIncome = data.reduce((s, b) => s + (b.fare || 0), 0);
    const uniqueCustomers = new Set(data.flatMap((b) => {
      const p = typeof b.passengers === "string" ? JSON.parse(b.passengers) : b.passengers;
      return p?.map((x) => x.name) || [];
    })).size;
    const today = new Date().toISOString().split("T")[0];
    const todayBookings = data.filter((b) => b.created_at?.startsWith(today)).length;
    return res.json({ totalBookings: total, totalIncome, uniqueCustomers, todayBookings });
  }
  const total = bookings.length;
  const totalIncome = bookings.reduce((s, b) => s + (b.fare || 0), 0);
  const uniqueCustomers = new Set(bookings.flatMap((b) => b.passengers?.map((p) => p.name) || [])).size;
  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.createdAt?.startsWith(today)).length;
  res.json({ totalBookings: total, totalIncome, uniqueCustomers, todayBookings });
});

async function adminCustomersFallback() {
  if (insforge) {
    const { data, error } = await insforge.database.from("bookings").select("*");
    if (error) throw error;
    return data;
  }
  return null;
}

// Admin Customers
app.get("/api/admin/customers", async (req, res) => {
  let all = null;
  try { all = await adminCustomersFallback(); } catch {}
  const bkgs = all || bookings;
  const customerMap = {};
  for (const b of bkgs) {
    const ps = typeof b.passengers === "string" ? JSON.parse(b.passengers) : b.passengers;
    for (const p of ps || []) {
      const key = p.name.toLowerCase();
      if (!customerMap[key]) customerMap[key] = { name: p.name, phone: p.phone || "", bookings: 0, totalSpent: 0, lastBooking: "" };
      customerMap[key].bookings++;
      customerMap[key].totalSpent += b.fare || 0;
      const ct = b.created_at || b.createdAt;
      if (ct > customerMap[key].lastBooking) customerMap[key].lastBooking = ct;
    }
  }
  res.json(Object.values(customerMap).sort((a, b) => b.bookings - a.bookings));
});

// Admin Reports
app.get("/api/admin/reports", async (req, res) => {
  const { from, to } = req.query;
  let all = null;
  try { all = await adminCustomersFallback(); } catch {}
  const bkgs = all || bookings;
  let filtered = bkgs;
  if (from) filtered = filtered.filter((b) => (b.created_at || b.createdAt) >= from);
  if (to) filtered = filtered.filter((b) => (b.created_at || b.createdAt) <= to + "T23:59:59Z");
  const totalIncome = filtered.reduce((s, b) => s + (b.fare || 0), 0);
  const byMonth = {};
  for (const b of filtered) {
    const month = (b.created_at || b.createdAt)?.slice(0, 7) || "unknown";
    if (!byMonth[month]) byMonth[month] = { bookings: 0, income: 0 };
    byMonth[month].bookings++;
    byMonth[month].income += b.fare || 0;
  }
  res.json({
    totalBookings: filtered.length,
    totalIncome,
    byMonth: Object.entries(byMonth).map(([month, data]) => ({ month, ...data })),
    bookings: (all ? filtered.map(b => ({
      pnr: b.pnr, trainNo: b.train_no, trainName: b.train_name,
      className: b.class_name, classNameFull: b.class_name_full,
      date: b.date, from: b.from_station, to: b.to_station,
      fare: b.fare, status: b.status,
      passengers: typeof b.passengers === "string" ? JSON.parse(b.passengers) : b.passengers,
      createdAt: b.created_at,
    })) : filtered).sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)),
  });
});

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Train API server running on http://localhost:${PORT}`);
  });
}
