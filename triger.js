const mysql = require('mysql');

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'F4u@corsair',
  database: 'BvBdata'
});

// member 테이블에 새로운 행이 추가될 때 실행할 쿼리
const triggerQuery = `
CREATE TRIGGER add_ranking_after_insert
AFTER INSERT ON member
FOR EACH ROW
BEGIN
  DECLARE tscore FLOAT;
  DECLARE bscore FLOAT;
  
  -- 조건에 따라 tscore와 bscore 값을 설정
  IF NEW.wgrade = 1 THEN
    SET tscore = 1000;
    SET bscore = 1000;
  ELSEIF NEW.wgrade = 2 THEN
    SET tscore = 1000;
    SET bscore = 800;
  END IF;
  
  -- ranking 테이블에 행 추가
  INSERT INTO ranking (name, tscore, bscore, win, lose, rade)
  VALUES (NEW.name, tscore, bscore, 0, 0, 'N');
END;
`;

// 연결을 통해 쿼리 실행
connection.query(triggerQuery, (err, results) => {
  if (err) {
    console.error('Error creating trigger:', err);
  } else {
    console.log('Trigger created successfully');
  }

  // 연결 종료
  connection.end();
});
