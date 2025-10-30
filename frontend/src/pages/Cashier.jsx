import React, { useState, useEffect } from 'react'
import { Api } from '../api'
import { supabase } from '../lib/supabase'
import SearchBar from '../components/SearchBar.jsx'
import FlightCard from '../components/FlightCard.jsx'

export default function Cashier(){
  const [results, setResults] = useState([])
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', id_number: '', phone: '' })
  const [isExistingCustomer, setIsExistingCustomer] = useState(false)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchedUser, setSearchedUser] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [showPayment, setShowPayment] = useState(false)

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight)
    setShowPayment(true)
  }

  const searchCustomer = async () => {
    if (!searchEmail.trim()) {
      alert('Por favor ingresa un correo electrónico para buscar')
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('email', searchEmail.trim())
        .maybeSingle()

      if (error) throw error

      if (data) {
        setSearchedUser(data)
        setIsExistingCustomer(true)
        setCustomerInfo({
          name: data.name,
          email: data.email,
          id_number: '',
          phone: ''
        })
        alert(`Cliente encontrado: ${data.name}`)
      } else {
        setSearchedUser(null)
        setIsExistingCustomer(false)
        setCustomerInfo({
          name: '',
          email: searchEmail.trim(),
          id_number: '',
          phone: ''
        })
        alert('Cliente no encontrado. Puedes crear uno nuevo con los datos del formulario.')
      }
    } catch (err) {
      console.error('Error searching customer:', err)
      alert('Error al buscar cliente: ' + err.message)
    }
  }

  const createCustomer = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.id_number) {
      alert('Por favor completa todos los campos requeridos')
      return
    }

    try {
      // Verificar si el email ya existe
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', customerInfo.email)
        .maybeSingle()

      if (existing) {
        alert('Este correo electrónico ya está registrado. Usa la búsqueda para encontrar al cliente.')
        return
      }

      // Generar una contraseña temporal (el cliente puede cambiarla después)
      const tempPassword = Math.random().toString(36).slice(-8)
      const encoder = new TextEncoder()
      const hash = await crypto.subtle.digest('SHA-256', encoder.encode(tempPassword))
      const hashed = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{
          email: customerInfo.email,
          password_hash: hashed,
          name: customerInfo.name,
          role: 'CLIENTE'
        }])
        .select()
        .single()

      if (error) throw error

      setSearchedUser(newUser)
      setIsExistingCustomer(true)
      alert(`Usuario creado exitosamente. Contraseña temporal: ${tempPassword}\n\nEl cliente podrá cambiar su contraseña al iniciar sesión.`)
    } catch (err) {
      console.error('Error creating customer:', err)
      alert('Error al crear usuario: ' + err.message)
    }
  }

  const processPayment = async () => {
    try {
      if (!selectedFlight) {
        alert('Por favor selecciona un vuelo')
        return
      }

      if (!customerInfo.name || !customerInfo.email || !customerInfo.id_number) {
        alert('Por favor completa todos los campos del cliente')
        return
      }

      if (!paymentMethod) {
        alert('Por favor selecciona un método de pago')
        return
      }

      let user = searchedUser

      // Si no hay usuario buscado, buscar o crear
      if (!user) {
        const { data: foundUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', customerInfo.email)
          .maybeSingle()

        if (!foundUser) {
          // Crear usuario cliente
          const tempPassword = Math.random().toString(36).slice(-8)
          const encoder = new TextEncoder()
          const hash = await crypto.subtle.digest('SHA-256', encoder.encode(tempPassword))
          const hashed = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
          
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert([{
              email: customerInfo.email,
              password_hash: hashed,
              name: customerInfo.name,
              role: 'CLIENTE'
            }])
            .select()
            .single()

          if (createError) throw createError
          user = newUser
        } else {
          user = foundUser
        }
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
          ticket_number: `VA-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
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

      alert(`✅ Pago procesado exitosamente!\n\nTicket: ${reservation.ticket_number}\nCliente: ${customerInfo.name}\n\nEl ticket ha sido registrado en la cuenta del cliente.`)
      setShowPayment(false)
      setSelectedFlight(null)
      setResults([])
      setCustomerInfo({ name: '', email: '', id_number: '', phone: '' })
      setSearchEmail('')
      setSearchedUser(null)
      setIsExistingCustomer(false)
      setPaymentMethod('')
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Procesar Pago</h2>
            
            {/* Búsqueda de Cliente */}
            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-light)', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>Buscar Cliente Existente</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  className="input"
                  type="email"
                  placeholder="Buscar por correo electrónico"
                  value={searchEmail}
                  onChange={e => setSearchEmail(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button className="btn-outline" onClick={searchCustomer}>
                  🔍 Buscar
                </button>
              </div>
              {searchedUser && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '4px', border: '2px solid var(--primary)' }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>✓ Cliente encontrado: {searchedUser.name}</p>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-light)' }}>{searchedUser.email}</p>
                </div>
              )}
            </div>

            {/* Información del Cliente */}
            <div style={{ marginBottom: '24px' }}>
              <h3>Información del Cliente {isExistingCustomer && <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'normal' }}>(Existente)</span>}</h3>
              <input 
                className="input" 
                placeholder="Nombre completo *"
                value={customerInfo.name}
                onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                disabled={isExistingCustomer && searchedUser}
                required
              />
              <input
                className="input" 
                type="email"
                placeholder="Correo electrónico *"
                style={{ marginTop: '12px' }}
                value={customerInfo.email}
                onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                disabled={isExistingCustomer && searchedUser}
                required
              />
              <input 
                className="input" 
                placeholder="Número de identificación *"
                style={{ marginTop: '12px' }}
                value={customerInfo.id_number}
                onChange={e => setCustomerInfo({ ...customerInfo, id_number: e.target.value })}
                required
              />
              <input 
                className="input" 
                placeholder="Teléfono (opcional)"
                style={{ marginTop: '12px' }}
                value={customerInfo.phone}
                onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              />
              
              {!isExistingCustomer && !searchedUser && (
                <button 
                  className="btn-outline" 
                  onClick={createCustomer}
                  style={{ marginTop: '12px', width: '100%' }}
                  disabled={!customerInfo.name || !customerInfo.email || !customerInfo.id_number}
                >
                  ➕ Crear Nuevo Usuario
                </button>
              )}
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
