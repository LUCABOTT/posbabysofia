import { Navigate, useLocation } from 'react-router-dom'
import { puedeAccederRuta, useAuth } from './AuthContext'

function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-baby-primary" />
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!puedeAccederRuta(usuario.rol, location.pathname)) {
    return <Navigate to="/ventas" replace />
  }

  return children
}

export default ProtectedRoute
