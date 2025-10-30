import React, { useState } from 'react'
import { Api } from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Register({ onLogin }){
  const [formData, setFormData] = useState({ email: '', password: '', name: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const update = (key, value) => setFormData(p => ({ ...p, [key]: value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const res = await Api.register(formData.email, formData.password, formData.name, 'CLIENTE')
      onLogin(res)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Error al registrar usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 480, margin: '40px auto' }}>
      <h3 style={{ marginTop: 0 }}>Crear cuenta</h3>
      <form onSubmit={submit} className="grid" style={{ gap: 16 }}>
        <div>
          <label className="label">Nombre completo</label>
          <input 
            className="input" 
            value={formData.name} 
            onChange={e => update('name', e.target.value)}
            placeholder="Juan Pérez"
            required
          />
        </div>
        <div>
          <label className="label">Correo electrónico</label>
          <input 
            className="input" 
            type="email"
            value={formData.email} 
            onChange={e => update('email', e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input 
            className="input" 
            type="password" 
            value={formData.password} 
            onChange={e => update('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>
        <div>
          <label className="label">Confirmar contraseña</label>
          <input 
            className="input" 
            type="password" 
            value={formData.confirmPassword} 
            onChange={e => update('confirmPassword', e.target.value)}
            placeholder="Repite la contraseña"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>
        {error && <div style={{ color: '#dc2626', fontSize: 14, padding: '12px', background: '#fee2e2', borderRadius: '8px' }}>{error}</div>}
        <button className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: 14, color: 'var(--text-light)' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Inicia sesión</Link>
        </div>
      </form>
    </div>
  )
}

