const Router = require('express').Router();
const StopModel = require('../models/StopModel');
const TimeModel = require('../models/StopTimesModel');
const TripModel = require('../models/TripsModel');
const RouteModel = require('../models/RouteModel');
const { Op } = require('sequelize');

// ------------------------
// GET /api/stops?stopName=&region=
// ------------------------
Router.get('/stops', async (req, res) => {
    try {
        const stopName = req.query.stopName || '';
        const region = req.query.region || '';
        const whereObj = {};
        if (stopName) whereObj.stop_name = { [Op.like]: `%${stopName}%` };
        if (region) whereObj.stop_area = { [Op.like]: `%${region}%` };

        const stops = await StopModel.findAll({ where: whereObj });
        res.status(200).json(stops);
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Internal server error", error: e.toString() });
    }
});

// ------------------------
// GET /api/regions?region=
// ------------------------
Router.get('/regions', async (req, res) => {
    try {
        const regionName = req.query.region || '';
        const regions = await StopModel.findAll({
            where: regionName ? { stop_area: { [Op.like]: `%${regionName}%` } } : {},
            attributes: ['stop_area'],
            group: ['stop_area']
        });

        res.status(200).json(regions.map(r => r.stop_area));
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Internal server error", error: e.toString() });
    }
});

// ------------------------
// GET /api/buses?stopId=
// ------------------------
Router.get('/buses', async (req, res) => {
    try {
        const stopId = req.query.stopId;
        if (!stopId) return res.status(400).json({ error: "stopId is required" });

        const times = await TimeModel.findAll({
            where: { stop_id: stopId },
            include: {
                model: TripModel,
                include: RouteModel
            }
        });

        const uniqueBuses = [];
        times.forEach(time => {
            if (time.Trip && time.Trip.Route && !uniqueBuses.includes(time.Trip.Route.route_short_name)) {
                uniqueBuses.push(time.Trip.Route.route_short_name);
            }
        });

        res.status(200).json(uniqueBuses);
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Internal server error", error: e.toString() });
    }
});

// ------------------------
// GET /api/bus-times?stopId=&busName=
// ------------------------
Router.get('/bus-times', async (req, res) => {
    try {
        const stopId = req.query.stopId;
        const busName = req.query.busName;
        if (!stopId || !busName) return res.status(400).json({ error: "stopId and busName are required" });

        const times = await TimeModel.findAll({
            where: { stop_id: stopId },
            include: {
                model: TripModel,
                include: {
                    model: RouteModel,
                    where: { route_short_name: busName }
                }
            },
            order: [['arrival_time', 'ASC']]
        });

        const busTimes = times.map(time => ({
            arrival_time: time.arrival_time,
            departure_time: time.departure_time
        }));

        res.status(200).json(busTimes);
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Internal server error", error: e.toString() });
    }
});

module.exports = Router;
