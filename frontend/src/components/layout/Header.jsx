import {
  Menu,
  Bell,
  UserCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../../services/api'

function Header({ abrirMenu }) {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const response = await api.get('/auth/me')
        setUsuario(response.data.user)
      } catch {
        setUsuario(null)
      }
    }

    cargarUsuario()
  }, [])

  return (
    <header className="
      sticky top-0 z-30
      flex h-20 items-center justify-between
      border-b border-gray-200
      bg-white/95 backdrop-blur
      px-4 sm:px-6
    ">

      <button
        onClick={abrirMenu}
        className="
          rounded-xl p-2
          text-gray-600
          hover:bg-baby-secondary/40
          hover:text-baby-primary
          lg:hidden
        "
      >
        <Menu size={24} />
      </button>


      <div className="hidden lg:block">
        <p className="text-sm text-gray-500">
          Bienvenido al sistema
        </p>

        <h2 className="text-lg font-semibold text-baby-dark">
          Punto de Venta
        </h2>
      </div>


      <div className="ml-auto flex items-center gap-3">

        <button
          className="
            relative rounded-xl p-2.5
            text-gray-600
            hover:bg-baby-secondary/40
            hover:text-baby-primary
          "
        >

          <Bell size={21} />

          <span className="
            absolute right-1 top-1
            h-2 w-2 rounded-full
            bg-baby-primary
          " />

        </button>


        <div className="
          flex items-center gap-3
          border-l border-gray-200
          pl-3
        ">

          <UserCircle
            size={36}
            className="text-baby-primary"
          />

          <div className="hidden sm:block">

            <p className="text-sm font-semibold text-baby-dark">
              {usuario?.nombre || 'Usuario'}
            </p>

            <p className="text-xs text-gray-500">
              {usuario?.rol || 'Sin rol'}
            </p>

          </div>

        </div>

      </div>

    </header>
  )
}

export default Header