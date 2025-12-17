const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'd26893_busstops',
  process.env.DB_USER || 'd26893_busstops',
  process.env.DB_PASSWORD || '3w7PYquFJhver0!KdOfF',
  {
    host: process.env.DB_HOST || 'd26893.mysql.zonevs.eu',
    dialect: 'mysql',
    port: 3306,
    logging: false
  }
);

sequelize.authenticate()
  .then(() => console.log('Connection to database is successfull!'))
  .catch(err => console.error('Error of the connection: ', err));

module.exports = sequelize;
