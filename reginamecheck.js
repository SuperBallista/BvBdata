const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;


// 닉네임 중복 여부 확인


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F4u@corsair',
    database: 'BvBdata'
});

app.use(express.static(__dirname));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/regi.html');
});

app.get('/checkNickname/:nickname', (req, res) => {
    const nickname = req.params.nickname;

    const sql = 'SELECT COUNT(*) AS count FROM member WHERE name = ?';
    db.query(sql, [nickname], (err, results) => {
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        const count = results[0].count;
        res.json({ exists: count > 0 });
    });
});

app.post('/process_registration', (req, res) => {
    // ... (회원가입 로직)
});


// 닉네임 중복 여부 확인 끝



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
