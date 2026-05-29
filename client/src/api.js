import axios from "axios";

const BASE = import.meta.env.PROD ? "/api" : "http://localhost:5000/api";
const api = axios.create({ baseURL: BASE });

export const getStations = () => api.get("/stations").then((r) => r.data);

export const searchTrains = (from, to, date) =>
  api.get("/trains/search", { params: { from, to, date } }).then((r) => r.data);

export const getTrainLocation = (number) =>
  api.get(`/trains/${number}/location`).then((r) => r.data);

export const getAvailability = (number, className, date) =>
  api.get(`/trains/${number}/availability`, { params: { class: className, date } }).then((r) => r.data);

export const getAllAvailability = (number, date) =>
  api.get(`/trains/${number}/availability/all`, { params: { date } }).then((r) => r.data);

export const bookTickets = (data) =>
  api.post("/bookings", data).then((r) => r.data);

export const getPNRStatus = (pnr) =>
  api.get(`/bookings/${pnr}`).then((r) => r.data);
