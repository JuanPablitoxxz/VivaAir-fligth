import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Datos en memoria (demo)
const colombianCities = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Cúcuta', 'Ibagué'
];

const PRICE_CATEGORIES = {
  ECONOMICO: 'economico',
  NORMAL: 'normal',
  PREFERENCIAL: 'preferencial',
  PREMIUM: 'premium'
};

// Genera vuelos demo
function generateFlights() {
  const flights = [];
  const airlines = ['Avianca', 'LATAM', 'VivaCol', 'Satena'];
  for (let i = 0; i < 120; i++) {
    const from = colombianCities[Math.floor(Math.random() * colombianCities.length)];
    let to = colombianCities[Math.floor(Math.random() * colombianCities.length)];
    if (to === from) {
      to = colombianCities[(colombianCities.indexOf(from) + 3) % colombianCities.length];
    }
    const basePrice = Math.floor(120000 + Math.random() * 600000);
    const durationMin = 40 + Math.floor(Math.random() * 120);

    const category = basePrice < 250000
      ? PRICE_CATEGORIES.ECONOMICO
      : basePrice < 400000
        ? PRICE_CATEGORIES.NORMAL
        : basePrice < 550000
          ? PRICE_CATEGORIES.PREFERENCIAL
          : PRICE_CATEGORIES.PREMIUM;

    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 30));

    flights.push({
      id: `FL-${i + 1}`,
      airline: airlines[Math.floor(Math.random() * airlines.length)],
      from,
      to,
      date: date.toISOString().slice(0, 10),
      time: `${String(8 + (i % 10)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
      durationMin,
      priceCOP: basePrice,
      category
    });
  }
  return flights;
}

let flights = generateFlights();

const users = [
  { id: 1, email: 'admin@vivaair.co', password: 'admin123', role: 'ADM', name: 'Admin' },
  { id: 2, email: 'cajero@vivaair.co', password: 'cajero123', role: 'CAJERO', name: 'Cajero' },
  { id: 3, email: 'cliente@vivaair.co', password: 'cliente123', role: 'CLIENTE', name: 'Cliente Demo' }
];

// Auth simplificada
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
  // Token simulado
  const token = Buffer.from(`${user.id}:${user.role}`).toString('base64');
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

// Listado de ciudades
app.get('/api/cities', (_req, res) => {
  res.json(colombianCities);
});

// Buscar vuelos
app.get('/api/flights', (req, res) => {
  const { from, to, date, passengers } = req.query;
  let results = flights;

  if (from) results = results.filter(f => f.from.toLowerCase() === String(from).toLowerCase());
  if (to) results = results.filter(f => f.to.toLowerCase() === String(to).toLowerCase());
  if (date) results = results.filter(f => f.date === date);

  // Pasajeros no afecta el filtro en demo, pero se recibe para consistencia
  const nPassengers = Number(passengers || 1);
  results = results.map(f => ({ ...f, totalPriceCOP: f.priceCOP * nPassengers }));

  res.json(results);
});

// Dashboard por categoría
app.get('/api/dashboard', (_req, res) => {
  const groups = {
    economico: [],
    normal: [],
    preferencial: [],
    premium: []
  };
  for (const f of flights) {
    groups[f.category].push(f);
  }
  // Top 10 por categoría por menor precio
  Object.keys(groups).forEach(k => {
    groups[k] = groups[k]
      .slice()
      .sort((a, b) => a.priceCOP - b.priceCOP)
      .slice(0, 10);
  });
  res.json(groups);
});

// Panel admin (demo) - listado simple
app.get('/api/admin/summary', (_req, res) => {
  res.json({
    users: users.map(u => ({ id: u.id, email: u.email, role: u.role, name: u.name })),
    flightsCount: flights.length,
    citiesCount: colombianCities.length
  });
});

app.listen(PORT, () => {
  console.log(`VivaAir API running on http://localhost:${PORT}`);
});
