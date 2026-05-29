export const stations = [
  { code: "NDLS", name: "New Delhi", state: "Delhi", lat: 28.6422, lng: 77.2208 },
  { code: "BCT", name: "Mumbai Central", state: "Maharashtra", lat: 18.9716, lng: 72.8243 },
  { code: "HWH", name: "Howrah Junction", state: "West Bengal", lat: 22.5858, lng: 88.3422 },
  { code: "MAS", name: "Chennai Central", state: "Tamil Nadu", lat: 13.0837, lng: 80.2765 },
  { code: "SBC", name: "Bengaluru City", state: "Karnataka", lat: 12.9783, lng: 77.5713 },
  { code: "BZA", name: "Vijayawada Junction", state: "Andhra Pradesh", lat: 16.5183, lng: 80.6161 },
  { code: "JP", name: "Jaipur", state: "Rajasthan", lat: 26.9167, lng: 75.8167 },
  { code: "LKO", name: "Lucknow", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { code: "PNBE", name: "Patna Junction", state: "Bihar", lat: 25.6161, lng: 85.1390 },
  { code: "ADI", name: "Ahmedabad Junction", state: "Gujarat", lat: 23.0250, lng: 72.6054 },
  { code: "PUNE", name: "Pune Junction", state: "Maharashtra", lat: 18.5295, lng: 73.8743 },
  { code: "GHY", name: "Guwahati", state: "Assam", lat: 26.1819, lng: 91.7462 },
  { code: "MMCT", name: "Mumbai Central", state: "Maharashtra", lat: 18.9716, lng: 72.8243 },
  { code: "ND", name: "Nanded", state: "Maharashtra", lat: 19.1617, lng: 77.3153 },
  { code: "BPL", name: "Bhopal Junction", state: "Madhya Pradesh", lat: 23.2680, lng: 77.4088 },
  { code: "KRNT", name: "Kurnool City", state: "Andhra Pradesh", lat: 15.8284, lng: 78.0343 },
  { code: "TVC", name: "Thiruvananthapuram Central", state: "Kerala", lat: 8.4875, lng: 76.9520 },
  { code: "CSTM", name: "Mumbai CSMT", state: "Maharashtra", lat: 18.9403, lng: 72.8341 },
  { code: "DLI", name: "Old Delhi", state: "Delhi", lat: 28.6612, lng: 77.2288 },
  { code: "ND", name: "Nizamuddin", state: "Delhi", lat: 28.5887, lng: 77.2520 },
  { code: "BBS", name: "Bhubaneswar", state: "Odisha", lat: 20.2719, lng: 85.8380 },
  { code: "ND", name: "New Delhi", state: "Delhi", lat: 28.6422, lng: 77.2208 },
  { code: "LTT", name: "Lokmanya Tilak Terminus", state: "Maharashtra", lat: 19.0700, lng: 72.8775 },
  { code: "PRYJ", name: "Prayagraj Junction", state: "Uttar Pradesh", lat: 25.4358, lng: 81.8463 },
  { code: "CNB", name: "Kanpur Central", state: "Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
];

const stationMap = {};
for (const s of stations) {
  if (!stationMap[s.code]) stationMap[s.code] = s;
}

export const trains = [
  {
    number: "12301",
    name: "Howrah Rajdhani Express",
    from: "HWH",
    to: "NDLS",
    depTime: "13:05",
    arrTime: "10:00",
    duration: "20h 55m",
    type: "rajdhani",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A"],
    route: ["HWH", "BPL", "NDLS"],
  },
  {
    number: "12951",
    name: "Mumbai Rajdhani Express",
    from: "MMCT",
    to: "NDLS",
    depTime: "16:35",
    arrTime: "08:30",
    duration: "15h 55m",
    type: "rajdhani",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A"],
    route: ["MMCT", "BPL", "NDLS"],
  },
  {
    number: "22691",
    name: "Karnataka Express",
    from: "SBC",
    to: "NDLS",
    depTime: "19:15",
    arrTime: "06:40",
    duration: "35h 25m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["2A", "3A", "SL"],
    route: ["SBC", "BZA", "KRNT", "BPL", "NDLS"],
  },
  {
    number: "12627",
    name: "Karnataka Express",
    from: "NDLS",
    to: "SBC",
    depTime: "21:15",
    arrTime: "06:40",
    duration: "33h 25m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["2A", "3A", "SL"],
    route: ["NDLS", "BPL", "KRNT", "BZA", "SBC"],
  },
  {
    number: "12621",
    name: "Tamil Nadu Express",
    from: "NDLS",
    to: "MAS",
    depTime: "22:30",
    arrTime: "07:10",
    duration: "32h 40m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A", "SL"],
    route: ["NDLS", "BPL", "BZA", "MAS"],
  },
  {
    number: "12259",
    name: "Sealdah Duronto Express",
    from: "NDLS",
    to: "HWH",
    depTime: "12:50",
    arrTime: "06:30",
    duration: "17h 40m",
    type: "duronto",
    days: ["Mon", "Wed", "Fri"],
    classes: ["1A", "2A", "3A"],
    route: ["NDLS", "HWH"],
  },
  {
    number: "12431",
    name: "Rajdhani Express",
    from: "NDLS",
    to: "TVC",
    depTime: "11:25",
    arrTime: "16:10",
    duration: "52h 45m",
    type: "rajdhani",
    days: ["Tue", "Thu", "Sat"],
    classes: ["1A", "2A", "3A"],
    route: ["NDLS", "BPL", "BZA", "MAS", "TVC"],
  },
  {
    number: "12001",
    name: "Shatabdi Express",
    from: "NDLS",
    to: "LKO",
    depTime: "06:00",
    arrTime: "12:25",
    duration: "6h 25m",
    type: "shatabdi",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    classes: ["CC", "EC"],
    route: ["NDLS", "LKO"],
  },
  {
    number: "12903",
    name: "Golden Temple Mail",
    from: "MMCT",
    to: "NDLS",
    depTime: "21:30",
    arrTime: "10:00",
    duration: "36h 30m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A", "SL"],
    route: ["MMCT", "JP", "NDLS"],
  },
  {
    number: "12309",
    name: "Patna Rajdhani Express",
    from: "NDLS",
    to: "PNBE",
    depTime: "17:00",
    arrTime: "06:50",
    duration: "13h 50m",
    type: "rajdhani",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A"],
    route: ["NDLS", "PNBE"],
  },
  {
    number: "12625",
    name: "Kerala Express",
    from: "NDLS",
    to: "TVC",
    depTime: "15:45",
    arrTime: "05:15",
    duration: "61h 30m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["2A", "3A", "SL"],
    route: ["NDLS", "BPL", "BZA", "MAS", "TVC"],
  },
  {
    number: "12839",
    name: "Howrah-Chennai Mail",
    from: "HWH",
    to: "MAS",
    depTime: "23:50",
    arrTime: "04:35",
    duration: "28h 45m",
    type: "express",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["2A", "3A", "SL"],
    route: ["HWH", "BZA", "MAS"],
  },
  {
    number: "16526",
    name: "KSR Bengaluru-Kanniyakumari Express",
    from: "SBC",
    to: "TVC",
    depTime: "20:00",
    arrTime: "12:30",
    duration: "16h 30m",
    type: "express",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["2A", "3A", "SL"],
    route: ["SBC", "MAS", "TVC"],
  },
  {
    number: "22694",
    name: "Chennai-Bengaluru Shatabdi",
    from: "MAS",
    to: "SBC",
    depTime: "06:00",
    arrTime: "10:55",
    duration: "4h 55m",
    type: "shatabdi",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["CC", "EC"],
    route: ["MAS", "SBC"],
  },
  {
    number: "12049",
    name: "Gatimaan Express",
    from: "NDLS",
    to: "BPL",
    depTime: "08:10",
    arrTime: "13:50",
    duration: "5h 40m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["CC", "EC"],
    route: ["NDLS", "BPL"],
  },
  {
    number: "12103",
    name: "LTT Lucknow Express",
    from: "LTT",
    to: "LKO",
    depTime: "21:35",
    arrTime: "14:50",
    duration: "17h 15m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["1A", "2A", "3A", "SL"],
    route: ["LTT", "BPL", "PRYJ", "CNB", "LKO"],
  },
  {
    number: "12533",
    name: "Pushpak Express",
    from: "LTT",
    to: "LKO",
    depTime: "06:45",
    arrTime: "23:10",
    duration: "16h 25m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["2A", "3A", "SL"],
    route: ["LTT", "BPL", "PRYJ", "CNB", "LKO"],
  },
  {
    number: "12107",
    name: "LTT Gomti Express",
    from: "LTT",
    to: "LKO",
    depTime: "13:40",
    arrTime: "06:50",
    duration: "17h 10m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["2A", "3A", "SL"],
    route: ["LTT", "BPL", "PRYJ", "CNB", "LKO"],
  },
  {
    number: "12336",
    name: "LTT Bhagalpur Express",
    from: "LTT",
    to: "PRYJ",
    depTime: "23:55",
    arrTime: "15:05",
    duration: "15h 10m",
    type: "superfast",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: ["2A", "3A", "SL"],
    route: ["LTT", "BPL", "PRYJ"],
  },
  {
    number: "12541",
    name: "LTT Gorakhpur Express",
    from: "LTT",
    to: "PRYJ",
    depTime: "14:25",
    arrTime: "05:20",
    duration: "14h 55m",
    type: "superfast",
    days: ["Mon", "Wed", "Fri"],
    classes: ["2A", "3A", "SL"],
    route: ["LTT", "BPL", "CNB", "PRYJ"],
  },
  {
    number: "12165",
    name: "LTT Prayagraj Express",
    from: "LTT",
    to: "PRYJ",
    depTime: "19:10",
    arrTime: "09:30",
    duration: "14h 20m",
    type: "express",
    days: ["Tue", "Thu", "Sat"],
    classes: ["SL", "2A", "3A"],
    route: ["LTT", "BPL", "PRYJ"],
  },
];

