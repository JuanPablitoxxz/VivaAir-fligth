import { getData } from '../_data'

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' })
  try{
    const { email, password } = req.body || {}
    const { users } = getData()
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) return res.status(401).json({ message: 'Credenciales inválidas' })
    const token = Buffer.from(`${user.id}:${user.role}`).toString('base64')
    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } })
  }catch(err){
    return res.status(500).json({ message: 'Error interno' })
  }
}
