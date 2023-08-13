function displayRankingData(url, tableId) {
  fetch(url)
    .then((response) => response.text())
    .then((data) => {
      const table = document.getElementById(tableId);
      const rows = data.trim().split("\n");

      rows.forEach((row) => {
        const cells = row.split("\t");
        const newRow = table.insertRow();

        cells.forEach((cell) => {
          newRow.insertCell().textContent = cell;
        });

        // 행에 클래스 추가
        newRow.classList.add("table-row");
      });
    })
    .catch((error) => {
      console.error("Error fetching ranking data:", error);
    });
}

// 'hall-rank.txt' 파일 데이터 표시
displayRankingData("hall-rank.txt", "rankingTable");

// 'hall-formal.txt' 파일 데이터 표시
displayRankingData("hall-formal.txt", "formalRankingTable");

// 'hall-thema.txt' 파일 데이터 표시
displayRankingData("hall-thema.txt", "themaRankingTable");
