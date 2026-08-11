const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

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