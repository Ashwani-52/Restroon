# SmartOrder (App + Server)

This repo contains:

- `app/` — Vite + React frontend
- `server/` — Express + MongoDB + Socket.IO backend

## Prerequisites

- Node.js (recommended: **18+**; this repo works on newer versions too)
- MongoDB (local or Atlas)

## Setup

1) Install dependencies (root will install both workspaces):

```bash
cd /Users/ashwanikumar/Desktop/SmartOrder
npm run install:all
```

2) Configure environment variables:

- Backend: copy `server/env.example` → `server/.env` and set `MONGO_URI` + `JWT_SECRET`
- Frontend (optional): copy `app/env.example` → `app/.env`

3) Run both frontend + backend:

```bash
npm run dev
```

## URLs (local dev)

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:5050/api/health`

## Notes on “connecting” frontend ↔ backend

- The frontend API base defaults to **`/api`** and Vite proxies it to `http://localhost:5000`.
- Socket.IO defaults to **same-origin** and Vite proxies `/socket.io` (including websockets) to the backend.


