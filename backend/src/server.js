const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');

const authRoutes = require('./routes/auth.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const productoRoutes = require('./routes/producto.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const clienteRoutes = require('./routes/cliente.routes');
const ventaRoutes = require('./routes/venta.routes');
const cajaRoutes = require('./routes/caja.routes');
const movimientoCajaRoutes = require('./routes/movimientoCaja.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reporteRoutes = require('./routes/reporteRoutes');
const configuracionFiscalRoutes = require('./routes/configuracionFiscal.routes');

const app = express();

app.use(cors());
app.use(express.json());

// ==============================
// RUTAS
// ==============================

app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/cajas', cajaRoutes);
app.use('/api/movimientos-caja', movimientoCajaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/configuracion-fiscal', configuracionFiscalRoutes);

// ==============================
// HEALTH CHECK
// ==============================

app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();

        res.json({
            status: 'ok',
            message: 'POS Baby Sofia API funcionando',
            database: 'connected'
        });

    } catch (error) {

        console.error('Error de conexión:', error);

        res.status(500).json({
            status: 'error',
            message: 'Error de conexión con PostgreSQL'
        });
    }
});

// ==============================
// INICIAR SERVIDOR
// ==============================

const PORT = process.env.PORT || 3000;

const iniciarServidor = async () => {

    try {

        await sequelize.authenticate();

        console.log('Conexión con PostgreSQL establecida');

        await sequelize.sync();

        console.log('Modelos sincronizados correctamente');

        app.listen(PORT, () => {
            console.log(
                `Servidor ejecutándose en el puerto ${PORT}`
            );
        });

    } catch (error) {

        console.error(
            'Error al iniciar el servidor:',
            error
        );

        process.exit(1);
    }
};

iniciarServidor();