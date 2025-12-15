const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const RouteModel = require('./RouteModel');

const TripsModel = sequelize.define('Trip', {
    trip_id: { type: DataTypes.STRING, primaryKey: true }, // STRING
    route_id: { type: DataTypes.STRING },
    service_id: { type: DataTypes.STRING },
    trip_headsign: { type: DataTypes.STRING },
    trip_long_name: { type: DataTypes.STRING },
    direction_code: { type: DataTypes.STRING },
    shape_id: { type: DataTypes.STRING },
    wheelchair_accessible: { type: DataTypes.TINYINT }
}, {
    tableName: 'yuliyanevar_trips',
    timestamps: false
});

// Связь с маршрутами
TripsModel.belongsTo(RouteModel, { foreignKey: 'route_id' });

module.exports = TripsModel;
