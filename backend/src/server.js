const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const productoRoutes = require('./routes/producto.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const clienteRoutes = require('./routes/cliente.routes');
const ventaRoutes = require('./routes/venta.routes');


const app = express();

app.use(cors());
app.use(express.json());

//rutas autenticacion

app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ventas', ventaRoutes);

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});