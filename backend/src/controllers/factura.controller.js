const {
    Factura,
    Venta,
    Cliente,
    Usuario,
    DetalleVenta,
    Producto,
    Pago,
    ConfiguracionFiscal,
    user
} = require('../models');


// ==============================
// LISTAR FACTURAS
// ==============================

const listarFacturas = async (req, res) => {

    try {

        const facturas = await Factura.findAll({

            include: [

                {
                    association: 'venta',

                    include: [

                        {
                            association: 'cliente',
                            attributes: [
                                'id',
                                'nombre',
                                'email',
                                'rtn'
                            ]
                        },

                        {
                            association: 'detalles',

                            include: [
                                {
                                    association: 'producto',
                                    attributes: [
                                        'id',
                                        'codigo',
                                        'nombre',
                                        'precio_venta'
                                    ]
                                }
                            ]
                        },

                        {
                            association: 'pagos'
                        }
                    ]
                }

            ],

            order: [
                ['id', 'DESC']
            ]

        });


        return res.json({

            total: facturas.length,

            facturas

        });


    } catch (error) {

        console.error(
            'Error al listar facturas:',
            error
        );

        return res.status(500).json({
            message:
                'Error interno del servidor'
        });
    }
};


// ==============================
// OBTENER FACTURA
// ==============================

const obtenerFactura = async (req, res) => {

    try {

        const { id } = req.params;


        const factura = await Factura.findByPk(

            id,

            {

                include: [

                    {
                        association: 'configuracionFiscal'
                    },

                    {
                        association: 'venta',

                        include: [

                            {
                                association: 'usuario',

                                attributes: [
                                    'id',
                                    'nombre',
                                    'email'
                                ]
                            },

                            {
                                association: 'cliente',

                                attributes: [
                                    'id',
                                    'nombre',
                                    'email',
                                    'rtn'
                                ]
                            },

                            {
                                association: 'detalles',

                                include: [

                                    {
                                        association: 'producto',

                                        attributes: [
                                            'id',
                                            'codigo',
                                            'nombre',
                                            'precio_venta'
                                        ]
                                    }

                                ]
                            },

                            {
                                association: 'pagos'
                            }

                        ]

                    }

                ]

            }

        );


        if (!factura) {

            return res.status(404).json({

                message:
                    'Factura no encontrada'

            });

        }


        return res.json(factura);


    } catch (error) {

        console.error(
            'Error al obtener factura:',
            error
        );

        return res.status(500).json({

            message:
                'Error interno del servidor'

        });
    }
};


// ==============================
// BUSCAR POR NÚMERO DE FACTURA
// ==============================

const buscarFacturaPorNumero = async (req, res) => {

    try {

        const { numero } = req.params;


        const factura = await Factura.findOne({

            where: {
                numero_factura: numero
            },

            include: [

                {
                    association: 'configuracionFiscal'
                },

                {
                    association: 'venta',

                    include: [

                        {
                            association: 'cliente'
                        },

                        {
                            association: 'detalles',

                            include: [
                                {
                                    association: 'producto'
                                }
                            ]
                        },

                        {
                            association: 'pagos'
                        }

                    ]
                }

            ]

        });


        if (!factura) {

            return res.status(404).json({

                message:
                    'Factura no encontrada'

            });

        }


        return res.json(factura);


    } catch (error) {

        console.error(
            'Error al buscar factura:',
            error
        );

        return res.status(500).json({

            message:
                'Error interno del servidor'

        });

    }

};


// ==============================
// OBTENER FACTURA PARA IMPRESIÓN
// ==============================