const classNames = {
  "1A": "First AC",
  "2A": "Second AC",
  "3A": "Third AC",
  "SL": "Sleeper",
  "CC": "AC Chair Car",
  "EC": "Executive Chair Car",
};

export const classFullNames = classNames;

const seatFixtures = [
  { cls: "1A", total: 48, baseRAC: 4, baseWL: 2 },
  { cls: "2A", total: 108, baseRAC: 10, baseWL: 15 },
  { cls: "3A", total: 180, baseRAC: 15, baseWL: 25 },
  { cls: "SL", total: 360, baseRAC: 20, baseWL: 40 },
  { cls: "CC", total: 120, baseRAC: 8, baseWL: 10 },
  { cls: "EC", total: 56, baseRAC: 2, baseWL: 2 },
];

const availableSeats = {};
for (const f of seatFixtures) {
  availableSeats[f.cls] = { total: f.total, racLimit: f.baseRAC, wlLimit: f.baseWL };
}

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function getAvailability(trainNo, className, dateStr) {
  const train = trains.find((t) => t.number === trainNo);
  if (!train || !train.classes.includes(className)) {
    return { error: "Invalid train or class" };
  }
  const seed = parseInt(trainNo.replace(/\D/g, "")) + (dateStr ? new Date(dateStr).getDate() : 1);
  const rand = seededRandom(seed);
  const info = availableSeats[className] || { total: 200, racLimit: 20, wlLimit: 40 };

  const booked = Math.floor(rand() * info.total * 0.85);
  const racBooked = Math.floor(rand() * info.racLimit * 0.8);
  const wlBooked = Math.floor(rand() * info.wlLimit * 0.7);

  const available = Math.max(0, info.total - booked);
  const racAvailable = Math.max(0, info.racLimit - racBooked);
  const wlAvailable = Math.max(0, info.wlLimit - wlBooked);

  const fare = {
    "1A": 3500 + Math.floor(rand() * 1500),
    "2A": 1800 + Math.floor(rand() * 800),
    "3A": 900 + Math.floor(rand() * 500),
    "SL": 350 + Math.floor(rand() * 200),
    "CC": 800 + Math.floor(rand() * 300),
    "EC": 1500 + Math.floor(rand() * 500),
  };

  const statuses = [];
  for (let i = 1; i <= available && i <= 10; i++) statuses.push("Available");
  for (let i = 0; i < racAvailable; i++) statuses.push("RAC");
  for (let i = 0; i < wlAvailable; i++) statuses.push(`WL${i + 1}`);

  return {
    trainNo,
    className,
    date: dateStr,
    totalSeats: info.total,
    available: available,
    rac: racAvailable,
    waitingList: wlAvailable,
    fare: fare[className],
    status: available > 0 ? "AVAILABLE" : racAvailable > 0 ? "RAC" : wlAvailable > 0 ? "WAITING" : "FULL",
    berths: statuses,
  };
}

