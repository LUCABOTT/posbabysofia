module.exports = (sequelize, DataTypes) => {

    const Factura = sequelize.define(
        'Factura',
        {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true
            },

            venta_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                unique: true
            },

            configuracion_fiscal_id: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            numero_factura: {
                type: DataTypes.STRING(30),
                allowNull: false,
                unique: true
            },

            numero_correlativo: {
                type: DataTypes.BIGINT,
                allowNull: false
            },

            cai: {
                type: DataTypes.STRING(50),
                allowNull: false
            },

            rtn_emisor: {
                type: DataTypes.STRING(20),
                allowNull: false
            },

            fecha_emision: {
                type: DataTypes.DATEONLY,
                allowNull: false
            },

            estado: {
                type: DataTypes.ENUM(
                    'EMITIDA',
                    'ANULADA'
                ),
                allowNull: false,
                defaultValue: 'EMITIDA'
            }
        },
        {
            tableName: 'facturas',
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );


    // ==============================
    // ASOCIACIONES
    // ==============================

    Factura.associate = (models) => {

        Factura.belongsTo(models.Venta, {
            foreignKey: 'venta_id',
            as: 'venta'
        });

        Factura.belongsTo(models.ConfiguracionFiscal, {
            foreignKey: 'configuracion_fiscal_id',
            as: 'configuracionFiscal'
        });

    };


    return Factura;
};