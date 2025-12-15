const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const RouteModel = sequelize.define('Route', {
    route_id: { type: DataTypes.STRING, primaryKey: true }, // varchar(64)
    agency_id: { type: DataTypes.STRING },
    route_short_name: { type: DataTypes.STRING },
    route_long_name: { type: DataTypes.STRING },
    route_type: { type: DataTypes.INTEGER },
    competent_authority: { type: DataTypes.STRING },
    route_color: { type: DataTypes.STRING },
    route_desc: { type: DataTypes.TEXT }
}, {
    tableName: 'yuliyanevar_stops_routes',
    timestamps: false
});

module.exports = RouteModel;
