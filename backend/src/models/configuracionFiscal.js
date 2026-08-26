module.exports = (sequelize, DataTypes) => {

    const ConfiguracionFiscal = sequelize.define(
        'ConfiguracionFiscal',
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },

            // ==============================
            // DATOS FISCALES
            // ==============================

            cai: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true
            },

            rtn: {
                type: DataTypes.STRING(20),
                allowNull: false
            },

            razon_social: {
                type: DataTypes.STRING(150),
                allowNull: false
            },

            nombre_comercial: {
                type: DataTypes.STRING(150),
                allowNull: true
            },

            direccion: {
                type: DataTypes.TEXT,
                allowNull: true
            },

            telefono: {
                type: DataTypes.STRING(30),
                allowNull: true
            },

            // ==============================
            // DATOS DEL RANGO AUTORIZADO
            // ==============================

            fecha_limite_emision: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },

            /*
             * Ejemplo:
             *
             * 000-001-01
             *
             * Este prefijo identifica el establecimiento,
             * punto de emisión y tipo de documento.
             */
            prefijo_factura: {
                type: DataTypes.STRING(20),
                allowNull: false
            },

            /*
             * Ejemplo:
             *
             * 61
             *
             * Se almacenan únicamente los correlativos.
             */
            rango_inicial: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            /*
             * Ejemplo:
             *
             * 100
             */
            rango_final: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            /*
             * Próximo correlativo que utilizará
             * el sistema para emitir una factura.
             *
             * Ejemplo:
             *
             * 61
             */
            siguiente_numero: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            // ==============================
            // ESTADO
            // ==============================

            activo: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true
            }
        },
        {
            tableName: 'configuraciones_fiscales',

            timestamps: true,

            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );


    // ==============================
    // RELACIÓN CON FACTURAS
    // ==============================

    ConfiguracionFiscal.associate = (models) => {

        ConfiguracionFiscal.hasMany(
            models.Factura,
            {
                foreignKey: 'configuracion_fiscal_id',
                as: 'facturas'
            }
        );

    };


    return ConfiguracionFiscal;
};