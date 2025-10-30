const colombianCities = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Cúcuta', 'Ibagué'
]

const PRICE_CATEGORIES = {
  ECONOMICO: 'economico',
  NORMAL: 'normal',
  PREFERENCIAL: 'preferencial',
  PREMIUM: 'premium'
}

function generateFlights() {
  const flights = []
  const airlines = ['Avianca', 'LATAM', 'VivaCol', 'Satena']
  for (let i = 0; i < 120; i++) {
    const from = colombianCities[Math.floor(Math.random() * colombianCities.length)]
    let to = colombianCities[Math.floor(Math.random() * colombianCities.length)]
    if (to === from) {
      to = colombianCities[(colombianCities.indexOf(from) + 3) % colombianCities.length]
    }
    const basePrice = Math.floor(120000 + Math.random() * 600000)
    const durationMin = 40 + Math.floor(Math.random() * 120)

    const category = basePrice < 250000
      ? PRICE_CATEGORIES.ECONOMICO
      : basePrice < 400000
        ? PRICE_CATEGORIES.NORMAL
        : basePrice < 550000
          ? PRICE_CATEGORIES.PREFERENCIAL
          : PRICE_CATEGORIES.PREMIUM

    const date = new Date()
    date.setDate(date.getDate() + Math.floor(Math.random() * 30))

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
    })
  }
  return flights
}

// Singleton in serverless runtime
globalThis.__VIVA_DATA__ = globalThis.__VIVA_DATA__ || {
  flights: generateFlights(),
  users: [
    { id: 1, email: 'admin@vivaair.co', password: 'admin123', role: 'ADM', name: 'Admin' },
    { id: 2, email: 'cajero@vivaair.co', password: 'cajero123', role: 'CAJERO', name: 'Cajero' },
    { id: 3, email: 'cliente@vivaair.co', password: 'cliente123', role: 'CLIENTE', name: 'Cliente Demo' }
  ],
  colombianCities
}

export function getData(){
  return globalThis.__VIVA_DATA__
}
