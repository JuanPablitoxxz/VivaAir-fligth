import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('vivaair.session')
    return raw ? JSON.parse(raw) : null
  })
  const flight = location.state?.flight
  const [formData, setFormData] = useState({
    paymentMethod: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })

  useEffect(() => {
    if (!session || !flight) {
      navigate('/')
    }
  }, [session, flight, navigate])

  if (!session || !flight) return null

  const handlePurchase = async () => {
    try {
      // Crear reserva
      const ticketNumber = `VA-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      const { data: reservation } = await supabase
        .from('reservations')
        .insert([{
          user_id: session.user.id,
          flight_id: flight.id,
          passengers: 1,
          total_price: flight.totalPriceCOP || flight.priceCOP,
          status: 'confirmada',
          ticket_number: ticketNumber
        }])
        .select()
        .single()

      // Crear pago
      await supabase
        .from('payments')
        .insert([{
          reservation_id: reservation.id,
          amount: reservation.total_price,
          payment_method: formData.paymentMethod,
          status: 'completado'
        }])

      // Generar factura
      const invoiceNumber = `FAC-${Date.now()}`
      await supabase
        .from('invoices')
        .insert([{
          reservation_id: reservation.id,
          invoice_number: invoiceNumber,
          total_amount: reservation.total_price
        }])

      alert(`¡Compra exitosa! Tu ticket es: ${ticketNumber}`)
      navigate('/profile')
    } catch (err) {
      alert('Error al procesar la compra: ' + err.message)
    }
  }

  return (
    <div className="card" style={{ maxWidth: '600px', margin: '40px auto' }}>
      <h2 style={{ marginTop: 0 }}>Confirmar Compra</h2>
      
      <div className="card" style={{ marginBottom: '24px', background: 'var(--bg-light)' }}>
        <h4>{flight.from} → {flight.to}</h4>
        <p>Aerolínea: {flight.airline}</p>
        <p>Fecha: {flight.date} · Hora: {flight.time}</p>
        <p><strong>Total: ${(flight.totalPriceCOP || flight.priceCOP).toLocaleString('es-CO')} COP</strong></p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label className="label">Método de Pago</label>
        <select 
          className="input"
          value={formData.paymentMethod}
          onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
        >
          <option value="">Selecciona método</option>
          <option value="tarjeta">Tarjeta de Crédito/Débito</option>
          <option value="transferencia">Transferencia Bancaria</option>
        </select>
      </div>

      {formData.paymentMethod === 'tarjeta' && (
        <div style={{ marginBottom: '24px' }}>
          <input className="input" placeholder="Número de tarjeta" style={{ marginBottom: '12px' }} />
          <input className="input" placeholder="Nombre en tarjeta" style={{ marginBottom: '12px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input className="input" placeholder="MM/AA" />
            <input className="input" placeholder="CVV" />
          </div>
        </div>
      )}

      <button 
        className="btn btn-primary" 
        onClick={handlePurchase}
        disabled={!formData.paymentMethod}
        style={{ width: '100%' }}
      >
        Confirmar y Pagar
      </button>
    </div>
  )
}

