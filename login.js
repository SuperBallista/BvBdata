const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const port = 3000;

const app = express();

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F4u@corsair',
    database: 'BvBdata'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // 정적 파일 서비스 (이하 생략)

// 로그인 처리 라우트
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const sql = `SELECT * FROM member WHERE name = ?`;
    db.query(sql, [username], (err, results) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        if (results.length === 0) {
            return res.status(401).send('User not found');
        }

        const user = results[0];

        // 비밀번호 비교 (bcrypt.compare 메서드 사용)
        bcrypt.compare(password, user.pw, (bcryptErr, isMatch) => {
            if (bcryptErr) {
                return res.status(500).send('Internal Server Error');
            }

            if (isMatch) {
                res.redirect('/index.html');
            } else {
                res.status(401).send('Incorrect password');
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
