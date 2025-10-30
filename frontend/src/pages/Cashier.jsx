import React, { useState, useEffect } from 'react'
import { Api } from '../api'
import { supabase } from '../lib/supabase'
import SearchBar from '../components/SearchBar.jsx'
import FlightCard from '../components/FlightCard.jsx'

export default function Cashier(){
  const [results, setResults] = useState([])
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', id_number: '' })
  const [paymentMethod, setPaymentMethod] = useState('')
  const [showPayment, setShowPayment] = useState(false)

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight)
    setShowPayment(true)
  }

  const processPayment = async () => {
    try {
      // Buscar o crear usuario cliente
      let { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerInfo.email)
        .maybeSingle()

      if (!user) {
        // Crear usuario cliente temporal
        const encoder = new TextEncoder()
        const hash = await crypto.subtle.digest('SHA-256', encoder.encode('temp123'))
        const hashed = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
        
        const { data: newUser } = await supabase
          .from('users')
          .insert([{
            email: customerInfo.email,
            password_hash: hashed,
            name: customerInfo.name,
            role: 'CLIENTE'
          }])
          .select()
          .single()
        user = newUser
      }

      // Crear reserva
      const { data: reservation } = await supabase
        .from('reservations')
        .insert([{
          user_id: user.id,
          flight_id: selectedFlight.id,
          passengers: 1,
          total_price: selectedFlight.totalPriceCOP || selectedFlight.priceCOP,
          status: 'confirmada',
          ticket_number: `VA-${Date.now()}-${Math.random().toString(36).substr(2焦点, 8).toUpperCase()}`
        }])
        .select()
        .single()

      // Crear pago
      await supabase
        .from('payments')
        .insert([{
          reservation_id: reservation.id,
          amount: reservation.total_price,
          payment_method: paymentMethod,
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

      alert(`Pago procesado. Ticket: ${reservation.ticket_number}`)
      setShowPayment(false)
      setSelectedFlight(null)
      setResults([])
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <div>
      <div className="card" style={{ marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0 }}>Cajero / Check-in</h2>
        <p>Busca vuelos y realiza la compra para el cliente.</p>
      </div>

      <SearchBar onResults={setResults} />

      {results.length > 0 && (
        <section style={{ marginTop: '24px' }}>
          <h3>Vuelos Disponibles</h3>
          <div className="results">
            {results.map(f => (
              <div key={f.id}>
                <FlightCard flight={f} variant="list" />
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '8px' }}
                  onClick={() => handleFlightSelect(f)}
                >
                  Seleccionar para cliente
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {showPayment && selectedFlight && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Procesar Pago</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <h3>Información del Cliente</h3>
              <input 
                className="input" 
                placeholder="Nombre completo"
                value={customerInfo.name}
                onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              />
              <input
                className="input" 
                type="email"
                placeholder="Correo electrónico"
                style={{ marginTop: '12px' }}
                value={customerInfo.email}
                onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              />
              <input 
                className="input" 
                placeholder="Número de identificación"
                style={{ marginTop: '12px' }}
                value={customerInfo.id_number}
                onChange={e => setCustomerInfo({ ...customerInfo, id_number: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3>Método de Pago</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <button
                  className={paymentMethod === 'tarjeta' ? 'btn' : 'btn-outline'}
                  onClick={() => setPaymentMethod('tarjeta')}
                >
                  💳 Tarjeta
                </button>
                <button
                  className={paymentMethod === 'efectivo' ? 'btn' : 'btn-outline'}
                  onClick={() => setPaymentMethod('efectivo')}
                >
                  💵 Efectivo
                </button>
                <button
                  className={paymentMethod === 'transferencia_qr' ? 'btn' : 'btn-outline'}
                  onClick={() => setPaymentMethod('transferencia_qr')}
                >
                  📱 QR
                </button>
                <button
                  className={paymentMethod === 'transferencia' ? 'btn' : 'btn-outline'}
                  onClick={() => setPaymentMethod('transferencia')}
                >
                  🔄 Transferencia
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-light)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Total a pagar:</span>
                <strong>${(selectedFlight.totalPriceCOP || selectedFlight.priceCOP).toLocaleString('es-CO')} COP</strong>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={processPayment}
              disabled={!customerInfo.name || !customerInfo.email || !paymentMethod}
              style={{ width: '100%' }}
            >
              Procesar Pago y Generar Factura
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
