# QuantNova Fund — MERN MVP

This is a 2–3 hour build-friendly MERN starter for a hedge-fund style site.

## Quickstart

```bash
# in one terminal
cd server
cp .env.example .env
# put your MongoDB URI
npm install
npm run dev

# in a second terminal
cd client
cp .env.example .env
npm install
npm run dev
```

Open the client dev URL (usually http://localhost:5173).

- Contact form posts to `POST /api/leads` and writes to MongoDB.
- "Download Pitch Deck" hits `GET /api/pitch-deck` (a small placeholder PDF is included under `server/public/`). Replace it with your real deck.
- All site copy comes from `GET /api/stats` (edit `server/data/stats.js`).

> Disclaimer: This demo is **not** investment advice and is for educational purposes only.