export function getTrainPosition(trainNo) {
  const train = trains.find((t) => t.number === trainNo);
  if (!train) return null;

  const now = new Date();
  const [depH, depM] = train.depTime.split(":").map(Number);
  const depTotal = depH * 60 + depM;
  const [arrH, arrM] = train.arrTime.split(":").map(Number);
  const arrTotal = arrH * 60 + arrM + (arrH < depH ? 1440 : 0);
  const journeyMin = arrTotal - depTotal;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  let progress = (nowMin - depTotal) / journeyMin;
  progress = Math.max(0, Math.min(1, progress));

  const routeStations = train.route.map((code) => stationMap[code]).filter(Boolean);
  if (routeStations.length < 2) return null;

  const totalSegments = routeStations.length - 1;
  const segIdx = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
  const segProgress = (progress * totalSegments) - segIdx;

  const from = routeStations[segIdx];
  const to = routeStations[Math.min(segIdx + 1, totalSegments)];

  const lat = from.lat + (to.lat - from.lat) * segProgress;
  const lng = from.lng + (to.lng - from.lng) * segProgress;

  const reachedStations = [];
  for (let i = 0; i <= segIdx; i++) {
    reachedStations.push(routeStations[i].name);
  }
  const upcomingStations = [];
  for (let i = segIdx + 1; i < routeStations.length; i++) {
    upcomingStations.push(routeStations[i].name);
  }

  const runningStatus = progress < 0.1 ? "Departed" : progress > 0.9 ? "Arriving" : "Running";
  const delay = Math.floor(Math.random() * 30);

  return {
    trainNo: train.number,
    trainName: train.name,
    lat,
    lng,
    progress: Math.round(progress * 100),
    from: train.from,
    to: train.to,
    currentStation: from.name,
    nextStation: to.name,
    depTime: train.depTime,
    arrTime: train.arrTime,
    duration: train.duration,
    status: runningStatus,
    delay,
    reachedStations,
    upcomingStations,
  };
}

export { stationMap };
