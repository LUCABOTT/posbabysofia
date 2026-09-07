const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { sequelize, Sequelize } = require('./models');

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
const facturaRoutes = require('./routes/factura.routes');
const iniciarCumpleanosJob = require('./jobs/cumpleanos.job');
const cumpleanosRoutes = require('./routes/cumpleanos.routes');


const app = express();
const frontendOrigin = process.env.FRONTEND_URL && process.env.FRONTEND_URL !== '*'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173';

app.use(cors({
    origin: frontendOrigin,
    credentials: true
}));
app.use(express.json());

// ==============================
// RUTAS
// ==============================

app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/api/inventario', inventarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/cajas', cajaRoutes);
app.use('/api/movimientos-caja', movimientoCajaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/configuracion-fiscal', configuracionFiscalRoutes);
app.use('/api/facturas', facturaRoutes);
app.use('/api/cumpleanos', cumpleanosRoutes);
iniciarCumpleanosJob();

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

const sincronizarEsquemaMinimo = async () => {
    const queryInterface = sequelize.getQueryInterface();
    const clientes = await queryInterface.describeTable('clientes');
    const pagos = await queryInterface.describeTable('pagos');

    if (!clientes.rtn) {
        await queryInterface.addColumn('clientes', 'rtn', {
            type: Sequelize.STRING(20),
            allowNull: true
        });
    }

    if (!pagos.monto_recibido) {
        await queryInterface.addColumn('pagos', 'monto_recibido', {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        });
    }

    if (!pagos.cambio) {
        await queryInterface.addColumn('pagos', 'cambio', {
            type: Sequelize.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0
        });
    }
};

const iniciarServidor = async () => {

    try {

        await sequelize.authenticate();

        console.log('Conexión con PostgreSQL establecida');

        await sincronizarEsquemaMinimo();

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
