const express = require('express');
const app = express();
const path = require('path');
const sequelize = require('./database'); // подключение к MySQL
const Router = require('./routes/api');

app.use(express.json());
app.use('/api', Router);

// Раздача фронтенда
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;

sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
