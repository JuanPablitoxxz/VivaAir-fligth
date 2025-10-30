import { getData } from './_data'

export default async function handler(req, res){
  const { flights } = getData()
  const { from, to, date, passengers } = req.query || {}

  let results = flights
  if (from) results = results.filter(f => f.from.toLowerCase() === String(from).toLowerCase())
  if (to) results = results.filter(f => f.to.toLowerCase() === String(to).toLowerCase())
  if (date) results = results.filter(f => f.date === date)

  const nPassengers = Number(passengers || 1)
  results = results.map(f => ({ ...f, totalPriceCOP: f.priceCOP * nPassengers }))

  return res.json(results)
}
