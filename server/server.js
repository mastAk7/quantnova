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
    const { name, email, investorType, message } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required." });
    }
    const lead = await Lead.create({ name, email, investorType, message });
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

// Static files
app.use("/public", express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
