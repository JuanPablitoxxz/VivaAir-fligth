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
  const [userCreated, setUserCreated] = useState(false)
  const [showPaymentMethods, setShowPaymentMethods] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar todos los vuelos al iniciar
  useEffect(() => {
    loadAllFlights()
  }, [])

  const loadAllFlights = async () => {
    setLoading(true)
    try {
      // Buscar todos los vuelos disponibles (sin filtros)
      const flights = await Api.searchFlights({})
      setResults(flights || [])
    } catch (err) {
      console.error('Error loading flights:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleFlightSelect = (flight) => {
    setSelectedFlight(flight)
    setShowPayment(true)
    setShowPaymentMethods(false)
    setUserCreated(false)
    setSearchedUser(null)
    setIsExistingCustomer(false)
    setCustomerInfo({ name: '', email: '', id_number: '', phone: '' })
    setSearchEmail('')
    setPaymentMethod('')
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
        // Si el cliente existe, buscar su información completa
        const { data: fullUser } = await supabase
          .from('users')
          .select('id, email, name, role')
          .eq('email', searchEmail.trim())
          .maybeSingle()
        
        setCustomerInfo({
          name: fullUser?.name || data.name,
          email: fullUser?.email || data.email,
          id_number: '', // El id_number no está en la tabla users, se puede llenar manualmente
          phone: '' // El teléfono tampoco está en users, se puede llenar manualmente
        })
        setUserCreated(true)
        setShowPaymentMethods(true)
        // Mostrar mensaje de éxito
        setTimeout(() => {
          alert(`✓ Cliente encontrado: ${data.name}`)
        }, 100)
      } else {
        setSearchedUser(null)
        setIsExistingCustomer(false)
        setCustomerInfo({
          name: '',
          email: searchEmail.trim(),
          id_number: '',
          phone: ''
        })
        setUserCreated(false)
        setShowPaymentMethods(false)
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
      setUserCreated(true)
      setShowPaymentMethods(true)
      
      // Mostrar mensaje de éxito
      alert(`✓ Usuario creado con éxito!\n\nCliente: ${newUser.name}\nEmail: ${newUser.email}\n\nContraseña temporal: ${tempPassword}\n\nEl cliente podrá cambiar su contraseña al iniciar sesión.`)
    } catch (err) {
      console.error('Error creating customer:', err)
      alert('Error al crear usuario: ' + err.message)
      setUserCreated(false)
      setShowPaymentMethods(false)
    }
  }

  const processPayment = async () => {
    try {
      if (!selectedFlight) {
        alert('Por favor selecciona un vuelo')
        return
      }

      // Asegurar que tenemos un usuario registrado
      if (!searchedUser) {
        alert('Por favor registra o verifica al cliente primero')
        return
      }

      // Validar que tenemos la información mínima del cliente
      if (!customerInfo.name || !customerInfo.email) {
        alert('Por favor completa nombre y correo del cliente')
        return
      }

      // El id_number es opcional si ya tenemos un usuario registrado buscado
      if (!isExistingCustomer && !customerInfo.id_number) {
        alert('Por favor completa el número de identificación del cliente')
        return
      }

      if (!paymentMethod) {
        alert('Por favor selecciona un método de pago')
        return
      }

      const user = searchedUser

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

      alert(`✅ Pago procesado exitosamente!\n\nTicket: ${reservation.ticket_number}\nCliente: ${customerInfo.name}\nMétodo: ${paymentMethod}\n\nEl ticket ha sido registrado en la cuenta del cliente y aparecerá en su perfil.`)
      
      // Resetear todo
      setShowPayment(false)
      setSelectedFlight(null)
      setResults([])
      setCustomerInfo({ name: '', email: '', id_number: '', phone: '' })
      setSearchEmail('')
      setSearchedUser(null)
      setIsExistingCustomer(false)
      setPaymentMethod('')
      setUserCreated(false)
      setShowPaymentMethods(false)
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

      <SearchBar 
        onResults={(flights) => {
          console.log('SearchBar results received:', flights)
          setResults(flights || [])
          if (flights && flights.length > 0) {
            // Scroll suave a los resultados
            setTimeout(() => {
              window.scrollTo({ top: 500, behavior: 'smooth' })
            }, 100)
          }
        }} 
        showResultsInline={true} 
      />

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>Cargando vuelos disponibles...</p>
        </div>
      ) : results.length > 0 ? (
        <section style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Vuelos Disponibles ({results.length})</h3>
            <button 
              className="btn-outline" 
              onClick={loadAllFlights}
              style={{ fontSize: '14px' }}
            >
              🔄 Mostrar todos
            </button>
          </div>
          <div className="results">
            {results.map(f => (
              <div key={f.id} style={{ marginBottom: '16px' }}>
                <FlightCard flight={f} variant="list" />
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '8px', width: '100%' }}
                  onClick={() => handleFlightSelect(f)}
                >
                  Seleccionar para cliente
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-light)' }}>No hay vuelos disponibles</p>
          <button 
            className="btn-outline" 
            onClick={loadAllFlights}
            style={{ marginTop: '16px' }}
          >
            Recargar vuelos
          </button>
        </div>
      )}

      {showPayment && selectedFlight && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Registrar Cliente y Procesar Pago</h2>
            
            {/* Información del Vuelo */}
            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-light)', borderRadius: '8px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '16px' }}>Vuelo Seleccionado</h3>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>
                <strong>{selectedFlight.from || selectedFlight.from_city} → {selectedFlight.to || selectedFlight.to_city}</strong>
              </p>
              <p style={{ margin: '4px 0', fontSize: '14px', color: 'var(--text-light)' }}>
                {selectedFlight.airline} · {new Date(selectedFlight.date).toLocaleDateString('es-CO')} · {selectedFlight.time}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 700, color: 'var(--primary-dark)' }}>
                Total: ${(selectedFlight.totalPriceCOP || selectedFlight.priceCOP).toLocaleString('es-CO')} COP
              </p>
            </div>

            {/* Paso 1: Búsqueda/Registro de Cliente */}
            {!userCreated && (
              <>
                {/* Búsqueda de Cliente */}
                <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-light)', borderRadius: '8px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>Paso 1: Buscar Cliente Existente</h3>
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
                </div>

                {/* Información del Cliente */}
                <div style={{ marginBottom: '24px' }}>
                  <h3>Paso 2: Información del Cliente {isExistingCustomer && searchedUser && <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 'normal' }}>(Existente)</span>}</h3>
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
                    required={!isExistingCustomer || !searchedUser}
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
                      className="btn btn-primary" 
                      onClick={createCustomer}
                      style={{ marginTop: '12px', width: '100%' }}
                      disabled={!customerInfo.name || !customerInfo.email || !customerInfo.id_number}
                    >
                      ➕ Crear Usuario Cliente
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Mensaje de usuario creado */}
            {userCreated && searchedUser && (
              <div style={{ marginBottom: '24px', padding: '16px', background: '#d1fae5', borderRadius: '8px', border: '2px solid #10b981' }}>
                <p style={{ margin: 0, fontWeight: 600, color: '#065f46' }}>
                  ✓ {isExistingCustomer ? 'Cliente verificado' : 'Usuario creado con éxito'}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#047857' }}>
                  {searchedUser.name} ({searchedUser.email})
                </p>
              </div>
            )}

            {/* Paso 3: Métodos de Pago - Solo mostrar después de crear/verificar usuario */}
            {showPaymentMethods && userCreated && searchedUser && (
              <div style={{ marginBottom: '24px' }}>
                <h3>Paso 3: Método de Pago</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '12px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '8px',
                  border: '1px solid var(--muted)',
                  borderRadius: '8px'
                }}>
                  <button
                    className={paymentMethod === 'tarjeta' ? 'btn' : 'btn-outline'}
                    onClick={() => setPaymentMethod('tarjeta')}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    💳 Tarjeta
                  </button>
                  <button
                    className={paymentMethod === 'efectivo' ? 'btn' : 'btn-outline'}
                    onClick={() => setPaymentMethod('efectivo')}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    className={paymentMethod === 'transferencia_qr' ? 'btn' : 'btn-outline'}
                    onClick={() => setPaymentMethod('transferencia_qr')}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    📱 QR
                  </button>
                  <button
                    className={paymentMethod === 'transferencia' ? 'btn' : 'btn-outline'}
                    onClick={() => setPaymentMethod('transferencia')}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    🔄 Transferencia
                  </button>
                </div>
              </div>
            )}

            {/* Botón de Procesar Pago - Solo mostrar después de seleccionar método de pago */}
            {showPaymentMethods && userCreated && searchedUser && (
              <button 
                className="btn btn-primary" 
                onClick={processPayment}
                disabled={!paymentMethod}
                style={{ width: '100%', marginTop: '16px' }}
              >
                {paymentMethod ? 'Procesar Pago y Generar Factura' : 'Selecciona un método de pago'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
