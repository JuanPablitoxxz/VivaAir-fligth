import React, { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Admin from './pages/Admin.jsx'
import Cashier from './pages/Cashier.jsx'

const brand = {
  primary: '#3da9fc', // azul claro
  primaryDark: '#2a7fca',
  bg: '#ffffff',
  text: '#0f172a'
}

function useAuth() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('vivaair.session')
    return raw ? JSON.parse(raw) : null
  })

  const login = (payload) => {
    localStorage.setItem('vivaair.session', JSON.stringify(payload))
    setSession(payload)
  }

  const logout = () => {
    localStorage.removeItem('vivaair.session')
    setSession(null)
  }

  return { session, login, logout }
}

export default function App() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // simple guard for role routes
    // handled per route render below
  }, [auth.session])

  const role = auth.session?.user?.role

  const navItems = useMemo(() => (
    [
      { to: '/', label: 'Inicio' },
      { to: '/login', label: role ? `Sesión (${role})` : 'Iniciar sesión' },
      ...(role === 'ADM' ? [{ to: '/admin', label: 'Admin' }] : []),
      ...(role === 'CAJERO' ? [{ to: '/caja', label: 'Cajero' }] : [])
    ]
  ), [role])

  return (
    <div className="app-container" style={{ background: brand.bg, color: brand.text }}>
      <header className="header">
        <div className="brand">
          <Link to="/" className="brand-link">VivaAir</Link>
        </div>
        <nav className="nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
          {role && (
            <button className="btn-outline" onClick={() => { auth.logout(); navigate('/'); }}>Salir</button>
          )}
        </nav>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login onLogin={auth.login} />} />
          <Route path="/register" element={<Register onLogin={auth.login} />} />
          <Route path="/admin" element={role === 'ADM' ? <Admin /> : <Dashboard />} />
          <Route path="/caja" element={role === 'CAJERO' ? <Cashier /> : <Dashboard />} />
        </Routes>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} VivaAir (demo)
      </footer>
    </div>
  )
}
