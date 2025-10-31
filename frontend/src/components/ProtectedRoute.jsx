import { Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children, requiredRole, currentRole }) {
  const location = useLocation()
  const [actualRole, setActualRole] = useState(currentRole)
  const [checking, setChecking] = useState(true)
  
  // Obtener rol del localStorage directamente para evitar problemas de sincronización
  useEffect(() => {
    // Verificar rol desde localStorage
    try {
      const rawSession = localStorage.getItem('vivaair.session')
      if (rawSession) {
        const session = JSON.parse(rawSession)
        const role = session?.user?.role
        if (role && role !== actualRole) {
          setActualRole(role)
        }
      }
    } catch (e) {
      console.error('Error parsing session in ProtectedRoute:', e)
    }
    setChecking(false)
  }, [currentRole, actualRole])
  
  // Si estamos verificando, mostrar loading
  if (checking) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Cargando...</p>
      </div>
    )
  }
  
  // Usar actualRole o currentRole
  const role = actualRole || currentRole
  
  // Si no hay rol, redirigir a login
  if (!role) {
    // Usar window.location para forzar recarga en móvil
    if (typeof window !== 'undefined') {
      window.location.replace('/login')
      return null
    }
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  
  // Si el rol no coincide, redirigir según el rol
  if (requiredRole && role !== requiredRole) {
    // Redirigir a la página apropiada según el rol usando window.location para móvil
    if (role === 'CAJERO') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/caja') {
        window.location.replace('/caja')
        return null
      }
      return <Navigate to="/caja" replace />
    } else if (role === 'ADM') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/admin') {
        window.location.replace('/admin')
        return null
      }
      return <Navigate to="/admin" replace />
    } else if (role === 'CLIENTE') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.replace('/')
        return null
      }
      return <Navigate to="/" replace />
    }
    // Si no coincide ningún rol, ir a login
    if (typeof window !== 'undefined') {
      window.location.replace('/login')
      return null
    }
    return <Navigate to="/login" replace />
  }
  
  return children
}


