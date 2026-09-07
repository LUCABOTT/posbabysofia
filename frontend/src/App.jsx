import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, Store } from 'lucide-react'
import MainLayout from './components/layout/MainLayout'
import api from './services/api'

import Dashboard from './app/dashboard/Dashboard'
import Productos from './app/productos/Productos'
import Categorias from './app/categorias/Categorias'
import Clientes from './app/cliente/Clientes'
import Inventario from './app/inventario/Inventario'
import Caja from './app/caja/Caja'
import Reportes from './app/reportes/Reportes'
import Facturas from './app/facturas/Facturas'
import FacturaDetalle from './app/facturas/FacturaDetalle'
import Ventas from './app/ventas/Ventas'
import NuevaVenta from './app/ventas/NuevaVenta'
import VentaDetalle from './app/ventas/VentaDetalle'
import Configuracion from './app/configuracion/Configuracion'
import Usuarios from './app/usuarios/Usuarios'
import CumpleanosCorreo from './app/cumpleanos/CumpleanosCorreo'


function Placeholder({ titulo }) {
  return (
    <div>

      <h1 className="text-2xl font-bold text-baby-dark">
        {titulo}
      </h1>

      <p className="mt-2 text-gray-500">
        Módulo en construcción
      </p>

    </div>
  )
}

function Login() {
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState({ email: '', password: '' })
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const cambiarCampo = (event) => {
    setFormulario((actual) => ({ ...actual, [event.target.name]: event.target.value }))
  }

  const iniciarSesion = async (event) => {
    event.preventDefault()
    setCargando(true)
    setError('')
    try {
      await api.post('/auth/login', formulario)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'No se pudo iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff7f5] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden min-h-[620px] overflow-hidden bg-baby-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[38px] border-white/10" />
          <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border-[48px] border-baby-secondary/30" />
          <div className="relative"><div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Store size={25} /></div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-baby-secondary">Baby Sofia</p><h1 className="mt-5 max-w-sm text-5xl font-bold leading-tight">Tu tienda, siempre en orden.</h1><p className="mt-5 max-w-sm text-base leading-7 text-white/75">Controla productos, ventas y existencias desde un solo lugar.</p></div>
          <p className="relative text-sm text-white/60">Punto de Venta</p>
        </div>
        <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden"><p className="text-sm font-semibold uppercase tracking-wider text-baby-primary">Baby Sofia</p></div>
            <div><p className="text-sm font-semibold uppercase tracking-wider text-baby-primary">Bienvenido de nuevo</p><h2 className="mt-2 text-3xl font-bold text-baby-dark">Iniciar sesión</h2><p className="mt-2 text-sm text-gray-500">Accede a tu panel de punto de venta.</p></div>
            <form onSubmit={iniciarSesion} className="mt-8 space-y-5">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
              <label className="block text-sm font-medium text-gray-700">Correo electrónico<div className="mt-1.5 flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 focus-within:border-baby-primary"><Mail size={18} className="text-gray-400" /><input name="email" type="email" value={formulario.email} onChange={cambiarCampo} required autoComplete="email" placeholder="correo@ejemplo.com" className="w-full bg-transparent text-sm outline-none" /></div></label>
              <label className="block text-sm font-medium text-gray-700">Contraseña<div className="mt-1.5 flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 focus-within:border-baby-primary"><LockKeyhole size={18} className="text-gray-400" /><input name="password" type={mostrarPassword ? 'text' : 'password'} value={formulario.password} onChange={cambiarCampo} required autoComplete="current-password" placeholder="••••••••" className="w-full bg-transparent text-sm outline-none" /><button type="button" onClick={() => setMostrarPassword((actual) => !actual)} className="text-gray-400 hover:text-baby-primary" aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
              <button disabled={cargando} className="w-full rounded-xl bg-baby-primary px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">{cargando ? 'Ingresando...' : 'Entrar al sistema'}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        <Route element={<MainLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/productos"
            element={<Productos />}
          />

          <Route
            path="/clientes"
            element={<Clientes />}
          />

          <Route
            path="/categorias"
            element={<Categorias />}
          />

          <Route
            path="/ventas"
            element={<Ventas />}
          />

          <Route
            path="/ventas/nueva"
            element={<NuevaVenta />}
          />

          <Route
            path="/ventas/:id"
            element={<VentaDetalle />}
          />

          <Route
            path="/facturas"
            element={<Facturas />}
          />

          <Route
            path="/facturas/:id"
            element={<FacturaDetalle />}
          />

          <Route
            path="/inventario"
            element={<Inventario />}
          />

          <Route
            path="/caja"
            element={<Caja />}
          />

          <Route
            path="/reportes"
            element={<Reportes />}
          />

          <Route
            path="/configuracion"
            element={<Configuracion />}
          />

          <Route
            path="/usuarios"
            element={<Usuarios />}
          />

          <Route
            path="/cumpleanos/:id/correo"
            element={<CumpleanosCorreo />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App