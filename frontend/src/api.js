import { supabase } from './lib/supabase'

// Helper para hashear passwords (simple para demo, usar bcrypt en producción)
async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export const Api = {
  async login(email, password) {
    const hashed = await hashPassword(password)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, name')
      .eq('email', email)
      .eq('password_hash', hashed)
      .single()
    
    if (error || !data) {
      throw new Error('Credenciales inválidas')
    }
    
    // Simular token (en producción usar JWT real)
    const token = Buffer.from(`${data.id}:${data.role}`).toString('base64')
    return { token, user: data }
  },

  async register(email, password, name, role = 'CLIENTE') {
    const hashed = await hashPassword(password)
    const { data, error } = await supabase
      .from('users')
      .insert([
        { email, password_hash: hashed, name, role }
      ])
      .select('id, email, role, name')
      .single()
    
    if (error) {
      throw new Error(error.message || 'Error al registrar usuario')
    }
    
    const token = Buffer.from(`${data.id}:${data.role}`).toString('base64')
    return { token, user: data }
  },

  async cities() {
    const { data, error } = await supabase
      .from('cities')
      .select('name')
      .order('name')
    
    if (error) throw error
    return data.map(c => c.name)
  },

  async searchFlights(params) {
    let query = supabase
      .from('flights')
      .select('*')
    
    if (params.from) {
      query = query.eq('from_city', params.from)
    }
    if (params.to) {
      query = query.eq('to_city', params.to)
    }
    if (params.date) {
      query = query.eq('date', params.date)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    const nPassengers = Number(params.passengers || 1)
    return data.map(f => ({
      id: f.id,
      airline: f.airline,
      from: f.from_city,
      to: f.to_city,
      date: f.date,
      time: f.time,
      durationMin: f.duration_min,
      priceCOP: f.price_cop,
      category: f.category,
      totalPriceCOP: f.price_cop * nPassengers
    }))
  },

  async dashboard() {
    const { data, error } = await supabase
      .from('flights')
      .select('*')
      .order('price_cop')
    
    if (error) throw error
    
    const groups = {
      economico: [],
      normal: [],
      preferencial: [],
      premium: []
    }
    
    data.forEach(f => {
      const flight = {
        id: f.id,
        airline: f.airline,
        from: f.from_city,
        to: f.to_city,
        date: f.date,
        time: f.time,
        durationMin: f.duration_min,
        priceCOP: f.price_cop,
        category: f.category
      }
      
      if (groups[f.category]) {
        groups[f.category].push(flight)
      }
    })
    
    // Top 10 por categoría
    Object.keys(groups).forEach(k => {
      groups[k] = groups[k].slice(0, 10)
    })
    
    return groups
  },

  async adminSummary() {
    const [usersRes, flightsRes, citiesRes] = await Promise.all([
      supabase.from('users').select('id, email, role, name'),
      supabase.from('flights').select('id', { count: 'exact', head: true }),
      supabase.from('cities').select('id', { count: 'exact', head: true })
    ])
    
    return {
      users: usersRes.data || [],
      flightsCount: flightsRes.count || 0,
      citiesCount: citiesRes.count || 0
    }
  }
}
