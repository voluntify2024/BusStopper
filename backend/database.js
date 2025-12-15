const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('d26893_busstops', 'd26893_busstops', '3w7PYquFJhver0!KdOfF', {
    host: 'd26893.mysql.zonevs.eu',
    dialect: 'mysql',
    port: 3306,
    logging: false // отключает лишние логи
});

sequelize.authenticate()
    .then(() => console.log('Connection to database is successfull!'))
    .catch(err => console.error('Error of the connection: ', err));

module.exports = sequelize;
