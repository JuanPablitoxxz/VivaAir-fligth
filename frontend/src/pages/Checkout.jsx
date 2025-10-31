import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useWindowSize } from '../hooks/useWindowSize.js'

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isMobile, isSmallMobile } = useWindowSize()
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

  const [loading, setLoading] = useState(false)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (!session || !flight) {
      navigate('/', { replace: true })
    }
  }, [session, flight, navigate])

  if (!session || !flight) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <p>Cargando...</p>
      </div>
    )
  }

  const handlePurchase = async () => {
    if (purchasing) return // Evitar múltiples clics
    
    setPurchasing(true)
    setLoading(true)
    
    try {
      // Crear reserva
      const ticketNumber = `VA-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      const { data: reservation, error: reservationError } = await supabase
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

      if (reservationError) throw reservationError

      // Crear pago (PSE simulado siempre se marca como completado en simulación)
      const paymentStatus = formData.paymentMethod === 'pse' ? 'pendiente' : 'completado'
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          reservation_id: reservation.id,
          amount: reservation.total_price,
          payment_method: formData.paymentMethod === 'pse' ? 'transferencia' : formData.paymentMethod,
          status: paymentStatus
        }])

      if (paymentError) {
        console.warn('Error creando pago:', paymentError)
        // Continuar aunque falle el pago
      }

      // Generar factura
      const invoiceNumber = `FAC-${Date.now()}`
      const { error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          reservation_id: reservation.id,
          invoice_number: invoiceNumber,
          total_amount: reservation.total_price
        }])

      if (invoiceError) {
        console.warn('Error creando factura:', invoiceError)
        // Continuar aunque falle la factura
      }

      // Mostrar mensaje y navegar
      alert(`¡Compra exitosa! Tu ticket es: ${ticketNumber}`)
      
      // Asegurar navegación
      setTimeout(() => {
        navigate('/profile', { replace: true })
      }, 100)
      
    } catch (err) {
      console.error('Error en compra:', err)
      alert('Error al procesar la compra: ' + (err.message || 'Error desconocido'))
      setPurchasing(false)
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ 
      maxWidth: '600px', 
      margin: isMobile ? '20px auto' : '40px auto',
      padding: isSmallMobile ? '16px' : '20px'
    }}>
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

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>
          <p>Procesando compra...</p>
        </div>
      )}

      <button 
        className="btn btn-primary" 
        onClick={handlePurchase}
        disabled={!formData.paymentMethod || purchasing || loading}
        style={{ width: '100%', marginTop: '16px' }}
      >
        {purchasing || loading ? 'Procesando...' : 'Confirmar y Pagar'}
      </button>
    </div>
  )
}

