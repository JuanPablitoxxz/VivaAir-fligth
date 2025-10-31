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

      // Crear pago (PSE simulado siempre se marca como completado en simulación)
      const paymentStatus = formData.paymentMethod === 'pse' ? 'pendiente' : 'completado'
      await supabase
        .from('payments')
        .insert([{
          reservation_id: reservation.id,
          amount: reservation.total_price,
          payment_method: formData.paymentMethod === 'pse' ? 'transferencia' : formData.paymentMethod,
          status: paymentStatus
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
          <option value="pse">PSE - Pago Seguro en Línea</option>
        </select>
      </div>

      {formData.paymentMethod === 'tarjeta' && (
        <div style={{ marginBottom: '24px' }}>
          <input 
            className="input" 
            placeholder="Número de tarjeta" 
            style={{ marginBottom: '12px' }}
            value={formData.cardNumber}
            onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
            maxLength={19}
          />
          <input 
            className="input" 
            placeholder="Nombre en tarjeta" 
            style={{ marginBottom: '12px' }}
            value={formData.cardName}
            onChange={e => setFormData({ ...formData, cardName: e.target.value })}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <input 
              className="input" 
              placeholder="MM/AA" 
              value={formData.expiryDate}
              onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
              maxLength={5}
            />
            <input 
              className="input" 
              placeholder="CVV" 
              type="password"
              value={formData.cvv}
              onChange={e => setFormData({ ...formData, cvv: e.target.value })}
              maxLength={4}
            />
          </div>
        </div>
      )}

      {formData.paymentMethod === 'pse' && (
        <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-light)', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-light)', margin: '0 0 12px 0' }}>
            PSE - Pago Seguro en Línea
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>
            Al confirmar la compra, serás redirigido al sistema PSE para completar el pago de forma segura.
            Esta es una simulación. En producción, se integraría con el sistema PSE real.
          </p>
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

