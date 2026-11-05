// Our kitchen, rebuilt with Express — Express Lesson 1
// Same pantry, same dishes, same rules — just a manager at the front door.
// Express = the manager: guests say WHERE they want to go (the route),
// and the manager sends them to the right door automatically.
const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const menu = [
  { service: 'Deep Tissue Massage', price: 80 },
  { service: 'Swedish Massage', price: 65 },
  { service: 'Therapeutic Massage', price: 50 },
  { service: 'Luxury Group Massage', price: 100 },
  { service: 'Lomi Lomi Massage', price: 60 },
  { service: 'Prenatal Massage', price: 45 }
];

// The pantry: same real database file, same table.
const pantry = new DatabaseSync('mimis-kitchen.db');
pantry.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,    
    service TEXT,
    date TEXT
  )
`);

const kitchen = express();

// The manager reads the order slip (JSON body) for us — no more
// collecting 'data' chunks by hand. The slip lands on req.body.
kitchen.use(express.json());
// The dining room closet: the kitchen now hands out the pages in the
// public folder, so the app lives at the kitchen's own address.
// __dirname points at the app's own folder, so it works no matter where the container starts the app.
kitchen.use(express.static(path.join(__dirname, 'public')));

// The guest list (CORS), as one manager rule instead of headers on
// every single answer. The browser's preflight knock (OPTIONS) is
// answered here too, automatically.
kitchen.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// The chef's checks, shared by the POST and PUT doors.
function checkSlip(booking) {
  if (!booking.name || !booking.service || !booking.date) {
    return 'Order slip incomplete! We need a name, a service, and a date.';
  }
  const onMenu = menu.some(dish => dish.service === booking.service);
  if (!onMenu) return 'We do not serve that dish!';
  return null;
}

// Door 3, shared by the :id doors: the guest must hand us a real number.
function checkNumber(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'That is not a booking number!' });
    return null;
  }
  return id;
}

// --- The doors, named plainly. No more if/else chains checking
// --- order.url and order.method by hand. The manager does that. ---

kitchen.get('/services', (req, res) => {
  res.json(menu);
});

kitchen.get('/bookings', (req, res) => {
  // SEARCH: if the guest asked a question (?service=...), answer it.
  // Express hands us the question already unpacked: req.query.service.
  // No question? Whole list, same as always.
  if (req.query.service) {
    const bookings = pantry.prepare(
      'SELECT * FROM bookings WHERE service = ? ORDER BY id'
    ).all(req.query.service);
    return res.json(bookings);
  }
  const bookings = pantry.prepare('SELECT * FROM bookings ORDER BY id').all();
  res.json(bookings);
});

kitchen.get('/bookings/:id', (req, res) => {
  const id = checkNumber(req, res);
  if (id === null) return;
  const found = pantry.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
  if (!found) return res.status(404).json({ error: 'No booking with that number.' });
  res.json(found);
});

kitchen.post('/bookings', (req, res) => {
  const problem = checkSlip(req.body);
  if (problem) return res.status(400).json({ error: problem });
  const result = pantry.prepare(
    'INSERT INTO bookings (name, service, date) VALUES (?, ?, ?)'
  ).run(req.body.name, req.body.service, req.body.date);
  const booking = { ...req.body, id: Number(result.lastInsertRowid) };
  res.status(201).json({ message: 'Booking saved!', booking });
});

kitchen.put('/bookings/:id', (req, res) => {
  const id = checkNumber(req, res);
  if (id === null) return;
  const problem = checkSlip(req.body);
  if (problem) return res.status(400).json({ error: problem });
  const result = pantry.prepare(
    'UPDATE bookings SET name = ?, service = ?, date = ? WHERE id = ?'
  ).run(req.body.name, req.body.service, req.body.date, id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'No booking with that number.' });
  }
  res.json({ message: 'Booking updated!', booking: { ...req.body, id } });
});

kitchen.delete('/bookings/:id', (req, res) => {
  const id = checkNumber(req, res);
  if (id === null) return;
  const result = pantry.prepare('DELETE FROM bookings WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'No booking with that number.' });
  }
  res.json({ message: 'Booking cancelled.' });
});

// The manager's last rule: anything that matched no door gets a 404.
kitchen.use((req, res) => {
  res.status(404).send('Sorry, this kitchen does not serve that dish!');
});

const PORT = process.env.PORT || 3000;
kitchen.listen(PORT, () => {
  console.log(`Kitchen open at http://localhost:${PORT}`);
});
