import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin }));

// MongoDB
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}
mongoose
  .connect(mongoUri, { dbName: "quantnova" })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// Models
import Lead from "./models/Lead.js";

// Data (simple in-memory/static endpoints for MVP)
import stats from "./data/stats.js";

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/stats", (req, res) => {
  res.json(stats);
});

app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, investorType, message, requestPitchDeck } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }
    const lead = await Lead.create({ name, email, investorType, message, requestPitchDeck: Boolean(requestPitchDeck) });
    res.status(201).json({ ok: true, lead });
  } catch (err) {
    console.error("Lead create error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Serve (optional) pitch deck if provided at server/public/pitch-deck.pdf
app.get("/api/pitch-deck", (req, res) => {
  const pdfPath = path.join(__dirname, "public", "pitch-deck.pdf");
  if (fs.existsSync(pdfPath)) {
    res.sendFile(pdfPath);
  } else {
    res.status(404).json({ error: "Pitch deck not found. Drop a pitch-deck.pdf in server/public." });
  }
});

// Simple illustrative allocator endpoint for demo sandbox
app.post("/api/allocate", (req, res) => {
  const { regime = "Growth", volatility = 15 } = req.body || {};
  const base = [
    { strategy: "Factor Equity", w: 30 },
    { strategy: "Stat-Arb", w: 15 },
    { strategy: "Volatility Trading", w: 15 },
    { strategy: "AI/ML Alpha", w: 20 },
    { strategy: "Alternative Data", w: 10 },
    { strategy: "Macro Overlays", w: 10 },
  ];
  let adj = 0;
  if (regime.toLowerCase().startsWith("inflation")) adj = 5;
  if (regime.toLowerCase().startsWith("recession")) adj = 10;
  const volAdj = Math.max(-5, Math.min(5, 15 - Number(volatility)));
  const allocation = base.map((b) => {
    let weight = b.w;
    if (b.strategy === "Macro Overlays") weight += adj;
    if (b.strategy === "Volatility Trading") weight += -volAdj;
    return { strategy: b.strategy, weight: Math.max(0, Math.round(weight)) };
  });
  const total = allocation.reduce((s, a) => s + a.weight, 0) || 1;
  const normalized = allocation.map((a) => ({ ...a, weight: Math.round((a.weight / total) * 100) }));
  res.json({ regime, volatility, allocation: normalized });
});

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
