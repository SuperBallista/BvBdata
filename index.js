const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const db = mysql.createConnection({
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
