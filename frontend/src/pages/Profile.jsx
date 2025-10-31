import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { downloadTicketPDF } from '../utils/ticketGenerator.js'

export default function Profile() {
  const [session, setSession] = useState(JSON.parse(localStorage.getItem('vivaair.session') || 'null'))
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    if (session?.user?.id) {
      loadReservations()
    }
  }, [session])

  const loadReservations = async () => {
    const { data } = await supabase
      .from('reservations')
      .select(`
        *,
        flights:flight_id (
          id,
          airline,
          from_city,
          to_city,
          date,
          time,
          duration_min
        ),
        invoices:invoice_id (
          invoice_number,
          pdf_url
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    
    setReservations(data || [])
  }

  const downloadTicket = (reservation) => {
    if (reservation.flights) {
      downloadTicketPDF(reservation, reservation.flights, session.user)
    } else {
      alert('Error: No se pudo cargar la información del vuelo')
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0 }}>Mi Perfil</h2>
        <p><strong>Nombre:</strong> {session?.user?.name}</p>
        <p><strong>Email:</strong> {session?.user?.email}</p>
        <p><strong>Rol:</strong> {session?.user?.role}</p>
      </div>

      <div className="card">
        <h3>Mis Vuelos Comprados</h3>
        {reservations.length === 0 ? (
          <p>No has comprado vuelos aún.</p>
        ) : (
          <div className="results">
            {reservations.map(res => (
              <div key={res.id} className="card">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px' }}>
                  <div>
                    <h4>{res.flights?.from_city} → {res.flights?.to_city}</h4>
                    <p>Aerolínea: {res.flights?.airline}</p>
                    <p>Fecha: {res.flights?.date} · Hora: {res.flights?.time}</p>
                    <p>Pasajeros: {res.passengers}</p>
                    <p>Ticket: <strong>{res.ticket_number}</strong></p>
                    <span className="tag">{res.status}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p><strong>${res.total_price.toLocaleString('es-CO')} COP</strong></p>
                    <button 
                      className="btn-outline" 
                      onClick={() => downloadTicket(res)}
                      style={{ marginTop: '8px' }}
                    >
                      📥 Descargar Ticket
                    </button>
                    {res.invoices && (
                      <button className="btn-outline" style={{ marginTop: '8px' }}>
                        📄 Ver Factura
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

