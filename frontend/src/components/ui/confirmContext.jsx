import { createContext, useCallback, useContext, useState } from 'react'
import { ConfirmModal } from './ConfirmModal'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [solicitud, setSolicitud] = useState(null)
  const [resolverActual, setResolverActual] = useState(null)

  const confirmar = useCallback((opciones) => new Promise((resolve) => {
    setSolicitud(opciones)
    setResolverActual(() => resolve)
  }), [])

  const resolver = useCallback((resultado) => {
    resolverActual?.(resultado)
    setSolicitud(null)
    setResolverActual(null)
  }, [resolverActual])

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      <ConfirmModal solicitud={solicitud} resolver={resolver} />
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const confirmar = useContext(ConfirmContext)

  if (!confirmar) {
    throw new Error('useConfirm debe usarse dentro de ConfirmProvider')
  }

  return confirmar
}
