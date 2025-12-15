const StopModel = require('./StopModel');
const TimeModel = require('./StopTimesModel');
const TripModel = require('./TripsModel');
const RouteModel = require('./RouteModel');

// Связи
StopModel.hasMany(TimeModel, { foreignKey: 'stop_id' });
TimeModel.belongsTo(StopModel, { foreignKey: 'stop_id' });

TripModel.hasMany(TimeModel, { foreignKey: 'trip_id' });
TimeModel.belongsTo(TripModel, { foreignKey: 'trip_id' });

RouteModel.hasMany(TripModel, { foreignKey: 'route_id' });
TripModel.belongsTo(RouteModel, { foreignKey: 'route_id' });

module.exports = { StopModel, TimeModel, TripModel, RouteModel };
