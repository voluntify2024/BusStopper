// backend/app.js

const express = require('express');
const path = require('path');
const app = express();

// Подключаем роуты API
const apiRoutes = require('./routes/api'); // если твой файл называется иначе — поменяй путь

// Разрешаем JSON
app.use(express.json());

// Раздача фронтенда (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

// Роуты API
app.use('/api', apiRoutes);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

