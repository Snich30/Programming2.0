const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Главная страница для добавления заявок
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});

// Страница для просмотра заявок (только для администратора)
app.get('/view-requests', (req, res) => {
    const { role } = req.query;
    if (role === 'admin') {
        res.sendFile(path.join(__dirname, 'view-requests.html'));
    } else {
        res.status(403).send('Доступ запрещен');
    }
});

// Страница входа
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Аутентификация пользователя
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.query('SELECT * FROM persons WHERE username = $1 AND password = $2', [username, password]);
        if (user.rows.length > 0) {
            res.json({ success: true, role: user.rows[0].role });
        } else {
            res.json({ success: false, message: 'Неверное имя пользователя или пароль' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Ошибка сервера");
    }
});

// Регистрация нового пользователя
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await db.query('SELECT * FROM persons WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            res.json({ success: false, message: 'Пользователь с таким именем уже существует' });
        } else {
            const newUser = await db.query('INSERT INTO persons (username, password, role) VALUES ($1, $2, $3) RETURNING *', [username, password, 'user']);
            res.json({ success: true, newUser: newUser.rows[0] });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Ошибка сервера");
    }
});

// Добавление новой заявки
app.post('/requests', async (req, res) => {
    const { date_added, car_type, car_model, problem_description, client_name, client_phone, status } = req.body;
    try {
        const newRequest = await db.query(
            'INSERT INTO request (date_added, car_type, car_model, problem_description, client_name, client_phone, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [date_added, car_type, car_model, problem_description, client_name, client_phone, status]
        );
        res.json(newRequest.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Ошибка сервера");
    }
});

// Получение всех заявок
app.get('/requests', async (req, res) => {
    try {
        const allRequests = await db.query('SELECT * FROM request');
        res.json(allRequests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Ошибка сервера");
    }
});

// Получение заявки по ID
app.get('/requests/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const request = await db.query('SELECT * FROM request WHERE id = $1', [id]);
        res.json(request.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Ошибка сервера");
    }
});

// Обновление заявки
app.put('/requests/:id', async (req, res) => {
    const { id } = req.params;
    const { date_added, car_type, car_model, problem_description, client_name, client_phone, status, mechanic_id } = req.body;
    try {
        const updatedRequest = await db.query(
            'UPDATE request SET date_added = $1, car_type = $2, car_model = $3, problem_description = $4, client_name = $5, client_phone = $6, status = $7, mechanic_id = $8 WHERE id = $9 RETURNING *',
            [date_added, car_type, car_model, problem_description, client_name, client_phone, status, mechanic_id, id]
        );
        res.json(updatedRequest.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Ошибка сервера");
    }
});

// Получение всех заявок или поиск заявок по номеру или параметрам
app.get('/requests', async (req, res) => {
    const { search } = req.query;
    try {
        let query = 'SELECT * FROM request';

        // Если есть поисковой запрос, добавляем условие поиска
        if (search) {
            query += ` WHERE 
                id = '${search}' OR 
                car_type ILIKE '%${search}%' OR 
                car_model ILIKE '%${search}%' OR 
                problem_description ILIKE '%${search}%' OR 
                client_name ILIKE '%${search}%' OR 
                client_phone ILIKE '%${search}%' OR 
                status ILIKE '%${search}%'`;
        }

        const requests = await db.query(query);
        res.json(requests.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Ошибка сервера");
    }
});



app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));



// INSERT INTO persons (username, password, role) VALUES ('admin', 'adminpassword', 'admin'); - добавление админа 
