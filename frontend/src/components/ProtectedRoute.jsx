import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, requiredRole, currentRole }) {
  if (!currentRole) {
    return <Navigate to="/login" replace />
  }
  
  if (requiredRole && currentRole !== requiredRole) {
    return <Navigate to="/" replace />
  }
  
  return children
}


