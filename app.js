const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');


const app = express();
const port = 3000;


// 회원 가입 처리

app.use(express.static(__dirname)); // 현재 디렉토리를 정적 파일 경로로 설정


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/regi.html');
});

app.post('/process_registration', (req, res) => {
    const nickname = req.body.nickname;
    const weaponGrade = req.body.weaponGrade;
    const password = req.body.password;


    const saltRounds = 12;

    bcrypt.hash(confirmPassword, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error while hashing password:', err);
            return;
        }

        const weaponGradeValue = weaponGrade === '고뇌' ? 1 : 2;

        const connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'F4u@corsair',
            database: 'BvBdata'
        });

        connection.connect((err) => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                return;
            }

            console.log('Connected to MySQL');

            const sql = 'INSERT INTO member (name, wgrade, pw) VALUES (?, ?, ?)';
            connection.query(sql, [nickname, weaponGradeValue, hash], (error, results) => {
                if (error) {
                    console.error('Error while saving to database:', error);
                } else {
                    console.log('Data saved to database');
                }
                connection.end();
            });
        });

        res.redirect('/index.html');

        ;
    });
});


// 회원 가입 처리 끝

// 로그인 처리


// 세션 설정
app.use(session({
    secret: 'your-secret-key', // 임의의 비밀 키
    resave: false,
    saveUninitialized: true
}));

let db = mysql.createConnection({
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
        if (err || results.length === 0) {
            res.redirect('/loginfail.html');
            return;
        }

        const user = results[0];

        // 비밀번호 비교 (bcrypt.compare 메서드 사용)
        bcrypt.compare(password, user.pw, (bcryptErr, isMatch) => {
            if (bcryptErr || !isMatch) {
                res.redirect('/loginfail.html');
                return;
            }

            // 세션에 닉네임 저장
            req.session.username = user.name;

            res.redirect('/index.html');
        });
    });
});

// 로그인 처리 끝


// 레코드 출력

db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F4u@corsair',
    database: 'BvBdata'
});

app.get('/getRecords', (req, res) => {
    const sql = 'SELECT win, wscore, lose, lscore FROM record';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        res.json(results);
    });
});
app.use(express.static(__dirname));

// 레코드 출력 끝





app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
