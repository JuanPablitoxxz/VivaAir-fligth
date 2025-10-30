import React, { useState } from 'react'
import { Api } from '../api'
import { useNavigate, Link } from 'react-router-dom'

export default function Login({ onLogin }){
  const [email, setEmail] = useState('cliente@vivaair.co')
  const [password, setPassword] = useState('cliente123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await Api.login(email, password)
      onLogin(res)
      navigate('/')
    } catch (err) {
      console.error('Login error details:', err)
      setError(err.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '0 auto' }}>
      <h3 style={{ marginTop: 0 }}>Iniciar sesión</h3>
      <form onSubmit={submit} className="grid" style={{ gap: 10 }}>
        <div>
          <div className="label">Correo</div>
          <input 
            className="input" 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="correo@dominio.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <div className="label">Contraseña</div>
          <input 
            className="input" 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="••••••"
            autoComplete="current-password"
            required
          />
        </div>
        {error && <div style={{ color: '#dc2626', fontSize: 14 }}>{error}</div>}
        <button className="btn" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: 14, color: 'var(--text-light)' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Regístrate</Link>
        </div>
      </form>
    </div>
  )
}
