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
    console.log('=== INICIO BÚSQUEDA DE VUELOS ===')
    console.log('Parámetros recibidos:', JSON.stringify(params, null, 2))
    
    let query = supabase
      .from('flights')
      .select('*')
    
    // Filtrar por origen
    if (params.from && params.from.trim() !== '') {
      query = query.eq('from_city', params.from.trim())
      console.log('✓ Filtro ORIGEN aplicado:', params.from.trim())
    } else {
      console.log('✗ Sin filtro de origen')
    }
    
    // Filtrar por destino
    if (params.to && params.to.trim() !== '') {
      query = query.eq('to_city', params.to.trim())
      console.log('✓ Filtro DESTINO aplicado:', params.to.trim())
    } else {
      console.log('✗ Sin filtro de destino')
    }
    
    // Manejar fecha: verificar si hay fecha válida
    const today = new Date().toISOString().split('T')[0]
    const hasDate = params.date && 
                    typeof params.date === 'string' && 
                    params.date.trim() !== '' &&
                    params.date !== 'undefined' &&
                    params.date !== 'null'
    
    if (hasDate) {
      // Si se especifica una fecha, filtrar por esa fecha específica
      const searchDate = params.date.trim()
      query = query.eq('date', searchDate)
      console.log('✓ Filtro FECHA ESPECÍFICA aplicado:', searchDate)
      console.log('  - Tipo:', typeof searchDate)
      console.log('  - Longitud:', searchDate.length)
    } else {
      // Si no hay fecha, mostrar solo vuelos futuros
      query = query.gte('date', today)
      console.log('✓ Filtro FECHA FUTURA aplicado (>=):', today)
    }
    
    // Filtrar por categoría si se especifica
    if (params.category && params.category.trim() !== '') {
      query = query.eq('category', params.category.trim())
      console.log('✓ Filtro CATEGORÍA aplicado:', params.category.trim())
    }
    
    console.log('Ejecutando consulta a Supabase...')
    const { data, error } = await query
    
    if (error) {
      console.error('❌ ERROR en consulta Supabase:', error)
      throw error
    }
    
    console.log(`✓ Consulta exitosa. Vuelos encontrados: ${data?.length || 0}`)
    if (data && data.length > 0) {
      console.log('Muestra de vuelos encontrados:')
      data.slice(0, 3).forEach((f, idx) => {
        console.log(`  ${idx + 1}. ${f.from_city} → ${f.to_city}, Fecha: ${f.date}, Aerolínea: ${f.airline}`)
      })
    }
    
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
    
    console.log(`=== FIN BÚSQUEDA: ${mapped.length} vuelos mapeados ===\n`)
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
