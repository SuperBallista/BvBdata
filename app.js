const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken'); // JSON Web Token 라이브러리

const secretKey = 'your-secret-key'; // 토큰 서명에 사용할 비밀 키
const app = express();
const port = 3000;


// verifyToken 함수 정의
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
}


// DB 연결 관리 함수
function createConnection() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'F4u@corsair',
        database: 'BvBdata'
    });
}

// 미들웨어
app.use(express.static(__dirname));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));




// 닉네임 중복 여부 확인
app.get('/checkNickname/:nickname', (req, res) => {
    const nickname = req.params.nickname;
    const db = createConnection();

    const sql = 'SELECT COUNT(*) AS count FROM member WHERE name = ?';
    db.query(sql, [nickname], (err, results) => {
        db.end();
        if (err) {
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        const count = results[0].count;
        res.json({ exists: count > 0 });
    });
});

// 회원 가입 처리
app.post('/process_registration', (req, res) => {
    const nname = req.body.nickname;
    const weaponGrade = req.body.weaponGrade;
    const password = req.body.password;

    const saltRounds = 12;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error('Error while hashing password:', err);
            return;
        }

        const weaponGradeValue = weaponGrade === '고뇌' ? 1 : 2;
        const db = createConnection();

        db.connect((err) => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                return;
            }

            console.log('Connected to MySQL');

            const sql = 'INSERT INTO member (name, wgrade, pw) VALUES (?, ?, ?)';
            db.query(sql, [nname, weaponGradeValue, hash], (error, results) => {
                db.end();
                if (error) {
                    console.error('Error while saving to database:', error);
                } else {
                    console.log('Data saved to database');
                }
            });
        });

        const registrationMessage = '캐릭터 등록에 성공했습니다';
        res.redirect(`/index.html?message=${encodeURIComponent(registrationMessage)}`);
    });
});

// 레코드 및 랭킹 출력
app.get('/getRecords', getRecords);
app.get('/getRankings', getRankings);

function getRecords(req, res) {
    const sql = 'SELECT win, wscore, lose, lscore FROM record';
    const db = createConnection();

    db.query(sql, (err, results) => {
        db.end();
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        res.json(results);
    });
}

function getRankings(req, res) {
    const sql = 'SELECT rade, name, tscore, bscore, win, lose FROM ranking ORDER BY tscore DESC';
    const db = createConnection();

    db.query(sql, (err, results) => {
        db.end();
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        res.json(results);
    });
}

// 로그인 절차
app.use(session({
    secret: secretKey, // 비밀 키
    resave: false,
    saveUninitialized: true
}));
app.post('/login_process', loginProcess);

function loginProcess(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    const sql = `SELECT * FROM member WHERE name = ?`;
    const db = createConnection();

    db.query(sql, [username], (err, results) => {
        db.end();
        if (err || results.length === 0) {
            res.redirect('/loginfail.html');
            return;
        }

        const user = results[0];

        bcrypt.compare(password, user.pw, (bcryptErr, isMatch) => {
            if (bcryptErr || !isMatch) {
                res.redirect('/loginfail.html');
                return;
            }

            const tokenPayload = {
                username: user.name
            };

            const accessToken = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

            res.json({ accessToken });
        });
    });
}

// 닉네임 클라이언트로 보내기
app.get('/get_nickname', verifyToken, getNickname);

function getNickname(req, res) {
    const username = req.user.username;
    const sql = 'SELECT name FROM member WHERE name = ?';
    const db = createConnection();

    db.query(sql, [username], (err, results) => {
        db.end();
        if (err) {
            console.error('Error fetching nickname:', err);
            return res.status(500).json({ error: 'Error fetching nickname' });
        }

        if (results.length > 0) {
            const nickname = results[0].name;
            res.json({ nickname });
        } else {
            res.json({ nickname: null });
        }
    });
}

// 승자 목록 보내기
app.get('/get_winners', getWinners);

function getWinners(req, res) {
    const sql = 'SELECT name FROM member';
    const db = createConnection();

    db.query(sql, (err, results) => {
        db.end();
        if (err) {
            console.error('Error fetching winners:', err);
            return res.status(500).json({ error: 'Error fetching winners' });
        }

        const winners = results.map(row => row.name);
        res.json({ winners });
    });
}

// 미승인 게임 보내기
app.post('/get_scores', verifyToken, getScores);

function getScores(req, res) {
    const clientNickname = req.user.username;
    const sql = 'SELECT winning_score, loser, losing_score FROM unchecked WHERE winner = ?';
    const db = createConnection();

    db.query(sql, [clientNickname], (err, results) => {
        db.end();
        if (err) {
            console.error('데이터베이스 조회 에러:', err);
            return res.status(500).json({ message: '데이터베이스 조회 에러' });
        }

        const scores = results.map(row => ({
            winning_score: row.winning_score,
            loser: row.loser,
            losing_score: row.losing_score
        }));

        res.json({ scores: scores });
    });
}


// 대전 경기 받아서 서버에 임시 저장하기

createConnection();

app.use(bodyParser.json());

app.post('/submitbr', verifyToken, (req, res) => {
    const { winner, winnerScore, myScore } = req.body;
    const username = req.user.username;

    const db = createConnection();
    console.log("ok1");

    // unchecked 테이블에 행의 갯수 조회
    db.query('SELECT COUNT(*) AS rowCount FROM unchecked', (error, results) => {
        if (error) {
            console.error('Error getting row count:', error);
            db.end();
            return res.status(500).json({ message: 'Server error' });
        }

        const rowCount = results[0].rowCount;
        const id = rowCount + 1;
        const currentDate = new Date().toISOString().slice(0, 10);
console.log("ok2");
        // 사용자명으로 닉네임 조회
        const sql = 'SELECT name FROM member WHERE name = ?';
        db.query(sql, [username], (err, nicknameResults) => {
            if (err) {
                console.error('Error fetching nickname:', err);
                db.end();
                return res.status(500).json({ error: 'Error fetching nickname' });
            }
            console.log("ok3");
            if (nicknameResults.length > 0) {
                const nickname = nicknameResults[0].name;

                // unchecked 테이블에 데이터 삽입
                db.query(
                    'INSERT INTO unchecked (id, order_number, date, winner, winning_score, loser, losing_score) VALUES (?, 1, ?, ?, ?, ?, ?)',
                    [id, currentDate, winner, winnerScore, nickname, myScore],
                    (error, insertResults) => {
                        if (error) {
                            console.error('Error inserting data:', error);
                            db.end();
                            return res.status(500).json({ message: 'Server error' });
                        }
                        console.log('Data inserted successfully');
                        db.end();
                        res.status(200).json({ message: 'Data inserted successfully' });
                    }
                );
            } else {
                db.end();
                return res.status(500).json({ error: 'Nickname not found' });
            }
        });
    });
});


// 서버 실행
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


