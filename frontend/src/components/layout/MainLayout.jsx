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

      <div className="lg:pl-64">

        <Header
          abrirMenu={() => setMenuAbierto(true)}
        />

        <main className="p-4 sm:p-6 lg:p-8">

          <Outlet />

        </main>

      </div>

    </div>
  )
}

export default MainLayout