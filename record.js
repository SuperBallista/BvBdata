const express = require('express');
const mysql = require('mysql');
const app = express();
const rankport = 3000;

const db = mysql.createConnection({
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

app.listen(rankport, () => {
    console.log(`Server is running on port ${rankport}`);
});
