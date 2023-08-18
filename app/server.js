// 점수 로직에 활용되는 상수값

const logical = 100 //지수값
const penaltyday = 1 //패널티일
const penaltypercent = 0.01 //패널티감점비율
const losersubpoint = 0.05 //패배시 잃는 포인트 비율
const winpluspoint = 0.1 // 경기 승당 얻는 포인트 비율
const playbonus = 6 // 대전경기 등록시 얻는 기본 보너스점수
const thek = 60 //k값


// 계산 세팅값

const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const jwt = require('jsonwebtoken'); // JSON Web Token 라이브러리
let uncheckedid = [];

const secretKey = '23948239482349salkdjasjdlk'; // 토큰 서명에 사용할 비밀 키
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
        host: 'svc.sel3.cloudtype.app:30907',
        user: 'root',
        password: 'd2rbvbpk',
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
            res.status(200).json({ nickname: 'No One Use it' });
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
                console.error('Error connecting to MariaDB:', err);
                return;
            }

            console.log('Connected to MariaDB');

            const sql = 'INSERT INTO member (name, wgrade, pw) VALUES (?, ?, ?)';
            db.query(sql, [nname, weaponGradeValue, hash], (error, results) => {
                if (error) {
                    console.error('Error while saving to database:', error);
                } else {
                    let newbscore = 1000;
                    if (weaponGradeValue === 2) {
                        newbscore = 800;
                    }
                    const newranker = 'INSERT INTO ranking (name, tscore, bscore, win, lose) VALUES (?, 1000, ?, 0, 0)';
                    db.query(newranker, [nname, newbscore], (error, results) => {
                        db.end();

                        if (error) {
                            console.error('랭킹 목록에 추가 실패 에러', error);
                        } else {
                            console.log('Data saved to database');
                        }
                    });
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
    const sql = 'SELECT win, wscore, lose, lscore FROM record ORDER by rder DESC';
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
    const sql = 'SELECT name, tscore, bscore, win, lose FROM ranking';
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
    const sql = 'SELECT id, winning_score, loser, losing_score FROM unchecked WHERE winner = ?';
    const db = createConnection();

    db.query(sql, [clientNickname], (err, results) => {
        db.end();
        if (err) {
            console.error('데이터베이스 조회 에러:', err);
            return res.status(500).json({ message: '데이터베이스 조회 에러' });
        }

        const scores = results.map(row => ({
            id : row.id,
            winning_score: row.winning_score,
            loser: row.loser,
            losing_score: row.losing_score
        }));

        res.json({ scores: scores });
    });
}



// 미승인 게임 보내기 끝



// 대전 결과 등록하기 처리

app.post('/submitbr', verifyToken, (req, res) => {
    const { winname, winscore, myScore2 } = req.body;
    const username = req.user.username;

    // 사용자명으로 닉네임 조회
    const sql = 'SELECT name FROM member WHERE name = ?';
    const db = createConnection();

    db.query(sql, [username], (err, nicknameResults) => {
        if (err) {
            console.error('Error fetching nickname:', err);
            db.end();
            return res.status(500).json({ error: 'Error fetching nickname' });
        }

        if (nicknameResults.length > 0) {
            const nickname = nicknameResults[0].name;

            // unchecked 테이블에 데이터 삽입
            const currentDate = new Date().toISOString().slice(0, 10);
            const insertSql = 'INSERT INTO unchecked (id, date, winner, winning_score, loser, losing_Score) VALUES (?, ?, ?, ?, ?, ?)';
            
            db.query('SELECT COUNT(*) AS rowCount FROM unchecked', (error, results) => {
                if (error) {
                    console.error('Error getting row count:', error);
                    db.end();
                    return res.status(500).json({ message: 'Server error' });
                }

                const rowCount = results[0].rowCount;
                const id = rowCount + 1;

                if (winname == nickname) {
                    console.error('승자에 자기 계정을 넣을 수 없습니다', error);
                    db.end();
                    return res.status(500).json({ message: '승자에 자기 계정을 넣을 수 없습니다' });
                }

                db.query(
                    insertSql,
                    [id, currentDate, winname, winscore, nickname, myScore2],
                    (error, insertResults) => {
                        if (error) {
                            console.error('Error inserting data:', error);
                            db.end();
                            return res.status(500).json({ message: 'Server error' });
                        }
                        console.log('Data inserted successfully');
                        res.status(200).json({ message: 'Data inserted successfully' });
                        db.end();
                    }
                );
            });
        } else {
            db.end();
            return res.status(500).json({ error: 'Nickname not found' });
        }
    });
});

// 미승인 기록 삭제하기



app.post('/removerecord', (req, res) => {
    const removerecord = req.body.removerecord;
    const delquery = 'UPDATE unchecked SET winner = "delete-record" WHERE id = ?'; 
    const db = createConnection();
    db.query(delquery, [removerecord], (error) => {
        if (error) {
            console.error('Delete Fail', error);
            db.end();
            res.status(500).json({ message: 'Delete Fail' });
        } else {
            db.end();
            console.log('Delete Complete');
            res.json({ message: 'Delete Complete' });

        }
    });
});

// 미승인 기록 삭제하기 끝

// 미승인 기록 승인하기
app.post('/approvecord', (req, res) => {
    const approvecord = req.body.approvecord;
    const addquery = 'INSERT INTO record (rder, ate, win, wscore, lose, lscore) SELECT id, date, winner, winning_score, loser, losing_score FROM unchecked WHERE id = ?';
    const findplayerQuery = 'SELECT * FROM record WHERE rder = ?';
    const findplayerdata = 'SELECT * FROM ranking WHERE name = ?';
    const movedqury = 'UPDATE unchecked SET winner = "add-record" WHERE id = ?';

    
    console.log(approvecord);

    const db = createConnection();
    db.beginTransaction(err => {
        if (err) {
            console.error('Transaction Begin Error', err);
            db.end();
            res.status(500).json({ message: 'Transaction Begin Error' });
            return;
        }

        db.query(addquery, [approvecord], (error, result) => {
            if (error) {
                console.error('Add Fail', error);
                db.rollback();
                db.end();
                res.status(500).json({ message: 'Add Fail' });
                return;
            }

            db.query(movedqury, [approvecord], (moveError) => {
                if (moveError) {
                    console.error('Move Fail', moveError);
                    db.rollback();
                    db.end();
                    res.status(500).json({ message: 'Move Fail' });
                } else {
                    db.query(findplayerQuery, [approvecord], (err, results) => {
                        if (err) {
                            console.log("record find failed");
                        } else {
                            console.log(results[0].wscore);
                            const winName = results[0].win;
                            const loseName = results[0].lose;
                            const wingamescore = results[0].wscore;
                            const losegamescore = results[0].lscore;
                            
                            db.query(findplayerdata, [winName], (err, winResults) => {
                                if (err) {
                                    console.log("winner find failed");
                                } else {
                                    const winUserData = winResults[0];
                                    db.query(findplayerdata, [loseName], (err, loseResults) => {
                                        if (err) {
                                            console.log("loser find failed");
                                        } else {
                                             const loseUserData = loseResults[0];



const Kplus = thek*(1+winpluspoint*(wingamescore-losegamescore));
const WeWinner = 1/((10^((loseUserData.bscore-winUserData.bscore)/logical))+1);


                                            console.log('point',Kplus, WeWinner)

                                            winUserData.bscore = winUserData.bscore + Kplus*(1-WeWinner)+playbonus;
                                            winUserData.tscore = winUserData.tscore + Kplus*(1-WeWinner)+playbonus;

                                            loseUserData.bscore = loseUserData.bscore - Kplus*(1-WeWinner)*losersubpoint+playbonus;
                                            loseUserData.tscore = loseUserData.tscore - Kplus*(1-WeWinner)*losersubpoint+playbonus;

                                     winUserData.win = winUserData.win + 1;
                                     loseUserData.lose = loseUserData.lose + 1;
                                     console.log(winUserData.win);

                                     const updateWinUserQuery = 'UPDATE ranking SET bscore = ?, tscore = ?, win = ? WHERE name = ?';
                                     const updateLoseUserQuery = 'UPDATE ranking SET bscore = ?, tscore = ?, lose = ? WHERE name = ?';
                                     
db.query(updateWinUserQuery, [winUserData.bscore, winUserData.tscore, winUserData.win, winName], (err, Results) => {
    if (err) {
        console.log("Winner Score Update failed");
    } else {

                           
        db.query(updateLoseUserQuery, [loseUserData.bscore, loseUserData.tscore, loseUserData.lose, loseName], (err, Results) => {
            if (err) {
                console.log("Loser Score Update failed");
            } else {
        
                                     
                                            db.commit();
                                            db.end();
                                            console.log('Add, Move, User Data Retrieval, and Ranking Update Complete');
                                            res.json({ message: 'Add, Move, User Data Retrieval, and Ranking Update Complete' });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}
});
});
});
});

// 미승인 기록 승인하기 끝



// 서버 실행
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

