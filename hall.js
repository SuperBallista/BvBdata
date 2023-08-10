
      // 'hall-rank.txt' 파일에서 데이터 표시하는 부분
      fetch("hall-rank.txt")
        .then((response) => response.text())
        .then((data) => {
          const table = document.getElementById("rankingTable");
          const rows = data.trim().split("\n");

          rows.forEach((row) => {
            const cells = row.split("\t");
            const newRow = table.insertRow();

            cells.forEach((cell) => {
              newRow.insertCell().textContent = cell;
            });
          });
        })
        .catch((error) => {
          console.error("Error fetching ranking data:", error);
        });

      // 'hall-formal.txt' 파일에서 데이터 표시하는 부분
      fetch("hall-formal.txt")
        .then((response) => response.text())
        .then((data) => {
          const table = document.getElementById("formalRankingTable");
          const rows = data.trim().split("\n");

          rows.forEach((row) => {
            const cells = row.split("\t");
            const newRow = table.insertRow();

            cells.forEach((cell) => {
              newRow.insertCell().textContent = cell;
            });
          });
        })
        .catch((error) => {
          console.error("Error fetching formal ranking data:", error);
        });

      // 'hall-thema.txt' 파일에서 데이터 표시하는 부분
      fetch("hall-thema.txt")
        .then((response) => response.text())
        .then((data) => {
          const table = document.getElementById("themaRankingTable");
          const rows = data.trim().split("\n");

          rows.forEach((row) => {
            const cells = row.split("\t");
            const newRow = table.insertRow();

            cells.forEach((cell) => {
              newRow.insertCell().textContent = cell;
            });
          });
        })
        .catch((error) => {
          console.error("Error fetching thema ranking data:", error);
        });