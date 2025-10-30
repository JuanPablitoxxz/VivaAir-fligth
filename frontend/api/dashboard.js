import { getData } from './_data'

export default async function handler(_req, res){
  const { flights } = getData()
  const groups = { economico: [], normal: [], preferencial: [], premium: [] }
  for (const f of flights) groups[f.category].push(f)
  Object.keys(groups).forEach(k => {
    groups[k] = groups[k].slice().sort((a, b) => a.priceCOP - b.priceCOP).slice(0, 10)
  })
  return res.json(groups)
}
