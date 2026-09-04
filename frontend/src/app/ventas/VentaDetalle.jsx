import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Receipt, UserRound } from 'lucide-react'
import { obtenerVenta } from '../../services/ventaService'

const moneda = (valor) => new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2,
}).format(Number(valor || 0))

const fechaHora = (valor) => {
    if (!valor) return '-'
    const fecha = new Date(valor)
    return Number.isNaN(fecha.getTime())
        ? '-'
        : new Intl.DateTimeFormat('es-HN', {
            dateStyle: 'short',
            timeStyle: 'short',
        }).format(fecha)
}

export default function VentaDetalle() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [venta, setVenta] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const cargar = async () => {
            try {
                setCargando(true)
                setError('')
                setVenta(await obtenerVenta(id))
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'No se pudo cargar la venta')
            } finally {
                setCargando(false)
            }
        }

        cargar()
    }, [id])

    if (cargando) {
        return <div className="flex min-h-[500px] items-center justify-center text-sm text-gray-500">Cargando venta...</div>
    }

    if (error || !venta) {
        return <div className="p-6"><p className="text-sm text-red-600">{error || 'Venta no encontrada'}</p></div>
    }

    const pago = venta.pagos?.[0]

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mb-6 flex items-center gap-3">
                <button type="button" onClick={() => navigate('/ventas')} className="rounded-lg border border-gray-200 bg-white p-2.5 text-gray-500 hover:text-baby-primary" title="Volver a ventas">
                    <ArrowLeft size={19} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-baby-dark">Detalle de venta</h1>
                    <p className="mt-1 text-sm text-gray-500">{venta.numero}</p>
                </div>
            </div>

            <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-xs text-gray-500">Fecha y hora</p><p className="mt-2 flex items-center gap-2 font-semibold text-gray-700"><CalendarDays size={16} />{fechaHora(venta.created_at)}</p></div>
                    <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-xs text-gray-500">Cliente</p><p className="mt-2 flex items-center gap-2 font-semibold text-gray-700"><UserRound size={16} />{venta.cliente?.nombre || 'Consumidor final'}</p></div>
                    <div className="rounded-xl bg-white p-5 shadow-sm"><p className="text-xs text-gray-500">Estado</p><p className="mt-2 font-semibold text-gray-700">{venta.estado}</p></div>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-5"><h2 className="font-semibold text-baby-dark">Productos vendidos</h2></div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[650px]">
                            <thead className="bg-gray-50"><tr><th className="px-5 py-3 text-left text-xs uppercase text-gray-500">Producto</th><th className="px-5 py-3 text-center text-xs uppercase text-gray-500">Cantidad</th><th className="px-5 py-3 text-right text-xs uppercase text-gray-500">Precio aplicado</th><th className="px-5 py-3 text-right text-xs uppercase text-gray-500">Descuento</th><th className="px-5 py-3 text-right text-xs uppercase text-gray-500">Subtotal</th></tr></thead>
                            <tbody className="divide-y divide-gray-100">{(venta.detalles || []).map((detalle) => <tr key={detalle.id}><td className="px-5 py-4 text-sm font-medium text-gray-700">{detalle.producto?.nombre || '-'}<span className="ml-2 text-xs text-gray-400">{detalle.producto?.codigo || ''}</span></td><td className="px-5 py-4 text-center text-sm text-gray-600">{detalle.cantidad}</td><td className="px-5 py-4 text-right text-sm text-gray-600">{moneda(detalle.precio_unitario)}</td><td className="px-5 py-4 text-right text-sm text-red-500">{moneda(detalle.descuento)}</td><td className="px-5 py-4 text-right text-sm font-semibold text-gray-700">{moneda(detalle.subtotal)}</td></tr>)}</tbody>
                        </table>
                    </div>
                </div>

                <div className="ml-auto max-w-sm rounded-xl bg-white p-5 shadow-sm">
                    <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>{moneda(venta.subtotal)}</span></div>
                    <div className="mt-3 flex justify-between text-sm text-gray-500"><span>Descuento</span><span className="text-red-500">- {moneda(venta.descuento)}</span></div>
                    <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-lg font-bold text-baby-dark"><span>Total</span><span className="text-baby-primary">{moneda(venta.total)}</span></div>
                    {pago && <p className="mt-3 text-xs text-gray-500">Pago: {pago.metodo} por {moneda(pago.monto)}</p>}
                </div>

                {venta.factura?.id && <button type="button" onClick={() => navigate(`/facturas/${venta.factura.id}`)} className="inline-flex items-center gap-2 rounded-lg bg-baby-primary px-4 py-2.5 text-sm font-medium text-white"><Receipt size={17} /> Ver factura</button>}
            </div>
        </div>
    )
}