const obtenerFacturaParaImpresion = async (req, res) => {

    try {

        const { id } = req.params;

        const factura = await Factura.findByPk(id, {

            include: [

                {
                    association: 'configuracionFiscal',
                    attributes: [
                        'razon_social',
                        'nombre_comercial',
                        'rtn',
                        'direccion',
                        'telefono',
                        'cai',
                        'fecha_limite_emision',
                        'prefijo_factura',
                        'rango_inicial',
                        'rango_final'
                    ]
                },

                {
                    association: 'venta',

                    attributes: [
                        'id',
                        'numero',
                        'subtotal',
                        'descuento',
                        'impuesto',
                        'total',
                        'estado',
                        'created_at'
                    ],

                    include: [

                        {
                            association: 'cliente',

                            attributes: [
                                'id',
                                'nombre',
                                'email',
                                'telefono',
                                'rtn'
                            ]
                        },

                        {
                            association: 'usuario',

                            attributes: [
                                'id',
                                'nombre'
                            ]
                        },

                        {
                            association: 'detalles',

                            attributes: [
                                'id',
                                'cantidad',
                                'precio_unitario',
                                'descuento',
                                'subtotal'
                            ],

                            include: [

                                {
                                    association: 'producto',

                                    attributes: [
                                        'id',
                                        'codigo',
                                        'nombre'
                                    ]
                                }

                            ]
                        },

                        {
                            association: 'pagos',

                            attributes: [
                                'id',
                                'metodo',
                                'monto',
                                'monto_recibido',
                                'referencia'
                            ]
                        }

                    ]
                }

            ]

        });


        if (!factura) {

            return res.status(404).json({
                message: 'Factura no encontrada'
            });

        }


        // ==============================
        // CALCULAR INFORMACIÓN DEL PAGO
        // ==============================

        const pago =
            factura.venta?.pagos?.[0] || null;

        const total =
            Number(factura.venta?.total || 0);

        const montoRecibido =
    Number(pago?.monto_recibido || 0);


        // El cambio solamente aplica para efectivo.
        const cambio =
    pago?.metodo === 'EFECTIVO'
        ? Math.max(0, montoRecibido - total)
        : 0;


        // ==============================
        // RESPUESTA PREPARADA PARA FRONTEND
        // ==============================

        return res.json({

            factura: {

                id: factura.id,

                numero_factura:
                    factura.numero_factura,

                numero_correlativo:
                    factura.numero_correlativo,

                cai:
                    factura.cai,

                rtn_emisor:
                    factura.rtn_emisor,

                fecha_emision:
                    factura.fecha_emision,

                fecha_limite_emision:
                    factura.configuracionFiscal
                        ?.fecha_limite_emision,

                estado:
                    factura.estado

            },


            emisor: {

                razon_social:
                    factura.configuracionFiscal
                        ?.razon_social,

                nombre_comercial:
                    factura.configuracionFiscal
                        ?.nombre_comercial,

                rtn:
                    factura.configuracionFiscal
                        ?.rtn,

                direccion:
                    factura.configuracionFiscal
                        ?.direccion,

                telefono:
                    factura.configuracionFiscal
                        ?.telefono

            },


            cliente:
                factura.venta?.cliente
                    ? {

                        id:
                            factura.venta.cliente.id,

                        nombre:
                            factura.venta.cliente.nombre,

                        email:
                            factura.venta.cliente.email,

                        telefono:
                            factura.venta.cliente.telefono,

                        rtn:
                            factura.venta.cliente.rtn

                    }
                    : null,


            venta: {

                id:
                    factura.venta.id,

                numero:
                    factura.venta.numero,

                fecha:
                    factura.venta.created_at,

                estado:
                    factura.venta.estado,

                productos:
                    factura.venta.detalles.map(
                        detalle => ({

                            codigo:
                                detalle.producto?.codigo,

                            nombre:
                                detalle.producto?.nombre,

                            cantidad:
                                detalle.cantidad,

                            precio_unitario:
                                detalle.precio_unitario,

                            descuento:
                                detalle.descuento,

                            subtotal:
                                detalle.subtotal

                        })
                    ),

                subtotal:
                    factura.venta.subtotal,

                descuento:
                    factura.venta.descuento,

                impuesto:
                    factura.venta.impuesto,

                total:
                    factura.venta.total

            },


            pago: pago
                ? {

                    metodo:
                        pago.metodo,

                    monto:
                        pago.monto,

                    monto_recibido: 
                        pago.monto_recibido,

                    referencia:
                        pago.referencia,

                    cambio

                }
                : null

        });


    } catch (error) {

        console.error(
            'Error al obtener factura para impresión:',
            error
        );

        return res.status(500).json({

            message:
                'Error interno del servidor'

        });

    }

};



module.exports = {

    listarFacturas,
    obtenerFactura,
    buscarFacturaPorNumero,
    obtenerFacturaParaImpresion

};