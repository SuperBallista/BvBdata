const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken'); // JSON Web Token 라이브러리
const secretKey = 'your-secret-key'; // 토큰 서명에 사용할 비밀 키



const app = express();
const port = 3000;


// 닉네임 중복 여부 확인


let db = mysql.createConnection({
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

// 닉네임 중복 여부 확인 끝




// 회원 가입 처리

app.use(express.static(__dirname)); // 현재 디렉토리를 정적 파일 경로로 설정


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'regi.html');
});

app.post('/process_registration', (req, res) => {
    const nname = req.body.nickname;
    let weaponGrade = req.body.weaponGrade;
    let password = req.body.password;

    const saltRounds = 12;

    bcrypt.hash(password, saltRounds, (err, hash) => {
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
            connection.query(sql, [nname, weaponGradeValue, hash], (error, results) => {
                if (error) {
                    console.error('Error while saving to database:', error);
                } else {
                    console.log('Data saved to database');
                }
                connection.end();
            });
        });

       let registrationMessage = '캐릭터 등록에 성공했습니다';
       res.redirect(`/index.html?message=${encodeURIComponent(registrationMessage)}`);
    });
});


// 회원 가입 처리 끝





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



// 랭킹 출력


db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F4u@corsair',
    database: 'BvBdata'
});

app.use(express.static(__dirname));

app.get('/getRankings', (req, res) => {
    const sql = 'SELECT rade, name, tscore, bscore, win, lose FROM ranking ORDER BY tscore DESC';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Internal Server Error');
            return;
        }

        res.json(results);
    });
});

// 랭킹 출력 끝





// 로그인 절차

app.use(session({
    secret: secretKey, // 비밀 키
    resave: false,
    saveUninitialized: true
}));

db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F4u@corsair',
    database: 'BvBdata'
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // 정적 파일 서비스 (이하 생략)

// 로그인 처리 라우트
app.post('/login_process', (req, res) => {
    let username = req.body.username;
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

            // 사용자명과 같은 정보를 토큰에 포함시켜 발급
            const tokenPayload = {
                username: user.name
            };

            const accessToken = jwt.sign(tokenPayload, secretKey, { expiresIn: '1h' });

            // JSON 응답으로 토큰 전송
            res.json({ accessToken });


        });
    });
});



// 로그인 절차 끝




// 닉네임 클라이언트로 보내기


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

// 데이터베이스 연결 설정
db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F4u@corsair',
    database: 'BvBdata'
});

app.get('/get_nickname', verifyToken, (req, res) => {
    const username = req.user.username;

    const sql = 'SELECT name FROM member WHERE name = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error fetching nickname:', err);
            return res.status(500).json({ error: 'Error fetching nickname' });
        }

        if (results.length > 0) {
            const nickname = results[0].name; // name 열을 닉네임으로 사용
            res.json({ nickname });
        } else {
            res.json({ nickname: null }); // 사용자명에 해당하는 닉네임 없음
        }
    });
});

// 닉네임 클라이언트로 보내기 절차 끝


// 승자 목록 보내기


// 데이터베이스 연결 설정
 db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F4u@corsair',
    database: 'BvBdata'
});

// 승자 목록 가져오는 엔드포인트
app.get('/get_winners', (req, res) => {
    const sql = 'SELECT name FROM member';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching winners:', err);
            return res.status(500).json({ error: 'Error fetching winners' });
        }

        const winners = results.map(row => row.name);
        res.json({ winners });
        
    });
});

// 승자 목록 보내기 끝



// 미승인 게임 보내기



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

// 데이터베이스 연결 설정
db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'F4u@corsair',
    database: 'BvBdata'
});


app.post('/get_scores', verifyToken, (req, res) => {
    const clientNickname = req.user.username;
    console.log(clientNickname); // 변환된 데이터를 로그로 출력

    const sql = 'SELECT winning_score, loser, losing_score FROM unchecked WHERE winner = ?';

    db.query(sql, [clientNickname], (err, results) => {
        if (err) {
            console.error('데이터베이스 조회 에러:', err);
            return res.status(500).json({ message: '데이터베이스 조회 에러' });
        }

        console.log('Results from database:', results); // 결과를 로그로 출력

        const scores = results.map(row => ({
            winning_score: row.winning_score,
            loser: row.loser,
            losing_score: row.losing_score
        }));

        console.log('Mapped scores:', scores); // 변환된 데이터를 로그로 출력

        // 조회 결과를 클라이언트에 전송
        res.json({ scores: scores });
    });
});





// 미승인 게임 보내기 끝







app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



