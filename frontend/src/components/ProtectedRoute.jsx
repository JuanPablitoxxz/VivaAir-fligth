import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

export default function ProtectedRoute({ children, requiredRole, currentRole }) {
  const location = useLocation()
  
  // Si no hay rol, redirigir a login
  if (!currentRole) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  
  // Si el rol no coincide, redirigir según el rol
  if (requiredRole && currentRole !== requiredRole) {
    // Redirigir a la página apropiada según el rol
    if (currentRole === 'CAJERO') {
      return <Navigate to="/caja" replace />
    } else if (currentRole === 'ADM') {
      return <Navigate to="/admin" replace />
    } else if (currentRole === 'CLIENTE') {
      return <Navigate to="/" replace />
    }
    // Si no coincide ningún rol, ir a login
    return <Navigate to="/login" replace />
  }
  
  return children
}


