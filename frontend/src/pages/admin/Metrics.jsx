import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Metrics() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFlights: 0,
    totalReservations: 0,
    activeAirlines: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    try {
      const [usersRes, flightsRes, reservationsRes, airlinesRes, revenueRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('flights').select('id', { count: 'exact', head: true }),
        supabase.from('reservations').select('id', { count: 'exact', head: true }),
        supabase.from('airlines').select('id').eq('status', 'activa').catch(() => ({ data: [] })),
        supabase.from('payments').select('amount').eq('status', 'completado').catch(() => ({ data: [] }))
      ])

      const revenue = revenueRes.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      setStats({
        totalUsers: usersRes.count || 0,
        totalFlights: flightsRes.count || 0,
        totalReservations: reservationsRes.count || 0,
        activeAirlines: airlinesRes.data?.length || 0,
        totalRevenue: revenue
      })
    } catch (err) {
      console.error('Error loading metrics:', err)
      // Si hay error, mostrar 0s pero seguir mostrando la página
    }
  }

  return (
    <div className="grid grid-3" style={{ gap: '20px' }}>
      <div className="card">
        <h3>Usuarios Totales</h3>
        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalUsers}</div>
      </div>
      <div className="card">
        <h3>Vuelos Disponibles</h3>
        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalFlights}</div>
      </div>
      <div className="card">
        <h3>Reservas Totales</h3>
        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalReservations}</div>
      </div>
      <div className="card">
        <h3>Aerolíneas Activas</h3>
        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>{stats.activeAirlines}</div>
      </div>
      <div className="card">
        <h3>Ingresos Totales</h3>
        <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary)' }}>
          ${stats.totalRevenue.toLocaleString('es-CO')} COP
        </div>
      </div>
    </div>
  )
}

