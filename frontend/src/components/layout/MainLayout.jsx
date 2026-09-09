import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import Sidebar from './Sidebar'
import Header from './Header'

function MainLayout() {

  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar
        abierto={menuAbierto}
        cerrar={() => setMenuAbierto(false)}
      />

      <div className="lg:pl-64 print:pl-0">

        <Header
          abrirMenu={() => setMenuAbierto(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8 print:p-0">

          <Outlet />

        </main>

        <div className="fixed bottom-4 right-4 z-40 rounded-full bg-green-600 px-3 py-2 text-[11px] font-semibold text-white shadow-lg ring-2 ring-white/80 print:hidden">
          Hecho por Luca Botteri
        </div>

      </div>

    </div>
  )
}

export default MainLayout