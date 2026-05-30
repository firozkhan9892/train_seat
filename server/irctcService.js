import { configure, searchTrainBetweenStations, getTrainInfo, trackTrain, getAvailability, checkPNRStatus, liveAtStation } from "irctc-connect";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { stations, trains as mockTrains, getAvailability as mockAvailability, getTrainPosition as mockPosition, classFullNames } from "./data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadApiKey() {
  try {
    const envPath = path.join(__dirname, "..", "env");
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/X-RapidAPI-Key=(.+)/);
    if (match) return match[1].trim();
  } catch {}
  try {
    const envPath = path.join(__dirname, "..", ".env");
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/IRCTC_API_KEY=(.+)/);
    if (match) return match[1].trim();
  } catch {}
  return null;
}

const key = loadApiKey();
if (key) configure(key);

function formatDate(d) {
  const date = d ? new Date(d) : new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function toISODate(ddMmYyyy) {
  const [d, m, y] = ddMmYyyy.split("-");
  return `${y}-${m}-${d}`;
}

const stationCodeMap = {};
for (const s of stations) {
  stationCodeMap[s.code] = s;
}

export async function searchTrains(from, to, date) {
  if (!key) throw new Error("No API key");
  const result = await searchTrainBetweenStations(from, to);
  if (!result.success || !result.data) throw new Error(result.error || "Search failed");
  return result.data
    .filter((t) => {
      const route = [t.source_stn_code || t.from_stn_code, t.dstn_stn_code || t.to_stn_code];
      return true;
    })
    .map((t) => {
      const classes = {};
      const clsList = ["1A", "2A", "3A", "SL", "CC", "EC", "2S", "3E"];
      for (const c of clsList) {
        classes[c] = {
          name: classFullNames[c] || c,
          available: 0,
          rac: 0,
          waitingList: 0,
          fare: 0,
          status: "AVAILABLE",
        };
      }
      return {
        number: t.train_no,
        name: t.train_name,
        from: t.from_stn_code || t.source_stn_code,
        to: t.to_stn_code || t.dstn_stn_code,
        depTime: t.from_time,
        arrTime: t.to_time,
        duration: t.travel_time,
        type: (t.type || "express").toLowerCase(),
        days: t.running_days ? t.running_days.split("").map((d, i) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]).filter((_, i) => t.running_days[i] === "1") : [],
        classes,
        route: [t.from_stn_code || t.source_stn_code, t.to_stn_code || t.dstn_stn_code],
        searchFrom: from,
        searchTo: to,
      };
    });
}

export async function getTrainPosition(trainNo) {
  if (!key) throw new Error("No API key");
  const date = formatDate(new Date());
  const result = await trackTrain(trainNo, date);
  if (!result.success || !result.data) throw new Error(result.error || "Tracking failed");
  const d = result.data;
  const timeline = d.timeline || [];
  const current = timeline.find((t) => t.status === "current") || timeline.find((t) => t.status === "passed");
  const nextIdx = timeline.findIndex((t) => t.status === "upcoming");
  const upcoming = nextIdx >= 0 ? timeline[nextIdx] : null;
  const reached = timeline.filter((t) => t.status === "passed" || t.status === "current");
  const upcomingAll = timeline.filter((t) => t.status === "upcoming");

  const delay = d.delays?.overall || 0;
  const totalStations = timeline.length || 1;
  const reachedCount = reached.length;
  const progress = Math.round((reachedCount / totalStations) * 100);

  const fromStn = stationCodeMap[d.trainNo?.slice(0, 4)] || { name: current?.stationName || "Unknown", lat: 20.5937, lng: 78.9629 };
  const toStn = { name: upcoming?.stationName || "Terminal", lat: 20.5937, lng: 78.9629 };

  return {
    trainNo: d.trainNo || trainNo,
    trainName: d.trainName || "",
    lat: fromStn.lat || 20.5937,
    lng: fromStn.lng || 78.9629,
    progress,
    from: d.trainNo?.slice(0, 4) || "",
    to: "",
    currentStation: current?.stationName || d.currentStationCode || "",
    nextStation: upcoming?.stationName || "",
    depTime: current?.departure?.scheduled || "",
    arrTime: "",
    duration: "",
    status: d.statusNote?.includes("Arrived") ? "Arriving" : d.statusNote?.includes("Departed") ? "Departed" : "Running",
    delay,
    reachedStations: reached.map((t) => t.stationName),
    upcomingStations: upcomingAll.map((t) => t.stationName),
  };
}

export async function checkAvailability(trainNo, className, dateStr) {
  if (!key) throw new Error("No API key");
  const date = dateStr ? formatDate(new Date(dateStr)) : formatDate(new Date());
  const train = mockTrains.find((t) => t.number === trainNo);
  if (!train) throw new Error("Train not found");

  const result = await getAvailability(trainNo, train.route[0], train.route[train.route.length - 1], date, className, "GN");
  if (!result.success || !result.data) throw new Error(result.error || "Availability check failed");
  const d = result.data;
  const availDay = d.availability?.[0] || {};
  const total = d.availability?.length || 0;
  const availCount = d.availability?.filter((a) => a.status === "AVAILABLE" || a.status === "RAC").length || 0;

  const fare = d.fare?.totalFare || 0;
  const status = availDay.status === "AVAILABLE" ? "AVAILABLE" : availDay.status === "RAC" ? "RAC" : "WAITING";

  const berths = [];
  for (let i = 0; i < Math.min(availableSeats(className), 40); i++) {
    if (i < 10) berths.push("Available");
    else if (i < 15) berths.push("RAC");
    else berths.push(`WL${i - 14}`);
  }

  return {
    trainNo,
    className,
    date: toISODate(date),
    totalSeats: total * 6 || 180,
    available: Math.max(0, availCount),
    rac: d.availability?.filter((a) => a.status === "RAC").length || 0,
    waitingList: d.availability?.filter((a) => a.status === "WAITLIST").length || 0,
    fare,
    status,
    berths,
  };
}

function availableSeats(cls) {
  const limits = { "1A": 48, "2A": 108, "3A": 180, "SL": 360, "CC": 120, "EC": 56 };
  return limits[cls] || 180;
}

export { key, stationCodeMap };
