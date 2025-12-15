const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const StopModel = sequelize.define('Stop', {
    stop_id: { type: DataTypes.STRING, primaryKey: true }, // varchar(64)
    stop_code: { type: DataTypes.STRING },
    stop_name: { type: DataTypes.STRING },
    stop_lat: { type: DataTypes.DOUBLE },
    stop_lon: { type: DataTypes.DOUBLE },
    zone_id: { type: DataTypes.STRING },
    alias: { type: DataTypes.STRING },
    stop_area: { type: DataTypes.STRING },
    stop_desc: { type: DataTypes.TEXT },
    lest_x: { type: DataTypes.DOUBLE },
    lest_y: { type: DataTypes.DOUBLE },
    zone_name: { type: DataTypes.STRING },
    authority: { type: DataTypes.STRING }
}, {
    tableName: 'yuliyanevar_stops',
    timestamps: false
});

module.exports = StopModel;
