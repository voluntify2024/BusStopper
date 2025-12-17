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
            where: regionName
                ? { stop_area: { [Op.like]: `%${regionName}%` } }
                : {},
            attributes: [
                [require('sequelize').fn('DISTINCT',
                 require('sequelize').col('stop_area')), 'stop_area']
            ],
            raw: true
        });

        res.status(200).json(regions.map(r => r.stop_area));
    } catch (e) {
        console.error('Error in /regions:', e);
        res.status(500).json({ msg: "Internal server error", error: e.toString() });
    }
});

// ------------------------
// GET /api/buses?stopId=
// ------------------------
Router.get('/buses', async (req, res) => {
    try {
        const stopId = req.query.stopId;
        if (!stopId) {
            return res.status(400).json({ error: "stopId is required" });
        }

        const times = await TimeModel.findAll({
            where: { stop_id: stopId },
            include: {
                model: TripModel,
                include: RouteModel
            }
        });

        const uniqueBuses = [];
        times.forEach(time => {
            if (
                time.Trip &&
                time.Trip.Route &&
                !uniqueBuses.includes(time.Trip.Route.route_short_name)
            ) {
                uniqueBuses.push(time.Trip.Route.route_short_name);
            }
        });

        // СОРТИРОВКА ПО ЗАДАНИЮ
        const sortedBuses = uniqueBuses.sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true })
        );

        res.status(200).json(sortedBuses);
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

        // Текущее время
        const now = new Date();
        const hh = now.getHours().toString().padStart(2, '0');
        const mm = now.getMinutes().toString().padStart(2, '0');
        const ss = now.getSeconds().toString().padStart(2, '0');
        const currentTime = `${hh}:${mm}:${ss}`;

        const times = await TimeModel.findAll({
            where: {
                stop_id: stopId,
                arrival_time: { [Op.gte]: currentTime }
            },
            include: [{
                model: TripModel,
                required: true,
                include: [{
                    model: RouteModel,
                    where: { route_short_name: busName },
                    required: true
                }]
            }],
            order: [['arrival_time', 'ASC']],
            limit: 20 // можно больше, чтобы выбрать уникальные
        });

        // Формируем массив уникальных arrival_time + headsign
        const seen = new Set();
        const busTimes = [];

        times.forEach(time => {
            const headsign = time.Trip.trip_headsign;
            const key = `${time.arrival_time}|${headsign}`;
            if (!seen.has(key)) {
                seen.add(key);
                busTimes.push({
                    arrival_time: time.arrival_time,
                    headsign
                });
            }
        });

        // Ограничиваем до 5 ближайших после удаления дубликатов
        res.status(200).json(busTimes.slice(0, 5));

    } catch (e) {
        console.error("Error in /bus-times:", e, e.stack);
        res.status(500).json({ msg: "Internal server error", error: e.toString() });
    }
});



// ------------------------
// POST /api/nearest-stop
// ------------------------
Router.post('/nearest-stop', async (req, res) => {
    try {
        const { lat, lon } = req.body;

        if (!lat || !lon) {
            return res.status(400).json({ error: "lat and lon are required" });
        }

        const stops = await StopModel.findAll();

        let nearest = null;
        let minDist = Infinity;

        stops.forEach(stop => {
            const d = Math.sqrt(
                Math.pow(stop.stop_lat - lat, 2) +
                Math.pow(stop.stop_lon - lon, 2)
            );

            if (d < minDist) {
                minDist = d;
                nearest = stop;
            }
        });

        res.status(200).json(nearest);
    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: "Internal server error", error: e.toString() });
    }
});

module.exports = Router;
