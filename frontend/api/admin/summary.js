import { getData } from '../_data'

export default async function handler(_req, res){
  const { users, flights, colombianCities } = getData()
  return res.json({
    users: users.map(u => ({ id: u.id, email: u.email, role: u.role, name: u.name })),
    flightsCount: flights.length,
    citiesCount: colombianCities.length
  })
}
