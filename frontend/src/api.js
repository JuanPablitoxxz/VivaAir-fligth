import { supabase } from './lib/supabase'

// Helper para hashear passwords (SHA-256 para coincidir con PostgreSQL)
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
    try {
      const hashed = await hashPassword(password)
      console.log('Login attempt:', { email, hashLength: hashed.length, hashStart: hashed.substring(0, 10) })
      
      // Primero buscar el usuario por email
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, name, password_hash')
        .eq('email', email)
        .maybeSingle()
      
      if (error) {
        console.error('Supabase error:', error)
        throw new Error('Error al buscar usuario: ' + (error.message || 'Usuario no encontrado'))
      }
      
      if (!data) {
        console.error('Usuario no encontrado:', email)
        throw new Error('Usuario no encontrado')
      }
      
      console.log('User found:', { email: data.email, storedHashStart: data.password_hash?.substring(0, 10) })
      
      // Comparar hashes
      if (!data.password_hash || data.password_hash !== hashed) {
        console.error('Password hash mismatch', {
          stored: data.password_hash?.substring(0, 20),
          received: hashed.substring(0, 20),
          match: data.password_hash === hashed
        })
        throw new Error('Contraseña incorrecta')
      }
      
      console.log('Login successful!')
      
      // Generar token
      const token = btoa(`${data.id}:${data.role}`)
      return { 
        token, 
        user: { 
          id: data.id, 
          email: data.email, 
          role: data.role, 
          name: data.name 
        } 
      }
    } catch (err) {
      console.error('Login error:', err)
      throw err
    }
  },

  async register(email, password, name, role = 'CLIENTE') {
    try {
      const hashed = await hashPassword(password)
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          { email, password_hash: hashed, name, role }
        ])
        .select('id, email, role, name')
        .single()
      
      if (error) {
        console.error('Register error:', error)
        if (error.code === '23505') {
          throw new Error('Este correo ya está registrado')
        }
        throw new Error(error.message || 'Error al registrar usuario')
      }
      
      if (!data) {
        throw new Error('Error al crear usuario')
      }
      
      const token = btoa(`${data.id}:${data.role}`)
      return { token, user: data }
    } catch (err) {
      console.error('Register error:', err)
      throw err
    }
  },

  async cities() {
    const { data, error } = await supabase
      .from('cities')
      .select('name')
      .order('name')
    
    if (error) throw error
    return data.map(c => c.name)
  },

  async searchFlights(params = {}) {
    console.log('Api.searchFlights called with params:', params)
    let query = supabase
      .from('flights')
      .select('*')
    
    if (params.from) {
      query = query.eq('from_city', params.from)
      console.log('Filtering by from_city:', params.from)
    }
    if (params.to) {
      query = query.eq('to_city', params.to)
      console.log('Filtering by to_city:', params.to)
    }
    
    // Manejar fecha: si se especifica una fecha, filtrar por esa fecha específica
    // Si no se especifica fecha, mostrar todos los vuelos futuros
    const today = new Date().toISOString().split('T')[0]
    if (params.date && params.date.trim() !== '') {
      // Filtrar por fecha específica solo si es futura o hoy
      if (params.date >= today) {
        query = query.eq('date', params.date)
        console.log('Filtering by specific date:', params.date)
      } else {
        // Si la fecha es pasada, no mostrar resultados
        console.log('Date is in the past, returning empty results')
        return []
      }
    } else {
      // Sin fecha específica: mostrar todos los vuelos futuros (>= hoy)
      query = query.gte('date', today)
      console.log('No date specified, filtering by date >=', today)
    }
    
    if (params.category) {
      query = query.eq('category', params.category)
      console.log('Filtering by category:', params.category)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Supabase query error:', error)
      throw error
    }
    
    console.log('Raw flight data received:', data?.length || 0, 'flights')
    
    const nPassengers = Number(params.passengers || 1)
    const mapped = (data || []).map(f => ({
      id: f.id,
      airline: f.airline,
      airline_id: f.airline_id,
      from: f.from_city,
      from_city: f.from_city,
      to: f.to_city,
      to_city: f.to_city,
      date: f.date,
      time: f.time,
      durationMin: f.duration_min,
      duration_min: f.duration_min,
      priceCOP: f.price_cop,
      price_cop: f.price_cop,
      category: f.category,
      available_seats: f.available_seats,
      totalPriceCOP: f.price_cop * nPassengers,
      total_price_cop: f.price_cop * nPassengers
    }))
    
    console.log('Mapped flights:', mapped.length)
    return mapped
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
