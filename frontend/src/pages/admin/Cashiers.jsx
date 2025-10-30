import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Cashiers() {
  const [cashiers, setCashiers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({ email: '', password: '', name: '' })

  useEffect(() => {
    loadCashiers()
  }, [])

  const loadCashiers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'CAJERO')
        .order('name')
      if (error) {
        console.error('Error loading cashiers:', error)
        setCashiers([])
      } else {
        setCashiers(data || [])
      }
    } catch (err) {
      console.error('Error loading cashiers:', err)
      setCashiers([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Importar función de hash
      const encoder = new TextEncoder()
      const hashData = encoder.encode(formData.password)
      const hash = await crypto.subtle.digest('SHA-256', hashData)
      const hashed = Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      if (editing) {
        const { error } = await supabase
          .from('users')
          .update({ email: formData.email, name: formData.name, password_hash: hashed })
          .eq('id', editing.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('users')
          .insert([{ email: formData.email, password_hash: hashed, name: formData.name, role: 'CAJERO' }])
        if (error) throw error
      }

      setFormData({ email: '', password: '', name: '' })
      setShowForm(false)
      setEditing(null)
      loadCashiers()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este cajero?')) return
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (!error) loadCashiers()
  }

  const handleEdit = (cashier) => {
    setEditing(cashier)
    setFormData({ email: cashier.email, password: '', name: cashier.name })
    setShowForm(true)
  }

  return (
    <div className="grid">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0 }}>Gestión de Cajeros</h2>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); setFormData({ email: '', password: '', name: '' }) }}>
            + Nuevo Cajero
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '24px', background: 'var(--bg-light)' }}>
            <h3>{editing ? 'Editar Cajero' : 'Nuevo Cajero'}</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label className="label">Nombre</label>
                <input 
                  className="input"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Correo</label>
                <input 
                  className="input"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Contraseña {editing && '(dejar vacío para no cambiar)'}</label>
                <input 
                  className="input"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required={!editing}
                  minLength={6}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-primary" type="submit">{editing ? 'Actualizar' : 'Crear'}</button>
                <button className="btn-outline" type="button" onClick={() => { setShowForm(false); setEditing(null) }}>Cancelar</button>
              </div>
            </div>
          </form>
        )}

        <div className="results">
          {cashiers.map(cashier => (
            <div key={cashier.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4>{cashier.name}</h4>
                  <p>{cashier.email}</p>
                  <span className="tag">CAJERO</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-outline" onClick={() => handleEdit(cashier)}>Editar</button>
                  <button className="btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={() => handleDelete(cashier.id)}>Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

