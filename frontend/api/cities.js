import { getData } from './_data'

export default async function handler(_req, res){
  const { colombianCities } = getData()
  return res.json(colombianCities)
}
