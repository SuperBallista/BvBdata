fetch("/getRankings")
  .then((response) => response.json())
  .then((rankings) => {

    const table_moblie = document.getElementById("rankingTable-portrait");
    const table = document.getElementById("rankingTable");

    // tscore를 기준으로 등급을 정렬한 배열 생성
    const sortedRankings = rankings.slice().sort((a, b) => b.tscore - a.tscore);

    rankings.forEach((rank, index) => {
      const row_mobile = table_moblie.insertRow();
      const radeMobileCell = row_mobile.insertCell(); // 등급 셀 추가
      radeMobileCell.textContent = calculateGrade(rank.tscore, sortedRankings.length, index + 1);
      row_mobile.insertCell().textContent = rank.name;
      row_mobile.insertCell().textContent = rank.tscore;
      row_mobile.classList.add("table-row");

      const row = table.insertRow();
      const radeCell = row.insertCell(); // 등급 셀 추가
      radeCell.textContent = calculateGrade(rank.tscore, sortedRankings.length, index + 1);
      row.insertCell().textContent = rank.name;
      row.insertCell().textContent = rank.tscore;
      row.insertCell().textContent = rank.bscore;
      row.insertCell().textContent = rank.win;
      row.insertCell().textContent = rank.lose;
      row.classList.add("table-row");
    });
  })
  .catch((error) => console.error("Error fetching rankings:", error));

// 등급 계산 함수
function calculateGrade(tscore, totalCount, tscoreRank) {
  const percentile25 = Math.floor(totalCount * 0.25);
  const percentile50 = Math.floor(totalCount * 0.5);
  const percentile75 = Math.floor(totalCount * 0.75);

  if (tscoreRank <= percentile25) {
    return 'S';
  } else if (tscoreRank <= percentile50) {
    return 'A';
  } else if (tscoreRank <= percentile75) {
    return 'B';
  } else {
    return 'C';
  }
}
