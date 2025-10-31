import React, { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Route, Routes, useNavigate, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Admin from './pages/Admin.jsx'
import Cashier from './pages/Cashier.jsx'
import Profile from './pages/Profile.jsx'
import Checkout from './pages/Checkout.jsx'
import FlightResults from './pages/FlightResults.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

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

  // Verificar y redirigir según rol al cargar la app
  useEffect(() => {
    const checkRoleAndRedirect = () => {
      try {
        const rawSession = localStorage.getItem('vivaair.session')
        if (rawSession) {
          const session = JSON.parse(rawSession)
          const role = session?.user?.role
          const currentPath = window.location.pathname
          
          // Si es CAJERO y está en dashboard o admin, redirigir
          if (role === 'CAJERO' && (currentPath === '/' || currentPath === '/admin')) {
            window.location.replace('/caja')
            return
          }
          
          // Si es ADM y está en dashboard o caja, redirigir
          if (role === 'ADM' && (currentPath === '/' || currentPath === '/caja')) {
            window.location.replace('/admin')
            return
          }
          
          // Si es CLIENTE y está en caja o admin, redirigir
          if (role === 'CLIENTE' && (currentPath === '/caja' || currentPath === '/admin')) {
            window.location.replace('/')
            return
          }
        }
      } catch (e) {
        console.error('Error checking role:', e)
      }
    }
    
    // Ejecutar inmediatamente
    checkRoleAndRedirect()
    
    // También verificar después de un delay para móviles
    const timeout = setTimeout(checkRoleAndRedirect, 200)
    
    return () => clearTimeout(timeout)
  }, [auth.session])

  const role = auth.session?.user?.role

  const navItems = useMemo(() => {
    const items = []
    // Solo mostrar "Inicio" para clientes o usuarios no autenticados
    if (!role || role === 'CLIENTE') {
      items.push({ to: '/', label: 'Inicio' })
    }
    items.push({ to: '/login', label: auth.session?.user ? `${auth.session.user.name} (${role})` : 'Iniciar sesión' })
    if (role === 'CLIENTE') {
      items.push({ to: '/profile', label: 'Mi Perfil' })
    }
    if (role === 'ADM') {
      items.push({ to: '/admin', label: 'Admin' })
    }
    if (role === 'CAJERO') {
      items.push({ to: '/caja', label: 'Cajero' })
    }
    return items
  }, [role, auth.session])

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
              style={auth.session?.user && item.to === '/login' ? { 
                background: 'var(--primary-light)', 
                color: 'var(--primary-dark)',
                fontWeight: 600,
                cursor: 'default',
                pointerEvents: 'none'
              } : {}}
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
          <Route path="/results" element={<FlightResults />} />
          <Route path="/login" element={<Login onLogin={auth.login} />} />
          <Route path="/register" element={<Register onLogin={auth.login} />} />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requiredRole="CLIENTE" currentRole={role}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="/checkout" element={<Checkout />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="ADM" currentRole={role}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/caja" 
            element={
              <ProtectedRoute requiredRole="CAJERO" currentRole={role}>
                <Cashier />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} VivaAir (demo)
      </footer>
    </div>
  )
}
