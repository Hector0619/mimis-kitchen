# Mimi's Kitchen — Booking API

A small REST API for a massage business booking system, built while learning
backend development with Node.js, Express, and SQLite. It was built up step by
step: first with plain Node.js, then rebuilt with Express — same routes, same
rules, a cleaner front door.

## What it does

- Lists services and prices for a massage menu
- Saves, finds, searches, updates, and cancels bookings
- Validates every order slip before saving (missing fields or an
  off-menu service gets a `400`)
- Returns `404` for a booking number that doesn't exist — and an empty list
  (not an error) when a search simply matches nothing

## Routes

| Method | Route | What it does |
|--------|-------|--------------|
| GET | `/services` | Whole service menu |
| GET | `/bookings` | All bookings |
| GET | `/bookings?service=...` | Bookings matching one service |
| GET | `/bookings/:id` | One booking by number |
| POST | `/bookings` | Save a new booking |
| PUT | `/bookings/:id` | Change a booking |
| DELETE | `/bookings/:id` | Cancel a booking |

## How to run it

```bash
npm install
node my-kitchen-express.js
```

The kitchen opens at `http://localhost:3000`. The database file is created
automatically on first run (and kept out of this repo) — the table is created
if it doesn't exist yet.

## Built with

- Node.js + Express (named routes, `express.json()`, middleware)
- SQLite via `node:sqlite`, with prepared statements (`?` placeholders, so
  values are copied in exactly and never treated as instructions)
Live booking page: https://mimis-kitchen-04fff.containers.snapdeploy.app/finale.html
