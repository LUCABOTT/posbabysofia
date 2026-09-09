import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  Users,
  ShoppingCart,
  FileText,
  Package,
  Wallet,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  X
} from 'lucide-react'

import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { puedeAccederRuta, useAuth } from '../../auth/AuthContext'

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard
  },
  {
    name: 'Productos',
    path: '/productos',
    icon: ShoppingBag
  },
  {
    name: 'Categorías',
    path: '/categorias',
    icon: FolderOpen
  },
  {
    name: 'Clientes',
    path: '/clientes',
    icon: Users
  },
  {
    name: 'Ventas',
    path: '/ventas',
    icon: ShoppingCart
  },
  {
    name: 'Facturas',
    path: '/facturas',
    icon: FileText
  },
  {
    name: 'Inventario',
    path: '/inventario',
    icon: Package
  },
  {
    name: 'Caja',
    path: '/caja',
    icon: Wallet
  },
  {
    name: 'Reportes',
    path: '/reportes',
    icon: BarChart3
  },
  {
    name: 'Configuración',
    path: '/configuracion',
    icon: Settings
  },
  {
    name: 'Usuarios',
    path: '/usuarios',
    icon: UserCog
  }
]

function Sidebar({ abierto, cerrar }) {
  const navigate = useNavigate()
  const { usuario, cerrarSesion: limpiarSesion } = useAuth()

  const cerrarSesion = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      limpiarSesion()
      cerrar()
      navigate('/login', { replace: true })
    }
  }

  return (
    <>
      {abierto && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={cerrar}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-64 flex-col
          bg-white border-r border-gray-200
          transition-transform duration-300
          lg:translate-x-0
          print:hidden
          ${abierto ? 'translate-x-0' : '-translate-x-full'}
        `}
      >

        {/* LOGO */}

        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">

          <div>
            <h1 className="text-2xl font-bold text-baby-primary">
              Baby Sofia Boutique
            </h1>

            <p className="text-xs text-gray-500">
              Punto de Venta
            </p>
          </div>

          <button
            onClick={cerrar}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>

        </div>


        {/* MENU */}

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">

          {menuItems.filter((item) => puedeAccederRuta(usuario?.rol, item.path)).map((item) => {

            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={cerrar}
                className={({ isActive }) => `
                  flex items-center gap-3 rounded-xl px-4 py-3
                  text-sm font-medium transition
                  ${
                    isActive
                      ? 'bg-baby-primary text-white shadow-sm'
                      : 'text-gray-600 hover:bg-baby-secondary/40 hover:text-baby-primary'
                  }
                `}
              >

                <Icon size={20} />

                <span>
                  {item.name}
                </span>

              </NavLink>
            )

          })}

        </nav>


        {/* CONFIGURACIÓN */}

        <div className="border-t border-gray-100 p-4">

          <button
            onClick={cerrarSesion}
            className="
              mt-1 flex w-full items-center gap-3
              rounded-xl px-4 py-3
              text-sm font-medium text-gray-600
              hover:bg-red-50 hover:text-red-600
            "
          >

            <LogOut size={20} />

            <span>
              Cerrar sesión
            </span>

          </button>

        </div>

      </aside>
    </>
  )
}

export default Sidebar